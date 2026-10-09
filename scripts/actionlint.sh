#!/usr/bin/env bash
# Chamado pelos workflows (bash scripts/actionlint.sh [workflows]); ver "Docker Hub no CI" no CLAUDE.md da raiz.
set -euo pipefail

versao=1.7.12
sha256=8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8
pacote="actionlint_${versao}_linux_amd64.tar.gz"
pasta=$(mktemp -d)
trap 'rm -rf "$pasta"' EXIT

curl -sSfL --retry 3 -o "$pasta/$pacote" \
  "https://github.com/rhysd/actionlint/releases/download/v${versao}/${pacote}"
echo "$sha256  $pasta/$pacote" | sha256sum -c --quiet
tar -xzf "$pasta/$pacote" -C "$pasta" actionlint
"$pasta/actionlint" -color "$@"
