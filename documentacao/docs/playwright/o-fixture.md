---
title: O fixture botai
description: O que o fixture botai entrega a cada teste (a pessoa, a semente, o hoje e o preencher) e como a semente padrão é montada.
sidebar_position: 2
---

## Primeiro teste

Importe `test` e `expect` do pacote, no lugar do `@playwright/test`, e peça o fixture `botai`:

```ts
import { test, expect } from '@pilutech/botai-playwright'

test('cadastro', async ({ page, botai }) => {
  await page.goto('/cadastro')
  const r = await botai.preencher(page)
  expect(r.naoReconhecidos).toEqual([])
})
```

Já tem um `test` com fixtures do projeto? Junte os dois: veja [compor fixtures](./compor-fixtures.md).

## Os 4 membros

O fixture `botai` tem exatamente quatro membros:

| Membro                  | O que é                                                                |
| ----------------------- | ---------------------------------------------------------------------- |
| `botai.pessoa`          | a pessoa completa, para usar nas asserções                             |
| `botai.semente`         | a semente usada no teste                                               |
| `botai.hoje`            | o dia usado no teste, em `AAAA-MM-DD`                                  |
| `botai.preencher(alvo)` | preenche uma `Page` ou um `Locator` (veja [preencher](./preencher.md)) |

## A pessoa nas asserções

Compare com `botai.pessoa`, e não com um valor fixo:

```ts
test('e-mail', async ({ page, botai }) => {
  await page.goto('/cadastro')
  await botai.preencher(page)
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue(
    botai.pessoa.email.endereco,
  )
})
```

Os campos mais usados: `botai.pessoa.cpf`, `botai.pessoa.nome.completo`, `botai.pessoa.email.endereco` e `botai.pessoa.endereco.cep`. Todos os campos e formatos estão em [a pessoa](../conceitos/a-pessoa.md).

## A semente padrão {#semente-padrao}

Sem opção nenhuma, a semente é o nome do projeto, o arquivo, os `describe` e o título do teste, separados por `›`:

```text
projeto › arquivo › describe › título
```

O teste `cadastro` do arquivo `cadastro.spec.ts`, no projeto `chromium`, recebe a semente `chromium › cadastro.spec.ts › cadastro`. A semente é legível de propósito: ela serve direto de argumento para a CLI, como mostra [reproduzir uma falha](./reproduzir-uma-falha.md).

O que isso quer dizer na prática:

- **Retries e workers não mudam a pessoa.** A nova tentativa preenche com a mesma.
- **Cada navegador recebe uma pessoa diferente**, porque o projeto entra na semente. Para ter a mesma em todos, fixe `botaiSemente` (veja [opções](./opcoes.md)).
- **Renomear o teste troca a pessoa.**

## O dia

Sem `botaiHoje`, o fixture usa a data de hoje em São Paulo. A mesma semente gera outra pessoa no dia seguinte: reproduzir exige a semente, o hoje e a versão. As regras completas estão em [semente e hoje](../conceitos/semente-e-hoje.md).

:::tip

Um teste que compara com um CPF escrito à mão quebra no dia seguinte. Compare com `botai.pessoa`, ou fixe `botaiHoje` e `botaiSemente`.

:::

## No relatório

Todo teste que pede o fixture `botai` ganha as anotações `botai-semente` e `botai-hoje`. Na falha inesperada, ganha também o anexo `botai-pessoa.json`. Veja [reproduzir uma falha](./reproduzir-uma-falha.md).
