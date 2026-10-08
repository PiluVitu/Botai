---
title: Mensagens de erro
description: As mensagens reais da CLI e do servidor HTTP do Botaí, com o código de saída ou o status HTTP de cada uma.
sidebar_position: 3
---

## Servidor {#servidor}

O `botai serve` erra de dois jeitos. Na partida, ele escreve uma linha no stderr e o processo termina. Depois de no ar, um pedido errado recebe um status HTTP e um JSON `{"erro": "..."}`, e o servidor continua atendendo.

### Erros de partida {#servidor-partida}

A linha começa com `botai:`. O código de saída 1 é a porta ocupada; os erros de uso saem com 2.

| Mensagem no stderr                                                                                                  | Saída | Quando                                |
| ------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------- |
| `botai: a porta 8790 já está em uso em 127.0.0.1; escolha outra com --porta`                                        | 1     | outro processo já escuta nessa porta  |
| `botai: --porta inválida: 70000 (de 0 a 65535; 0 escolhe uma livre)`                                                | 2     | porta fora de 0 a 65535               |
| `botai: sem permissão para a porta 80 em 127.0.0.1 (abaixo de 1024 costuma exigir root); escolha outra com --porta` | 2     | o sistema não deixa abrir a porta     |
| `botai: --host inválido: 10.255.255.1 (use um endereço desta máquina, como 127.0.0.1 ou 0.0.0.0)`                   | 2     | o endereço não é desta máquina        |
| `botai: argumento inesperado: extra (uso: botai serve [--porta 8790] [--host 127.0.0.1])`                           | 2     | sobrou um argumento depois do `serve` |

Mais sobre a partida em [Subir o servidor](../servidor/botai-serve.md#erros-de-partida).

### Erros das rotas {#servidor-rotas}

Toda resposta de erro é JSON, com `Content-Type: application/json; charset=utf-8`:

```json
{
  "erro": "n inválido: 10001 (um inteiro de 1 a 10000)"
}
```

A mensagem diz qual parâmetro está errado. Os exemplos abaixo são as respostas reais aos pedidos da coluna "Pedido".

| Status | Pedido                                   | `erro`                                                                                                      |
| ------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 400    | `/pessoa?dominio-email=example.com`      | `parâmetro desconhecido: dominio-email (aceitos: semente, hoje, uf, dominioEmail)`                          |
| 400    | `/pessoas?n=2&x=1`                       | `parâmetro desconhecido: x (aceitos: semente, hoje, uf, dominioEmail, n, formato, dialeto, tabela, campos)` |
| 400    | `/pessoa?semente=1&semente=2`            | `parâmetro repetido: semente`                                                                               |
| 400    | `/pessoa?semente=`                       | `parâmetro vazio: semente`                                                                                  |
| 400    | `/pessoas?semente=x`                     | `falta o n (de 1 a 10000)`                                                                                  |
| 400    | `/pessoas?n=10001`                       | `n inválido: 10001 (um inteiro de 1 a 10000)`                                                               |
| 400    | `/pessoas?n=2&formato=xml`               | `formato inválido: xml (use json, ndjson, csv, sql)`                                                        |
| 400    | `/pessoas?n=2&dialeto=mysql`             | `dialeto só vale com formato=sql`                                                                           |
| 400    | `/pessoas?n=2&formato=csv&tabela=x`      | `tabela só vale com formato=sql`                                                                            |
| 400    | `/pessoas?n=2&campos=nome`               | `campos só vale com formato=csv ou formato=sql`                                                             |
| 400    | `/pessoas?n=2&formato=sql&dialeto=MySQL` | `dialeto desconhecido "MySQL" (use postgres, mysql, sqlite)`                                                |
| 400    | `/pessoas?n=2&formato=sql&tabela=a.b.c`  | `tabela inválida "a.b.c" (letras, dígitos e _, até 63 caracteres; opcionalmente esquema.tabela)`            |
| 400    | `/pessoa?uf=XX`                          | `uf: uf desconhecida "XX" (use uma das 27 siglas, ex.: SP)`                                                 |
| 400    | `/pessoa?hoje=05/10/2026`                | `hoje: hoje precisa ser uma data AAAA-MM-DD que existe, recebido "05/10/2026"`                              |
| 400    | `/pessoa?dominioEmail=nao%20dominio`     | `dominioEmail: domínio de e-mail inválido "nao dominio" (ex.: example.com)`                                 |
| 404    | `/nada`                                  | `rota desconhecida: /nada (rotas: /pessoa, /pessoas, /saude)`                                               |
| 405    | `POST /pessoa`                           | `método POST não aceito: use GET`, com o cabeçalho `Allow: GET`                                             |

- Coluna desconhecida em `campos` também dá 400. A mensagem começa com `campos: coluna desconhecida "xyz"` e lista as 33 colunas aceitas (estão em [Colunas](./colunas.md)).
- HEAD e OPTIONS também dão 405 com `Allow: GET`. Na resposta a HEAD não vem corpo.
- O `/saude` ignora parâmetros que não conhece e responde 200.

Para mostrar a resposta de erro num script, use `curl -sS`, que sai com 0. Com `curl -fsS`, o curl não imprime o corpo e sai com 22 em qualquer status 400 ou mais:

```bash testar
curl -sS 'http://127.0.0.1:8790/pessoas?n=10001'
```

```bash testar=22
curl -fsS 'http://127.0.0.1:8790/pessoas?n=10001'
```

A API inteira está em [API HTTP](../servidor/api-http.md).
