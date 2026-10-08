---
title: Versões e dourados
description: A política de versão do Botaí, como fixar a versão em cada porta e os arquivos dourados que travam a pessoa de cada semente.
sidebar_position: 6
---

A mesma semente e o mesmo hoje só geram a mesma pessoa na mesma versão do motor. Esta página diz quando a pessoa pode mudar e como conferir que não mudou.

## A política de versão {#politica}

Mudar a pessoa de uma semente é **versão major**. Na série 0.x, é a **minor**. Uma versão de correção (patch) nunca muda a pessoa.

Na prática, hoje: da 0.4.1 para outra 0.4.x, as pessoas ficam; numa 0.5.0, podem mudar.

:::note[Documentado]

A política vem do README do `@pilutech/botai-core`. A prova indireta rodou: os dourados gravados pelo motor 0.2.0 continuam batendo com a 0.4.1, então a 0.3.0, a 0.4.0 e a 0.4.1 não mudaram nenhuma pessoa.

:::

## Fixe a versão exata {#fixe-a-versao}

| Porta    | Como fixar                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| npx      | `npx -y @pilutech/botai-core@0.4.1 …`                                                                      |
| npm      | `npm install --save-dev --save-exact @pilutech/botai-core@0.4.1`                                           |
| imagem   | `ghcr.io/piluvitu/botai:0.4.1`. Não existe tag de minor (`:0.4`), e a `latest` só aponta para a 0.4.1 hoje |
| binário  | `BOTAI_VERSAO=0.4.1` no `install.sh`, ou o release `core-v0.4.1`                                           |
| fixture  | `npm install --save-dev --save-exact @pilutech/botai-playwright@0.1.0`                                     |
| extensão | não se aplica: a extensão sorteia cada pessoa                                                              |

O fixture do Playwright 0.1.0 depende do core 0.4.0 exato. A pessoa é a mesma da 0.4.1; só o anexo `botai-pessoa.json` diz `motor 0.4.0`.

## O campo motor {#motor}

O envelope diz qual versão gerou a pessoa, no campo `motor`; o SQL diz na 1ª linha. Para saber a versão da CLI que você tem:

```bash testar
botai --versao
```

```text
0.4.1
```

## Os dourados {#dourados}

Os dourados são 12 arquivos guardados em `packages/core/dourado/v1`, no [repositório](https://github.com/PiluVitu/Botai), que travam a saída de sementes escolhidas. Eles só são regravados quando a pessoa muda, ou seja, numa versão major (na 0.x, minor). O `indice.json`, ao lado, diz as opções de cada um.

| Arquivo                       | O que trava                                          |
| ----------------------------- | ---------------------------------------------------- |
| `pessoa-semente-numero.json`  | semente numérica (`42`, hoje `2026-10-05`)           |
| `pessoa-semente-texto.json`   | semente de texto (`botai`)                           |
| `pessoa-semente-unicode.json` | semente com acento e emoji                           |
| `pessoa-uf.json`              | a opção `uf` (`PI`)                                  |
| `pessoa-dominio-email.json`   | a opção `dominioEmail` (`example.com`)               |
| `pessoa-29-de-fevereiro.json` | hoje em 29 de fevereiro (`2028-02-29`)               |
| `pessoas-lote.json`           | um lote de 5 (semente `lote`, domínio `example.com`) |
| `pessoas-lote.csv`            | o mesmo lote em CSV                                  |
| `pessoas-lote.postgres.sql`   | o mesmo lote em SQL do Postgres                      |
| `pessoas-lote.mysql.sql`      | o mesmo lote em SQL do MySQL                         |
| `pessoas-lote.sqlite.sql`     | o mesmo lote em SQL do SQLite                        |
| `pessoas-1000.json`           | um lote de 1000 (semente `mil-3`), com 1,1 MB        |

Os dourados foram gravados pelo motor 0.2.0, e a pasta tem um commit só. Onde foram conferidos na 0.4.1:

| Onde                                                                     | Resultado                                     |
| ------------------------------------------------------------------------ | --------------------------------------------- |
| CLI local, binário darwin-arm64, HTTP do servidor local e HTTP da imagem | 12 de 12                                      |
| Biblioteca e CLI                                                         | 24 de 24 comparações                          |
| Node, Bun e Deno                                                         | 12 de 12 em cada                              |
| Fixture do Playwright                                                    | 6 de pessoa única por navegador (18 no total) |
| Extensão (Vitest)                                                        | 4 de 4                                        |

## Como comparar {#como-comparar}

Duas diferenças são esperadas e não contam:

- o campo `motor`, que muda a cada versão;
- a 1ª linha do SQL (`-- botai: …`), que a CLI e o servidor escrevem e o dourado não tem.

Tirando as duas, a saída é igual ao dourado, byte a byte:

```bash
git clone --depth 1 https://github.com/PiluVitu/Botai.git
cd Botai/packages/core/dourado/v1

diff <(botai pessoa --semente 42 --hoje 2026-10-05 | grep -v '"motor"') \
  <(grep -v '"motor"' pessoa-semente-numero.json) && echo "pessoa igual"

diff <(botai pessoas -n 5 --semente lote --hoje 2026-10-05 --dominio-email example.com \
  --formato sql --dialeto postgres | tail -n +2) pessoas-lote.postgres.sql && echo "SQL igual"

diff <(botai pessoas -n 5 --semente lote --hoje 2026-10-05 --dominio-email example.com \
  --formato csv) pessoas-lote.csv && echo "CSV igual"
```

```text
pessoa igual
SQL igual
CSV igual
```

O `tail -n +2` tira a 1ª linha do SQL gerado. O `grep -v '"motor"'` tira a linha do motor dos dois lados.
