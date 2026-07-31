#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose -f docker-compose.prod.yml"
HEALTH_URL="https://glob.ar/api/health"

echo "==> Pulling latest changes..."
git fetch origin main
git reset --hard origin/main

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
