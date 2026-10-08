---
title: O que é o Botaí
description: Suíte de dados de teste brasileiros que gera uma pessoa fictícia e coerente e preenche formulários com ela.
sidebar_position: 1
slug: /
---

O Botaí é uma suíte de dados de teste brasileiros. Ele gera uma pessoa fictícia e coerente: nome, CPF, RG, PIS, título de eleitor, empresa com CNPJ, CEP real com rua e cidade, celular com o DDD daquele CEP, e-mail com caixa de entrada pública e cartão de teste da Stripe. Depois, preenche formulários com ela.

## Experimente

A mesma semente e o mesmo dia geram a mesma pessoa:

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05
```

Sem instalar nada, onde houver Node:

```bash
npx -y @pilutech/botai-core@0.4.1 pessoa --semente 42 --hoje 2026-10-05
```

O `validar` imprime `válido` e sai com 0, ou imprime `inválido` e sai com 1:

```bash testar=1
botai validar cpf 634.132.403-08
```

Com o servidor HTTP no ar (`botai serve` escuta em `127.0.0.1:8790`), a mesma pessoa sai em JSON:

```bash testar
curl -fsS 'http://127.0.0.1:8790/pessoa?semente=42&hoje=2026-10-05'
```
