# CLAUDE.md — `site` (`@pilutech/botai-site`)

Landing do Botaí em `https://botai.pilutech.com.br`: `/`, `/privacidade` e `/termos`. Next 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4 e `@piluvitu/ui`. O Claude Code carrega este arquivo junto com o `CLAUDE.md` da raiz.

- **Spec:** `docs/superpowers/specs/2026-10-02-botai-landing-design.md`. **Plano:** `docs/superpowers/plans/2026-10-02-botai-landing.md`. **Design (fonte visual):** `docs/superpowers/design/2026-10-02-botai-landing/` (`Botai Landing.dc.html`, `desktop-escuro.png`, `mobile-escuro.png`).
- **Grafia:** "Botaí" em todo texto visível; `botai` no técnico (ver "Identidade" em `extensao/CLAUDE.md`).

## Estrutura

```
app/                  layout (fontes, tema, metadataBase), page (/), privacidade/, termos/, imagens OG e Twitter por rota,
                      icon.png, apple-icon.png, sitemap.ts, robots.ts, manifest.ts e os E2E
components/           landing e as peças (topo, rodapé, botões de loja, selo, atalho, tabela, abas, imagem por tema)
                      e a moldura documento das páginas de texto
lib/                  conteúdo, leitura do lojas.json, cópias do monorepo (pilulabs, contato, ico), modelo da página, visitante, capturas, site, seo, json-ld, imagem OG
public/               icone-128.png e capturas/ (gerados por make capturas-botai)
scripts/              conferir-rotas-estaticas.mjs (roda no build)
```

## A página

- **Lojas e fase saem de `lojas.json`** (na raiz do `site/`, editado por PR): `lib/lojas.ts` lê o arquivo no build (as 4 URLs, por `urlsDasLojas` de `lib/pilulabs.ts`). Arquivo ausente ou JSON inválido quebra o build de propósito: em silêncio, a landing sairia "Em breve" com a loja já publicada. `BOTAI_LOJAS` troca o arquivo (só o `playwright.lojas.config.ts` a define). O card da PiluLabs e o selo da landing da PiluTech leem o item `botai` do CMS do `apps/web`, no monorepo `PiluVitu/PiluVitu-Dev`: publicar uma loja é mudar os dois.
- **Regras:** `lib/pilulabs.ts` é cópia das regras de loja do `@piluvitu/tools/pilulabs` do monorepo (`LOJAS`, `ehHttps`, `ehUrlDaLoja`, `lojasPublicadas`, `fase`, `urlsDasLojas`), e o card da PiluLabs decide com o original: regra nova vale nos dois. `ATALHOS` vem de `@pilutech/botai-core/atalhos`, a mesma fonte do manifesto da extensão. `lib/contato.ts` e `lib/ico.ts` são cópias do `@piluvitu/tools` pelo mesmo motivo (a landing da PiluTech usa os originais).
- **Botões de loja:** loja publicada → link em aba nova; sem URL → `<button disabled>` "Em breve", sem link. URL de outro host ou sem `https:` conta como sem URL. O Edge é a exceção (`SO_COM_LINK` em `lib/modelo.ts`, decisão do dono em 2026-10-05): sem URL ele não aparece, porque quem usa Edge instala pela Chrome Web Store; com URL, o botão entra no lugar dele na ordem. O botão quebra o texto (`whitespace-normal`, `max-w-full`) em vez de vazar da lista: a 320 px, "Microsoft Edge Add-ons Em breve" numa linha passa da largura, e o `scrollWidth` da página não acusa porque o vazamento fica no gutter.
- **Nota das lojas:** cita só as publicadas; antes de todas, "Chegando às lojas…". Nenhum texto diz "disponível" antes das lojas.
- **Tema:** `next-themes` (`attribute="class"`, `defaultTheme="system"`), o botão lembra a escolha no `localStorage`; o script do `next-themes` põe `.dark` antes da hidratação, e ícones e capturas trocam por CSS (`dark:`), sem piscar.
- **Capturas por tema:** `ImagemPorTema` põe as duas variantes, lazy, e esconde uma pela classe `.dark`; imagem lazy com `display: none` não é baixada. A do topo (LCP) leva `fetchPriority="high"`, nunca `loading="eager"`/`preload`, que baixariam as duas (ver "Theme detection" na doc do `next/image`).
- **Atalho de quem visita:** `useSyncExternalStore` com o atalho do Windows no servidor; depois da hidratação, `⌥⇧P` no Mac, `Alt+Shift+P` no Firefox para Linux e `Ctrl+Shift+Y` no resto (Android e ChromeOS inclusos).
- **Abas das capturas:** tabs WAI-ARIA com ativação automática, setas (dando a volta), Home e End, foco itinerante; o painel é focável. Os 3 painéis saem no HTML e os inativos levam `hidden`: o Google não interage com a página (Search Central, "Fix lazy-loaded content"), e o texto das cenas 02 e 03 só é indexado se estiver no DOM. As imagens dos painéis escondidos são lazy com `display: none` e não são baixadas.
- **Tabela de atalhos:** a 320 px ela rola dentro da moldura, que é uma região focável (`role="region"`, `tabIndex={0}`, nome da legenda): sem isso, quem usa teclado não rola, e o axe acusa `scrollable-region-focusable`.
- **Um `h1` só:** a proposta, com "Botaí: " só para leitor de tela; o nome grande do design é um `<p>` na linha do selo.
- ⚠️ **CSS do Font Awesome na camada `base`** (`@import … layer(base)` no `globals.css`) e `config.autoAddCss = false` (`lib/font-awesome.ts`, importado pelo `TemaProvider`): o CSS injetado em runtime fica fora de camada e vence as utilities, e o `hidden`/`size-*` dos ícones param de funcionar sem erro nenhum. O E2E do tema pega.
- **E-mail e links da PiluTech:** todo `mailto:` vai para `pilutechinformatica@gmail.com` com `[Botaí]` no assunto (`MAILTO` em `lib/conteudo.ts`, por `mailtoDaPilutech` de `lib/contato.ts`): `[Botaí] Suporte` no rodapé, `[Botaí] Privacidade` na política, `[Botaí] Termos de uso` nos termos. O texto visível continua o endereço puro, e o `extensao/loja/textos.md` também. O "← PiluLabs" do topo leva a `https://piluvitu.com.br/pilulabs` (`URL_DA_PILULABS`, a vitrine no `apps/web`); o "Powered by PiluTech" e a `Organization` do JSON-LD seguem em `https://pilutech.com.br` (`URL_DA_PILUTECH`), a landing da empresa, no `apps/pilutech-site` do monorepo.

## `/privacidade` e `/termos`

- Os dois textos moram no `page.tsx` de cada rota, fonte única (o da AMO se copia da política). A moldura é o `Documento` (`components/documento.tsx`): topo, rótulo, `h1`, "Em vigor desde" e resumo, corpo `prose`, rodapé. A data é texto pronto (formatar em BRT daria o dia anterior) e é a data em que o texto passa a valer.
- Decisões do dono (2026-10-02): responsável só "PiluTech" + `pilutechinformatica@gmail.com`, sem razão social nem CNPJ; foro de Teresina/PI, ressalvado o domicílio do consumidor quando o CDC se aplicar. Plano: `docs/superpowers/plans/2026-10-02-botai-termos.md` (inclui os riscos jurídicos deixados ao dono).
- Texto honesto: nenhuma das duas diz "disponível" nem "publicado nas lojas" (teste das páginas).
- A política amarra o código: a tabela de permissões é a lista de "Justificativa:" de `extensao/loja/textos.md`, a linha do `contextMenus` cita cada item de `extensao/src/lib/menus.ts`, e "no Firefox o pacote declara que não coleta" lê o `extensao/wxt.config.ts` (`page.test.tsx`); o E2E confere que o site não pede nada a outro host, não grava cookie e só guarda `theme` no `localStorage`. Do lado da extensão, `extensao/loja/textos.test.ts` trava "sem rede", "uma chave de storage" e a justificativa do `contextMenus` com os mesmos itens do menu. Mudou um deles? Mude a política no mesmo PR.
- O script injetado fica na página até ela recarregar (registro dos campos e último resultado em `api.ts`, segunda passada): a política diz "na memória da página", nunca "só durante a ação".
- Os termos amarram a pessoa: `app/termos/page.test.tsx` lê os `gerar*(rng…)` de `packages/core/src/pessoa.ts` e exige que cada gerador esteja classificado em `PODE_SER_DE_ALGUEM`; os dados que podem ser de alguém (CPF, CNPJ, RG, PIS/NIS, título de eleitor, celular e o endereço, cujo número cai na numeração real do CEP) precisam aparecer em "Dados que podem ser de alguém" e no "Limite de responsabilidade". Gerador novo na pessoa? Classifique-o e ajuste os dois textos (e "Dados fictícios e pessoas reais" da política).
- Os termos dizem que, sobre os direitos no código, vale a MIT (`extensao/LICENSE`, conferido em `lib/conteudo.test.ts`); as proibições tratam de condutas.
- Rodapé: `nav` "Documentos" com "Privacidade" e "Termos de uso" (`DOCUMENTOS`, em `lib/conteudo.ts`), nas três rotas; a seção "Cuidados" da landing leva aos termos.
- O link de histórico aponta para o `page.tsx` de cada rota neste repo (o histórico veio do monorepo pelo `git filter-repo`). As versões da política de antes de 2026-10-02 estão no monorepo `PiluVitu/PiluVitu-Dev`, no histórico de `apps/web/app/(site)/pilulabs/botai/privacidade/page.tsx`.

## SEO

- **URLs:** `metadataBase` = `urlDoSite()`: `https://botai.pilutech.com.br`, ou `SITE_URL` (só a origem; valor sem esquema é ignorado). Preview e local sem `SITE_URL` apontam canonical, `og:url`, JSON-LD, sitemap e robots para a produção, e o preview da Vercel já responde com `X-Robots-Tag: noindex`.
- **Textos (`lib/seo.ts`):** título da home com até 60 caracteres e descrição de 140–160, com os termos buscados; a política e os termos com os deles. O Google não tem limite e trunca pela largura do dispositivo (Search Central, "title link" e "snippet"); os limites são da spec e ficam no teste.
- **Open Graph e Twitter:** `metadataDaPagina` repete `type`, `locale`, `siteName`, `url`, `title` e `description` (o Next substitui o `openGraph` inteiro) e não declara imagem: cada rota tem `opengraph-image.tsx` e `twitter-image.tsx` estáticos (1200×630, `lib/imagem-og.tsx`, lendo `app/icon.png`).
- **JSON-LD (`lib/json-ld.ts`):** em `/`, `Organization` (PiluTech), `WebSite` e `SoftwareApplication` (`BrowserApplication`, preço 0 em BRL, `installUrl` só das lojas publicadas, capturas, PiluTech como `publisher` e `author`); em `/privacidade` e `/termos`, `BreadcrumbList` (`jsonLdDaTrilha`). `serializarJsonLd` troca `<` por `\u003c`.
  - Sem `aggregateRating`/`review` (o Google proíbe copiar a nota das lojas), sem `FAQPage` e sem `HowTo`.
  - ⚠️ O rich result de app exige nota ou review (Search Central, "Software app", 2026-09-08): o markup ajuda o Google a entender a página, mas não gera estrela nem preço no resultado. Não prometa isso.
  - A `Organization` leva o `logo` `https://pilutech.com.br/icon` (`LOGO_DA_PILUTECH`): o símbolo da PiluTech, 192 px, gerado pelo `apps/pilutech-site` do monorepo, que tem a rota no `ROTAS` (o build dele quebra se ela sumir). O ícone do Botaí não é o logo da empresa.
- **Sitemap e robots:** `/`, `/privacidade` e `/termos`; robots libera tudo e aponta o sitemap.
- **Ícones:** `app/icon.png` e `app/apple-icon.png` (300×300, cópias do `edge-logo-300.png` das lojas, geradas por `make capturas-botai`; o Google aceita PNG, não SVG), `/favicon.ico` (`app/favicon.ico/route.ts`, estático: `faviconDoBotai` de `lib/favicon.ts` empacota com `icoDePngs` os PNGs de 16, 32 e 48 px da própria extensão, `extensao/public/icon/`, lidos no build; não é cópia versionada, e pasta sem os ícones quebra o build), `app/manifest.ts` e `theme-color` claro e escuro (o `--background` dos dois temas do `@piluvitu/ui`, conferido no teste).
- **Search Console:** `GOOGLE_SITE_VERIFICATION` vira `metadata.verification.google`. Cadastrar o domínio é passo do dono.
- **Lighthouse:** não há ferramenta no repo nem no PATH; as checagens estão no `app/seo.e2e.ts` (título, descrição, canonical, OG com a imagem 1200×630, JSON-LD, `h1` único, níveis de título, `alt`, robots, sitemap, ícones, manifest e `axe-core` WCAG 2.1 A/AA nos dois temas) e a 320 px nos E2E das rotas.

## Build

- `pnpm build` = `next build` + o gate do `@source` (`../scripts/check-tailwind-source.mjs .next`; a classe que ele procura está em `SENTINEL_SELECTOR`, no topo do script) + `scripts/conferir-rotas-estaticas.mjs`, que falha se uma rota de `ROTAS` sumir do `prerender-manifest.json` ou ganhar `revalidate`. Rota nova entra em `ROTAS`.
- **`@piluvitu/ui` do npm (ESM):** o `globals.css` declara `@source '../node_modules/@piluvitu/ui/dist'`, e o `jest.config.ts` transforma o pacote (`transformIgnorePatterns: ['/node_modules/(?!\\.pnpm/|@piluvitu/ui/)']` e o ts-jest pegando `.js`); sem isso, todo teste que renderiza um componente dele quebra com `SyntaxError: Cannot use import statement outside a module` (medido). O `@pilutech/botai-core` vem do workspace como código-fonte (`moduleNameMapper` para `../packages/core/src`).
- `@source not '../*.md'`: a documentação do app não muda o CSS. O `storybook-static/` está no `.gitignore` da raiz pelo mesmo motivo (sem ele, o Tailwind varreria CSS já compilado e o gate aprovaria `@source` quebrado).

## Testes

| Camada                                  | Ferramenta                                   | Onde                                          |
| --------------------------------------- | -------------------------------------------- | --------------------------------------------- |
| Lógica (lojas, modelo, visitante, SEO…) | Jest + ts-jest (jsdom)                       | `*.test.ts` ao lado; `make test-botai-site`   |
| Componentes                             | Jest + Testing Library + user-event          | `*.test.tsx` ao lado                          |
| Estados visuais                         | Storybook `@storybook/nextjs`, porta 6019    | `*.stories.tsx` ao lado (tema na barra)       |
| Script do build                         | `node --test`                                | `scripts/*.test.mjs`                          |
| Rotas, SEO, teclado, tema, rede, 320 px | Playwright no build de produção (porta 3020) | `app/**/*.e2e.ts`; `make test-e2e-botai-site` |

- O E2E builda e sobe `next start`; rode com `CI=1` e a 3020 livre. Ele não roda no CI deste repo (só local).
- **Duas passadas no `test:e2e`:** primeiro o `playwright.lojas.config.ts`, que builda com `BOTAI_LOJAS=app/lojas-publicadas.json` (Firefox publicado, Chrome com link de outra loja, Edge em `http:`) e roda `app/lojas-publicadas.e2e.ts`; depois o `playwright.config.ts`, que builda com o `lojas.json` real e roda o resto. O `lojas.json` tem só a Chrome Web Store publicada (desde 2026-10-05); a primeira passada é a que exercita link de outra loja e Edge em `http:` (que some, sem "Em breve"). A ordem deixa o `.next` com o arquivo real; um `distDir` à parte faria o `next build` mexer no `include` do `tsconfig.json`.
- O axe roda a 1280 e a 320 px, nos dois temas, nas três rotas: a meta da spec é o Lighthouse mobile.
- ⚠️ **O `next start` (Next 16.3.8) prende para sempre a chave do `/_next/image` cujo primeiro pedido foi abortado** no meio da otimização (cache frio): todo pedido seguinte da mesma URL e do mesmo formato fica pendurado até reiniciar o servidor. No E2E, o teste das âncoras rola a página e fecha com o ícone `w=64` (lazy, no rodapé) ainda otimizando; o teste sem JavaScript, que baixa as imagens lazy na hora, esperava o `load` e estourava os 30 s (5 de 5 com cache frio e servidor novo, medido em 2026-10-05). Teste que mede só o HTML usa `waitUntil: 'domcontentloaded'`. Na Vercel o `/_next/image` é da plataforma, não do `next start`.
- ⚠️ O `next dev` (e o servidor do E2E, que roda `next build`/`next start`) pode anexar a este arquivo um bloco de regras para agentes ou criar um `AGENTS.md`: confira `git status` antes de commitar.

## Deploy (Vercel, projeto próprio)

1. Projeto `botai-site` ligado a `PiluVitu/Botai`, **Root Directory `site`**, framework Next.js, install e build padrão (`pnpm install` na raiz do repo, `pnpm build`), Node 22.x e "Include files outside the root directory in the Build Step" ligado (`sourceFilesOutsideRootDirectory`; o build lê `packages/core` e os ícones de `extensao/public/icon`). A troca do monorepo para este repo é o passo C9 do plano `docs/superpowers/plans/2026-10-05-botai-fase0-separacao.md`.
2. **"Skip deployments" desligado**; quem filtra é o `ignoreCommand` do `vercel.json` (roda na Root Directory; `exit 0` cancela): o site (inclusive o `lojas.json`), `packages/core`, os ícones da extensão (de onde sai o `/favicon.ico`) e os arquivos de install e build da raiz (`pnpm-lock.yaml`, `pnpm-workspace.yaml`, `package.json`, `.npmrc`, `scripts/check-tailwind-source.mjs`). O `@piluvitu/ui` muda pelo lockfile. O `vercel.test.ts` confere a lista e que todo caminho existe.
3. Domínio `botai.pilutech.com.br` no projeto, com o `CNAME botai` da Cloudflare em **DNS only** (a troca de repo não mexe nele).
4. Env: nenhuma obrigatória. `GOOGLE_SITE_VERIFICATION` em Production quando o dono cadastrar o domínio no Search Console. Não ponha `SITE_URL` nem `BOTAI_LOJAS` em ambiente nenhum.
5. Produção sai da `main`. Para promover um build à mão: `vercel deploy` num clone limpo (preview) e `vercel promote <url-do-preview> --yes`.
6. Confira: o preview responde `x-robots-tag: noindex` (`curl -sI https://<preview>.vercel.app | grep -i x-robots-tag`); `https://botai.pilutech.com.br`, `/privacidade` e `/termos` respondem 200 sem `noindex`; o canonical da home aponta para ela mesma; `/sitemap.xml` lista as três rotas.

## Comandos

| Comando                                        | O quê                                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `make dev-botai-site`                          | `next dev` em http://localhost:3020                                                                                |
| `make build-botai-site`                        | `next build` + gate do `@source` + conferência das rotas estáticas                                                 |
| `make test-botai-site`                         | Jest + `node --test`                                                                                               |
| `make test-e2e-botai-site`                     | 2 builds de produção (lojas de teste, depois o `lojas.json` real) + `next start` na 3020 + Playwright (com `CI=1`) |
| `make storybook-botai-site`                    | Storybook em http://localhost:6019                                                                                 |
| `pnpm --filter @pilutech/botai-site typecheck` | `tsc --noEmit`                                                                                                     |
| `pnpm --filter @pilutech/botai-site lint`      | ESLint                                                                                                             |
