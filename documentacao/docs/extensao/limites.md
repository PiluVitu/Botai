---
title: Limites da extensão
description: O que a extensão não faz, onde ela não entra e o que fica sem preencher, com o motivo de cada limite.
sidebar_position: 6
---

## Sem opções

A extensão não tem opção de semente, UF nem domínio de e-mail. Ela sorteia a pessoa com crypto, então não dá para pedir de novo a mesma pessoa de ontem nem uma pessoa de um estado. Para isso, use a CLI, a biblioteca ou o [fixture do Playwright](../playwright/opcoes.md).

## Onde ela não entra

- **Páginas proibidas:** `chrome://`, `about:`, as lojas de extensão, o leitor de PDF e `file:` sem a permissão de acesso a arquivos. O Botaí não preenche, e o atalho não faz nada. No popup, elas aparecem no estado 1e, com "Ver os dados" para copiar os valores.
- **Navegação:** a permissão `activeTab` cai quando a aba navega. Cada etapa de um fluxo precisa de um novo gesto (atalho, popup ou menu).
- **Iframes de outro domínio:** ficam de fora, também por causa do `activeTab`. Isso inclui os campos de pagamento da Stripe Elements e da Pagar.me. Os iframes da mesma origem entram na soma.
- **Navegadores:** não há versão para o Safari nem para o Firefox para Android. O Opera está em revisão na loja.

## O que fica sem preencher {#o-que-fica-sem-preencher}

- Checkbox, radio, `file`, `range`, `color`, `hidden`, `<select multiple>` e combobox sem `<select>` nativo. O "aceito os termos" fica desmarcado.
- `contenteditable`: o modo A não escreve nele. Use o [Inserir](./inserir-um-campo.md).
- Campos que só habilitam depois da busca de CEP. A 2ª passada só regrava o que o Botaí já tinha escrito.
- Campo que o classificador não conhece, como "Idade", "Observações" ou "Código de indicação". Ele entra na lista de não reconhecidos, sem chute. "Telefone fixo" fica de fora de propósito; "Telefone" recebe o celular.
- Valor que não cabe no `maxlength` (o Botaí não corta o valor) e `<select>` sem a opção da pessoa.

## Como ele escreve

- O Botaí sobrescreve o que já foi digitado. Não há modo "só os vazios".
- O contraste dos contornos é baixo por decisão (2,1:1 no ciano e 1,8:1 no âmbar). Quem carrega a informação é o aviso, com o texto "X de Y campos preenchidos".

## Testes e atalho

- O E2E funcional roda só no Chromium. O Firefox, o Edge e o Opera reais dependem de checklists manuais.
- O atalho sugerido só vale na primeira instalação. Se outro app já usa a tecla, o popup mostra "definir atalho".

## Os dados

A pessoa da extensão tem os mesmos limites de qualquer porta. Os principais para quem testa à mão:

- há só 34 CEPs reais, então o endereço se repete;
- o cartão é sempre um dos dois de teste da Stripe (Visa ou Mastercard);
- o celular é sempre móvel, e a idade vai de 18 a 65;
- o RG é sempre SSP/SP.

A lista inteira, com os limites da CLI, do servidor e do fixture, está em [limites](../limites.md).
