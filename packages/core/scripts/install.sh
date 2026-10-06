#!/bin/sh
# Instala o binário `botai` de um GitHub Release de PiluVitu/Botai em ~/.local/bin.
# curl -fsSL https://github.com/PiluVitu/Botai/releases/latest/download/install.sh | sh
set -eu

RELEASES=${BOTAI_RELEASES:-https://github.com/PiluVitu/Botai/releases}

erro() {
  printf 'botai: %s\n' "$1" >&2
  exit 1
}

baixar() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL --retry 3 -o "$2" "$1"
  elif command -v wget >/dev/null 2>&1; then
    wget -q -O "$2" "$1"
  else
    erro "falta curl ou wget para baixar o binário"
  fi
}

sha256() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | cut -d ' ' -f 1
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | cut -d ' ' -f 1
  else
    erro "falta sha256sum ou shasum para conferir o binário"
  fi
}

case "$(uname -s)" in
  Darwin) so=darwin ;;
  Linux) so=linux ;;
  MINGW* | MSYS* | CYGWIN*) erro "no Windows, baixe botai-windows-x64.exe (ou botai-windows-arm64.exe) em $RELEASES (veja o README)" ;;
  *) erro "sistema sem binário: $(uname -s). Use o npm (npx @pilutech/botai-core) ou a imagem ghcr.io/piluvitu/botai" ;;
esac

case "$(uname -m)" in
  x86_64 | amd64) arq=x64 ;;
  arm64 | aarch64) arq=arm64 ;;
  *) erro "arquitetura sem binário: $(uname -m). Use o npm (npx @pilutech/botai-core) ou a imagem ghcr.io/piluvitu/botai" ;;
esac

# Terminal sob Rosetta: o uname diz x86_64 num Mac Apple Silicon.
if [ "$so" = darwin ] && [ "$arq" = x64 ] && [ "$(sysctl -n sysctl.proc_translated 2>/dev/null || true)" = 1 ]; then
  arq=arm64
fi

if [ "$so" = linux ] && ldd --version 2>&1 | grep -qi musl; then
  erro "Linux com musl (Alpine) não tem binário: use a imagem ghcr.io/piluvitu/botai ou o npm (npx @pilutech/botai-core)"
fi

nome="botai-$so-$arq"
if [ -n "${BOTAI_VERSAO:-}" ]; then
  base="$RELEASES/download/core-v$BOTAI_VERSAO"
else
  base="$RELEASES/latest/download"
fi
destino=${BOTAI_DESTINO:-$HOME/.local/bin}

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
trap 'exit 1' INT TERM

baixar "$base/SHA256SUMS" "$tmp/SHA256SUMS" || erro "não deu para baixar $base/SHA256SUMS"
baixar "$base/$nome" "$tmp/$nome" || erro "não deu para baixar $base/$nome"

esperado=$(awk -v n="$nome" '$2 == n || $2 == "*" n { print $1 }' "$tmp/SHA256SUMS")
[ -n "$esperado" ] || erro "o SHA256SUMS não tem a linha de $nome"
obtido=$(sha256 "$tmp/$nome")
[ "$esperado" = "$obtido" ] || erro "o SHA256 de $nome não confere (esperado $esperado, baixado $obtido); nada foi instalado"

mkdir -p "$destino"
cp "$tmp/$nome" "$destino/.botai-novo"
chmod 755 "$destino/.botai-novo"
mv -f "$destino/.botai-novo" "$destino/botai"
printf 'botai instalado em %s/botai (%s)\n' "$destino" "$nome"

case ":$PATH:" in
  *":$destino:"*) ;;
  *) printf 'botai: %s não está no PATH; acrescente ao perfil do seu shell: export PATH="%s:%s"\n' "$destino" "$destino" "\$PATH" >&2 ;;
esac
