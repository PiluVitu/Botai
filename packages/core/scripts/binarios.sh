#!/usr/bin/env bash
# Compila o bin do pacote (o mesmo arquivo que vai ao npm) com o Bun do .bun-version.
# Uso: scripts/binarios.sh <alvo>... | local
#   alvos: darwin-arm64 darwin-x64 linux-x64 linux-arm64 windows-x64 windows-arm64; "local" = o desta máquina.
# Escreve no stdout o caminho de cada binário (dist-bin/botai-<alvo>[.exe]); o resto vai ao stderr.
set -euo pipefail

cd "$(dirname "$0")/.."
raiz=$(cd ../.. && pwd)
bun=${BUN:-bun}
esperada=$(tr -d '[:space:]' < "$raiz/.bun-version")
atual=$("$bun" --version)
if [ "$atual" != "$esperada" ]; then
  echo "binarios: o Bun é $atual e o .bun-version pede $esperada; rode com BUN=\"\$(bash scripts/bun-fixo.sh)\"" >&2
  exit 1
fi

entrada=$(node -p "require('./package.json').bin.botai")
if [ ! -f "$entrada" ]; then
  echo "binarios: $entrada não existe; rode o build antes" >&2
  exit 1
fi

if [ "$#" -eq 0 ]; then
  echo "uso: scripts/binarios.sh <alvo>... | local" >&2
  exit 2
fi

alvos=()
for alvo in "$@"; do
  if [ "$alvo" = local ]; then
    case "$(uname -s)-$(uname -m)" in
      Darwin-arm64) alvo=darwin-arm64 ;;
      Darwin-x86_64) alvo=darwin-x64 ;;
      Linux-x86_64) alvo=linux-x64 ;;
      Linux-aarch64) alvo=linux-arm64 ;;
      *) echo "binarios: esta máquina ($(uname -s)-$(uname -m)) não é um dos 6 alvos" >&2; exit 1 ;;
    esac
  fi
  alvos+=("$alvo")
done

mkdir -p dist-bin
for alvo in "${alvos[@]}"; do
  # x64 no -baseline: roda em CPU sem AVX2 (máquinas antigas, emuladores).
  case "$alvo" in
    darwin-arm64) alvo_bun="bun-darwin-arm64" ;;
    darwin-x64) alvo_bun="bun-darwin-x64-baseline" ;;
    linux-x64) alvo_bun="bun-linux-x64-baseline" ;;
    linux-arm64) alvo_bun="bun-linux-arm64" ;;
    windows-x64) alvo_bun="bun-windows-x64-baseline" ;;
    windows-arm64) alvo_bun="bun-windows-arm64" ;;
    *) echo "binarios: alvo desconhecido: $alvo" >&2; exit 2 ;;
  esac
  saida="dist-bin/botai-$alvo"
  [[ "$alvo" == windows-* ]] && saida="$saida.exe"
  "$bun" build --compile --minify --target="$alvo_bun" "$entrada" --outfile "$saida" >&2

  # O Bun 1.4.2 deixa inválida a assinatura do binário macOS de outra arquitetura (codesign -v
  # falha); a ad-hoc refeita aqui é válida nos dois.
  if [[ "$alvo" == darwin-* ]]; then
    if [ "$(uname -s)" != Darwin ]; then
      echo "binarios: $saida precisa da assinatura ad-hoc do codesign: compile os alvos darwin no macOS" >&2
      exit 1
    fi
    codesign --force --sign - "$saida" >&2
    codesign -v "$saida" >&2
  fi
  echo "$saida"
done
