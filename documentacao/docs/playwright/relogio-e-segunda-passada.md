---
title: Relógio falso e 2ª passada
sidebar_label: Relógio e 2ª passada
description: Como a 2ª passada do botai.preencher convive com o page.clock do Playwright, o que a segura e as duas saídas.
sidebar_position: 6
---

## A 2ª passada

Sites que buscam o CEP sobrescrevem rua, bairro ou complemento logo depois do preenchimento. Por isso, `botai.preencher` espera cerca de 1 s e regrava o que mudou desde a leitura. A Promise só resolve depois dessa 2ª passada.

Ela vem ligada. Ela só regrava o que o Botaí já tinha escrito: um campo que só habilita depois da busca de CEP continua vazio.

## Com o relógio falso

O `page.clock` do Playwright controla os timers da página, inclusive o da 2ª passada:

| Relógio                                                          | A 2ª passada                                             |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
| só `page.clock.install()`                                        | não atrapalha: a Promise resolve em cerca de 1 s         |
| parado: `page.clock.install({ time })` + `page.clock.pauseAt(…)` | fica presa: a Promise não resolve até o timeout do teste |

:::info

O README do pacote 0.1.0 diz que `page.clock.install()` segura a 2ª passada. Não segura: quem segura é o relógio parado.

:::

Com o relógio parado, escolha uma das duas saídas abaixo.

## Saída 1: pular a 2ª passada

```ts
import { test } from '@pilutech/botai-playwright'

test('cadastro com o relógio parado', async ({ page, botai }) => {
  await page.clock.install({ time: new Date('2026-10-05T08:00:00') })
  await page.goto('/cadastro')
  await page.clock.pauseAt(new Date('2026-10-05T10:00:00'))

  const r = await botai.preencher(page, { segundaPassada: false })
})
```

Sem a 2ª passada, uma busca de CEP do site pode sobrescrever rua, bairro ou complemento, e o teste vê o valor do site.

## Saída 2: andar o relógio

```ts
import { test, expect } from '@pilutech/botai-playwright'

test('cadastro com o relógio parado', async ({ page, botai }) => {
  await page.clock.install({ time: new Date('2026-10-05T08:00:00') })
  await page.goto('/cadastro')
  await page.clock.pauseAt(new Date('2026-10-05T10:00:00'))

  const preenchimento = botai.preencher(page)
  await expect(page.getByLabel('CEP')).not.toHaveValue('')
  await page.clock.runFor(1500)
  const r = await preenchimento
})
```

Espere a 1ª passada escrever antes do `runFor`: o timer da 2ª passada só existe depois dela. Um `runFor` chamado logo depois do `botai.preencher`, sem a espera, pode correr antes do timer, e a Promise fica presa do mesmo jeito.

O `runFor(1500)` também dispara os timers do próprio site que vencem nesse intervalo, como o de uma busca de CEP.

O exemplo espera um campo da página principal. Se a página tem campos em iframes, a saída 1 é a mais simples.
