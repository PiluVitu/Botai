---
title: Visão plana, CSV e SQL
description: O subpath /plano com pessoaPlana, as 35 COLUNAS, lerCampos, paraCsv e paraSql nos dialetos postgres, mysql e sqlite.
sidebar_position: 5
---

O subpath `/plano` achata a pessoa em 35 colunas e a escreve em CSV ou em SQL. É o mesmo código do `--formato csv` e do `--formato sql` da CLI e do servidor.

## A visão plana

`pessoaPlana(pessoa)` devolve um objeto com as 35 colunas de `COLUNAS`, nesta ordem. `idade` é número; `email_caixa_url` é `null` com domínio próprio; o resto é texto.

```js
import { gerarPessoa } from '@pilutech/botai-core'
import { COLUNAS, pessoaPlana } from '@pilutech/botai-core/plano'

const plana = pessoaPlana(gerarPessoa({ semente: 42, hoje: '2026-10-05' }))
console.log(COLUNAS.length, plana.nome, plana.idade, plana.email_caixa_url)
```

```text
35 Márcio Carvalho Rodrigues 56 https://tuamaeaquelaursa.com/marcio-rodrigues-0337
```

As 35 colunas, com o campo da pessoa de onde cada uma vem, estão em [Colunas](../referencia/colunas.md).

## Escolher as colunas: `lerCampos`

`lerCampos('a,b,c')` lê uma lista separada por vírgula, a mesma do `--campos` da CLI, e devolve as colunas na ordem pedida. Coluna desconhecida, repetida ou lista vazia lançam erro.

## CSV

`paraCsv(pessoas, colunas?)` escreve o CSV no padrão RFC 4180: cabeçalho, linhas terminadas em CRLF e `null` como campo vazio. Sem `colunas`, vão as 33.

```js
import { gerarPessoas } from '@pilutech/botai-core'
import { lerCampos, paraCsv } from '@pilutech/botai-core/plano'

const lote = gerarPessoas(3, { semente: 'carga', hoje: '2026-10-05' })
process.stdout.write(paraCsv(lote, lerCampos('nome,cpf,email')))
```

```csv
nome,cpf,email
Felipe Ferreira Alves,742.362.591-41,felipe-alves-6504@tuamaeaquelaursa.com
Júlia Ribeiro Carvalho,107.696.435-40,julia-carvalho-1331@tuamaeaquelaursa.com
Gabriela Pereira Monteiro,650.058.034-67,gabriela-monteiro-0259@tuamaeaquelaursa.com
```

O texto é igual, byte a byte, ao da CLI com a mesma semente e o mesmo `hoje`:

```bash testar
botai pessoas -n 3 --semente carga --hoje 2026-10-05 --formato csv --campos nome,cpf,email
```

Para escrever aos poucos, sem montar o texto inteiro, use `cabecalhoCsv(colunas?)` uma vez e `linhaCsv(pessoa, colunas?)` para cada pessoa.

## SQL

`paraSql(pessoas, opcoes?)` escreve um `INSERT` por pessoa. As opções:

| Opção     | Valor                                                   | Sem ela      |
| --------- | ------------------------------------------------------- | ------------ |
| `dialeto` | `'postgres'`, `'mysql'` ou `'sqlite'`                   | `'postgres'` |
| `tabela`  | `tabela` ou `esquema.tabela`, com letras, dígitos e `_` | `'pessoas'`  |
| `colunas` | uma lista de `lerCampos`                                | as 35        |

```js
import { gerarPessoas } from '@pilutech/botai-core'
import { lerCampos, paraSql } from '@pilutech/botai-core/plano'

const lote = gerarPessoas(2, { semente: 'carga', hoje: '2026-10-05' })
const colunas = lerCampos('nome,idade,cpf,email')
process.stdout.write(
  paraSql(lote, { dialeto: 'postgres', tabela: 'public.pessoas', colunas }),
)
process.stdout.write(
  paraSql(lote, { dialeto: 'mysql', tabela: 'app.pessoas', colunas }),
)
```

```sql
INSERT INTO "public"."pessoas" ("nome", "idade", "cpf", "email") VALUES ('Felipe Ferreira Alves', 49, '742.362.591-41', 'felipe-alves-6504@tuamaeaquelaursa.com');
INSERT INTO "public"."pessoas" ("nome", "idade", "cpf", "email") VALUES ('Júlia Ribeiro Carvalho', 65, '107.696.435-40', 'julia-carvalho-1331@tuamaeaquelaursa.com');
INSERT INTO `app`.`pessoas` (`nome`, `idade`, `cpf`, `email`) VALUES ('Felipe Ferreira Alves', 49, '742.362.591-41', 'felipe-alves-6504@tuamaeaquelaursa.com');
INSERT INTO `app`.`pessoas` (`nome`, `idade`, `cpf`, `email`) VALUES ('Júlia Ribeiro Carvalho', 65, '107.696.435-40', 'julia-carvalho-1331@tuamaeaquelaursa.com');
```

- `idade` sai como número e `null` como `NULL`.
- Postgres e SQLite saem iguais byte a byte; só o MySQL muda: crases nos nomes e a barra invertida escapada.
- Só há `INSERT`, sem `CREATE TABLE`: crie a tabela antes. Um `CREATE TABLE` de Postgres com as 35 colunas está em [Receitas de banco](../cli/receitas-de-banco.md).
- A CLI e o servidor escrevem, antes dos `INSERT`, uma linha `-- botai: formato 2, motor 0.5.0, semente …, hoje …`. O `paraSql` não escreve essa linha.

Para um `INSERT` só, use `insertSql(pessoa, opcoes?)`, com as mesmas opções.

### No SQLite do Node

O SQL do dialeto `sqlite` roda no `node:sqlite`. Num lote de 500, as 500 linhas voltaram iguais à `pessoaPlana` de cada pessoa.

```js
import { DatabaseSync } from 'node:sqlite'
import { gerarPessoas } from '@pilutech/botai-core'
import { COLUNAS, paraSql } from '@pilutech/botai-core/plano'

const db = new DatabaseSync(':memory:')
db.exec(`CREATE TABLE pessoas (${COLUNAS.map((c) => `"${c}"`).join(', ')})`)
db.exec(
  paraSql(gerarPessoas(500, { semente: 'sqlite', hoje: '2026-10-05' }), {
    dialeto: 'sqlite',
  }),
)
console.log(
  db
    .prepare('SELECT count(*) AS n, count(DISTINCT cpf) AS cpfs FROM pessoas')
    .get(),
)
```

```text
[Object: null prototype] { n: 500, cpfs: 500 }
```

## Validar tabela, dialeto e colunas

`lerTabela(texto)` e `lerDialeto(texto)` conferem o texto antes de ele entrar no SQL. Junto com `lerCampos`, lançam `ErroDoPlano` com a mensagem:

```js
import { lerCampos, lerDialeto, lerTabela } from '@pilutech/botai-core/plano'

for (const ler of [
  () => lerTabela('x;drop'),
  () => lerTabela('a.b.c'),
  () => lerDialeto('MySQL'),
]) {
  try {
    ler()
  } catch (erro) {
    console.log(`${erro.name}: ${erro.message}`)
  }
}
```

```text
ErroDoPlano: tabela inválida "x;drop" (letras, dígitos e _, até 63 caracteres; opcionalmente esquema.tabela)
ErroDoPlano: tabela inválida "a.b.c" (letras, dígitos e _, até 63 caracteres; opcionalmente esquema.tabela)
ErroDoPlano: dialeto desconhecido "MySQL" (use postgres, mysql, sqlite)
```

O dialeto diferencia maiúsculas: `MySQL` é recusado.

O SQL foi importado de verdade no Postgres 16 e no SQLite.

:::note[Documentado]

O dialeto `mysql` não foi importado num banco real. O que se sabe vem da comparação com o arquivo dourado: o texto confere com ele.

:::
