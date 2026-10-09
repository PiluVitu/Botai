---
title: Cartões de teste
description: As opções --cartao, --cenario e --cenarios do botai pessoa e do botai pessoas, o comando botai cartao e as colunas cartao_provedor e cartao_cenario.
sidebar_position: 8
---

Desde a versão 0.5.0, o cartão da pessoa sai do provedor (`stripe` ou `pagarme`) e do cenário que você escolher. O padrão é `stripe` e `aprovado`, o cartão de antes. O que cada cenário faz em cada provedor, com os números e as fontes, está em [Cartões de teste](../conceitos/cartoes-de-teste.md).

| Opção                | Onde                          | O que faz                                               |
| -------------------- | ----------------------------- | ------------------------------------------------------- |
| `--cartao P`         | `pessoa`, `pessoas`, `cartao` | o provedor: `stripe` (padrão) ou `pagarme`              |
| `--cenario C`        | `pessoa`, `cartao`            | o cenário do provedor (padrão `aprovado`)               |
| `--cenarios C:N,C:N` | `pessoas`                     | quantas pessoas em cada cenário, em grupos, nesta ordem |

## Numa pessoa {#pessoa}

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05 --cartao pagarme --cenario recusado | grep -A11 '"cartao": {'
```

```json
    "cartao": {
      "bandeira": "visa",
      "numero": "4000000000000028",
      "numeroFormatado": "4000 0000 0000 0028",
      "titular": "MARCIO C RODRIGUES",
      "validade": "11/28",
      "mes": "11",
      "ano": "28",
      "cvv": "388",
      "provedor": "pagarme",
      "cenario": "recusado"
    }
```

O cenário muda só o cartão: o resto da pessoa, inclusive a validade e o CVV, é o mesmo de `botai pessoa --semente 42 --hoje 2026-10-05`. Sem `--cartao`, o `--cenario` vale para a Stripe:

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05 --cenario recusado-saldo | grep -E '"(numero|provedor|cenario)": "([0-9]{16}|[a-z-]+)"'
```

```text
      "numero": "4000000000009995",
      "provedor": "stripe",
      "cenario": "recusado-saldo"
```

## Num lote: `--cenarios` {#cenarios}

```text
botai pessoas --cenarios C:N,C:N [--cartao P] [-n N] [as outras opções do lote]
```

O `--cenarios` diz quantas pessoas saem em cada cenário. Elas saem em grupos, na ordem dada:

```bash testar
botai pessoas --cartao pagarme --cenarios recusado:10,aprovado:2,pendente:1 --semente demo --hoje 2026-10-08 \
  --formato csv --campos nome,cartao_numero,cartao_provedor,cartao_cenario
```

```csv
nome,cartao_numero,cartao_provedor,cartao_cenario
Isabela Freitas Santos,4000000000000028,pagarme,recusado
Vitória Alves Carvalho,4000000000000028,pagarme,recusado
Lucas Gabriel Pereira Oliveira,4000000000000028,pagarme,recusado
Gabriela Nascimento Correia,4000000000000028,pagarme,recusado
Letícia Araújo Barros,4000000000000028,pagarme,recusado
Ana Clara Pinto Ferreira,4000000000000028,pagarme,recusado
Antônio Costa Pereira,4000000000000028,pagarme,recusado
Gabriela Teixeira Martins,4000000000000028,pagarme,recusado
Vinícius Ribeiro Rocha,4000000000000028,pagarme,recusado
Luíza Almeida Santos,4000000000000028,pagarme,recusado
Luiz Fernando Barbosa Teixeira,4000000000000010,pagarme,aprovado
Mariana Barbosa Carvalho,4000000000000010,pagarme,aprovado
Carlos Eduardo Ribeiro Barbosa,4000000000000036,pagarme,pendente
```

- **O `-n` pode faltar:** vale a soma dos cenários (13, acima). Se vier, tem de ser a soma; outro número é erro de uso.
- **Sem `--cenarios`,** todas as pessoas saem no `aprovado` do provedor do `--cartao`.
- **A quantidade** é um inteiro de 1 em diante, e um cenário não pode aparecer duas vezes. A soma vai até 100 000, o limite do lote.
- **As pessoas são as mesmas** de um lote sem cenários: a pessoa `i` continua sendo a da semente `S/i`, e e-mail, CPF e CNPJ não se repetem no lote inteiro.

```bash testar
diff <(botai pessoas -n 13 --semente demo --hoje 2026-10-08 --formato csv --campos nome,cpf,email) \
  <(botai pessoas --cartao pagarme --cenarios recusado:10,aprovado:2,pendente:1 --semente demo --hoje 2026-10-08 \
    --formato csv --campos nome,cpf,email) \
  && echo "as mesmas pessoas"
```

```text
as mesmas pessoas
```

No ndjson, cada linha traz a semente da pessoa e o cartão traz o provedor e o cenário. Com os três, o [`botai pessoa`](./pessoa.md) recria só aquela pessoa:

```bash testar
botai pessoa --semente demo/12 --hoje 2026-10-08 --cartao pagarme --cenario pendente | grep '"completo"'
```

```text
      "completo": "Carlos Eduardo Ribeiro Barbosa",
```

## As colunas {#colunas}

O CSV e o SQL têm duas colunas do cartão no fim: `cartao_provedor` e `cartao_cenario`, a 34ª e a 35ª. Elas saem sempre, também sem `--cartao` (com `stripe` e `aprovado`). Use `--campos` para escolher. A lista inteira está em [Colunas](../referencia/colunas.md).

## botai cartao {#botai-cartao}

```text
botai cartao [--cartao stripe|pagarme] [--cenario C] [--formatado] [--semente S]
```

Imprime só o número de um cartão de teste, sem gerar a pessoa:

```bash testar
botai cartao --cartao pagarme --cenario chargeback --formatado
```

```text
4000 0000 0000 0069
```

| Opção         | O que faz                                                                       |
| ------------- | ------------------------------------------------------------------------------- |
| `--cartao P`  | `stripe` (padrão) ou `pagarme`                                                  |
| `--cenario C` | o cenário do provedor (padrão `aprovado`)                                       |
| `--formatado` | em grupos de 4 (sem ela, só os dígitos)                                         |
| `--semente S` | reproduz o mesmo número: o `aprovado` da Stripe tem dois, o Visa e o Mastercard |

```bash testar
botai cartao --semente demo
```

```text
5555555555554444
```

O `botai cartao --help` lista cada cenário com o número e a descrição; o `botai --help` e o `--help` do `pessoa` e do `pessoas` listam os cenários de cada provedor.

## Erros de uso {#erros}

Saem com 2, a mensagem vai para o stderr e nada vai para o stdout:

| Mensagem no stderr                                                                                                                                                    | Quando                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `botai: --cartao: provedor de cartão desconhecido "adyen" (use stripe, pagarme)`                                                                                      | o provedor não existe                        |
| `botai: --cenario: cenário desconhecido "recusado-cvc" para o provedor pagarme (use aprovado, recusado, pendente, pendente-recusado, pendente-cancelado, chargeback)` | o provedor não tem o cenário                 |
| `botai: --cenarios: cenarios precisa ser cenario:quantidade, separados por vírgula (ex.: recusado:10,aprovado:2), recebido "recusado"`                                | faltou a quantidade, ou sobrou vírgula       |
| `botai: --cenarios: quantidade inválida "0" no cenário recusado (um inteiro de 1 em diante)`                                                                          | a quantidade não é um inteiro de 1 em diante |
| `botai: --cenarios: cenário repetido "aprovado"`                                                                                                                      | o mesmo cenário duas vezes                   |
| `botai: --cenarios: a soma dos cenários (100001) passa do limite de 100000 pessoas`                                                                                   | a soma passou do limite do lote              |
| `botai: -n: n (5) diferente da soma dos cenários (10)`                                                                                                                | o `-n` não é a soma                          |
| `botai: -n é obrigatório sem --cenarios`                                                                                                                              | `botai pessoas` sem `-n` e sem `--cenarios`  |

```bash testar=2
botai pessoas -n 5 --cenarios recusado:10
```

```text
botai: -n: n (5) diferente da soma dos cenários (10)
```

O `--cenario` não existe no `botai pessoas` (lá é `--cenarios`), e o `--cenarios` não existe no `botai pessoa`: os dois dão `opção desconhecida`.
