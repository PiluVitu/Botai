---
title: Instalar a extensão
description: Onde instalar o Botaí 1.0.0 no Chrome, no Edge e no Firefox, a versão mínima de cada navegador e o que ficou de fora.
sidebar_position: 1
---

A extensão Botaí 1.0.0 (Manifest V3) preenche formulários no navegador com uma pessoa fictícia e coerente: CPF e CNPJ válidos, CEP real com rua, bairro e cidade que batem, e celular com o DDD da cidade. É a porta de quem testa à mão e de quem desenvolve o próprio formulário.

## Onde instalar

| Navegador | Versão mínima  | Onde                                                                                                             |
| --------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| Chrome    | 123            | [Chrome Web Store](https://chromewebstore.google.com/detail/bota%C3%AD/mblmjomopainbcdjipkdmioglamdinnc)         |
| Edge      | 123 (Chromium) | a mesma [Chrome Web Store](https://chromewebstore.google.com/detail/bota%C3%AD/mblmjomopainbcdjipkdmioglamdinnc) |
| Firefox   | 153.0          | [Firefox Add-ons](https://addons.mozilla.org/pt-BR/firefox/addon/bota%C3%AD/)                                    |
| Opera     | 109            | em revisão na loja do Opera                                                                                      |

As duas lojas no ar têm a versão 1.0.0. Na Firefox Add-ons, ela é pública desde 2026-10-03. O Edge não tem página própria: instale pela Chrome Web Store. O Opera ainda não tem o Botaí publicado.

Não há versão para o Safari nem para o Firefox para Android.

## Depois de instalar

- Aperte o atalho numa página com formulário: `⌥⇧P` no Mac, `Ctrl+Shift+Y` no Windows e no Linux, `Alt+Shift+P` no Firefox para Linux. Os detalhes estão em [Preencher a página](./preencher-a-pagina.md).
- O atalho sugerido só vale na primeira instalação. Se outro app já usa a tecla, o popup mostra "definir atalho".
- Clique no ícone do Botaí para ver a pessoa e copiar qualquer valor: [o popup](./popup.md).

## O que foi testado

Na auditoria de 2026-10-08, os 26 testes E2E e os 465 testes do Vitest da extensão passaram. O E2E funcional roda só no Chromium: o Playwright não carrega a extensão nos outros navegadores.

:::note[Documentado]

O comportamento no Firefox, no Edge e no Opera reais, com o gesto do usuário (ícone, atalho e menu), vem dos checklists manuais do projeto, não de teste automático. No Opera, ele é suposto até o checklist passar.

:::
