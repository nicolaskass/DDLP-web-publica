# DDLP Web Pública — Digital Discos

Sitio web público de Digital Discos. Frontend independiente (Flask + Jinja2) que consume el backend Django de DIGI vía API REST.

**Dominio:** `eshop.digitaldiscos.com.ar` *(en producción)*

---

## Arquitectura

```
eshop.digitaldiscos.com.ar  →  Flask (este app)
                                    │
                               /api/* proxiado por Traefik
                                    │
digi.digitaldiscos.com.ar   →  Django backend (compartido)
```

El frontend **no importa código de DIGI**. Toda la lógica de datos pasa por la API REST del backend Django.

---

## Stack

- Python + Flask
- Jinja2 (templates server-side)
- Vanilla JS (sin frameworks)
- CSS propio (`static/css/`)
- Traefik como reverse proxy en producción

---

## Variables de entorno

| Variable       | Default | Descripción |
|----------------|---------|-------------|
| `SECRET_KEY`   | `dev-key-change-in-production` | Clave secreta Flask |
| `API_URL`      | `/api`  | Base URL de la API. En producción usar `/api` (Traefik lo proxia al backend Django). En desarrollo local puede ser `http://localhost:8000/api`. |
| `FLASK_DEBUG`  | `false` | Activar modo debug |

---

## Rutas

| Ruta | Template | Descripción |
|------|----------|-------------|
| `/` | `index.html` | Home |
| `/productos` | `productos.html` | Página de productos |
| `/servicios` | `servicios.html` | Servicios |
| `/tienda` | `tienda.html` | Tienda (próximamente) |
| `/blog` | `blog.html` | Blog (próximamente) |
| `/contacto` | `contact.html` | Contacto |
| `/login` | `login.html` | Portal de clientes — login |
| `/registro` | `registro.html` | Portal de clientes — registro |
| `/mi-cuenta` | `mi-cuenta.html` | Portal de clientes — cuenta |
| `/mi-historial` | `mi-historial.html` | Portal de clientes — historial |
| `/nueva-contrasena/<token>` | `nueva-contrasena.html` | Reset de contraseña |
| `/scan/<qr_code>` | `scan.html` | **Página pública de producto escaneado por QR** |

---

## QR Scan (`/scan/<qr_code>`)

Cuando un cliente escanea un código QR de un producto con su teléfono:

1. El backend Django (`digi.digitaldiscos.com.ar/p/<qr_code>/`) detecta que **no hay cookie `dd_staff`** (no es personal interno).
2. Redirige a `eshop.digitaldiscos.com.ar/scan/<qr_code>`.
3. Flask renderiza `scan.html` con el `qr_code` como variable.
4. El JS del template llama a `/api/invman/qr/<qr_code>/info/` (endpoint público del backend Django).
5. Se muestra la ficha del producto: nombre, artista, imagen, precios, condición, tracklist, etc.

La visibilidad de cada campo es controlada por la configuración `QRLabelConfig` gestionada desde DIGI (CONFMAN → QR → Vista pública).

El personal interno (con cookie `dd_staff`) es redirigido directamente a la ficha interna en DIGI en lugar de esta página.

---

## Desarrollo local

```bash
# Crear entorno virtual
python -m venv .venv
source .venv/bin/activate

# Instalar dependencias
pip install flask

# Ejecutar
FLASK_DEBUG=true API_URL=http://localhost:8000/api python main.py
```

La app corre en `http://localhost:5000`.

---

## Notas para escalar

Si la app pública crece en complejidad (eshop completo, carrito, pagos, etc.) se puede migrar a:
- **React/Vite** como SPA con la misma API
- **Next.js** para SSR/SSG si se necesita SEO

El backend Django no cambia — solo el frontend.
