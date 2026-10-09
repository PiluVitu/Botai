---
title: Servidor como biblioteca
description: O subpath /servidor no Node, com responder (função pura), criarServidor e iniciarServidor, os mesmos do botai serve.
sidebar_position: 7
---

O subpath `/servidor` é o servidor HTTP do `botai serve`, para usar de dentro de um programa ou de um teste em Node. Ele só roda no Node (usa o `node:http`).

| Exporta                            | O que é                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `responder(metodo, alvo)`          | função pura: recebe o método e o caminho com a query, devolve a resposta |
| `criarServidor()`                  | um `http.Server` do Node com as rotas, ainda sem escutar                 |
| `iniciarServidor({ porta, host })` | sobe o servidor e devolve `{ servidor, url, encerrar }`                  |
| `PORTA_PADRAO`, `HOST_PADRAO`      | `8790` e `'127.0.0.1'`                                                   |
| `LIMITE_DE_PESSOAS`                | `10000`, o maior `n` por requisição                                      |
| `ROTAS`                            | `['/pessoa', '/pessoas', '/saude']`                                      |
| `TIPO_POR_FORMATO`                 | o `Content-Type` de cada formato                                         |

As rotas, os parâmetros e as mensagens de erro são os da [API HTTP](../servidor/api-http.md).

## `responder`: sem rede

`responder` não abre porta nem lê socket. Recebe `'GET'` e um alvo como `'/pessoa?semente=42&hoje=2026-10-05'` e devolve `{ status, cabecalhos, corpo }`, com o corpo em texto.

```js
import { responder } from '@pilutech/botai-core/servidor'

const r = responder('GET', '/pessoa?semente=42&hoje=2026-10-05')
console.log(r.status, r.cabecalhos)
console.log(JSON.parse(r.corpo).pessoa.cpf)

const erro = responder('GET', '/pessoa?uf=XX')
console.log(erro.status, erro.corpo)
```

```text
200 {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Content-Type': 'application/json; charset=utf-8'
}
634.132.403-07
400 {
  "erro": "uf: uf desconhecida \"XX\" (use uma das 27 siglas, ex.: SP)"
}
```

Os outros erros saem do mesmo jeito:

```js
import { responder } from '@pilutech/botai-core/servidor'

for (const [metodo, alvo] of [
  ['POST', '/pessoa'],
  ['GET', '/nada'],
  ['GET', '/pessoas?n=10001'],
  ['GET', '/pessoa?dominio-email=x.com'],
]) {
  const r = responder(metodo, alvo)
  console.log(r.status, r.cabecalhos.Allow ?? '-', JSON.parse(r.corpo).erro)
}
```

```text
405 GET método POST não aceito: use GET
404 - rota desconhecida: /nada (rotas: /pessoa, /pessoas, /saude)
400 - n inválido: 10001 (um inteiro de 1 a 10000)
400 - parâmetro desconhecido: dominio-email (aceitos: semente, hoje, uf, dominioEmail, cartao, cenario)
```

## `iniciarServidor`: o servidor no ar

`iniciarServidor` escuta em `127.0.0.1:8790` por padrão. Com `porta: 0`, o sistema escolhe uma porta livre, e a `url` devolvida já traz a porta. `encerrar()` fecha o servidor e devolve uma Promise.

```js
import { iniciarServidor } from '@pilutech/botai-core/servidor'

const { url, encerrar } = await iniciarServidor({ porta: 0 })
const resposta = await fetch(`${url}/saude`)
console.log(resposta.status, await resposta.json())
await encerrar()
```

```text
200 { ok: true, formato: 2, motor: '0.5.0' }
```

É o que o `botai serve` faz. Pelo terminal, a mesma rota responde igual:

```bash testar
curl -fsS 'http://127.0.0.1:8790/saude'
```

## `criarServidor`: você escolhe onde escutar

`criarServidor()` devolve um `http.Server` do Node que ainda não escuta. Chame `listen` como em qualquer servidor do Node.

```js
import { criarServidor } from '@pilutech/botai-core/servidor'

const servidor = criarServidor()
servidor.listen(0, '127.0.0.1', async () => {
  const { port } = servidor.address()
  const r = await fetch(
    `http://127.0.0.1:${port}/pessoas?n=2&semente=carga&hoje=2026-10-05&formato=csv&campos=nome,cpf`,
  )
  console.log(r.headers.get('content-type'))
  console.log(await r.text())
  servidor.close()
})
```

```text
text/csv; charset=utf-8; header=present
nome,cpf
Felipe Ferreira Alves,742.362.591-41
Júlia Ribeiro Carvalho,107.696.435-40
```

## Os mesmos limites do `botai serve`

O servidor da biblioteca é o mesmo do `botai serve`: só GET, sem CORS, sem TLS e sem autenticação, com o corpo inteiro montado em memória e no máximo 10 000 pessoas por requisição. É para testes, scripts e back-end, nunca para o front-end chamar por `fetch`. Veja [Segurança e limites](../servidor/seguranca-e-limites.md).
