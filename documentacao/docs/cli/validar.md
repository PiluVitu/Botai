---
title: Validar documentos
description: O botai validar confere o dígito verificador de CPF, CNPJ, RG, PIS, título de eleitor e cartão, com ou sem máscara, e responde pelo código de saída.
sidebar_position: 5
---

```text
botai validar cpf|cnpj|rg|pis|titulo|cartao <valor>
```

O `validar` confere o dígito verificador do valor, com ou sem máscara. Ele escreve `válido` e sai com 0, ou escreve `inválido` e sai com 1.

```bash testar
botai validar cnpj 35.728.569/0001-52 && echo ok
```

```text
válido
ok
```

```bash testar=1
botai validar cpf 634.132.403-08
```

```text
inválido
```

## Os seis tipos

| Tipo     | Exemplo válido (com máscara) | Sem máscara        |
| -------- | ---------------------------- | ------------------ |
| `cpf`    | `634.132.403-07`             | `63413240307`      |
| `cnpj`   | `35.728.569/0001-52`         | `35728569000152`   |
| `rg`     | `92.957.904-5`               | `929579045`        |
| `pis`    | `166.24491.26-5`             | `16624491265`      |
| `titulo` | `"5022 4149 1171"`           | `502241491171`     |
| `cartao` | `"5555 5555 5555 4444"`      | `5555555555554444` |

Valor com espaço vai entre aspas, para chegar ao `validar` como um argumento só.

```bash testar
botai validar titulo "5022 4149 1171"
botai validar cartao "5555 5555 5555 4444"
botai validar rg 929579045
botai validar pis 16624491265
```

O `validar` não cobre celular, CEP nem e-mail. Um tipo fora da lista é erro de uso, e o tipo diferencia maiúsculas:

```bash testar=2
botai validar celular 11999999999
```

```text
botai: tipo desconhecido "celular" (use cpf, cnpj, rg, pis, titulo, cartao)
```

## Num script {#num-script}

O resultado está no código de saída: 0 válido, 1 inválido, 2 erro de uso. Para um gate de shell, basta o `&&`:

```bash testar
v=634.132.403-07
botai validar cpf "$v" > /dev/null && echo "CPF $v aceito"
```

```text
CPF 634.132.403-07 aceito
```

Quando você precisa separar o inválido do erro de uso, leia o código:

```bash testar
botai validar cpf 634.132.403-08 > /dev/null && status=0 || status=$?
case $status in
  0) echo "válido" ;;
  1) echo "inválido" ;;
  *) echo "erro de uso" ;;
esac
```

```text
inválido
```

Os códigos de toda a CLI estão em [Códigos de saída](./codigos-de-saida.md).
