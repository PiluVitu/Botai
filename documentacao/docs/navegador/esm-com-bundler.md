---
title: ESM com bundler
description: O subpath /navegador com o gerador da raiz, o motor e a pessoa rodando inteiros na página, empacotados pelo seu bundler.
sidebar_position: 2
---

Com um bundler, o gerador e o motor rodam dentro da página: a pessoa nasce ali mesmo, sem vir de fora. Use quando o código que preenche é seu e vai empacotado (uma página de teste, uma ferramenta interna, um script de desenvolvimento).

```js
import { gerarPessoa } from '@pilutech/botai-core'
import { preencherNaPagina } from '@pilutech/botai-core/navegador'

const hoje = '2026-10-08'
const pessoa = gerarPessoa({ semente: 'cadastro', hoje })
const resultado = await preencherNaPagina(document, pessoa, hoje, {
  segundaPassada: false,
})
console.log(pessoa.cpf, resultado.preenchidos.length)
```

`preencherNaPagina(alvo, pessoa, hoje, opcoes)` recebe os mesmos parâmetros do `__botaiNavegador.preencher` do `navegador.iife.js` e devolve o mesmo resultado, com a mesma 2ª passada. Veja [a API](./iife.md#api).

## O que foi provado

O código acima, empacotado pelo esbuild e carregado num cadastro no Chromium, gerou na página o mesmo CPF que a CLI gera no Node com a mesma semente e o mesmo `hoje`:

```bash testar
botai pessoa --semente cadastro --hoje 2026-10-08 | grep '"cpf"'
```

```text
    "cpf": "598.815.568-56",
```

O bundle com o gerador e o motor deu 40 638 bytes minificado, 15 448 em gzip (medido em 2026-10-08, macOS arm64).

## IIFE ou ESM

|                      | `navegador.iife.js`                                       | `/navegador` com bundler           |
| -------------------- | --------------------------------------------------------- | ---------------------------------- |
| A pessoa             | vem de fora, como JSON                                    | nasce na página, com `gerarPessoa` |
| Como entra na página | a ferramenta injeta o texto do arquivo                    | vai no seu bundle                  |
| Para quem            | Playwright cru, Puppeteer, Selenium, Cypress, WebdriverIO | o seu próprio código empacotado    |

## A API de baixo nível

O subpath `/navegador` exporta também as peças que o `preencherNaPagina` monta: `preencherDocumento`, `criarRegistro`, `SEM_CONTORNOS` e as funções de DOM. O caso documentado para descer a esse nível é a shadow root fechada: veja [Shadow DOM](./shadow-dom.md).

O `/navegador` precisa de DOM: uma página, ou o jsdom com o shim de layout ([jsdom](./jsdom.md)).
