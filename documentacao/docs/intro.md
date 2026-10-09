---
title: O que é o Botaí
description: Suíte de dados de teste brasileiros que gera uma pessoa fictícia e coerente e preenche formulários com ela, do navegador ao CI.
sidebar_position: 1
slug: /
---

O Botaí é uma suíte de dados de teste brasileiros. Ele gera uma pessoa fictícia e coerente: nome, CPF, RG, PIS, título de eleitor, empresa com CNPJ, CEP real com rua e cidade, celular com o DDD daquele CEP, e-mail com caixa de entrada pública e cartão de teste da Stripe ou da Pagar.me, no cenário que você escolher (aprovado, recusado, pendente…). Depois, preenche formulários com ela.

É para quem testa software brasileiro, em qualquer lugar: no navegador, no terminal, em qualquer linguagem, no código JS e TS, no E2E e no banco de dados.

Dá para confiar porque é reprodutível e conferido:

- a mesma semente e o mesmo dia geram a mesma pessoa em todas as portas. Isso foi provado campo a campo em 15 saídas, com 43 de 43 campos iguais;
- 12 arquivos dourados travam o resultado. Foram gravados na 0.2.0 e ficaram idênticos até a 0.4.1; na 0.5.0, ganharam só o provedor e o cenário do cartão;
- os pacotes do npm (o core e o do Playwright) têm código aberto sob MIT, e o core não tem nenhuma dependência de runtime.

## Experimente

A mesma semente e o mesmo dia geram a mesma pessoa:

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05
```

Sem instalar nada, onde houver Node:

```bash
npx -y @pilutech/botai-core@0.5.0 pessoa --semente 42 --hoje 2026-10-05
```

O `validar` imprime `válido` e sai com 0, ou imprime `inválido` e sai com 1:

```bash testar=1
botai validar cpf 634.132.403-08
```

Com o servidor HTTP no ar (`botai serve` escuta em `127.0.0.1:8790`), a mesma pessoa sai em JSON:

```bash testar
curl -fsS 'http://127.0.0.1:8790/pessoa?semente=42&hoje=2026-10-05'
```

O passo a passo, com a saída completa, está em [Primeira pessoa](./comecar/primeira-pessoa.md).

## As portas

Porta é cada jeito de usar o Botaí. Todas usam o mesmo gerador, e as que preenchem formulário (extensão, fixture e motor) usam o mesmo motor.

| Porta                                             | Onde roda                                                                     | Como instala                                                                 | Um comando real                                                                                |
| ------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [Extensão](./extensao/instalar.md)                | Chrome 123+, Edge (Chromium 123+, pela Chrome Web Store) e Firefox 153.0+     | Chrome Web Store ou Firefox Add-ons                                          | atalho `⌥⇧P` no Mac, `Ctrl+Shift+Y` no Windows e no Linux, `Alt+Shift+P` no Firefox para Linux |
| [CLI](./cli/visao-geral.md)                       | onde houver Node (provados: Node 22 e 24)                                     | `npx -y @pilutech/botai-core@0.5.0 <comando>`                                | `botai pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql`                        |
| [Biblioteca](./biblioteca/instalar-e-runtimes.md) | Node, Bun, Deno e navegador (com bundler)                                     | o pacote `@pilutech/botai-core` do npm                                       | `gerarPessoa({ semente: 42, hoje: '2026-10-05' })`                                             |
| [Servidor HTTP](./servidor/botai-serve.md)        | Node, imagem ou binário                                                       | `botai serve`                                                                | `curl 'http://127.0.0.1:8790/pessoa?semente=42&hoje=2026-10-05'`                               |
| [Imagem Docker](./docker/imagem.md)               | linux/amd64 e linux/arm64                                                     | `docker pull ghcr.io/piluvitu/botai:0.5.0`                                   | `docker run --rm -p 8790:8790 ghcr.io/piluvitu/botai:0.5.0`                                    |
| [Binários](./binarios/install-sh.md)              | macOS, Linux e Windows, em x64 e arm64 (6 alvos)                              | o `install.sh` do GitHub Release                                             | `botai pessoa --semente 42 --hoje 2026-10-05`                                                  |
| [Fixture do Playwright](./playwright/instalar.md) | `@playwright/test` ^1.59.1 (provado na 1.63.0), em Chromium, Firefox e WebKit | `npm i -D @pilutech/botai-playwright`                                        | `await botai.preencher(page)`                                                                  |
| [Motor no navegador](./navegador/iife.md)         | qualquer ferramenta que execute JS na página                                  | o arquivo `navegador.iife.js` do core, ou o subpath `/navegador` com bundler | `window.__botaiNavegador.preencher(document, pessoa, hoje, { segundaPassada: true })`          |

O que cada linha tem de prova:

- **Extensão:** as duas lojas estão no ar com a versão 1.2.0, e o E2E roda no Chromium.
- **Imagem:** as duas arquiteturas estão publicadas; a linux/arm64 rodou na auditoria.
- **Binários:** o darwin-arm64 rodou na auditoria.
- **Motor:** provado no Playwright sem o fixture e no CDP puro, o protocolo do Puppeteer.

:::note[Documentado]

No Firefox, no Edge e no Opera reais, o comportamento da extensão vem de checklists manuais, não de E2E. O Opera 109+ está em revisão na loja. Os binários de darwin-x64, Linux e Windows passam pela fumaça do CI do projeto nos 6 runners; a auditoria de 2026-10-08 não os rodou.

:::

:::caution[Não testado]

Ninguém rodou o motor com Puppeteer, Selenium, Cypress ou WebdriverIO. As páginas de [Integrações](./integracoes/puppeteer.md) para essas ferramentas são receitas, montadas a partir do que foi provado no Playwright e no CDP.

:::

## Por onde seguir

- [Escolha a sua porta](./comecar/escolha-sua-porta.md): o que você quer fazer e qual porta usar.
- [Primeira pessoa](./comecar/primeira-pessoa.md): a mesma pessoa pela CLI, pelo HTTP, pela imagem e pela biblioteca.
- [Instalação](./comecar/instalacao.md): npx, npm, imagem, `install.sh`, download manual e lojas.
- [A pessoa](./conceitos/a-pessoa.md) e [Semente e hoje](./conceitos/semente-e-hoje.md): o que sai e como reproduzir.
- [Limites](./limites.md): o que o Botaí não faz.
