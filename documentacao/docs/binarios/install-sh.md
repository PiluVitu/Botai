---
title: Instalar pelo install.sh
sidebar_label: install.sh
description: O install.sh baixa o binário do Botaí para o seu sistema, confere o SHA256 e instala o botai em ~/.local/bin, sem Node.
sidebar_position: 1
---

O binário do Botaí roda a CLI e o servidor sem Node. O `install.sh` escolhe o binário do seu sistema e da sua arquitetura, baixa o binário e o `SHA256SUMS` do release, confere o SHA256 e instala o `botai` em `~/.local/bin`. A instalação é atômica: o `botai` antigo só é trocado depois que o novo está inteiro no destino.

## Instalar

```bash
curl -fsSL https://github.com/PiluVitu/Botai/releases/latest/download/install.sh | sh
```

Para fixar a versão, que é o recomendado:

```bash
curl -fsSL https://github.com/PiluVitu/Botai/releases/latest/download/install.sh | BOTAI_VERSAO=0.5.0 sh
```

No fim, ele escreve `botai instalado em <destino>/botai (botai-darwin-arm64)`, com a pasta e o binário que escolheu. Se a pasta não está no `PATH`, ele avisa no stderr e mostra a linha para o perfil do seu shell:

```text
botai: <destino> não está no PATH; acrescente ao perfil do seu shell: export PATH="<destino>:$PATH"
```

Confira a instalação:

```bash testar
botai --versao
```

```text
0.5.0
```

## Variáveis {#variaveis}

| Variável         | Padrão                                       | O que faz                            |
| ---------------- | -------------------------------------------- | ------------------------------------ |
| `BOTAI_VERSAO`   | a versão do release marcado como Latest      | instala essa versão                  |
| `BOTAI_DESTINO`  | `~/.local/bin`                               | a pasta onde o `botai` fica          |
| `BOTAI_RELEASES` | `https://github.com/PiluVitu/Botai/releases` | a raiz de onde ele baixa os arquivos |

As variáveis vão antes do `sh`, do lado direito do pipe:

```bash
curl -fsSL https://github.com/PiluVitu/Botai/releases/latest/download/install.sh | BOTAI_VERSAO=0.5.0 BOTAI_DESTINO="$HOME/bin" sh
```

Com `BOTAI_RELEASES`, o script procura os arquivos em `<raiz>/latest/download/` ou, com `BOTAI_VERSAO`, em `<raiz>/download/core-v<versão>/`, como no GitHub. Serve para um espelho dos releases.

Com uma versão que não existe, o `install.sh` sai com 1 e não instala nada. A mensagem começa com `botai: não deu para baixar`.

:::info

Sem `BOTAI_VERSAO`, o `install.sh` baixa do release marcado como Latest no GitHub. Ele depende de o último release do core estar marcado assim. Com `BOTAI_VERSAO`, você sabe qual versão instalou e gera as mesmas pessoas em todas as máquinas.

:::

## Sistemas {#sistemas}

O `install.sh` foi provado no macOS arm64.

:::note[Documentado]

Lido no `install.sh`, sem prova rodada:

- num terminal sob Rosetta, num Mac Apple Silicon, ele instala o binário arm64;
- no Linux com musl (Alpine), ele recusa com uma mensagem: não há binário para musl. Use a [imagem Docker](../docker/imagem.md) ou o `npx` (veja [Instalação](../comecar/instalacao.md));
- no Windows, ele recusa com uma mensagem: baixe o `.exe` (veja [Download e verificação](./download-e-verificacao.md));
- para baixar, ele usa o `curl` ou o `wget`; para conferir, o `sha256sum` ou o `shasum`.

Os binários de Linux e de Windows rodam na fumaça do CI do projeto, nos 6 alvos; ninguém os reproduziu fora dele.

:::

## Depois de instalar

O binário tem os mesmos comandos da [CLI](../cli/visao-geral.md), inclusive o `serve`. A pessoa é a mesma das outras portas:

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05
```

O binário instalado pelo `install.sh` gerou a mesma pessoa que a biblioteca, a CLI, o servidor, a imagem e o `npx`, campo a campo.

Medido em 2026-10-08, num macOS arm64 (máquina compartilhada, com variação):

| Medida          | Binário | CLI no Node 22.22.3 |
| --------------- | ------- | ------------------- |
| Partida         | 17 ms   | 0,04 a 0,048 s      |
| 100 000 pessoas | 1,32 s  | 1,8 a 2,1 s         |
