---
title: Puppeteer
description: Receita para preencher formulários no Puppeteer com o navegador.iife.js e uma pessoa da biblioteca. Não testada; o protocolo dele foi provado.
sidebar_position: 1
---

:::caution[Não testado]

Ninguém rodou esta receita com o Puppeteer. O que foi provado: o mesmo motor preencheu um cadastro realista com 21 preenchidos, 2 não reconhecidos e 0 recusados pelo CDP puro, o protocolo que o Puppeteer usa (um `Runtime.evaluate` com o texto do IIFE e outro com a chamada, com `awaitPromise: true` e `returnByValue: true`), no Chrome. Também foi provado no Playwright cru, nos três navegadores dele.

:::

## A receita

O Puppeteer roda no Node, então a pessoa vem direto da biblioteca. O motor entra como texto, com `page.evaluate`, e a chamada a `preencher` recebe a pessoa e o `hoje` como argumentos.

```bash
npm i -D puppeteer @pilutech/botai-core
```

```js
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import puppeteer from 'puppeteer'
import { gerarPessoa } from '@pilutech/botai-core'

const TEXTO_DO_IIFE = readFileSync(
  createRequire(import.meta.url).resolve(
    '@pilutech/botai-core/navegador.iife.js',
  ),
  'utf8',
)

const hoje = '2026-10-08'
const pessoa = gerarPessoa({ semente: 'cadastro', hoje })

const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.goto('http://localhost:3000/cadastro')

await page.evaluate(TEXTO_DO_IIFE)
const resultado = await page.evaluate(
  (p, h) =>
    window.__botaiNavegador.preencher(document, p, h, { segundaPassada: true }),
  pessoa,
  hoje,
)

console.log(
  resultado.preenchidos.length,
  resultado.naoReconhecidos,
  resultado.recusados,
)
await browser.close()
```

- Fora de uma página com CSP estrita, `page.addScriptTag({ path })` com o caminho do arquivo também serve. No Playwright, esse caminho **lança** sob CSP estrita, e o `evaluate` de texto não: veja [CSP estrita](../navegador/csp.md).
- `{ segundaPassada: true }` espera cerca de 1 s e regrava o que uma busca de CEP sobrescreveu. A Promise só resolve depois. Veja [a 2ª passada](../navegador/iife.md#segunda-passada).
- O resultado é `{ preenchidos, naoReconhecidos, recusados, contentType, iframesDeFora }`, igual ao das outras ferramentas: veja [a API](../navegador/iife.md#api).

## Iframes

Uma chamada vê um documento só. Para um formulário dentro de um iframe, injete o motor e chame dentro do frame (`page.frames()` e `frame.evaluate`), e não no documento principal. Veja [Iframes e janelas](../navegador/iframes-e-janelas.md).

## Reproduzir a pessoa

A semente e o `hoje` fixos recriam a mesma pessoa em qualquer porta. Para ver no terminal a pessoa que o teste usou:

```bash testar
botai pessoa --semente cadastro --hoje 2026-10-08
```
