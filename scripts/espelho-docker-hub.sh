#!/usr/bin/env bash
# Chamado pelos workflows antes de baixar ou construir imagem; ver "Docker Hub no CI" no CLAUDE.md da raiz.
set -euo pipefail

config=/etc/docker/daemon.json
atual='{}'
if sudo test -s "$config"; then atual=$(sudo cat "$config"); fi
jq '."registry-mirrors" = ["https://mirror.gcr.io"]' <<<"$atual" |
  sudo tee "$config" >/dev/null
sudo systemctl restart docker
docker info --format '{{json .RegistryConfig.Mirrors}}'
