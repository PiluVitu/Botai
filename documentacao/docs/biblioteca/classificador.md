---
title: Classificador de campos
description: classificarFormulario, valorPara e LIMIAR, o classificador de campos do motor, para montar um preenchimento próprio.
sidebar_position: 6
---

O classificador é a parte do motor que olha um campo de formulário e decide o que ele pede: nome, CPF, CEP, validade do cartão. É o mesmo da extensão, do fixture do Playwright e do `navegador.iife.js`. Use-o direto quando quiser montar o seu próprio preenchimento, fora do DOM ou com regras suas.

| Subpath            | Exporta                                                       |
| ------------------ | ------------------------------------------------------------- |
| `/campos`          | `classificarFormulario(descritores, hojeISO)`, `LIMIAR` (0.5) |
| `/campos-formatar` | `valorPara(kind, pessoa, descritor, dicas)`                   |

## O descritor de um campo

O classificador não lê o DOM: ele recebe, para cada campo, um objeto com o que se vê dele.

| Chave          | Valor                                                       |
| -------------- | ----------------------------------------------------------- |
| `tag`          | `'input'`, `'select'` ou `'textarea'`                       |
| `type`         | o `type` do campo (`'text'`, `'email'`, `'tel'`, `'date'`…) |
| `name`, `id`   | os atributos, ou `''`                                       |
| `autocomplete` | o atributo, ou `''`                                         |
| `placeholder`  | o atributo, ou `''`                                         |
| `label`        | o texto do `<label>`, ou `''`                               |
| `ariaLabel`    | o `aria-label`, ou `''`                                     |
| `maxLength`    | o número, ou `null` sem o atributo                          |
| `options`      | só no `select`: a lista de `{ value, text }`                |

:::note[Documentado]

O tipo `FieldDescriptor` (no `.d.ts` de `/campos`) tem ainda `inputMode`, `pattern` e `section` (o texto da `<legend>` do `fieldset`), todos opcionais. O exemplo abaixo não os usa, e eles não foram exercitados fora do motor.

:::

## Classificar e escolher o valor

`classificarFormulario` recebe o formulário inteiro, porque o vizinho conta: um "Número" logo depois do CEP é o número do endereço. Para cada descritor, devolve `null` (não reconhecido) ou `{ kind, confianca, via, dicas? }`. Depois, `valorPara` escolhe o valor da pessoa no formato que cabe no campo.

```js
import { gerarPessoa } from '@pilutech/botai-core'
import { LIMIAR, classificarFormulario } from '@pilutech/botai-core/campos'
import { valorPara } from '@pilutech/botai-core/campos-formatar'

const campo = (extra) => ({
  tag: 'input',
  type: 'text',
  name: '',
  id: '',
  autocomplete: '',
  placeholder: '',
  label: '',
  ariaLabel: '',
  maxLength: null,
  ...extra,
})

const formulario = [
  campo({ label: 'Nome completo' }),
  campo({ label: 'CPF', type: 'tel', maxLength: 14 }),
  campo({ name: 'cpf_num', maxLength: 11 }),
  campo({ label: 'Celular com DDD' }),
  campo({ autocomplete: 'email', type: 'email' }),
  campo({
    label: 'Estado',
    tag: 'select',
    options: [
      { value: '', text: 'Selecione' },
      { value: 'MA', text: 'Maranhão' },
      { value: 'SP', text: 'São Paulo' },
    ],
  }),
  campo({ label: 'Telefone fixo' }),
  campo({ label: 'Cor favorita' }),
]

const hoje = '2026-10-05'
const pessoa = gerarPessoa({ semente: 42, hoje })
const classes = classificarFormulario(formulario, hoje)

formulario.forEach((d, i) => {
  const c = classes[i]
  const rotulo = d.label || d.name || d.autocomplete
  if (c === null) return console.log(`${rotulo}: não reconhecido`)
  const valor =
    c.kind === 'ignorar' ? null : valorPara(c.kind, pessoa, d, c.dicas)
  console.log(
    `${rotulo}: ${c.kind} (${c.confianca} via ${c.via}) = ${JSON.stringify(valor)}`,
  )
})
console.log('LIMIAR', LIMIAR)
```

```text
Nome completo: nomeCompleto (0.96 via label) = "Márcio Carvalho Rodrigues"
CPF: cpf (0.97 via label) = "634.132.403-07"
cpf_num: cpf (0.92 via name) = "63413240307"
Celular com DDD: celular (0.92 via label) = "(98) 97702-9128"
email: email (1 via autocomplete) = "marcio-rodrigues-0337@tuamaeaquelaursa.com"
Estado: uf (0.9 via label) = "MA"
Telefone fixo: não reconhecido
Cor favorita: não reconhecido
LIMIAR 0.5
```

O que o exemplo mostra:

- **`kind`** é um dos 38 tipos de campo ([Campos reconhecidos](../referencia/campos-reconhecidos.md)).
- **`via`** diz o que decidiu: `autocomplete`, `label`, `ariaLabel`, `name`, `id`, `placeholder`, `formato`, `tipo`, `opcoes` ou `contexto`.
- **`valorPara`** adapta o valor ao campo: o CPF com `maxLength` 11 recebe só os dígitos, e o `select` de estado recebe o `value` da opção da UF da pessoa.
- **"Telefone fixo"** fica de fora de propósito: a pessoa só tem celular. "Telefone", sem o "fixo", recebe o celular.
- **"Cor favorita"** não é um campo que o Botaí conheça. Não há chute: fica `null`, e o motor o lista em `naoReconhecidos`.

Num formulário sintético de 19 campos, o classificador reconheceu 17.

## O que o motor faz com o resultado

O motor do navegador usa estas mesmas funções. Para cada campo:

1. `null` vai para `naoReconhecidos`;
2. um valor que não cabe no campo (o `maxLength`, sem truncar, ou um `select` sem a opção da pessoa) vai para `recusados`;
3. o resto é escrito e vai para `preenchidos`.

:::note[Documentado]

Lido no código de `/campos` e do motor, sem teste próprio: o `LIMIAR` é a confiança mínima (abaixo dele, o campo sai `null`), e `kind` também pode ser `'ignorar'`, um campo reconhecido que fica de fora das três listas.

:::

Para preencher uma página de verdade, use o motor pronto: [O navegador.iife.js](../navegador/iife.md) ou [ESM com bundler](../navegador/esm-com-bundler.md).
