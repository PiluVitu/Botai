---
title: Inserir um campo (modo B)
sidebar_label: Inserir um campo
description: O modo B escreve um valor da pessoa no campo clicado, pelo menu do botão direito, em 23 tipos divididos em 5 grupos.
sidebar_position: 3
---

O modo B escreve um valor só, no campo em que você clicou com o botão direito. Serve para o campo que o [modo A](./preencher-a-pagina.md) não reconheceu ou para quando você quer um valor específico. O valor sai da mesma pessoa guardada.

## Como usar

1. Clique com o botão direito no campo.
2. Abra Botaí › Inserir.
3. Escolha o tipo.

O Inserir funciona em `contenteditable` e em campo `type=date`. Na extensão, ele é o único jeito de escrever num `contenteditable`: o modo A deixa esse campo vazio.

## Os 23 tipos

O menu separa os tipos em 5 grupos:

1. Nome completo, Data de nascimento, CPF, RG, Celular, E-mail, Senha.
2. CEP, Rua, Número, Complemento, Bairro, Cidade, UF.
3. Razão social, Nome fantasia, CNPJ.
4. Cartão: número, Cartão: nome impresso, Cartão: validade, Cartão: CVV.
5. PIS/NIS, Título de eleitor.

CPF e CEP mostram o valor no título do item, por exemplo `CPF · 936.796.672-56`: você vê o que vai entrar antes de clicar.

## No Firefox

:::note[Documentado]

Os testes do Vitest provam este caminho com um stub do Firefox. No Firefox real, ele vem do checklist manual do projeto; a auditoria de 2026-10-08 não o rodou.

:::

No Firefox, o Inserir escreve no campo clicado mesmo sem foco e aparece também em campo de senha. Ele acha o campo pelo `targetElementId` do clique.

## Também no menu

- **Nova pessoa:** troca a pessoa guardada. Os próximos preenchimentos usam a nova.
- **Preencher com** (a partir da versão 1.1.0): preenche a página com uma das [pessoas favoritas](./favoritos.md) e a torna a pessoa ativa. Só aparece quando há favorito.
- **Abrir caixa de entrada:** abre a caixa de e-mail da pessoa, para confirmar um cadastro por e-mail. A caixa é pública: qualquer um que saiba o endereço lê as mensagens. Veja o [uso responsável](../conceitos/uso-responsavel.md).

## Quando usar

- O aviso ou o popup listou um campo como não reconhecido: clique nele com o botão direito e escolha o tipo (CPF, E-mail, CEP…).
- O formulário pede um dado só, e você não quer sobrescrever o resto da página.
