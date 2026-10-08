---
title: Imagem Docker
description: O servidor e a CLI do Botaí pela imagem ghcr.io/piluvitu/botai, sem instalar Node, com a porta, o HEALTHCHECK, o usuário e as tags.
sidebar_position: 1
---

A imagem `ghcr.io/piluvitu/botai` traz o servidor HTTP e a CLI inteira. Você não precisa de Node na máquina. Fixe a versão exata: `ghcr.io/piluvitu/botai:0.4.1`.

```bash
docker pull ghcr.io/piluvitu/botai:0.4.1
```

A imagem é publicada para linux/amd64 e linux/arm64.

:::note[Documentado]

A auditoria de 2026-10-08 rodou só a arm64. A amd64 passa pela fumaça do CI do projeto antes de ser publicada (segundo o `CLAUDE.md` do core), mas ninguém a rodou na auditoria.

:::

## O servidor {#servidor}

Sem argumentos, a imagem sobe o `botai serve` na porta 8790:

```bash
docker run --rm -p 8790:8790 ghcr.io/piluvitu/botai:0.4.1
```

O contêiner fica `healthy` em 1 a 2 s (medido em 2026-10-08, macOS arm64). Confira de fora:

```bash testar
curl -fsS http://127.0.0.1:8790/saude
```

```json
{
  "ok": true,
  "formato": 1,
  "motor": "0.4.1"
}
```

As rotas e os parâmetros estão em [API HTTP](../servidor/api-http.md).

## Outra porta {#outra-porta}

O HEALTHCHECK olha a porta 8790 de dentro do contêiner. Mude a porta de fora com o `-p`, não com `--porta`:

```bash
docker run --rm -p 9000:8790 ghcr.io/piluvitu/botai:0.4.1
```

O servidor passa a responder em `http://127.0.0.1:9000`.

## A CLI pela imagem {#cli}

O `ENTRYPOINT` da imagem é o `botai`. O que vem depois do nome da imagem são os argumentos da CLI:

```bash
docker run --rm ghcr.io/piluvitu/botai:0.4.1 pessoa --semente 42 --hoje 2026-10-05
docker run --rm ghcr.io/piluvitu/botai:0.4.1 pessoas -n 3 --semente demo --hoje 2026-10-08 --formato csv --campos nome,cpf
docker run --rm ghcr.io/piluvitu/botai:0.4.1 validar cpf 634.132.403-07
```

A saída é a mesma da CLI instalada. O lote em CSV, por exemplo:

```bash testar
botai pessoas -n 3 --semente demo --hoje 2026-10-08 --formato csv --campos nome,cpf
```

```csv
nome,cpf
Isabela Freitas Santos,550.160.642-96
Vitória Alves Carvalho,843.495.439-70
Lucas Gabriel Pereira Oliveira,750.346.866-19
```

E o `validar`:

```bash testar
botai validar cpf 634.132.403-07
```

```text
válido
```

Os comandos estão em [CLI](../cli/visao-geral.md).

## O que tem dentro {#dentro}

| Item          | Valor                                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Usuário       | sem root: `uid=1000(node)`                                                                                                       |
| Runtime       | Node v24.21.0, como PID 1                                                                                                        |
| `ENTRYPOINT`  | `["botai"]`                                                                                                                      |
| `CMD`         | `["serve","--host","0.0.0.0","--porta","8790"]`                                                                                  |
| `EXPOSE`      | `8790`                                                                                                                           |
| `HEALTHCHECK` | `wget -q -T 2 -O /dev/null http://127.0.0.1:8790/saude`; interval 30s, timeout 3s, start-period 5s, start-interval 1s, retries 3 |
| Tamanho       | 62,7 MB de conteúdo, 240 MB no disco (medido em 2026-10-08, macOS arm64)                                                         |

O HEALTHCHECK usa GET: o servidor responde 405 a HEAD (veja [Segurança e limites](../servidor/seguranca-e-limites.md#so-get)).

## Encerrar {#encerrar}

O `docker stop` encerra o servidor em menos de 0,4 s, com código 0 (medido em 2026-10-08, macOS arm64).

## Tags {#tags}

As tags publicadas são `0.3.0`, `0.4.0`, `0.4.1` e `latest`, que tem o mesmo digest da `0.4.1`. Não existe tag de minor, como `:0.4`.

Fixe a versão exata. Mudar a pessoa que uma semente gera é versão major; na série 0.x, é a minor. Veja [Versões e dourados](../conceitos/versoes-e-dourados.md).

## A mesma pessoa {#mesma-pessoa}

A imagem gera a mesma pessoa que as outras portas, pelo HTTP e pela CLI: a semente `verificador-1` com o `hoje` 2026-10-05 deu 43 de 43 campos iguais nas 15 saídas comparadas. Os 12 dourados conferem pelo HTTP da imagem.

Em CI, veja [GitHub Actions](./github-actions.md). Ao lado da sua aplicação, veja [docker compose](./docker-compose.md).
