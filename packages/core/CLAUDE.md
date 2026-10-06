# CLAUDE.md — `packages/core` (`@pilutech/botai-core`)

O motor do Botaí, publicado no npm. O Claude Code carrega este arquivo junto com o `CLAUDE.md` da raiz.

## Propósito

TypeScript puro, sem dependência de runtime e sem DOM: a pessoa de teste, os geradores de documento, o classificador de campos, o valor de cada campo e o atalho da extensão. A `extensao/` e o `site/` o consomem como código-fonte (workspace); o `/tools` do PiluVitu (monorepo `PiluVitu/PiluVitu-Dev`) usa CPF e CNPJ pelo npm, com versão exata.

- **Origem:** os módulos do Botaí do `@piluvitu/tools` do monorepo, com o histórico (`git filter-repo`, 2026-10). `prng` é cópia (a roleta do monorepo usa o original). `atalhos` saiu do `pilulabs.ts` de lá.
- **0.1.0 (fase 0):** os mesmos nomes de módulo e de função do `@piluvitu/tools`, um subpath por módulo, sem barrel na raiz. A 0.2.0 (fase 1) acrescenta a raiz com a API amigável (semente, lote, envelope), o `/plano` e a CLI (ver "API da raiz" abaixo e o contrato `docs/superpowers/plans/2026-10-05-botai-repo-proprio-contrato.md`).
- **Sem `lib: dom`:** o `tsconfig.json` tem só `es2022` e os tipos do Jest e do Node, e o Jest roda com `testEnvironment: 'node'`. Um uso acidental de DOM quebra o `lint` e os testes. Os tipos do Node servem aos testes (arquivo, processo filho) e, desde a fase 2, ao build (`tsconfig.build.json` com `"types": ["node"]`, por causa do `/servidor`); quem barra API de Node fora de `src/bin` e de `src/servidor/index.ts` é o `portabilidade.test.ts`, não o tsconfig.

## Atalho da extensão (`atalhos`)

`TECLAS_DO_MANIFESTO` é o `suggested_key` do comando `botai-preencher` (Chromium e Firefox), e `ATALHOS` sai dele (`teclaNoMac` troca `Alt`/`Shift`/`Ctrl` por `⌥`/`⇧`/`⌘`, como o Chrome mostra no Mac). Lido pelo `extensao/wxt.config.ts` e, no `site/`, pela tabela de atalhos e pelo atalho de quem visita. Mudou a tecla da extensão? Mude aqui: os testes fixam os dois formatos.

## Módulos (vindos do `@piluvitu/tools`)

Cada módulo é exportado só por subpath, com o nome do arquivo (`@pilutech/botai-core/rg` → `src/rg.ts`).

### Aleatoriedade injetável

- `aleatorio`: `type Rng = Pick<Prng, 'int'>` (o `Prng` de `prng.ts` serve direto) e `rngPadrao` (`Math.random`). Todo gerador recebe `rng: Rng = rngPadrao` como 1º argumento; a extensão sorteia com `seedFromBytes(cryptoRandomBytes(16))`.
- **`gerarCPF()` e `gerarCNPJ()` sem argumento continuam iguais** para o `/tools` do PiluVitu (`apps/web` do monorepo, pelo npm). Não passe um gerador direto como handler (`onClick={gerarCPF}`): o evento viraria o `rng`.
- Os testes sorteiam com `src/rng-teste.ts` (`sementes(n)`, `sequencia([...])`, `minimo`, `maximo`), que não tem subpath e não é código de produção.

| Subpath          | O que tem                                                                                                                                                                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aleatorio`      | `Rng`, `rngPadrao`, `escolher`, `embaralhar`, `digitosAleatorios`, `somenteDigitos`                                                                                                                                                                                                                      |
| `uf`             | `UFS`, `UF`, `CODIGO_UF_TITULO` (tabela do TSE; exterior `ZZ` = `28`), `REGIAO_FISCAL_CPF` (folheto da Receita), `UF_NOME`                                                                                                                                                                               |
| `cpf`            | `gerarCPF(rng?, uf?)`: com `uf`, o 9º dígito é a região fiscal; base com os 9 dígitos iguais é sorteada de novo                                                                                                                                                                                          |
| `cnpj`           | `gerarCNPJ(rng?)`, filial `0001`, só dígitos. O CNPJ alfanumérico (jul/2026) fica fora: `validarCNPJ` ainda o recusa                                                                                                                                                                                     |
| `rg`             | `gerarRG(rng?, {permitirX?})` no modelo da SSP-SP (`NN.NNN.NNN-D`, pesos 2..9, DV = 11 − resto, 10 → X, 11 → 0), porque o RG não tem padrão nacional. Por padrão não gera X. `validarRG`, `dvRGSP`                                                                                                       |
| `pis`            | `gerarPIS`, `validarPIS`, `dvPIS` (`000.00000.00-0`)                                                                                                                                                                                                                                                     |
| `titulo-eleitor` | `gerarTituloEleitor(rng, uf \| 'ZZ')`, `validarTituloEleitor(v, regra)`. Em SP e MG só sai número válido **com e sem** a exceção disputada (resto 0 → 1), porque os validadores populares divergem nela                                                                                                  |
| `celular`        | `gerarCelular(rng, ddd)` → `{ddd, numero, formatado, digitos, e164}`, no formato `(DD) 9XXXX-XXXX`                                                                                                                                                                                                       |
| `nascimento`     | `gerarNascimento(rng, hojeISO)`: idade de 18 a 65 no `hojeISO`, só calendário (`Date.UTC`, sem fuso). `lerDataISO` lança em data inexistente                                                                                                                                                             |
| `senha`          | `gerarSenha(rng, tamanho = 12)`: maiúscula, minúscula, dígito e um de `!@#$%&*`, começa por letra, sem caractere ambíguo nem tecla morta do ABNT2                                                                                                                                                        |
| `nome`           | `gerarNome` (prenome + 2 sobrenomes distintos, `sexo`, `noCartao` com até 26 caracteres) e `gerarEmail` (`prenome-sobrenome-NNNN@tuamaeaquelaursa.com`, caixa **pública**; **traço, nunca ponto**: o site normaliza o nome da caixa para `[a-z0-9]` + `-`, então `maria.ribeiro.4821` abria outra caixa) |
| `endereco`       | `LOGRADOUROS`: 34 CEPs reais conferidos no ViaCEP (as 27 UFs), cada um com a faixa de numeração e o lado. `gerarEndereco(rng, uf?)` só sorteia número dentro dela; complemento `Apto {andar}{unidade}`                                                                                                   |
| `empresa`        | `gerarEmpresa(rng, sobrenomes)` → razão social `{S1} & {S2} {ramo} Ltda`, fantasia `{S2} {sufixo}` e CNPJ                                                                                                                                                                                                |
| `cartao`         | **Só os números de teste da Stripe** (Visa `4242 4242 4242 4242`, Mastercard `5555 5555 5555 4444`); validade entre hoje + 12 e hoje + 59 meses, CVV de 3 dígitos. Número aleatório que passa no Luhn não aprova em sandbox e pode ser de um cartão real                                                 |

### `montarPessoa(rng, hojeISO, opcoes?)` (`pessoa`)

- **Coerência:** a região do CPF e o código do título são os da UF do endereço; o DDD do celular é o do CEP; o e-mail sai do nome; a empresa, dos sobrenomes; o nome impresso no cartão, da pessoa. O RG é sempre `SSP/SP`, o modelo do gerador.
- **A ordem das chamadas a `rng` é contrato:** trocá-la muda a pessoa de toda semente.
- **Pessoa dourada** (`sfc32(1,2,3,4)`, `'2026-10-01'`) em `pessoa.test.ts`: é um snapshot de propósito. Quando um gerador muda, ela muda; a mudança é revista e o teste atualizado na mesma tarefa.
- Não tem campo `versao`: quem versiona a pessoa guardada é a extensão (`storage.defineItem(…, { version })`).

### Classificador (`campos`)

- `classificarFormulario(ds, hojeISO)` faz duas passadas. A 1ª pontua cada campo: token de `autocomplete` (gramática WHATWG) com confiança 1; regras regex pt-BR/en sobre label, aria-label, name, id e placeholder, com pesos 1 / 1 / 0,95 / 0,9 / 0,8 e bônus de 0,03 por fonte que concorda; formato do placeholder; e o `type` só como pista fraca (`type=tel` **não** quer dizer telefone: no Brasil ele abre o teclado numérico em CPF e CEP). A 2ª resolve os genéricos (`_nome`, `_numero`, `_documento`, dia/mês/ano, 2º e-mail, 2ª senha) pela seção, pelos vizinhos (±2), pelo `maxLength` e pelas opções do select. Devolve `{kind, confianca, via, dicas?}`, ou `null` abaixo de `LIMIAR = 0.5`.
- **Sem ano fixo:** os anos das opções de select são lidos contra o ano de `hojeISO`. `classificarCampo(d)` (um campo, sem formulário) roda sem ano, com essas pistas desligadas.
- **`FieldDescriptor`** é montado pela extensão: `label` junta `el.labels`, o `<label>` que envolve o campo (sem o texto das `<option>`) e `aria-labelledby`; `maxLength` vai `null` quando o atributo falta (o DOM dá `-1`); `section` é a `legend` do `fieldset` mais próximo.
- **Nunca dado errado.** O veto de telefone fixo vale para **toda** fonte de celular: a regra, o formato `(00) 0000-0000`, o `type=tel`, o `autocomplete` com `home`, `work`, `fax` ou `pager`, e o telefone que forma par com um DDD, seja ele o `Número` ou um "Telefone"/"Fone" (veto pela seção, pelo próprio campo ou pelo DDD). Um celular solto num fieldset de telefone fixo ("Telefone fixo", "Telefone comercial") também fica de fora; num fieldset sem palavra de telefone ("Dados comerciais") ele segue celular. As palavras do veto são `fixo|residencial|comercial|res|resid` ("Tel. Res.", `tel_res`, `ddd_res`) e, só no fim de uma fonte, `com` ("Tel. Com.", `tel_com`, `ddd_com`): no meio da fonte, "Celular com DDD" é o celular inteiro. UF ou estado "emissor", "de expedição", "Exp.", "de emissão", "do órgão", "do documento", "do RG" ou "da identidade" ficam de fora, e também um `UF` ou `Número` soltos numa seção "RG"/"Identidade" (senão o "Número" virava o número do endereço).
- **DDD:** o rótulo aceita qualificador depois ou antes da palavra DDD ("DDD residencial", "DDD (fixo)", `dddComercial`, "DDD do celular", "Celular - DDD", `celular_ddd`). Com palavra de telefone, ele só vira `ddd` num campo onde não cabe um telefone (select ou `maxLength` ≤ 4) ou, sem `maxLength`, quando o campo seguinte é o `Número` ou o celular. Antes do celular, a exigência é maior: a fonte **começa** com DDD ("DDD do celular") e o celular seguinte não menciona DDD; senão "Telefone (DDD)" + "Celular (DDD)", "Celular/DDD" + "Telefone" e "Fone DDD" + "Celular DDD" são dois telefones inteiros. Um placeholder de telefone inteiro (`(00) 00000-0000`) nunca é DDD. "com DDD", "c/ DDD", "DDD + número" e "DDD + Telefone" (o `+` junto do DDD) são sempre o número inteiro, como "DDD + Celular" com `maxLength` 15.
- **`Número` de telefone:** logo depois de um DDD ele vira `celular` com `semDdd` (ou `null`, se o par é de fixo); solto numa seção de telefone ("Telefone", "Celular", "WhatsApp") fica não reconhecido. Sem isso, num formulário com endereço, o telefone recebia o número da casa. Custo aceito: numa seção mista ("Endereço e telefone") o número da casa também fica sem preencher.
- **Limites conhecidos (não bloqueiam):** um `UF` solto logo depois de "RG"/"Órgão emissor", fora de fieldset, ainda vira `uf`; e o DDD de um fixo (`autocomplete="home tel-area-code"`, "DDD Fixo") seguido de um "Telefone" ou "Celular" anula esse telefone, mesmo quando ele é um celular inteiro à parte (fica não reconhecido, nunca com dado errado).
- Kind composto `cidadeUf`, para "Cidade / UF".

### Valor de cada campo (`campos-formatar`)

- `valorPara(kind, pessoa, descriptor, dicas?)` escolhe o valor **antes** de escrever, porque uma escrita por script ignora `maxlength`: a versão com máscara quando cabe em `maxLength` e em `pattern` (flag `v`), senão só os dígitos; `type=date` → `aaaa-mm-dd`, `type=month` → `aaaa-mm`, `type=number` → dígitos.
- **Senha maior que `maxLength` vai inteira:** o campo recusa e a extensão conta como "recusado". Truncar quebraria o login seguinte.
- **`<select>`** (`escolherOpcao`): valor ou texto normalizados, depois igualdade numérica (`03` = `3`), depois token do texto (`SP - São Paulo`). Pula a opção de placeholder, e sem a opção da pessoa devolve `null`. UF tenta a sigla e o nome; país tenta `BR`, `BRA`, `076`, `Brasil`, `Brazil`. No `sexo` a sigla vai **por último**: num select `h`/`m`, o `m` é Mulher.
- **Valores compostos:** `sobrenome` = os dois sobrenomes; `usuario` = `email.usuario`; `cidadeUf` = `"{cidade} / {uf}"`; `enderecoCompleto` = `"{logradouro}, {numero}, {complemento} - {bairro}, {cidade} - {uf}, {cep}"`.

## Build e publicação

- **Dois manifestos.** No repo, o `exports` aponta cada subpath para `./src/<módulo>.ts`: a `extensao/` e o `site/` transpilam o código-fonte, e o zip de fontes da AMO não precisa de build do core. No pacote publicado, o `publishConfig.exports` do pnpm (aplicado pelo `pnpm pack`) troca para `{ "types": "./dist/<módulo>.d.ts", "default": "./dist/<módulo>.js" }`. Subpath novo entra nos dois.
- **`build`** (roda sozinho no `prepack`): `tsc -p tsconfig.build.json` (ES2022, com `.d.ts`, sem testes e sem `rng-teste.ts`) e `scripts/extensoes.mjs dist`, que acrescenta `.js` aos imports relativos (o Node recusa import relativo sem extensão em ESM, e TypeScript dentro de `node_modules`: https://nodejs.org/api/typescript.html) e falha se algum ficar sem arquivo. É cópia do script do `@piluvitu/ui`.
- **`scripts/pacote.test.mjs`** (`node --test`, no fim do `test`): roda o `pnpm pack` de verdade e reprova se a lista do `pnpm pack --dry-run --json` mudar (ela sai dos valores do `publishConfig.exports`, mais `LICENSE`, `README.md`, `package.json` e a constante `EXTRAS`, onde entra todo arquivo do tarball que nenhum subpath aponta), se um subpath existir só num dos manifestos, se um `./src/<x>.ts` do workspace não virar `./dist/<x>.{js,d.ts}` no tarball, se aparecer dependência de runtime, se um import relativo do `dist` ficar sem arquivo, se um subpath não carregar no Node ou se o `dist` gerar uma pessoa dourada diferente da do código-fonte.
- **Publicação:** `version` no `package.json` por PR; depois do merge, tag anotada `core-v<versão>` na `main` e push. O `.github/workflows/publicar-core.yml` confere tag × versão e o commit na `main`, roda `lint` e `test`, empacota com `pnpm pack` e, no job `publicar` (environment `npm`, aprovação do dono, `id-token: write`, Node 24.14.0), extrai o tarball e roda `npm publish <pasta> --access public --provenance` (trusted publishing, sem token). A 0.1.0 saiu por token do dono no env local (passo C8 do plano da fase 0).
- **Versões:** 0.1.0 (fase 0), 0.2.0 (fase 1), 0.3.0 (fase 2), 0.4.0 (fase 3), pelo contrato. Mudar a pessoa que uma semente gera é versão major a partir da fase 1.

## Testes

Jest + ts-jest (`testEnvironment: 'node'`), `*.test.ts` ao lado do fonte (em `src/` e, desde a fase 2, em `scripts/`, como o `install.test.ts`); `node --test` para `scripts/*.test.mjs`. `make test-core` ou `pnpm --filter @pilutech/botai-core test`; `pnpm --filter @pilutech/botai-core lint` confere o `versao.ts`, os tipos e, desde a fase 2, os `scripts/*.sh` com o ShellCheck. Os testes sorteiam com `src/rng-teste.ts`, que não é exportado nem vai para o `dist`.

## Dependências

Nenhuma de runtime, e assim fica (spec §5.4). As devDependencies seguem a política da raiz.

## API da raiz (0.2.0, fase 1)

Plano: `docs/superpowers/plans/2026-10-05-botai-fase1-core-cli.md`. Os nomes são os do contrato (`docs/superpowers/plans/2026-10-05-botai-repo-proprio-contrato.md`), e `src/index.test.ts` trava a lista exata do que a raiz exporta: mudou a raiz, mude o contrato no mesmo PR.

- `gerarPessoa(opcoes?)`, `gerarPessoas(n, opcoes?)`, `gerarEnvelopeDaPessoa`, `gerarEnvelopeDasPessoas`, `rngDeSemente`, `sementeAleatoria`, `hojeEmSaoPaulo`, `FORMATO`, `MOTOR`, `DOMINIO_EMAIL_PADRAO`, `LIMITE_DO_LOTE`, `ErroDeOpcao`.
- Opções (`src/opcoes.ts`): `semente` (inteiro seguro, ou texto de 1 a 256 caracteres sem caractere de controle), `hoje` (`AAAA-MM-DD` que existe), `uf` (sigla, qualquer caixa), `dominioEmail` (hostname ASCII com 2 ou mais rótulos, guardado em minúsculas). Opção inválida lança `ErroDeOpcao` com `.opcao`; a CLI transforma em saída 2 com o nome da flag, e o servidor da fase 2 transforma em 400.
- Subpath novo entra no `exports` (`./src/<m>.ts`, para o workspace) **e** no `publishConfig.exports` (`dist/`, para o tarball); arquivo novo no tarball entra na lista de `scripts/pacote.test.mjs`. A conferência é sempre pelo `pnpm pack`, que é quem aplica o `publishConfig`.
- `resolverOpcoes` sorteia a semente e usa `hojeEmSaoPaulo()` quando faltam. `pessoasDoLote(n, resolvidas)` é o gerador que a CLI percorre linha a linha. `loteCom` recebe o montador por parâmetro só para o teste forçar repetição.

## Semente

- `rngDeSemente(s) = sfc32(cyrb128(bytes UTF-8 de NFC(String(s))))`. TS puro, sem WebCrypto, para dar o mesmo resultado em Node, Bun, navegador e na extensão. `42 ≡ '42'`.
- `semente.test.ts` fixa os primeiros valores de `42`, `'botai'` e `'ação 🧀'`. Mudar o hash, a codificação, a normalização ou o `sfc32` muda a pessoa de toda semente: versão major (na 0.x, a minor) e dourados regravados no mesmo PR.
- `sementeAleatoria()`: 16 hex de `crypto.getRandomValues`, com `Math.random` só onde não existe `crypto`.

## `montarPessoa(rng, hojeISO, opcoes?)` (`/pessoa`)

- É o antigo `gerarPessoa(rng, hojeISO)`. Sem opções, a pessoa de um `rng` não mudou (a pessoa dourada de `pessoa.test.ts` está igual).
- `uf` vai para `gerarEndereco`; o número de chamadas ao `rng` não muda, então o nome é o mesmo com ou sem `uf`.
- `dominioEmail` muda só o domínio do e-mail. `email.caixaUrl` é `null` fora de `tuamaeaquelaursa.com` (o tipo virou `string | null`; a extensão só abre aba quando há URL).

## Lote

- Pessoa `i` = semente `S/i`. Se `email.endereco`, `cpf` ou `empresa.cnpj` repetem um anterior do lote, sai `S/i/2`, `S/i/3`… até `TENTATIVAS_POR_PESSOA` (1000) e então lança, em vez de travar.
- Caso real fixado em teste: na semente `mil-3`, `mil-3/971` repete o e-mail de `mil-3/387`, e a pessoa 971 sai de `mil-3/971/2`.
- Prefixo estável: as primeiras `k` pessoas de um lote de `n` são o lote de `k`.
- Nome, endereço e CEP repetem (34 logradouros); só e-mail, CPF e CNPJ são únicos.
- `LIMITE_DO_LOTE` = 100 000 (100 mil pessoas em cerca de 1,6 s no Node 22, medido no protótipo da fase 1).

## Envelope, esquema e dourados

- `{ formato: 1, motor, semente, hoje, pessoa | pessoas }`; `semente` é a resolvida (texto, NFC) e `motor` é `MOTOR`.
- `esquema/envelope-v1.schema.json` (JSON Schema 2020-12) vai no pacote. `envelope.esquema.test.ts` o valida com o Ajv (só devDependency) contra todos os dourados e casos extras.
- `dourado/v1/indice.json` diz que entradas geram cada arquivo; `scripts/gerar-dourados.mjs` regrava tudo a partir do `dist/`. **Regravar um dourado quer dizer que a pessoa de uma semente mudou: versão major.** As comparações ignoram `motor`.
- `pessoas-1000.json` fica compacto (1,1 MB). A pasta está no `.prettierignore` e fora do `files` (não vai para o npm).
- Quem confere os dourados: `envelope.dourado.test.ts` (biblioteca), `bin/botai.test.ts` (CLI do build), `extensao/src/test/pessoa-dourada.test.ts` (o core que a extensão empacota) e, desde a fase 2, os testes do servidor e do `serve` e o `scripts/fumaca.mjs` (binários e imagem). A fase 3 acrescenta o Playwright.

## Versão do motor

`MOTOR` vem de `src/versao.ts`, que `scripts/gerar-versao.mjs` grava a partir do `version` do `package.json` no começo do `build`. O `lint` roda `gerar-versao --conferir` e falha se o arquivo versionado ficou para trás. Subiu a versão? `node scripts/gerar-versao.mjs` e commite os dois juntos.

## Visão plana, CSV e SQL (`/plano`)

- `FORMATOS` (`json`, `ndjson`, `csv`, `sql`) e `DIALETOS` moram aqui; a CLI e o servidor da fase 2 leem daqui.
- 33 colunas em `COLUNAS`, em `snake_case` ASCII (a tabela com a origem de cada uma está no README). `idade` é número; `email_caixa_url` pode ser `null`; o resto é texto, com a máscara que a `Pessoa` já tem (CPF, CNPJ, CEP).
- CSV: RFC 4180, CRLF e cabeçalho; aspas só quando precisa; `null` vira campo vazio e texto vazio vira `""` (é assim que o `COPY … CSV` do Postgres distingue os dois).
- SQL: um `INSERT` por pessoa. Postgres e SQLite citam nomes com `"`, o MySQL com crase; aspas simples dobradas em todos; barra invertida dobrada só no MySQL (no Postgres com `standard_conforming_strings` e no SQLite ela é literal); `null` vira `NULL`.
- `--tabela` passa por `lerTabela` (`[A-Za-z_][A-Za-z0-9_]{0,62}`, com `esquema.` opcional), então o nome citado nunca fecha a aspa.
- `plano.test.ts` executa o SQL do SQLite num `node:sqlite` em memória (processo filho) e compara com `pessoaPlana`; por isso os testes pedem Node ≥ 22.13.

## CLI (`botai`)

- `src/cli/executar.ts` é puro: `executar(argv, saida)` devolve o código de saída e escreve por `saida.dados` e `saida.mensagem`. Só `src/bin/botai.ts` toca o processo: tipo local de `process` (o pacote compila sem `@types/node`), `process.exitCode` em vez de `process.exit` (a doc do Node avisa que `process.exit` pode perder escrita pendente no stdout) e saída 0 no `EPIPE` (`| head`).
- Leitor de argumentos próprio (`src/cli/argumentos.ts`), sem dependência: mensagens em português e valor que começa com traço (`--semente -5`).
- Toda validação roda antes da primeira escrita no stdout: erro de uso nunca deixa CSV ou SQL pela metade.
- Saídas: 0 ok, 1 inválido no `validar`, 2 erro de uso, 3 erro interno.
- `ndjson` traz a semente exata de cada pessoa; `csv` sem `--semente` avisa a semente no stderr; `sql` começa com `-- botai: formato 1, motor …, semente …, hoje …`.
- Testes: `cli/executar.test.ts` (em processo, rápido) e `bin/botai.test.ts` (roda `node dist/bin/botai.js`; por isso o `test` do pacote faz `build` antes).
- `portabilidade.test.ts`: fora de `src/bin` (e de `src/servidor/index.ts`, desde a fase 2), nenhum módulo pode citar `process.`, `node:`, `require(`, `Buffer`, `document.` ou `window.`.

## Servidor, imagem e binários (fase 2, 0.3.0)

Plano: `docs/superpowers/plans/2026-10-05-botai-fase2-servidor.md`.

- **`/servidor`** (`src/servidor/`): `node:http`, sem framework. `responder(metodo, alvo)` é puro (`consulta.ts` lê, `rotas.ts` responde); `criarServidor()` (`index.ts`) só o liga ao HTTP. A raiz do pacote não importa `/servidor`: a raiz roda no navegador da extensão. A trava `src/portabilidade.test.ts` aceita API de Node só em `src/bin/` e em `src/servidor/index.ts`; por isso o build compila com `"types": ["node"]` (`tsconfig.build.json`) sem que o motor possa usá-los.
- **Uma validação só:** a consulta passa pelos leitores da CLI (`resolverOpcoes`, `lerUF`, `lerDominioEmail`, `lerCampos`, `lerDialeto`, `lerTabela`), e `mensagemDeUso` transforma `ErroDeOpcao`, `ErroDoPlano` e `ErroDeConsulta` no texto do 400. Só do HTTP: parâmetro desconhecido, repetido ou vazio é 400 (ignorar daria a pessoa padrão em silêncio para quem errou o nome, `dominio-email` em vez de `dominioEmail`) e `n` vai de 1 a 10 000 (a CLI vai de 0 a 100 000).
- **Alvo que não vira URL** (`GET http://[`, que o `node:http` entrega sem validar) dá 400 `{ erro }`, como os outros erros: com o `new URL` fora do `try`, um pedido assim derrubava o `botai serve`.
- **`textoDoLote`** (`src/lote.ts`): o texto de `botai pessoas` em json, ndjson, csv e sql, parte a parte. A CLI escreve as partes no stdout e o servidor as junta no corpo; mudar um formato muda os dois. Ele valida o `n` antes de devolver o gerador, então nada é escrito antes de um erro.
- **`botai serve`** (`src/bin/serve.ts`): o bin (`src/bin/botai.ts`) despacha `serve` antes do `executar`, que é síncrono e não conhece o comando. As flags passam pelo `lerArgumentos` da CLI (`--porta 9000` e `--porta=9000` valem; erro de uso sai com 2).
- **Listen recusado** vira `ErroDoServe`, uma linha no stderr: porta ocupada (`EADDRINUSE`) sai com 1; host que não é desta máquina (`EADDRNOTAVAIL`, `ENOTFOUND` e o `EINVAL` que o macOS dá para multicast e broadcast, como `224.0.0.1`) e porta sem permissão (`EACCES`, abaixo de 1024 sem root) saem com 2. Código de erro fora da lista escapa como rejeição não tratada (sai com 1 e o stack trace do Node), que era o caso do `EINVAL` e do `EACCES` antes. Medido em 2026-10-06: o Linux escuta em `224.0.0.1` e em `255.255.255.255`, e num container a porta 80 é liberada (`ip_unprivileged_port_start = 0`); por isso o `serve.test.ts` simula esses erros e só os confere por processo onde o sistema recusa de verdade.
- **Encerramento:** `close()` + `closeIdleConnections()` na hora e `closeAllConnections()` depois de 2 s. O `serve` trata SIGINT e SIGTERM (sai com 0): na imagem o Node é o PID 1 e não tem tratador padrão, e sem isso o `docker stop` esperava 10 s e matava com 137.
- **A linha `botai serve: ouvindo em <url>`** no stderr é contrato: `serve.test.ts` e `scripts/fumaca.mjs` acham a URL por ela (com `--porta 0`).
- **Imagem** (`Dockerfile`): instala o tarball do npm (`pnpm run tarball` → `pacote/botai-core.tgz`), o mesmo arquivo do `npm publish`; `--offline` e `docker build --network=none` passam porque o pacote não tem dependência. Base `node:24.21.0-alpine3.24` por digest (o Dependabot `docker` sobe tag e digest), `USER node`, `HEALTHCHECK --start-interval` (Docker ≥ 25), `ENTRYPOINT ["botai"]` e `CMD ["serve", "--host", "0.0.0.0", "--porta", "8790"]`. O `.dockerignore` deixa só o tarball no contexto (sem ele iriam `node_modules` e os ~400 MB do `dist-bin`). Tamanho medido em 2026-10-05 (protótipo e `botai:local`): 240 MB no `docker image ls` do Docker 29 com o containerd (62,7 MB de conteúdo), quase tudo o binário `node` (122 MB).
- **GHCR:** o primeiro push cria o pacote **privado** (padrão do GitHub); o dono o torna público uma vez. Só o job `imagem` do `core-distribuicao.yml` tem `packages: write`.
- **Binários:** Bun do `.bun-version` (1.4.2). Local: `scripts/bun-fixo.sh` baixa para o cache e confere SHA256 fixados no script (trocou a versão, troque os SHA256); o `binarios.sh` recusa outro Bun. No CI, `oven-sh/setup-bun` com `bun-version-file`. Medido com o 1.4.2 em 2026-10-05: alvos x64 e x64-baseline geram binários diferentes (usamos o baseline, que roda sem AVX2); o binário macOS de outra arquitetura sai com assinatura inválida, por isso os darwin são compilados no runner `macos-15` e reassinados ad-hoc (`codesign --force --sign -`); tamanhos: darwin-arm64 ~62 MB, darwin-x64 ~69 MB, linux ~81 MB, windows-x64 ~86 MB, windows-arm64 ~74 MB (este medido com um script mínimo, não com o `botai`); compilar alvo cruzado baixa o runtime daquele alvo (precisa de rede).
- **`install.sh`:** POSIX sh (roda no dash), `BOTAI_VERSAO`, `BOTAI_DESTINO`, `BOTAI_RELEASES` (raiz dos releases, para o teste). Baixa de `releases/latest`, então o release do core tem de ser o "Latest" do repo: todo outro workflow que cria release usa `--latest=false`. Teste: `scripts/install.test.ts` (release falso num `node:http` e `uname`/`sysctl`/`ldd` falsos no PATH); `spawn` assíncrono, porque o `spawnSync` travaria o servidor do release no mesmo processo.
- **Fumaça** (`scripts/fumaca.mjs`): `.mjs` sem dependência, fora do Jest de propósito: roda nos 6 runners do release (Windows incluso) só com `setup-node`, sem `pnpm install`. Confere SHA256, os dourados pela CLI e pelo HTTP, `/saude` e o SIGTERM (exceto no Windows, onde o kill não entrega sinal).
- **Workflow `core-distribuicao.yml`:** `pacote` → `binarios` (macOS) → `fumaca-binarios` (ubuntu-24.04, ubuntu-24.04-arm, macos-15, macos-15-intel, windows-2025, windows-11-arm) → `imagem` (fumaça amd64, push amd64+arm64) → `imagem-publicada` (a imagem do GHCR como `services:`, como um projeto de teste a usaria) → `release` (cria o release da tag, ou anexa a um que já exista, e marca `--latest`). No PR e no dispatch, só até `fumaca-binarios` (no PR, mais o actionlint).

| Comando                                          | O quê                                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `make imagem`                                    | tarball + `docker build --network=none -t botai:local`                                     |
| `make fumaca-imagem`                             | sobe a `botai:local`, espera o `HEALTHCHECK`, confere contra os dourados e o `docker stop` |
| `make binario-local`                             | build + binário Bun desta máquina + fumaça                                                 |
| `pnpm --filter @pilutech/botai-core run tarball` | `pacote/botai-core.tgz`                                                                    |
| `bash packages/core/scripts/binarios.sh <alvo>…` | binários em `dist-bin/` (`BUN` = o do `bun-fixo.sh`)                                       |
