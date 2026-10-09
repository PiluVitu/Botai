---
title: Iframes e janelas
description: Uma chamada do motor vê um documento só. Injete e chame em cada frame, e evite a armadilha do motor de outra janela, que dá 0 preenchidos sem erro.
sidebar_position: 4
---

O `navegador.iife.js` preenche um documento por chamada. Os iframes da página, da mesma origem ou de outra, ficam de fora da chamada no documento principal.

## Um documento por chamada

O resultado traz `iframesDeFora`: quantos iframes de **outra origem** o documento tem. Os da mesma origem não entram na conta.

:::danger

`iframesDeFora: 0` não quer dizer "preenchi tudo". Um iframe da mesma origem também fica de fora da chamada, e não aparece nessa contagem.

:::

Para preencher os frames, injete o motor e chame em cada um. No Playwright, `page.frames()` dá todos, inclusive os de outra origem:

```js
for (const frame of page.frames()) {
  await frame.evaluate(TEXTO_DO_IIFE)
  const r = await frame.evaluate(
    ({ pessoa, hoje }) =>
      window.__botaiNavegador.preencher(document, pessoa, hoje, {
        segundaPassada: false,
      }),
    { pessoa, hoje },
  )
  console.log(frame.url(), r.preenchidos.length)
}
```

Numa página com um campo próprio, um iframe da mesma origem e um de outra origem, cada um com um campo:

```text
http://localhost:3000/checkout 1
http://localhost:3000/filho 1
http://outro.localhost:4000/filho 1
```

`TEXTO_DO_IIFE` é o conteúdo do arquivo ([como ler](./csp.md#texto-por-evaluate)). Injetar o texto com `evaluate` também funciona sob CSP estrita.

O fixture `@pilutech/botai-playwright` faz isso sozinho: `botai.preencher(page)` percorre todos os frames em paralelo, de qualquer origem, inclusive `srcdoc` e páginas abertas depois do fixture. Veja [Preencher](../playwright/preencher.md).

Na extensão é diferente: ela soma os iframes da mesma origem e deixa de fora os de outro domínio (Stripe Elements, Pagar.me), por causa da permissão `activeTab`.

## A armadilha da janela {#armadilha-da-janela}

O motor só reconhece os campos da janela em que foi instalado.

:::danger

Instalado numa janela e chamado com o `document` de outra (um iframe, por exemplo), o motor termina sem erro e com **0 preenchidos**. Instale o motor na janela do documento que você quer preencher.

:::

O jeito certo é avaliar o texto do IIFE na própria janela do documento e chamar o `__botaiNavegador` dela:

```js
const resultado = await page.evaluate(
  async ({ pessoa, hoje, TEXTO_DO_IIFE }) => {
    const win = document.getElementById('app').contentWindow

    const errado = await window.__botaiNavegador.preencher(
      win.document,
      pessoa,
      hoje,
      {
        segundaPassada: false,
      },
    )

    win.eval(TEXTO_DO_IIFE)
    const certo = await win.__botaiNavegador.preencher(
      win.document,
      pessoa,
      hoje,
      {
        segundaPassada: false,
      },
    )

    return {
      errado: errado.preenchidos.length,
      certo: certo.preenchidos.length,
    }
  },
  { pessoa, hoje, TEXTO_DO_IIFE },
)
console.log(resultado)
```

Com o motor já instalado na página e um iframe `#app` da mesma origem com um campo de CPF:

```text
{ errado: 0, certo: 1 }
```

O caso típico é o Cypress: o spec roda numa janela, e o app, em outra. Importar o motor no spec cai nessa armadilha; avaliar o IIFE na janela do app (`cy.window()` e `win.eval`) não. Veja [Cypress](../integracoes/cypress.md).
