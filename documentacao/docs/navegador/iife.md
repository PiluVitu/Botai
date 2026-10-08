---
title: O navegador.iife.js
description: O motor de preenchimento como um script, com um global só (__botaiNavegador) e um método (preencher), para qualquer ferramenta que execute JS na página.
sidebar_position: 1
---

O `navegador.iife.js` é o motor de preenchimento do Botaí num arquivo só. É o mesmo motor da extensão e do fixture do Playwright: acha os campos, reconhece cada um e escreve os valores da pessoa. Serve para qualquer ferramenta que execute JS na página.

No Playwright, prefira o fixture [`@pilutech/botai-playwright`](../playwright/o-fixture.md): ele já injeta o motor em todos os frames e resolve a pessoa pela semente do teste.

## A API {#api}

O script cria um único global, `__botaiNavegador`, com um único método:

```js
window.__botaiNavegador.preencher(
  alvo /* document | Element */,
  pessoa,
  'AAAA-MM-DD',
  { segundaPassada: true },
)
// → Promise<{ preenchidos, naoReconhecidos, recusados, contentType, iframesDeFora }>
// cada linha: { idx, rotulo, seletor }
```

| Parâmetro | O que é                                                                                      |
| --------- | -------------------------------------------------------------------------------------------- |
| `alvo`    | o `document`, um `Element` (um `form`, um `fieldset`, uma seção) ou um campo só              |
| `pessoa`  | o objeto `pessoa` do envelope, ou o que `gerarPessoa` devolve                                |
| `hoje`    | o `hoje` da pessoa, `AAAA-MM-DD`                                                             |
| opções    | `{ segundaPassada: true }` ou `{ segundaPassada: false }` ([a 2ª passada](#segunda-passada)) |

| No resultado      | O que é                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `preenchidos`     | os campos que receberam um valor e o mantiveram                                               |
| `naoReconhecidos` | os campos que o classificador não conhece, sem chute                                          |
| `recusados`       | os reconhecidos cujo valor não coube (o `maxlength`, sem truncar, ou um `select` sem a opção) |
| `contentType`     | o tipo do documento, como `text/html`                                                         |
| `iframesDeFora`   | quantos iframes de outra origem o documento tem ([Iframes e janelas](./iframes-e-janelas.md)) |

Cada linha das três listas é `{ idx, rotulo, seletor }`: o número do campo na chamada, o rótulo dele e um seletor CSS para achá-lo.

## Onde está o arquivo

O arquivo vai no pacote `@pilutech/botai-core`, na entrada `@pilutech/botai-core/navegador.iife.js`. Tem 40 321 bytes (11 764 em gzip). Num script Node, ache o caminho assim:

```js
import { createRequire } from 'node:module'

const IIFE = createRequire(import.meta.url).resolve(
  '@pilutech/botai-core/navegador.iife.js',
)
```

Ele traz só o motor: a pessoa vem de fora.

## De onde vem a pessoa

O motor recebe a pessoa pronta, como JSON. Ela pode vir:

- da biblioteca, com `gerarPessoa({ semente, hoje })` ([Gerar uma pessoa](../biblioteca/gerar-pessoa.md));
- da CLI ou do binário, com `botai pessoa --semente S --hoje D`: use `envelope.pessoa` e `envelope.hoje`;
- do servidor, com `GET /pessoa?semente=S&hoje=D`.

O `pessoa` do envelope da CLI é igual ao objeto de `gerarPessoa` com a mesma semente e o mesmo `hoje`.

```bash testar
botai pessoa --semente cadastro --hoje 2026-10-08 > envelope.json
```

## No Playwright, sem o fixture

Provado no Chromium 153, no Firefox 155 e no WebKit 26.6 (Playwright 1.63.0), e no Google Chrome 154 e no Edge 154 instalados (channels `chrome` e `msedge`). Num cadastro realista, o resultado foi 21 preenchidos, 2 não reconhecidos e 0 recusados em todos.

```js
import { createRequire } from 'node:module'
import { chromium } from 'playwright'
import { gerarPessoa } from '@pilutech/botai-core'

const IIFE = createRequire(import.meta.url).resolve(
  '@pilutech/botai-core/navegador.iife.js',
)

const hoje = '2026-10-08'
const pessoa = gerarPessoa({ semente: 'cadastro', hoje })

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:3000/cadastro')
await page.addScriptTag({ path: IIFE })
const resultado = await page.evaluate(
  ({ pessoa, hoje }) =>
    window.__botaiNavegador.preencher(document, pessoa, hoje, {
      segundaPassada: true,
    }),
  { pessoa, hoje },
)
console.log(resultado.preenchidos.length, resultado.naoReconhecidos)
await browser.close()
```

```text
21 [
  {
    idx: 22,
    rotulo: 'Código de indicação',
    seletor: 'input[name="ref_code"]'
  },
  { idx: 23, rotulo: 'Como nos conheceu?', seletor: 'select#origem' }
]
```

O `addScriptTag({ path })` lança numa página com CSP estrita. Nesse caso, injete o texto do arquivo com `page.evaluate`: veja [CSP estrita](./csp.md).

O mesmo motor também preencheu 21/2/0 pelo protocolo CDP puro, sem Playwright: um `Runtime.evaluate` com o texto do IIFE e outro com a chamada, com `awaitPromise: true` e `returnByValue: true`. Para outras ferramentas, veja [Puppeteer](../integracoes/puppeteer.md), [Selenium](../integracoes/selenium.md), [Cypress](../integracoes/cypress.md) e [WebdriverIO](../integracoes/webdriverio.md).

## Um pedaço da página

Com um `Element` como alvo, o motor preenche só o que está dentro dele: um `fieldset`, um formulário ou um campo só.

```js
await page.evaluate(
  ({ pessoa, hoje }) => {
    const campo = document.querySelector('#cpf')
    return window.__botaiNavegador.preencher(campo, pessoa, hoje, {
      segundaPassada: false,
    })
  },
  { pessoa, hoje },
)
```

## Como ele escreve

- O valor vai inteiro, pelo setter nativo, com os eventos `input`, `change` e `blur`. O estado de um React 19 controlado recebe o valor, as máscaras aceitam, a validação no blur dispara, e o foco do usuário não muda.
- O valor se adapta ao campo: um CPF com `maxlength` 11 recebe só os dígitos, e um `type=date` recebe a data em ISO. O que não cabe vai para `recusados`.
- Campos `disabled`, `readonly`, com `display:none` ou sob `aria-hidden` ficam de fora.
- Shadow root aberta entra sozinha ([Shadow DOM](./shadow-dom.md)).
- O motor sobrescreve o que já estava escrito: não há modo "só os vazios".
- Não preenche checkbox, radio, file, range, color, hidden, `select` múltiplo nem combobox sem `<select>` nativo. Um `contenteditable` fica vazio.

## A 2ª passada {#segunda-passada}

Muitos sites buscam o CEP e sobrescrevem a rua, o bairro ou o complemento. Com `{ segundaPassada: true }`, o motor espera cerca de 1 s e regrava, com os valores da pessoa, só o que mudou desde a leitura. A Promise só resolve depois disso.

- Com `{ segundaPassada: false }`, a Promise resolve logo depois da escrita.
- A 2ª passada custa cerca de 1 s por chamada que escreve algo.
- Ela só regrava o que o Botaí escreveu: um campo que só habilita depois da busca de CEP continua vazio.

## Velocidade

Mediana de 0,8 ms e p95 de 1,7 ms por chamada, num formulário de 21 campos, sem a 2ª passada (medido em 2026-10-08, macOS arm64, no Chromium 153 do Playwright 1.63.0).

:::note[Documentado]

O motor roda no mundo principal (MAIN) da página, junto com os scripts do site. Um site que troca os protótipos nativos (o setter de `value`, por exemplo) pode interferir. Isso vem da análise do código; nenhum teste reproduziu o caso.

:::
