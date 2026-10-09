---
title: Colunas do CSV e do SQL
sidebar_label: Colunas
description: As 33 colunas da visão plana da pessoa, na ordem em que saem no CSV e no SQL, com o campo de origem, o tipo e um exemplo real.
sidebar_position: 1
---

O CSV e o SQL saem da visão plana da pessoa: 33 colunas, sempre nesta ordem. O `--campos` da CLI (e o `campos` do servidor) escolhe e reordena as colunas pelo nome.

## As 33 colunas {#as-33-colunas}

O exemplo é a primeira pessoa de `botai pessoas -n 1 --semente demo --hoje 2026-10-08 --formato csv`.

| #   | Coluna                  | Campo da pessoa               | Tipo             | Exemplo                                            |
| --- | ----------------------- | ----------------------------- | ---------------- | -------------------------------------------------- |
| 1   | `nome`                  | `nome.completo`               | texto            | `Isabela Freitas Santos`                           |
| 2   | `prenome`               | `nome.prenome`                | texto            | `Isabela`                                          |
| 3   | `sobrenomes`            | `nome.sobrenomes`, com espaço | texto            | `Freitas Santos`                                   |
| 4   | `sexo`                  | `nome.sexo`                   | texto            | `F`                                                |
| 5   | `nascimento`            | `nascimento.iso`              | texto (data ISO) | `1976-10-02`                                       |
| 6   | `idade`                 | `nascimento.idade`            | número           | `50`                                               |
| 7   | `cpf`                   | `cpf`                         | texto            | `550.160.642-96`                                   |
| 8   | `rg`                    | `rg.numero`                   | texto            | `19.031.287-7`                                     |
| 9   | `rg_orgao_emissor`      | `rg.orgaoEmissor`             | texto            | `SSP`                                              |
| 10  | `rg_uf`                 | `rg.uf`                       | texto            | `SP`                                               |
| 11  | `pis`                   | `pis`                         | texto            | `186.76364.37-6`                                   |
| 12  | `titulo_eleitor`        | `tituloEleitor`               | texto            | `3607 9513 2674`                                   |
| 13  | `email`                 | `email.endereco`              | texto            | `isabela-santos-7825@tuamaeaquelaursa.com`         |
| 14  | `email_usuario`         | `email.usuario`               | texto            | `isabela-santos-7825`                              |
| 15  | `email_caixa_url`       | `email.caixaUrl`              | texto ou nulo    | `https://tuamaeaquelaursa.com/isabela-santos-7825` |
| 16  | `senha`                 | `senha`                       | texto            | `a9eyHcQ!mM&Y`                                     |
| 17  | `celular`               | `celular.formatado`           | texto            | `(95) 99648-4003`                                  |
| 18  | `celular_e164`          | `celular.e164`                | texto            | `+5595996484003`                                   |
| 19  | `cep`                   | `endereco.cep`                | texto            | `69301-000`                                        |
| 20  | `logradouro`            | `endereco.logradouro`         | texto            | `Avenida Ville Roy`                                |
| 21  | `numero`                | `endereco.numero`             | texto            | `5826`                                             |
| 22  | `complemento`           | `endereco.complemento`        | texto            | `Apto 173`                                         |
| 23  | `bairro`                | `endereco.bairro`             | texto            | `Centro`                                           |
| 24  | `cidade`                | `endereco.cidade`             | texto            | `Boa Vista`                                        |
| 25  | `uf`                    | `endereco.uf`                 | texto            | `RR`                                               |
| 26  | `empresa_razao_social`  | `empresa.razaoSocial`         | texto            | `Freitas & Santos Serviços Digitais Ltda`          |
| 27  | `empresa_nome_fantasia` | `empresa.nomeFantasia`        | texto            | `Santos Store`                                     |
| 28  | `empresa_cnpj`          | `empresa.cnpj`                | texto            | `94.212.848/0001-28`                               |
| 29  | `cartao_bandeira`       | `cartao.bandeira`             | texto            | `visa`                                             |
| 30  | `cartao_numero`         | `cartao.numero`               | texto            | `4242424242424242`                                 |
| 31  | `cartao_titular`        | `cartao.titular`              | texto            | `ISABELA F SANTOS`                                 |
| 32  | `cartao_validade`       | `cartao.validade`             | texto            | `01/29`                                            |
| 33  | `cartao_cvv`            | `cartao.cvv`                  | texto            | `225`                                              |

O mesmo exemplo, como sai da CLI:

```bash testar
botai pessoas -n 1 --semente demo --hoje 2026-10-08 --formato csv
```

```csv
nome,prenome,sobrenomes,sexo,nascimento,idade,cpf,rg,rg_orgao_emissor,rg_uf,pis,titulo_eleitor,email,email_usuario,email_caixa_url,senha,celular,celular_e164,cep,logradouro,numero,complemento,bairro,cidade,uf,empresa_razao_social,empresa_nome_fantasia,empresa_cnpj,cartao_bandeira,cartao_numero,cartao_titular,cartao_validade,cartao_cvv
Isabela Freitas Santos,Isabela,Freitas Santos,F,1976-10-02,50,550.160.642-96,19.031.287-7,SSP,SP,186.76364.37-6,3607 9513 2674,isabela-santos-7825@tuamaeaquelaursa.com,isabela-santos-7825,https://tuamaeaquelaursa.com/isabela-santos-7825,a9eyHcQ!mM&Y,(95) 99648-4003,+5595996484003,69301-000,Avenida Ville Roy,5826,Apto 173,Centro,Boa Vista,RR,Freitas & Santos Serviços Digitais Ltda,Santos Store,94.212.848/0001-28,visa,4242424242424242,ISABELA F SANTOS,01/29,225
```

## Número e nulo

- `idade` é a única coluna numérica: no SQL, sai sem aspas (`50`).
- `email_caixa_url` é nula quando o e-mail usa um domínio seu (`--dominio-email`): no CSV, vira campo vazio; no SQL, `NULL`.

```bash testar
botai pessoas -n 1 --semente demo --hoje 2026-10-08 --dominio-email example.com --formato sql --campos email,email_caixa_url,idade
```

```sql
-- botai: formato 1, motor 0.4.1, semente demo, hoje 2026-10-08
INSERT INTO "pessoas" ("email", "email_caixa_url", "idade") VALUES ('isabela-santos-7825@example.com', NULL, 50);
```

## O que fica de fora

A pessoa em JSON tem 43 valores; a visão plana junta os sobrenomes numa coluna e deixa de fora os que repetem outro valor: `nome.noCartao` (igual ao `cartao_titular`), `nascimento.br`, `celular.ddd`, `celular.numero`, `celular.digitos`, `endereco.ddd`, `cartao.numeroFormatado`, `cartao.mes` e `cartao.ano`. Se você precisa deles, use o json ou o ndjson. Os campos da pessoa estão em [A pessoa](../conceitos/a-pessoa.md).

## Escolher as colunas

`--campos` recebe os nomes separados por vírgula e respeita a ordem. Só vale com csv e sql:

```bash testar
botai pessoas -n 2 --semente demo --hoje 2026-10-08 --formato csv --campos cpf,nome
```

```csv
cpf,nome
550.160.642-96,Isabela Freitas Santos
843.495.439-70,Vitória Alves Carvalho
```

Coluna que não existe, lista vazia e coluna repetida são erros de uso (saída 2). A mensagem lista as colunas aceitas:

```bash testar=2
botai pessoas -n 2 --formato csv --campos nome,xyz
```

```text
botai: campos: coluna desconhecida "xyz" (colunas: nome, prenome, sobrenomes, sexo, nascimento, idade, cpf, rg, rg_orgao_emissor, rg_uf, pis, titulo_eleitor, email, email_usuario, email_caixa_url, senha, celular, celular_e164, cep, logradouro, numero, complemento, bairro, cidade, uf, empresa_razao_social, empresa_nome_fantasia, empresa_cnpj, cartao_bandeira, cartao_numero, cartao_titular, cartao_validade, cartao_cvv)
```

## Onde mais

- Na CLI: [Um lote de pessoas](../cli/pessoas.md#campos).
- Na biblioteca: `COLUNAS`, `pessoaPlana` e `lerCampos`, no subpath `@pilutech/botai-core/plano` (veja [Plano, CSV e SQL](../biblioteca/plano-csv-sql.md)).
- No servidor: o parâmetro `campos` do `/pessoas`, com csv ou sql (veja [API HTTP](../servidor/api-http.md)).
