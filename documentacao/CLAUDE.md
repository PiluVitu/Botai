# CLAUDE.md — documentação (`documentacao/`)

A documentação do Botaí em **https://docs.botai.pilutech.com.br**: pacote privado `@pilutech/botai-docs`, Docusaurus 3.10.2 exato (preset classic), só docs, em pt-BR. O transversal (segurança de dependências, CI, credenciais) está no `CLAUDE.md` da raiz; as regras de quem escreve as páginas, no `CONVENCOES.md` (não publicado).

```
docs/                  o conteúdo publicado: intro.md (a raiz, slug /), as pastas da árvore com _category_.json, limites.md e faq.md
src/css/custom.css     o tema: tokens --botai-* do @piluvitu/ui mapeados para as variáveis --ifm-* do Infima, e as fontes
static/                img/botai.svg (logo e favicon) e robots.txt
scripts/               exemplos.mjs (blocos "testar") e versoes.mjs (versões citadas), com os testes ao lado
docusaurus.config.mjs  a configuração; sidebars.mjs gera a barra lateral das pastas
vercel.json            o Ignored Build Step da Vercel
CONVENCOES.md          árvore, frontmatter, tom, status, exemplos testáveis e versões, para quem escreve
```

## Configuração

- **Só docs:** `routeBasePath: '/'`, `blog: false`, `pages: false`; o `intro.md` tem `slug: /`. `url` `https://docs.botai.pilutech.com.br`, `baseUrl` `/`, `i18n` só `pt-BR`.
- **Link quebrado derruba o build:** `onBrokenLinks`, `onBrokenAnchors`, `onDuplicateRoutes` e `markdown.hooks.onBrokenMarkdownLinks` em `throw` (o `onBrokenMarkdownLinks` da raiz da config está obsoleto na 3.10).
- **`markdown.format: 'detect'`:** `.md` é CommonMark (`<valor>` e `{ }` na prosa são texto) e `.mdx` é MDX (para as abas). No `.md`, admonition com título (`:::caution[Não testado]`) e id explícito de título (`## Título {#id}`) funcionam, e a âncora sem id sai com acento (`#códigos-de-saída`); conferido no build em 2026-10-08.
- **Pastas:** cada uma tem `_category_.json` com `position` e `link.type: 'generated-index'` em `/<pasta>`. Pasta sem página não aparece. Um `index.md` dentro da pasta colidiria com a página gerada.
- **SEO:** sitemap do preset (`/sitemap.xml`) e `static/robots.txt` apontando para ele.
- **Navbar:** logo, "Site" (`https://botai.pilutech.com.br`), "GitHub" (`https://github.com/PiluVitu/Botai`) e "npm" (o `@pilutech/botai-core`). **Rodapé:** "Powered by PiluTech" com link para `https://pilutech.com.br`.
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

| Arquivo                      | O que trava                                                                                                                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/exemplos.test.mjs`  | todo bloco ` ```bash testar ` de `docs/**/*.md(x)` sai com 0 (ou o N de `testar=N`); o extrator, as proibições e a troca do servidor; ao menos um bloco existe                      |
| `scripts/versoes.test.mjs`   | toda versão citada (`@pilutech/botai-core@X`, `ghcr.io/piluvitu/botai:X`, `@pilutech/botai-playwright@X`, `core-vX`, `BOTAI_VERSAO=X`, o `motor` das saídas) é a dos `package.json` |
| `docusaurus.config.test.mjs` | URL, raiz, pt-BR, só docs, links quebrados em `throw`, navbar, rodapé, logo, sem busca nem script de terceiros, sitemap e robots                                                    |
| `src/css/custom.test.mjs`    | tokens iguais aos do `@piluvitu/ui`, `--ifm-*` saindo deles, fontes do `@fontsource` sem CDN                                                                                        |
| `vercel.test.mjs`            | o `ignoreCommand` e que todo caminho vigiado existe                                                                                                                                 |

- **Como os blocos rodam:** o teste copia `packages/core/dist` para uma pasta temporária (no `make test`, o plugin do Playwright reconstrói o core em paralelo com `rm -rf dist`), confere a cópia com `botai --versao` e põe no `PATH` um `botai` que roda `node <cópia>/bin/botai.js`. Cada bloco roda em `bash -c 'set -eo pipefail; …'`, numa pasta vazia, sem stdin, com 60 s de limite. Bloco que cita `127.0.0.1:8790` fala com um `botai serve --porta 0` que o teste sobe uma vez e troca na URL.
- **Proibido em bloco testado** (o teste reprova antes de rodar): URL que não seja `http://127.0.0.1:8790`, `docker`, `docker-compose`, `npx`, `npm`, `pnpm`, `sudo`, `gh`, `psql`, `mysql`, `sqlite3` e `botai serve`. A proibição olha a palavra solta, não a posição de comando: `--dialeto mysql` também cai, e as páginas escrevem `--dialeto=mysql` nos blocos testados.
- O teste não builda o core: sem `packages/core/dist` (ou com outra versão), espera até 30 s e falha pedindo `make build-core`. O `make test-botai-docs` e o job do CI buildam antes; no `make test`, a dependência `workspace:*` do core põe este pacote depois do teste do core, que builda.
- Subiu a versão do core ou do plugin? O `versoes.test.mjs` lista cada página a atualizar; saída colada que mudou se copia de novo de uma execução real.

## Comandos

| Comando                                                         | O quê                                                                             |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `make dev-botai-docs`                                           | `docusaurus start` em http://localhost:3022                                       |
| `make build-botai-docs`                                         | `docusaurus build` em `build/` (link, âncora e link de markdown quebrados falham) |
| `make test-botai-docs`                                          | build do core + todos os testes acima                                             |
| `pnpm --filter @pilutech/botai-docs run serve`                  | serve o `build/` em http://localhost:3022                                         |
| `pnpm --filter @pilutech/botai-docs run lint`                   | `prettier --check .` + `versoes.test.mjs` (entra no `make lint`)                  |
| `pnpm --filter @pilutech/botai-docs exec prettier --write docs` | formata as páginas                                                                |

O lint-staged deste pacote roda o Prettier em `*.{js,mjs,json,md,mdx,css}`.

O cache persistente do webpack fica em `documentacao/node_modules/.cache/webpack`, com nome fixo e sem a pasta do site na chave: uma cópia do site que use o mesmo `node_modules` o reaproveita, e o build cai com `TypeError: Cannot read properties of undefined (reading 'id')` no `DocItem` (visto em 2026-10-08). Saída: `pnpm --filter @pilutech/botai-docs run clear`, ou o build com `DOCUSAURUS_NO_PERSISTENT_CACHE=1`.

## Deploy (Vercel, projeto próprio)

1. Projeto **`botai-docs`** ligado a `PiluVitu/Botai` (o dono cria), **Root Directory `documentacao`**, framework Docusaurus, install e build padrão (`pnpm install` na raiz do repo, `pnpm build`), saída `build`, Node 22.x e "Include files outside the root directory in the Build Step" ligado (o `custom.css` importa as fontes do `node_modules` da raiz, pelo pnpm).
2. **"Skip deployments" desligado**; quem filtra é o `ignoreCommand` do `vercel.json` (roda na Root Directory; `exit 0` cancela): a documentação, `packages/core` (as versões e as saídas que as páginas citam) e os arquivos de install da raiz (`pnpm-lock.yaml`, `pnpm-workspace.yaml`, `package.json`, `.npmrc`). O `vercel.test.mjs` confere a lista e que todo caminho existe.
3. Domínio **`docs.botai.pilutech.com.br`** no projeto, com o `CNAME docs.botai` da Cloudflare em **DNS only**, apontando para o valor que a Vercel mostrar ao adicionar o domínio.
4. Env: nenhuma.
5. O preview da Vercel já responde com `X-Robots-Tag: noindex` (a landing conta com o mesmo); o `vercel.json` não declara cabeçalho. Confira: `curl -sI https://<preview>.vercel.app | grep -i x-robots-tag`; `https://docs.botai.pilutech.com.br` responde 200 sem `noindex` e `/sitemap.xml` lista as páginas.

## Dependências

As exceções que a documentação trouxe (o `core-js` negado no `allowBuilds`, o `@docsearch/*` 4.7.1 e o `webpack-dev-middleware` 7.4.6 no `trustPolicyExclude`, os overrides do `tinypool` e do `serialize-javascript`) estão na seção de segurança do `CLAUDE.md` da raiz, com o motivo e a condição de saída.
