#!/usr/bin/env bash
set -euo pipefail

echo "==> Pulling latest changes..."
git fetch origin main
git reset --hard origin/main

# Este script hace `git reset --hard` sobre sí mismo (deploy/deploy.sh).
# Sin el re-exec de abajo, bash sigue interpretando el contenido viejo que
# ya tenía cargado (ej: una URL vieja en HEALTH_URL) aunque el archivo en
# disco ya haya cambiado. DEPLOY_REEXECED evita un loop infinito.
if [ -z "${DEPLOY_REEXECED:-}" ]; then
  export DEPLOY_REEXECED=1
  exec bash "$0" "$@"
fi

COMPOSE="docker compose -f docker-compose.prod.yml"
HEALTH_URL="https://glob.ar/api/health"

# La imagen ya viene compilada desde GitHub Actions (GHCR) — acá solo se
# descarga, nunca se compila (la VM no tiene RAM para un build de Next.js).
echo "==> Pulling latest image..."
$COMPOSE pull app

echo "==> Restarting services..."
$COMPOSE up -d

# El Caddyfile se monta como bind-mount de UN archivo: `up -d` no reinicia
# Caddy si su imagen no cambió, y si git reemplaza el archivo (nueva inode)
# ni `caddy reload` ni `restart` vuelven a resolver el mount — el contenedor
# sigue viendo el contenido viejo. Solo --force-recreate lo garantiza.
echo "==> Recreating Caddy container to pick up Caddyfile changes..."
$COMPOSE up -d --force-recreate caddy

echo "==> Waiting for app to be healthy (30 attempts x 3s = 90s)..."
for i in $(seq 1 30); do
  if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
    echo "==> Health check OK: $HEALTH_URL"
    # Cada deploy baja una imagen nueva con el mismo tag (:latest) y deja la
    # anterior sin tag, ocupando espacio sin que nadie la use — sin esto el
    # disco de la VM se termina llenando (ya pasó una vez, 35GB acumulados).
    # Solo borra imágenes que ningún contenedor tiene en uso, nunca las activas.
    echo "==> Limpiando imágenes viejas sin usar..."
    docker image prune -a -f || true
    exit 0
  fi
  echo "    Attempt $i/30 - waiting 3s..."
  sleep 3
done

echo ""
echo "ERROR: Health check failed after 90s."
echo ""
echo "==> App container logs (last 100 lines):"
$COMPOSE logs --no-log-prefix --tail=100 app 2>&1 || true
echo ""
echo "==> Caddy container logs (last 20 lines):"
$COMPOSE logs --no-log-prefix --tail=20 caddy 2>&1 || true
echo ""
exit 1
