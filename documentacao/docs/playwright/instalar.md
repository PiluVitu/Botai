---
title: Instalar o fixture
description: Como instalar o @pilutech/botai-playwright, o que ele exige do projeto (ESM, Node e @playwright/test) e em quais navegadores foi provado.
sidebar_position: 1
---

O `@pilutech/botai-playwright` é um fixture do Playwright. Cada teste recebe uma pessoa reproduzível e um `preencher` que usa o mesmo motor da extensão. É a porta de quem automatiza testes E2E.

## Instalar

```bash
npm i -D @pilutech/botai-playwright
```

Mudar a pessoa de uma semente é versão major; na série 0.x, é a minor. Para que ela não mude sem você saber, fixe a versão exata:

```bash
npm i -D --save-exact @pilutech/botai-playwright@0.1.0
```

## O que o projeto precisa ter

- `@playwright/test` ^1.59.1, como peer dependency: o seu projeto já o tem. A versão provada é a 1.63.0.
- Uma cópia só do `@playwright/test` no projeto.
- Node `^20.19.0 || >=22.12.0`. O pacote é só ESM.
- Os navegadores da versão exata do seu Playwright:

```bash
npx playwright install
```

## Navegadores provados

Chromium 153, Firefox 155 e WebKit 26.6, com o Playwright 1.63.0, tanto com o pacote do repositório quanto com o publicado no npm.

## A versão do core

O 0.1.0 depende do core 0.4.0, na versão exata. A pessoa é a mesma que o core 0.4.1 gera, e o anexo `botai-pessoa.json` diz `motor` 0.4.0. Mais sobre versões em [versões e dourados](../conceitos/versoes-e-dourados.md).

## Sem o fixture

Fora do fixture, a pessoa vem da CLI, do binário ou do servidor HTTP, e o motor vai para a página como texto: o [navegador.iife.js](../navegador/iife.md). Foram provados o Playwright sem o fixture e o CDP puro.

:::caution[Não testado]

Ninguém rodou o motor no Selenium, no Cypress, no Puppeteer nem no WebdriverIO. O que foi provado em volta: o Playwright sem o fixture e o CDP puro por WebSocket (o protocolo do Puppeteer) preenchem o cadastro realista com 21 preenchidos, 2 não reconhecidos e 0 recusados. As receitas estão em [Selenium](../integracoes/selenium.md), [Cypress](../integracoes/cypress.md), [Puppeteer](../integracoes/puppeteer.md) e [WebdriverIO](../integracoes/webdriverio.md).

:::
