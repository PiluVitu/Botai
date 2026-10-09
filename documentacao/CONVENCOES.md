# Convenções de quem escreve a documentação

Arquivo interno: o Docusaurus publica só o que está em `docs/`. Vale para toda página de `docs/`. A base (configuração, tema, testes, `_category_.json`) não muda junto com o conteúdo: precisou, avise quem cuida da base.

## 1. De onde vem o conteúdo

- **Só do relatório de capacidades de 2026-10-08** (seções 3 a 6, 8 e 10). Não invente flag, rota, opção, número, mensagem nem integração. O relatório não diz? A página também não diz.
- Saída de exemplo (JSON, CSV, SQL, mensagem de erro) é **colada de uma execução real** do build local desta versão (`node packages/core/dist/bin/botai.js …` na raiz do repo, depois de `make build-core`), nunca escrita à mão.
- Medida da seção 7 do relatório sai sempre com a data e a máquina: "medido em 2026-10-08, macOS arm64, Node 22.22.3".

## 2. Árvore, nomes e ordem

A árvore é a da seção 10 do relatório. As pastas já existem, cada uma com o seu `_category_.json` (rótulo, posição e a página da categoria, gerada em `/<pasta>`). Você cria só os `.md`, com estes nomes e este `sidebar_position`:

| Arquivo                                                                                                                                                                     | Posições         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `intro.md` (`slug: /`, a raiz do site)                                                                                                                                      | 1                |
| `comecar/`: `escolha-sua-porta`, `primeira-pessoa`, `instalacao`                                                                                                            | 1, 2, 3          |
| `conceitos/`: `a-pessoa`, `semente-e-hoje`, `lote-e-unicidade`, `envelope-e-esquema`, `dados-por-tras`, `versoes-e-dourados`, `uso-responsavel`                             | 1 a 7            |
| `extensao/`: `instalar`, `preencher-a-pagina`, `inserir-um-campo`, `popup`, `favoritos`, `privacidade-e-permissoes`, `limites`                                              | 1 a 7            |
| `cli/`: `visao-geral`, `pessoa`, `pessoas`, `geradores-avulsos`, `validar`, `codigos-de-saida`, `receitas-de-banco`                                                         | 1 a 7            |
| `servidor/`: `botai-serve`, `api-http`, `seguranca-e-limites`                                                                                                               | 1, 2, 3          |
| `docker/`: `imagem`, `github-actions`, `docker-compose`                                                                                                                     | 1, 2, 3          |
| `binarios/`: `install-sh`, `download-e-verificacao`                                                                                                                         | 1, 2             |
| `biblioteca/`: `instalar-e-runtimes`, `gerar-pessoa`, `gerar-pessoas`, `documentos`, `plano-csv-sql`, `classificador`, `servidor-como-biblioteca`, `referencia-de-subpaths` | 1 a 8            |
| `playwright/`: `instalar`, `o-fixture`, `preencher`, `opcoes`, `reproduzir-uma-falha`, `relogio-e-segunda-passada`, `compor-fixtures`                                       | 1 a 7            |
| `navegador/`: `iife`, `esm-com-bundler`, `csp`, `iframes-e-janelas`, `jsdom`, `shadow-dom`                                                                                  | 1 a 6            |
| `integracoes/`: `puppeteer`, `selenium`, `cypress`, `webdriverio`, `python`, `go`, `java`                                                                                   | 1 a 7            |
| `referencia/`: `colunas`, `campos-reconhecidos`, `mensagens-de-erro`, `numeros`                                                                                             | 1 a 4            |
| `limites.md` e `faq.md` (raiz de `docs/`)                                                                                                                                   | 14 e 15          |
| Pastas (no `_category_.json`, não mude)                                                                                                                                     | 2 a 13, na ordem |

- Não crie `index.md` numa pasta: a página da pasta é gerada em `/<pasta>` e um `index.md` colide com ela (o build falha).
- Arquivo que começa com `_` não é publicado.

## 3. Frontmatter

As três chaves são obrigatórias em toda página:

```yaml
---
title: Gerar uma pessoa
description: Uma frase, de até uns 160 caracteres, com o que a página resolve.
sidebar_position: 2
---
```

- O `title` vira o `<h1>` e o título da aba: não escreva outro `# Título` no corpo. Seções começam em `##`.
- A `description` vai para o `<meta name="description">` e para o cartão da página da pasta.
- `sidebar_label` só quando o título for longo demais para a barra lateral. `slug` só no `intro.md`.

## 4. Formato do arquivo e links

- **`.md` por padrão.** O site usa `markdown.format: 'detect'`: `.md` é CommonMark, e `<valor>` ou `{ semente }` na prosa são texto.
- **`.mdx` só para componente** (as abas de `@theme/Tabs` e `@theme/TabItem`). No MDX, `<` e `{` fora de código quebram o build: deixe-os entre crases.
- **Link interno é o caminho relativo do arquivo, com extensão:** `[o lote](../conceitos/lote-e-unicidade.md)`, `[os códigos](./codigos-de-saida.md#codigos-de-saida)`. Nunca `/cli/pessoas` nem a URL do site.
- **Âncora citada de outra página leva id explícito em ASCII:** `## Códigos de saída {#codigos-de-saida}`. Sem o id, a âncora sai com acento (`#códigos-de-saída`).
- **Link, âncora e link de markdown quebrados derrubam o build.** Linke pelos nomes da tabela da seção 2: enquanto outra pessoa ainda escreve a página de destino, o seu build local acusa esse link, e a integração final roda o build com tudo. Qualquer outro link quebrado é seu.
- Linguagens com realce: `bash`, `json`, `text`, `ts`, `tsx`, `js`, `jsx`, `python`, `go`, `java`, `csharp`, `ruby`, `php`, `yaml`, `sql`, `csv`. Saída que não é JSON, CSV nem SQL vai em `text`. Nome de arquivo no bloco: ` ```json title="envelope.json" `.

## 5. Tom e grafia

- pt-BR, tratando o leitor por "você". Frases curtas, presente, voz ativa. Sem adjetivo de propaganda ("poderoso", "incrível") e sem emoji.
- **"Botaí"** na prosa, sempre com acento. **`botai`** só como coisa técnica, em código: o comando, o binário, o pacote, o global `__botaiNavegador`, um caminho.
- Os termos do relatório, sem sinônimo: porta (extensão, CLI, servidor, imagem, binário, biblioteca, fixture, motor), semente, hoje (a opção) e dia, pessoa, lote, envelope, 2ª passada, motor, fixture, dourados, subpath, modo A (preencher a página) e modo B (inserir um campo).
- Números como no relatório: espaço no milhar (`100 000`), vírgula decimal (`1,8 s`), espaço antes da unidade (`40 321 bytes`). Datas em ISO (`2026-10-05`).

## 6. Status de cada afirmação

O relatório marca cada afirmação. Na página:

| No relatório                | Na página                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| verificado 2× ou verificado | texto normal: é fato                                                                                         |
| documentado                 | `:::note[Documentado]`, dizendo de onde vem (README, código, `CLAUDE.md`) e que ninguém rodou                |
| não testado                 | `:::caution[Não testado]`, dizendo o que foi provado em volta; o conteúdo vira "receita", nunca fato testado |
| falhou                      | texto normal, como limite ("não funciona"), com a mensagem real; nunca como recurso                          |

```md
:::caution[Não testado]

Ninguém rodou esta receita com o Selenium. O que foi provado: o motor preenche o cadastro com 21/2/0 pelo CDP puro.

:::
```

- O aviso fica logo antes do trecho que ele qualifica; se vale para a página inteira (como `integracoes/selenium.md`), fica no topo, antes da primeira seção.
- **Recurso de uma versão da extensão que ainda não saiu nas lojas** (hoje, os favoritos da 1.1.0, em `extensao/favoritos.md`): é "documentado". A página do recurso leva o `:::note[Documentado]` no topo, com a versão em que ele chega; a seção de outra página que o descreve leva o mesmo aviso; a menção de uma linha (item de lista, link) diz "a partir da versão X" e linka a página. Quando a loja publicar a versão, tire os avisos e o "ainda não saiu nas lojas" (`grep -rn "1.1.0" docs`).
- `:::caution` e `:::note` com esses títulos são **reservados** ao status. Para o resto: `:::tip` (dica prática), `:::info` (contexto) e `:::danger` (armadilha que dá resultado errado sem erro, como "pessoa X não é a 1ª de pessoas X" ou o motor de outra janela dando 0 preenchidos). Não use `:::warning`: ele se parece com o `:::caution`.
- Linha em branco depois de `:::tipo[Título]` e antes do `:::` final (o Prettier pede).

## 7. Defeitos da seção 8.3: documente o certo

| Item                                        | Na página                                                                                                                                                                                                              |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. relógio do Playwright                    | o que segura a 2ª passada é o relógio **parado** (`page.clock.install({ time })` + `page.clock.pauseAt(…)`); só `page.clock.install()` não atrapalha. Saídas: `{ segundaPassada: false }` ou `page.clock.runFor(1500)` |
| 2. `gerarCPF(rng, 'XX')`                    | passe sempre uma das 27 UFs; não mostre UF inválida no subpath `/cpf`                                                                                                                                                  |
| 3. mensagem da semente `2**53`              | a regra é "inteiro **seguro** (negativo vale) ou texto de 1 a 256 caracteres"; não cite a mensagem                                                                                                                     |
| 4. o que o README do core não avisa         | diga: `addScriptTag({ path })` lança sob CSP estrita; o motor e o `document` precisam ser da mesma janela (Cypress: `win.eval`); o jsdom precisa do shim de layout                                                     |
| 5. versão do esbuild no `CLAUDE.md` do core | não é assunto do leitor: não cite                                                                                                                                                                                      |
| 6. política de versão                       | a forma completa: mudar a pessoa de uma semente é versão **major**; na série 0.x, é a **minor**                                                                                                                        |
| 7. `--hoje` com ano muito antigo            | recomende datas reais; não documente faixa de datas aceita                                                                                                                                                             |
| 8. fixture 0.1.0 com o core 0.4.0           | a pessoa é a mesma e o anexo diz `motor 0.4.0`; escreva "o core 0.4.0", sem o prefixo `@pilutech/botai-core@` (seção 9)                                                                                                |
| 9. `dist/bin/botai.js` sem bit de execução  | só afeta o repo; o leitor usa `npx`, `npm`, a imagem ou o binário                                                                                                                                                      |
| 10. dourados SQL sem a linha `-- botai: …`  | ao comparar, tire a 1ª linha do SQL gerado                                                                                                                                                                             |

## 8. Exemplo testável: ` ```bash testar `

Um bloco `bash` com a meta `testar` é executado pelo `scripts/exemplos.test.mjs`:

````md
```bash testar
botai pessoa --semente 42 --hoje 2026-10-05
```

```bash testar=1
botai validar cpf 634.132.403-08
```
````

- **`testar`** exige saída 0; **`testar=N`** exige a saída N (ex.: `testar=2` para erro de uso, `testar=1` para `inválido`).
- **Escreva o comando que o leitor digita**, com `botai` como o binário: nada de `node packages/…`, `./botai` nem prompt `$`. O teste põe no `PATH` um `botai` que roda `node <cópia de packages/core/dist>/bin/botai.js`.
- Cada bloco roda sozinho, com `bash` e `set -eo pipefail` (qualquer comando que falha derruba o bloco), numa pasta temporária vazia (pode criar arquivo ali, nada fora dela), sem stdin e com 60 s de limite. Um bloco não vê o que outro criou.
- **HTTP:** escreva sempre `http://127.0.0.1:8790` (a porta padrão do `botai serve`). O teste sobe o servidor uma vez, numa porta livre (`botai serve --porta 0`), e troca `127.0.0.1:8790` por ela. Use `curl -fsS` (sai com 22 em HTTP 400 ou mais); para mostrar a resposta de erro, `curl -sS`, que sai com 0.
- **Proibido em bloco testado** (o teste reprova): rede externa (qualquer URL que não seja `http://127.0.0.1:8790`, inclusive `localhost`), `docker` e `docker-compose`, `npx`, `npm`, `pnpm`, `sudo`, `gh`, clientes de banco (`psql`, `mysql`, `sqlite3`) e `botai serve` (quem sobe é o teste). Também: comando interativo ou que não termina. A regra olha a palavra solta: num bloco testado, `--dialeto mysql` também cai; escreva `--dialeto=mysql`.
- O que é proibido no teste vai num ` ```bash ` comum, sem `testar`, com a versão exata (seção 9): `npx -y @pilutech/botai-core@0.4.1 …`, `docker run … ghcr.io/piluvitu/botai:0.4.1`, `curl -fsSL …/install.sh | sh`, `… | psql "$DATABASE_URL"`. Se der, mostre ao lado o equivalente testável (o mesmo comando com `botai`).
- Saída mostrada logo depois do comando, num bloco `json`, `text`, `csv` ou `sql` sem `testar`, de uma execução real com `--semente` e `--hoje` fixos (sem eles, a pessoa muda todo dia).
- Um bloco, uma ideia. Comando longo pode quebrar linha com `\`.
- Código que não é shell (TS do Playwright, Python, Go, Java) não é executado: siga à risca o que o relatório mostra.

## 9. Versões

Toda versão citada é a exata do repo: `@pilutech/botai-core@0.4.1`, `ghcr.io/piluvitu/botai:0.4.1`, `@pilutech/botai-playwright@0.1.0`, a tag `core-v0.4.1`, `BOTAI_VERSAO=0.4.1`, e, nas saídas coladas, `"motor": "0.4.1"` e `-- botai: formato 1, motor 0.4.1`. O `scripts/versoes.test.mjs` reprova qualquer outra (inclusive `latest`, `^0.4.1` e `:0.4`). Quando o core ou o plugin subir de versão, o teste aponta cada página a atualizar.

- Instalar sem versão (`npm i -D @pilutech/botai-playwright`) é aceito; no `npx`, fixe a versão (é a recomendação do relatório, 5.4).
- Versão antiga se escreve sem o prefixo do pacote: "o core 0.4.0".

## 10. Antes de entregar

Na raiz do repo:

```bash
pnpm --filter @pilutech/botai-docs exec prettier --write docs
make lint
make test-botai-docs
make build-botai-docs
```
