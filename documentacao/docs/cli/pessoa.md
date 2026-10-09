---
title: Uma pessoa
description: O botai pessoa gera uma pessoa num envelope JSON, reproduzível pela semente e pelo hoje, com UF, domínio de e-mail e cartão de teste opcionais.
sidebar_position: 2
---

```text
botai pessoa [--semente S] [--hoje AAAA-MM-DD] [--uf UF] [--dominio-email D]
             [--cartao stripe|pagarme] [--cenario C]
```

| Opção               | O que faz                                                               |
| ------------------- | ----------------------------------------------------------------------- |
| `--semente S`       | número ou texto; a mesma semente gera a mesma pessoa                    |
| `--hoje AAAA-MM-DD` | data de referência da idade e da validade do cartão                     |
| `--uf UF`           | sigla da UF do endereço; o CPF, o título e o DDD seguem a UF            |
| `--dominio-email D` | domínio do e-mail (o padrão é `tuamaeaquelaursa.com`, de caixa pública) |
| `--cartao P`        | provedor do cartão de teste: `stripe` (o padrão) ou `pagarme`           |
| `--cenario C`       | cenário do cartão (o padrão é `aprovado`); muda só o cartão             |

Todas são opcionais. Sem `--semente`, a CLI sorteia uma e a devolve no envelope. Sem `--hoje`, vale a data de hoje em São Paulo.

## O envelope

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05
```

<!-- prettier-ignore -->
```json
{
  "formato": 2,
  "motor": "0.5.0",
  "semente": "42",
  "hoje": "2026-10-05",
  "pessoa": {
    "nome": {
      "sexo": "M",
      "prenome": "Márcio",
      "sobrenomes": [
        "Carvalho",
        "Rodrigues"
      ],
      "completo": "Márcio Carvalho Rodrigues",
      "noCartao": "MARCIO C RODRIGUES"
    },
    "nascimento": {
      "iso": "1970-02-26",
      "br": "26/02/1970",
      "idade": 56
    },
    "cpf": "634.132.403-07",
    "rg": {
      "numero": "92.957.904-5",
      "orgaoEmissor": "SSP",
      "uf": "SP"
    },
    "pis": "166.24491.26-5",
    "tituloEleitor": "5022 4149 1171",
    "celular": {
      "ddd": "98",
      "numero": "97702-9128",
      "formatado": "(98) 97702-9128",
      "digitos": "98977029128",
      "e164": "+5598977029128"
    },
    "email": {
      "usuario": "marcio-rodrigues-0337",
      "endereco": "marcio-rodrigues-0337@tuamaeaquelaursa.com",
      "caixaUrl": "https://tuamaeaquelaursa.com/marcio-rodrigues-0337"
    },
    "senha": "g4JXwr#&PM8r",
    "endereco": {
      "cep": "65071-377",
      "logradouro": "Avenida Litorânea",
      "bairro": "Calhau",
      "cidade": "São Luís",
      "uf": "MA",
      "ddd": "98",
      "numero": "199",
      "complemento": "Apto 171"
    },
    "empresa": {
      "razaoSocial": "Carvalho & Rodrigues Engenharia Ltda",
      "nomeFantasia": "Rodrigues Store",
      "cnpj": "90.849.558/0001-39"
    },
    "cartao": {
      "bandeira": "mastercard",
      "numero": "5555555555554444",
      "numeroFormatado": "5555 5555 5555 4444",
      "titular": "MARCIO C RODRIGUES",
      "validade": "11/28",
      "mes": "11",
      "ano": "28",
      "cvv": "388",
      "provedor": "stripe",
      "cenario": "aprovado"
    }
  }
}
```

- `formato` é a versão da forma do envelope: 2 nesta versão (desde a 0.5.0, quando o cartão ganhou `provedor` e `cenario`). `motor` é a versão do pacote que gerou a pessoa.
- `semente` sai sempre como texto, mesmo quando é um número.
- `hoje` é a data usada. Com a `semente` e a mesma versão do pacote, ela gera a mesma pessoa de novo.

Cada campo da pessoa, com o formato e as regras de coerência, está em [A pessoa](../conceitos/a-pessoa.md). O envelope e o JSON Schema dele estão em [Envelope e esquema](../conceitos/envelope-e-esquema.md).

## `--uf`

A UF muda o endereço, o DDD do celular, o título de eleitor e, às vezes, o CPF. O 9º dígito do CPF é a região fiscal da UF, então o CPF só muda se a nova UF for de outra região fiscal:

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05 --uf RS | grep -E '"(cpf|tituloEleitor|cidade|ddd)"'
```

```text
    "cpf": "634.132.400-64",
    "tituloEleitor": "5022 4149 0477",
      "ddd": "51",
      "cidade": "Porto Alegre",
      "ddd": "51",
```

Com `PI`, o CPF continua `634.132.403-07`: o MA (a UF da pessoa sem `--uf`) e o PI são da mesma região fiscal, a 3. A UF vale em qualquer caixa:

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05 --uf pi | grep -E '"(cpf|tituloEleitor|cidade|ddd)"'
```

```text
    "cpf": "634.132.403-07",
    "tituloEleitor": "5022 4149 1570",
      "ddd": "86",
      "cidade": "Teresina",
      "ddd": "86",
```

Nome, nascimento, e-mail, senha, empresa e cartão não mudam. O RG continua SSP/SP em qualquer UF.

## `--dominio-email`

O domínio muda só o endereço do e-mail e a `caixaUrl`, que vira `null`: num domínio seu, não há caixa pública. O domínio sai em minúsculas.

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05 --dominio-email Example.COM | grep -A4 '"email": {'
```

```text
    "email": {
      "usuario": "marcio-rodrigues-0337",
      "endereco": "marcio-rodrigues-0337@example.com",
      "caixaUrl": null
    },
```

A caixa do domínio padrão é pública: qualquer pessoa lê o que chega nela. Veja [Uso responsável](../conceitos/uso-responsavel.md).

## `--cartao` e `--cenario` {#cartao}

O provedor e o cenário mudam só o cartão: o número, a bandeira, o `provedor` e o `cenario`. A validade, o CVV e o resto da pessoa são os da semente.

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05 --cartao pagarme --cenario chargeback | grep -E '"(numero|provedor|cenario)": "([0-9]{16}|[a-z-]+)"'
```

```text
      "numero": "4000000000000069",
      "provedor": "pagarme",
      "cenario": "chargeback"
```

Os cenários de cada provedor estão em [Cartões de teste](./cartoes.md).

## `--hoje`

O `--hoje` mantém a idade e move as datas. Com a semente 42, a idade continua 56, mas em 2030 o nascimento passa de `1970-02-26` para `1974-02-26` e a validade do cartão de `11/28` para `11/32`:

```bash testar
botai pessoa --semente 42 --hoje 2030-10-05 | grep -E '"(iso|idade|validade)"'
```

```text
      "iso": "1974-02-26",
      "idade": 56
      "validade": "11/32",
```

Use datas reais no `--hoje`. Uma data que não existe é erro de uso:

```bash testar=2
botai pessoa --hoje 2026-02-30
```

```text
botai: --hoje: hoje precisa ser uma data AAAA-MM-DD que existe, recebido "2026-02-30"
```

## A pessoa de um lote {#a-pessoa-de-um-lote}

:::danger

`botai pessoa --semente X` não é a primeira pessoa de `botai pessoas --semente X`. No lote, a pessoa `i` vem da semente `X/i`, então a primeira vem de `X/0`.

:::

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05 | grep '"completo"'
botai pessoas -n 1 --semente 42 --hoje 2026-10-05 | grep '"completo"'
```

```text
      "completo": "Márcio Carvalho Rodrigues",
        "completo": "Thiago Martins Teixeira",
```

Para recriar uma pessoa de um lote, passe a semente dela. O `ndjson` diz qual semente valeu em cada linha (veja [Um lote de pessoas](./pessoas.md#ndjson)):

```bash testar
botai pessoa --semente 42/0 --hoje 2026-10-05 | grep '"completo"'
```

```text
      "completo": "Thiago Martins Teixeira",
```
