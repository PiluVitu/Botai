---
title: Lote e unicidade
description: Como o lote deriva a semente de cada pessoa, o re-sorteio que evita CPF, e-mail e CNPJ repetidos, o prefixo estável e os limites de n.
sidebar_position: 3
---

Lote é um conjunto de pessoas geradas de uma vez: `botai pessoas -n N`, `GET /pessoas?n=N` ou `gerarPessoas(n)`. Dentro de um lote, nenhuma pessoa repete o CPF, o e-mail ou o CNPJ de outra.

## A semente de cada pessoa {#semente-de-cada-pessoa}

No lote de semente `S`, a pessoa `i` (a partir de 0) vem da semente `S/i`. O ndjson traz um envelope por linha, cada um com a semente exata da pessoa:

```bash testar
botai pessoas -n 3 --semente demo --hoje 2026-10-08 --formato ndjson \
  | grep -o '"semente":"[^"]*"'
```

```text
"semente":"demo/0"
"semente":"demo/1"
"semente":"demo/2"
```

Por isso `botai pessoa --semente demo` não é a primeira pessoa de `botai pessoas --semente demo`: a do lote é `demo/0` ([Semente e hoje](./semente-e-hoje.md#pessoa-x-pessoas-x)).

## O re-sorteio {#re-sorteio}

Se a pessoa `S/i` repetir o CPF, o e-mail ou o CNPJ de uma anterior, ela é sorteada de novo com `S/i/2`, `S/i/3`… No lote `mil-3`, a pessoa 971 precisou de uma segunda tentativa:

```bash testar
botai pessoas -n 1000 --semente mil-3 --hoje 2026-10-05 --formato ndjson \
  | grep -o '"semente":"mil-3/97[0-2][^"]*"'
```

```text
"semente":"mil-3/970"
"semente":"mil-3/971/2"
"semente":"mil-3/972"
```

Em 100 000 pessoas houve 524 re-sorteios (0,52%), com no máximo 3 tentativas. O limite é de 1000 tentativas por pessoa.

Para recriar uma pessoa só de um lote que falhou, passe a semente da linha para `botai pessoa`:

```bash testar
botai pessoas -n 1000 --semente mil-3 --hoje 2026-10-05 --formato ndjson > lote.ndjson
sed -n 972p lote.ndjson | grep -o '"cpf":"[^"]*"'
botai pessoa --semente mil-3/971/2 --hoje 2026-10-05 | grep '"cpf"'
```

```text
"cpf":"501.440.843-50"
    "cpf": "501.440.843-50",
```

## O que é único {#unicidade}

O CPF, o e-mail e o CNPJ não repetem dentro do mesmo lote, até 100 000 pessoas. Isso combina com colunas `UNIQUE` no banco.

```bash testar
botai pessoas -n 100000 --semente carga --hoje 2026-10-05 \
  --formato csv --campos cpf,email,empresa_cnpj > lote.csv
for coluna in 1 2 3; do
  nome=$(head -n 1 lote.csv | tr -d '\r' | cut -d, -f"$coluna")
  repetidos=$(tail -n +2 lote.csv | cut -d, -f"$coluna" | sort | uniq -d | wc -l | tr -d ' ')
  echo "$nome: $repetidos repetidos"
done
```

```text
cpf: 0 repetidos
email: 0 repetidos
empresa_cnpj: 0 repetidos
```

O resto pode repetir:

- **Nomes:** há 34 800 nomes completos possíveis, e um lote de 10 000 tem cerca de 8,6 a 8,7 mil distintos.
- **Endereço:** há só 34 CEPs. Com `--uf` fixa, 24 das 27 UFs têm um CEP só, e o lote inteiro recebe o mesmo endereço.
- **Entre lotes:** a unicidade vale dentro do mesmo lote. Dois lotes com sementes diferentes podem repetir um CPF.

```bash testar
botai pessoas -n 10000 --semente carga --hoje 2026-10-05 --formato csv --campos nome \
  | tail -n +2 | sort -u | wc -l | tr -d ' '
```

```text
8722
```

## Prefixo estável {#prefixo-estavel}

As primeiras `k` pessoas de um lote de `n` são o lote de `k`. Você pode aumentar o `-n` de um seed sem mudar as pessoas que os testes já usam:

```bash testar
diff <(botai pessoas -n 3 --semente carga --hoje 2026-10-05 --formato csv) \
  <(botai pessoas -n 10 --semente carga --hoje 2026-10-05 --formato csv | head -n 4) \
  && echo "as 3 primeiras de -n 10 são as de -n 3"
```

```text
as 3 primeiras de -n 10 são as de -n 3
```

## Limites de n {#limites-de-n}

| Porta      | n                                             |
| ---------- | --------------------------------------------- |
| CLI        | de 0 a 100 000                                |
| Biblioteca | de 0 a 100 000 (a constante `LIMITE_DO_LOTE`) |
| Servidor   | de 1 a 10 000 por requisição                  |

Fora da faixa, a CLI dá erro de uso (saída 2) e o servidor responde 400:

```bash testar=2
botai pessoas -n 100001 --semente carga --hoje 2026-10-05 --formato ndjson
```

```text
botai: -n: n precisa ser um inteiro de 0 a 100000, recebido 100001
```

```bash testar
curl -sS 'http://127.0.0.1:8790/pessoas?n=10001'
```

```json
{
  "erro": "n inválido: 10001 (um inteiro de 1 a 10000)"
}
```

Na biblioteca, `gerarPessoas` lança `ErroDeOpcao`, com o campo `opcao` igual a `'n'`.

### Memória e formato

O `--formato json` monta o lote inteiro em memória: cerca de 1,5 GB de RSS com 100 000 pessoas. O ndjson, o csv e o sql saem em streaming, em cerca de 130 MiB. Para lote grande, use um dos três (medido em 2026-10-08, macOS arm64, Node 22.22.3).

O servidor monta o corpo inteiro em memória, sem streaming, e uma requisição grande atrasa as outras. Os números estão em [Números](../referencia/numeros.md).
