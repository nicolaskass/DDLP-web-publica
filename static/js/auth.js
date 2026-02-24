/**
 * auth.js — Gestión de sesión para el portal de clientes de Digital Discos.
 * La API URL se inyecta desde Flask vía window.DD_API_URL (ver templates).
 * Fallback: '/api' (mismo origen en producción).
 */

(function () {
  'use strict';

  const TOKEN_KEY = 'dd_token';
  const USER_KEY  = 'dd_user';

  // ── Helpers de almacenamiento ──────────────────────────────────────────────

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch (_) {
      return null;
    }
  }

  function setUser(userData) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }

  function isLoggedIn() {
    return !!getToken();
  }

  // ── Fetch autenticado ──────────────────────────────────────────────────────

  function apiUrl(path) {
    var base = window.DD_API_URL || '/api';
    // Asegurar que no haya doble slash
    return base.replace(/\/$/, '') + path;
  }

  function authFetch(path, options) {
    options = options || {};
    options.headers = options.headers || {};
    var token = getToken();
    if (token) {
      options.headers['Authorization'] = 'Bearer ' + token;
    }
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    return fetch(apiUrl(path), options);
  }

  // ── Guards ─────────────────────────────────────────────────────────────────

  /** Redirige a /login si el usuario no está autenticado. */
  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = '/login';
    }
  }

  /** Redirige a /mi-cuenta si el usuario ya está autenticado (para login/registro). */
  function redirectIfLoggedIn() {
    if (isLoggedIn()) {
      window.location.href = '/mi-cuenta';
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  function logout() {
    removeToken();
    window.location.href = '/';
  }

  // ── Navbar dinámica ────────────────────────────────────────────────────────

  function updateNavbar() {
    var guestEls = document.querySelectorAll('.nav-auth-guest');
    var userEls  = document.querySelectorAll('.nav-auth-user');
    var nombreEl = document.getElementById('nav-nombre-usuario');
    var salirBtn = document.getElementById('btn-salir');

    if (isLoggedIn()) {
      guestEls.forEach(function (el) { el.style.display = 'none'; });
      userEls.forEach(function (el) { el.style.display = ''; });
      var user = getUser();
      if (nombreEl && user && user.nombre_completo) {
        // Mostrar solo el primer nombre
        var primerNombre = user.nombre_completo.split(' ')[0];
        nombreEl.textContent = primerNombre;
      }
    } else {
      guestEls.forEach(function (el) { el.style.display = ''; });
      userEls.forEach(function (el) { el.style.display = 'none'; });
    }

    if (salirBtn) {
      salirBtn.addEventListener('click', function (e) {
        e.preventDefault();
        logout();
      });
    }
  }

  // ── Exponer API pública ────────────────────────────────────────────────────

  window.DDAuth = {
    getToken:         getToken,
    setToken:         setToken,
    removeToken:      removeToken,
    getUser:          getUser,
    setUser:          setUser,
    isLoggedIn:       isLoggedIn,
    apiUrl:           apiUrl,
    authFetch:        authFetch,
    requireAuth:      requireAuth,
    redirectIfLoggedIn: redirectIfLoggedIn,
    logout:           logout,
  };

  // Actualizar navbar en todas las páginas automáticamente
  document.addEventListener('DOMContentLoaded', updateNavbar);

})();
