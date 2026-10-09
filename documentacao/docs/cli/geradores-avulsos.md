---
title: Geradores avulsos
description: Um CPF, CNPJ, RG, PIS, título, celular ou CEP de cada vez, só dígitos ou com máscara, com --uf onde ela vale e --semente para repetir.
sidebar_position: 4
---

```text
botai cpf|cnpj|rg|pis|titulo|celular|cep [--formatado] [--uf UF] [--semente S]
```

| Opção         | O que faz                                  |
| ------------- | ------------------------------------------ |
| `--formatado` | com máscara (o padrão é só dígitos)        |
| `--uf UF`     | só para `cpf`, `titulo`, `celular` e `cep` |
| `--semente S` | repete o mesmo valor                       |

Cada comando imprime um valor e uma quebra de linha. Os documentos saem com os dígitos verificadores válidos.

## Os sete

Com `--semente 42`, sem e com `--formatado`:

| Comando   | Só dígitos       | `--formatado`        |
| --------- | ---------------- | -------------------- |
| `cpf`     | `18184606451`    | `181.846.064-51`     |
| `cnpj`    | `18184606000190` | `18.184.606/0001-90` |
| `rg`      | `181846068`      | `18.184.606-8`       |
| `pis`     | `11818460640`    | `118.18460.64-0`     |
| `titulo`  | `181846060132`   | `1818 4606 0132`     |
| `celular` | `21986064634`    | `(21) 98606-4634`    |
| `cep`     | `22410000`       | `22410-000`          |

```bash testar
botai cpf --semente 42
botai cpf --semente 42 --formatado
```

```text
18184606451
181.846.064-51
```

O celular é sempre móvel. O CEP sai da mesma lista de CEPs reais do endereço da pessoa (veja [Dados por trás](../conceitos/dados-por-tras.md)).

## `--uf`

O `--uf` vale para `cpf`, `titulo`, `celular` e `cep`, em qualquer caixa. No CPF, ele fixa o 9º dígito (a região fiscal da UF); no título, o código da UF; no celular, o DDD; no CEP, a UF do endereço.

```bash testar
botai cpf --formatado --uf PI --semente 42
botai titulo --formatado --uf pi --semente 42
botai celular --formatado --uf PI --semente 42
botai cep --formatado --uf PI --semente 42
```

```text
181.846.063-70
1818 4606 1538
(86) 98606-4634
64000-020
```

Sem `--uf`, o `titulo` usa SP. Em `cnpj`, `rg` e `pis`, o `--uf` é erro de uso:

```bash testar=2
botai cnpj --uf PI
```

```text
botai: --uf não vale para cnpj
```

## A mesma semente em tipos diferentes

:::danger

Com a mesma `--semente`, `cpf`, `cnpj`, `rg`, `pis` e `titulo` começam com os mesmos dígitos. Na tabela acima, todos começam com `181846`. Se você quer valores independentes, use uma semente para cada tipo.

:::

```bash testar
botai cpf --semente cliente-cpf
botai cnpj --semente cliente-cnpj
```

```text
48260210118
53121859000115
```

## O que não tem gerador avulso

Não há gerador avulso de nome, e-mail, senha, endereço ou cartão. Para esses, gere uma pessoa e use o campo, ou um lote em csv com as colunas que quiser:

```bash testar
botai pessoas -n 5 --semente avulsos --hoje 2026-10-08 --formato csv --campos nome,email,senha
```

```csv
nome,email,senha
Juliana Carvalho Barros,juliana-barros-5908@tuamaeaquelaursa.com,zVqiVkuP!4Up
Bruno Mendes Cardoso,bruno-cardoso-1419@tuamaeaquelaursa.com,P%SX8Ai$ixLe
Matheus Martins Santos,matheus-santos-9567@tuamaeaquelaursa.com,zWMNTM2&&hwx
Vinícius Pereira Souza,vinicius-souza-4578@tuamaeaquelaursa.com,q8ihMS9V9uq@
Ana Clara Oliveira Santos,ana-santos-9592@tuamaeaquelaursa.com,Fpn#b!Fa3tYh
```

As colunas possíveis estão em [Colunas do CSV e do SQL](../referencia/colunas.md). Para conferir um documento que já existe, use o [`botai validar`](./validar.md).
