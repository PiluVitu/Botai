---
title: Download e verificação
description: Baixar à mão o binário do release core-v0.5.0, conferir o SHA256SUMS e rodar, inclusive no Windows, onde o install.sh não serve.
sidebar_position: 2
---

Cada versão do core tem um release no GitHub com seis binários sem Node, o `install.sh` e o `SHA256SUMS`. Esta página baixa e confere à mão. Para instalar com um comando, use o [install.sh](./install-sh.md).

## Os arquivos do release {#arquivos}

O release da versão atual é o [`core-v0.5.0`](https://github.com/PiluVitu/Botai/releases/tag/core-v0.5.0).

| Arquivo                   | Para                             |
| ------------------------- | -------------------------------- |
| `botai-darwin-arm64`      | macOS, Apple Silicon             |
| `botai-darwin-x64`        | macOS, Intel                     |
| `botai-linux-arm64`       | Linux, arm64                     |
| `botai-linux-x64`         | Linux, x64                       |
| `botai-windows-arm64.exe` | Windows, arm64                   |
| `botai-windows-x64.exe`   | Windows, x64                     |
| `install.sh`              | o instalador, para macOS e Linux |
| `SHA256SUMS`              | o SHA256 de cada binário         |

Os binários vão de 62,3 MB (`botai-darwin-arm64`) a 86,1 MB (`botai-windows-x64.exe`).

:::note[Documentado]

Só o `botai-darwin-arm64` foi rodado nas provas de 2026-10-08. Os outros cinco rodam na fumaça do CI do projeto, nos 6 alvos; ninguém os reproduziu fora dele.

:::

## Baixar

Com o GitHub CLI, os oito arquivos de uma vez:

```bash
gh release download core-v0.5.0 --repo PiluVitu/Botai
```

Ou baixe pelo navegador, na página do release, só o binário do seu sistema e o `SHA256SUMS`.

## Conferir o SHA256 {#conferir}

Com o binário e o `SHA256SUMS` na mesma pasta:

```bash
shasum -a 256 -c --ignore-missing SHA256SUMS
```

O `--ignore-missing` pula as linhas dos binários que você não baixou. Com só o binário do Mac Apple Silicon na pasta, a saída é:

```text
botai-darwin-arm64: OK
```

Se a linha do seu binário não disser `OK`, não o rode: baixe de novo.

## Rodar

No macOS e no Linux, dê permissão de execução e rode:

```bash
chmod +x botai-darwin-arm64
./botai-darwin-arm64 pessoa --semente 42 --hoje 2026-10-05
```

A saída é o mesmo envelope da CLI. Com o mesmo comando, a CLI dos exemplos desta documentação gera a mesma pessoa:

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05
```

O `botai-darwin-arm64` conferiu os 12 arquivos dourados, e a pessoa que ele gera, pela CLI e pelo `serve`, é a mesma das outras portas. Para usar o nome `botai`, mova o arquivo para uma pasta do `PATH` com esse nome, como o `install.sh` faz em `~/.local/bin`.

O servidor HTTP é o mesmo comando `serve` da CLI. Veja [`botai serve`](../servidor/botai-serve.md).

### Windows

O `install.sh` não serve no Windows: lá, baixe o `.exe`.

:::note[Documentado]

Os binários de Windows não foram rodados nas provas de 2026-10-08; eles rodam na fumaça do CI do projeto.

:::

No PowerShell, na pasta do download:

```text
.\botai-windows-x64.exe pessoa --semente 42 --hoje 2026-10-05
```

## Assinatura {#assinatura}

:::note[Documentado]

Segundo o [README do core](https://github.com/PiluVitu/Botai/tree/main/packages/core#readme), os binários não têm assinatura de desenvolvedor: no macOS, têm só a assinatura ad-hoc, e no Windows o SmartScreen avisa. O README explica como liberar a execução em cada sistema.

:::

## Sem binário

Não há binário para Linux com musl (Alpine). Lá, use a [imagem Docker](../docker/imagem.md) ou o `npx` (veja [Instalação](../comecar/instalacao.md)).

## Desempenho

Medido em 2026-10-08, num macOS arm64 (máquina compartilhada, com variação): o `botai-darwin-arm64` parte em 17 ms (a CLI no Node 22.22.3 leva de 0,04 a 0,048 s) e gera 100 000 pessoas em 1,32 s. Os outros números estão em [Números](../referencia/numeros.md).
