---
title: Cartões de teste
description: Os cartões de teste da Stripe e do simulador da Pagar.me que o Botaí usa, o que cada cenário faz em cada provedor e de onde vêm os números.
sidebar_position: 8
---

O cartão de toda pessoa é um número de teste oficial de um provedor de pagamento. Um número qualquer que passa no Luhn não serve: o sandbox não sabe o que fazer com ele, e ele pode ser o de um cartão de verdade. Desde a versão 0.5.0 do core, você escolhe o provedor e o cenário: a Stripe ou a Pagar.me, e o que deve acontecer com a cobrança.

Sem escolher nada, o cartão é o `aprovado` da `stripe`: o Visa `4242 4242 4242 4242` ou o Mastercard `5555 5555 5555 4444`.

## Só o cartão muda {#so-o-cartao-muda}

O cenário muda o número, a bandeira e os campos `provedor` e `cenario` do cartão. O resto da pessoa é o mesmo da semente, inclusive a validade e o CVV:

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

Sem as opções, a semente 42 dá o mesmo Márcio, com o Mastercard `5555555555554444`, a mesma validade `11/28` e o mesmo CVV `388`. Fora do cartão, nenhum campo muda:

```bash testar
diff <(botai pessoa --semente 42 --hoje 2026-10-05 | grep -v -E '"(bandeira|numero|numeroFormatado|provedor|cenario)"') \
  <(botai pessoa --semente 42 --hoje 2026-10-05 --cartao pagarme --cenario recusado \
    | grep -v -E '"(bandeira|numero|numeroFormatado|provedor|cenario)"') \
  && echo "a mesma pessoa"
```

```text
a mesma pessoa
```

O filtro tira também os `"numero"` do RG, do celular e do endereço, que são iguais dos dois lados.

## Stripe {#stripe}

| Cenário              | Número                                         | O que a Stripe faz                                                              |
| -------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------- |
| `aprovado` (padrão)  | `4242 4242 4242 4242` ou `5555 5555 5555 4444` | aprova a cobrança                                                               |
| `recusado`           | `4000 0000 0000 0002`                          | recusa genérica (`card_declined`, `generic_decline`)                            |
| `pendente`           | `4000 0027 6000 3184`                          | pede a autenticação 3D Secure em toda cobrança e espera por ela antes de cobrar |
| `recusado-saldo`     | `4000 0000 0000 9995`                          | recusa por saldo insuficiente (`card_declined`, `insufficient_funds`)           |
| `recusado-roubado`   | `4000 0000 0000 9979`                          | recusa por cartão roubado (`card_declined`, `stolen_card`)                      |
| `recusado-perdido`   | `4000 0000 0000 9987`                          | recusa por cartão perdido (`card_declined`, `lost_card`)                        |
| `recusado-expirado`  | `4000 0000 0000 0069`                          | recusa por cartão expirado (`expired_card`), mesmo com a validade no futuro     |
| `recusado-cvc`       | `4000 0000 0000 0127`                          | recusa por CVC incorreto (`incorrect_cvc`), com qualquer CVV                    |
| `erro-processamento` | `4000 0000 0000 0119`                          | erro de processamento (`processing_error`)                                      |

Os códigos entre parênteses são o `code` e o `decline_code` que a API da Stripe devolve no modo de teste. No `aprovado`, a semente escolhe entre o Visa e o Mastercard; os outros cenários são Visa.

## Pagar.me {#pagarme}

| Cenário              | Número                | O que o simulador da Pagar.me faz                             |
| -------------------- | --------------------- | ------------------------------------------------------------- |
| `aprovado`           | `4000 0000 0000 0010` | toda operação aprova: o pedido e a cobrança ficam pagos       |
| `recusado`           | `4000 0000 0000 0028` | toda transação é não autorizada: o pedido e a cobrança falham |
| `pendente`           | `4000 0000 0000 0036` | fica processando e depois aprova: o pedido fica pago          |
| `pendente-recusado`  | `4000 0000 0000 0044` | fica processando e depois falha                               |
| `pendente-cancelado` | `4000 0000 0000 0051` | fica pendente e depois o pedido e a cobrança são cancelados   |
| `chargeback`         | `4000 0000 0000 0069` | é paga e depois passa para chargeback                         |

Todos são Visa. O simulador pede validade no futuro, e a do Botaí é sempre de 12 a 59 meses depois do `hoje`. Ficaram de fora os dois cenários do simulador que falham só no cancelamento (`4000 0000 0000 0077` e `4000 0000 0000 0093`).

:::note[Documentado]

O que cada provedor faz com cada número vem da documentação dele, conferida em 2026-10-09: [docs.stripe.com/testing](https://docs.stripe.com/testing) e o [simulador de cartão de crédito da Pagar.me](https://docs.pagar.me/docs/simulador-de-cartão-de-crédito). Ninguém rodou estes números contra o sandbox da Stripe ou da Pagar.me. O que os testes do core provam: o número de cada cenário, a bandeira, o Luhn (os 16 números passam) e que a mesma semente dá a mesma pessoa em qualquer cenário.

:::

## O mesmo número em dois provedores {#mesmo-numero}

O `4000 0000 0000 0069` é o `recusado-expirado` da Stripe e o `chargeback` da Pagar.me. O número sozinho não diz o cenário: quem diz é o par `provedor` e `cenario` do cartão, que sai no JSON e nas colunas `cartao_provedor` e `cartao_cenario` do CSV e do SQL.

## Em cada porta {#portas}

| Porta      | Uma pessoa                           | Um lote                                               |
| ---------- | ------------------------------------ | ----------------------------------------------------- |
| CLI        | `--cartao` e `--cenario`             | `--cartao` e `--cenarios recusado:10,aprovado:2`      |
| Servidor   | `cartao` e `cenario`                 | `cartao` e `cenarios`                                 |
| Biblioteca | `cartao: { provedor, cenario }`      | `cartao: { provedor, cenarios: { recusado: 10, … } }` |
| Fixture    | `botaiCartao: { provedor, cenario }` | —                                                     |
| Extensão   | no popup, a partir da versão 1.2.0   | —                                                     |

Na extensão, o popup escolhe o provedor e o cenário das próximas pessoas a partir da versão 1.2.0 ([O popup](../extensao/popup.md#cartao)); até a 1.1.0, ela usa sempre o padrão (`stripe`, `aprovado`). Os detalhes das outras portas estão em [Cartões de teste na CLI](../cli/cartoes.md), na [API HTTP](../servidor/api-http.md#cartoes), em [Gerar uma pessoa](../biblioteca/gerar-pessoa.md#cartao), em [Gerar um lote](../biblioteca/gerar-pessoas.md#cenarios) e nas [opções do fixture](../playwright/opcoes.md#botaicartao).

No lote, os cenários saem em grupos, na ordem dada, e a pessoa `i` continua sendo a da semente `S/i`. E-mail, CPF e CNPJ não se repetem no lote inteiro, como num lote sem cenários ([Lote e unicidade](./lote-e-unicidade.md)).

## Cenário errado {#erro}

Um provedor ou um cenário que não existe, ou um cenário que o provedor não tem, é erro de uso, com a lista do que vale:

```bash testar=2
botai pessoa --cartao pagarme --cenario recusado-cvc
```

```text
botai: --cenario: cenário desconhecido "recusado-cvc" para o provedor pagarme (use aprovado, recusado, pendente, pendente-recusado, pendente-cancelado, chargeback)
```

O provedor e o cenário aceitam qualquer caixa (`Stripe`, `PAGARME`) e saem em minúsculas.

## O formato 2 {#formato-2}

O cartão ganhou `provedor` e `cenario` na 0.5.0, e por isso o envelope passou ao formato 2, com um esquema novo. Veja [Envelope e esquema](./envelope-e-esquema.md#formato-2).
