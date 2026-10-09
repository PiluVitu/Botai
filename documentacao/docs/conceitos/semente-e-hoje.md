---
title: Semente e hoje
description: As regras da semente e do hoje, o que fixar para reproduzir uma pessoa e por que botai pessoa X não é a 1ª pessoa de botai pessoas X.
sidebar_position: 2
---

A pessoa sai de duas entradas: a **semente** e o **hoje**. Com as duas fixas e a mesma versão do pacote, a pessoa é a mesma em qualquer máquina e em qualquer porta.

## Reproduzir exige semente, hoje e versão {#reproduzir}

- **Semente:** sem ela, o Botaí sorteia uma e a devolve no envelope.
- **Hoje:** sem ele, vale a data de hoje em São Paulo, e a mesma semente gera outra pessoa no dia seguinte.
- **Versão:** mudar a pessoa de uma semente é versão major; na série 0.x, é a minor. Fixe a versão exata ([Versões e dourados](./versoes-e-dourados.md)).

A prova: a semente `verificador-1` com o hoje `2026-10-05` deu a mesma pessoa, com 43 de 43 campos iguais, em 15 saídas: a biblioteca no Node, no Bun e no Deno, a CLI, o servidor, a imagem, o binário, o `npx` e o fixture do Playwright nos 3 navegadores. As 8 saídas JSON de texto fora do Playwright têm o mesmo sha256:

```bash testar
botai pessoa --semente verificador-1 --hoje 2026-10-05 | shasum -a 256
```

```text
98263bab0f89549d7b4c67ced2bc7b5f07b1b6dc919ae9364794ffc2c79013ef  -
```

A pessoa é Rafael Rocha Araújo, CPF 481.343.522-00 (região 2 = RR), de Boa Vista (RR), CEP 69301-000, DDD 95 e título 6599 9268 2607 (código 26 = RR).

## A semente {#semente}

A semente é um **inteiro seguro** (negativo vale) ou um **texto de 1 a 256 caracteres** sem caractere de controle.

- `42` (número) e `'42'` (texto) são a mesma semente. A CLI, que recebe sempre texto, gera a mesma pessoa que `gerarPessoa({ semente: 42 })`.
- O texto é normalizado em NFC antes do hash: o mesmo nome em NFC ou em NFD é a mesma semente.

```bash testar
nfc=$(printf 'S\303\243o Lu\303\255s')
nfd=$(printf 'Sa\314\203o Lui\314\201s')
test "$nfc" != "$nfd"
cmp <(botai pessoa --semente "$nfc" --hoje 2026-10-05) \
  <(botai pessoa --semente "$nfd" --hoje 2026-10-05) && echo "a mesma pessoa"
```

```text
a mesma pessoa
```

Semente vazia ou com mais de 256 caracteres é erro de uso (saída 2):

```bash testar=2
botai pessoa --semente "" --hoje 2026-10-05
```

```text
botai: --semente: semente vazia
```

```bash testar=2
botai pessoa --semente "$(head -c 257 /dev/zero | tr '\0' a)" --hoje 2026-10-05
```

```text
botai: --semente: semente com mais de 256 caracteres
```

### Sem semente

Sem `--semente`, a CLI sorteia uma. No envelope JSON, ela sai no campo `semente`; no SQL, na 1ª linha; no CSV, que não tem onde guardá-la, ela sai no stderr:

```bash testar
botai pessoas -n 2 --formato csv --campos nome,cpf > pessoas.csv
```

```text
botai: semente 4ee22906d1dfedd2, hoje 2026-10-08
```

Guarde essa linha: com ela, você gera o mesmo CSV de novo.

```bash testar
botai pessoas -n 2 --formato csv --campos nome,cpf > primeiro.csv 2> semente.txt
semente=$(sed -E 's/^botai: semente ([0-9a-f]+), hoje .*$/\1/' semente.txt)
hoje=$(sed -E 's/^.*, hoje (.*)$/\1/' semente.txt)
botai pessoas -n 2 --semente "$semente" --hoje "$hoje" --formato csv --campos nome,cpf > segundo.csv
cmp primeiro.csv segundo.csv && echo "o mesmo CSV"
```

```text
o mesmo CSV
```

## O hoje {#hoje}

O hoje é uma data `AAAA-MM-DD`. A pessoa guarda a idade, e o hoje decide a data de nascimento e a validade do cartão. De um dia para o outro, a mesma semente muda:

```bash testar=1
diff <(botai pessoa --semente 42 --hoje 2026-10-05) \
  <(botai pessoa --semente 42 --hoje 2026-10-06)
```

```text
5c5
<   "hoje": "2026-10-05",
---
>   "hoje": "2026-10-06",
18,19c18,19
<       "iso": "1970-02-26",
<       "br": "26/02/1970",
---
>       "iso": "1970-02-27",
>       "br": "27/02/1970",
```

Use datas reais, como a do dia em que o teste foi escrito. Data em outro formato é erro de uso:

```bash testar=2
botai pessoa --semente 42 --hoje 05/10/2026
```

```text
botai: --hoje: hoje precisa ser uma data AAAA-MM-DD que existe, recebido "05/10/2026"
```

Sem hoje, a CLI, o servidor e a biblioteca usam a data de hoje em São Paulo. Na biblioteca, essa data sai de `hojeEmSaoPaulo()`.

## Pessoa X não é a 1ª de pessoas X {#pessoa-x-pessoas-x}

:::danger

`botai pessoa --semente X` não é a primeira pessoa de `botai pessoas --semente X`. No lote, a pessoa `i` vem da semente `X/i`, e a primeira é `X/0`. Um teste que gera uma pessoa com `pessoa` e procura a mesma no banco semeado com `pessoas` não acha nada, sem erro.

:::

```bash testar
botai pessoa --semente demo --hoje 2026-10-08 | grep '"cpf"'
botai pessoas -n 1 --semente demo --hoje 2026-10-08 --formato ndjson | grep -o '"cpf":"[^"]*"'
botai pessoa --semente demo/0 --hoje 2026-10-08 | grep '"cpf"'
```

```text
    "cpf": "022.889.741-68",
"cpf":"550.160.642-96"
    "cpf": "550.160.642-96",
```

Para ter sozinha uma pessoa do lote, use a semente dela: `demo/0`, `demo/1`… O ndjson traz a semente exata de cada linha ([Lote e unicidade](./lote-e-unicidade.md)).

## Em cada porta {#portas}

| Porta             | Semente                                                               | Hoje                        |
| ----------------- | --------------------------------------------------------------------- | --------------------------- |
| CLI e binário     | `--semente S`                                                         | `--hoje AAAA-MM-DD`         |
| Servidor e imagem | `?semente=S` (sem ela, sorteia uma de 16 hex e a devolve no envelope) | `?hoje=AAAA-MM-DD`          |
| Biblioteca        | `gerarPessoa({ semente })`                                            | `gerarPessoa({ hoje })`     |
| Fixture           | `botaiSemente` (padrão: `projeto › arquivo › describe › título`)      | `botaiHoje`                 |
| Extensão          | não tem: cada pessoa nova é sorteada com crypto                       | a data de hoje em São Paulo |

No fixture do Playwright, a semente padrão é `projeto › arquivo › describe › título`. Ela é estável entre retries e workers, mas renomear o teste troca a pessoa, e cada navegador recebe uma pessoa diferente. Para ter a mesma em todos, fixe `botaiSemente` ([Opções do fixture](../playwright/opcoes.md)).

Na extensão, a pessoa fica guardada até você pedir outra, e a idade é recalculada pela data de hoje em São Paulo.
