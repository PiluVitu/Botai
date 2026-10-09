---
title: Subir o servidor
description: Suba o servidor HTTP local do Botaí, escolha a porta e o endereço, confira se ele está no ar e saiba como ele encerra.
sidebar_position: 1
---

O `botai serve` sobe um servidor HTTP local com três rotas, todas por GET: `/pessoa`, `/pessoas` e `/saude`. Serve para testes e scripts em qualquer linguagem que fale HTTP. A pessoa é a mesma da CLI e da biblioteca para a mesma semente, o mesmo dia e a mesma versão.

## Subir {#subir}

Onde houver Node, sem instalar nada:

```bash
npx -y @pilutech/botai-core@0.4.1 serve
```

Com o [binário](../binarios/install-sh.md) instalado:

```bash
botai serve
```

Sem Node, pela [imagem Docker](../docker/imagem.md):

```bash
docker run --rm -p 8790:8790 ghcr.io/piluvitu/botai:0.4.1
```

Ao subir, o servidor escreve uma linha no stderr e fica no ar até você encerrar:

```text
botai serve: ouvindo em http://127.0.0.1:8790 (Ctrl+C encerra)
```

## Opções {#opcoes}

```text
botai serve [--porta 8790] [--host 127.0.0.1]
```

| Opção       | Padrão      | O que faz                                                                        |
| ----------- | ----------- | -------------------------------------------------------------------------------- |
| `--porta P` | `8790`      | a porta. `0` escolhe uma livre                                                   |
| `--host H`  | `127.0.0.1` | o endereço. `127.0.0.1` atende só esta máquina; `0.0.0.0` abre o servidor à rede |

As opções aceitam `=`: `--porta=9000` é o mesmo que `--porta 9000`. A ajuda sai com `botai serve --help`:

```text
botai serve: servidor HTTP local, GET /pessoa, /pessoas, /saude.

Uso: botai serve [--porta 8790] [--host 127.0.0.1]

Opções:
  --porta P   porta (padrão 8790; 0 escolhe uma livre)
  --host H    endereço (padrão 127.0.0.1, só esta máquina; 0.0.0.0 abre para a rede)

Parâmetros das rotas: os das flags da CLI em camelCase
(semente, hoje, uf, dominioEmail, n, formato, dialeto, tabela, campos).
```

## Porta livre {#porta-livre}

Com `--porta 0`, o sistema escolhe uma porta livre. A linha do stderr diz qual:

```text
botai serve: ouvindo em http://127.0.0.1:62654 (Ctrl+C encerra)
```

Leia a URL dessa linha para saber onde chamar.

## Conferir se está no ar {#conferir}

O `/saude` responde com o formato do envelope e a versão do motor:

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

Use GET. HEAD e OPTIONS dão 405 (veja [Segurança e limites](./seguranca-e-limites.md#so-get)).

## Quem alcança o servidor {#endereco}

Por padrão, o servidor escuta só em `127.0.0.1`, em IPv4. Pedidos para `[::1]` ou para o IP da máquina na rede local são recusados. Escreva `127.0.0.1` na URL do cliente.

`--host 0.0.0.0` abre o servidor à rede. Não há autenticação: quem alcança a porta, chama. A imagem Docker usa `0.0.0.0` dentro do contêiner. Antes de abrir, leia [Segurança e limites](./seguranca-e-limites.md).

## Encerrar {#encerrar}

Ctrl+C (SIGINT) e SIGTERM encerram o servidor com código 0:

```bash
kill -TERM <pid>
```

Na imagem, o `docker stop` encerra em menos de 0,4 s, também com código 0 (medido em 2026-10-08, macOS arm64).

## Erros de partida {#erros-de-partida}

Se o servidor não consegue subir, ele escreve uma linha no stderr e sai. Com a porta 8790 já ocupada:

```bash
botai serve
```

```text
botai: a porta 8790 já está em uso em 127.0.0.1; escolha outra com --porta
```

| Caso                                         | Saída |
| -------------------------------------------- | ----- |
| porta ocupada                                | 1     |
| `--porta 70000` (fora de 0 a 65535)          | 2     |
| `--porta 80` sem permissão                   | 2     |
| `--host` que não é endereço desta máquina    | 2     |
| argumento sobrando, como `botai serve extra` | 2     |

As mensagens de cada caso estão em [Mensagens de erro](../referencia/mensagens-de-erro.md#servidor-partida).

## Próximos passos

- [API HTTP](./api-http.md): as rotas, os parâmetros e os formatos.
- [Segurança e limites](./seguranca-e-limites.md): o que o servidor não faz e até onde ele vai.
- Clientes: [Python](../integracoes/python.md), [Go](../integracoes/go.md) e [Java](../integracoes/java.md).
