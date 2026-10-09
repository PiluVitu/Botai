---
title: Números
description: Os números medidos na auditoria de 2026-10-08, com a máquina de cada medida, da confiabilidade à velocidade e aos tamanhos.
sidebar_position: 4
---

Os números desta página vêm da auditoria de 2026-10-08, feita no core 0.4.1, no fixture do Playwright 0.1.0 e na extensão 1.0.0. Salvo indicação, a máquina foi um **macOS arm64 com Node 22.22.3**. Ela era compartilhada, então os tempos variam entre rodadas: por isso as faixas.

## Confiabilidade {#confiabilidade}

| Métrica                                      | Valor                                                                                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Testes automatizados rodados, todos passando | **1 454**: core Jest 877 (46 suítes), extensão Vitest 465 (47 arquivos), extensão E2E 26, fixture Jest 17 e fixture E2E 69 (23 × 3 navegadores) |
| Mesma pessoa entre portas                    | 15 saídas, 43 de 43 campos iguais ([Semente e hoje](../conceitos/semente-e-hoje.md#reproduzir))                                                 |
| Dourados                                     | 12 de 12 em cada runtime; inalterados da 0.2.0 à 0.4.1 ([Versões e dourados](../conceitos/versoes-e-dourados.md#dourados))                      |
| Coerência                                    | 15 regras, cada uma em 10 000 de 10 000 pessoas; 0 falhas em 100 000 ([A pessoa](../conceitos/a-pessoa.md#coerencia))                           |
| Unicidade                                    | 100 000 CPFs, 100 000 e-mails e 100 000 CNPJs distintos num lote de 100 000 ([Lote e unicidade](../conceitos/lote-e-unicidade.md#unicidade))    |
| Geradores avulsos                            | 20 000 de 20 000 válidos no próprio validador (CPF, CNPJ, RG, PIS e título); título nas 27 UFs: 13 500 de 13 500                                |
| Erros de uso da CLI                          | 29 provocados, todos com saída 2 e stdout vazio                                                                                                 |

## Velocidade {#velocidade}

Medido em 2026-10-08, macOS arm64, Node 22.22.3 (Bun 1.3.14 e Deno 2.7.14 onde citados).

| Métrica                                                         | Valor                                                                                                |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 100 000 pessoas pela CLI                                        | 1,8 a 2,1 s (ndjson: 1,84 a 1,88 s)                                                                  |
| 100 000 pessoas pelo binário darwin-arm64                       | 1,32 s                                                                                               |
| 100 000 pessoas pela biblioteca                                 | Node 1,8 a 2,7 s; Bun 0,83 a 0,94 s; Deno 1,18 a 1,22 s                                              |
| 10 000 pessoas pela CLI                                         | 0,25 a 0,29 s, em qualquer formato                                                                   |
| 10 000 pessoas pela biblioteca                                  | Node 160 a 204 ms (462 ms numa rodada com a checagem das regras); Bun 83 a 124 ms; Deno 113 a 140 ms |
| 10 000 pessoas pelo HTTP                                        | json de 16,98 MB em 0,20 a 0,32 s                                                                    |
| Partida da CLI                                                  | Node 0,04 a 0,048 s; binário 17 ms                                                                   |
| `npx` com cache frio e quente                                   | 2,26 a 2,32 s e 0,89 s                                                                               |
| Preencher um formulário com o motor (21 campos, sem 2ª passada) | mediana de 0,8 ms, p95 de 1,7 ms                                                                     |
| `botai.preencher` do fixture                                    | 4 a 11 ms sem a 2ª passada; cerca de 1 s com ela                                                     |
| Imagem: até ficar `healthy` e até o `docker stop`               | 1 a 2 s e menos de 0,4 s (linux/arm64)                                                               |
| `GET /pessoa` em sequência, em localhost                        | cerca de 4 500 req/s (medição única)                                                                 |
| `/saude` durante um `GET /pessoas?n=10000`                      | 184 ms, contra 0,1 ms sozinho                                                                        |

Para medir na sua máquina:

```bash testar
time botai pessoas -n 100000 --semente carga --hoje 2026-10-05 --formato ndjson > /dev/null
```

## Limites e tamanhos {#tamanhos}

| Métrica                                       | Valor                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| Lote máximo                                   | 100 000 na CLI e na biblioteca; 10 000 por requisição HTTP                  |
| Semente                                       | até 256 caracteres                                                          |
| Saída de 100 000 pessoas                      | json 162 MiB; ndjson 115,2 MiB; csv 44,9 MiB; sql 98,7 MiB                  |
| Memória com 100 000 pessoas                   | json cerca de 1,5 GB de RSS; ndjson, csv e sql cerca de 130 MiB (streaming) |
| Pacote do core no npm                         | 95 arquivos, 216 339 bytes, **0 dependências** (pelo `npm view`)            |
| `navegador.iife.js`                           | 40 321 bytes, 1 215 linhas, 11 764 bytes em gzip                            |
| Bundle ESM do gerador com o motor             | 40 638 bytes minificado (15 448 em gzip)                                    |
| Imagem                                        | 62,7 MB de conteúdo (240 MB no disco)                                       |
| Binários                                      | de 62,3 MB (darwin-arm64) a 86,1 MB (windows-x64)                           |
| Extensão (zip)                                | Chrome e Firefox 297,9 K; Opera 364,3 K                                     |
| Tipos de campo reconhecidos e no menu Inserir | 38 e 23                                                                     |
| Cadastro realista                             | 21 de 23, na extensão e no fixture                                          |

Os limites por porta estão em [Limites](../limites.md).
