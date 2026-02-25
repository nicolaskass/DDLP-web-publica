import os
from flask import Flask, render_template
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)

# Confiar en los headers X-Forwarded-* que envía Traefik
# (x_for=1: un proxy de confianza delante — Traefik)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

# En producción la SECRET_KEY debe venir de la variable de entorno
app.secret_key = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')

# URL base de la API. En producción se usa el mismo origen (/api).
# En desarrollo local apuntar a http://localhost:8000/api si se necesita.
API_URL = os.environ.get('API_URL', '/api')


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/productos')
def productos():
    return render_template('productos.html')

@app.route('/servicios')
def servicios():
    return render_template('servicios.html')

@app.route('/contacto')
def contact():
    return render_template('contact.html')

@app.route('/tienda')
def tienda():
    return render_template('tienda.html')

@app.route('/blog')
def blog():
    return render_template('blog.html')


# ─── Portal de clientes ───────────────────────────────────────────────────────

@app.route('/login')
def login():
    return render_template('login.html', api_url=API_URL)

@app.route('/registro')
def registro():
    return render_template('registro.html', api_url=API_URL)

@app.route('/mi-cuenta')
def mi_cuenta():
    return render_template('mi-cuenta.html', api_url=API_URL)

@app.route('/mi-historial')
def mi_historial():
    return render_template('mi-historial.html', api_url=API_URL)

@app.route('/nueva-contrasena/<token>')
def nueva_contrasena(token):
    return render_template('nueva-contrasena.html', api_url=API_URL, token=token)


# ─── QR scan público ──────────────────────────────────────────────────────────

@app.route('/scan/<qr_code>')
def scan(qr_code):
    """Página pública de producto escaneado por QR. Sin autenticación."""
    return render_template('scan.html', api_url=API_URL, qr_code=qr_code)


if __name__ == '__main__':
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=5000, debug=debug)
