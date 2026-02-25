/**
 * portal.js — Lógica de las páginas del portal de clientes.
 * Depende de auth.js (DDAuth debe estar disponible).
 */

(function () {
  'use strict';

  // ── Etiquetas legibles para tipos de evento ───────────────────────────────

  var TIPO_LABELS = {
    compra:        'Compra',
    venta:         'Venta a la tienda',
    digitalizacion:'Digitalización',
    orden_trabajo: 'Orden de trabajo',
    presupuesto:   'Presupuesto',
    pago:          'Pago',
    consulta:      'Consulta',
  };

  var TIPO_BADGE_CLASS = {
    compra:        'badge-compra',
    venta:         'badge-venta',
    digitalizacion:'badge-digitalizacion',
    orden_trabajo: 'badge-orden',
    presupuesto:   'badge-presupuesto',
    pago:          'badge-pago',
    consulta:      'badge-consulta',
  };

  // ── Perfil (mi-cuenta.html) ────────────────────────────────────────────────

  function initMiCuenta() {
    DDAuth.requireAuth();

    var form        = document.getElementById('form-perfil');
    var fotoInput   = document.getElementById('foto-input');
    var fotoPreview = document.getElementById('foto-preview');
    var fotoBtn     = document.getElementById('foto-btn');
    var msgEl       = document.getElementById('perfil-msg');

    loadProfile();

    // Botón para abrir selector de imagen
    if (fotoBtn) {
      fotoBtn.addEventListener('click', function () {
        fotoInput && fotoInput.click();
      });
    }

    // Al seleccionar foto → abrir modal de recorte
    if (fotoInput) {
      fotoInput.addEventListener('change', function () {
        var file = fotoInput.files[0];
        if (!file) return;
        openCropModal(file);
      });
    }

    // Guardar cambios de perfil
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveProfile();
      });
    }
  }

  function loadProfile() {
    DDAuth.authFetch('/climan/me/')
      .then(function (res) {
        if (res.status === 401) { DDAuth.logout(); return null; }
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        setField('perfil-numero',  data.numero_cliente);
        setField('perfil-nombre',  data.nombre + ' ' + data.apellido);
        setInputVal('campo-dni',      data.dni);
        setInputVal('campo-email',    data.email);
        setInputVal('campo-whatsapp', data.whatsapp);
        setInputVal('campo-telefono', data.telefono_fijo);
        setInputVal('campo-direccion',data.direccion);

        var fotoPreview = document.getElementById('foto-preview');
        if (fotoPreview && data.foto_perfil) {
          fotoPreview.src = data.foto_perfil;
        }
      })
      .catch(function (err) {
        console.error('Error cargando perfil:', err);
      });
  }

  function saveProfile() {
    var payload = {};
    var dni      = getInputVal('campo-dni');
    var email    = getInputVal('campo-email');
    var whatsapp = getInputVal('campo-whatsapp');
    var telefono = getInputVal('campo-telefono');
    var direccion= getInputVal('campo-direccion');
    if (dni      !== null) payload.dni            = dni;
    if (email    !== null) payload.email         = email;
    if (whatsapp !== null) payload.whatsapp      = whatsapp;
    if (telefono !== null) payload.telefono_fijo = telefono;
    if (direccion!== null) payload.direccion     = direccion;

    DDAuth.authFetch('/climan/me/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        showMsg('perfil-msg', 'Datos actualizados correctamente.', 'success');
      })
      .catch(function () {
        showMsg('perfil-msg', 'Error al guardar. Intentá de nuevo.', 'error');
      });
  }

  // ── Crop modal (Cropper.js) ────────────────────────────────────────────────

  var _cropper = null;

  function openCropModal(file) {
    var modal    = document.getElementById('crop-modal');
    var cropImg  = document.getElementById('crop-image');
    var btnOk    = document.getElementById('crop-confirm');
    var btnCancel= document.getElementById('crop-cancel');
    if (!modal || !cropImg) { uploadPhoto(file); return; }   // fallback sin modal

    // Cargar imagen
    var reader = new FileReader();
    reader.onload = function (e) {
      cropImg.src = e.target.result;
      modal.style.display = '';

      // Destruir instancia previa
      if (_cropper) { _cropper.destroy(); _cropper = null; }

      // Crear cropper circular
      _cropper = new Cropper(cropImg, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: 'move',
        cropBoxResizable: true,
        cropBoxMovable: true,
        guides: false,
        center: true,
        highlight: false,
        background: false,
        autoCropArea: 0.85,
        responsive: true,
      });
    };
    reader.readAsDataURL(file);

    // Confirmar recorte
    function onConfirm() {
      if (!_cropper) return;
      _cropper.getCroppedCanvas({
        width: 512,
        height: 512,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      }).toBlob(function (blob) {
        // Preview inmediato
        var fotoPreview = document.getElementById('foto-preview');
        if (fotoPreview) {
          fotoPreview.src = URL.createObjectURL(blob);
          fotoPreview.style.display = '';
          var placeholder = document.getElementById('foto-placeholder');
          if (placeholder) placeholder.style.display = 'none';
        }
        uploadPhoto(blob);
        closeCropModal();
      }, 'image/jpeg', 0.92);
    }

    function closeCropModal() {
      modal.style.display = 'none';
      if (_cropper) { _cropper.destroy(); _cropper = null; }
      btnOk.removeEventListener('click', onConfirm);
      btnCancel.removeEventListener('click', closeCropModal);
      // Limpiar input para permitir re-selección del mismo archivo
      var fotoInput = document.getElementById('foto-input');
      if (fotoInput) fotoInput.value = '';
    }

    btnOk.addEventListener('click', onConfirm);
    btnCancel.addEventListener('click', closeCropModal);
  }

  function uploadPhoto(file) {
    var formData = new FormData();
    formData.append('foto', file);

    var token = DDAuth.getToken();
    fetch(DDAuth.apiUrl('/auth/profile/foto/'), {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData,
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.foto_url) {
          var prev = document.getElementById('foto-preview');
          if (prev) prev.src = data.foto_url + '?t=' + Date.now();
          showMsg('perfil-msg', 'Foto actualizada.', 'success');
        } else {
          showMsg('perfil-msg', data.detail || 'Error al subir la foto.', 'error');
        }
      })
      .catch(function () {
        showMsg('perfil-msg', 'Error al subir la foto.', 'error');
      });
  }

  // ── Historial (mi-historial.html) ─────────────────────────────────────────

  function initMiHistorial() {
    DDAuth.requireAuth();
    loadHistorial();
  }

  function loadHistorial() {
    var container = document.getElementById('historial-container');
    var emptyEl   = document.getElementById('historial-empty');
    var loadingEl = document.getElementById('historial-loading');

    if (loadingEl) loadingEl.style.display = '';

    DDAuth.authFetch('/climan/me/historial/')
      .then(function (res) {
        if (res.status === 401) { DDAuth.logout(); return null; }
        return res.json();
      })
      .then(function (data) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (!data) return;

        var eventos = data.historial || [];
        if (!container) return;

        if (eventos.length === 0) {
          if (emptyEl) emptyEl.style.display = '';
          return;
        }

        container.innerHTML = eventos.map(function (ev) {
          var tipo   = ev.tipo || '';
          var label  = TIPO_LABELS[tipo] || tipo;
          var badge  = TIPO_BADGE_CLASS[tipo] || 'badge-default';
          var fecha  = formatFecha(ev.fecha);
          var detalle= ev.detalle || '';
          return (
            '<div class="historial-item">' +
              '<div class="historial-fecha">' + fecha + '</div>' +
              '<div class="historial-body">' +
                '<span class="historial-badge ' + badge + '">' + label + '</span>' +
                '<p class="historial-detalle">' + escapeHtml(detalle) + '</p>' +
              '</div>' +
            '</div>'
          );
        }).join('');
      })
      .catch(function (err) {
        if (loadingEl) loadingEl.style.display = 'none';
        console.error('Error cargando historial:', err);
        if (container) container.innerHTML = '<p class="portal-error">Error al cargar el historial.</p>';
      });
  }

  // ── Login (login.html) ────────────────────────────────────────────────────

  function initLogin() {
    DDAuth.redirectIfLoggedIn();

    var form  = document.getElementById('form-login');
    var msgEl = document.getElementById('login-msg');

    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email    = getInputVal('login-email') || '';
      var password = getInputVal('login-password') || '';

      setLoading(form, true);
      showMsg('login-msg', '', '');

      fetch(DDAuth.apiUrl('/auth/login/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: password }),
      })
        .then(function (res) { return res.json().then(function (d) { return { status: res.status, data: d }; }); })
        .then(function (r) {
          setLoading(form, false);
          if (r.status === 200 && r.data.access) {
            DDAuth.setToken(r.data.access);
            DDAuth.setUser(r.data.usuario);
            window.location.href = '/mi-cuenta';
          } else {
            showMsg('login-msg', r.data.detail || 'Correo o contraseña incorrectos.', 'error');
          }
        })
        .catch(function () {
          setLoading(form, false);
          showMsg('login-msg', 'Error de conexión. Intentá de nuevo.', 'error');
        });
    });
  }

  // ── Registro (registro.html) ──────────────────────────────────────────────

  function initRegistro() {
    DDAuth.redirectIfLoggedIn();

    var form = document.getElementById('form-registro');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var payload = {
        nombre:   getInputVal('reg-nombre')   || '',
        apellido: getInputVal('reg-apellido') || '',
        email:    getInputVal('reg-email')    || '',
        password: getInputVal('reg-password') || '',
        whatsapp: getInputVal('reg-whatsapp') || '',
        dni:      getInputVal('reg-dni')      || '',
      };

      setLoading(form, true);
      showMsg('registro-msg', '', '');

      fetch(DDAuth.apiUrl('/auth/register/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) { return res.json().then(function (d) { return { status: res.status, data: d }; }); })
        .then(function (r) {
          setLoading(form, false);
          if (r.status === 201 && r.data.access) {
            DDAuth.setToken(r.data.access);
            DDAuth.setUser(r.data.usuario);
            window.location.href = '/mi-cuenta';
          } else {
            var errMsg = extraerError(r.data);
            showMsg('registro-msg', errMsg, 'error');
          }
        })
        .catch(function () {
          setLoading(form, false);
          showMsg('registro-msg', 'Error de conexión. Intentá de nuevo.', 'error');
        });
    });
  }

  // ── Utilidades ─────────────────────────────────────────────────────────────

  function setField(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val || '—';
  }

  function setInputVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val || '';
  }

  function getInputVal(id) {
    var el = document.getElementById(id);
    return el ? el.value : null;
  }

  function showMsg(id, msg, type) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className = 'portal-msg' + (type ? ' portal-msg-' + type : '');
    el.style.display = msg ? '' : 'none';
  }

  function setLoading(form, loading) {
    var btn = form && form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = loading;
      btn.textContent = loading ? 'Cargando…' : btn.dataset.label || btn.textContent;
    }
  }

  function formatFecha(str) {
    if (!str) return '';
    try {
      var d = new Date(str.replace(' ', 'T'));
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (_) { return str; }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function extraerError(data) {
    if (!data) return 'Error desconocido.';
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    var msgs = [];
    Object.keys(data).forEach(function (k) {
      var v = data[k];
      if (Array.isArray(v)) msgs.push(v.join(' '));
      else msgs.push(String(v));
    });
    return msgs.join(' ') || 'Error desconocido.';
  }

  // ── Google OAuth callback (expuesto como global para Google Identity Services) ──

  function handleGoogleCredential(response) {
    var page  = document.body.dataset.page;
    var msgId = page === 'login' ? 'login-google-msg' : 'registro-google-msg';

    fetch(DDAuth.apiUrl('/auth/google/'), {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ credential: response.credential }),
    })
      .then(function (res) {
        return res.json().then(function (d) { return { status: res.status, data: d }; });
      })
      .then(function (r) {
        if ((r.status === 200 || r.status === 201) && r.data.access) {
          DDAuth.setToken(r.data.access);
          DDAuth.setUser(r.data.usuario);
          window.location.href = '/mi-cuenta';
        } else {
          showMsg(msgId, r.data.detail || 'Error con Google. Intentá de nuevo.', 'error');
        }
      })
      .catch(function () {
        showMsg(msgId, 'Error de conexión. Intentá de nuevo.', 'error');
      });
  }

  // Exponer como global para que Google Identity Services pueda invocarlo
  window.handleGoogleCredential = handleGoogleCredential;

  // ── Inicialización según página ────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    var body = document.body;
    if (body.dataset.page === 'mi-cuenta')   initMiCuenta();
    if (body.dataset.page === 'mi-historial') initMiHistorial();
    if (body.dataset.page === 'login')        initLogin();
    if (body.dataset.page === 'registro')     initRegistro();
  });

})();
