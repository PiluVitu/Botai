---
title: Gerar uma pessoa
description: gerarPessoa e as opções da raiz (semente, hoje, uf, dominioEmail e cartao), o ErroDeOpcao, os envelopes e o hojeEmSaoPaulo.
sidebar_position: 2
---

`gerarPessoa(opcoes?)` devolve uma pessoa fictícia e coerente. Com a mesma semente e o mesmo `hoje`, a pessoa é sempre a mesma.

```js
import { gerarPessoa } from '@pilutech/botai-core'

const pessoa = gerarPessoa({ semente: 42, hoje: '2026-10-05' })
console.log(pessoa.nome.completo, pessoa.cpf, pessoa.endereco.cidade)
```

```text
Márcio Carvalho Rodrigues 634.132.403-07 São Luís
```

É a mesma pessoa da CLI e do servidor: o campo `pessoa` do envelope de `botai pessoa` é igual ao objeto de `gerarPessoa`.

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05
```

Os campos, os formatos e o exemplo completo da semente 42 estão em [A pessoa](../conceitos/a-pessoa.md).

## As opções {#opcoes}

Na raiz há cinco opções, todas opcionais:

| Opção          | Valor                                                                                          | Sem ela                               |
| -------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------- |
| `semente`      | um inteiro seguro (negativo vale) ou um texto de 1 a 256 caracteres, sem caractere de controle | sorteia uma (16 dígitos hexadecimais) |
| `hoje`         | uma data `AAAA-MM-DD` que existe                                                               | a data de hoje em São Paulo           |
| `uf`           | uma das 27 siglas, em qualquer caixa                                                           | a UF sai do endereço sorteado         |
| `dominioEmail` | um domínio, como `example.com`                                                                 | `tuamaeaquelaursa.com`, caixa pública |
| `cartao`       | `{ provedor, cenario }`: `stripe` ou `pagarme`, e um cenário do provedor                       | `stripe` e `aprovado`                 |

- `42` e `'42'` são a mesma semente. Um texto em NFC e o mesmo texto em NFD também.
- Não há opção de sexo, idade ou cidade. Para isso, monte a pessoa à mão pelos subpaths ([Documentos e geradores avulsos](./documentos.md)).
- Use datas reais em `hoje`.

:::danger

Sem `hoje`, vale a data de São Paulo, e a mesma semente gera outra pessoa no dia seguinte, sem erro nenhum. Para reproduzir uma pessoa, fixe a semente, o `hoje` e a versão do pacote. Veja [Semente e hoje](../conceitos/semente-e-hoje.md).

:::

### O que cada opção muda

Com a semente 42 e hoje `2026-10-05`:

```js
import { gerarPessoa } from '@pilutech/botai-core'

for (const uf of ['PI', 'RS']) {
  const p = gerarPessoa({ semente: 42, hoje: '2026-10-05', uf })
  console.log(uf, p.cpf, p.endereco.cidade, p.celular.ddd, p.tituloEleitor)
}

const comDominio = gerarPessoa({
  semente: 42,
  hoje: '2026-10-05',
  dominioEmail: 'Example.COM',
})
console.log(comDominio.email)

const em2030 = gerarPessoa({ semente: 42, hoje: '2030-10-05' })
console.log(em2030.nascimento, em2030.cartao.validade)
```

```text
PI 634.132.403-07 Teresina 86 5022 4149 1570
RS 634.132.400-64 Porto Alegre 51 5022 4149 0477
{
  usuario: 'marcio-rodrigues-0337',
  endereco: 'marcio-rodrigues-0337@example.com',
  caixaUrl: null
}
{ iso: '1974-02-26', br: '26/02/1974', idade: 56 } 11/32
```

- **`uf`** muda o endereço, o DDD do celular, o título de eleitor e o CPF. O CPF só muda se a nova UF for de outra região fiscal: MA (a UF sorteada da semente 42) e PI são da região 3, e o CPF fica igual; RS é da região 0. Nome, nascimento, e-mail, senha, empresa e cartão não mudam. O RG continua SSP/SP.
- **`dominioEmail`** muda só `email.endereco` e `email.caixaUrl`, que vira `null`. O domínio sai em minúsculas.
- **`hoje`** mantém a idade e muda a data de nascimento e a validade do cartão.

### Cartão {#cartao}

`cartao: { provedor, cenario }` escolhe o cartão de teste. Muda só o número, a bandeira, o `provedor` e o `cenario` do cartão; a validade, o CVV e o resto da pessoa ficam:

```js
import { gerarPessoa } from '@pilutech/botai-core'

for (const cartao of [
  undefined,
  { provedor: 'pagarme', cenario: 'recusado' },
  { cenario: 'recusado-saldo' },
]) {
  const p = gerarPessoa({ semente: 42, hoje: '2026-10-05', cartao })
  console.log(
    p.cpf,
    p.cartao.numero,
    p.cartao.provedor,
    p.cartao.cenario,
    p.cartao.validade,
    p.cartao.cvv,
  )
}
```

```text
634.132.403-07 5555555555554444 stripe aprovado 11/28 388
634.132.403-07 4000000000000028 pagarme recusado 11/28 388
634.132.403-07 4000000000009995 stripe recusado-saldo 11/28 388
```

Sem `provedor`, vale a `stripe`. Os provedores, os cenários e o que cada um faz estão em [Cartões de teste](../conceitos/cartoes-de-teste.md); a raiz exporta o catálogo como `CATALOGO_DE_CARTOES` ([Documentos](./documentos.md#cartao)).

## Opção inválida: `ErroDeOpcao` {#erro-de-opcao}

Uma opção inválida lança `ErroDeOpcao`. O campo `opcao` diz qual: `'semente'`, `'hoje'`, `'uf'`, `'dominioEmail'`, `'cartao'` (o provedor), `'cenario'`, `'cenarios'` ou `'n'` (os dois últimos, no lote).

```js
import { ErroDeOpcao, gerarPessoa } from '@pilutech/botai-core'

try {
  gerarPessoa({ semente: 42, hoje: '2026-10-05', uf: 'XX' })
} catch (erro) {
  if (erro instanceof ErroDeOpcao) console.log(erro.opcao, '→', erro.message)
  else throw erro
}
```

```text
uf → uf desconhecida "XX" (use uma das 27 siglas, ex.: SP)
```

Outras mensagens, copiadas de uma execução real:

```text
hoje → hoje precisa ser uma data AAAA-MM-DD que existe, recebido "05/10/2026"
hoje → hoje precisa ser uma data AAAA-MM-DD que existe, recebido "2026-02-30"
semente → semente vazia
semente → semente com mais de 256 caracteres
semente → semente com caractere de controle
dominioEmail → domínio de e-mail inválido "localhost" (ex.: example.com)
cartao → provedor de cartão desconhecido "adyen" (use stripe, pagarme)
cenario → cenário desconhecido "recusado-cvc" para o provedor pagarme (use aprovado, recusado, pendente, pendente-recusado, pendente-cancelado, chargeback)
```

## Envelopes {#envelopes}

`gerarEnvelopeDaPessoa(opcoes?)` devolve a pessoa dentro do envelope `{ formato, motor, semente, hoje, pessoa }`, com a semente e o `hoje` que valeram. É o mesmo envelope de `botai pessoa` e de `GET /pessoa`.

```js
import { gerarEnvelopeDaPessoa } from '@pilutech/botai-core'

const envelope = gerarEnvelopeDaPessoa({ semente: 42, hoje: '2026-10-05' })
console.log(envelope.formato, envelope.motor, envelope.semente, envelope.hoje)
console.log(envelope.pessoa.cpf)
```

```text
2 0.5.0 42 2026-10-05
634.132.403-07
```

A semente sai sempre como texto. Sem opções, o envelope traz a semente sorteada e o dia de São Paulo: guarde os dois para recriar a pessoa depois.

```js
import { gerarEnvelopeDaPessoa } from '@pilutech/botai-core'

const { semente, hoje, pessoa } = gerarEnvelopeDaPessoa()
console.log(`semente ${semente}, hoje ${hoje}: ${pessoa.cpf}`)
```

O lote tem o seu envelope, `gerarEnvelopeDasPessoas(n, opcoes?)` ([Gerar um lote](./gerar-pessoas.md)). O contrato do envelope é um JSON Schema 2020-12 que vai no pacote: veja [Envelope e esquema](../conceitos/envelope-e-esquema.md).

## A data de São Paulo: `hojeEmSaoPaulo`

`hojeEmSaoPaulo(agora?)` devolve a data civil de São Paulo, no formato de `hoje`. É a data que a raiz usa quando `hoje` falta.

```js
import { hojeEmSaoPaulo } from '@pilutech/botai-core'

console.log(hojeEmSaoPaulo(new Date('2026-10-08T02:30:00Z')))
```

```text
2026-10-07
```

## O gerador de uma semente: `rngDeSemente`

`rngDeSemente(semente)` devolve o gerador (`sfc32`) que a semente produz. Os geradores avulsos dos subpaths recebem esse gerador como primeiro parâmetro. Veja [Documentos e geradores avulsos](./documentos.md).

## Mais da raiz

A lista completa do que a raiz exporta está em [Referência de subpaths](./referencia-de-subpaths.md).

| Nome                      | O que é                                      |
| ------------------------- | -------------------------------------------- |
| `gerarPessoas`            | o lote ([Gerar um lote](./gerar-pessoas.md)) |
| `gerarEnvelopeDasPessoas` | o lote dentro do envelope                    |
| `LIMITE_DO_LOTE`          | `100000`, o maior lote                       |
| `ErroDeOpcao`             | o erro de opção inválida                     |
