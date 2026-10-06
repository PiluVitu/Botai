#!/usr/bin/env bash
# Baixa uma vez o Bun do .bun-version para o cache do usuário, confere o SHA256 e imprime o caminho.
# Uso: BUN="$(bash scripts/bun-fixo.sh)" bash scripts/binarios.sh local
set -euo pipefail

# Os SHA256 são do SHASUMS256.txt do release bun-v<versão>; trocou o .bun-version, troque-os.
VERSAO_DOS_SHA256=1.4.2

raiz=$(cd "$(dirname "$0")/../../.." && pwd)
versao=$(tr -d '[:space:]' < "$raiz/.bun-version")
if [ "$versao" != "$VERSAO_DOS_SHA256" ]; then
  echo "bun-fixo: o .bun-version pede $versao, mas os SHA256 deste script são do $VERSAO_DOS_SHA256" >&2
  exit 1
fi

case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) pacote=bun-darwin-aarch64 sha=90987a3a16d7db556d886ac3d551e7b6d3edf0a1cf43acaed622e8676be1d12f ;;
  Darwin-x86_64) pacote=bun-darwin-x64 sha=80520d7e17526308c9185d261679ac6d27798d3803a0e9f7ff9121ab8affb012 ;;
  Linux-x86_64) pacote=bun-linux-x64 sha=36368faef7527875d5ffa52e53cd48021741f2a83eb6208a8dd64068d422a913 ;;
  Linux-aarch64) pacote=bun-linux-aarch64 sha=54328bbc2d9c8e0c9f892c544d66c57a83b84139e34909e5ee81758f1ac8fda7 ;;
  *) echo "bun-fixo: sem Bun fixado para $(uname -s)-$(uname -m)" >&2; exit 1 ;;
esac

pasta="${XDG_CACHE_HOME:-$HOME/.cache}/botai/bun-$versao"
bun="$pasta/$pacote/bun"
if [ ! -x "$bun" ]; then
  mkdir -p "$pasta"
  zip="$pasta/$pacote.zip"
  curl -fsSL --retry 3 -o "$zip" "https://github.com/oven-sh/bun/releases/download/bun-v$versao/$pacote.zip"
  if command -v sha256sum >/dev/null 2>&1; then
    obtido=$(sha256sum "$zip" | cut -d ' ' -f 1)
  else
    obtido=$(shasum -a 256 "$zip" | cut -d ' ' -f 1)
  fi
  if [ "$obtido" != "$sha" ]; then
    rm -f "$zip"
    echo "bun-fixo: o SHA256 de $pacote.zip não confere (esperado $sha, baixado $obtido)" >&2
    exit 1
  fi
  unzip -q -o "$zip" -d "$pasta"
  rm -f "$zip"
fi
echo "$bun"
