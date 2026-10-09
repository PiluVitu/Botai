---
title: API HTTP
description: As rotas /pessoa, /pessoas e /saude do servidor HTTP do Botaí, com os parâmetros, o Content-Type de cada formato e os erros 400, 404 e 405.
sidebar_position: 2
---

O servidor aceita só GET, em três rotas. Os exemplos usam o endereço padrão, `http://127.0.0.1:8790`; para subir o servidor, veja [Subir o servidor](./botai-serve.md).

| Rota       | Parâmetros                                                                                                                               | Resposta                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `/pessoa`  | `semente`, `hoje`, `uf`, `dominioEmail`, `cartao` e `cenario`, todos opcionais                                                           | o envelope de uma pessoa, em JSON              |
| `/pessoas` | `n` (de 1 a 10 000; obrigatório sem `cenarios`), os de `/pessoa` menos o `cenario`, `cenarios`, `formato`, `dialeto`, `tabela`, `campos` | o lote, no formato pedido                      |
| `/saude`   | nenhum                                                                                                                                   | `{"ok": true, "formato": 2, "motor": "0.5.0"}` |

Os parâmetros têm o nome das opções da CLI em camelCase: `--dominio-email` vira `dominioEmail`. Um nome que a rota não conhece dá 400, com a lista dos aceitos (veja [Erros](#erros)).

## /pessoa {#pessoa}

| Parâmetro      | Valor                                                                                          | Sem ele                                                        |
| -------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `semente`      | um inteiro seguro (negativo vale) ou um texto de 1 a 256 caracteres, sem caractere de controle | sorteia uma de 16 dígitos hexadecimais e a devolve no envelope |
| `hoje`         | uma data `AAAA-MM-DD`                                                                          | usa a data de hoje em São Paulo                                |
| `uf`           | uma das 27 siglas, em qualquer caixa                                                           | a pessoa sai de qualquer UF                                    |
| `dominioEmail` | um domínio, como `example.com`                                                                 | `tuamaeaquelaursa.com`, uma caixa de entrada pública           |
| `cartao`       | o provedor do cartão de teste: `stripe` ou `pagarme`                                           | `stripe`                                                       |
| `cenario`      | um cenário do provedor, como `recusado` ([Cartões de teste](../conceitos/cartoes-de-teste.md)) | `aprovado`                                                     |

```bash testar
curl -fsS 'http://127.0.0.1:8790/pessoa?semente=42&hoje=2026-10-05'
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

A resposta é o mesmo texto que a CLI imprime para as mesmas opções:

```bash testar
diff <(botai pessoa --semente 42 --hoje 2026-10-05) \
  <(curl -fsS 'http://127.0.0.1:8790/pessoa?semente=42&hoje=2026-10-05') \
  && echo iguais
```

Com `dominioEmail`, o domínio vai para minúsculas e a `caixaUrl` vira `null`. O resto da pessoa não muda:

```bash testar
curl -fsS 'http://127.0.0.1:8790/pessoa?semente=42&hoje=2026-10-05&dominioEmail=Example.COM' \
  | grep -A4 '"email"'
```

```json
    "email": {
      "usuario": "marcio-rodrigues-0337",
      "endereco": "marcio-rodrigues-0337@example.com",
      "caixaUrl": null
    },
```

O que cada opção muda na pessoa está em [A pessoa](../conceitos/a-pessoa.md). Para reproduzir uma pessoa, passe a semente **e** o `hoje`, e fixe a versão: sem `hoje`, a mesma semente gera outra pessoa no dia seguinte (veja [Semente e hoje](../conceitos/semente-e-hoje.md)).

## /pessoas {#pessoas}

| Parâmetro                                         | Valor                                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `n`                                               | um inteiro de 1 a 10 000; obrigatório sem `cenarios` (com eles, se vier, tem de ser a soma)                   |
| `semente`, `hoje`, `uf`, `dominioEmail`, `cartao` | como em `/pessoa`                                                                                             |
| `cenarios`                                        | quantas pessoas em cada cenário, como `recusado:10,aprovado:2`: em grupos, nesta ordem; a soma vai até 10 000 |
| `formato`                                         | `json` (o padrão), `ndjson`, `csv` ou `sql`                                                                   |
| `dialeto`                                         | `postgres`, `mysql` ou `sqlite`, em minúsculas; só com `formato=sql`                                          |
| `tabela`                                          | `tabela` ou `esquema.tabela`; só com `formato=sql`                                                            |
| `campos`                                          | as colunas, separadas por vírgula; só com `formato=csv` ou `formato=sql`                                      |

A resposta é o mesmo texto de `botai pessoas` com as mesmas opções:

```bash testar
diff <(botai pessoas -n 3 --semente demo --hoje 2026-10-08 --formato csv --campos nome,cpf,email) \
  <(curl -fsS 'http://127.0.0.1:8790/pessoas?n=3&semente=demo&hoje=2026-10-08&formato=csv&campos=nome,cpf,email') \
  && echo iguais
```

Os formatos, as 35 colunas e a proteção do `tabela` estão em [Um lote de pessoas](../cli/pessoas.md) e em [Colunas](../referencia/colunas.md). Dentro de um lote, e-mail, CPF e CNPJ não se repetem; a regra do lote está em [Lote e unicidade](../conceitos/lote-e-unicidade.md).

### CSV

```bash testar
curl -fsS 'http://127.0.0.1:8790/pessoas?n=3&semente=demo&hoje=2026-10-08&formato=csv&campos=nome,cpf,email'
```

```csv
nome,cpf,email
Isabela Freitas Santos,550.160.642-96,isabela-santos-7825@tuamaeaquelaursa.com
Vitória Alves Carvalho,843.495.439-70,vitoria-carvalho-1721@tuamaeaquelaursa.com
Lucas Gabriel Pereira Oliveira,750.346.866-19,lucas-oliveira-9018@tuamaeaquelaursa.com
```

### SQL

```bash testar
curl -fsS 'http://127.0.0.1:8790/pessoas?n=2&semente=demo&hoje=2026-10-08&formato=sql&dialeto=sqlite&tabela=app.clientes&campos=nome,cpf,email'
```

```sql
-- botai: formato 2, motor 0.5.0, semente demo, hoje 2026-10-08
INSERT INTO "app"."clientes" ("nome", "cpf", "email") VALUES ('Isabela Freitas Santos', '550.160.642-96', 'isabela-santos-7825@tuamaeaquelaursa.com');
INSERT INTO "app"."clientes" ("nome", "cpf", "email") VALUES ('Vitória Alves Carvalho', '843.495.439-70', 'vitoria-carvalho-1721@tuamaeaquelaursa.com');
```

A 1ª linha é um comentário com o formato, o motor, a semente e o `hoje`. O SQL traz só os INSERTs: crie a tabela antes (veja [Receitas de banco](../cli/receitas-de-banco.md)).

### ndjson

Um envelope por linha, cada um com a semente exata da pessoa:

```bash testar
curl -fsS 'http://127.0.0.1:8790/pessoas?n=3&semente=demo&hoje=2026-10-08&formato=ndjson' \
  | grep -o '"semente":"[^"]*"'
```

```text
"semente":"demo/0"
"semente":"demo/1"
"semente":"demo/2"
```

### JSON

Sem `formato`, a resposta é um envelope só, com a lista em `pessoas`: `{"formato": 2, "motor": "0.5.0", "semente": "demo", "hoje": "2026-10-08", "pessoas": [...]}`.

## Cartões {#cartoes}

O `cartao` e o `cenario` (no `/pessoas`, o `cenarios`) valem como o `--cartao`, o `--cenario` e o `--cenarios` da CLI ([Cartões de teste](../cli/cartoes.md)). Com `cenarios`, o `n` pode faltar: vale a soma.

```bash testar
curl -fsS 'http://127.0.0.1:8790/pessoas?cartao=pagarme&cenarios=recusado:2,aprovado:1&semente=demo&hoje=2026-10-08&formato=csv&campos=nome,cartao_numero,cartao_provedor,cartao_cenario'
```

```csv
nome,cartao_numero,cartao_provedor,cartao_cenario
Isabela Freitas Santos,4000000000000028,pagarme,recusado
Vitória Alves Carvalho,4000000000000028,pagarme,recusado
Lucas Gabriel Pereira Oliveira,4000000000000010,pagarme,aprovado
```

É o mesmo texto da CLI:

```bash testar
diff <(botai pessoas --cartao pagarme --cenarios recusado:2,aprovado:1 --semente demo --hoje 2026-10-08 --formato ndjson) \
  <(curl -fsS 'http://127.0.0.1:8790/pessoas?cartao=pagarme&cenarios=recusado:2,aprovado:1&semente=demo&hoje=2026-10-08&formato=ndjson') \
  && echo iguais
```

Um `n` diferente da soma, um cenário que o provedor não tem ou uma soma acima de 10 000 dão 400:

```bash testar
curl -sS 'http://127.0.0.1:8790/pessoas?n=5&cenarios=recusado:10'
```

```json
{
  "erro": "n: n (5) diferente da soma dos cenários (10)"
}
```

## /saude {#saude}

```bash testar
curl -fsS http://127.0.0.1:8790/saude
```

```json
{
  "ok": true,
  "formato": 2,
  "motor": "0.5.0"
}
```

O `/saude` ignora parâmetros que não conhece. Use-o para saber se o servidor está no ar, sempre com GET.

## Content-Type e cabeçalhos {#cabecalhos}

| Resposta                    | `Content-Type`                            |
| --------------------------- | ----------------------------------------- |
| `/pessoa`, `/saude` e erros | `application/json; charset=utf-8`         |
| `formato=json`              | `application/json; charset=utf-8`         |
| `formato=ndjson`            | `application/x-ndjson; charset=utf-8`     |
| `formato=csv`               | `text/csv; charset=utf-8; header=present` |
| `formato=sql`               | `application/sql; charset=utf-8`          |

Além do `Content-Type`, o servidor manda só dois cabeçalhos seus: `Cache-Control: no-store` e `X-Content-Type-Options: nosniff`.

```bash testar
curl -fsS -D - -o /dev/null 'http://127.0.0.1:8790/pessoas?n=1&formato=csv' \
  | grep -i -E '^(content-type|cache-control|x-content-type-options):'
```

```text
Cache-Control: no-store
X-Content-Type-Options: nosniff
Content-Type: text/csv; charset=utf-8; header=present
```

Não há cabeçalho de CORS: veja [Segurança e limites](./seguranca-e-limites.md#sem-cors).

## Erros {#erros}

Um pedido errado não derruba o servidor. A resposta é um JSON `{"erro": "..."}` que diz qual parâmetro está errado:

| Status | Quando                                                                            |
| ------ | --------------------------------------------------------------------------------- |
| 400    | parâmetro desconhecido, repetido ou vazio, `n` fora de 1 a 10 000, valor inválido |
| 404    | rota que não é `/pessoa`, `/pessoas` nem `/saude`                                 |
| 405    | método que não é GET, com o cabeçalho `Allow: GET`                                |

```bash testar
curl -sS 'http://127.0.0.1:8790/pessoa?dominio-email=example.com'
```

```json
{
  "erro": "parâmetro desconhecido: dominio-email (aceitos: semente, hoje, uf, dominioEmail, cartao, cenario)"
}
```

Num script, `curl -fsS` sai com 22 em qualquer status 400 ou mais:

```bash testar=22
curl -fsS 'http://127.0.0.1:8790/pessoas?n=10001'
```

Todas as mensagens estão em [Mensagens de erro](../referencia/mensagens-de-erro.md#servidor-rotas).

## Clientes

O servidor não precisa de pacote no cliente: qualquer linguagem com HTTP serve. Há receitas para [Python](../integracoes/python.md), [Go](../integracoes/go.md) e [Java](../integracoes/java.md). Para preencher uma página com o motor do navegador, a pessoa pode vir do `GET /pessoa`: o motor recebe `envelope.pessoa` e `envelope.hoje` (veja [O IIFE](../navegador/iife.md)).
