# @pilutech/botai-playwright

Fixture do [Playwright](https://playwright.dev) que gera uma pessoa brasileira de teste (nome, CPF, RG, CNPJ, celular, CEP real com rua e cidade certas, cartão de teste) **reproduzível**, e preenche formulários com o mesmo motor da extensão [Botaí](https://botai.pilutech.com.br).

## Instalação

```bash
npm install -D @pilutech/botai-playwright
# ou
pnpm add -D @pilutech/botai-playwright
```

`@playwright/test` (1.59.1 ou mais novo na linha 1.x) é peer dependency: o seu projeto já o tem. O pacote é só ESM; num projeto CommonJS, use o Node 20.19+ ou 22.12+.

## Uso

```ts
import { test, expect } from '@pilutech/botai-playwright'

test('cadastro', async ({ page, botai }) => {
  await page.goto('/cadastro')
  const resultado = await botai.preencher(page) // percorre todos os frames
  expect(resultado.naoReconhecidos).toEqual([])
  await expect(page.getByLabel('E-mail')).toHaveValue(
    botai.pessoa.email.endereco,
  )
})
```

`botai.preencher` aceita:

- uma `Page`: todos os frames, inclusive iframes de outro domínio;
- um `Locator`: só aquele elemento (um `<form>`, uma seção ou um campo só), inclusive dentro de iframe (`page.frameLocator('iframe').locator('form')`).

## A pessoa é a mesma a cada execução

Sem opção nenhuma, a semente é o nome do projeto, o arquivo e os títulos do teste: `chromium › cadastro.e2e.ts › cadastro`. Retry e worker não entram, então a nova tentativa preenche com a mesma pessoa. O fixture registra no relatório:

- a anotação `botai-semente` (a semente) e a `botai-hoje` (a data usada);
- quando o teste falha, o anexo `botai-pessoa.json`, com `{ formato, motor, semente, hoje, pessoa }`.

Para gerar a mesma pessoa fora do teste (Python, Go, banco de dados…):

```bash
npx @pilutech/botai-core pessoa --semente "chromium › cadastro.e2e.ts › cadastro" --hoje 2026-10-05
```

A pessoa de uma semente só muda em versão major do `@pilutech/botai-core`. Para reproduzir, fixe a versão.

## Opções

| Opção               | Padrão                 | O quê                                                                     |
| ------------------- | ---------------------- | ------------------------------------------------------------------------- |
| `botaiSemente`      | projeto + título       | número ou texto; `42` e `'42'` dão a mesma pessoa                         |
| `botaiHoje`         | hoje em São Paulo      | `AAAA-MM-DD`; idade, nascimento e validade do cartão contam a partir dela |
| `botaiUf`           | sorteada               | UF do endereço (e do DDD, do CPF e do título)                             |
| `botaiDominioEmail` | `tuamaeaquelaursa.com` | domínio do e-mail                                                         |

```ts
test.use({ botaiHoje: '2026-10-05', botaiUf: 'PI' })
```

Ou para o projeto inteiro, no `playwright.config.ts`: `use: { botaiHoje: '2026-10-05' }`.

## Resultado

```ts
interface ResultadoDoPreenchimento {
  preenchidos: { frame: string; rotulo: string; seletor: string }[]
  naoReconhecidos: { frame: string; rotulo: string; seletor: string }[]
  recusados: { frame: string; rotulo: string; seletor: string }[]
}
```

`frame` é a URL do frame. `recusados` são campos reconhecidos que não aceitaram o valor (não cabe no `maxlength`, a página o desfez, o `<select>` não tem a opção).

## Segunda passada

Sites que buscam o CEP sobrescrevem rua, bairro e complemento logo depois. `botai.preencher` só termina depois de regravar o que mudou (uma passada, 1 s depois de escrever). Para pular: `botai.preencher(page, { segundaPassada: false })`.

## Junto com outros fixtures

```ts
import { mergeTests } from '@playwright/test'
import { test as testBotai } from '@pilutech/botai-playwright'
import { test as testDoProjeto } from './fixtures'

export const test = mergeTests(testDoProjeto, testBotai)
```

Ou estenda um `test` que você já tem (playwright-bdd, por exemplo):

```ts
import { fixturesBotai, type FixturesBotai } from '@pilutech/botai-playwright'

export const test = base.extend<FixturesBotai>(fixturesBotai())
```

## Como funciona

O motor (`@pilutech/botai-core/navegador`) é injetado em cada frame por `frame.evaluate`, que passa pela CSP da página, e cria um único global, `__botaiNavegador`. Ele escreve pelo setter nativo e dispara `focus`, `input`, `change` e `blur` sintéticos, sem roubar o foco: React controlado, máscaras e validação no blur enxergam o valor. Não pinta contorno nenhum na página.

## Limites

- Shadow root **fechada** fica de fora (o Playwright não a alcança). A aberta é preenchida.
- Checkbox, radio, contenteditable e combobox sem `<select>` nativo não são preenchidos.
- O código roda no mundo da página: um site que troca protótipos nativos pode interferir.
- Com `page.clock.install()`, o relógio falso segura a segunda passada: use `{ segundaPassada: false }` ou avance o relógio.
- CPF, CNPJ e celular gerados podem pertencer a gente real; use só em ambiente de teste. A caixa `tuamaeaquelaursa.com` é pública: para dado sensível, use `botaiDominioEmail` com um domínio seu.

## Licença

MIT © PiluTech
