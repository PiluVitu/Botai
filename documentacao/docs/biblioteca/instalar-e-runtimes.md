---
title: Instalar e runtimes
description: O pacote @pilutech/botai-core no npm, ESM e sem dependências, em Node, Bun, Deno e no navegador com bundler.
sidebar_position: 1
---

A biblioteca é o pacote `@pilutech/botai-core` do npm. É o mesmo pacote da CLI e do servidor: o gerador, o classificador de campos e o motor de preenchimento estão nele.

## Instalar

```bash
npm i -D @pilutech/botai-core
```

Fixe a versão exata no `package.json` (`"@pilutech/botai-core": "0.5.0"`, sem `^`). Mudar a pessoa de uma semente é versão major; na série 0.x, é a minor. Veja [Versões e dourados](../conceitos/versoes-e-dourados.md).

## O pacote

- Só ESM, com tipos (`.d.ts`).
- **Nenhuma dependência de runtime.** O pacote da 0.5.0 tem 96 arquivos e 250 334 bytes (medido no `pnpm pack` do repositório, em 2026-10-09).
- 26 entradas em `exports`: 23 módulos (a raiz e 22 subpaths), os dois esquemas JSON do envelope (o v2 e o v1) e o `navegador.iife.js`. A lista está em [Referência de subpaths](./referencia-de-subpaths.md).
- O pacote não declara `engines`.

```js
import { gerarPessoa } from '@pilutech/botai-core'
import { validarCPF } from '@pilutech/botai-core/cpf'

const pessoa = gerarPessoa({ semente: 42, hoje: '2026-10-05' })
console.log(pessoa.cpf, validarCPF(pessoa.cpf))
```

```text
634.132.403-07 true
```

## Runtimes

| Runtime                 | Versões provadas                  | O que foi conferido                                                 |
| ----------------------- | --------------------------------- | ------------------------------------------------------------------- |
| Node                    | 22.22.3                           | 12 de 12 dourados e os 23 módulos importados                        |
| Node                    | 24                                | a CLI e o servidor (a imagem roda o Node 24.21.0)                   |
| Bun                     | 1.3.14                            | 12 de 12 dourados e os 23 módulos importados, com a mesma saída     |
| Deno                    | 2.7.14                            | 12 de 12 dourados e os 23 módulos importados, com a mesma saída     |
| Navegador (com bundler) | Chromium, empacotado pelo esbuild | o gerador e o motor geraram na página o mesmo CPF que a CLI no Node |

A biblioteca no Node, no Bun e no Deno gera a mesma pessoa (43 de 43 campos iguais) que a CLI, o servidor, a imagem, os binários e o fixture do Playwright. Veja [Semente e hoje](../conceitos/semente-e-hoje.md).

:::caution[Não testado]

A prova no Bun e no Deno importou o mesmo `dist` do pacote. Instalar pelo gerenciador do Bun ou pelo especificador `npm:` do Deno não foi testado.

:::

### Sem WebCrypto, igual em todo runtime

O gerador não depende de WebCrypto. A semente vira um gerador assim:

```text
rngDeSemente(s) = sfc32(cyrb128(UTF-8 de NFC(String(s))))
```

Por isso `42` e `'42'` são a mesma semente, e um texto em NFC ou em NFD também.

### O que cada parte exige

| Parte                                | Onde roda                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| A raiz e os subpaths de dados        | Node, Bun, Deno e navegador                                                          |
| `/servidor`                          | só Node ([Servidor como biblioteca](./servidor-como-biblioteca.md))                  |
| `/navegador` e o `navegador.iife.js` | uma página com DOM, ou o jsdom com o shim de layout ([jsdom](../navegador/jsdom.md)) |

## No navegador

Com um bundler, a raiz e o subpath `/navegador` rodam inteiros na página. O bundle do esbuild com o gerador e o motor deu 40 638 bytes minificado, 15 448 em gzip (medido em 2026-10-08, macOS arm64). Veja [ESM com bundler](../navegador/esm-com-bundler.md).

Sem bundler, use o `navegador.iife.js`: ele traz só o motor, e a pessoa vem de fora como JSON. Veja [O navegador.iife.js](../navegador/iife.md).

## Em testes unitários

A pessoa com semente e `hoje` fixos serve de dado de teste reprodutível:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gerarPessoa } from '@pilutech/botai-core'
import { validarCPF } from '@pilutech/botai-core/cpf'

test('o cadastro aceita o CPF da pessoa', () => {
  const pessoa = gerarPessoa({ semente: 'cadastro-1', hoje: '2026-10-05' })
  assert.equal(validarCPF(pessoa.cpf), true)
})
```

:::caution[Não testado]

Os runtimes foram provados (Node, Bun e Deno); os runners de teste (Jest, Vitest, `node --test`, `bun test` e `deno test`) não foram testados um a um.

:::
