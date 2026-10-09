---
title: Receitas de banco de dados
sidebar_label: Receitas de banco
description: Semear o Postgres, o SQLite e o MySQL com o botai pessoas, com a tabela, o SQL pelo psql, o CSV pelo \copy e as colunas UNIQUE.
sidebar_position: 7
---

O `botai pessoas` gera os mesmos INSERTs em qualquer máquina, com a mesma semente, o mesmo `--hoje` e a mesma versão. Num lote, CPF, e-mail e CNPJ não se repetem, então o lote cabe em colunas UNIQUE.

O SQL traz só os INSERTs, sem `CREATE TABLE`: crie a tabela antes.

## A tabela {#a-tabela}

O README do core traz esta tabela para o Postgres. Ela recebe as 35 colunas, na ordem do CSV e do SQL, com UNIQUE no CPF, no e-mail e no CNPJ:

```sql
CREATE TABLE pessoas (
  nome text, prenome text, sobrenomes text, sexo text, nascimento date, idade integer,
  cpf text UNIQUE, rg text, rg_orgao_emissor text, rg_uf text, pis text, titulo_eleitor text,
  email text UNIQUE, email_usuario text, email_caixa_url text, senha text,
  celular text, celular_e164 text, cep text, logradouro text, numero text, complemento text,
  bairro text, cidade text, uf text, empresa_razao_social text, empresa_nome_fantasia text,
  empresa_cnpj text UNIQUE, cartao_bandeira text, cartao_numero text, cartao_titular text,
  cartao_validade text, cartao_cvv text, cartao_provedor text, cartao_cenario text
);
```

A `nascimento` sai como data ISO (`1976-10-02`) e a `idade` como número. O que cada coluna recebe está em [Colunas do CSV e do SQL](../referencia/colunas.md).

## Postgres {#postgres}

A importação no Postgres 16 foi provada pelos dois caminhos, com 1000 linhas.

Pelo SQL, com o `psql`:

```bash
botai pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql | psql "$DATABASE_URL"
```

Pelo CSV, com o `\copy` do `psql`:

```bash
botai pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato csv \
  | psql "$DATABASE_URL" -c "\copy pessoas FROM STDIN WITH (FORMAT csv, HEADER true)"
```

Onde houver Node e nada instalado, o mesmo pelo `npx`, com a versão fixa:

```bash
npx -y @pilutech/botai-core@0.5.0 pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql | psql "$DATABASE_URL"
```

Para conferir o arquivo antes de importar, gere-o e conte os INSERTs:

```bash testar
botai pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql > pessoas.sql
grep -c '^INSERT' pessoas.sql
```

```text
1000
```

### Esquema e colunas

`--tabela app.pessoas` escreve o INSERT num esquema. Com `--campos`, o INSERT nomeia só as colunas pedidas, e a tabela pode ter outras:

```bash testar
botai pessoas -n 2 --semente demo --hoje 2026-10-08 --formato sql --tabela app.clientes --campos nome,cpf,email
```

```sql
-- botai: formato 2, motor 0.5.0, semente demo, hoje 2026-10-08
INSERT INTO "app"."clientes" ("nome", "cpf", "email") VALUES ('Isabela Freitas Santos', '550.160.642-96', 'isabela-santos-7825@tuamaeaquelaursa.com');
INSERT INTO "app"."clientes" ("nome", "cpf", "email") VALUES ('Vitória Alves Carvalho', '843.495.439-70', 'vitoria-carvalho-1721@tuamaeaquelaursa.com');
```

## SQLite {#sqlite}

A importação no SQLite (sqlite3 3.51.0) foi provada. Com o DDL acima salvo em `tabela.sql`, crie a tabela e rode o SQL do dialeto `sqlite`:

```bash
sqlite3 teste.db < tabela.sql
botai pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql --dialeto sqlite | sqlite3 teste.db
```

O SQL do SQLite é igual, byte a byte, ao do Postgres. O `--dialeto sqlite` deixa a intenção clara no comando.

## MySQL {#mysql}

:::note[Documentado]

O texto do `--dialeto mysql` confere com o arquivo dourado do projeto, mas ninguém o importou num MySQL de verdade. O DDL da [tabela acima](#a-tabela) é do Postgres: no MySQL, crie uma tabela com as mesmas colunas, nos tipos dele.

:::

```bash testar
botai pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql --dialeto=mysql > pessoas-mysql.sql
```

O MySQL usa crases nos nomes e escapa a barra invertida. Veja o exemplo em [Um lote de pessoas](./pessoas.md#sql).

## Mais pessoas depois, sem colidir {#mais-pessoas-depois}

A unicidade vale só dentro de um lote: dois lotes com sementes diferentes podem repetir um CPF, e a segunda carga falha na coluna UNIQUE.

:::tip

Para crescer uma base, use a mesma semente e o mesmo `--hoje` com um `-n` maior, e pule as pessoas que já entraram. As primeiras k pessoas de um lote de n são o lote de k, e o lote de n inteiro não repete CPF, e-mail nem CNPJ.

:::

No SQL, a 1ª linha é o comentário `-- botai: …`. Depois de 1000 pessoas, as próximas 1000 começam na linha 1002:

```bash testar
botai pessoas -n 2000 --semente carga --hoje 2026-10-05 --formato sql | tail -n +1002 > proximas.sql
grep -c '^INSERT' proximas.sql
```

```text
1000
```

## Volume

Para lote grande, use sql, csv ou ndjson: eles escrevem aos poucos, em cerca de 130 MiB de memória com 100 000 pessoas. O json monta tudo na memória (cerca de 1,5 GB com 100 000). Os tempos e tamanhos estão em [Um lote de pessoas](./pessoas.md#tempo-e-tamanho).
