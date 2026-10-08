---
title: Preencher a página (modo A)
sidebar_label: Preencher a página
description: O modo A preenche a página inteira com a mesma pessoa, pelo atalho, pelo popup ou pelo menu, e mostra quantos campos preencheu.
sidebar_position: 2
---

O modo A preenche, de uma vez, todos os campos que o Botaí reconhece na página, com uma pessoa só. Sem pessoa guardada, ele gera e guarda uma antes de preencher.

## Três jeitos de acionar

- o atalho do teclado (tabela abaixo);
- o botão "Preencher esta página", no popup;
- o item do menu de contexto (botão direito › Botaí).

## Atalhos {#atalhos}

| Sistema | Chrome e Edge  | Firefox        |
| ------- | -------------- | -------------- |
| macOS   | `⌥⇧P`          | `⌥⇧P`          |
| Windows | `Ctrl+Shift+Y` | `Ctrl+Shift+Y` |
| Linux   | `Ctrl+Shift+Y` | `Alt+Shift+P`  |

O atalho sugerido só vale na primeira instalação. Se outro app já usa a tecla, o popup mostra "definir atalho": escolha outra tecla na página de atalhos de extensões do navegador.

:::info

O gesto nativo do atalho e o do menu têm teste só do handler, porque o Playwright não aciona os dois.

:::

## O que ele reconhece

O Botaí reconhece 38 tipos de campo, com o classificador do core. Ele lê, nesta ordem: `autocomplete`, label, `aria-label`, `name`, `id`, `placeholder`, formato, tipo, opções e contexto. Isso cobre também:

- data em dia, mês e ano separados;
- DDD em campo separado (o telefone sai sem o DDD);
- confirmação de e-mail;
- usuário, sexo, país, cidade e UF.

A lista completa está em [campos reconhecidos](../referencia/campos-reconhecidos.md).

Campo que o classificador não conhece fica de fora, sem chute: "Idade", "Observações", "Código de indicação". "Telefone" recebe o celular, e "Telefone fixo" fica de fora de propósito. Um campo de rua sem campo de número na página recebe "rua, número".

Num cadastro realista, o Botaí preenche 21 de 23 campos. Numa página com campos extras, 19 de 19.

## Como ele escreve

O Botaí escreve pelo setter nativo e dispara eventos `input`, `change` e `blur` sintéticos. O valor vai inteiro, nunca caractere a caractere. Assim, o estado de um React controlado e o de uma máscara recebem o valor, a validação no blur dispara, e o foco do usuário não muda.

Testado com React 19 (no E2E) e, em laboratório, com Vue 3.5.13, imask 7.6.1, jQuery Mask 1.14.16 e maska 3.2.2.

:::note[Documentado]

O react-hook-form 7.89.0, o react-imask 7.6.1, o @react-input/mask 2.0.4, o react-number-format 5.4.5 e o React 18 com react-input-mask 2.0.4 estão na matriz da pesquisa do projeto, feita no Chromium 147. A auditoria de 2026-10-08 não os rodou.

:::

O Botaí sobrescreve o que já foi digitado: não há modo "só os vazios".

## Páginas difíceis

- Shadow root aberta e fechada: preenche as duas.
- Iframe da mesma origem: os campos entram na soma. Iframe de outro domínio (Stripe Elements, Pagar.me) fica de fora, por causa da permissão `activeTab`.
- Honeypot e campos escondidos: ignorados.
- `maxlength`: respeitado.
- O `<select>` escondido do select2: incluído.

## O aviso na página

Depois de preencher, um aviso aparece no frame do topo, dentro de uma shadow root: "X de Y campos preenchidos" e um "k não reconhecidos" clicável. Os campos preenchidos ganham contorno ciano; os outros, âmbar tracejado. O aviso some em 4 s e funciona em página com CSP estrita.

O popup mostra o mesmo resultado em detalhe, com o rótulo e o seletor CSS de cada campo não reconhecido: veja [o popup](./popup.md).

## A 2ª passada do CEP {#segunda-passada}

Muitos sites buscam o CEP e sobrescrevem rua, bairro ou complemento. Cerca de 1 s depois de preencher, o Botaí regrava os valores da pessoa, só nos campos que mudaram desde a leitura.

Campos que só habilitam depois da busca de CEP ficam vazios: a 2ª passada só regrava o que o Botaí já tinha escrito.

## A mesma pessoa até você pedir outra {#pessoa-guardada}

A pessoa fica guardada até você pedir outra com "Nova pessoa", no popup ou no menu. A idade é recalculada pela data de hoje em São Paulo.

Num fluxo de várias etapas (cadastro, endereço, pagamento), use o atalho em cada página: a pessoa é a mesma. A permissão `activeTab` cai quando a aba navega, então cada etapa precisa de um novo gesto (atalho, popup ou menu).

A extensão usa o mesmo motor do core e do fixture do Playwright, e os testes dela reproduzem os [dourados](../conceitos/versoes-e-dourados.md) por semente. Mesmo assim, ela sorteia a pessoa com crypto: não há opção de semente, UF nem domínio de e-mail. Para uma pessoa reproduzível, use a CLI, a biblioteca ou o [fixture do Playwright](../playwright/o-fixture.md).
