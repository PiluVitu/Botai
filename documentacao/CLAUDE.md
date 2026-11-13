# CLAUDE.md — documentação (`documentacao/`)

A documentação do Botaí em **https://docs.botai.pilutech.com.br**: pacote privado `@pilutech/botai-docs`, Docusaurus 3.10.2 exato (preset classic), só docs, em pt-BR. O transversal (segurança de dependências, CI, credenciais) está no `CLAUDE.md` da raiz; as regras de quem escreve as páginas, no `CONVENCOES.md` (não publicado).

```
docs/                  o conteúdo publicado: intro.md (a raiz, slug /), as pastas da árvore com _category_.json, limites.md e faq.md
src/css/custom.css     o tema: tokens --botai-* do @piluvitu/ui mapeados para as variáveis --ifm-* do Infima, e as fontes
static/                img/botai.svg (logo e favicon) e robots.txt
plugins/               llms-txt.mjs (o plugin que escreve o llms.txt e o llms-full.txt) e llms-conteudo.mjs (as funções puras), com os testes ao lado
scripts/               exemplos.mjs (blocos "testar"), versoes.mjs (versões citadas) e conferir-build.mjs (a conferência do build/), com os testes ao lado
docusaurus.config.mjs  a configuração; sidebars.mjs gera a barra lateral das pastas
vercel.json            o Ignored Build Step da Vercel
CONVENCOES.md          árvore, frontmatter, tom, status, exemplos testáveis e versões, para quem escreve
```

## Configuração

- **Só docs:** `routeBasePath: '/'`, `blog: false`, `pages: false`; o `intro.md` tem `slug: /`. `url` `https://docs.botai.pilutech.com.br`, `baseUrl` `/`, `i18n` só `pt-BR`.
- **Link quebrado derruba o build:** `onBrokenLinks`, `onBrokenAnchors`, `onDuplicateRoutes` e `markdown.hooks.onBrokenMarkdownLinks` em `throw` (o `onBrokenMarkdownLinks` da raiz da config está obsoleto na 3.10).
- **`markdown.format: 'detect'`:** `.md` é CommonMark (`<valor>` e `{ }` na prosa são texto) e `.mdx` é MDX (para as abas). No `.md`, admonition com título (`:::caution[Não testado]`) e id explícito de título (`## Título {#id}`) funcionam, e a âncora sem id sai com acento (`#códigos-de-saída`); conferido no build em 2026-10-08.
- **Pastas:** cada uma tem `_category_.json` com `position` e `link.type: 'generated-index'` em `/<pasta>`. Pasta sem página não aparece. Um `index.md` dentro da pasta colidiria com a página gerada.
- **SEO:** sitemap do preset (`/sitemap.xml`, com o `/llms.txt` acrescentado no fim pelo `createSitemapItems`), `static/robots.txt` com a linha `Sitemap` e, logo depois, o comentário `# llms.txt: …` (o Google ignora). Canonical e `<meta name="description">` saem do Docusaurus: da `description` do frontmatter e, na página da pasta, da `link.description` do `_category_.json`. O 404 fica fora do sitemap.
- **`llms.txt` e `llms-full.txt`** (padrão da skill `padroes-produto-pilutech`, seção llms.txt): o plugin local `plugins/llms-txt.mjs` guarda o conteúdo do plugin de docs no `allContentLoaded` e, no `postBuild`, escreve os dois em `build/`. Nada é escrito à mão: `# ` + `title` e `> ` + `tagline` da config; o parágrafo é o primeiro do corpo do `intro.md` (se a página raiz não começar por um parágrafo, o build cai); "Geral" com os docs da raiz da barra lateral; uma seção por pasta, na ordem da barra, abrindo com a página gerada da pasta (rótulo e `link.description`) e depois cada doc (`title` e `description`), com subpasta achatada na da mãe; e "Mais", com o `llms-full.txt` e o href do item "Site" da navbar. Os textos fixos (os nomes "Geral" e "Mais", as duas descrições de "Mais" e a linha do índice do `llms-full.txt`) ficam em `TEXTOS`, no `llms-conteudo.mjs`.
- **`llms-full.txt`:** cada doc na ordem da barra, com `# título`, `URL:`, `> description` e o corpo em Markdown, sem o frontmatter, com o link relativo para `.md` trocado pela URL absoluta (e a âncora), sem o `{#id}` dos títulos e sem o `testar`/`testar=N` dos blocos. Link relativo que não aponta para um doc derruba o build, com o arquivo e o link na mensagem. Doc publicado fora da barra lateral também (ficaria fora do `llms.txt`). Os exemplos das páginas vão como estão, inclusive o `localhost` dos códigos e os e-mails fictícios das saídas coladas.
- **Conferência do build:** o script `build` roda `scripts/conferir-build.mjs` depois do `docusaurus build`. Ele reprova se faltar o `llms.txt` ou o `llms-full.txt`, se um deles fugir do formato, se um link de `docs.botai.pilutech.com.br` nos dois não tiver arquivo no `build/` (ou a âncora não existir como `id` na página), se uma página do sitemap faltar no `llms.txt`, se os `<loc>` do sitemap não forem exatamente as páginas HTML do `build/` menos o `404.html`, mais o `/llms.txt`, se uma página do sitemap não tiver um canonical igual ao `<loc>` e uma description, ou tiver `noindex`, e se o `robots.txt` perder a linha `Sitemap` ou a do `llms.txt`. No `llms.txt`, também URL de `localhost`/`127.0.0.1` e e-mail que não seja o `help@pilutech.com.br`. Para rodar à mão: `node scripts/conferir-build.mjs [pasta]` (padrão `build/`).
- **Navbar:** logo, "Site" (`https://botai.pilutech.com.br`), "GitHub" (`https://github.com/PiluVitu/Botai`) e "npm" (o `@pilutech/botai-core`). **Rodapé:** "Política de privacidade" (a da landing, que cobre a documentação) e "Powered by PiluTech" com link para `https://pilutech.com.br`.
- **Medição (desde 2026-10-11):** o `src/medicao-da-vercel.js` (`inject()` do `@vercel/analytics` e `injectSpeedInsights()` do `@vercel/speed-insights`) entra no `clientModules` só com `VERCEL_ENV=production`, como na landing: o preview gastaria as cotas grátis da conta, e o build local fica sem os scripts. Os scripts são da Vercel, servidos pelo domínio da documentação, sem cookie. Só visão geral: visualização de página (o `inject()` acompanha a troca de página do Docusaurus) e Web Vitals, sem evento próprio. A política da landing (`https://botai.pilutech.com.br/privacidade`, link no rodapé) cobre a documentação.
- **Busca: nenhuma.** O Docusaurus não tem busca local oficial; a oficial é a Algolia DocSearch, serviço externo. O `@docusaurus/theme-search-algolia` vem com o preset classic, mas sem `themeConfig.algolia` não entra no build.
- **Prism:** o realce de `bash`, `csv`, `java`, `csharp`, `ruby` e `php` vem do `additionalLanguages` (o Prism do Docusaurus não traz o `bash`).
- ⚠️ **Sem `"type": "module"` no `package.json`:** com ele, o `docusaurus build` falha com `TypeError: require.resolveWeak is not a function` (o webpack trata os `.js` gerados em `.docusaurus/` como ESM). Por isso a config e a barra lateral são `.mjs` (medido em 2026-10-08).

## Tema

- `src/css/custom.css` declara os tokens `--botai-fundo`, `--botai-cartao`, `--botai-borda`, `--botai-texto`, `--botai-texto-suave` e `--botai-primaria` em `:root` (claro) e em `[data-theme='dark']` (escuro), com os valores de `--background`, `--card`, `--border`, `--foreground`, `--muted-foreground` e `--primary` do `@piluvitu/ui` (`:root` e `.dark`). As variáveis `--ifm-*` do Infima saem deles; os tons da primária são `color-mix` da própria primária.
- O `custom.test.mjs` lê o `styles.css` do `@piluvitu/ui` (devDependency, só para isso) e reprova se um token divergir. Mudou a paleta lá, mude aqui.
- Claro e escuro seguem o sistema (`respectPrefersColorScheme`), com o botão de troca ligado.
- Fontes: Plus Jakarta Sans e JetBrains Mono pelo `@fontsource-variable` (como a extensão), importadas no `custom.css`. O build copia os `.woff2` para `build/assets/fonts`: nada de CDN.
- `static/img/botai.svg` é cópia exata de `extensao/loja/icone-1i.svg` (o `docusaurus.config.test.mjs` compara). Mudou o ícone lá, copie aqui.

## Testes (`node --test`)

| Arquivo                           | O que trava                                                                                                                                                                                                                                                                                         |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/exemplos.test.mjs`       | todo bloco ` ```bash testar ` de `docs/**/*.md(x)` sai com 0 (ou o N de `testar=N`); o extrator, as proibições e a troca do servidor; ao menos um bloco existe                                                                                                                                      |
| `scripts/versoes.test.mjs`        | toda versão citada (`@pilutech/botai-core@X`, `ghcr.io/piluvitu/botai:X`, `@pilutech/botai-playwright@X`, `core-vX`, `BOTAI_VERSAO=X`, o `motor` das saídas) é a dos `package.json`                                                                                                                 |
| `docusaurus.config.test.mjs`      | URL, raiz, pt-BR, só docs, links quebrados em `throw`, navbar, rodapé com a política, logo, sem busca nem script de terceiros, a medição da Vercel só no build de produção, sitemap com o `llms.txt` no fim, robots com a linha do `llms.txt` e o plugin registrado                                 |
| `plugins/llms-conteudo.test.mjs`  | o formato do `llms.txt` e do `llms-full.txt`, a ordem da barra (subpasta achatada, doc não listado de fora), a troca dos links (código inline e blocos intactos, âncora da própria página), o `{#id}` e o `testar` tirados, e os erros: link que não resolve, doc fora da barra, raiz sem parágrafo |
| `plugins/llms-txt.test.mjs`       | o plugin escreve os dois arquivos no `outDir` a partir da versão servida na raiz; sem o conteúdo de docs, o `postBuild` falha; o `createSitemapItems` só acrescenta o `llms.txt`                                                                                                                    |
| `scripts/conferir-build.test.mjs` | cada reprovação da conferência do build (seção "Configuração"), com um `build/` de mentira numa pasta temporária, e o caso que passa                                                                                                                                                                |
| `src/css/custom.test.mjs`         | tokens iguais aos do `@piluvitu/ui`, `--ifm-*` saindo deles, fontes do `@fontsource` sem CDN                                                                                                                                                                                                        |
| `vercel.test.mjs`                 | o `ignoreCommand` e que todo caminho vigiado existe                                                                                                                                                                                                                                                 |

- **Como os blocos rodam:** o teste copia `packages/core/dist` para uma pasta temporária (no `make test`, o plugin do Playwright reconstrói o core em paralelo com `rm -rf dist`), confere a cópia com `botai --versao` e põe no `PATH` um `botai` que roda `node <cópia>/bin/botai.js`. Cada bloco roda em `bash -c 'set -eo pipefail; …'`, numa pasta vazia, sem stdin, com 60 s de limite. Bloco que cita `127.0.0.1:8790` fala com um `botai serve --porta 0` que o teste sobe uma vez e troca na URL.
- **Proibido em bloco testado** (o teste reprova antes de rodar): URL que não seja `http://127.0.0.1:8790`, `docker`, `docker-compose`, `npx`, `npm`, `pnpm`, `sudo`, `gh`, `psql`, `mysql`, `sqlite3` e `botai serve`. A proibição olha a palavra solta, não a posição de comando: `--dialeto mysql` também cai, e as páginas escrevem `--dialeto=mysql` nos blocos testados.
- O teste não builda o core: sem `packages/core/dist` (ou com outra versão), espera até 30 s e falha pedindo `make build-core`. O `make test-botai-docs` e o job do CI buildam antes; no `make test`, a dependência `workspace:*` do core põe este pacote depois do teste do core, que builda.
- Subiu a versão do core ou do plugin? O `versoes.test.mjs` lista cada página a atualizar; saída colada que mudou se copia de novo de uma execução real.

## Comandos

| Comando                                                         | O quê                                                                                                         |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `make dev-botai-docs`                                           | `docusaurus start` em http://localhost:3022                                                                   |
| `make build-botai-docs`                                         | `docusaurus build` em `build/` (link, âncora e link de markdown quebrados falham) e a conferência do `build/` |
| `make test-botai-docs`                                          | build do core + todos os testes acima                                                                         |
| `pnpm --filter @pilutech/botai-docs run serve`                  | serve o `build/` em http://localhost:3022                                                                     |
| `pnpm --filter @pilutech/botai-docs run lint`                   | `prettier --check .` + `versoes.test.mjs` (entra no `make lint`)                                              |
| `pnpm --filter @pilutech/botai-docs exec prettier --write docs` | formata as páginas                                                                                            |

O lint-staged deste pacote roda o Prettier em `*.{js,mjs,json,md,mdx,css}`.

O cache persistente do webpack fica em `documentacao/node_modules/.cache/webpack`, com nome fixo e sem a pasta do site na chave: uma cópia do site que use o mesmo `node_modules` o reaproveita, e o build cai com `TypeError: Cannot read properties of undefined (reading 'id')` no `DocItem` (visto em 2026-10-08). Saída: `pnpm --filter @pilutech/botai-docs run clear`, ou o build com `DOCUSAURUS_NO_PERSISTENT_CACHE=1`.

## Deploy (Vercel, projeto próprio)

1. Projeto **`botai-docs`** ligado a `PiluVitu/Botai` (o dono cria), **Root Directory `documentacao`**, framework Docusaurus, install e build padrão (`pnpm install` na raiz do repo, `pnpm build`), saída `build`, Node 22.x e "Include files outside the root directory in the Build Step" ligado (o `custom.css` importa as fontes do `node_modules` da raiz, pelo pnpm).
2. **"Skip deployments" desligado**; quem filtra é o `ignoreCommand` do `vercel.json` (roda na Root Directory; `exit 0` cancela): a documentação, `packages/core` (as versões e as saídas que as páginas citam) e os arquivos de install da raiz (`pnpm-lock.yaml`, `pnpm-workspace.yaml`, `package.json`, `.npmrc`). O `vercel.test.mjs` confere a lista e que todo caminho existe.
3. Domínio **`docs.botai.pilutech.com.br`** no projeto, com o `CNAME docs.botai` da Cloudflare em **DNS only**, apontando para o valor que a Vercel mostrar ao adicionar o domínio.
4. Env: nenhuma. **Web Analytics e Speed Insights ligados no painel** do projeto `botai-docs` (Analytics e Speed Insights → Enable; a API da Vercel não liga): sem isso os scripts dão 404.
5. O preview da Vercel já responde com `X-Robots-Tag: noindex` (a landing conta com o mesmo); o `vercel.json` não declara cabeçalho. Confira: `curl -sI https://<preview>.vercel.app | grep -i x-robots-tag`; `https://docs.botai.pilutech.com.br` responde 200 sem `noindex`, `/sitemap.xml` lista as páginas e o `/llms.txt`, e `/llms.txt` e `/llms-full.txt` respondem 200 em `text/plain` com `charset=utf-8`.

## Dependências

As exceções que a documentação trouxe (o `core-js` negado no `allowBuilds`, o `@docsearch/*` 4.7.1 e o `webpack-dev-middleware` 7.4.6 no `trustPolicyExclude`, os overrides do `tinypool` e do `serialize-javascript`) estão na seção de segurança do `CLAUDE.md` da raiz, com o motivo e a condição de saída.
