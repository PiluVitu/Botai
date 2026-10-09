---
title: Privacidade e permissões
description: A extensão não faz chamada de rede, pede quatro permissões e guarda só a pessoa ativa e os favoritos, no armazenamento local do navegador.
sidebar_position: 6
---

## Sem rede

A extensão não faz nenhuma chamada de rede. Em produção, ela não tem nenhuma `host_permission`: não pede acesso a site nenhum de antemão. No Firefox, o manifesto declara `data_collection_permissions: none`.

A pessoa é gerada dentro do navegador, sorteada com crypto.

## As permissões

| Permissão      | O que permite                                                         |
| -------------- | --------------------------------------------------------------------- |
| `activeTab`    | mexer na aba atual, só depois de um gesto seu (atalho, popup ou menu) |
| `scripting`    | rodar o preenchimento na página                                       |
| `contextMenus` | o menu Botaí do botão direito                                         |
| `storage`      | guardar a pessoa ativa e os favoritos                                 |

No Firefox, o manifesto soma `menus`.

O `activeTab` explica dois limites da extensão:

- a permissão cai quando a aba navega: cada etapa de um fluxo precisa de um novo gesto;
- iframes de outro domínio (Stripe Elements, Pagar.me) ficam de fora.

## O que fica guardado {#o-que-fica-guardado}

Só a pessoa ativa, na chave `local:botai_pessoa` do `storage.local` do navegador. Ela fica ali até você pedir outra com "Nova pessoa", no popup ou no menu.

:::note[Documentado]

Os favoritos chegam na versão 1.1.0 da extensão, que ainda não saiu nas lojas. O texto vem do código da 1.1.0, e a auditoria de 2026-10-08 não o rodou.

:::

A partir da versão 1.1.0, a extensão guarda também até 3 [pessoas favoritas](./favoritos.md), com o apelido que você der a cada uma, na chave `local:botai_favoritos`. Um favorito fica ali até você o tirar com a estrela, no popup, ou remover a extensão; "Nova pessoa" não o apaga.

Nada disso é sincronizado entre dispositivos nem enviado.

## Os dados gerados

Os dados são fictícios, mas o CPF, o CNPJ e o celular gerados podem pertencer a gente real. A caixa de e-mail da pessoa é pública: qualquer um que saiba o endereço lê as mensagens. E a extensão não tem opção de domínio de e-mail: o endereço é sempre o dessa caixa pública.

Use a extensão só em localhost e em ambiente de homologação (staging). Não use em produção nem para criar contas reais. Mais em [uso responsável](../conceitos/uso-responsavel.md).
