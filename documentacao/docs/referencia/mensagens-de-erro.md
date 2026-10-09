---
title: Mensagens de erro
description: As mensagens reais da CLI e do servidor HTTP do Botaí, com o código de saída ou o status HTTP de cada uma.
sidebar_position: 3
---

## CLI {#cli}

Toda mensagem da CLI vai para o stderr e começa com `botai:`. Num erro de uso, a saída é 2 e o stdout fica vazio. As mensagens abaixo foram copiadas de execuções reais; o que muda de um caso para outro é o valor entre aspas. Os códigos estão em [Códigos de saída](../cli/codigos-de-saida.md).

### Comando e argumentos {#cli-comando}

| Mensagem no stderr                                       | Quando                                                                       |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `botai: comando desconhecido "nada" (veja botai --help)` | o comando não existe                                                         |
| `botai: opção desconhecida: --foo`                       | a opção não existe ou não vale para o comando (como `--hoje` no `botai cpf`) |
| `botai: opção repetida: --semente`                       | a mesma opção apareceu duas vezes                                            |
| `botai: --semente precisa de um valor`                   | a opção ficou sem valor no fim do comando                                    |
| `botai: argumento inesperado: extra`                     | sobrou um argumento                                                          |

### O lote {#cli-lote}

| Mensagem no stderr                                                   | Quando                                        |
| -------------------------------------------------------------------- | --------------------------------------------- |
| `botai: -n é obrigatório sem --cenarios`                             | `botai pessoas` sem `-n` e sem `--cenarios`   |
| `botai: -n precisa ser um inteiro, recebido "abc"`                   | o `-n` não é um inteiro (também `-1` e `1.5`) |
| `botai: -n: n precisa ser um inteiro de 0 a 100000, recebido 100001` | o `-n` passou de 100 000                      |

```bash testar=2
botai pessoas -n 100001
```

### Semente, hoje, UF e domínio {#cli-opcoes}

| Mensagem no stderr                                                                      | Quando                                                           |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `botai: --semente: semente vazia`                                                       | `--semente ''`                                                   |
| `botai: --semente: semente com mais de 256 caracteres`                                  | a semente de texto passou de 256 caracteres                      |
| `botai: --semente: semente com caractere de controle`                                   | a semente tem um caractere de controle, como uma tabulação       |
| `botai: --hoje: hoje precisa ser uma data AAAA-MM-DD que existe, recebido "05/10/2026"` | outro formato de data, ou uma data que não existe (`2026-02-30`) |
| `botai: --uf: uf desconhecida "XX" (use uma das 27 siglas, ex.: SP)`                    | a UF não é uma das 27 siglas                                     |
| `botai: --uf não vale para cnpj`                                                        | `--uf` no `cnpj`, no `rg` ou no `pis`                            |
| `botai: --dominio-email: domínio de e-mail inválido "nao valido" (ex.: example.com)`    | o domínio não tem forma de domínio                               |

```bash testar=2
botai pessoa --hoje 05/10/2026
```

### Cartões {#cli-cartoes}

| Mensagem no stderr                                                                                                                                                    | Quando                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `botai: --cartao: provedor de cartão desconhecido "adyen" (use stripe, pagarme)`                                                                                      | o provedor não é `stripe` nem `pagarme`                        |
| `botai: --cenario: cenário desconhecido "recusado-cvc" para o provedor pagarme (use aprovado, recusado, pendente, pendente-recusado, pendente-cancelado, chargeback)` | o provedor não tem o cenário (sem `--cartao`, vale a `stripe`) |
| `botai: --cenarios: cenarios precisa ser cenario:quantidade, separados por vírgula (ex.: recusado:10,aprovado:2), recebido "recusado"`                                | faltou a quantidade, ou há vírgula sobrando                    |
| `botai: --cenarios: quantidade inválida "0" no cenário recusado (um inteiro de 1 em diante)`                                                                          | a quantidade não é um inteiro de 1 em diante                   |
| `botai: --cenarios: cenário repetido "aprovado"`                                                                                                                      | o mesmo cenário duas vezes                                     |
| `botai: --cenarios: a soma dos cenários (100001) passa do limite de 100000 pessoas`                                                                                   | a soma passou de 100 000                                       |
| `botai: -n: n (5) diferente da soma dos cenários (10)`                                                                                                                | o `-n` veio e não é a soma                                     |

```bash testar=2
botai pessoa --cartao pagarme --cenario recusado-cvc
```

### Formatos {#cli-formatos}

| Mensagem no stderr                                                                                       | Quando                                                                 |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `botai: --formato desconhecido "xml" (use json, ndjson, csv, sql)`                                       | o formato não é um dos quatro                                          |
| `botai: --dialeto só vale com --formato sql`                                                             | `--dialeto` sem `--formato sql`                                        |
| `botai: dialeto desconhecido "MySQL" (use postgres, mysql, sqlite)`                                      | o dialeto não é um dos três (diferencia maiúsculas)                    |
| `botai: --tabela só vale com --formato sql`                                                              | `--tabela` sem `--formato sql`                                         |
| `botai: tabela inválida "x;drop" (letras, dígitos e _, até 63 caracteres; opcionalmente esquema.tabela)` | a tabela tem outro caractere, mais de um ponto (`a.b.c`) ou está vazia |
| `botai: --campos só vale com --formato csv ou sql`                                                       | `--campos` em json ou ndjson                                           |
| `botai: campos: lista vazia ou com vírgula sobrando`                                                     | `--campos ''` ou uma vírgula a mais                                    |
| `botai: campos: coluna repetida "nome"`                                                                  | a mesma coluna duas vezes                                              |

Coluna que não existe também sai com 2. A mensagem começa com `botai: campos: coluna desconhecida "xyz"` e lista as 35 colunas aceitas (estão em [Colunas](./colunas.md)).

```bash testar=2
botai pessoas -n 10 --formato sql --tabela 'x;drop'
```

### validar {#cli-validar}

| Mensagem no stderr                                                            | Quando                                                                  |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `botai: uso: botai validar <tipo> <valor>`                                    | faltou o tipo ou o valor, ou sobrou argumento                           |
| `botai: tipo desconhecido "celular" (use cpf, cnpj, rg, pis, titulo, cartao)` | o tipo não é um dos seis (diferencia maiúsculas: `CPF` também cai aqui) |

Um valor inválido não é erro de uso: o `validar` escreve `inválido` no stdout e sai com 1.

```bash testar=2
botai validar celular 11999999999
```

### Aviso que não é erro {#cli-aviso}

Sem `--semente`, o `botai pessoas --formato csv` escreve a semente sorteada no stderr e sai com 0, porque o CSV não tem onde guardá-la:

```text
botai: semente 75bf48f551f1dd10, hoje 2026-10-08
```

As mensagens do `botai serve` estão em [Erros de partida](#servidor-partida).

## Servidor {#servidor}

O `botai serve` erra de dois jeitos. Na partida, ele escreve uma linha no stderr e o processo termina. Depois de no ar, um pedido errado recebe um status HTTP e um JSON `{"erro": "..."}`, e o servidor continua atendendo.

### Erros de partida {#servidor-partida}

A linha começa com `botai:`. O código de saída 1 é a porta ocupada; os erros de uso saem com 2.

| Mensagem no stderr                                                                                                  | Saída | Quando                                |
| ------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------- |
| `botai: a porta 8790 já está em uso em 127.0.0.1; escolha outra com --porta`                                        | 1     | outro processo já escuta nessa porta  |
| `botai: --porta inválida: 70000 (de 0 a 65535; 0 escolhe uma livre)`                                                | 2     | porta fora de 0 a 65535               |
| `botai: sem permissão para a porta 80 em 127.0.0.1 (abaixo de 1024 costuma exigir root); escolha outra com --porta` | 2     | o sistema não deixa abrir a porta     |
| `botai: --host inválido: 10.255.255.1 (use um endereço desta máquina, como 127.0.0.1 ou 0.0.0.0)`                   | 2     | o endereço não é desta máquina        |
| `botai: argumento inesperado: extra (uso: botai serve [--porta 8790] [--host 127.0.0.1])`                           | 2     | sobrou um argumento depois do `serve` |

Mais sobre a partida em [Subir o servidor](../servidor/botai-serve.md#erros-de-partida).

### Erros das rotas {#servidor-rotas}

Toda resposta de erro é JSON, com `Content-Type: application/json; charset=utf-8`:

```json
{
  "erro": "n inválido: 10001 (um inteiro de 1 a 10000)"
}
```

A mensagem diz qual parâmetro está errado. Os exemplos abaixo são as respostas reais aos pedidos da coluna "Pedido".

| Status | Pedido                                        | `erro`                                                                                                                                                       |
| ------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 400    | `/pessoa?dominio-email=example.com`           | `parâmetro desconhecido: dominio-email (aceitos: semente, hoje, uf, dominioEmail, cartao, cenario)`                                                          |
| 400    | `/pessoas?n=2&x=1`                            | `parâmetro desconhecido: x (aceitos: semente, hoje, uf, dominioEmail, cartao, cenarios, n, formato, dialeto, tabela, campos)`                                |
| 400    | `/pessoa?semente=1&semente=2`                 | `parâmetro repetido: semente`                                                                                                                                |
| 400    | `/pessoa?semente=`                            | `parâmetro vazio: semente`                                                                                                                                   |
| 400    | `/pessoas?semente=x`                          | `falta o n (de 1 a 10000) ou os cenarios`                                                                                                                    |
| 400    | `/pessoas?n=10001`                            | `n inválido: 10001 (um inteiro de 1 a 10000)`                                                                                                                |
| 400    | `/pessoas?n=2&formato=xml`                    | `formato inválido: xml (use json, ndjson, csv, sql)`                                                                                                         |
| 400    | `/pessoas?n=2&dialeto=mysql`                  | `dialeto só vale com formato=sql`                                                                                                                            |
| 400    | `/pessoas?n=2&formato=csv&tabela=x`           | `tabela só vale com formato=sql`                                                                                                                             |
| 400    | `/pessoas?n=2&campos=nome`                    | `campos só vale com formato=csv ou formato=sql`                                                                                                              |
| 400    | `/pessoas?n=2&formato=sql&dialeto=MySQL`      | `dialeto desconhecido "MySQL" (use postgres, mysql, sqlite)`                                                                                                 |
| 400    | `/pessoas?n=2&formato=sql&tabela=a.b.c`       | `tabela inválida "a.b.c" (letras, dígitos e _, até 63 caracteres; opcionalmente esquema.tabela)`                                                             |
| 400    | `/pessoa?uf=XX`                               | `uf: uf desconhecida "XX" (use uma das 27 siglas, ex.: SP)`                                                                                                  |
| 400    | `/pessoa?hoje=05/10/2026`                     | `hoje: hoje precisa ser uma data AAAA-MM-DD que existe, recebido "05/10/2026"`                                                                               |
| 400    | `/pessoa?dominioEmail=nao%20dominio`          | `dominioEmail: domínio de e-mail inválido "nao dominio" (ex.: example.com)`                                                                                  |
| 400    | `/pessoa?cartao=pagarme&cenario=recusado-cvc` | `cenario: cenário desconhecido "recusado-cvc" para o provedor pagarme (use aprovado, recusado, pendente, pendente-recusado, pendente-cancelado, chargeback)` |
| 400    | `/pessoas?n=5&cenarios=recusado:10`           | `n: n (5) diferente da soma dos cenários (10)`                                                                                                               |
| 400    | `/pessoas?cenarios=aprovado:10001`            | `cenarios: a soma dos cenários (10001) passa do limite de 10000 pessoas`                                                                                     |
| 404    | `/nada`                                       | `rota desconhecida: /nada (rotas: /pessoa, /pessoas, /saude)`                                                                                                |
| 405    | `POST /pessoa`                                | `método POST não aceito: use GET`, com o cabeçalho `Allow: GET`                                                                                              |

- Coluna desconhecida em `campos` também dá 400. A mensagem começa com `campos: coluna desconhecida "xyz"` e lista as 35 colunas aceitas (estão em [Colunas](./colunas.md)).
- HEAD e OPTIONS também dão 405 com `Allow: GET`. Na resposta a HEAD não vem corpo.
- O `/saude` ignora parâmetros que não conhece e responde 200.

Para mostrar a resposta de erro num script, use `curl -sS`, que sai com 0. Com `curl -fsS`, o curl não imprime o corpo e sai com 22 em qualquer status 400 ou mais:

```bash testar
curl -sS 'http://127.0.0.1:8790/pessoas?n=10001'
```

```bash testar=22
curl -fsS 'http://127.0.0.1:8790/pessoas?n=10001'
```

A API inteira está em [API HTTP](../servidor/api-http.md).
