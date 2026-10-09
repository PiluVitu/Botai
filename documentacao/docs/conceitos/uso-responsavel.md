---
title: Uso responsável
description: Os dados do Botaí são fictícios, mas podem coincidir com gente real, e a caixa de e-mail padrão é pública. Use só em localhost e staging.
sidebar_position: 7
---

O Botaí gera dados de teste. Eles são fictícios, mas passam em todo validador, e por isso pedem cuidado.

## Só em localhost e staging {#onde-usar}

- **Documentos podem existir.** O CPF, o CNPJ e o celular gerados têm dígitos verificadores e formato válidos, e podem pertencer a uma pessoa ou a uma empresa real.
- **Nunca em produção.** Não use o Botaí para criar contas reais nem para preencher formulários de sistemas em produção.
- **O cartão é de teste.** Sai sempre um dos dois números de teste da Stripe (`4242424242424242` ou `5555555555554444`).

## A caixa de e-mail é pública {#email-publico}

O domínio padrão é `tuamaeaquelaursa.com`, e a caixa de entrada da pessoa fica em `https://tuamaeaquelaursa.com/<usuario>`. Quem souber o endereço lê os e-mails. Ela serve para testar um cadastro com confirmação por e-mail, e nada além disso.

Para não usar a caixa pública, troque o domínio. O `caixaUrl` vira `null`:

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05 --dominio-email example.com \
  | grep -A 4 '"email"'
```

```text
    "email": {
      "usuario": "marcio-rodrigues-0337",
      "endereco": "marcio-rodrigues-0337@example.com",
      "caixaUrl": null
    },
```

| Porta      | Opção                                |
| ---------- | ------------------------------------ |
| CLI        | `--dominio-email example.com`        |
| Servidor   | `?dominioEmail=example.com`          |
| Biblioteca | `{ dominioEmail: 'example.com' }`    |
| Fixture    | `botaiDominioEmail: 'example.com'`   |
| Extensão   | não tem: usa sempre o domínio padrão |

## O servidor é para testes {#servidor}

O `botai serve` não tem CORS, TLS nem autenticação. Por padrão, ele escuta só em `127.0.0.1`; `--host 0.0.0.0` o abre para a rede. Use-o em testes, scripts e back-end, nunca exposto à internet. Os detalhes estão em [Segurança e limites do servidor](../servidor/seguranca-e-limites.md).

## A extensão não fala com a rede {#extensao}

A extensão não faz nenhuma chamada de rede e não pede `host_permission` em produção. As permissões são `activeTab`, `scripting`, `contextMenus` e `storage` (o Firefox soma `menus`), e no Firefox `data_collection_permissions` é `none`. A pessoa ativa fica guardada só na chave `local:botai_pessoa` do `storage.local`. A partir da versão 1.1.0, as até 3 [pessoas favoritas](../extensao/favoritos.md), com os apelidos, ficam na chave `local:botai_favoritos`, também só no navegador. Mais em [Privacidade e permissões](../extensao/privacidade-e-permissoes.md#o-que-fica-guardado).

## O que o Botaí não gera {#nao-gera}

O **CNPJ alfanumérico**, vigente desde julho de 2026, não é gerado, e o `validarCNPJ` o recusa.

A lista completa do que fica de fora está em [Limites](../limites.md).
