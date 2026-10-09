---
title: WebdriverIO
description: Receita para preencher formulários no WebdriverIO com browser.execute, o navegador.iife.js e uma pessoa da biblioteca. Não testada.
sidebar_position: 4
---

:::caution[Não testado]

Ninguém rodou esta receita com o WebdriverIO. O que foi provado em volta: o motor preencheu um cadastro realista com 21 preenchidos, 2 não reconhecidos e 0 recusados no Playwright cru (Chromium, Firefox, WebKit, Chrome e Edge) e pelo CDP puro; e a pessoa vem igual da biblioteca, da CLI e do servidor.

:::

## A receita

O WebdriverIO roda no Node, então a pessoa vem da biblioteca. O motor entra com `browser.execute(<texto do IIFE>)`, e a chamada a `preencher` recebe a pessoa e o `hoje` como argumentos serializáveis.

```bash
npm i -D @pilutech/botai-core
```

```js
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { gerarPessoa } from '@pilutech/botai-core'

const TEXTO_DO_IIFE = readFileSync(
  createRequire(import.meta.url).resolve(
    '@pilutech/botai-core/navegador.iife.js',
  ),
  'utf8',
)

describe('cadastro', () => {
  it('preenche com o Botaí', async () => {
    const hoje = '2026-10-08'
    const pessoa = gerarPessoa({ semente: 'cadastro', hoje })

    await browser.url('/cadastro')
    await browser.execute(TEXTO_DO_IIFE)
    const resultado = await browser.execute(
      (p, h) =>
        window.__botaiNavegador.preencher(document, p, h, {
          segundaPassada: true,
        }),
      pessoa,
      hoje,
    )

    expect(resultado.naoReconhecidos).toEqual([])
  })
})
```

- A função passada ao segundo `browser.execute` roda na página: ela não enxerga as variáveis do teste, só os argumentos. Por isso a pessoa e o `hoje` vão como argumentos.
- `{ segundaPassada: true }` faz a Promise esperar cerca de 1 s, para regravar o que uma busca de CEP sobrescreveu ([a 2ª passada](../navegador/iife.md#segunda-passada)).
- O resultado é `{ preenchidos, naoReconhecidos, recusados, contentType, iframesDeFora }`: veja [a API](../navegador/iife.md#api).

## Iframes

Uma chamada vê um documento só. Para um formulário dentro de um iframe, troque para o frame (`browser.switchToFrame`), injete o motor ali e chame de novo. Veja [Iframes e janelas](../navegador/iframes-e-janelas.md).

## Reproduzir a pessoa

A semente e o `hoje` fixos recriam a mesma pessoa fora do WebdriverIO:

```bash testar
botai pessoa --semente cadastro --hoje 2026-10-08
```
