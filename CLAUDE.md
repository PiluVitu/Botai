# CLAUDE.md

Guia do Claude Code para o repositório do **Botaí** (`github.com/PiluVitu/Botai`). Este arquivo cobre o que é transversal; cada workspace tem o seu `CLAUDE.md`, e o Claude Code carrega este junto com o do workspace em que você mexe. Cada fato mora num arquivo só.

| Workspace        | Pacote                                     | `CLAUDE.md`               | Cobre                                                                                                                                                                                       |
| ---------------- | ------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extensao/`      | `@pilutech/botai` (privado; vai às lojas)  | `extensao/CLAUDE.md`      | a extensão MV3 para Chrome, Edge, Opera e Firefox (WXT 0.21.4 + React 19 + `@piluvitu/ui`): atalho, popup, menu `Inserir`, aviso na página, 3 builds, zip de fontes da AMO, release e lojas |
| `site/`          | `@pilutech/botai-site` (privado; Vercel)   | `site/CLAUDE.md`          | a landing em `botai.pilutech.com.br` (Next 16): `/`, `/privacidade`, `/termos`, lojas de `lojas.json`, SEO, deploy                                                                          |
| `packages/core/` | `@pilutech/botai-core` (npm, público, MIT) | `packages/core/CLAUDE.md` | o motor: pessoa de teste, geradores de documento, classificador de campos, valor de cada campo, atalho; build e publicação no npm                                                           |

> **Regra de manutenção:** tecnologia nova ou fluxo mudado → atualize o `CLAUDE.md` do workspace onde mexeu (ou este, se for transversal).

## Origem e fronteira com o monorepo

- O repo saiu do monorepo `PiluVitu/PiluVitu-Dev` em 2026-10, pelo `git filter-repo`, com o histórico: spec `docs/superpowers/specs/2026-10-05-botai-repo-proprio-design.md`, contrato `docs/superpowers/plans/2026-10-05-botai-repo-proprio-contrato.md` (nomes, caminhos, versões e environments que cruzam as fases) e plano `docs/superpowers/plans/2026-10-05-botai-fase0-separacao.md`. O log começa no primeiro commit que tocou o Botaí; os PRs antigos aparecem como `PiluVitu/PiluVitu-Dev#NN`.
- Ficou no monorepo: o `@piluvitu/ui` (design system, publicado no npm; este repo o consome de lá), o card da PiluLabs e o selo da landing da PiluTech (o item `botai` do CMS do `apps/web`, com as URLs das lojas, que se atualiza junto com o `site/lojas.json` daqui) e o `/tools` do PiluVitu, que usa `@pilutech/botai-core` do npm com versão exata. Nenhum repo lê arquivo do outro.
- Cópias aceitas (código pequeno, dono do conceito no monorepo): `site/lib/{pilulabs,contato,ico}.ts`, `extensao/src/lib/entropia.ts`, `packages/core/src/prng.ts` e `scripts/check-tailwind-source.mjs`. Mudou lá, mude aqui.

## Stack

pnpm 11.1.1 (workspaces `extensao`, `site`, `packages/*`), Node 22 no CI (24.14.0 na reprodução da AMO e na publicação no npm), TypeScript strict, Tailwind CSS 4 + `@piluvitu/ui`, WXT 0.21.4 (Vite 7), Next 16, Jest 30 (core e site), Vitest 4 (extensão), Storybook 10 (extensão 6018, site 6019), Playwright 1.59.1.

## Segurança de dependências (spec §5.3)

- **pnpm ≥ 11** (`packageManager: pnpm@11.1.1`): script de instalação de dependência fica bloqueado; só os de `allowBuilds` rodam. Nunca `dangerouslyAllowAllBuilds`.
- **`minimumReleaseAge: 1440` sem `minimumReleaseAgeExclude`:** vale também para `@pilutech/*` e `@piluvitu/*` (uma conta do npm invadida não empurra versão nova para cá no mesmo dia). Com o valor explícito, o `minimumReleaseAgeStrict` liga: versão exata publicada há menos de 24 h faz o install falhar, em vez de cair para outra.
- **`trustPolicy: no-downgrade`** (pnpm ≥ 10.21.0): o install falha se uma versão nova perder a proveniência que as anteriores tinham. Exceção só em `trustPolicyExclude`, com o motivo comentado e a versão exata (nunca o nome solto: a próxima versão de cada um volta a ser conferida). Hoje:
  - `chokidar@4.0.3` (2024-12-18, via `fork-ts-checker-webpack-plugin` do `@storybook/nextjs`): saiu sem a proveniência que a 4.0.0 e a 4.0.1 tinham.
  - `eslint-import-resolver-typescript@3.10.1` (2025-04-21, via `eslint-config-next`): linha 3.x publicada sem a proveniência que a 4.x já tinha.
  - `semver@6.3.1` (2023-07-10, via `@babel/core`, `eslint-plugin-react` e outros): backport do fix de ReDoS sem a proveniência que a 7.5.x já tinha.
- **`blockExoticSubdeps: true`** (pnpm ≥ 10.26.0): só dependência direta vem de git ou tarball.
- **`scripts/salvaguardas.test.mjs`** (`node --test`, no `make test` e no job `dependencias` do CI) reprova o repo se uma dessas linhas sumir, se uma action de qualquer workflow perder o SHA, se o CI deixar de rodar `--frozen-lockfile`/`dedupe --check`/`audit`, se um ecossistema do Dependabot ficar sem `cooldown` ou se um workflow que roda `npm publish` sair do environment `npm`, tiver mais de um `id-token: write` ou publicar sem `--provenance`. Workflow e ecossistema novos entram sem mexer no teste, desde que cumpram isso.
- **CI:** `pnpm install --frozen-lockfile`, `pnpm dedupe --check` e `pnpm audit --audit-level high`. Advisory ignorado só em `auditConfig.ignoreGhsas` do `pnpm-workspace.yaml` (no pnpm 11.1.1; `pnpm audit --ignore <GHSA>` grava), com o motivo comentado ao lado. Hoje:
  - `GHSA-g84c-rxfj-3j2c` (`webpack-dev-middleware` 6.1.3, path traversal, high): só no `storybook dev` do site, pelo `@storybook/nextjs` > `@storybook/builder-webpack5`, que exige `^6.1.2` (a correção é da 7.4.5). Não vai no build da landing nem da extensão.
  - `GHSA-86w9-cpqp-85rv` (`node-forge` 1.4.0, verificação de assinatura RSA, high; sem versão corrigida no npm em 2026-10-05): só no `web-ext` (direto e pelo `wxt`) > `@devicefarmer/adbkit`, que fala com Android no `web-ext run`. Não vai no pacote da extensão.
  - `GHSA-vfj7-8cjw-p6xm` (`braces` 3.0.3, DoS por padrão aninhado, high; sem versão corrigida no npm em 2026-10-05): só pelo `micromatch` do `@storybook/nextjs` e do `eslint-config-next` (lint), com padrões nossos. Não vai no build da landing nem da extensão.
- **Dependabot** (`.github/dependabot.yml`): npm e github-actions, semanal, `cooldown` (npm: 7 dias, major 30, minor 7, patch 3; actions: 7), minor e patch agrupados, major isolado. Nenhum merge automático. A doc do GitHub lista o pnpm até a v10: com o 11, não está confirmado que ele atualiza o lockfile.
- **Actions** fixadas por SHA com a versão em comentário (`uses: actions/checkout@<sha> # v4.4.0`), `permissions` mínimas por job, `persist-credentials: false`. Action nova entra fixada: `git ls-remote --tags https://github.com/<dono>/<action> '<tag>^{}'`.
- ⚠️ `pnpm update -r <pkg>` não mexe nas cópias transitivas quando `<pkg>` também é dependência direta de algum workspace (medido no monorepo): confira o resultado no `pnpm-lock.yaml`, não na saída do pnpm. E rode `pnpm dedupe --check` depois de qualquer bump.

## Fase 0: o `@piluvitu/ui` vem de um tarball local (temporário)

Até o `@piluvitu/ui` 0.1.0 estar no npm há 24 h, o `pnpm-workspace.yaml` tem `overrides: { '@piluvitu/ui': 'file:vendor/piluvitu-ui-0.1.0.tgz' }`, o tarball é versionado em `vendor/` e o zip de fontes da AMO o leva. Versionado de propósito: as tags `core-v0.1.0` a `core-v0.4.0` nascem em commits de antes do C4, e o `publicar-core.yml` instala no commit da tag. O passo C4 do plano da fase 0 tira o override, o `vendor/` e esta seção num commit só.

## Comandos

| Comando                     | O quê                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `make test`                 | todos os testes (`pnpm -r test` + `node --test scripts/*.test.mjs`)                     |
| `make lint`                 | `pnpm -r lint`                                                                          |
| `make stop`                 | libera as portas 3018, 6018, 3020 e 6019                                                |
| `make test-core`            | Jest + `node --test` do core (o pacote de verdade é montado e conferido)                |
| `make build-core`           | `dist/` do core (`.js` + `.d.ts`)                                                       |
| `make dev-botai`            | `wxt dev` na 3018 (carregar `extensao/.output/chrome-mv3-dev`)                          |
| `make build-botai`          | `wxt build` + gate do `@source` em `.output/chrome-mv3`                                 |
| `make test-botai`           | Vitest da extensão                                                                      |
| `make test-e2e-botai`       | builds de Chrome, Firefox e Opera + build e2e + Playwright com a extensão desempacotada |
| `make storybook-botai`      | Storybook da extensão na 6018                                                           |
| `make zip-botai`            | os 3 pacotes e o zip de fontes da AMO em `extensao/.output/`                            |
| `make versao-botai V=x.y.z` | PR de versão da extensão (branch da `origin/main`, bump sem tag, `gh pr create`)        |
| `make release-botai`        | na `main`, depois do merge: tag anotada `botai-v<versão>` + push                        |
| `make capturas-botai`       | imagens das lojas e cópias para o `site/` (rode no Mac)                                 |
| `make dev-botai-site`       | `next dev` na 3020                                                                      |
| `make build-botai-site`     | `next build` + gate do `@source` + conferência das rotas estáticas                      |
| `make test-botai-site`      | Jest + `node --test` do site                                                            |
| `make test-e2e-botai-site`  | 2 builds de produção (lojas de teste, depois o `lojas.json` real) + Playwright (`CI=1`) |
| `make storybook-botai-site` | Storybook do site na 6019                                                               |

Ordem antes de commit/PR: `make lint` → `make test` → `make build-botai` e `make build-botai-site`. O pre-commit (`.husky/pre-commit` → `pnpm exec lint-staged`) formata só o que está staged: Prettier na raiz e no core; ESLint + Prettier na `extensao/` e no `site/` (a config fica no `package.json` de cada um, porque o ESLint flat só resolve com o cwd do workspace). O `prepare` do husky também roda no install do revisor da AMO e, sem `.git`, só avisa e sai com 0.

## Gate do design system

O `@piluvitu/ui` vem do npm como `dist/` (ESM + `.d.ts`). O CSS de entrada de cada app faz `@import 'tailwindcss'`, `@import '@piluvitu/ui/styles.css'` e `@source '../node_modules/@piluvitu/ui/dist'` (relativo ao CSS; desde a 4.1.0 o Tailwind segue o symlink do pnpm num `@source`). Sem o `@source`, o Tailwind descarta em silêncio toda classe que só existe no pacote. `scripts/check-tailwind-source.mjs <pasta-ou-glob>` procura no CSS emitido a classe sentinela (`SENTINEL_SELECTOR` no script; o literal chega pelo comentário do `dist/cn.js`) e ignora `dev/`, `cache/` e `node_modules/` abaixo da pasta pedida. Amarrado no `build`, nunca no `dev`: extensão (`.output/<navegador>-mv3`, a pasta exata) e site (`.next`). Não escreva o nome da sentinela em `extensao/` nem em `site/`: o Tailwind geraria a classe sozinho e o gate deixaria de medir.

## Comentários: raros, e só onde o código não alcança (lei do projeto)

Comentário em código de **produção** é exceção. O teste é o lugar de explicar intenção e travar comportamento; produção é o lugar de o código falar por si. Escreva um comentário só quando as **três** forem verdadeiras: registra um **porquê** que o código não mostra (armadilha medida, divergência deliberada, limite de terceiro); sua ausência levaria alguém a "consertar" o código e quebrá-lo; e não cabe melhor num nome, num teste, num `CLAUDE.md` ou no commit. Tamanho: uma a três linhas; virou parágrafo, o fato vai para o `CLAUDE.md` do workspace. ⚠️ fica reservado para a armadilha que corrompe dado sem dar erro. Em teste, o comentário é livre.

## Colocation (lei do projeto)

Todo teste, story e E2E mora no mesmo diretório do fonte: `x.ts` → `x.test.ts`; `x.tsx` → `x.test.tsx` e `x.stories.tsx`; script `x.mjs` → `x.test.mjs` (`node --test`); E2E com `.e2e.ts` ao lado da rota ou do entrypoint. Ferramentas: Jest para lógica (core e site), Vitest na extensão (o WXT é Vite e traz o `fakeBrowser`), Storybook para componente visual, Playwright para fluxo crítico.

## Credenciais

| Credencial                | Onde fica                                                                                                                                | Nunca                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| npm                       | trusted publishing (OIDC) do `publicar-core.yml`; a 1ª publicação de cada pacote usou um token do dono só no shell local, apagado depois | no repo, em `.npmrc` versionado ou em log |
| Lojas (Chrome, AMO, Edge) | environment `lojas-botai` (secrets e variables); local, `extensao/.env.submit` (ignorado)                                                | no repo                                   |
| Vercel                    | integração Git da Vercel; variáveis no painel do projeto `botai-site`                                                                    | no repo                                   |

O `.env.example` da raiz lista os nomes; o `.gitignore` ignora `.env*` menos ele. O Trivy de segredos roda estrito no CI e falha o PR.

## CI/CD

| Workflow            | Gatilho                                                                                                           | Faz o quê                                                                                                                                                                                                                                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`            | PR e push na `main`                                                                                               | `dependencias` (frozen lockfile, `dedupe --check`, `audit --audit-level high`, `node --test scripts/*.test.mjs`, actionlint), `core` (tsc sem DOM, Jest, build e conferência do pacote), `extensao` (lint, Vitest, builds de Chrome, Firefox e Opera com os gates, `web-ext lint`) e `site` (lint, tsc, Jest, `node --test`, build com o gate e as rotas estáticas) |
| `botai-e2e.yml`     | PR/push que toca `extensao/**`, `packages/core/**`, `pnpm-lock.yaml` ou o workflow; dispatch                      | Chromium do Playwright e o `test:e2e` da extensão                                                                                                                                                                                                                                                                                                                   |
| `botai-release.yml` | PR que toca a extensão, o core ou um arquivo do zip de fontes; tag `botai-v*`; dispatch (`lojas`, `adiar_chrome`) | `pacotes` (lint, Vitest, zips, `web-ext lint`, reprodução byte a byte do pacote do Firefox no Node 24.14.0), `release` (GitHub Release com `--latest=false`) e `lojas` (`wxt submit` atrás do environment `lojas-botai`); detalhes em `extensao/CLAUDE.md`, "Publicação"                                                                                            |
| `publicar-core.yml` | tag `core-v*`                                                                                                     | `pacote` (tag × versão e commit na `main`, lint, test, `pnpm pack`) e `publicar` (environment `npm`, `id-token: write`, Node 24.14.0: `npm publish <pasta extraída> --access public --provenance`); detalhes em `packages/core/CLAUDE.md`                                                                                                                           |
| `trivy.yml`         | PR, push na `main` e toda segunda                                                                                 | dependências e segredos (SARIF), segredos estrito (falha o PR) e configuração (SARIF)                                                                                                                                                                                                                                                                               |

**Environments** (Settings → Environments; revisor obrigatório = o dono, sem "Prevent self-review"):

- `lojas-botai` (branch `main` e tags `botai-v*`): secrets `CHROME_SERVICE_ACCOUNT_PRIVATE_KEY`, `FIREFOX_JWT_ISSUER`, `FIREFOX_JWT_SECRET`, `EDGE_CLIENT_ID`, `EDGE_API_KEY`; variables `BOTAI_CHROME_EXTENSION_ID`, `CHROME_PUBLISHER_ID`, `CHROME_SERVICE_ACCOUNT_CLIENT_EMAIL`, `BOTAI_EDGE_PRODUCT_ID`.
- `npm` (tags `core-v*` e `playwright-v*`): sem secrets. No npmjs.com, o pacote tem o trusted publisher `PiluVitu` / `Botai` / `publicar-core.yml` / environment `npm`, e "Require two-factor authentication and disallow tokens".

O repo só aceita squash merge (por isso a versão e a tag da extensão são dois passos: `make versao-botai` e, depois do merge, `make release-botai`).

## Vercel

Projeto `botai-site`, Root Directory `site`, "Include files outside the root directory" ligado, domínio `botai.pilutech.com.br`. Detalhes e conferência em `site/CLAUDE.md`, "Deploy".
