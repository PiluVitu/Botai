---
title: Preencher com botai.preencher
sidebar_label: Preencher
description: Preencher a página inteira ou só um elemento com botai.preencher, o que o resultado traz e o que fica de fora.
sidebar_position: 3
---

## A página inteira

```ts
const r = await botai.preencher(page)
```

Com uma `Page`, o Botaí percorre **todos os frames** em paralelo: os da mesma origem, os de **outra origem**, os `srcdoc` e as páginas abertas depois do fixture.

## Só um elemento

Com um `Locator`, ele preenche só dentro daquele elemento: um formulário, uma seção ou um campo. Vale também dentro de iframe.

```ts
await botai.preencher(page.locator('#entrega'))
await botai.preencher(page.getByLabel('CPF'))
await botai.preencher(page.frameLocator('iframe').locator('#contato'))
```

Assim você preenche só uma seção e deixa o resto para o teste.

O `Locator` precisa casar um elemento só:

- se casa mais de um, a chamada quebra com `strict mode violation`. Aponte para o contêiner (o `form`, a seção) ou passe a `Page`;
- se não casa nenhum, a chamada espera até o timeout do teste, sem erro próprio do Botaí.

## O resultado {#resultado}

`botai.preencher` devolve `{ preenchidos, naoReconhecidos, recusados }`. Cada linha é `{ frame, rotulo, seletor }`, e `frame` é a URL do frame:

```json
{
  "frame": "http://sonda.local/amplo",
  "rotulo": "Nome completo",
  "seletor": "input[name=\"nome\"]"
}
```

| Lista             | O que entra                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `preenchidos`     | os campos que receberam um valor da pessoa                                                                                       |
| `naoReconhecidos` | os campos que o classificador não conhece, sem chute: "Idade", "Observações", "Código de indicação"                              |
| `recusados`       | os reconhecidos que não aceitaram o valor: não cabe no `maxlength` (o Botaí não corta) ou o `<select>` não tem a opção da pessoa |

"Telefone" recebe o celular; "Telefone fixo" fica de fora de propósito. Um campo de rua sem campo de número na página recebe "rua, número".

Num cadastro realista, o resultado é 21 preenchidos, 2 não reconhecidos e 0 recusados, no Chromium, no Firefox e no WebKit, também com o pacote do npm.

### Guarda de regressão

```ts
const r = await botai.preencher(page)
expect(r.naoReconhecidos).toEqual([])
```

Quando alguém põe no formulário um campo novo sem rótulo reconhecível, o teste avisa.

## O que ele aguenta

- **React controlado, máscara e validação no blur**, sem roubar o foco.
- **Shadow root aberta.**
- **CSP estrita** (`default-src 'none'; script-src 'self'`). O fixture manda o motor por `frame.evaluate` com o texto do IIFE, e nunca por `addScriptTag`, que a CSP barra. Detalhes em [CSP](../navegador/csp.md).
- **Teste visual:** o fixture não pinta contorno nenhum. O `toHaveScreenshot` vê só os valores.

## A 2ª passada

Ligada por padrão: o Botaí espera cerca de 1 s e regrava o que a página sobrescreveu depois de uma busca de CEP. O custo vale para toda chamada que escreve algo. Para pular:

```ts
await botai.preencher(page, { segundaPassada: false })
```

Medido em 2026-10-08, macOS arm64, Node 22.22.3, numa máquina compartilhada: de 4 a 11 ms sem a 2ª passada e cerca de 1 s com ela. O relógio falso do Playwright pode segurar a 2ª passada: veja [relógio e 2ª passada](./relogio-e-segunda-passada.md).

## O que fica de fora {#o-que-fica-de-fora}

- Checkbox, radio, `file`, `range`, `color`, `hidden`, `<select multiple>` e combobox sem `<select>` nativo. O "aceito os termos" fica desmarcado.
- `contenteditable`: fica vazio.
- Shadow root fechada. A extensão a preenche; o fixture não.
- Campos que só habilitam depois da busca de CEP. A 2ª passada só regrava o que o Botaí já tinha escrito.
- O que já foi digitado: o Botaí sobrescreve. Não há modo "só os vazios".

:::note[Documentado]

O motor roda no mundo MAIN da página, o mesmo dos scripts do site. Um site que troca protótipos nativos pode interferir. Isso vem do código; ninguém provocou o caso.

:::

Os limites de todas as portas estão em [limites](../limites.md).
