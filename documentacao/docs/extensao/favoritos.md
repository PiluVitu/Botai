---
title: Pessoas favoritas
sidebar_label: Favoritos
description: Guarde até 3 pessoas favoritas com apelido, troque a pessoa ativa no popup e preencha a página com qualquer uma pelo botão direito. Chega na versão 1.1.0.
sidebar_position: 5
---

:::note[Documentado]

Os favoritos chegam na versão 1.1.0 da extensão, que ainda não saiu nas lojas: elas têm a 1.0.0. Esta página vem do código da 1.1.0, e a auditoria de 2026-10-08 não a rodou.

:::

Além da pessoa ativa, a extensão guarda até 3 pessoas favoritas, cada uma com um apelido. Com elas, você volta a uma pessoa que já cadastrou num ambiente de teste, sem gerar outra.

## A pessoa ativa {#pessoa-ativa}

A pessoa ativa é a que o atalho, o botão "Preencher esta página" e o menu usam. É a mesma pessoa guardada de [Preencher a página](./preencher-a-pagina.md#pessoa-guardada): ela fica até você pedir outra.

- Clicar num favorito, no popup, torna esse favorito a pessoa ativa.
- "Nova pessoa" troca só a ativa. Ela nunca apaga um favorito.

## No popup {#popup}

- **A estrela**, ao lado do nome, guarda a pessoa ativa nos favoritos. Se ela já é favorita, a estrela a tira de lá.
- **O apelido** começa com o primeiro nome da pessoa. O lápis troca o apelido, com até 24 caracteres.
- **Os chips "Favoritos n/3"**, em que n é quantos você guardou, trocam a pessoa ativa: clique no favorito que você quer usar.
- **Desfazer:** tirar um favorito mostra "Desfazer" por 5 s.
- **Com 3 guardados**, a estrela fica desabilitada. Para guardar outra pessoa, tire um favorito antes.

O resto do popup (os estados, a cópia de valores e a mira) está em [O popup](./popup.md).

## No botão direito {#botao-direito}

Botaí › Preencher com › `apelido · primeiro nome` preenche a página com aquele favorito, como o [modo A](./preencher-a-pagina.md), e o torna a pessoa ativa.

O submenu "Preencher com" só aparece quando há pelo menos um favorito.

## Onde ficam {#onde-ficam}

Só no navegador, no `storage.local`, em duas chaves:

| Chave                   | O que guarda                         |
| ----------------------- | ------------------------------------ |
| `local:botai_pessoa`    | a pessoa ativa                       |
| `local:botai_favoritos` | os favoritos, até 3, com os apelidos |

Nada é sincronizado nem enviado: a extensão continua sem nenhuma chamada de rede. Um favorito fica guardado até você o tirar com a estrela ou remover a extensão. Mais em [Privacidade e permissões](./privacidade-e-permissoes.md#o-que-fica-guardado).

## Limites {#limites}

- No máximo 3 favoritos, além da pessoa ativa.
- O apelido tem até 24 caracteres.
- Os favoritos ficam só neste navegador: não passam para outro navegador nem para outro dispositivo.
- A extensão continua sem opção de semente. Para a mesma pessoa em qualquer máquina, use a CLI, a biblioteca ou o [fixture do Playwright](../playwright/o-fixture.md) com uma semente.
