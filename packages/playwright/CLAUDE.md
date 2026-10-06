# CLAUDE.md — `packages/playwright` (`@pilutech/botai-playwright`)

Fixture do Playwright publicado no npm (MIT). Gera a pessoa com `@pilutech/botai-core` e preenche com o motor de `@pilutech/botai-core/navegador`, o mesmo da extensão.

## Estrutura

- `src/semente.ts`: `sementeDoTeste` (projeto + arquivo com `/` + títulos, `' › '`) e `conferirHoje`.
- `src/resultado.ts`: `ResultadoDoPreenchimento` e `juntarFrames` (tira `idx`, `contentType` e `iframesDeFora` do `ResultadoFrame`, põe o `frame`).
- `src/preencher.ts`: lê `@pilutech/botai-core/navegador.iife.js`, instala em cada frame por `frame.evaluate(<texto>)` só se `__botaiNavegador` ainda não existe naquele documento, e chama `__botaiNavegador.preencher`. `Page` → todos os frames não destacados, em paralelo; `Locator` → `elementHandle()` + `ownerFrame()`.
- `src/fixture.ts`: opções (`botaiSemente`, `botaiHoje`, `botaiUf`, `botaiDominioEmail`, todas `undefined` por padrão), fixture `botai`, anotações `botai-semente`/`botai-hoje`, anexo `botai-pessoa.json` quando `testInfo.status !== testInfo.expectedStatus`.
- `src/index.ts`: a API pública (`test`, `expect`, `fixturesBotai`, `sementeDoTeste` e os tipos).
- `src/teste/`: páginas e ajudantes dos E2E e o projeto filho. Fora do build.

## Decisões (o porquê)

- **IIFE por `frame.evaluate(texto)`, nunca `addScriptTag`:** o evaluate passa pela CSP (o Playwright roda o texto com `globalThis.eval` no script utilitário), o `addScriptTag` não. Coberto por "passa pela CSP estrita".
- **Instalação preguiçosa, por documento,** em vez de `addInitScript`: funciona em qualquer `Page`/`Locator` que o teste passar, inclusive páginas abertas depois do fixture.
- **Mundo MAIN:** o motor escreve pelo setter do protótipo, o que mantém o React funcionando; o site enxerga `__botaiNavegador`.
- **Sem contornos:** `SEM_CONTORNOS`, para não sujar screenshot nem `toHaveScreenshot`.
- **Semente legível** (o texto da semente é o próprio identificador do teste): a anotação já serve de argumento para `botai pessoa --semente`.
- **Peer `@playwright/test` `^1.59.1`:** a única versão testada; uma cópia só do `@playwright/test` no projeto do usuário (o `mergeTests` existe desde a 1.39).
- **Módulos testados no Jest sem import de pacote:** o ts-jest em CommonJS não resolve `exports`; por isso `semente.ts` e `resultado.ts` só dependem de tipos locais (o `ResultadoFrame` do core é compatível por estrutura).

## Testes

| Camada                                                        | Ferramenta                                                   | Onde                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| Lógica pura                                                   | Jest                                                         | `src/semente.test.ts`, `src/resultado.test.ts` |
| Relatório (anotação, anexo em falha, retry, `botaiHoje` ruim) | Jest rodando um projeto Playwright filho com o reporter JSON | `src/fixture.test.ts` + `src/teste/filho/`     |
| Fluxos                                                        | Playwright, Chromium + Firefox + WebKit                      | `src/preencher.e2e.ts`, `src/fixture.e2e.ts`   |

- As páginas `cadastro.pagina.html` e `react.pagina.(html|tsx)` são lidas de `extensao/src/entrypoints/preencher.content/`: a extensão e o plugin testam a mesma página. A React é empacotada pelo esbuild com o `react` da extensão.
- O E2E lê `packages/core/dourado/v1/indice.json` e confere cada dourado de pessoa única (entrada sem `n`) pelo fixture, com **todas** as `opcoes` da entrada (`botaiSemente`, `botaiHoje`, `botaiUf`, `botaiDominioEmail`): o envelope não guarda `uf` nem `dominioEmail`.
- Todo script (`lint`, `test`, `test:e2e`, `build`) builda o core antes: o plugin lê os tipos e o IIFE do `dist/` dele.

## Comandos

| Comando                                                | O quê                                                                                                      |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `make test-playwright`                                 | Jest (builda o core antes)                                                                                 |
| `make test-e2e-playwright`                             | Playwright nos 3 navegadores (rode `node_modules/.bin/playwright install chromium firefox webkit` uma vez) |
| `pnpm --filter @pilutech/botai-playwright run build`   | `dist/` com `.js` e `.d.ts`                                                                                |
| `node packages/playwright/scripts/conferir-pacote.mjs` | `pnpm pack` + lista fechada + dependência do core na versão exata                                          |

## Publicação

Tag `playwright-v<versão>` (igual ao `package.json`, commit na `main`) → `.github/workflows/publicar-playwright.yml`: testes, `conferir-pacote.mjs --destino`, artifact, e o job `publicar` (environment com aprovação do dono, `id-token: write`) extrai o `.tgz` e roda `npm publish <pasta> --access public --provenance --ignore-scripts` com trusted publishing. Antes, o workflow confere que o `@pilutech/botai-core` da versão de que o plugin depende já está no npm. A primeira publicação (0.1.0) é do dono, com token local; o workflow pula versão que já está no npm.

## Limites

- Shadow root fechada não é suportada pelo Playwright.
- `page.clock.install()` segura a 2ª passada (use `segundaPassada: false`).
- Checkbox, radio, contenteditable e combobox sem `<select>` ficam de fora, como na extensão.
