---
title: jsdom
description: O navegador.iife.js no jsdom (num script ou no ambiente jsdom do Vitest e do Jest), com o shim de layout que ele exige e o erro sem ele.
sidebar_position: 5
---

O motor roda no jsdom, para testar um formulário sem abrir navegador. Mas o jsdom não calcula layout, e o motor só preenche campo visível. Por isso ele precisa de um shim de layout.

## Sem o shim: `TypeError`

O motor confere a visibilidade com `checkVisibility`, que o jsdom não tem. Sem o shim, a chamada rejeita a Promise:

```text
TypeError: el.checkVisibility is not a function
```

## O shim de layout {#shim-de-layout}

São duas partes, as duas no protótipo de `Element` da janela do jsdom:

1. `checkVisibility` devolvendo `true`;
2. `getBoundingClientRect` devolvendo medidas maiores que 2 px (o motor pula campo menor que isso).

```js
window.Element.prototype.checkVisibility = () => true
window.Element.prototype.getBoundingClientRect = () => ({
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 200,
  bottom: 24,
  width: 200,
  height: 24,
})
```

O modelo que o próprio core usa nos testes dele está em [`src/navegador/layout-teste.ts`](https://github.com/PiluVitu/Botai/blob/main/packages/core/src/navegador/layout-teste.ts). Esse arquivo não vai no pacote do npm.

:::danger

Com o shim, todo campo parece visível ao motor. Um teste no jsdom não cobre as regras de visibilidade: elas só se testam num navegador.

:::

## Num script, com o `JSDOM`

```js
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { gerarPessoa } from '@pilutech/botai-core'

const TEXTO_DO_IIFE = readFileSync(
  createRequire(import.meta.url).resolve(
    '@pilutech/botai-core/navegador.iife.js',
  ),
  'utf8',
)

const { window } = new JSDOM(
  `<form>
    <label>Nome completo <input name="nome"></label>
    <label>CPF <input name="cpf"></label>
    <label>E-mail <input type="email" name="email"></label>
    <label>Cor favorita <input name="cor"></label>
  </form>`,
  { runScripts: 'outside-only' },
)

window.Element.prototype.checkVisibility = () => true
window.Element.prototype.getBoundingClientRect = () => ({
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 200,
  bottom: 24,
  width: 200,
  height: 24,
})

window.eval(TEXTO_DO_IIFE)

const hoje = '2026-10-08'
const pessoa = gerarPessoa({ semente: 'jsdom', hoje })
const r = await window.__botaiNavegador.preencher(
  window.document,
  pessoa,
  hoje,
  {
    segundaPassada: false,
  },
)
console.log(
  r.preenchidos.map((l) => l.rotulo),
  r.naoReconhecidos.map((l) => l.rotulo),
)
console.log(window.document.querySelector('[name=cpf]').value === pessoa.cpf)
```

```text
[ 'Nome completo', 'CPF', 'E-mail' ] [ 'Cor favorita' ]
true
```

- `runScripts: 'outside-only'` dá ao `window` o `eval`, que instala o motor **na janela do jsdom**. O motor e o `document` precisam ser da mesma janela ([a armadilha da janela](./iframes-e-janelas.md#armadilha-da-janela)).
- No jsdom 30.1.2, com o shim, o cadastro realista deu o mesmo do navegador: 21 preenchidos, 2 não reconhecidos e 0 recusados.

## No Vitest ou no Jest

No ambiente `jsdom` do runner, o `window` e o `document` já existem. O exemplo é do Vitest; no Jest com `testEnvironment: 'jsdom'`, o shim e o `window.eval` são os mesmos:

```js
// @vitest-environment jsdom
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { gerarPessoa } from '@pilutech/botai-core'

const TEXTO_DO_IIFE = readFileSync(
  createRequire(import.meta.url).resolve(
    '@pilutech/botai-core/navegador.iife.js',
  ),
  'utf8',
)

beforeAll(() => {
  Element.prototype.checkVisibility = () => true
  Element.prototype.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 200,
    bottom: 24,
    width: 200,
    height: 24,
  })
  window.eval(TEXTO_DO_IIFE)
})

test('preenche o cadastro', async () => {
  document.body.innerHTML = `
    <label>Nome completo <input name="nome"></label>
    <label>CPF <input name="cpf"></label>`
  const hoje = '2026-10-08'
  const pessoa = gerarPessoa({ semente: 'cadastro', hoje })
  const r = await window.__botaiNavegador.preencher(document, pessoa, hoje, {
    segundaPassada: false,
  })
  expect(r.preenchidos).toHaveLength(2)
  expect(document.querySelector('[name=cpf]').value).toBe(pessoa.cpf)
})
```

Use `segundaPassada: false` no jsdom: não há busca de CEP para esperar, e a chamada resolve logo.
