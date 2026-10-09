---
title: O popup
description: Os cinco estados do popup do Botaí, de 1a a 1e, como copiar um valor, achar um campo não reconhecido, usar os favoritos e escolher o cartão de teste.
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

"Nova pessoa" troca a pessoa guardada. Os próximos preenchimentos e cópias usam a nova. A partir da versão 1.2.0, ela sai com o [cartão escolhido no popup](#cartao).

## Favoritos {#favoritos}

:::note[Documentado]

Os favoritos chegam na versão 1.1.0 da extensão, que ainda não saiu nas lojas. O texto vem do código da 1.1.0, e a auditoria de 2026-10-08 não o rodou.

:::

O popup guarda até 3 [pessoas favoritas](./favoritos.md), cada uma com um apelido, além da pessoa ativa (a que o atalho, o botão "Preencher esta página" e o menu usam):

- a estrela ao lado do nome guarda a pessoa ativa nos favoritos ou a tira de lá;
- o lápis troca o apelido, que começa com o primeiro nome e tem até 24 caracteres;
- os chips "Favoritos n/3" trocam a pessoa ativa: clique num favorito para usá-lo;
- tirar um favorito mostra "Desfazer" por 5 s;
- com 3 guardados, a estrela fica desabilitada.

"Nova pessoa" troca só a ativa e nunca apaga um favorito.

## O cartão {#cartao}

:::note[Documentado]

A escolha do cartão chega na versão 1.2.0 da extensão, que ainda não saiu nas lojas. O texto vem do código da 1.2.0, e a auditoria de 2026-10-08 não o rodou.

:::

No 1b, o grupo "Cartão" mostra, além do número, da validade e do CVV, o cenário do cartão da pessoa ativa: o rótulo (por exemplo `recusado`), com a cor e o ícone do tipo (aprovação, recusa ou espera), o provedor (Stripe ou Pagar.me) e uma frase com o que o provedor faz com aquele número. Uma pessoa guardada antes da 1.2.0 aparece como Stripe `aprovado`, o único cartão de antes.

Logo abaixo, o bloco "Cartão das próximas pessoas" escolhe o cartão de quem for gerado a seguir:

- o provedor: Stripe ou Pagar.me;
- o cenário, entre os do provedor escolhido. Os cenários e os números estão em [Cartões de teste](../conceitos/cartoes-de-teste.md);
- o botão "Nova pessoa com …", com o provedor e o cenário escolhidos (por exemplo "Nova pessoa com Pagar.me · recusado"), gera uma pessoa nova com esse cartão.

Trocar o provedor mantém o cenário se o outro provedor também o tiver (`aprovado`, `recusado` e `pendente` existem nos dois); senão, volta a `aprovado`.

A escolha vale só para as pessoas novas: o "Nova pessoa" do popup e do menu, o "Nova pessoa com …" e a primeira pessoa, quando ainda não há nenhuma. A pessoa ativa e as [favoritas](./favoritos.md) mantêm o cartão com que foram geradas. Sem escolha, o cartão é o `aprovado` da Stripe.

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
