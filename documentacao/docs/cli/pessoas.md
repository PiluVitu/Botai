---
title: Um lote de pessoas
description: O botai pessoas gera até 100 000 pessoas sem CPF, e-mail ou CNPJ repetido, em json, ndjson, csv ou sql, com colunas e tabela à escolha.
sidebar_position: 3
---

```text
botai pessoas -n N [--semente S] [--hoje AAAA-MM-DD] [--uf UF] [--dominio-email D]
              [--cartao stripe|pagarme] [--cenarios C:N,C:N]
              [--formato json|ndjson|csv|sql] [--dialeto postgres|mysql|sqlite]
              [--tabela T] [--campos a,b,c]
```

| Opção                | O que faz                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `-n N`               | quantas pessoas, de 0 a 100 000; obrigatório sem `--cenarios`                               |
| `--semente S`        | a pessoa `i` do lote usa a semente `S/i`                                                    |
| `--hoje AAAA-MM-DD`  | data de referência                                                                          |
| `--uf UF`            | sigla da UF de todos os endereços                                                           |
| `--dominio-email D`  | domínio dos e-mails                                                                         |
| `--cartao P`         | provedor do cartão de teste: `stripe` (padrão) ou `pagarme`                                 |
| `--cenarios C:N,C:N` | quantas pessoas em cada cenário do cartão, em grupos nesta ordem; o `-n`, se vier, é a soma |
| `--formato F`        | `json` (padrão), `ndjson`, `csv` ou `sql`                                                   |
| `--dialeto D`        | `postgres` (padrão), `mysql` ou `sqlite`; só com `--formato sql`                            |
| `--tabela T`         | tabela do INSERT (padrão `pessoas`; aceita `esquema.tabela`); só com sql                    |
| `--campos a,b,c`     | colunas do csv e do sql, nesta ordem                                                        |

`--semente`, `--hoje`, `--uf` e `--dominio-email` funcionam como no [`botai pessoa`](./pessoa.md). O `--cartao` e o `--cenarios` estão em [Cartões de teste](./cartoes.md#cenarios).

## Sem repetição, com prefixo estável

Num lote de até 100 000 pessoas, nenhum CPF, e-mail ou CNPJ se repete:

```bash testar
botai pessoas -n 100000 --semente carga --hoje 2026-10-05 --formato csv --campos cpf,email,empresa_cnpj > lote.csv
tail -n +2 lote.csv | awk -F, '{ cpf[$1]; email[$2]; cnpj[$3] } END { print length(cpf), length(email), length(cnpj) }'
```

```text
100000 100000 100000
```

As primeiras k pessoas de um lote de n são o lote de k. Dá para aumentar o `-n` sem mudar as pessoas que você já usa:

```bash testar
diff <(botai pessoas -n 3 --semente demo --hoje 2026-10-08 --formato ndjson) \
  <(botai pessoas -n 10 --semente demo --hoje 2026-10-08 --formato ndjson | head -n 3)
```

A unicidade vale só para CPF, e-mail e CNPJ, e só dentro do mesmo lote. Os nomes repetem. Como o lote chega a isso (`S/i`, `S/i/2`…) está em [Lote e unicidade](../conceitos/lote-e-unicidade.md).

:::info

Com `--uf`, todos os endereços saem daquela UF. Em 24 das 27 UFs há um CEP só, e o lote inteiro recebe o mesmo endereço. Veja [Limites](../limites.md).

:::

## json {#json}

O padrão. Um envelope só, com as pessoas no array `pessoas`:

```bash testar
botai pessoas -n 3 --semente demo --hoje 2026-10-08 | head -n 12
```

```json
{
  "formato": 2,
  "motor": "0.5.0",
  "semente": "demo",
  "hoje": "2026-10-08",
  "pessoas": [
    {
      "nome": {
        "sexo": "F",
        "prenome": "Isabela",
        "sobrenomes": [
          "Freitas",
```

O json monta o lote inteiro na memória antes de escrever: com 100 000 pessoas, cerca de 1,5 GB. Para lote grande, use ndjson, csv ou sql, que escrevem aos poucos (cerca de 130 MiB com 100 000).

## ndjson {#ndjson}

Um envelope por linha, cada um com a semente exata da pessoa:

```bash testar
botai pessoas -n 3 --semente demo --hoje 2026-10-08 --formato ndjson | grep -o '"semente":"[^"]*"'
```

```text
"semente":"demo/0"
"semente":"demo/1"
"semente":"demo/2"
```

Com essa semente, o [`botai pessoa`](./pessoa.md#a-pessoa-de-um-lote) recria só aquela pessoa. Quando uma pessoa é sorteada de novo para não repetir CPF, e-mail ou CNPJ, a linha diz qual semente valeu:

```bash testar
botai pessoas -n 1000 --semente mil-3 --hoje 2026-10-05 --formato ndjson | grep -o '"semente":"mil-3/971/[^"]*"'
```

```text
"semente":"mil-3/971/2"
```

## csv {#csv}

CSV no padrão RFC 4180: cabeçalho na primeira linha, linhas terminadas em CRLF e `null` como campo vazio.

```bash testar
botai pessoas -n 3 --semente demo --hoje 2026-10-08 --formato csv --campos nome,cpf,email
```

```csv
nome,cpf,email
Isabela Freitas Santos,550.160.642-96,isabela-santos-7825@tuamaeaquelaursa.com
Vitória Alves Carvalho,843.495.439-70,vitoria-carvalho-1721@tuamaeaquelaursa.com
Lucas Gabriel Pereira Oliveira,750.346.866-19,lucas-oliveira-9018@tuamaeaquelaursa.com
```

O CSV não traz a semente. Sem `--semente`, a CLI escreve a semente sorteada no stderr, para você reproduzir o lote:

```bash testar
botai pessoas -n 50 --formato csv --campos nome,cpf,email > p.csv
```

```text
botai: semente 75bf48f551f1dd10, hoje 2026-10-08
```

## sql {#sql}

Um `INSERT` por pessoa. A 1ª linha é um comentário com o formato, o motor, a semente e o hoje. `idade` sai como número e `null` como `NULL`.

```bash testar
botai pessoas -n 2 --semente demo --hoje 2026-10-08 --formato sql --campos nome,cpf,idade
```

```sql
-- botai: formato 2, motor 0.5.0, semente demo, hoje 2026-10-08
INSERT INTO "pessoas" ("nome", "cpf", "idade") VALUES ('Isabela Freitas Santos', '550.160.642-96', 50);
INSERT INTO "pessoas" ("nome", "cpf", "idade") VALUES ('Vitória Alves Carvalho', '843.495.439-70', 58);
```

O SQL traz só os INSERTs, sem `CREATE TABLE`: crie a tabela antes. As receitas completas estão em [Receitas de banco de dados](./receitas-de-banco.md).

### `--dialeto`

`postgres` (o padrão), `mysql` ou `sqlite`. O Postgres e o SQLite saem iguais byte a byte:

```bash testar
cmp <(botai pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql --dialeto postgres) \
  <(botai pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql --dialeto sqlite)
```

Só o MySQL muda: crases em vez de aspas duplas e escape de barra invertida.

```bash testar
botai pessoas -n 2 --semente demo --hoje 2026-10-08 --formato sql --dialeto=mysql --campos nome,cpf,idade
```

```sql
-- botai: formato 2, motor 0.5.0, semente demo, hoje 2026-10-08
INSERT INTO `pessoas` (`nome`, `cpf`, `idade`) VALUES ('Isabela Freitas Santos', '550.160.642-96', 50);
INSERT INTO `pessoas` (`nome`, `cpf`, `idade`) VALUES ('Vitória Alves Carvalho', '843.495.439-70', 58);
```

O `--dialeto` diferencia maiúsculas, ao contrário do `--uf`: `MySQL` é erro de uso.

### `--tabela`

O nome da tabela, ou `esquema.tabela`, com letras, dígitos e `_`, até 63 caracteres:

```bash testar
botai pessoas -n 2 --semente demo --hoje 2026-10-08 --formato sql --tabela app.clientes --campos nome,cpf,idade
```

```sql
-- botai: formato 2, motor 0.5.0, semente demo, hoje 2026-10-08
INSERT INTO "app"."clientes" ("nome", "cpf", "idade") VALUES ('Isabela Freitas Santos', '550.160.642-96', 50);
INSERT INTO "app"."clientes" ("nome", "cpf", "idade") VALUES ('Vitória Alves Carvalho', '843.495.439-70', 58);
```

Qualquer outra coisa é recusada antes de gerar o SQL, o que protege contra injeção:

```bash testar=2
botai pessoas -n 10 --formato sql --tabela 'x;drop'
```

```text
botai: tabela inválida "x;drop" (letras, dígitos e _, até 63 caracteres; opcionalmente esquema.tabela)
```

`a.b.c` também sai com 2.

## `--campos` {#campos}

Escolhe e ordena as colunas do csv e do sql. São 35 colunas; sem `--campos`, saem todas, na ordem da [referência de colunas](../referencia/colunas.md). Em json e ndjson, `--campos` é erro de uso: lá sai a pessoa inteira.

```bash testar=2
botai pessoas -n 10 --campos nome
```

```text
botai: --campos só vale com --formato csv ou sql
```

## Tempo e tamanho {#tempo-e-tamanho}

Medido em 2026-10-08, num macOS arm64 com Node 22.22.3 (máquina compartilhada, com variação):

| Lote    | Tempo                               |
| ------- | ----------------------------------- |
| 10 000  | 0,25 a 0,29 s, em qualquer formato  |
| 100 000 | 1,8 a 2,1 s (ndjson: 1,84 a 1,88 s) |

| Formato, com 100 000 pessoas | Tamanho   | Memória  |
| ---------------------------- | --------- | -------- |
| json                         | 162 MiB   | ~1,5 GB  |
| ndjson                       | 115,2 MiB | ~130 MiB |
| csv                          | 44,9 MiB  | ~130 MiB |
| sql                          | 98,7 MiB  | ~130 MiB |

Os outros números estão em [Números](../referencia/numeros.md).
