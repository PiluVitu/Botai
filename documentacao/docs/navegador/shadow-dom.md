---
title: Shadow DOM
description: Shadow root aberta entra sozinha no motor. A fechada só pela API ESM de baixo nível, com um adaptador que o ambiente forneça.
sidebar_position: 6
---

## Shadow root aberta

O motor entra nas shadow roots abertas sozinho, no `navegador.iife.js`, no `/navegador` e no fixture do Playwright. O seletor de um campo dentro de uma shadow root marca a fronteira com `›`.

Numa página com um campo no documento, um numa shadow root aberta e um numa fechada:

```json
{
  "preenchidos": [
    {
      "idx": 1,
      "rotulo": "Nome completo",
      "seletor": "input[name=\"nome\"]"
    },
    {
      "idx": 2,
      "rotulo": "CPF",
      "seletor": "div › input[name=\"cpf\"]"
    }
  ],
  "naoReconhecidos": [],
  "recusados": []
}
```

O campo da shadow root fechada (um e-mail) não aparece em nenhuma das três listas: o motor não o enxerga.

## Shadow root fechada

| Porta                            | Shadow root fechada                        |
| -------------------------------- | ------------------------------------------ |
| Extensão                         | preenche                                   |
| Fixture do Playwright            | não preenche                               |
| `navegador.iife.js`              | não preenche (não aceita adaptador)        |
| `/navegador`, API de baixo nível | só com um adaptador que o ambiente forneça |

:::note[Documentado]

A API ESM de baixo nível aceita um adaptador `raizSombra`, uma função que recebe um elemento e devolve a shadow root dele (aberta ou fechada) ou `null`:

```js
import {
  criarRegistro,
  preencherDocumento,
  SEM_CONTORNOS,
} from '@pilutech/botai-core/navegador'

const resultado = preencherDocumento({
  raiz: document,
  pessoa,
  hojeISO: hoje,
  registro: criarRegistro(),
  contornos: SEM_CONTORNOS,
  raizSombra,
})
```

Isso vem do código e do README do core; ninguém rodou com uma raiz fechada. O `raizSombra` precisa vir de um ambiente que enxergue raízes fechadas, como a extensão faz. O `navegador.iife.js` não aceita `raizSombra`.

:::
