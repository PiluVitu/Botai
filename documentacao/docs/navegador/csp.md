---
title: CSP estrita
description: O que lança e o que funciona para injetar o navegador.iife.js numa página com Content-Security-Policy estrita.
sidebar_position: 3
---

Uma página com CSP estrita (`script-src 'self'`, sem `'unsafe-inline'`) bloqueia script inline. O motor roda nela, desde que entre pelo caminho certo.

| Como injetar                             | Sob CSP estrita                  |
| ---------------------------------------- | -------------------------------- |
| `page.addScriptTag({ path })`            | **lança**: vira um script inline |
| `page.evaluate(<texto do IIFE>)`         | funciona                         |
| `page.addInitScript({ path })`           | funciona                         |
| `<script src>` servido da própria origem | funciona                         |

Os nomes são os do Playwright, onde o comportamento foi provado. O fixture `@pilutech/botai-playwright` usa o `evaluate` de texto em cada frame e nunca o `addScriptTag`: ele passou com `default-src 'none'; script-src 'self'`.

## O que lança

O `addScriptTag({ path })` lê o arquivo e o põe na página como script inline. A CSP bloqueia, e o Playwright lança:

```text
page.addScriptTag: Executing inline script violates the following Content Security Policy directive 'script-src 'self''. Either the 'unsafe-inline' keyword, a hash ('sha256-L7FbwKW/iwV9rKZ6X+Rp7nIHpiNGKfRodZLsKaflgw0='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
```

## O que funciona

### O texto do arquivo, por `evaluate` {#texto-por-evaluate}

É o caminho que serve com ou sem CSP. Leia o arquivo uma vez e avalie o texto na página:

```js
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'

const TEXTO_DO_IIFE = readFileSync(
  createRequire(import.meta.url).resolve(
    '@pilutech/botai-core/navegador.iife.js',
  ),
  'utf8',
)

await page.goto('http://localhost:3000/cadastro')
await page.evaluate(TEXTO_DO_IIFE)
const resultado = await page.evaluate(
  ({ pessoa, hoje }) =>
    window.__botaiNavegador.preencher(document, pessoa, hoje, {
      segundaPassada: true,
    }),
  { pessoa, hoje },
)
```

### Antes da página, por `addInitScript`

O script entra em toda página que o `page` abrir depois, antes dos scripts do site:

```js
await page.addInitScript({ path: IIFE })
await page.goto('http://localhost:3000/cadastro')
```

### Um `<script src>` da própria origem

Se o seu app serve o arquivo (copiado para a pasta pública, por exemplo), a CSP `script-src 'self'` o aceita:

```js
await page.goto('http://localhost:3000/cadastro')
await page.addScriptTag({ url: '/botai.js' })
```

Nos três casos, a chamada depois é a mesma: `window.__botaiNavegador.preencher(document, pessoa, hoje, opcoes)`. Veja [O navegador.iife.js](./iife.md).

Para outras ferramentas, os caminhos equivalentes estão nas receitas de [Integrações](../integracoes/puppeteer.md), sem teste.
