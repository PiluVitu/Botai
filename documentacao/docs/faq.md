---
title: Perguntas frequentes
description: Respostas curtas para as dúvidas mais comuns sobre o Botaí, do checkbox que não marcou à pessoa diferente em cada navegador.
sidebar_label: FAQ
sidebar_position: 15
---

## Por que meu checkbox não marcou? {#checkbox}

O Botaí não preenche checkbox, radio, file, range, color, hidden, select múltiplo nem combobox sem `<select>` nativo. O "aceito os termos" fica desmarcado de propósito: marque-o no teste ou à mão. A lista completa está em [Limites](./limites.md#preenchimento).

## Por que cada navegador recebe uma pessoa diferente? {#pessoa-por-navegador}

No fixture do Playwright, a semente padrão é `projeto › arquivo › describe › título`, e cada navegador é um projeto. Para ter a mesma pessoa em todos, fixe a semente:

```ts
test.use({ botaiSemente: 42, botaiHoje: '2026-10-05' })
```

Mais em [Opções do fixture](./playwright/opcoes.md).

## Por que `botai pessoa --semente X` não é a 1ª pessoa de `botai pessoas --semente X`? {#pessoa-x-pessoas-x}

No lote, a pessoa `i` vem da semente `X/i`, e a primeira é `X/0`. Para gerar sozinha a primeira pessoa do lote, use `--semente X/0`:

```bash testar
botai pessoas -n 1 --semente demo --hoje 2026-10-08 --formato ndjson | grep -o '"cpf":"[^"]*"'
botai pessoa --semente demo/0 --hoje 2026-10-08 | grep '"cpf"'
```

```text
"cpf":"550.160.642-96"
    "cpf": "550.160.642-96",
```

Mais em [Semente e hoje](./conceitos/semente-e-hoje.md#pessoa-x-pessoas-x).

## Posso chamar o servidor do meu front-end? {#servidor-no-front}

Não. O `botai serve` não manda cabeçalho de CORS, e um `fetch` de outra origem falha com "Failed to fetch". Ele também não tem TLS nem autenticação: é para testes, scripts e back-end.

No front, use a biblioteca com um bundler. O gerador roda no navegador e gera o mesmo CPF que a CLI ([Instalar e runtimes](./biblioteca/instalar-e-runtimes.md)).

## Por que a pessoa mudou de um dia para o outro? {#mudou-no-dia-seguinte}

Sem o hoje, o Botaí usa a data de hoje em São Paulo, e a data de nascimento e a validade do cartão andam com ela. Fixe a semente **e** o hoje, e a versão do pacote ([Semente e hoje](./conceitos/semente-e-hoje.md#reproduzir)).

## O CPF gerado é de alguém? {#cpf-real}

Pode ser. O CPF, o CNPJ e o celular gerados são válidos e podem pertencer a uma pessoa ou empresa real. Use o Botaí só em localhost e staging ([Uso responsável](./conceitos/uso-responsavel.md)).

## Dá para escolher o sexo, a idade ou a cidade? {#sexo-idade-cidade}

Não pelas opções: a pessoa aceita só a semente, o hoje, a UF e o domínio do e-mail. A UF já amarra o CEP, a cidade, o DDD, a região do CPF e o código do título. Para controlar o resto, monte a pessoa à mão pelos subpaths da [biblioteca](./biblioteca/documentos.md).

## Meu teste do Playwright travou no `botai.preencher`. E agora? {#relogio}

Veja se o teste para o relógio. Com `page.clock.install({ time })` seguido de `page.clock.pauseAt(…)`, a 2ª passada não termina e a Promise não resolve. Só `page.clock.install()` não atrapalha. Há duas saídas:

```ts
await botai.preencher(page, { segundaPassada: false })
```

```ts
const preenchimento = botai.preencher(page)
await page.clock.runFor(1500)
await preenchimento
```

Mais em [Relógio e 2ª passada](./playwright/relogio-e-segunda-passada.md).

## Como reproduzir a pessoa de um teste que falhou no CI? {#reproduzir-falha}

Todo teste que usa o fixture leva as anotações `botai-semente` e `botai-hoje`, e a falha inesperada anexa o envelope em `botai-pessoa.json`. Com os dois valores, a CLI recria a pessoa fora do Playwright:

```bash
npx -y @pilutech/botai-core@0.4.1 pessoa --semente "<botai-semente>" --hoje <botai-hoje>
```

Mais em [Reproduzir uma falha](./playwright/reproduzir-uma-falha.md).

## Funciona com Selenium, Cypress, Puppeteer ou WebdriverIO? {#outras-ferramentas}

O motor roda em qualquer ferramenta que execute JS na página. Foi testado com o Playwright e com o CDP puro, o protocolo do Puppeteer.

:::caution[Não testado]

Ninguém rodou o motor com Selenium, Cypress, Puppeteer ou WebdriverIO. As páginas de [Integrações](./integracoes/cypress.md) são receitas montadas a partir do que foi provado.

:::

## Por que um campo ficou vazio? {#campo-vazio}

O campo pode não ter sido reconhecido. O classificador lê, nesta ordem, o `autocomplete`, o label, o `aria-label`, o `name`, o `id`, o `placeholder`, o formato, o tipo, as opções e o contexto; sem nenhuma pista que ele conheça, o campo vai para `naoReconhecidos`, sem chute. Na extensão, o popup lista esses campos com rótulo e seletor CSS, e o botão direito › Botaí › Inserir escreve o valor de um dos 23 tipos. Outros motivos: o campo estava desabilitado, só leitura, escondido, ou só habilitou depois da busca de CEP.

## Por que o atalho da extensão não faz nada? {#atalho}

Em páginas proibidas (`chrome://`, `about:`, lojas de extensão, leitor de PDF, `file:` sem permissão), a extensão não preenche e o atalho não faz nada. Se outro app tomou a tecla, o popup mostra "definir atalho". Os atalhos sugeridos são `⌥⇧P` no Mac, `Ctrl+Shift+Y` no Windows e no Linux e `Alt+Shift+P` no Firefox para Linux.
