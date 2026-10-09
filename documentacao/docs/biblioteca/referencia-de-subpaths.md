---
title: Referência de subpaths
description: As 25 entradas de exports do @pilutech/botai-core, com os 23 módulos, o esquema JSON do envelope e o navegador.iife.js.
sidebar_position: 8
---

O pacote `@pilutech/botai-core` 0.4.1 tem 25 entradas em `exports`: 23 módulos (a raiz e 22 subpaths), o esquema JSON do envelope e o `navegador.iife.js`. Os 23 módulos foram importados no Node 22.22.3, no Bun 1.3.14 e no Deno 2.7.14.

Importe pelo nome do pacote mais o subpath:

```js
import { gerarPessoa } from '@pilutech/botai-core'
import { validarCPF } from '@pilutech/botai-core/cpf'
```

## A raiz e os dados da pessoa

| Subpath           | Exporta                                                                                                                                                                                                              | Página                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| (raiz)            | `gerarPessoa`, `gerarPessoas`, `gerarEnvelopeDaPessoa`, `gerarEnvelopeDasPessoas`, `hojeEmSaoPaulo`, `rngDeSemente`, `sementeAleatoria`, `ErroDeOpcao`, `LIMITE_DO_LOTE`, `FORMATO`, `MOTOR`, `DOMINIO_EMAIL_PADRAO` | [Gerar uma pessoa](./gerar-pessoa.md), [Gerar um lote](./gerar-pessoas.md) |
| `/pessoa`         | `montarPessoa`                                                                                                                                                                                                       | —                                                                          |
| `/cpf`            | `gerarCPF`, `validarCPF`                                                                                                                                                                                             | [Documentos](./documentos.md)                                              |
| `/cnpj`           | `gerarCNPJ`, `validarCNPJ`                                                                                                                                                                                           | [Documentos](./documentos.md)                                              |
| `/rg`             | `gerarRG`, `validarRG`, `dvRGSP`, `formatarRG`                                                                                                                                                                       | [Documentos](./documentos.md)                                              |
| `/pis`            | `gerarPIS`, `validarPIS`, `dvPIS`                                                                                                                                                                                    | [Documentos](./documentos.md)                                              |
| `/titulo-eleitor` | `gerarTituloEleitor`, `validarTituloEleitor`, `dvsTitulo`                                                                                                                                                            | [Documentos](./documentos.md)                                              |
| `/celular`        | `gerarCelular`                                                                                                                                                                                                       | [Documentos](./documentos.md)                                              |
| `/endereco`       | `gerarEndereco`, `LOGRADOUROS`, `sortearNumero`                                                                                                                                                                      | [Documentos](./documentos.md)                                              |
| `/cartao`         | `gerarCartao`, `luhnValido`, `CARTOES_TESTE`, `formatarNumeroCartao`                                                                                                                                                 | [Documentos](./documentos.md)                                              |
| `/nascimento`     | `gerarNascimento`, `lerDataISO`, `calcularIdade`, `formatarISO`, `formatarBR`                                                                                                                                        | [Documentos](./documentos.md)                                              |
| `/senha`          | `gerarSenha`, `senhaAtendeRegrasComuns`, `MAIUSCULAS`, `MINUSCULAS`, `DIGITOS`, `SIMBOLOS`                                                                                                                           | [Documentos](./documentos.md)                                              |
| `/nome`           | `gerarNome`, `gerarEmail`, `nomeNoCartao`, `slugNome`, `removerAcentos`, `PRENOMES_F`, `PRENOMES_M`, `SOBRENOMES`, `DOMINIO_EMAIL`                                                                                   | [Documentos](./documentos.md)                                              |
| `/empresa`        | `gerarEmpresa`, `RAMOS`, `SUFIXOS_FANTASIA`                                                                                                                                                                          | [Documentos](./documentos.md)                                              |
| `/uf`             | `UFS`, `REGIAO_FISCAL_CPF`, `CODIGO_UF_TITULO`, `UF_NOME`                                                                                                                                                            | [Documentos](./documentos.md)                                              |
| `/aleatorio`      | `escolher`, `embaralhar`, `digitosAleatorios`, `somenteDigitos`, `rngPadrao`                                                                                                                                         | —                                                                          |
| `/prng`           | `sfc32`, `seedFromBytes`                                                                                                                                                                                             | —                                                                          |

## Saídas, classificador e servidor

| Subpath            | Exporta                                                                                                                                                                | Página                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `/plano`           | `pessoaPlana`, `COLUNAS`, `lerCampos`, `paraCsv`, `cabecalhoCsv`, `linhaCsv`, `paraSql`, `insertSql`, `lerTabela`, `lerDialeto`, `FORMATOS`, `DIALETOS`, `ErroDoPlano` | [Visão plana, CSV e SQL](./plano-csv-sql.md)              |
| `/campos`          | `classificarFormulario`, `classificarCampo`, `LIMIAR`, `campoAutocomplete`, `normalizar`                                                                               | [Classificador de campos](./classificador.md)             |
| `/campos-formatar` | `valorPara`, `caber`, `escolherOpcao`                                                                                                                                  | [Classificador de campos](./classificador.md)             |
| `/atalhos`         | `ATALHOS`, `TECLAS_DO_MANIFESTO`, `teclaNoMac`                                                                                                                         | [Preencher a página](../extensao/preencher-a-pagina.md)   |
| `/servidor`        | `responder`, `criarServidor`, `iniciarServidor`, `PORTA_PADRAO`, `HOST_PADRAO`, `LIMITE_DE_PESSOAS`, `ROTAS`, `TIPO_POR_FORMATO` (só Node)                             | [Servidor como biblioteca](./servidor-como-biblioteca.md) |

## O motor no navegador

| Entrada              | Exporta                                                                                                                                                                                                                    | Página                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `/navegador`         | `preencherNaPagina`, `preencherDocumento`, `criarRegistro`, `SEM_CONTORNOS`, `instalarNoGlobal`, `NOME_DO_GLOBAL`, `SEGUNDA_PASSADA_MS` e as funções de baixo nível do DOM (`campos`, `descrever`, `escrever`, `visivel`…) | [ESM com bundler](../navegador/esm-com-bundler.md), [Shadow DOM](../navegador/shadow-dom.md) |
| `/navegador.iife.js` | um script, não um módulo: cria o global `__botaiNavegador`                                                                                                                                                                 | [O navegador.iife.js](../navegador/iife.md)                                                  |

## O esquema do envelope

| Entrada                            | O que é                                                                                                                 | Página                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `/esquema/envelope-v1.schema.json` | o JSON Schema 2020-12 do envelope (`formato` é a const 1; `additionalProperties: false` em todos os objetos; sem `$id`) | [Envelope e esquema](../conceitos/envelope-e-esquema.md) |

:::note[Documentado]

Os nomes das tabelas acima são a lista de exportações do próprio pacote 0.4.1, conferida importando cada subpath. Os que não aparecem em nenhuma página desta documentação (como `montarPessoa`, `slugNome`, `seedFromBytes`, `TECLAS_DO_MANIFESTO` e as funções de baixo nível do `/navegador`) foram importados, mas nenhum teste desta documentação os exercitou.

:::
