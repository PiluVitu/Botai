---
title: Escolha a sua porta
description: O que você quer fazer e qual porta do Botaí usar, do QA manual no navegador ao seed de banco e ao CI.
sidebar_position: 1
---

Todas as portas geram a mesma pessoa a partir da mesma semente e do mesmo dia. A escolha depende só de onde você está.

## Quero isto, uso aquilo

| Quero                                                                  | Uso                                                                                                  |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| preencher um cadastro no navegador, à mão                              | a extensão: [preencher a página](../extensao/preencher-a-pagina.md) (modo A)                         |
| pôr um CPF, um CEP ou um e-mail num campo que não foi reconhecido      | a extensão: [inserir um campo](../extensao/inserir-um-campo.md) (modo B)                             |
| um CPF ou um celular no terminal, sem navegador                        | a CLI: [geradores avulsos](../cli/geradores-avulsos.md)                                              |
| conferir um documento num script de shell                              | a CLI: [validar](../cli/validar.md)                                                                  |
| semear um banco Postgres, SQLite ou MySQL                              | a CLI: [receitas de banco](../cli/receitas-de-banco.md)                                              |
| dados de teste em Python, Go, Java ou outra linguagem                  | o [servidor HTTP](../servidor/api-http.md), pelo Node, pela imagem ou pelo binário                   |
| uma pessoa num teste unitário em JS ou TS                              | a biblioteca: [gerar uma pessoa](../biblioteca/gerar-pessoa.md)                                      |
| validar CPF, CNPJ, RG, PIS, título ou cartão no front, sem dependência | a biblioteca: [documentos](../biblioteca/documentos.md)                                              |
| preencher formulários num E2E com Playwright                           | o fixture: [o fixture](../playwright/o-fixture.md)                                                   |
| preencher formulários com Puppeteer, Selenium, Cypress ou WebdriverIO  | o motor: [o navegador.iife.js](../navegador/iife.md) e as [integrações](../integracoes/puppeteer.md) |
| testar um formulário em jsdom (Jest ou Vitest)                         | o motor: [jsdom](../navegador/jsdom.md)                                                              |
| rodar o Botaí num runner sem Node                                      | o [binário](../binarios/install-sh.md) ou a [imagem](../docker/imagem.md)                            |
| um serviço no CI                                                       | a imagem: [GitHub Actions](../docker/github-actions.md)                                              |
| um contrato entre linguagens                                           | o [JSON Schema do envelope](../conceitos/envelope-e-esquema.md)                                      |

:::caution[Não testado]

Ninguém rodou o motor com Puppeteer, Selenium (Python, Java ou C#), Cypress ou WebdriverIO: as integrações dessas ferramentas são receitas. O que foi provado é o Playwright sem o fixture e o CDP puro, o protocolo do Puppeteer.

:::

## Por perfil

### QA manual

Use a **extensão**.

- Um atalho preenche o cadastro inteiro com uma pessoa coerente: CPF e CNPJ válidos, CEP real com rua, bairro e cidade que batem, e celular com o DDD da cidade.
- Num fluxo de várias etapas (cadastro, endereço, pagamento), a mesma pessoa fica guardada, e o atalho repreenche cada página.
- Campo que não foi reconhecido: botão direito › Botaí › Inserir › CPF, E-mail, CEP… (23 tipos).
- Confirmação por e-mail: "Abrir caixa de entrada" abre a caixa pública da pessoa.
- Dados avulsos: o popup copia qualquer um dos 24 valores, mesmo em página que a extensão não pode preencher.
- Sem navegador: `botai cpf --formatado --uf PI` e `botai celular --formatado` no terminal.

```bash testar
botai cpf --formatado --uf PI
botai celular --formatado
```

O que a extensão não faz: marcar checkbox, preencher campos que só habilitam depois da busca de CEP e preencher iframe de pagamento de outro domínio. A lista completa está em [Limites](../limites.md).

### Dev frontend

Use a **extensão** no localhost, a **biblioteca** e o **motor**.

- Teste o seu formulário com React, Vue, imask, jQuery Mask ou maska: o valor chega ao estado do framework e a validação no blur dispara.
- O popup lista os campos não reconhecidos com rótulo e seletor CSS, para você ajustar o `autocomplete` e os labels.
- Valide documentos no front sem dependência: `validarCPF`, `validarCNPJ`, `validarRG`, `validarPIS`, `validarTituloEleitor` e `luhnValido`.
- Teste o formulário em jsdom (Jest ou Vitest) com o `navegador.iife.js` e o shim de layout.
- Use uma pessoa reprodutível no teste unitário: `gerarPessoa({ semente: 'cadastro-1', hoje: '2026-10-05' })`.

### QA de automação

Use o **fixture do Playwright**, o **motor**, a **CLI** e o **servidor**.

- `await botai.preencher(page)` em cadastro, checkout e onboarding. Funciona em todos os frames, com CSP estrita, React controlado e CEP que sobrescreve.
- Preencha só uma seção com um Locator e deixe o resto para o teste.
- Guarda de regressão: `expect(r.naoReconhecidos).toEqual([])` avisa quando aparece um campo novo sem rótulo reconhecível.
- Reproduza uma falha do CI: a anotação `botai-semente` e o anexo `botai-pessoa.json` dão a pessoa exata, e a CLI a recria fora do Playwright ([como](../playwright/reproduzir-uma-falha.md)).
- Matriz entre navegadores: uma pessoa por navegador por padrão, ou a mesma em todos com `botaiSemente`.
- Teste visual: o preenchimento não deixa contorno.
- Fora do Playwright, a pessoa vem da CLI ou do servidor, e o motor vai como texto para a página. Essas são as receitas não testadas do aviso do começo da página ([Selenium](../integracoes/selenium.md), por exemplo).

### Backend semeando banco

Use a **CLI**, o **servidor**, a **imagem** e a **biblioteca**.

- Os mesmos 1000 INSERTs saem em qualquer máquina, com e-mail, CPF e CNPJ únicos, compatíveis com colunas UNIQUE. O SQL traz só INSERTs: crie a tabela antes.

  ```bash
  npx -y @pilutech/botai-core@0.4.1 pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql | psql "$DATABASE_URL"
  ```

- CSV para o `\copy` do Postgres, para planilha ou BI, com as colunas que você escolhe: `--campos nome,cpf,email`.
- Fixtures SQLite reproduzíveis: `--dialeto sqlite`.
- Carga e volume: 100 000 pessoas em cerca de 2 s, em cerca de 130 MiB de memória com ndjson, csv ou sql (medido em 2026-10-08, macOS arm64, Node 22.22.3; veja [os números](../referencia/numeros.md)).
- Teste de regra por estado: `--uf PI` amarra CEP, cidade, DDD, região fiscal do CPF e código do título.
- Pela biblioteca: `paraSql(gerarPessoas(10000, { semente: 'carga', hoje: '2026-10-05' }), { dialeto: 'postgres', tabela: 'public.pessoas' })`.

```bash testar
botai pessoas -n 3 --semente carga --hoje 2026-10-05 --uf PI --formato csv --campos nome,cpf,cep,cidade
```

```csv
nome,cpf,cep,cidade
Felipe Ferreira Alves,742.362.593-03,64000-020,Teresina
Júlia Ribeiro Carvalho,107.696.433-88,64000-020,Teresina
Gabriela Pereira Monteiro,650.058.033-86,64000-020,Teresina
```

O 9º dígito de cada CPF é 3, a região fiscal do Piauí. Com `--uf PI`, o lote inteiro cai no único CEP do Piauí que o Botaí conhece (veja [os dados por trás](../conceitos/dados-por-tras.md)).

### CI

Use o **npx** com a versão exata, a **imagem**, o **binário** e o **fixture**.

- Seed de banco num passo do workflow, com `npx` e a versão exata, ou com o binário num runner sem Node.
- Gates de shell: `botai validar cpf "$v" && …` (0 válido, 1 inválido, 2 erro de uso).
- O ndjson traz a semente de cada linha (`lote/7`, `mil-3/971/2`), para recriar uma pessoa só de um lote que falhou.
- O fixture do Playwright no CI: as anotações e o anexo levam a pessoa de cada falha para o relatório.
- Contrato entre linguagens: valide o envelope com o JSON Schema 2020-12 que vai no pacote.
- A imagem fica `healthy` em 1 a 2 s e para em menos de 0,4 s (medido em 2026-10-08, Docker no macOS arm64), o que serve a um service container.

```bash testar
v=634.132.403-07
botai validar cpf "$v" && echo "CPF de teste aceito"
```

```text
válido
CPF de teste aceito
```

:::note[Documentado]

O uso da imagem como service container do GitHub Actions vem do README do core e do CI do próprio projeto; a auditoria de 2026-10-08 não reproduziu. Veja [GitHub Actions](../docker/github-actions.md).

:::
