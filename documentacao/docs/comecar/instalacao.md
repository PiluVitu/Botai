---
title: Instalação
description: Como instalar cada porta do Botaí com a versão exata, pelo npx, pelo npm, pela imagem Docker, pelo install.sh, pelo download manual e pelas lojas.
sidebar_position: 3
---

Cada porta se instala de um jeito. Fixe sempre a versão exata: mudar a pessoa de uma semente é versão major, e na série 0.x é a minor (veja [Versões e dourados](../conceitos/versoes-e-dourados.md)).

## Sem instalar: npx {#npx}

Onde houver Node, o `npx` baixa e roda a CLI:

```bash
npx -y @pilutech/botai-core@0.5.0 pessoa --semente 42 --hoje 2026-10-05
```

O pacote publicado gera exatamente o mesmo que o build local. Foram testados o Node 22 e o 24; o pacote não declara `engines`.

## Biblioteca {#biblioteca}

No projeto JS ou TS:

```bash
npm install --save-dev --save-exact @pilutech/botai-core@0.5.0
```

O pacote é ESM, não tem nenhuma dependência e roda no Node, no Bun, no Deno e no navegador (com bundler). Os runtimes e os subpaths estão em [Instalar e runtimes](../biblioteca/instalar-e-runtimes.md).

## Fixture do Playwright {#playwright}

```bash
npm install --save-dev --save-exact @pilutech/botai-playwright@0.2.0
```

- Só ESM, Node `^20.19.0 || >=22.12.0` e o `@playwright/test` ^1.59.1 como peer (provado na 1.63.0).
- O projeto precisa de uma cópia só do `@playwright/test`, e o E2E precisa dos navegadores da versão exata do Playwright (`playwright install`).
- O 0.2.0 depende do core 0.5.0 exato.

Detalhes em [Instalar o fixture](../playwright/instalar.md).

## Imagem Docker {#imagem}

```bash
docker pull ghcr.io/piluvitu/botai:0.5.0
```

A imagem é multiarquitetura (linux/amd64 e linux/arm64) e roda sem root. Não existe tag de minor (`:0.5`): use a tag da versão exata. Sem argumentos, ela sobe o servidor na porta 8790; com argumentos, roda a CLI:

```bash
docker run --rm ghcr.io/piluvitu/botai:0.5.0 pessoa --semente 42 --hoje 2026-10-05
```

Mais em [A imagem](../docker/imagem.md).

## Binário {#binario}

Os binários rodam sem Node, em 6 alvos: darwin-arm64, darwin-x64, linux-arm64, linux-x64, windows-arm64.exe e windows-x64.exe. No macOS e no Linux, o `install.sh` detecta o sistema e a arquitetura, confere o SHA256 e instala de forma atômica em `~/.local/bin/botai`:

```bash
curl -fsSL https://github.com/PiluVitu/Botai/releases/latest/download/install.sh | sh
```

Para fixar a versão, passe `BOTAI_VERSAO`:

```bash
curl -fsSL https://github.com/PiluVitu/Botai/releases/latest/download/install.sh | BOTAI_VERSAO=0.5.0 sh
```

| Variável         | O que muda                                      |
| ---------------- | ----------------------------------------------- |
| `BOTAI_VERSAO`   | a versão instalada, como `0.5.0`                |
| `BOTAI_DESTINO`  | a pasta de destino, em vez de `~/.local/bin`    |
| `BOTAI_RELEASES` | a raiz dos releases de onde o binário é baixado |

Com uma versão que não existe, o script sai com 1 e não instala nada. Se o destino não está no PATH, ele avisa. O script depende de o release do core estar marcado como Latest e não serve no Windows: lá, baixe o `.exe` (próxima seção).

Confira a instalação:

```bash testar
botai --versao
```

```text
0.5.0
```

:::note[Documentado]

Lido no `install.sh`, sem rodar: num terminal sob Rosetta, ele instala o binário arm64; no Linux com musl (Alpine) e no Windows, recusa com mensagem. No Alpine, use a imagem ou o npm. O `install.sh` foi rodado no macOS arm64; os binários de Linux e Windows passam pela fumaça do CI do projeto.

:::

Mais em [O install.sh](../binarios/install-sh.md).

## Download manual {#download-manual}

Os binários, o `install.sh` e o `SHA256SUMS` ficam no GitHub Release `core-v0.5.0`:

```bash
gh release download core-v0.5.0 --repo PiluVitu/Botai
shasum -a 256 -c --ignore-missing SHA256SUMS
```

Cada arquivo conferido sai com `OK`, como `botai-darwin-arm64: OK`.

:::note[Documentado]

Segundo o README do core: os binários não têm assinatura de desenvolvedor identificado. O macOS tem só a assinatura ad-hoc, e no Windows o SmartScreen avisa antes de rodar.

:::

Mais em [Download e verificação](../binarios/download-e-verificacao.md).

## Extensão {#extensao}

| Navegador            | Onde instalar                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| Chrome 123+          | [Chrome Web Store](https://chromewebstore.google.com/detail/bota%C3%AD/mblmjomopainbcdjipkdmioglamdinnc) |
| Edge (Chromium 123+) | a mesma página da Chrome Web Store                                                                       |
| Firefox 153.0+       | [Firefox Add-ons](https://addons.mozilla.org/pt-BR/firefox/addon/bota%C3%AD/)                            |

As duas lojas estão no ar com a versão 1.2.0. O Opera 109+ está em revisão na loja. Safari e Firefox para Android estão fora.

Mais em [Instalar a extensão](../extensao/instalar.md).

## Os exemplos desta documentação {#os-exemplos}

Os exemplos escrevem `botai`, como fica depois do `install.sh`. Com outra porta, troque o começo do comando:

| Porta  | Em vez de `botai pessoa …`                              |
| ------ | ------------------------------------------------------- |
| npx    | `npx -y @pilutech/botai-core@0.5.0 pessoa …`            |
| imagem | `docker run --rm ghcr.io/piluvitu/botai:0.5.0 pessoa …` |

O servidor é a exceção. Pela imagem, suba-o sem argumentos e publique a porta: `docker run --rm -p 8790:8790 ghcr.io/piluvitu/botai:0.5.0`. Ele já escuta em `0.0.0.0:8790` dentro do contêiner.
