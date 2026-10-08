---
title: Envelope e esquema
description: O envelope que leva a pessoa com a semente, o hoje e a versão que a reproduzem, e o JSON Schema 2020-12 que vai no pacote.
sidebar_position: 4
---

O envelope é o JSON que leva a pessoa (ou o lote) junto com o que a reproduz: a semente, o hoje e a versão do motor. A CLI, o servidor, a biblioteca e o fixture do Playwright usam o mesmo envelope.

## Os campos {#campos}

| Campo     | O que é                                                                                      |
| --------- | -------------------------------------------------------------------------------------------- |
| `formato` | a forma do envelope. Hoje é sempre `1`; muda quando a forma muda                             |
| `motor`   | a versão do pacote que gerou os dados, como `0.4.1`                                          |
| `semente` | a semente usada, sempre como texto (`42` sai `"42"`); se você não passou, a que foi sorteada |
| `hoje`    | o dia usado, em `AAAA-MM-DD`; se você não passou, a data de hoje em São Paulo                |
| `pessoa`  | a pessoa, no envelope de uma pessoa ([A pessoa](./a-pessoa.md))                              |
| `pessoas` | a lista de pessoas, no envelope do lote                                                      |

O envelope de uma pessoa tem `pessoa`; o do lote tem `pessoas`, e a `semente` é a do lote:

```bash testar
botai pessoas -n 2 --semente demo --hoje 2026-10-08 | head -n 6
```

```text
{
  "formato": 1,
  "motor": "0.4.1",
  "semente": "demo",
  "hoje": "2026-10-08",
  "pessoas": [
```

## Onde ele aparece {#onde}

| Porta      | Envelope de uma pessoa                              | Envelope do lote                                                                 |
| ---------- | --------------------------------------------------- | -------------------------------------------------------------------------------- |
| CLI        | `botai pessoa`                                      | `botai pessoas` (json, o padrão); no ndjson, um envelope de uma pessoa por linha |
| Servidor   | `GET /pessoa`                                       | `GET /pessoas` com `formato=json`; com `formato=ndjson`, um por linha            |
| Biblioteca | `gerarEnvelopeDaPessoa(opcoes?)`                    | `gerarEnvelopeDasPessoas(n, opcoes?)`                                            |
| Fixture    | o anexo `botai-pessoa.json`, só em falha inesperada | —                                                                                |

No ndjson, cada linha leva a semente exata da sua pessoa (`demo/0`, `demo/1`…), e não a do lote ([Lote e unicidade](./lote-e-unicidade.md)). Na biblioteca, `gerarPessoa` e `gerarPessoas` devolvem só a pessoa e a lista, sem envelope.

O CSV e o SQL não têm envelope. O SQL leva os mesmos dados numa 1ª linha de comentário; o CSV não leva nada, e a semente sorteada sai no stderr ([Semente e hoje](./semente-e-hoje.md#semente)).

```bash testar
botai pessoas -n 2 --semente demo --hoje 2026-10-08 --formato sql | head -n 1
```

```sql
-- botai: formato 1, motor 0.4.1, semente demo, hoje 2026-10-08
```

O `/saude` do servidor responde com o `formato` e o `motor`, sem pessoa:

```bash testar
curl -fsS 'http://127.0.0.1:8790/saude'
```

```json
{
  "ok": true,
  "formato": 1,
  "motor": "0.4.1"
}
```

## O JSON Schema {#json-schema}

O pacote leva o contrato do envelope em JSON Schema 2020-12:

```text
@pilutech/botai-core/esquema/envelope-v1.schema.json
```

- Aceita os dois envelopes (`oneOf`): o de uma pessoa e o do lote.
- `formato` é a constante `1`.
- Todo objeto tem `additionalProperties: false`: um campo a mais reprova.
- `semente` é texto de 1 a 256 caracteres, e `hoje` segue `AAAA-MM-DD`.
- Não tem `$id`.

Serve de contrato entre linguagens: quem lê o JSON da CLI ou do servidor confere a forma antes de usar os campos. O validador provado é o Ajv 8.20, em JS:

```js title="validar.mjs"
import { readFileSync } from 'node:fs'
import Ajv2020 from 'ajv/dist/2020.js'
import esquema from '@pilutech/botai-core/esquema/envelope-v1.schema.json' with { type: 'json' }

const validar = new Ajv2020().compile(esquema)

const envelope = JSON.parse(readFileSync('pessoa.json', 'utf8'))
console.log(validar(envelope))

for (const linha of readFileSync('lote.ndjson', 'utf8').trim().split('\n'))
  if (!validar(JSON.parse(linha))) console.log(validar.errors)
```

Com `pessoa.json` de `botai pessoa --semente 42 --hoje 2026-10-05` e `lote.ndjson` de `botai pessoas -n 3 --semente demo --hoje 2026-10-08 --formato ndjson`, o script imprime `true` e nada mais. Use a classe `Ajv2020`: a `Ajv` padrão não conhece o 2020-12 e falha ao compilar, com `no schema with key or ref "https://json-schema.org/draft/2020-12/schema"`.
