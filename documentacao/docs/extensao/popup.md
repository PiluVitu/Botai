---
title: O popup
description: Os cinco estados do popup do Botaí, de 1a a 1e, como copiar um valor da pessoa e como achar um campo não reconhecido com a mira.
sidebar_position: 4
---

Clique no ícone do Botaí para abrir o popup. É ali que você vê a pessoa guardada, copia um valor, preenche a página e confere o resultado.

## Os cinco estados

| Estado | Quando                                     | O que mostra                                                                                       |
| ------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| 1a     | primeiro uso                               | o começo: ainda não há pessoa guardada                                                             |
| 1b     | há uma pessoa guardada                     | a pessoa em 6 grupos, com 24 valores copiáveis e um filtro por chips                               |
| 1c     | depois de preencher                        | "X de Y", os campos não reconhecidos com o rótulo e o seletor CSS, e uma mira que rola até cada um |
| 1d     | nenhum campo reconhecido ou sem formulário | o aviso de que não havia o que preencher                                                           |
| 1e     | página proibida                            | o aviso de que a extensão não entra ali, com o botão "Ver os dados"                                |

## Copiar um valor

No 1b, cada um dos 24 valores da pessoa se copia com um clique. Os chips filtram os grupos.

A cópia funciona até em página que a extensão não pode preencher: no 1e, "Ver os dados" mostra a pessoa. Assim você copia um CPF numa página proibida e cola onde precisar.

## Achar um campo não reconhecido

O 1c lista cada campo que ficou de fora, com o rótulo e o seletor CSS. A mira rola a página até o campo.

Se o formulário é seu, a lista diz o que ajustar: um `autocomplete` ou um label que o classificador reconheça. Se não é, preencha o campo com o [Inserir](./inserir-um-campo.md).

## Trocar a pessoa

"Nova pessoa" troca a pessoa guardada. Os próximos preenchimentos e cópias usam a nova.

## O atalho

Se outro app já usa a tecla do atalho, o popup mostra "definir atalho". As teclas de cada sistema estão em [Preencher a página](./preencher-a-pagina.md#atalhos).

## Sem o navegador

Para um valor avulso fora do navegador, a CLI gera o mesmo tipo de dado no terminal:

```bash testar
botai cpf --formatado --uf PI --semente 42
```

```text
181.846.063-70
```

```bash testar
botai celular --formatado --uf PI --semente 42
```

```text
(86) 98606-4634
```

Sem `--semente`, cada execução dá um valor novo. Os outros geradores e as opções estão na [CLI](../cli/geradores-avulsos.md).
