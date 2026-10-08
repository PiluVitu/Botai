---
title: Campos reconhecidos
description: Os 38 tipos de campo que o classificador reconhece, as vias de reconhecimento, o valor que cada tipo recebe e o que fica de fora.
sidebar_position: 2
---

O classificador do Botaí reconhece **38 tipos de campo**. É o mesmo classificador na extensão (modo A), no fixture do Playwright, no `navegador.iife.js` e no subpath `/campos` da biblioteca. A contagem vem do tipo `FieldKind`, em `packages/core/src/campos.ts`; a biblioteca o exporta como tipo de `@pilutech/botai-core/campos`.

## Como ele reconhece

O classificador olha cada campo por estas vias, nesta ordem:

1. o atributo `autocomplete`;
2. o texto do `<label>`;
3. o `aria-label`;
4. o `name`;
5. o `id`;
6. o `placeholder`;
7. o formato do valor;
8. o `type` do campo;
9. as opções de um `<select>`;
10. o contexto, como os campos vizinhos (um "Número" logo depois do CEP é o número do endereço).

Campo que nenhuma via reconhece fica de fora, sem chute, e vai para a lista `naoReconhecidos`. Para que um campo seu seja reconhecido, o caminho mais firme é um `autocomplete` padrão ou um `<label>` claro.

## Os 38 tipos

A coluna "Recebe" diz o valor da pessoa que vai para o campo. Quando o valor com máscara não cabe no `maxlength`, vai o valor só com dígitos; o que não cabe de jeito nenhum vai para `recusados`.

:::note[Documentado]

A coluna "Recebe" foi lida no código de `valorPara` (`packages/core/src/campos-formatar.ts`). O que foi testado é a contagem dos 38 tipos e o preenchimento de um cadastro realista (21 de 23 campos), não cada linha desta tabela.

:::

### Pessoa e documentos

| Tipo            | O campo pede                         | Recebe                                                               |
| --------------- | ------------------------------------ | -------------------------------------------------------------------- |
| `nomeCompleto`  | nome completo                        | `nome.completo`                                                      |
| `primeiroNome`  | prenome                              | `nome.prenome`                                                       |
| `sobrenome`     | sobrenome                            | os sobrenomes, separados por espaço                                  |
| `nascimento`    | data de nascimento                   | `nascimento.br` (`DD/MM/AAAA`); num `type=date`, `nascimento.iso`    |
| `nascimentoDia` | dia do nascimento, em campo separado | o dia (`DD`)                                                         |
| `nascimentoMes` | mês do nascimento, em campo separado | o mês (`MM`); num `select`, a opção do mês, pelo número ou pelo nome |
| `nascimentoAno` | ano do nascimento, em campo separado | o ano (`AAAA`, ou `AA` se só couber isso)                            |
| `sexo`          | sexo                                 | `F` ou `M`; num `select`, a opção (Feminino, Masculino…)             |
| `cpf`           | CPF                                  | `cpf`                                                                |
| `rg`            | RG                                   | `rg.numero`                                                          |
| `pis`           | PIS/NIS                              | `pis`                                                                |
| `tituloEleitor` | título de eleitor                    | `tituloEleitor`                                                      |

### Contato e conta

| Tipo               | O campo pede           | Recebe                                                       |
| ------------------ | ---------------------- | ------------------------------------------------------------ |
| `celular`          | celular ou telefone    | `celular.formatado`; com o DDD num campo separado, sem o DDD |
| `ddd`              | DDD, em campo separado | `celular.ddd`                                                |
| `email`            | e-mail                 | `email.endereco`                                             |
| `emailConfirmacao` | confirmação do e-mail  | `email.endereco`                                             |
| `senha`            | senha                  | `senha`                                                      |
| `senhaConfirmacao` | confirmação da senha   | `senha`                                                      |
| `usuario`          | nome de usuário        | `email.usuario`                                              |

### Endereço

| Tipo               | O campo pede                  | Recebe                                                              |
| ------------------ | ----------------------------- | ------------------------------------------------------------------- |
| `cep`              | CEP                           | `endereco.cep`                                                      |
| `logradouro`       | rua                           | `endereco.logradouro`; sem campo de número na página, "rua, número" |
| `numeroEndereco`   | número                        | `endereco.numero`                                                   |
| `complemento`      | complemento                   | `endereco.complemento`                                              |
| `bairro`           | bairro                        | `endereco.bairro`                                                   |
| `cidade`           | cidade                        | `endereco.cidade`                                                   |
| `uf`               | estado (UF)                   | a sigla; num `select`, a opção pela sigla ou pelo nome do estado    |
| `cidadeUf`         | cidade e UF num campo só      | `Cidade / UF`                                                       |
| `pais`             | país                          | `Brasil`, ou `BR` num campo de até 3 caracteres                     |
| `enderecoCompleto` | endereço inteiro num campo só | rua, número, complemento, bairro, cidade, UF e CEP                  |

### Empresa

| Tipo           | O campo pede  | Recebe                 |
| -------------- | ------------- | ---------------------- |
| `razaoSocial`  | razão social  | `empresa.razaoSocial`  |
| `nomeFantasia` | nome fantasia | `empresa.nomeFantasia` |
| `cnpj`         | CNPJ          | `empresa.cnpj`         |

### Cartão

| Tipo                | O campo pede                       | Recebe                                                 |
| ------------------- | ---------------------------------- | ------------------------------------------------------ |
| `cartaoNumero`      | número do cartão                   | `cartao.numeroFormatado`                               |
| `cartaoNome`        | nome impresso no cartão            | `cartao.titular`                                       |
| `cartaoValidade`    | validade num campo só              | `cartao.validade` (`MM/AA`)                            |
| `cartaoValidadeMes` | mês da validade, em campo separado | `cartao.mes`                                           |
| `cartaoValidadeAno` | ano da validade, em campo separado | o ano com 4 dígitos, ou `cartao.ano` se só couber isso |
| `cartaoCvv`         | CVV                                | `cartao.cvv`                                           |

Os campos e formatos da pessoa estão em [A pessoa](../conceitos/a-pessoa.md).

## O que fica de fora

Não reconhecidos (vão para `naoReconhecidos`), por exemplo: "Idade", "Observações" e "Código de indicação".

Recusado de propósito:

- **"Telefone fixo"** não recebe nada: a pessoa só tem celular. "Telefone", sem o "fixo", recebe o celular.

Não preenchido, qualquer que seja o rótulo:

- checkbox, radio, file, range, color e hidden (o "aceito os termos" fica desmarcado);
- `select` múltiplo e combobox sem `<select>` nativo;
- `contenteditable`, no fixture e no motor (na extensão, só o modo B, Inserir, escreve nele);
- campos `disabled`, `readonly`, com `display:none` ou sob `aria-hidden`.

Um `<select>` sem a opção da pessoa e um valor que não cabe no `maxlength` vão para `recusados`, sem truncar.

## Pelo `autocomplete`

O atributo `autocomplete` é a primeira via. Estes são os valores que o classificador entende:

:::note[Documentado]

A tabela e a regra dos prefixos logo abaixo dela foram lidas no código do classificador (`packages/core/src/campos.ts`); nenhum teste as conferiu linha a linha.

:::

| `autocomplete`                                       | Tipo                                                            |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| `name`, `given-name`, `family-name`                  | `nomeCompleto`, `primeiroNome`, `sobrenome`                     |
| `nickname`, `username`                               | `usuario`                                                       |
| `email`                                              | `email`                                                         |
| `new-password`, `current-password`                   | `senha`                                                         |
| `bday`, `bday-day`, `bday-month`, `bday-year`        | `nascimento`, `nascimentoDia`, `nascimentoMes`, `nascimentoAno` |
| `sex`                                                | `sexo`                                                          |
| `tel`, `tel-national`, `tel-local`                   | `celular`                                                       |
| `tel-area-code`                                      | `ddd`                                                           |
| `postal-code`                                        | `cep`                                                           |
| `street-address`                                     | `enderecoCompleto`                                              |
| `address-line1`, `address-line2`                     | `logradouro`, `complemento`                                     |
| `address-level1`, `address-level2`, `address-level3` | `uf`, `cidade`, `bairro`                                        |
| `country`, `country-name`                            | `pais`                                                          |
| `organization`                                       | `razaoSocial`                                                   |
| `cc-number`, `cc-name`, `cc-csc`                     | `cartaoNumero`, `cartaoNome`, `cartaoCvv`                       |
| `cc-exp`, `cc-exp-month`, `cc-exp-year`              | `cartaoValidade`, `cartaoValidadeMes`, `cartaoValidadeAno`      |
| `one-time-code`                                      | fica de fora                                                    |

Os prefixos de seção (`section-*`, `shipping`, `billing`, `home`, `work`, `mobile`) não mudam o tipo: `shipping postal-code` é `cep`.

## Na extensão: o modo B

Os 38 tipos valem para preencher a página inteira (modo A). O menu Inserir da extensão (modo B) escreve um campo de cada vez e tem 23 tipos, em 5 grupos: veja [Inserir um campo](../extensao/inserir-um-campo.md).

Para usar o classificador no seu código, veja [Classificador de campos](../biblioteca/classificador.md).
