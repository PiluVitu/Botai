---
title: Gerar um lote
description: gerarPessoas(n, opcoes) gera até 100 000 pessoas sem CPF, e-mail ou CNPJ repetido, com a semente S/i e prefixo estável.
sidebar_position: 3
---

`gerarPessoas(n, opcoes?)` devolve um array de `n` pessoas. As opções são as mesmas de `gerarPessoa`: `semente`, `hoje`, `uf`, `dominioEmail` e `cartao` ([as opções](./gerar-pessoa.md#opcoes)). No lote, o `cartao` aceita também `cenarios` ([Cenários de cartão](#cenarios)).

```js
import { gerarPessoas } from '@pilutech/botai-core'

const lote = gerarPessoas(3, { semente: 'carga', hoje: '2026-10-05' })
for (const p of lote) console.log(p.nome.completo, p.cpf, p.email.endereco)
```

```text
Felipe Ferreira Alves 742.362.591-41 felipe-alves-6504@tuamaeaquelaursa.com
Júlia Ribeiro Carvalho 107.696.435-40 julia-carvalho-1331@tuamaeaquelaursa.com
Gabriela Pereira Monteiro 650.058.034-67 gabriela-monteiro-0259@tuamaeaquelaursa.com
```

## Sem repetir CPF, e-mail nem CNPJ

Dentro do mesmo lote, o e-mail, o CPF e o CNPJ não se repetem: o lote cabe numa tabela com essas colunas `UNIQUE`. Num lote de 100 000, os 100 000 CPFs, os 100 000 e-mails e os 100 000 CNPJs são distintos.

- A unicidade vale só dentro do lote. Dois lotes de sementes diferentes podem repetir valores.
- Os nomes se repetem: cerca de 8,6 a 8,7 mil nomes distintos em 10 000 pessoas.
- Com `uf` fixa, 24 das 27 UFs têm um CEP só, e o lote inteiro recebe o mesmo endereço. Não dá para pedir um lote com algumas UFs: é uma UF ou todas.

## O tamanho: de 0 a 100 000

`n` vai de 0 a `LIMITE_DO_LOTE` (100 000). Fora disso, `gerarPessoas` lança `ErroDeOpcao` com `opcao` igual a `'n'`.

```js
import { ErroDeOpcao, LIMITE_DO_LOTE, gerarPessoas } from '@pilutech/botai-core'

console.log(LIMITE_DO_LOTE)
try {
  gerarPessoas(LIMITE_DO_LOTE + 1, { semente: 'carga', hoje: '2026-10-05' })
} catch (erro) {
  if (erro instanceof ErroDeOpcao) console.log(erro.opcao, '→', erro.message)
  else throw erro
}
```

```text
100000
n → n precisa ser um inteiro de 0 a 100000, recebido 100001
```

## Cenários de cartão {#cenarios}

`cartao: { provedor, cenarios }` diz quantas pessoas saem em cada cenário do cartão. Elas saem em grupos, na ordem das chaves do objeto, e o `n` tem de ser a soma:

```js
import { gerarPessoas } from '@pilutech/botai-core'

const lote = gerarPessoas(13, {
  semente: 'checkout',
  hoje: '2026-10-05',
  cartao: {
    provedor: 'pagarme',
    cenarios: { recusado: 10, aprovado: 2, pendente: 1 },
  },
})
console.log(lote.map((p) => p.cartao.cenario).join(' '))
console.log(
  lote[0].cartao.numero,
  lote[10].cartao.numero,
  lote[12].cartao.numero,
)
const sem = gerarPessoas(13, { semente: 'checkout', hoje: '2026-10-05' })
console.log(lote.every((p, i) => p.cpf === sem[i].cpf))
```

```text
recusado recusado recusado recusado recusado recusado recusado recusado recusado recusado aprovado aprovado pendente
4000000000000028 4000000000000010 4000000000000036
true
```

- As pessoas são as mesmas do lote sem cenários: a pessoa `i` continua sendo a da semente `S/i`, e e-mail, CPF e CNPJ não se repetem no lote inteiro. Só o cartão muda.
- `cartao: { provedor }` sem `cenarios` deixa todas no `aprovado`; `cartao: { cenario }` põe todas no mesmo cenário. `cenario` e `cenarios` juntos lançam `ErroDeOpcao` com `opcao` `'cenarios'`.
- Quantidade é um inteiro de 1 em diante, sem cenário repetido. Um `n` diferente da soma lança `ErroDeOpcao` com `opcao` `'n'`:

```text
n → n (12) diferente da soma dos cenários (13)
```

## A semente de cada pessoa {#semente-de-cada-pessoa}

A pessoa `i` do lote (a partir de 0) vem da semente `S/i`. Se ela repetir o CPF, o e-mail ou o CNPJ de uma anterior, é sorteada de novo com `S/i/2`, `S/i/3`… Em 100 000 pessoas houve 524 novos sorteios (0,52%), com no máximo 3 tentativas.

```js
import { gerarPessoa, gerarPessoas } from '@pilutech/botai-core'

const lote = gerarPessoas(3, { semente: 'carga', hoje: '2026-10-05' })
const primeira = gerarPessoa({ semente: 'carga/0', hoje: '2026-10-05' })
console.log(primeira.cpf === lote[0].cpf)
```

```text
true
```

`gerarPessoas` devolve só as pessoas. A semente que valeu para cada uma aparece no ndjson da CLI, uma por linha:

```bash testar
botai pessoas -n 1000 --semente mil-3 --hoje 2026-10-05 --formato ndjson | sed -n 972p | cut -c1-80
```

```text
{"formato":2,"motor":"0.5.0","semente":"mil-3/971/2","hoje":"2026-10-05","pessoa
```

A pessoa 971 do lote `mil-3` precisou de um segundo sorteio. Com essa semente, `gerarPessoa({ semente: 'mil-3/971/2', hoje: '2026-10-05' })` recria só ela.

:::danger

`gerarPessoa({ semente: 'carga' })` **não** é a primeira pessoa de `gerarPessoas(n, { semente: 'carga' })`. A do lote vem de `carga/0`.

```js
import { gerarPessoa, gerarPessoas } from '@pilutech/botai-core'

const avulsa = gerarPessoa({ semente: 'carga', hoje: '2026-10-05' })
const [primeiraDoLote] = gerarPessoas(1, {
  semente: 'carga',
  hoje: '2026-10-05',
})
console.log(avulsa.cpf, primeiraDoLote.cpf)
```

```text
421.817.138-63 742.362.591-41
```

:::

## Prefixo estável

As primeiras `k` pessoas de um lote de `n` são o lote de `k`. Dá para aumentar o `n` de uma semente sem mudar as pessoas já usadas.

```js
import { gerarPessoas } from '@pilutech/botai-core'

const dez = gerarPessoas(10, { semente: 'carga', hoje: '2026-10-05' })
const tres = gerarPessoas(3, { semente: 'carga', hoje: '2026-10-05' })
console.log(JSON.stringify(dez.slice(0, 3)) === JSON.stringify(tres))
```

```text
true
```

## O envelope do lote

`gerarEnvelopeDasPessoas(n, opcoes?)` devolve `{ formato, motor, semente, hoje, pessoas }`, o mesmo de `botai pessoas --formato json`.

```js
import { gerarEnvelopeDasPessoas } from '@pilutech/botai-core'

const envelope = gerarEnvelopeDasPessoas(3, {
  semente: 'carga',
  hoje: '2026-10-05',
})
console.log(Object.keys(envelope), envelope.pessoas.length)
```

```text
[ 'formato', 'motor', 'semente', 'hoje', 'pessoas' ] 3
```

## Quanto tempo leva

Medido em 2026-10-08, macOS arm64, numa máquina compartilhada (há variação):

| Runtime      | 10 000 pessoas | 100 000 pessoas |
| ------------ | -------------- | --------------- |
| Node 22.22.3 | 160 a 204 ms   | 1,8 a 2,7 s     |
| Bun 1.3.14   | 83 a 124 ms    | 0,83 a 0,94 s   |
| Deno 2.7.14  | 113 a 140 ms   | 1,18 a 1,22 s   |

`gerarPessoas` monta o array inteiro em memória. Para gravar um lote grande em arquivo, a CLI escreve ndjson, csv e sql aos poucos, em cerca de 130 MiB com 100 000 pessoas ([o lote na CLI](../cli/pessoas.md)).

Para virar CSV ou SQL dentro do código, veja [Visão plana, CSV e SQL](./plano-csv-sql.md).
