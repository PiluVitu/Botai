---
title: Opções do fixture
description: As opções do fixture (botaiSemente, botaiHoje, botaiUf, botaiDominioEmail e botaiCartao), por test.use ou pelo playwright.config.
sidebar_position: 4
---

## As opções

| Opção               | Sem a opção                             | O que muda                                                                                                  |
| ------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `botaiSemente`      | `projeto › arquivo › describe › título` | a pessoa inteira                                                                                            |
| `botaiHoje`         | a data de hoje em São Paulo             | a data de nascimento e a validade do cartão; a idade se mantém                                              |
| `botaiUf`           | a UF sai da semente                     | o endereço, o DDD do celular, o título de eleitor e o CPF (este só se a nova UF for de outra região fiscal) |
| `botaiDominioEmail` | `tuamaeaquelaursa.com`                  | o `email.endereco`; o `email.caixaUrl` vira `null`                                                          |
| `botaiCartao`       | `stripe` e `aprovado`                   | só o cartão: o número, a bandeira, o `provedor` e o `cenario`                                               |

- **`botaiSemente`:** um inteiro seguro (negativo vale) ou um texto de 1 a 256 caracteres, sem caractere de controle. `42` e `'42'` dão a mesma pessoa.
- **`botaiHoje`:** `AAAA-MM-DD`. Use datas reais.
- **`botaiUf`:** uma das 27 siglas.
- **`botaiDominioEmail`:** um domínio seu, para quando a caixa pública não serve.
- **`botaiCartao`:** `{ provedor, cenario }`, com `stripe` ou `pagarme` e um cenário do provedor. Desde a versão 0.2.0.

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

## botaiCartao {#botaicartao}

O cartão de teste da pessoa sai do provedor e do cenário. Para testar um checkout que recusa o pagamento:

```ts
import { expect, test } from '@pilutech/botai-playwright'

test.describe('pagamento recusado', () => {
  test.use({ botaiCartao: { provedor: 'pagarme', cenario: 'recusado' } })

  test('mostra o erro do cartão', async ({ page, botai }) => {
    await page.goto('/checkout')
    await botai.preencher(page)
    await expect(page.getByLabel('Número do cartão')).toHaveValue(
      '4000 0000 0000 0028',
    )
  })
})
```

- O cenário muda só o cartão: com a mesma semente, o resto da pessoa é o mesmo em qualquer cenário. Como a semente padrão inclui o título do `describe`, dois `describe` geram pessoas diferentes; para comparar cenários com a mesma pessoa, fixe o `botaiSemente`.
- O anexo `botai-pessoa.json` leva o `provedor` e o `cenario` no cartão. A CLI recria a pessoa com `--cartao` e `--cenario` ([Cartões de teste](../cli/cartoes.md)).
- Os provedores e os cenários estão em [Cartões de teste](../conceitos/cartoes-de-teste.md).

Um cenário que o provedor não tem falha no setup do teste:

```text
botaiCartao: cenário desconhecido "recusado-cvc" para o provedor pagarme (use aprovado, recusado, pendente, pendente-recusado, pendente-cancelado, chargeback)
```

## Erro no botaiHoje

Um `botaiHoje` fora do formato falha no setup do teste, antes de ele começar:

```text
botaiHoje: esperado AAAA-MM-DD, recebido "05/10/2026"
```

## O que cada opção muda

Com a semente 42 e o hoje `2026-10-05`, o CPF é `634.132.403-07`. Com `botaiUf: 'PI'`, ele continua igual, porque o MA (a UF sorteada) e o PI são da mesma região fiscal, a 3. Com `botaiUf: 'RS'`, vira `634.132.400-64`. Nome, nascimento, e-mail, senha, empresa e cartão não mudam com a UF, e o RG continua SSP/SP.

Os detalhes estão em [a pessoa](../conceitos/a-pessoa.md) e em [semente e hoje](../conceitos/semente-e-hoje.md).
