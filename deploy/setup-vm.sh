#!/usr/bin/env bash
# Setup inicial de la VM (correr una sola vez, por SSH, como usuario ubuntu):
#   curl -fsSL https://raw.githubusercontent.com/chukita/globar/main/deploy/setup-vm.sh | bash
# o copiando el repo y corriendo: bash deploy/setup-vm.sh
#
# Instala Docker y agrega 2GB de swap. La VM (VM.Standard.E2.1.Micro, 1GB RAM)
# no tiene margen para picos de memoria — sin swap, el OOM killer puede matar
# Postgres o la app bajo carga. El build de la imagen NO corre acá (ver
# docker-compose.prod.yml): se compila en GitHub Actions y se hace `pull`.
set -euo pipefail

echo "==> Instalando Docker..."
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  echo "    Docker instalado. Vas a necesitar cerrar sesión y volver a entrar (o 'newgrp docker') para usarlo sin sudo."
else
  echo "    Docker ya está instalado, salteo."
fi

echo "==> Configurando swap de 2GB..."
if [ -f /swapfile ]; then
  echo "    /swapfile ya existe, salteo."
else
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab > /dev/null
  echo "    Swap creado y activado (persiste tras reboot vía /etc/fstab)."
fi

# Menos agresivo para usar swap solo cuando realmente falta RAM (default es 60).
if ! grep -q '^vm.swappiness' /etc/sysctl.conf 2>/dev/null; then
  echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf > /dev/null
  sudo sysctl -p > /dev/null
fi

echo ""
echo "==> Listo. Falta:"
echo "    1) docker login ghcr.io -u <tu-usuario-github>   (PAT con scope read:packages)"
echo "    2) git clone https://github.com/chukita/globar.git ~/globar"
echo "    3) cd ~/globar && cp deploy/env.production.example .env  (completar valores)"
echo "    4) docker compose -f docker-compose.prod.yml up -d"
