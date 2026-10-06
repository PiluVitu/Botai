#!/usr/bin/env bash
# Sobe a imagem, espera o HEALTHCHECK, confere as rotas contra os dourados e para com SIGTERM.
# Uso: scripts/fumaca-imagem.sh <imagem>
set -euo pipefail

imagem=${1:?uso: scripts/fumaca-imagem.sh <imagem>}
cd "$(dirname "$0")/.."
nome="botai-fumaca-$$"
trap 'docker rm -f "$nome" >/dev/null 2>&1 || true' EXIT

docker run -d --name "$nome" -p 127.0.0.1::8790 "$imagem" >/dev/null

estado=starting
for _ in $(seq 1 30); do
  estado=$(docker inspect -f '{{.State.Health.Status}}' "$nome")
  [ "$estado" = healthy ] && break
  sleep 1
done
if [ "$estado" != healthy ]; then
  echo "fumaca-imagem: o HEALTHCHECK não chegou a healthy (último estado: $estado)" >&2
  docker logs "$nome" >&2
  exit 1
fi

usuario=$(docker exec "$nome" id -u)
if [ "$usuario" = 0 ]; then
  echo "fumaca-imagem: o servidor roda como root" >&2
  exit 1
fi

porta=$(docker port "$nome" 8790/tcp | head -n 1 | sed 's/.*://')
node scripts/fumaca.mjs --url "http://127.0.0.1:$porta"

docker stop -t 5 "$nome" >/dev/null
codigo=$(docker inspect -f '{{.State.ExitCode}}' "$nome")
if [ "$codigo" != 0 ]; then
  echo "fumaca-imagem: o docker stop terminou com $codigo (esperado 0: o SIGTERM encerra o servidor)" >&2
  exit 1
fi
echo "fumaca-imagem: $imagem ok"
