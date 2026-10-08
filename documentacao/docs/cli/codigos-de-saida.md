---
title: Códigos de saída
description: O que cada código de saída da CLI quer dizer (0 ok, 1 inválido, 2 erro de uso, 3 erro interno) e como lê-los num script.
sidebar_position: 6
---

| Código | Quando                                                                  |
| ------ | ----------------------------------------------------------------------- |
| 0      | deu certo                                                               |
| 1      | o `validar` achou o valor inválido                                      |
| 2      | erro de uso: comando, opção ou valor errado. O stdout fica sempre vazio |
| 3      | erro interno inesperado                                                 |

Em todo caso, os dados saem no stdout e as mensagens no stderr, começando com `botai:`.

## 0: deu certo

```bash testar
botai cpf --formatado
```

## 1: inválido

Só o `validar` usa o 1. Ele escreve `inválido` no stdout:

```bash testar=1
botai validar cpf 634.132.403-08
```

```text
inválido
```

O `botai serve` também sai com 1 quando a porta já está em uso. Veja [`botai serve`](../servidor/botai-serve.md).

## 2: erro de uso

Comando desconhecido, opção desconhecida ou repetida, valor fora do formato, opção que não vale para aquele comando: tudo isso sai com 2, com uma mensagem que diz o que está errado. Nada sai no stdout, então um pipe ou um redirecionamento nunca recebe dado pela metade.

```bash testar=2
botai pessoas -n 10 --formato sql --dialeto MySQL
```

```text
botai: dialeto desconhecido "MySQL" (use postgres, mysql, sqlite)
```

```bash testar
saida=$(botai pessoas -n 10 --formato sql --tabela 'x;drop' 2> /dev/null) && status=0 || status=$?
echo "saída $status, stdout com ${#saida} caracteres"
```

```text
saída 2, stdout com 0 caracteres
```

Os 29 erros de uso provocados na auditoria de 2026-10-08 saíram todos com 2 e com o stdout vazio. As mensagens estão em [Mensagens de erro](../referencia/mensagens-de-erro.md#cli).

## 3: erro interno

O 3 é reservado a um erro interno inesperado, ou seja, a um defeito da CLI. Nenhuma entrada real levou a ele na auditoria, por isso não há exemplo. Se você vir um 3, guarde o comando e a mensagem para relatar o defeito.

## Num script

Com `set -e`, um erro de uso derruba o script. Para tratar cada código, leia o `$?` sem deixar o `set -e` parar:

```bash testar
botai validar cnpj 35.728.569/0001-52 > /dev/null && status=0 || status=$?
case $status in
  0) echo "válido" ;;
  1) echo "inválido" ;;
  2) echo "erro de uso" ;;
  *) echo "erro interno ($status)" ;;
esac
```

```text
válido
```
