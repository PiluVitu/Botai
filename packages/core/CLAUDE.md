# CLAUDE.md — `packages/core` (`@pilutech/botai-core`)

O motor do Botaí, publicado no npm. O Claude Code carrega este arquivo junto com o `CLAUDE.md` da raiz.

## Propósito

TypeScript puro, sem dependência de runtime e sem DOM: a pessoa de teste, os geradores de documento, o classificador de campos, o valor de cada campo e o atalho da extensão. A `extensao/` e o `site/` o consomem como código-fonte (workspace); o `/tools` do PiluVitu (monorepo `PiluVitu/PiluVitu-Dev`) usa CPF e CNPJ pelo npm, com versão exata.

- **Origem:** os módulos do Botaí do `@piluvitu/tools` do monorepo, com o histórico (`git filter-repo`, 2026-10). `prng` é cópia (a roleta do monorepo usa o original). `atalhos` saiu do `pilulabs.ts` de lá.
- **0.1.0 = a API de hoje:** os mesmos nomes de módulo e de função do `@piluvitu/tools`, um subpath por módulo, sem barrel na raiz. A API amigável (semente, lote, envelope, CLI) é a 0.2.0 (fase 1; ver o contrato `docs/superpowers/plans/2026-10-05-botai-repo-proprio-contrato.md`).
- **Sem `lib: dom`:** o `tsconfig.json` tem só `es2022` e os tipos do Jest, e o Jest roda com `testEnvironment: 'node'`. Um uso acidental de DOM quebra o `lint` e os testes. O `@types/node` está nas devDependencies para os testes de script das fases seguintes, mas não entra no `types`.

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

### `gerarPessoa(rng, hojeISO)` (`pessoa`)

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

Jest + ts-jest (`testEnvironment: 'node'`), `*.test.ts` ao lado do fonte; `node --test` para `scripts/*.test.mjs`. `make test-core` ou `pnpm --filter @pilutech/botai-core test`; tipos com `pnpm --filter @pilutech/botai-core lint`. Os testes sorteiam com `src/rng-teste.ts`, que não é exportado nem vai para o `dist`.

## Dependências

Nenhuma de runtime, e assim fica (spec §5.4). As devDependencies seguem a política da raiz.
