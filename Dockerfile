# ─────────────────────────────────────────────
#  Digital Discos — Imagen de producción
#  Base: Python 3.11 slim + uv
# ─────────────────────────────────────────────
FROM python:3.11-slim

# Instalar uv (gestor de dependencias)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copiar archivos de dependencias primero (cache de capas)
COPY pyproject.toml uv.lock* ./

# Instalar dependencias de producción
# --no-dev:       omitir dependencias de desarrollo
# --no-cache:     no usar caché de uv (imagen más liviana)
RUN uv sync --no-dev --no-cache

# Copiar el código de la aplicación
COPY . .

# Puerto interno en el que escucha Gunicorn
EXPOSE 5000

# Ejecutar con Gunicorn (nunca usar el servidor de desarrollo de Flask en producción)
# --workers 2          : 2 procesos worker (ajustar según CPU del VPS)
# --access-logfile -   : logs de acceso a stdout (visibles con docker logs)
# --error-logfile  -   : logs de error   a stderr
CMD ["uv", "run", "gunicorn", \
     "--bind", "0.0.0.0:5000", \
     "--workers", "2", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "main:app"]
