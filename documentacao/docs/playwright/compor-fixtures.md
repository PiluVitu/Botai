---
title: Compor com outros fixtures
description: Juntar o fixture botai aos fixtures do seu projeto com mergeTests ou estender um test que você já tem com fixturesBotai().
sidebar_position: 7
---

O seu projeto já tem um `test` com fixtures próprios? Há dois jeitos de somar o `botai` a ele. Nos dois, a semente padrão, as opções, as anotações e o anexo funcionam igual.

## mergeTests

Junte o `test` do pacote ao do projeto:

```ts
import { mergeTests } from '@playwright/test'
import { test as testBotai } from '@pilutech/botai-playwright'
import { test as testDoProjeto } from './fixtures'

export const test = mergeTests(testDoProjeto, testBotai)
export { expect } from '@playwright/test'
```

## fixturesBotai()

Estenda um `test` que você já tem. `fixturesBotai()` devolve o fixture `botai` e as quatro [opções](./opcoes.md); `FixturesBotai` é o tipo deles:

```ts
import { test as base } from '@playwright/test'
import { fixturesBotai, type FixturesBotai } from '@pilutech/botai-playwright'

export const test = base.extend<FixturesBotai>(fixturesBotai())
```

## Uma cópia só do Playwright

Os dois jeitos exigem uma cópia só do `@playwright/test` no projeto: o pacote o recebe como peer dependency. Veja [instalar o fixture](./instalar.md).

## playwright-bdd

:::note[Documentado]

O README do pacote cita o playwright-bdd como exemplo de `test` que você já tem e pode estender com `fixturesBotai()`. Ninguém rodou o Botaí com o playwright-bdd.

:::
