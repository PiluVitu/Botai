---
title: Opções do fixture
description: As quatro opções do fixture (botaiSemente, botaiHoje, botaiUf e botaiDominioEmail), por test.use ou pelo playwright.config.
sidebar_position: 4
---

## As quatro opções

| Opção               | Sem a opção                             | O que muda                                                                                                  |
| ------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `botaiSemente`      | `projeto › arquivo › describe › título` | a pessoa inteira                                                                                            |
| `botaiHoje`         | a data de hoje em São Paulo             | a data de nascimento e a validade do cartão; a idade se mantém                                              |
| `botaiUf`           | a UF sai da semente                     | o endereço, o DDD do celular, o título de eleitor e o CPF (este só se a nova UF for de outra região fiscal) |
| `botaiDominioEmail` | `tuamaeaquelaursa.com`                  | o `email.endereco`; o `email.caixaUrl` vira `null`                                                          |

- **`botaiSemente`:** um inteiro seguro (negativo vale) ou um texto de 1 a 256 caracteres, sem caractere de controle. `42` e `'42'` dão a mesma pessoa.
- **`botaiHoje`:** `AAAA-MM-DD`. Use datas reais.
- **`botaiUf`:** uma das 27 siglas.
- **`botaiDominioEmail`:** um domínio seu, para quando a caixa pública não serve.

## No arquivo de teste

Com `test.use`, no topo do arquivo ou dentro de um `test.describe`:

```ts
import { test } from '@pilutech/botai-playwright'

test.use({
  botaiSemente: 42,
  botaiHoje: '2026-10-05',
  botaiUf: 'PI',
  botaiDominioEmail: 'exemplo.com.br',
})
```

A CLI gera a mesma pessoa com as mesmas opções:

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05 --uf PI --dominio-email exemplo.com.br
```

Ela mora em Teresina/PI, tem o CPF `634.132.403-07` e o e-mail `marcio-rodrigues-0337@exemplo.com.br`, com `caixaUrl` `null`.

## No playwright.config

As opções também entram no `use` do projeto, ou no `use` geral. Passe o tipo `OpcoesBotai` ao `defineConfig`: sem ele, o TypeScript recusa `botaiHoje` no `use`.

```ts
import { defineConfig, devices } from '@playwright/test'
import type { OpcoesBotai } from '@pilutech/botai-playwright'

export default defineConfig<OpcoesBotai>({
  use: { botaiHoje: '2026-10-05' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
})
```

## A mesma pessoa em todos os navegadores

Por padrão, cada navegador recebe uma pessoa diferente, porque o nome do projeto entra na semente. Para a mesma pessoa em todos, fixe a semente no arquivo ou no `describe`:

```ts
test.use({ botaiSemente: 'cadastro' })
```

No `use` do `playwright.config`, uma semente fixa vale para todos os testes do projeto: todos recebem a mesma pessoa.

## Erro no botaiHoje

Um `botaiHoje` fora do formato falha no setup do teste, antes de ele começar:

```text
botaiHoje: esperado AAAA-MM-DD, recebido "05/10/2026"
```

## O que cada opção muda

Com a semente 42 e o hoje `2026-10-05`, o CPF é `634.132.403-07`. Com `botaiUf: 'PI'`, ele continua igual, porque o MA (a UF sorteada) e o PI são da mesma região fiscal, a 3. Com `botaiUf: 'RS'`, vira `634.132.400-64`. Nome, nascimento, e-mail, senha, empresa e cartão não mudam com a UF, e o RG continua SSP/SP.

Os detalhes estão em [a pessoa](../conceitos/a-pessoa.md) e em [semente e hoje](../conceitos/semente-e-hoje.md).
