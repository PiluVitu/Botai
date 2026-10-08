---
title: Documentos e geradores avulsos
sidebar_label: Documentos
description: Geradores e validadores por subpath, para CPF, CNPJ, RG, PIS, título de eleitor, celular, endereço, cartão, nascimento, senha, nome e empresa.
sidebar_position: 4
---

Cada peça da pessoa tem o seu subpath, com o gerador e, nos documentos, o validador. Use quando precisar de um valor solto, de um validador sem dependência ou de uma pessoa montada à mão (sexo, idade ou cidade fixos, que a raiz não oferece).

## O gerador `rng`

Os geradores recebem um `rng` como primeiro parâmetro. Passe `rngDeSemente(semente)`, da raiz, e a sequência se repete. Sem o `rng`, o valor muda a cada chamada.

```js
import { rngDeSemente } from '@pilutech/botai-core'
import { gerarCPF, validarCPF } from '@pilutech/botai-core/cpf'
import { gerarCNPJ, validarCNPJ } from '@pilutech/botai-core/cnpj'

const rng = rngDeSemente('documentos')
const cpf = gerarCPF(rng, 'PI')
const cnpj = gerarCNPJ(rng)
console.log(cpf, validarCPF(cpf))
console.log(cnpj, validarCNPJ(cnpj))
```

```text
839.192.433-58 true
97.447.653/0001-55 true
```

Um `rng` avança a cada valor: a ordem das chamadas faz parte do resultado. Cada gerador de documento (CPF, CNPJ, RG, PIS e título) deu 20 000 valores válidos em 20 000 no próprio validador.

## Documentos

| Subpath           | Exporta                                                                                | Formato gerado                                                 |
| ----------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `/cpf`            | `gerarCPF(rng?, uf?)`, `validarCPF(v)`                                                 | `NNN.NNN.NNN-NN`; com `uf`, o 9º dígito é a região fiscal dela |
| `/cnpj`           | `gerarCNPJ(rng?)`, `validarCNPJ(v)`                                                    | `NN.NNN.NNN/0001-NN` (sempre a filial 0001)                    |
| `/rg`             | `gerarRG(rng?, { permitirX? })`, `validarRG(v)`, `dvRGSP`, `formatarRG`                | `NN.NNN.NNN-D`, modelo SSP-SP                                  |
| `/pis`            | `gerarPIS(rng?)`, `validarPIS(v)`, `dvPIS`                                             | `NNN.NNNNN.NN-N`                                               |
| `/titulo-eleitor` | `gerarTituloEleitor(rng?, uf \| 'ZZ')`, `validarTituloEleitor(v, regra?)`, `dvsTitulo` | `NNNN NNNN NNNN`; os dígitos 9 e 10 são o código da UF         |

```js
import { rngDeSemente } from '@pilutech/botai-core'
import { gerarRG, validarRG } from '@pilutech/botai-core/rg'
import { gerarPIS, validarPIS } from '@pilutech/botai-core/pis'
import {
  gerarTituloEleitor,
  validarTituloEleitor,
} from '@pilutech/botai-core/titulo-eleitor'

const rng = rngDeSemente('documentos')
const rg = gerarRG(rng)
const comX = gerarRG(rng, { permitirX: true })
const pis = gerarPIS(rng)
const titulo = gerarTituloEleitor(rng, 'PI')
const exterior = gerarTituloEleitor(rng, 'ZZ')
console.log(rg, validarRG(rg), comX)
console.log(pis, validarPIS(pis))
console.log(
  titulo,
  validarTituloEleitor(titulo),
  validarTituloEleitor(titulo, 'sem-excecao'),
)
console.log(exterior)
```

```text
83.919.243-5 true 09.744.765-1
135.15196.06-3 true
0479 0958 1570 true true
6310 1628 2879
```

- **Validadores:** aceitam o valor com ou sem máscara (`validarCPF('63413240307')` também dá `true`) e devolvem `true` ou `false`.
- **CNPJ:** só numérico. O CNPJ alfanumérico (vigente desde julho de 2026) não é gerado, e `validarCNPJ` o recusa.
- **RG:** não há padrão nacional; o Botaí usa o modelo SSP-SP em qualquer UF. Por padrão o dígito verificador nunca é `X`; `{ permitirX: true }` libera.
- **Título de eleitor:** `uf` é uma das 27 siglas ou `'ZZ'` (exterior, código 28); sem ela, SP. O número gerado vale nas duas leituras da regra de SP e MG: `validarTituloEleitor(v)` usa `'com-excecao-sp-mg'`, e `'sem-excecao'` é a outra. Nas 27 UFs, 13 500 títulos em 13 500 saíram válidos nas duas regras e com o código certo.

:::tip

Passe sempre uma das 27 siglas, em maiúsculas (a lista é `UFS`, do subpath `/uf`). Quem confere a UF é a raiz: `gerarPessoa` recusa sigla inválida com `ErroDeOpcao`.

:::

## Contato, endereço e cartão

| Subpath     | Exporta                                                             | Observação                                                                                          |
| ----------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `/celular`  | `gerarCelular(rng?, ddd = '11')`                                    | sempre celular (sem fixo); confere só o formato do DDD, sem lista de DDDs que existem               |
| `/endereco` | `gerarEndereco(rng?, uf?)`, `LOGRADOUROS`                           | um dos 34 CEPs reais, com o número dentro da faixa e do lado da rua                                 |
| `/cartao`   | `gerarCartao(rng, hojeISO, titular)`, `luhnValido`, `CARTOES_TESTE` | só os dois cartões de teste da Stripe; validade de 12 a 59 meses depois de `hoje`; CVV de 100 a 999 |

```js
import { rngDeSemente } from '@pilutech/botai-core'
import { gerarCelular } from '@pilutech/botai-core/celular'
import { gerarEndereco, LOGRADOUROS } from '@pilutech/botai-core/endereco'
import {
  CARTOES_TESTE,
  gerarCartao,
  luhnValido,
} from '@pilutech/botai-core/cartao'

const rng = rngDeSemente('documentos')
const endereco = gerarEndereco(rng, 'PI')
const celular = gerarCelular(rng, endereco.ddd)
const cartao = gerarCartao(rng, '2026-10-05', 'FULANO DE TAL')
console.log(endereco)
console.log(celular.formatado, LOGRADOUROS.length)
console.log(cartao, luhnValido(cartao.numero), CARTOES_TESTE.length)
```

```text
{
  cep: '64000-020',
  logradouro: 'Avenida Frei Serafim',
  bairro: 'Centro',
  cidade: 'Teresina',
  uf: 'PI',
  ddd: '86',
  numero: '103',
  complemento: 'Apto 144'
}
(86) 99243-0974 34
{
  bandeira: 'visa',
  numero: '4242424242424242',
  numeroFormatado: '4242 4242 4242 4242',
  titular: 'FULANO DE TAL',
  validade: '03/28',
  mes: '03',
  ano: '28',
  cvv: '606'
} true 2
```

O DDD do celular de uma pessoa é o do CEP: para manter a coerência numa pessoa montada à mão, passe `endereco.ddd` ao `gerarCelular`, como acima. Os cartões são o Visa `4242424242424242` e o Mastercard `5555555555554444`; não há Elo, Amex nem Hipercard.

## Nome, nascimento, senha e empresa

| Subpath       | Exporta                                                    | Observação                                                        |
| ------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| `/nome`       | `gerarNome(rng?)`                                          | 20 prenomes femininos, 20 masculinos, 30 sobrenomes               |
| `/nascimento` | `gerarNascimento(rng?, hojeISO, { idadeMin?, idadeMax? })` | idade de 18 a 65 sem a faixa                                      |
| `/senha`      | `gerarSenha(rng?, tamanho?)`                               | 12 caracteres sem o tamanho; aceita de 12 a 16; começa por letra  |
| `/empresa`    | `gerarEmpresa(rng?, sobrenomes?)`                          | razão social e nome fantasia dos sobrenomes; CNPJ com filial 0001 |

```js
import { rngDeSemente } from '@pilutech/botai-core'
import { gerarNascimento } from '@pilutech/botai-core/nascimento'
import { gerarSenha } from '@pilutech/botai-core/senha'
import { gerarNome } from '@pilutech/botai-core/nome'
import { gerarEmpresa } from '@pilutech/botai-core/empresa'

const rng = rngDeSemente('documentos')
const nome = gerarNome(rng)
console.log(nome)
console.log(gerarNascimento(rng, '2026-10-05', { idadeMin: 30, idadeMax: 40 }))
console.log(gerarSenha(rng, 16))
console.log(gerarEmpresa(rng, nome.sobrenomes))
```

```text
{
  sexo: 'F',
  prenome: 'Isabela',
  sobrenomes: [ 'Conceição', 'Carvalho' ],
  completo: 'Isabela Conceição Carvalho',
  noCartao: 'ISABELA C CARVALHO'
}
{ iso: '1993-06-13', br: '13/06/1993', idade: 33 }
Heu@58&$eCv4WrpZ
{
  razaoSocial: 'Conceição & Carvalho Consultoria Ltda',
  nomeFantasia: 'Carvalho Tech',
  cnpj: '16.285.582/0001-30'
}
```

## Tabelas de apoio

| Subpath      | Exporta                                        | O que é                                                                            |
| ------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| `/uf`        | `UFS`, `REGIAO_FISCAL_CPF`, `CODIGO_UF_TITULO` | as 27 siglas, o 9º dígito do CPF por UF (Receita) e o código da UF no título (TSE) |
| `/prng`      | `sfc32`                                        | o gerador por trás de `rngDeSemente`                                               |
| `/aleatorio` | utilitários de sorteio                         | usados pelos geradores                                                             |

```js
import {
  CODIGO_UF_TITULO,
  REGIAO_FISCAL_CPF,
  UFS,
} from '@pilutech/botai-core/uf'

console.log(
  UFS.length,
  REGIAO_FISCAL_CPF.PI,
  CODIGO_UF_TITULO.PI,
  CODIGO_UF_TITULO.ZZ,
)
```

```text
27 3 15 28
```

As fontes de cada tabela estão em [Os dados por trás](../conceitos/dados-por-tras.md).

## Pela CLI

Os mesmos geradores e validadores existem na CLI:

```bash testar
botai cpf --formatado --uf PI
botai validar cnpj 35.728.569/0001-52
```

Veja [Geradores avulsos](../cli/geradores-avulsos.md) e [Validar documentos](../cli/validar.md).
