---
title: Cypress
description: Receita para preencher formulários no Cypress, avaliando o navegador.iife.js na janela do app com win.eval. Não testada; a armadilha da janela foi provada.
sidebar_position: 3
---

:::caution[Não testado]

Ninguém rodou esta receita com o Cypress. O que foi provado em volta: o motor preencheu um cadastro realista com 21 preenchidos, 2 não reconhecidos e 0 recusados no Playwright cru e pelo CDP puro; a pessoa vem igual da CLI; e a armadilha descrita abaixo (o motor de uma janela sobre o `document` de outra) dá 0 preenchidos, sem erro.

:::

## A armadilha: duas janelas

No Cypress, o spec roda numa janela e o app roda em outra (um iframe do runner). O motor só reconhece os campos da janela em que foi instalado.

:::danger

Importar o motor no spec (`import ... from '@pilutech/botai-core/navegador'`) não funciona: o motor fica na janela do spec, e chamado com o `document` do app termina **sem erro e com 0 preenchidos**. Avalie o `navegador.iife.js` na janela do app, com `win.eval`.

:::

Veja a prova em [Iframes e janelas](../navegador/iframes-e-janelas.md#armadilha-da-janela).

## A receita

Instale o pacote no projeto dos testes:

```bash
npm i -D @pilutech/botai-core
```

O spec pega a pessoa da CLI com `cy.exec`, lê o texto do motor com `cy.readFile` e o avalia na janela do app que `cy.window()` entrega:

```js
const hoje = '2026-10-08'

it('preenche o cadastro com o Botaí', () => {
  cy.exec(`npx botai pessoa --semente cadastro --hoje ${hoje}`).then(
    ({ stdout }) => {
      const { pessoa } = JSON.parse(stdout)

      cy.readFile(
        'node_modules/@pilutech/botai-core/dist/navegador.iife.js',
      ).then((motor) => {
        cy.visit('/cadastro')
        cy.window()
          .then((win) => {
            win.eval(motor)
            return win.__botaiNavegador.preencher(win.document, pessoa, hoje, {
              segundaPassada: true,
            })
          })
          .then((resultado) => {
            expect(resultado.naoReconhecidos).to.deep.equal([])
          })
      })
    },
  )
})
```

- O `npx botai` usa o `botai` do pacote instalado no projeto, na versão do `package.json`.
- A pessoa também pode vir de um `cy.task` que chame `gerarPessoa` no Node.
- `{ segundaPassada: true }` faz a Promise esperar cerca de 1 s, para regravar o que uma busca de CEP sobrescreveu ([a 2ª passada](../navegador/iife.md#segunda-passada)).
- O resultado é `{ preenchidos, naoReconhecidos, recusados, contentType, iframesDeFora }`: veja [a API](../navegador/iife.md#api).

## Reproduzir a pessoa

A semente e o `hoje` fixos recriam a mesma pessoa fora do Cypress:

```bash testar
botai pessoa --semente cadastro --hoje 2026-10-08
```
