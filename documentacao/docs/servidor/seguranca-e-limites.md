---
title: Segurança e limites
description: O que o servidor do Botaí não faz (CORS, TLS, autenticação, HEAD, IPv6) e os limites de tamanho e de memória de cada requisição.
sidebar_position: 3
---

O `botai serve` é para testes, scripts e back-end, numa máquina ou numa rede de teste. Ele não é um serviço para expor nem para o front-end chamar.

## Sem CORS, TLS nem autenticação {#sem-cors}

- **Sem CORS.** O servidor não manda cabeçalho de CORS. Um front-end de outra origem que chame por `fetch` recebe "Failed to fetch" (provado no Chromium). Chame o servidor do seu back-end, do teste ou do script.
- **Sem TLS.** Só `http://`.
- **Sem autenticação.** Quem alcança a porta, chama.

Para preencher uma página no navegador, quem chama o servidor é o teste, não a página: a pessoa vai como argumento para o motor (veja [O IIFE](../navegador/iife.md)).

## Quem alcança o servidor {#endereco}

- Por padrão, o servidor escuta só em `127.0.0.1`, em IPv4. Pedidos para `[::1]` ou para o IP da máquina na rede local são recusados. Um cliente que tente só `::1` falha: escreva `127.0.0.1` na URL.
- `--host 0.0.0.0` abre o servidor à rede. Sem autenticação, qualquer máquina que alcance a porta gera pessoas nele. Use só numa rede de teste. A imagem Docker escuta em `0.0.0.0` dentro do contêiner, e o `-p` do `docker run` decide a porta de fora (veja [Imagem Docker](../docker/imagem.md)).

## Só GET {#so-get}

HEAD e OPTIONS dão 405, com o cabeçalho `Allow: GET`. Um health check que use HEAD marca o serviço como fora do ar. Use `GET /saude`, como faz o HEALTHCHECK da imagem.

```bash testar
curl -sS -o /dev/null -w '%{http_code}\n' -I http://127.0.0.1:8790/saude
```

```text
405
```

O `/saude` ignora parâmetros que não conhece. O `/pessoa` e o `/pessoas` respondem 400 a eles.

## Tamanho de cada requisição {#tamanho}

- O `n` vai de 1 a 10 000 por requisição. Para um lote maior, use a [CLI](../cli/pessoas.md) ou a [biblioteca](../biblioteca/gerar-pessoas.md), que vão até 100 000. A unicidade de e-mail, CPF e CNPJ vale só dentro do mesmo lote: duas requisições são dois lotes.
- O servidor monta o corpo inteiro em memória, sem streaming. Uma requisição grande trava as outras enquanto é montada: o `/saude` levou 184 ms durante um pedido com `n=10000`, contra 0,1 ms sozinho (medido em 2026-10-08, macOS arm64, Node 22.22.3).

## Números {#numeros}

Medidos em 2026-10-08, num macOS arm64 com Node 22.22.3. A máquina era compartilhada, então há variação.

| Medida                                | Valor                                |
| ------------------------------------- | ------------------------------------ |
| 10 000 pessoas em JSON por `/pessoas` | 16,98 MB, em 0,20 a 0,32 s           |
| `GET /pessoa` em sequência, localhost | cerca de 4 500 req/s (medição única) |
| `/saude` sozinho                      | 0,1 ms                               |
| `/saude` durante um `n=10000`         | 184 ms                               |

Os outros números estão em [Números](../referencia/numeros.md).

## Os dados {#dados}

O CPF, o CNPJ e o celular gerados podem pertencer a uma pessoa real, e a caixa de e-mail padrão é pública: quem souber o endereço lê. Use só em localhost e em staging, nunca para criar conta real. Com `dominioEmail`, o e-mail vai para o seu domínio e a `caixaUrl` vira `null`. Mais em [Uso responsável](../conceitos/uso-responsavel.md).
