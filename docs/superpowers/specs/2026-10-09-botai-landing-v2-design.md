# ESPEC — landing v2 do Botaí (`site/`)

> **Implementada em 2026-10-09** (`site/`, PR da `feat/site-v2`). Desvios decididos na integração, depois da comparação com o design a 1440 e a 390 px nos dois temas:
>
> - Integrações: a grade fica em `minmax(min(100%,190px),1fr)` (6 colunas a 1440, como no design), e o selo perde o «via»: «Sem teste · JS» / «Sem teste · HTTP». A 190 px, «Sem teste · via HTTP» quebrava em duas linhas dentro da pílula; até 16 caracteres («Testado via HTTP») cabe.
> - Terminal do hero: sem o `nascimento`, e a reticência entre chaves vai no fim da linha anterior (`"cpf": "634.132.403-07", …,`): o bloco de 18 linhas, com uma linha só de «…,» por omissão, deixava o terminal bem mais alto que o formulário.
> - Portas: o comando da CLI leva `npx -y` (como no relatório, §2 e §9): sem o `-y`, o npx de cache frio pergunta pelo stdout, que vai para o `psql`.
> - Blocos de código: só a flag é `inline-block`; o resto quebra como texto corrido (o pacote e a URL, num `inline-block`, desciam inteiros e deixavam o `npx` sozinho).
> - Open Graph: Plus Jakarta Sans 800 e JetBrains Mono 400 de `@fontsource/*` (`.woff` local, seção 4); o pé fica em mono 18 px com `letter-spacing` 0.02em e o «Powered by PiluTech» sem quebra, numa linha só (no design, a 19 px, as portas e o PiluTech quebravam).
> - Descrição da home e o `WebSite` do JSON-LD citam as portas (o título fica, F41).
> - Rodapé com «Suporte» na coluna Projeto (a recomendação da seção 1.12).
> - O `Topo` (voltar e tema) segue nas páginas de texto; `/privacidade` e `/termos` não ganham o cabeçalho com âncoras da landing.

Fonte visual: projeto Claude Design `b98ae730-abc3-47ea-8e44-1a2be5083481`. Cópias em `docs/superpowers/design/2026-10-09-botai-landing-v2/`:

| Arquivo                                   | O que é                                                                                                                                                                                                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Botai v2.dc.html`                        | a página (fonte principal; texto, layout e lógica no `<script data-dc-script>`)                                                                                                                                                                                          |
| `Botai v2 Telas.dc.html`                  | canvas com 5 telas: 1a desktop 1440 escuro, 1b desktop 1440 claro, 1c mobile 390 escuro, 1d mobile 390 claro, 1e OG 1200×630. São iframes da mesma página: o mobile é o mesmo HTML em 390 px (grades `auto-fit` caem para 1 coluna e o `nav` vira menu abaixo de 900 px) |
| `Botai v2 OG.dc.html`                     | o card de Open Graph                                                                                                                                                                                                                                                     |
| `desktop-escuro.png`, `mobile-escuro.png` | o design renderizado a 1440 e a 390 px, tema escuro                                                                                                                                                                                                                      |

Ficaram só no projeto do Claude Design: a recriação da v1 (`Botai v1 (atual).dc.html`), o mapa tela → arquivos (`github.md`), o `support.js` e o design system (`_ds/`, que é o `@piluvitu/ui`; o site usa o pacote do npm, nunca o `_ds_bundle.js`). Os `.dc.html` carregam `support.js` e `_ds/` por caminho relativo: para abrir fora do Claude Design, baixe os dois para o lado.

Fonte da verdade dos fatos: o relatório de capacidades de 2026-10-08 (as 7 auditorias e a verificação; fora do repo, citado como "relatório" e por seção, §N; core 0.4.1, playwright 0.1.0, extensão 1.0.0). Conferido também nesta fase: `node packages/core/dist/bin/botai.js pessoa --semente 42 --hoje 2026-10-05` devolve exatamente a pessoa do design (Márcio Carvalho Rodrigues, CPF 634.132.403-07…); sem `--hoje` (hoje = 2026-10-09) o nascimento vira `02/03/1970`. A semente 42 com hoje 2026-10-05 é o dourado `packages/core/dourado/v1/pessoa-semente-numero.json`.

Segurança dos arquivos do design: nada nos `.dc.html`, no `github.md` nem no `readme.md` do DS se dirige ao agente. O `readme.md` termina com um pedido ao leitor humano ("Help make this better: share the logo…"), que não é instrução e foi ignorado.

---

## 0. Regras que valem para todas as seções

- **Ícones:** o design carrega Lucide (`unpkg.com/lucide-static`) e Font Awesome por CDN. O site não pede nada a outro host (E2E da privacidade), então tudo vira `FontAwesomeIcon` com `@fortawesome/free-*-svg-icons` (já no `package.json`). Mapa (todos existem na v7, conferido):

  | Lucide no design                              | Font Awesome no site                                                 |
  | --------------------------------------------- | -------------------------------------------------------------------- |
  | `icon-book-open`                              | `faBookOpen`                                                         |
  | `icon-github`                                 | `faGithub` (brands)                                                  |
  | `icon-sun` / `icon-moon`                      | `faSun` / `faMoon` (o `BotaoTema` atual)                             |
  | `icon-menu` / `icon-x`                        | `faBars` / `faXmark`                                                 |
  | `icon-copy` / `icon-check`                    | `faCopy` / `faCheck`                                                 |
  | `icon-terminal`                               | `faTerminal`                                                         |
  | `icon-app-window`                             | `faWindowMaximize`                                                   |
  | `icon-circle-check`                           | `faCircleCheck`                                                      |
  | `icon-puzzle`                                 | `faPuzzlePiece`                                                      |
  | `icon-server`                                 | `faServer`                                                           |
  | `icon-container`                              | `faDocker` (brands)                                                  |
  | `icon-cpu`                                    | `faMicrochip`                                                        |
  | `icon-braces`                                 | `faCode`                                                             |
  | `icon-drama`                                  | `faMasksTheater`                                                     |
  | `icon-mouse-pointer-click`                    | `faArrowPointer`                                                     |
  | `icon-code`                                   | `faLaptopCode` (para não repetir o `faCode` da biblioteca)           |
  | `icon-database`                               | `faDatabase`                                                         |
  | `icon-workflow`                               | `faDiagramProject`                                                   |
  | `icon-arrow-right`                            | `faArrowRight`                                                       |
  | `icon-shield`                                 | `faShieldHalved`                                                     |
  | `icon-triangle-alert`                         | `faTriangleExclamation`                                              |
  | `icon-plug`                                   | `faPlug`                                                             |
  | `fa-chrome`, `fa-firefox-browser`, `fa-opera` | `faChrome`, `faFirefoxBrowser`, `faOpera` (`components/lojas-ui.ts`) |

  Todo ícone decorativo leva `aria-hidden` (o `FontAwesomeIcon` já põe). O CSS do FA segue na camada `base` (⚠️ do `site/CLAUDE.md`).

- **Marca:** o SVG 16×16 do design (quadrado `#38bdf8` com 4 retângulos `#0a0f1a`) é o mesmo desenho do `public/icone-128.png`. Vira o componente `Marca` (SVG inline, `aria-hidden`, prop `tamanho`), usado no cabeçalho (26), na chamada final (56), no rodapé (22) e no OG (56). Cores fixas nos dois temas (é a marca), como no design. SVG inline evita o `/_next/image` lazy no rodapé (⚠️ do `next start` no `site/CLAUDE.md`).
- **Tokens → classes Tailwind** (todas existem no `@piluvitu/ui` 0.1.0, `dist/styles.css`):

  | Estilo inline do design                                                                                                             | Classe                                                                                                                                                              |
  | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `hsl(var(--background))`, `--foreground`, `--card`, `--muted`, `--muted-foreground`, `--primary`, `--border`, `--input`, `--accent` | `bg-background`, `text-foreground`, `bg-card`, `bg-muted`, `text-muted-foreground`, `text-primary`/`bg-primary`, `border-border`, `border-input`, `hover:bg-accent` |
  | `hsl(var(--ok))`, `hsl(var(--warn))`                                                                                                | `text-ok`, `text-warn`                                                                                                                                              |
  | `hsl(var(--ok) / 0.5)`, `hsl(var(--warn) / 0.5)`, `hsl(var(--primary) / 0.45)`                                                      | `border-ok/50`, `border-warn/50`, `bg-primary/45`                                                                                                                   |
  | `var(--accent-soft)`, `var(--accent-line)`                                                                                          | `bg-accent-soft`, `border-accent-line`                                                                                                                              |
  | `var(--radius-lg)` (18 px), `var(--radius-md)` (16 px), `999px`                                                                     | `rounded-lg`, `rounded-md`, `rounded-full`                                                                                                                          |
  | `var(--font-mono)`, `var(--font-sans)`                                                                                              | `font-mono`, `font-sans` (o `next/font` do `layout.tsx` já liga as duas)                                                                                            |
  | `:focus-visible{outline:2px solid hsl(var(--ring));outline-offset:2px}`                                                             | `focus-visible:ring-2 focus-visible:ring-ring outline-none` (padrão do site)                                                                                        |
  | `a:hover{text-decoration:underline;text-underline-offset:3px}`                                                                      | `hover:underline underline-offset-[3px]` nos links de texto                                                                                                         |
  | `html{scroll-behavior:smooth}`                                                                                                      | `motion-safe:scroll-smooth` no `<html>` (respeita `prefers-reduced-motion`)                                                                                         |

- **Moldura da página:** `div` raiz `min-h-screen overflow-x-clip`; contêiner `mx-auto max-w-[1264px] px-[clamp(16px,4vw,32px)]` (1200 px de conteúdo no desktop; 358 px a 390; 288 px a 320). O fundo e a cor vêm do `body` (já no `globals.css`). Sem o gradiente radial da v1.
- **Padrão de seção** (seções 01–07): `<section id aria-labelledby>` com `mt-[clamp(80px,11vw,140px)] flex flex-col gap-7 scroll-mt-6`. Dentro:
  1. **Sobrelinha** (é `<p>`, não título): rótulo `font-mono text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground`, número `font-mono text-xs text-primary` (`01`…`07`) e a régua `h-px flex-1 bg-border` (`aria-hidden`).
  2. **Título** `h2` `text-[clamp(32px,4.4vw,52px)] leading-[1.05] font-extrabold tracking-[-0.035em]`.
  3. **Apoio** opcional à direita do título: linha `flex flex-wrap items-end justify-between gap-x-12 gap-y-4`, `p` `max-w-[520px] text-[17px] leading-[1.55] text-muted-foreground text-pretty`.
     Esse padrão vira um componente só (`Secao`, ver "Estrutura").
- **Cartão:** `CARTAO` de `components/cartao.ts` (`bg-card border-border rounded-lg border`). O `Card` do `@piluvitu/ui` traz `rounded-xl shadow-sm` e o design não usa sombra nem `rounded-xl`: use o `CARTAO` (o v1 já faz assim).
- **Botões:** `Button` de `@piluvitu/ui/button` com `asChild` + `<a>` (variantes `default` e `outline`, `size="lg"`), como no design (`x-import … Button`). Botões-ícone (GitHub, tema, menu, copiar) são `<a>`/`<button>` próprios de 36×36 (`size-9 rounded-md border border-input`), como o `BotaoTema` atual. Nenhum outro componente do DS é usado pela v2 (sem `Badge`: os selos do design são `span` com borda; sem `Sheet`/`DropdownMenu`: o menu do design é um painel simples).
- **320 px:** o E2E atual exige `scrollWidth ≤ clientWidth` e nada do topo, das seções e do rodapé fora da coluna. Todo bloco de código quebra linha (técnica do `para-devs.tsx`, ver `LinhaDeComando`), e toda fileira de botões tem `flex-wrap` + `max-w-full`.
- **Texto honesto:** "disponível" não aparece (só os links para as lojas no ar dizem que dá para instalar). Nada marcado "Testado" fora do que o relatório prova.

---

## 1. Seções, na ordem, com o texto exato

> Texto entre «» é o do design. Onde o design precisa mudar, a linha **Usar:** traz o texto final (o veredito está em "Fatos a conferir").

### 1.1 Cabeçalho (`<header>`, banner)

- Desktop (≥ 900 px): `flex items-center justify-between gap-4 py-5 border-b border-border relative`.
  - Esquerda: link `href="#topo"`, `aria-label="Botaí, início"`: `Marca` 26 + «Botaí» (`text-xl font-extrabold tracking-[-0.03em]`).
  - Centro: `<nav aria-label="Seções">` com 4 âncoras `font-mono text-[13px] text-muted-foreground px-2.5 py-2`: «Portas» → `#portas`, «Mesma pessoa» → `#mesma-pessoa`, «Para quem» → `#para-quem`, «Extensão» → `#extensao`.
  - Direita (`gap-2`): `Button` default `asChild` → `<a href={URL_DA_DOCUMENTACAO}>` com `faBookOpen` + «Docs» (`px-3.5 font-semibold`); link-ícone `href={REPOSITORIO}` `aria-label="Código no GitHub"` com `faGithub`; `BotaoTema` (o atual).
- Mobile (< 900 px): o `nav` some (`hidden min-[900px]:flex`) e aparece o botão «Abrir menu» (`min-[900px]:hidden`, `aria-expanded`, `aria-controls`, ícone `faBars`/`faXmark`). Aberto, um `<nav aria-label="Seções">` absoluto (`top-[calc(100%+8px)] inset-x-0 z-10 flex flex-col p-2 bg-card border border-border rounded-lg`) com as 4 âncoras `px-3 py-3.5 font-mono text-sm` (alvo ≥ 44 px); clicar numa âncora fecha; `Escape` fecha e devolve o foco ao botão.
- A 320 px os itens da direita (Docs 88 + 3 × 36 + gaps ≈ 220 px) mais a marca (≈ 86 px) passam dos 288 px úteis: a linha precisa de `flex-wrap` (como o `Topo` da v1) ou o Docs vira só ícone com `aria-label="Docs"` abaixo de ~360 px. O E2E de 320 px tem de cobrir o banner.
- Diferente do design: o `aria-label` do tema fica «Alternar tema» fixo (o design troca o rótulo pelo tema, o que daria erro de hidratação: o servidor não sabe o tema). Os ícones trocam por CSS (`dark:`), como hoje.

### 1.2 Hero (`<main id="topo">` → `<section aria-labelledby="hero-titulo">`)

`pt-[clamp(48px,8vw,96px)] flex flex-col gap-7`.

1. Sobrelinha: «~/pilulabs/botai» (`font-mono text-sm text-primary`).
2. `h1#hero-titulo` (`max-w-[980px] text-[clamp(38px,6vw,76px)] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance`): «Dados de teste brasileiros em todo lugar que o seu teste roda.» Manter o prefixo `<span class="sr-only">Botaí: </span>` (regra "um h1 só" do `site/CLAUDE.md`).
3. Parágrafo (`max-w-[720px] text-[clamp(17px,1.6vw,20px)] leading-[1.55] text-muted-foreground text-pretty`): «O Botaí gera uma pessoa brasileira fictícia e coerente, com CPF, CEP, celular e empresa que batem entre si, e preenche formulários com ela. Um motor só, com oito portas: extensão, CLI, biblioteca, HTTP, Docker, binários, Playwright e o motor direto na página.»
4. Botões (`flex flex-wrap items-center gap-3 mt-1`, altura 48, `text-[15px] font-semibold`):
   - `Button` default `asChild` → `URL_DA_DOCUMENTACAO`: `faBookOpen` + «Ler a documentação».
   - `Button` outline `asChild` → `#extensao`: `faChrome` + `faFirefoxBrowser` + «Instalar a extensão».
5. Caixa do comando (`max-w-[560px] flex items-center gap-2.5 py-1.5 pr-1.5 pl-4 bg-card border border-border rounded-md font-mono text-sm`): `$` (`aria-hidden select-none text-primary`), o comando em `<code>` (quebra por palavra) e `BotaoCopiar` 36×36 (`aria-label="Copiar comando: <comando>"`).
   - Design: «npx @pilutech/botai-core pessoa --semente 42».
   - **Usar:** `npx @pilutech/botai-core@0.4.1 pessoa --semente 42 --hoje 2026-10-05` (versão = `MOTOR` do core; ver Fatos F3).
6. Duas janelas (`relative mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-4`); 2 colunas no desktop, 1 no mobile. Cada uma: `CARTAO overflow-hidden min-w-0`, barra de título `flex justify-between gap-3 px-[18px] py-3 border-b border-border font-mono text-xs text-muted-foreground`.
   - **Terminal**: barra «~/pilulabs/botai» com `faTerminal` (`text-primary`) e, à direita, «terminal». Corpo `<pre class="m-0 p-[18px] text-[13px] leading-[1.75] whitespace-pre-wrap [overflow-wrap:anywhere]">`: `$ ` em `text-primary` + o mesmo comando do item 5, e a saída. O design mostra um JSON plano que a CLI não produz (Fatos F4). **Usar** a saída real abreviada, na ordem real das chaves, com `…` onde há chave omitida, chaves em `text-muted-foreground` e valores interpolados de `PESSOA_DO_EXEMPLO`:
     ```
     {
       "formato": 1,
       "motor": "0.4.1",
       "semente": "42",
       "hoje": "2026-10-05",
       "pessoa": {
         "nome": { …, "completo": "Márcio Carvalho Rodrigues", … }, …,
         "cpf": "634.132.403-07", …,
         "celular": { …, "formatado": "(98) 97702-9128", … },
         "email": { …, "endereco": "marcio-rodrigues-0337@tuamaeaquelaursa.com", … }, …,
         "endereco": { "cep": "65071-377", …, "cidade": "São Luís", "uf": "MA", … },
         "empresa": { …, "cnpj": "90.849.558/0001-39" }, …
       }
     }
     ```
   - **Formulário**: barra «localhost:3000/cadastro» com `faWindowMaximize` e, à direita, um `<kbd>` (`border border-border bg-muted rounded-[6px] px-1.5 text-[11px]`) com a tecla de quem visita (design: «⌥⇧P»; usar `atalhoDoVisitante`, como o `AtalhoLocal`). Corpo `p-[18px] grid grid-cols-2 gap-3`:
     - «Criar conta» (`col-span-full text-lg font-bold tracking-[-0.01em]`);
     - campos rótulo (`text-xs text-muted-foreground`) + valor (`block px-3 py-[9px] border-[1.5px] border-primary rounded-[10px] bg-background text-sm [overflow-wrap:anywhere]`): «Nome completo» Márcio Carvalho Rodrigues (linha toda); «E-mail» marcio-rodrigues-0337@tuamaeaquelaursa.com (linha toda); «CPF» 634.132.403-07; «Celular» (98) 97702-9128; «CEP» 65071-377; «Cidade» São Luís · MA;
     - rodapé `col-span-full font-mono text-xs text-ok` com `faCircleCheck`: design «6 de 6 campos · semente 42». **Usar:** «6 de 6 campos preenchidos» (a extensão não tem semente; Fatos F5).
   - As duas janelas são ilustração: cada uma num `<figure>` com `<figcaption className="sr-only">` («Exemplo: a pessoa da semente 42 no terminal» / «Exemplo: um cadastro preenchido pela extensão»), e os "campos" são `span`, não inputs.

### 1.3 Números (`<section aria-label="Números">`)

`mt-[clamp(56px,8vw,96px)] border-y border-border grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))]` (6 colunas de 200 px no desktop; 1 coluna a 390 e 320). Cada item `py-7 pr-5 flex flex-col gap-2`: valor `text-[clamp(30px,3vw,38px)] leading-none font-extrabold tracking-[-0.03em]`, texto `text-sm leading-[1.45] text-muted-foreground text-pretty`. Marcar como `<ul>`/`<li>` (ou `<dl>` com `dt` = texto e `dd` = valor, mantendo o valor em cima pela ordem visual do CSS). Legenda abaixo (`mt-3 font-mono text-xs text-muted-foreground`), dentro da seção.

| Valor  | Texto do design                                          | Usar                                                              |
| ------ | -------------------------------------------------------- | ----------------------------------------------------------------- |
| 43/43  | «campos iguais em 15 saídas com a mesma semente»         | «campos iguais em 15 saídas, com a mesma semente e o mesmo dia»   |
| ~2 s   | «para 100 mil pessoas, sem repetir CPF, e-mail nem CNPJ» | «para 100 mil pessoas pela CLI, sem repetir CPF, e-mail nem CNPJ» |
| 1.454  | «testes automatizados passando»                          | igual                                                             |
| 12     | «arquivos dourados iguais da 0.2.0 à 0.4.1»              | igual                                                             |
| 0,8 ms | «para preencher 21 campos (mediana)»                     | «mediana para o motor preencher 21 campos, sem a 2ª passada»      |
| 0      | «dependências no core»                                   | «dependências de runtime no core»                                 |

Legenda: design «medido em 08/10/2026 · código aberto, licença MIT». **Usar:** «medido em 08/10/2026, num Mac arm64 com Node 22 · código aberto, licença MIT».

### 1.4 Portas (`#portas`, sobrelinha «Portas» `01`)

- `h2#portas-titulo`: «Um motor, oito portas.»
- Apoio: «Todas usam o mesmo gerador, e as que preenchem formulário usam o mesmo motor. Escolha a que cabe no seu teste.»
- Grade (layout padrão `grade`; a variante `abas` do design é opcional e fica de fora): `<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4">` (4 colunas × 2 linhas no desktop, 1 coluna no mobile). Cada `<li>`: `CARTAO min-w-0 flex flex-col gap-3.5 p-[22px]`:
  - linha `flex items-center gap-3`: ícone num quadrado `size-10 rounded-[14px] bg-accent-soft text-primary` (ícone 18 px); `h3` nome (`text-[17px] font-bold tracking-[-0.01em]`) e, abaixo, «porta 01»…«porta 08» (`font-mono text-[11px] tracking-[0.04em] text-muted-foreground`);
  - `p` linha (`text-sm leading-[1.55] text-pretty`);
  - `p` onde (`text-[13px] leading-[1.5] text-muted-foreground`);
  - caixa do comando no pé (`mt-auto flex items-start gap-2 py-2 pr-2 pl-3 bg-background border border-border rounded-[12px]`): `<code>` `text-[12.5px] leading-[1.55] whitespace-pre-wrap [overflow-wrap:anywhere]` + `BotaoCopiar` 32×32 (`aria-label="Copiar comando da porta <nome>"`) quando copiável.

| #   | Nome       | Ícone              | Linha                                                                                           | Onde                                                                                                                          | Comando (design)                                                                                 | Usar                                                                                                                        | Copiável                                         |
| --- | ---------- | ------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 01  | Extensão   | `faPuzzlePiece`    | «Preenche o formulário da aba num atalho, ou um campo só pelo botão direito.»                   | «Chrome 123+ e Edge pela Chrome Web Store, Firefox 153+ pela Firefox Add-ons. Opera em revisão.»                              | «⌥⇧P no Mac · Ctrl+Shift+Y no Windows e no Linux»                                                | «⌥⇧P no Mac · Ctrl+Shift+Y no Windows e no Linux · Alt+Shift+P no Firefox para Linux» (montado de `ATALHOS`)                | não                                              |
| 02  | CLI        | `faTerminal`       | «Uma pessoa ou um lote em JSON, NDJSON, CSV ou SQL, direto no banco.»                           | «Onde houver Node.»                                                                                                           | `npx @pilutech/botai-core pessoas -n 1000 --semente carga --formato sql \| psql "$DATABASE_URL"` | `npx -y @pilutech/botai-core@0.4.1 pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql \| psql "$DATABASE_URL"` | sim                                              |
| 03  | HTTP       | `faServer`         | «Python, Go, Java ou qualquer linguagem que fale HTTP pede uma pessoa.»                         | «Node, imagem ou binário.»                                                                                                    | `curl 'http://127.0.0.1:8790/pessoa?semente=42'`                                                 | `curl 'http://127.0.0.1:8790/pessoa?semente=42&hoje=2026-10-05'`                                                            | sim                                              |
| 04  | Docker     | `faDocker`         | «O servidor numa imagem, que entra como service no CI.»                                         | «linux/amd64 e linux/arm64.»                                                                                                  | `docker run --rm -p 8790:8790 ghcr.io/piluvitu/botai:0.4.1`                                      | igual (`IMAGEM_DO_SERVIDOR`)                                                                                                | sim                                              |
| 05  | Binários   | `faMicrochip`      | «A CLI e o servidor sem instalar Node.»                                                         | «macOS, Linux e Windows, x64 e arm64.» → **usar** «macOS, Linux e Windows, x64 e arm64. No Windows, baixe o .exe do release.» | `curl -fsSL https://github.com/PiluVitu/Botai/releases/latest/download/install.sh \| sh`         | igual                                                                                                                       | sim                                              |
| 06  | Biblioteca | `faCode`           | «O mesmo gerador no seu código JS ou TS, sem nenhuma dependência.»                              | «Node, Bun, Deno e navegador.»                                                                                                | `gerarPessoa({ semente: 42, hoje: '2026-10-05' })`                                               | igual (pode ganhar a linha `import { gerarPessoa } from '@pilutech/botai-core'` acima, como na v1)                          | sim                                              |
| 07  | Playwright | `faMasksTheater`   | «A semente é o nome do teste: o retry usa a mesma pessoa e a falha leva a pessoa no relatório.» | «Chromium, Firefox e WebKit.»                                                                                                 | `await botai.preencher(page)`                                                                    | igual                                                                                                                       | sim                                              |
| 08  | Motor      | `faWindowMaximize` | «Um script de 40 KB que preenche o formulário da página.»                                       | «Qualquer ferramenta que execute JS na página. Testado com Playwright e CDP.»                                                 | **[TRECHO DE USO DO MOTOR]** (placeholder)                                                       | `window.__botaiNavegador.preencher(document, pessoa, hoje, { segundaPassada: true })` (relatório §2 e §3.8)                 | sim (o design marcou não só por ser placeholder) |

- Nota no pé da seção (`text-sm text-muted-foreground`): «Saída em JSON, NDJSON, CSV e SQL para Postgres, MySQL e SQLite. Importação provada no Postgres 16 e no SQLite.»
- Mobile: 1 coluna; os comandos longos quebram por palavra (sem rolagem). Variante `abas` (fora do escopo): tablist WAI-ARIA com 8 pílulas e painel com «guia na documentação →»; se um dia entrar, segue o padrão do `CapturasAbas` da v1.

### 1.5 Mesma pessoa (`#mesma-pessoa`, `aria-labelledby="semente-titulo"`, sobrelinha «Mesma pessoa» `02`)

- `h2#semente-titulo`: «Mesma semente, mesma pessoa.»
- Apoio: design «Com a mesma semente e o mesmo `hoje`, todas as portas devolvem a mesma pessoa. O teste que falhou no CI roda na sua máquina com os mesmos dados.» **Usar:** «Com a mesma semente e o mesmo `hoje`, toda porta que aceita semente devolve a mesma pessoa. O teste que falhou no CI roda na sua máquina com os mesmos dados.» (`hoje` em `<code class="text-foreground text-[15px]">`).
- Diagrama: `CARTAO grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-center p-[clamp(20px,3vw,36px)]` (3 colunas no desktop: entrada | portas | saída; empilha no mobile).
  - **Entrada** (`py-4 flex flex-col gap-3`): rótulo «Entrada» (`font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground`); caixa `p-[18px] border-[1.5px] border-primary rounded-[14px] bg-background font-mono text-[15px] flex flex-col gap-2` com «semente: **42**» (42 em `text-primary`) e «hoje: '2026-10-05'» (chaves em `text-muted-foreground`); nota `text-[13px] text-muted-foreground`: «No Playwright, a semente é o nome do teste.»
  - **Portas** (`<ul aria-label="Portas">`, `py-4 flex flex-col gap-1.5`): cada `li` = traço `aria-hidden h-px flex-1 bg-primary/45` + pílula `min-w-[150px] inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-full bg-muted font-mono text-[12.5px]` (ícone `text-primary` + nome) + traço. Design: as 8 portas. **Usar** só as 6 que recebem semente e entraram na prova: CLI, HTTP, Docker, Binários, Biblioteca, Playwright (a extensão sorteia com crypto; o motor recebe a pessoa pronta; Fatos F12).
  - **Saída** (`py-4 flex flex-col gap-3`): rótulo «Saída»; caixa `px-[18px] py-1.5 border-[1.5px] border-primary rounded-[14px] bg-background` com 6 linhas `flex justify-between gap-3 py-[9px] border-b border-border text-[13.5px]` (chave `font-mono text-xs text-muted-foreground`, valor à direita `[overflow-wrap:anywhere]`): `nome` Márcio Carvalho Rodrigues · `cpf` 634.132.403-07 · `celular` (98) 97702-9128 · `cep` 65071-377 · São Luís, MA · `cnpj` 90.849.558/0001-39 · `cartão` 5555 5555 5555 4444 (de `PESSOA_DO_EXEMPLO`). Pé `font-mono text-xs text-ok` com `faCircleCheck`: design «43 de 43 campos iguais em 15 saídas». **Usar:** «a semente 42 é um dos 12 arquivos dourados» (a prova 43/43 foi com a semente `verificador-1`; o número 43/43 continua na faixa de Números; Fatos F13).
- Três cartões (`<ol class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">`, cada `li` `p-[22px] border border-border rounded-lg flex flex-col gap-2.5`, sem fundo): rótulo `font-mono text-xs text-primary` + texto `text-[15px] leading-[1.55] text-pretty`.
  1. «01 · no CI» — «O teste falha e o relatório leva a pessoa que foi usada, com a semente.»
  2. «02 · na sua máquina» — design «A mesma semente no terminal devolve a mesma pessoa, campo por campo.» **Usar:** «A mesma semente e o mesmo `hoje` no terminal devolvem a mesma pessoa, campo por campo.»
  3. «03 · entre versões» — design «Arquivos dourados guardam a pessoa esperada de cada semente e são conferidos a cada PR. Os 12 não mudaram da 0.2.0 à 0.4.1. Fixe a versão do pacote.» **Usar:** «Arquivos dourados guardam as pessoas esperadas de um conjunto de sementes e são conferidos a cada PR. Os 12 não mudaram da 0.2.0 à 0.4.1. Fixe a versão do pacote.»

### 1.6 A pessoa (sem âncora, `aria-labelledby="pessoa-titulo"`, sobrelinha «A pessoa» `03`)

- `h2#pessoa-titulo` (`max-w-[640px] text-balance`): «Uma pessoa onde tudo bate.»
- Apoio: design «O endereço decide o resto. Todos os documentos passam no dígito verificador.» **Usar:** «A UF do endereço amarra o CPF, o DDD e o título. Todos os documentos passam no dígito verificador.»
- Grade `grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] gap-4` (2 colunas no desktop, 1 no mobile):
  - **Cartão da pessoa** (`CARTAO min-w-0 p-[clamp(20px,3vw,32px)] flex flex-col gap-[22px]`):
    - topo `flex flex-wrap items-center justify-between gap-3`: nome «Márcio Carvalho Rodrigues» (`<p class="text-2xl font-extrabold tracking-[-0.02em]">`) e «26/02/1970 · 56 anos» (`text-sm text-muted-foreground`); selo «semente 42» (`font-mono text-xs px-2.5 py-[5px] border border-accent-line bg-accent-soft text-primary rounded-full`).
    - `<dl class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-x-6 gap-y-[18px]">`, `dt` `font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground`, `dd` `mt-1` (mono 15 px para números, sans 14 px para texto). Destaques em `text-warn font-bold`:
      - CEP: `65071-377`
      - Endereço: «Avenida Litorânea, 199, Apto 171 · Calhau · São Luís, **MA**»
      - CPF: `634.132.40**3**-07`
      - Celular: `(**98**) 97702-9128`
      - Título de eleitor: `5022 4149 **11**71`
      - RG · PIS: `92.957.904-5 · 166.24491.26-5`
      - E-mail: marcio-rodrigues-0337@tuamaeaquelaursa.com (`[overflow-wrap:anywhere]`)
      - Empresa: «Carvalho & Rodrigues Engenharia Ltda · Rodrigues Store · `90.849.558/0001-39`»
      - Cartão de teste Stripe: `5555 5555 5555 4444 · 11/28`
    - Todos os valores saem de `PESSOA_DO_EXEMPLO`; os destaques vêm de índices fixos (9º dígito do CPF, DDD, dígitos 9–10 do título, UF), conferidos no teste contra `REGIAO_FISCAL_CPF` e `CODIGO_UF_TITULO` do core.
  - **Regras** (`<ul class="flex flex-col gap-3">`, cada `li` `flex gap-4 items-start px-5 py-[18px] border border-border rounded-lg`): chip `min-w-16 text-center font-mono text-[13px] font-bold px-2 py-[5px] rounded-[8px] border border-warn/50 text-warn` + título `text-[15px] font-bold` + texto `mt-1 text-sm leading-[1.5] text-muted-foreground`.

    | Chip  | Título                    | Texto do design                                                                                  | Usar                                                                                                  |
    | ----- | ------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
    | MA    | CEP real                  | «O CEP existe, e a rua, o bairro e a cidade batem com ele. A UF do endereço amarra o resto.»     | «O CEP existe, e a rua, o bairro e a cidade batem com ele. A UF dele amarra o CPF, o DDD e o título.» |
    | …3-07 | CPF da região fiscal      | «O nono dígito é o da região fiscal da UF: 3 cobre CE, MA e PI.»                                 | igual                                                                                                 |
    | (98)  | DDD do CEP                | «O celular usa o DDD daquele CEP.»                                                               | igual                                                                                                 |
    | …11.. | Título com o código da UF | «O título de eleitor traz o código da UF, 11 para o Maranhão. RG e PIS também passam no dígito.» | igual                                                                                                 |
    | @     | E-mail do nome            | «Derivado do nome, com caixa de entrada pública para ler a confirmação.»                         | igual                                                                                                 |

### 1.7 Para quem (`#para-quem`, `aria-labelledby="quem-titulo"`, sobrelinha «Para quem» `04`)

- `h2#quem-titulo`: «Cada um entra pela sua porta.» (sem apoio)
- `<ul class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-4">` (3 colunas × 2 linhas no desktop; 1 coluna no mobile). Cartão `CARTAO p-6 flex flex-col gap-3.5`: topo `flex justify-between` com `h3` (`text-[19px] font-extrabold tracking-[-0.02em]`) e ícone `text-primary` 18 px; etiquetas (`font-mono text-[11.5px] px-[9px] py-[3px] rounded-full border border-accent-line text-primary`); lista `list-disc pl-[18px] flex flex-col gap-2 text-[14.5px] leading-[1.55] text-muted-foreground`.

  | h3                     | Ícone              | Etiquetas                            | Itens (design)                                                                                                                                                                                                                                                                                                 | Usar                                                                                                        |
  | ---------------------- | ------------------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
  | QA manual              | `faArrowPointer`   | extensão                             | «Um atalho preenche o cadastro inteiro, e a mesma pessoa fica guardada entre as etapas de um fluxo.» / «`Botão direito › Botaí › Inserir` põe CPF, e-mail, CEP e mais 20 tipos num campo só.» (trecho em `font-mono text-[13px] text-foreground`) / «“Abrir caixa de entrada” mostra o e-mail de confirmação.» | itens 1 e 2 iguais; 3: «“Abrir caixa de entrada” abre a caixa pública, onde chega o e-mail de confirmação.» |
  | Dev frontend           | `faLaptopCode`     | extensão, biblioteca                 | «Funciona com React, Vue e máscaras (imask, jQuery Mask, react-number-format).» / «O popup lista os campos que não reconheceu.» / «A biblioteca traz validadores de CPF, CNPJ, RG, PIS e título.»                                                                                                              | 1: «Funciona com React, Vue e máscaras (imask, jQuery Mask e maska).»; 2 e 3 iguais                         |
  | QA de automação        | `faMasksTheater`   | playwright, motor                    | «`botai.preencher(page)` em cadastro, checkout e onboarding, em todos os frames.» / «A falha do CI é reproduzida com a mesma pessoa no terminal.»                                                                                                                                                              | iguais                                                                                                      |
  | Backend semeando banco | `faDatabase`       | cli, sql, csv                        | «Mil INSERTs iguais em qualquer máquina, compatíveis com colunas UNIQUE.» / «`--uf PI` amarra o CEP, o DDD, a região do CPF e o código do título.»                                                                                                                                                             | iguais (com o `--hoje` no comando da CLI da seção 1.4)                                                      |
  | CI                     | `faDiagramProject` | npx com versão fixa, imagem, binário | «O seed de banco num passo do workflow.» / «A imagem entra como service container.»                                                                                                                                                                                                                            | iguais                                                                                                      |

- Sexto item, cartão de convite (`p-6 border border-dashed border-border rounded-lg flex flex-col justify-between gap-5`, sem fundo): «Não sabe por onde começar?» (`<p>` 19 px extrabold, `text-balance`), «A documentação tem um guia por porta e as integrações por linguagem.» (14,5 px muted) e o link `font-mono text-[13px] text-primary` «docs.botai.pilutech.com.br →» (`faArrowRight`) para `URL_DA_DOCUMENTACAO`. Conferido: `documentacao/docs/` tem uma pasta por porta e `integracoes/` (cypress, go, java, puppeteer, python, selenium, webdriverio).

### 1.8 Integrações (sem âncora, `aria-labelledby="integracoes-titulo"`, sobrelinha «Integrações» `05`)

- `h2#integracoes-titulo`: design «O que foi testado, e o que só roda.» **Usar:** «O que foi testado, e o que ainda não.»
- Apoio: «O motor roda em qualquer ferramenta que execute JS na página, e o servidor atende qualquer linguagem que fale HTTP. O selo diz o que já tem teste.»
- `<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,190px),1fr))] gap-3">` (6 colunas no desktop, 13 itens em 3 linhas; 1 coluna a 390). Item `bg-card border border-border rounded-md p-[18px] flex flex-col gap-3`: nome `<p class="text-base font-bold">` + selo `self-start inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full font-mono text-[11.5px]`:
  - testado: `border border-ok/50 text-ok` + `faCircleCheck`;
  - sem teste: `border border-border text-muted-foreground` + `faPlug`.

  | Nome        | Selo do design   | Usar               |
  | ----------- | ---------------- | ------------------ |
  | Playwright  | Testado          | igual              |
  | Postgres    | Testado          | igual              |
  | SQLite      | Testado          | igual              |
  | Python      | Testado via HTTP | igual              |
  | Node        | Testado          | igual              |
  | Bun         | Testado          | igual              |
  | Deno        | Testado          | igual              |
  | Cypress     | Roda via JS      | «Sem teste · JS»   |
  | Selenium    | Roda via JS      | «Sem teste · JS»   |
  | Puppeteer   | Roda via JS      | «Sem teste · JS»   |
  | WebdriverIO | Roda via JS      | «Sem teste · JS»   |
  | Go          | Roda via HTTP    | «Sem teste · HTTP» |
  | Java        | Roda via HTTP    | «Sem teste · HTTP» |

  Opcional (o relatório sustenta): MySQL «Sem teste · o SQL confere com o dourado»; Jest/Vitest com jsdom «Testado».

### 1.9 Extensão (`#extensao`, `aria-labelledby="extensao-titulo"`, sobrelinha «Extensão» `06`)

Grade `grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] gap-[clamp(28px,4vw,56px)] items-start` (2 colunas no desktop: texto | captura; empilha no mobile).

- Coluna de texto (`flex flex-col gap-[22px]`):
  - `h2#extensao-titulo`: «Bota aí no navegador.»
  - `p` 17 px muted: «Um atalho preenche a página inteira. O botão direito põe um dado num campo só. A mesma pessoa fica guardada até você pedir outra.»
  - Lojas (`<ul aria-label="Instalar pela loja" class="flex flex-wrap gap-2.5">`), lidas do `lojas.json` (`BotoesLoja` reaproveitado): publicada → `Button` default `size="lg"` `asChild` `h-11 px-5 font-semibold` → `<a target="_blank" rel="noopener noreferrer">` com ícone + «Chrome Web Store» / «Firefox Add-ons»; sem URL → **não** é mais `<button disabled>`: é um `span` `inline-flex items-center gap-2 h-11 px-4 border border-dashed border-border rounded-md text-sm text-muted-foreground` com ícone + nome curto e o estado em `font-mono text-xs text-warn`. Design: «Opera» + «em revisão». O Edge continua sumindo sem URL (`SO_COM_LINK`).
  - Requisitos (`font-mono text-[12.5px] leading-[1.6] text-muted-foreground`): «Chrome 123+ e Edge pela Chrome Web Store · Firefox 153+» (montado dos pisos do `wxt.config.ts`, como o `REQUISITOS` atual e o teste dele).
  - Tabela (`TabelaAtalhos` reaproveitada): moldura `role="region" aria-labelledby tabIndex={0} overflow-x-auto CARTAO`; `caption` visível «Atalhos por sistema» (`text-left px-[18px] pt-3.5 font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground`); colunas «Sistema» | «Preencher a página»; linhas (cabeçalho de linha `th scope="row" font-semibold`, tecla em `<kbd class="border border-border bg-muted rounded-[6px] px-2 py-0.5 text-[13px]">`):
    - macOS — ⌥⇧P
    - Windows — Ctrl+Shift+Y
    - Linux — design «Ctrl+Shift+Y». **Usar:** «Ctrl+Shift+Y» e, na mesma célula, «Alt+Shift+P no Firefox» (Fatos F7)
    - Um campo só — «botão direito › Botaí › Inserir» (`font-mono text-[13px]`)
      Todas as teclas saem de `ATALHOS` (`@pilutech/botai-core/atalhos`).
- Coluna da captura: `<figure class="flex flex-col gap-3">` com `CARTAO overflow-hidden` + `ImagemPorTema variantes={CAPTURAS[0].variantes}` (`01-pagina-preenchida-escuro.png` / `02-pagina-preenchida-claro.png`, 1280×800, alt «Formulário de cadastro preenchido pelo Botaí, com o popup mostrando 12 de 14 campos preenchidos (tema escuro|claro)»; já é o alt de `lib/capturas.ts`) e `figcaption` `font-mono text-xs text-muted-foreground`: «O popup mostra quantos campos entraram e lista os que ficaram de fora.» A imagem não é mais a do topo: sem `fetchPriority="high"` (o `destaque` sai), `sizes="(min-width: 1264px) 572px, (min-width: 900px) calc(48vw - 32px), calc(100vw - 32px)"` (2 colunas a partir de 900 px).

### 1.10 Privacidade e cuidados (sem âncora, `aria-labelledby="cuidados-titulo"`, sobrelinha «Privacidade e cuidados» `07`)

- `h2#cuidados-titulo`: «Fictício, mas com cuidado.»
- Grade `grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-4`, dois cartões `CARTAO p-[26px] flex flex-col gap-3.5`:
  - `faShieldHalved` (`text-primary`) + `h3` «Privacidade» (18 px extrabold); `p` 15 px: «A extensão não tem servidor nem analytics e só age na aba em que você a aciona.»; link `mt-auto text-sm text-primary` «Política de privacidade →» para `/privacidade` (`next/link`).
  - `faTriangleExclamation` (`text-warn`) + `h3` «Cuidados»; `<ul class="list-disc pl-[18px] flex flex-col gap-2 text-[15px] leading-[1.55]">`: «Os dados são fictícios, mas um CPF, CNPJ ou celular gerado pode pertencer a alguém de verdade.» / «A caixa de e-mail é pública: quem souber o endereço lê as mensagens.» / «Use só em localhost e em ambiente de teste.»; link «Termos de uso →» para `/termos`.

### 1.11 Chamada final (`aria-labelledby="final-titulo"`)

`CARTAO rounded-[32px] mt-[clamp(80px,11vw,140px)] flex flex-col items-center gap-[22px] text-center px-[clamp(20px,4vw,48px)] py-[clamp(40px,6vw,72px)]` (sem o brilho radial da v1):

- `Marca` 56;
- `h2#final-titulo` (padrão de título, `text-balance`): «Botaí no seu teste.»
- `p` `max-w-[540px]` 17 px muted: «Comece pela porta que você já usa. A documentação tem o guia de cada uma.»
- Botões (`flex flex-wrap justify-center gap-3`, altura 48): `Button` default → `URL_DA_DOCUMENTACAO`, `faBookOpen` + «Ler a documentação»; `Button` outline → `REPOSITORIO`, `faGithub` + «Código no GitHub».

### 1.12 Rodapé (`<footer>`, contentinfo)

`mt-[72px] pt-8 pb-10 border-t border-border flex flex-wrap justify-between gap-8`:

- Bloco da marca (`max-w-[320px] flex flex-col gap-3`): `Marca` 22 + «Botaí» (18 px extrabold); «Dados de teste brasileiros. Código aberto, licença MIT.» (14 px muted); link «Powered by PiluTech» (`font-mono text-xs text-muted-foreground py-1.5`) para `URL_DA_PILUTECH`.
- Colunas (`flex flex-wrap gap-10`), cada uma um `nav` com título `<p>` (`font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5`) ligado por `aria-labelledby`, links `py-1.5 text-sm`:
  - «Projeto»: «Docs» (`URL_DA_DOCUMENTACAO`), «GitHub» (`REPOSITORIO`), `@pilutech/botai-core` e `@pilutech/botai-playwright` (`font-mono text-[13px]`, `npmDe(...)`).
  - «Legal» (o design põe `aria-label="Documentos"` e mostra «Legal»): «Termos de uso» (`/termos`), «Política de privacidade» (`/privacidade`).
- O design tira o «Suporte» (`MAILTO.suporte`). Recomendação: manter «Suporte» na coluna «Projeto», com o `mailto` de `[Botaí] Suporte` (contato que a v1 e os testes garantem). Decisão de quem integra; se sair, o `rodape.test.tsx` e o E2E mudam.
- O rodapé também é o das páginas `/privacidade` e `/termos` (via `Documento`).

---

## 2. Layout por largura (do arquivo de telas)

| Seção         | Desktop 1440 (conteúdo 1200 px)                                         | Mobile 390 (358 px)                                                                | 320 (288 px)                            |
| ------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------- |
| Cabeçalho     | marca · nav de 4 âncoras · Docs, GitHub, tema                           | marca · Docs, GitHub, tema, menu; painel abre abaixo                               | precisa de `flex-wrap` ou Docs só ícone |
| Hero          | h1 76 px; botões lado a lado; terminal e formulário em 2 colunas de 592 | h1 38 px; botões em 2 linhas; janelas empilhadas; formulário em 2 colunas internas | idem; comando quebra por palavra        |
| Números       | 6 colunas                                                               | 1 coluna (minmax 180 > 179)                                                        | 1 coluna                                |
| Portas        | 4 colunas × 2 linhas                                                    | 1 coluna                                                                           | 1 coluna                                |
| Mesma pessoa  | entrada · portas · saída em 3 colunas; 3 cartões em 3 colunas           | tudo empilhado                                                                     | idem                                    |
| A pessoa      | cartão e regras em 2 colunas; `dl` em 3 colunas                         | empilhado; `dl` 1 coluna                                                           | idem                                    |
| Para quem     | 3 colunas × 2 linhas                                                    | 1 coluna                                                                           | 1 coluna                                |
| Integrações   | 6 colunas, 3 linhas                                                     | 1 coluna                                                                           | 1 coluna                                |
| Extensão      | texto + tabela à esquerda, captura à direita                            | empilhado; tabela rola dentro da moldura                                           | idem                                    |
| Cuidados      | 2 colunas                                                               | 1 coluna                                                                           | 1 coluna                                |
| Chamada final | centrada, botões lado a lado                                            | botões em 2 linhas                                                                 | idem                                    |
| Rodapé        | marca à esquerda, colunas à direita                                     | colunas abaixo da marca                                                            | idem                                    |

Temas: as telas 1a/1c (escuro) e 1b/1d (claro) só trocam os tokens (`.dark`); nenhuma seção muda de estrutura. O site segue `defaultTheme="system"` (o design abre em escuro por padrão; não mudar).

---

## 3. Interações

| Interação             | Como                                                                                                                                                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tema                  | `BotaoTema` atual (`next-themes`, lembra no `localStorage`, ícones por CSS). Capturas trocam por CSS (`ImagemPorTema`).                                                                                                                                          |
| Menu mobile           | `'use client'`; `useState`; botão com `aria-expanded`/`aria-controls`; fecha no clique da âncora, no `Escape` (foco volta ao botão) e no clique fora. Abaixo de 900 px por CSS (`min-[900px]:`), não por `ResizeObserver` como no design.                        |
| Copiar comando        | `'use client'` `BotaoCopiar({ texto, rotulo, tamanho })`: `navigator.clipboard.writeText(texto)`; ícone `faCopy` → `faCheck` por 1,6 s; uma região `sr-only aria-live="polite"` diz «Copiado»; se o clipboard falhar, não mostra o check. Hero (1) e portas (7). |
| Âncoras               | `#portas`, `#mesma-pessoa`, `#para-quem`, `#extensao` com `scroll-mt-6`; rolagem suave só com `motion-safe`.                                                                                                                                                     |
| Atalho de quem visita | o `<kbd>` do formulário do hero usa `atalhoDoVisitante` (servidor: Windows; depois da hidratação, o do sistema), como o `AtalhoLocal`.                                                                                                                           |
| Abas das portas       | variante `abas` do design: fora do escopo.                                                                                                                                                                                                                       |

---

## 4. Open Graph (1200×630, home)

De `Botai v2 OG.dc.html`. Tema escuro fixo, cores em hex (o Satori não lê variáveis CSS): fundo `#090b11`, cartão `#0f141f`, borda `#1c3140`, primário `#3abff8`, texto `#e7ecf3`, apagado `#94a0b3` (conversão dos tokens `.dark` do DS).

- Moldura `padding: 64px 72px`, coluna com `justify-content: space-between`.
- Topo (linha, `space-between`): `Marca` 56 + «Botaí» (40 px, 800, `letter-spacing -0.035em`); à direita «botai.pilutech.com.br» (mono 20 px, primário).
- Meio (`gap 28`): «Dados de teste brasileiros em todo lugar que o seu teste roda.» (68 px, 800, `line-height 1.03`, `letter-spacing -0.04em`, `max-width 1000`); chip `padding 14px 22px`, fundo cartão, borda 2 px, `border-radius 18`, mono 24 px: «$» (primário) + «npx @pilutech/botai-core pessoa --semente 42» (comando real; no OG não há saída ao lado, então pode ficar sem `--hoje`; se quem integra preferir igualar ao hero, conferir se cabe em 1056 px).
- Pé (`border-top 2px`, `padding-top 24`, `space-between`): «extensão · cli · http · docker · binários · biblioteca · playwright · motor» (mono 19 px, `letter-spacing 0.04em`, apagado) e «Powered by PiluTech» (mono 17 px, apagado).
- Implementação: nova função em `lib/imagem-og.tsx` (ex.: `imagemOgDaHome()`), mantendo `imagemOg` para `/privacidade` e `/termos`; `app/opengraph-image.tsx` passa a usá-la, e o `alt` vira «Botaí: dados de teste brasileiros em todo lugar que o seu teste roda». O `twitter-image.tsx` já reexporta.
- Fontes: hoje o OG usa a fonte padrão do `next/og` (sem peso 800 nem mono). Para o visual do design, carregar Plus Jakarta Sans 800 e JetBrains Mono 400 de arquivos locais (ex.: `@fontsource/*`, `.woff`, que o Satori aceita; nunca `fetch` no build). Dependência nova passa pelas regras do pnpm da raiz (`minimumReleaseAge`, `trustPolicy`). Se ficar sem fonte nova, aceitar a fonte padrão e registrar a escolha.

---

## 5. O que muda em relação à v1

**Sai da página:**

- "← PiluLabs" do topo (o design não tem; o E2E que confere o link muda).
- Linha do ícone 128 + nome grande + `SeloFase` ("Disponível") e a `notaDasLojas` + `AtalhoLocal` do hero.
- A captura do topo (LCP) e o brilho radial.
- "Por que existe" e "De onde vem o nome" («bota aí», expressão piauiense).
- "O que ele bota" (`RECURSOS` na página; a constante continua no `featureList` do JSON-LD).
- "Capturas" (`CapturasAbas`, 3 cenas; as capturas 03–06 ficam em `public/` e no JSON-LD).
- "Como usar" (3 passos) e a nota «definir atalho».
- "Para devs" (`para-devs.tsx`, `PORTAS` de 5 itens) → substituída por "Portas".
- Bloco final "Bota aí no seu navegador" com os botões de loja (as lojas ficam só na seção Extensão: 1 lista "Instalar pela loja", não 2).
- Cuidados da v1 sobre iframe de outro domínio e `activeTab` (são limites; estão na doc).
- Rodapé v1 (botões Docs e Suporte).

**Fica / reaproveitado:**

- `BotaoTema`, `ImagemPorTema` + `CAPTURAS[0]`, `lojas.json` + `lerUrlsDasLojas` + `botoesDasLojas` (`lib/modelo.ts`), `LOJA_UI`, `BotoesLoja` (estado sem URL vira o `span` tracejado), `TabelaAtalhos` (novo formato por sistema, mesma moldura focável), `ATALHOS` e `atalhoDoVisitante`, `CARTAO`, constantes de `lib/conteudo.ts` (`URL_DA_DOCUMENTACAO`, `REPOSITORIO`, `npmDe`, `PACOTE_DO_CORE`, `PACOTE_DO_PLAYWRIGHT`, `IMAGEM_DO_SERVIDOR`, `MAILTO`, `URL_DA_PILUTECH`).
- A técnica de quebra do bloco de código do `para-devs.tsx` (flag `inline-block indent-0`, recuo pendurado, `$` `aria-hidden select-none`) vira o componente `LinhaDeComando`.
- O padrão "comando inventado não passa" do `lib/conteudo.test.ts` (rodar o argv no `executar` do core, versão da imagem = `packages/core/package.json`, porta do `CMD` do `Dockerfile`, função da biblioteca existe, plugin exporta `test` com `botai.preencher`) migra para os comandos novos e ganha HTTP (`responder` de `@pilutech/botai-core/servidor`), motor (`__botaiNavegador.preencher` no IIFE/`/navegador`) e o comando do hero.
- `Documento` de `/privacidade` e `/termos` (com o `Topo` atual ou o cabeçalho novo, ver Integração).
- SEO: `TITULO_DA_HOME`, `DESCRICAO_DA_HOME` e o JSON-LD da extensão (decisão de 2026-10-08). O `<title>` do design («Botaí · Dados de teste brasileiros em todo lugar que o seu teste roda», 69 caracteres) passa do limite de 60 do `seo.test.ts` e muda a busca que a home disputa: **decisão do dono**, fora desta v2.

**Novo:** cabeçalho com menu mobile, hero com comando copiável e as duas janelas, Números, Portas (8), Mesma pessoa, A pessoa, Para quem, Integrações, Extensão (lojas + requisitos + tabela + captura), Privacidade e cuidados, Chamada final, rodapé em colunas, OG v2, `Marca`, `BotaoCopiar`, `PESSOA_DO_EXEMPLO`.

---

## 6. Fatos a conferir (contra `relatorio.md`)

| #   | Onde                              | Texto do design                                                                                                                                                                | Veredito                                                                                                                                                                                                                                                 |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Hero h1 / OG                      | «Dados de teste brasileiros em todo lugar que o seu teste roda.»                                                                                                               | **ok** (mensagem "a mesma pessoa em todo lugar", §7.4; é frase de posicionamento, não promessa de ferramenta)                                                                                                                                            |
| F2  | Hero lede                         | «…oito portas: extensão, CLI, biblioteca, HTTP, Docker, binários, Playwright e o motor direto na página.»                                                                      | **ok** (§2: 8 portas, mesmo gerador; motor DOM nas que preenchem)                                                                                                                                                                                        |
| F3  | Hero comando                      | `npx @pilutech/botai-core pessoa --semente 42`                                                                                                                                 | **ajustar para** `npx @pilutech/botai-core@0.4.1 pessoa --semente 42 --hoje 2026-10-05`: sem `--hoje` a saída muda por dia (medido: hoje dá nascimento 02/03/1970, não 26/02/1970) e §5.3 diz "reproduzir exige semente + hoje + versão"                 |
| F4  | Hero terminal                     | JSON plano `{"nome": …, "nascimento": "26/02/1970", "cpf": …, "cidade": …, "cnpj": …}`                                                                                         | **ajustar**: a CLI devolve o envelope `{formato, motor, semente, hoje, pessoa}` com objetos aninhados (`nome.completo`, `celular.formatado`, `endereco.cidade`, `empresa.cnpj`); `nascimento` é objeto. Usar a saída real abreviada (seção 1.2)          |
| F5  | Hero formulário                   | «6 de 6 campos · semente 42» ao lado do `⌥⇧P`                                                                                                                                  | **ajustar para** «6 de 6 campos preenchidos»: a extensão não tem semente (§3.1, §5.3); o texto do aviso real é "X de Y campos preenchidos"                                                                                                               |
| F6  | Hero formulário                   | `<kbd>⌥⇧P</kbd>` fixo                                                                                                                                                          | **ajustar**: tecla de quem visita (`atalhoDoVisitante`), como a v1                                                                                                                                                                                       |
| F7  | Portas/Extensão e tabela          | «⌥⇧P no Mac · Ctrl+Shift+Y no Windows e no Linux»; Linux = Ctrl+Shift+Y                                                                                                        | **ajustar**: no Firefox para Linux é `Alt+Shift+P` (§2, `ATALHOS`)                                                                                                                                                                                       |
| F8  | Números                           | «43/43 campos iguais em 15 saídas com a mesma semente»                                                                                                                         | **ok**, acrescentar "e o mesmo dia" (§5.1)                                                                                                                                                                                                               |
| F9  | Números                           | «~2 s para 100 mil pessoas, sem repetir CPF, e-mail nem CNPJ»                                                                                                                  | **ok** (CLI 1,8 a 2,1 s, §7.2; unicidade §7.1); acrescentar "pela CLI" e a máquina na legenda                                                                                                                                                            |
| F10 | Números                           | «1.454 testes automatizados passando»                                                                                                                                          | **ok** como foto datada (§7.1, "medido em 08/10/2026"); envelhece a cada PR                                                                                                                                                                              |
| F11 | Números                           | «12 arquivos dourados iguais da 0.2.0 à 0.4.1» / «0,8 ms para preencher 21 campos (mediana)» / «0 dependências no core»                                                        | 12: **ok** (§5.2). 0,8 ms: **ajustar** "mediana para o motor preencher 21 campos, sem a 2ª passada" (§7.2; com a 2ª passada é ~1 s). 0: **ok**, "de runtime" (§1.3, §7.3)                                                                                |
| F12 | Mesma pessoa                      | «todas as portas devolvem a mesma pessoa» e as 8 pílulas                                                                                                                       | **ajustar**: só as portas com semente (CLI, HTTP, Docker, binários, biblioteca, Playwright); a extensão sorteia com crypto e o motor recebe a pessoa pronta (§3.1, §5.1, §5.3)                                                                           |
| F13 | Mesma pessoa                      | «43 de 43 campos iguais em 15 saídas» sob a saída da semente 42                                                                                                                | **ajustar**: a prova 43/43 foi com a semente `verificador-1` (§5.1); a 42 + 2026-10-05 é o dourado `pessoa-semente-numero.json`, conferido em CLI, binário, HTTP, imagem, Node/Bun/Deno e Playwright. Pé: «a semente 42 é um dos 12 arquivos dourados»   |
| F14 | Mesma pessoa                      | «No Playwright, a semente é o nome do teste.»                                                                                                                                  | **ok** (padrão `projeto › arquivo › describe › título`, §3.7)                                                                                                                                                                                            |
| F15 | Mesma pessoa, cartão 02           | «A mesma semente no terminal devolve a mesma pessoa»                                                                                                                           | **ajustar**: "a mesma semente e o mesmo `hoje`" (§5.3)                                                                                                                                                                                                   |
| F16 | Mesma pessoa, cartão 03           | «guardam a pessoa esperada de cada semente e são conferidos a cada PR. Os 12 não mudaram da 0.2.0 à 0.4.1.»                                                                    | **ajustar** "de cada semente" → "de um conjunto de sementes" (são 6 pessoas, 1 lote e derivados, §5.2); resto **ok**                                                                                                                                     |
| F17 | A pessoa                          | valores da semente 42 (nome, 26/02/1970 · 56 anos, CEP, Avenida Litorânea 199 Apto 171 Calhau São Luís/MA, CPF, celular, título, RG, PIS, e-mail, empresa, cartão 5555… 11/28) | **ok**: conferidos campo a campo com a CLI local e §4.1. Gerar de `gerarPessoa` em vez de copiar                                                                                                                                                         |
| F18 | A pessoa                          | «O endereço decide o resto.» / «A UF do endereço amarra o resto.»                                                                                                              | **ajustar**: a UF muda CPF (região), título, DDD e endereço; nome, nascimento, e-mail, empresa e cartão não (§4.2). Ver textos da seção 1.6                                                                                                              |
| F19 | A pessoa, regras                  | «3 cobre CE, MA e PI» / «11 para o Maranhão» / DDD do CEP / e-mail do nome com caixa pública                                                                                   | **ok** (§4.1, §4.3)                                                                                                                                                                                                                                      |
| F20 | A pessoa                          | RG «92.957.904-5» numa pessoa do MA                                                                                                                                            | **ok** como está (o design não diz o órgão); não escrever "RG do MA": o RG é sempre SSP/SP (§8.2)                                                                                                                                                        |
| F21 | Portas: CLI                       | `… pessoas -n 1000 --semente carga --formato sql \| psql "$DATABASE_URL"`                                                                                                      | **ajustar**: `npx -y @pilutech/botai-core@0.4.1 pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql \| psql "$DATABASE_URL"` (§2, §9); o SQL só traz INSERTs na tabela `pessoas` (padrão do `plano.ts`): a tabela tem de existir (a doc diz) |
| F22 | Portas: HTTP                      | `curl 'http://127.0.0.1:8790/pessoa?semente=42'`; «Python, Go, Java ou qualquer linguagem…»                                                                                    | comando: **ajustar** com `&hoje=2026-10-05` (§2). Texto: **ok** (não diz testado; Go e Java aparecem como "sem teste" em Integrações)                                                                                                                    |
| F23 | Portas: Docker                    | «entra como service no CI»; «linux/amd64 e linux/arm64»; `docker run … ghcr.io/piluvitu/botai:0.4.1`                                                                           | **ok** (service: documentado e usado pelo CI do projeto, §3.4; não marcar como testado). Só a arm64 rodou na auditoria; as duas estão publicadas                                                                                                         |
| F24 | Portas: Binários                  | «macOS, Linux e Windows, x64 e arm64»; `curl … install.sh \| sh`                                                                                                               | **ajustar** o "onde": o `install.sh` recusa Windows e musl (§3.5, §8.2) → «No Windows, baixe o .exe do release.»                                                                                                                                         |
| F25 | Portas: Biblioteca                | «sem nenhuma dependência»; «Node, Bun, Deno e navegador»; `gerarPessoa({ semente: 42, hoje: '2026-10-05' })`                                                                   | **ok** (§3.6; navegador com bundler)                                                                                                                                                                                                                     |
| F26 | Portas: Playwright                | «o retry usa a mesma pessoa e a falha leva a pessoa no relatório»; «Chromium, Firefox e WebKit»                                                                                | **ok** (§3.7; o anexo é só em falha inesperada)                                                                                                                                                                                                          |
| F27 | Portas: Motor                     | «Um script de 40 KB» / «Testado com Playwright e CDP»                                                                                                                          | **ok** (40 321 bytes, §7.3; frase recomendada em §8.1)                                                                                                                                                                                                   |
| F28 | Portas: Motor                     | `[TRECHO DE USO DO MOTOR]`                                                                                                                                                     | **placeholder [ASSIM]** → `window.__botaiNavegador.preencher(document, pessoa, hoje, { segundaPassada: true })`                                                                                                                                          |
| F29 | Portas, nota                      | «Saída em JSON, NDJSON, CSV e SQL para Postgres, MySQL e SQLite. Importação provada no Postgres 16 e no SQLite.»                                                               | **ok** (MySQL documentado, não importado: a frase não diz que foi)                                                                                                                                                                                       |
| F30 | Para quem: QA manual              | «e mais 20 tipos» / «“Abrir caixa de entrada” mostra o e-mail de confirmação»                                                                                                  | 20: **ok** (23 no Inserir). Caixa: **ajustar** para "abre a caixa pública, onde chega o e-mail de confirmação"                                                                                                                                           |
| F31 | Para quem: Dev frontend           | «máscaras (imask, jQuery Mask, react-number-format)»                                                                                                                           | **ajustar** para "imask, jQuery Mask e maska": react-number-format está só "documentado" (§3.1); maska foi verificada                                                                                                                                    |
| F32 | Para quem: automação, backend, CI | `botai.preencher(page)` em todos os frames; mil INSERTs iguais e UNIQUE; `--uf PI` amarra CEP, DDD, região do CPF e título; seed num passo; imagem como service                | **ok** (§9), com o `--hoje` no comando da CLI (F21); service: documentado                                                                                                                                                                                |
| F33 | Para quem, convite                | «A documentação tem um guia por porta e as integrações por linguagem.»                                                                                                         | **ok** (conferido em `documentacao/docs/`)                                                                                                                                                                                                               |
| F34 | Integrações                       | h2 «O que foi testado, e o que só roda.» e selos «Roda via JS» / «Roda via HTTP»                                                                                               | **ajustar**: h2 "O que foi testado, e o que ainda não."; selos "Sem teste · JS" / "Sem teste · HTTP" (§6 e §8.1: Cypress, Selenium, Puppeteer, WebdriverIO, Go e Java são não testados)                                                                  |
| F35 | Integrações                       | Testado: Playwright, Postgres, SQLite, Python (via HTTP), Node, Bun, Deno                                                                                                      | **ok** (§6)                                                                                                                                                                                                                                              |
| F36 | Extensão                          | lojas Chrome Web Store e Firefox Add-ons com link; «Opera em revisão»; «Chrome 123+ e Edge pela Chrome Web Store · Firefox 153+»                                               | **ok** (§2, §3.1, §8.1). "em revisão" é estado de terceiro: fica num texto só e muda quando a AMO/Opera decidir                                                                                                                                          |
| F37 | Extensão, captura                 | alt «…12 de 14 campos preenchidos…»                                                                                                                                            | **ok** (é a captura real `01`/`02`, mesmo alt de `lib/capturas.ts`)                                                                                                                                                                                      |
| F38 | Cuidados                          | «não tem servidor nem analytics e só age na aba em que você a aciona»; CPF/CNPJ/celular podem ser de alguém; caixa pública; só localhost e teste                               | **ok** (§3.1, §8.1; mesmo texto da política)                                                                                                                                                                                                             |
| F39 | Rodapé                            | «Código aberto, licença MIT.»                                                                                                                                                  | **ok** (§1.3; `extensao/LICENSE`)                                                                                                                                                                                                                        |
| F40 | OG                                | «extensão · cli · http · docker · binários · biblioteca · playwright · motor»; comando `npx @pilutech/botai-core pessoa --semente 42`                                          | **ok** (o comando roda; no OG não há saída ao lado)                                                                                                                                                                                                      |
| F41 | `<title>` do design               | «Botaí · Dados de teste brasileiros em todo lugar que o seu teste roda»                                                                                                        | **não aplicar**: 69 caracteres > 60 (`seo.test.ts`) e contraria a decisão de SEO de 2026-10-08; decisão do dono                                                                                                                                          |

**Placeholders [ASSIM] deixados pelo design:** só um, `[TRECHO DE USO DO MOTOR]` (porta 08, `cmd`). Nenhum outro colchete, "TODO" ou texto de exemplo nos arquivos.

---

## 7. Divisão do trabalho

### 7.0 Estrutura (antes dos grupos, um agente só)

Arquivos novos, cada um com teste (Jest) e story ao lado:

- `components/secao.tsx`: `Secao({ id?, tituloId, numero, rotulo, titulo, apoio?, className?, children })` → `<section aria-labelledby>` com a sobrelinha, o `h2` e o apoio do padrão (seção 0).
- `components/marca.tsx`: o SVG da marca, `tamanho`, `aria-hidden`.
- `components/botao-copiar.tsx` (`'use client'`): seção 3.
- `components/linha-de-comando.tsx`: extrai o `Codigo` do `para-devs.tsx` (prompt `$` opcional, quebra por palavra), para o hero e as portas.
- `lib/exemplo.ts`: `SEMENTE_DO_EXEMPLO = 42`, `HOJE_DO_EXEMPLO = '2026-10-05'`, `PESSOA_DO_EXEMPLO = gerarPessoa(...)`, `COMANDO_DO_EXEMPLO` (com `@${MOTOR}`). Teste: o argv do comando, rodado no `executar` do core, devolve `envelope.pessoa` igual a `PESSOA_DO_EXEMPLO`; e a pessoa é a do dourado `pessoa-semente-numero.json` (ignorando `motor`).
- `lib/conteudo.ts`: `ANCORAS_DA_LANDING` (4 âncoras, rótulo + id), usadas pelo cabeçalho e pelos `id` das seções; nenhuma outra mudança.

Regras para os grupos: cada grupo só cria/edita os arquivos da sua linha; ninguém edita `lib/conteudo.ts`, `components/landing.tsx`, `app/page.tsx`, `globals.css` nem os E2E (são da integração). Constantes de conteúdo de cada grupo moram num `lib/<grupo>.ts` próprio. Cada componente exporta uma peça autônoma (props mínimas) e tem `.test.tsx` + `.stories.tsx`; TDD (teste primeiro, vendo falhar).

### 7.1 Grupo 1 — Cabeçalho, hero e números

- `components/cabecalho.tsx` (+ `menu-secoes.tsx`, `'use client'`): seção 1.1 (nav, Docs, GitHub, `BotaoTema`, menu mobile com `Escape`/clique fora). Testes: âncoras = `ANCORAS_DA_LANDING`, `aria-expanded`, fecha no clique e no `Escape`, Docs e GitHub com os `href` certos.
- `components/hero.tsx` + `terminal-exemplo.tsx` + `formulario-exemplo.tsx`: seção 1.2. Testes: h1 único com "Botaí: " sr-only, comando = `COMANDO_DO_EXEMPLO`, botão de copiar com o rótulo, valores = `PESSOA_DO_EXEMPLO` (nada escrito à mão), rodapé "6 de 6 campos preenchidos" sem "semente", `kbd` do visitante.
- `components/numeros.tsx` + `lib/numeros.ts`: seção 1.3 (textos da coluna "Usar" e a legenda datada). Teste trava os 6 pares e a data.
- Pode refatorar `components/atalho-local.tsx` para expor só a tecla (`TeclaLocal`), mantendo o `AtalhoLocal`.

### 7.2 Grupo 2 — Portas e mesma semente

- `components/portas.tsx` (+ `cartao-porta.tsx`) + `lib/portas.ts`: seção 1.4 com as 8 portas e a nota. `lib/portas.test.ts` herda e amplia os testes de comando do `lib/conteudo.test.ts`: CLI no `executar` (argv até o `|`, sem `npx` e sem `@versão`, saída SQL de 1000 linhas), versão no `npx …@x` = `MOTOR` = `packages/core/package.json`, HTTP no `responder('GET', '/pessoa?semente=42&hoje=2026-10-05')` com 200, imagem = versão do core e porta do `CMD` do `Dockerfile`, URL do `install.sh` = a do relatório, função da biblioteca existe na raiz, plugin exporta `test` com `botai.preencher`, motor: o IIFE/`/navegador` expõe `__botaiNavegador.preencher`; atalho montado de `ATALHOS` (com o Firefox no Linux); "Testado com Playwright e CDP" e nenhum "testado" a mais.
- `components/mesma-semente.tsx`: seção 1.5 (diagrama com as 6 portas com semente, saída de `PESSOA_DO_EXEMPLO`, pé do dourado, 3 cartões com os textos "Usar"). Teste: nenhuma pílula de Extensão/Motor; saída = pessoa do exemplo.

### 7.3 Grupo 3 — A pessoa, para quem, integrações e OG

- `components/pessoa-exemplo.tsx` + `lib/regras.ts`: seção 1.6. Teste: destaques batem com `REGIAO_FISCAL_CPF['MA']`, `CODIGO_UF_TITULO['MA']`, `celular.ddd === endereco.ddd`; nenhum valor à mão.
- `components/para-quem.tsx` + `lib/personas.ts`: seção 1.7 (com "maska" e a caixa pública). Teste: 5 personas + convite; nenhum "react-number-format".
- `components/integracoes.tsx` + `lib/integracoes.ts`: seção 1.8. Teste: só os 7 provados levam "Testado"; os outros 6 dizem "Sem teste".
- OG: `lib/imagem-og.tsx` (nova `imagemOgDaHome`, `imagemOg` intacta) e `app/opengraph-image.tsx` (alt novo); seção 4. Teste do texto (alt, frase, comando) e, se entrar fonte nova, das regras de dependência.

### 7.4 Grupo 4 — Extensão, cuidados, chamada final e rodapé

- `components/extensao.tsx`: seção 1.9, com `BotoesLoja` (editado: sem URL → `span` tracejado com o estado; o Opera diz "em revisão"; Edge some sem URL), `TabelaAtalhos` (editada: por sistema, `caption` visível, Firefox no Linux) e a figura com `ImagemPorTema` (sem `destaque`). Requisitos montados dos pisos do `wxt.config.ts` (teste como o do `REQUISITOS`). Atualiza `botoes-loja.test.tsx`, `tabela-atalhos.test.tsx` e as stories.
- `components/cuidados.tsx`: seção 1.10.
- `components/chamada-final.tsx`: seção 1.11.
- `components/rodape.tsx` (reescrito): seção 1.12, com «Suporte» na coluna Projeto salvo decisão em contrário; vale para as três rotas. Atualiza `rodape.test.tsx` e a story.

### 7.5 Integração (depois dos 4 grupos, um agente só)

- `components/landing.tsx` reescrito: moldura (seção 0) → `Cabecalho` → `main#topo` (Hero, Números, Portas, Mesma semente, Pessoa, Para quem, Integrações, Extensão, Cuidados, Chamada final) → `Rodape`; `app/page.tsx` continua com `JsonLd` + `modeloDaLanding` (o que a v2 não usa do modelo — `fase`, `notaDasLojas` — sai ou fica só para o teste do `lib/modelo.ts`).
- Apagar o que ficou sem uso: `capturas-abas.*`, `para-devs.*`, `selo-fase.*`, `cabecalho-secao.*` e `atalho-local.*` se nada mais usar; `PORTAS` antigo, `REQUISITOS` e textos órfãos do `lib/conteudo.ts` e os testes deles. Manter `RECURSOS`, `PROPOSTA` e `CAPTURAS` (JSON-LD).
- `components/documento.tsx`: decidir se `/privacidade` e `/termos` ganham o cabeçalho novo (sem as âncoras, logo → `/`) ou mantêm o `Topo`; o `termos.e2e.ts` clica no link «Botaí».
- `<html>` com `motion-safe:scroll-smooth` (`app/layout.tsx`).
- E2E: `app/pagina.e2e.ts` (h1, a lista dos `h2` na ordem — «Um motor, oito portas.», «Mesma semente, mesma pessoa.», «Uma pessoa onde tudo bate.», «Cada um entra pela sua porta.», «O que foi testado, e o que ainda não.», «Bota aí no navegador.», «Fictício, mas com cuidado.», «Botaí no seu teste.» —, âncoras do cabeçalho e do menu mobile, Docs no banner e no rodapé, copiar com permissão de clipboard, tema e a captura agora na seção Extensão (rolar até ela antes de medir os pedidos), atalho de quem visita no `kbd` do hero, 320 px: banner, hero, portas, extensão e rodapé dentro da coluna); `app/lojas-publicadas.e2e.ts` (1 lista de lojas, não 2; sem "Em breve" em `button`; sem selo "Disponível"); `privacidade.e2e.ts`/`termos.e2e.ts` (rótulos do rodapé); `seo.e2e.ts` (axe nos dois temas a 1280 e 320, níveis de título).
- `landing.test.tsx` e `landing.stories.tsx` refeitos.
- `site/CLAUDE.md` (regra de manutenção): "A página" reescrita para a v2 (seções, `PESSOA_DO_EXEMPLO`, comandos conferidos, lojas sem URL em `span`, menu mobile, OG v2), apontando a spec/design novos; copiar os `.dc.html` da v2 para `docs/superpowers/design/2026-10-09-botai-landing-v2/` como a v1.
- Ordem final: `make lint` → `make test` → `make build-botai-site` (gate do `@source`) → `make test-e2e-botai-site` (com `CI=1`, porta 3020 livre).
- Para o dono decidir (registrar no PR): `<title>`/descrição/JSON-LD da home (F41), o «Suporte» no rodapé, o "← PiluLabs" e a fonte do OG.
