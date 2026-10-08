---
title: Primeira pessoa
description: Gere a mesma pessoa em um minuto pela CLI, pelo servidor HTTP, pela imagem Docker e pela biblioteca, com a semente 42.
sidebar_position: 2
---

A semente `42` com o hoje `2026-10-05` gera sempre a mesma pessoa: Márcio Carvalho Rodrigues, de São Luís (MA). Escolha a porta que você tem à mão; o resultado é o mesmo em todas.

## Pela CLI {#pela-cli}

Onde houver Node, sem instalar nada:

```bash
npx -y @pilutech/botai-core@0.4.1 pessoa --semente 42 --hoje 2026-10-05
```

Com o `botai` no PATH (pelo [binário](./instalacao.md#binario)), o comando fica mais curto:

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05
```

A saída é um envelope com a pessoa:

<!-- prettier-ignore -->
```json
{
  "formato": 1,
  "motor": "0.4.1",
  "semente": "42",
  "hoje": "2026-10-05",
  "pessoa": {
    "nome": {
      "sexo": "M",
      "prenome": "Márcio",
      "sobrenomes": [
        "Carvalho",
        "Rodrigues"
      ],
      "completo": "Márcio Carvalho Rodrigues",
      "noCartao": "MARCIO C RODRIGUES"
    },
    "nascimento": {
      "iso": "1970-02-26",
      "br": "26/02/1970",
      "idade": 56
    },
    "cpf": "634.132.403-07",
    "rg": {
      "numero": "92.957.904-5",
      "orgaoEmissor": "SSP",
      "uf": "SP"
    },
    "pis": "166.24491.26-5",
    "tituloEleitor": "5022 4149 1171",
    "celular": {
      "ddd": "98",
      "numero": "97702-9128",
      "formatado": "(98) 97702-9128",
      "digitos": "98977029128",
      "e164": "+5598977029128"
    },
    "email": {
      "usuario": "marcio-rodrigues-0337",
      "endereco": "marcio-rodrigues-0337@tuamaeaquelaursa.com",
      "caixaUrl": "https://tuamaeaquelaursa.com/marcio-rodrigues-0337"
    },
    "senha": "g4JXwr#&PM8r",
    "endereco": {
      "cep": "65071-377",
      "logradouro": "Avenida Litorânea",
      "bairro": "Calhau",
      "cidade": "São Luís",
      "uf": "MA",
      "ddd": "98",
      "numero": "199",
      "complemento": "Apto 171"
    },
    "empresa": {
      "razaoSocial": "Carvalho & Rodrigues Engenharia Ltda",
      "nomeFantasia": "Rodrigues Store",
      "cnpj": "90.849.558/0001-39"
    },
    "cartao": {
      "bandeira": "mastercard",
      "numero": "5555555555554444",
      "numeroFormatado": "5555 5555 5555 4444",
      "titular": "MARCIO C RODRIGUES",
      "validade": "11/28",
      "mes": "11",
      "ano": "28",
      "cvv": "388"
    }
  }
}
```

Repare na coerência: o 9º dígito do CPF (3) é a região fiscal do Maranhão, o DDD do celular (98) é o do CEP, e o título traz o código do Maranhão nos dígitos 9 e 10 (11). Cada campo está explicado em [A pessoa](../conceitos/a-pessoa.md).

## Pelo servidor HTTP

Suba o servidor num terminal. Ele escuta em `127.0.0.1:8790` e avisa no stderr:

```bash
npx -y @pilutech/botai-core@0.4.1 serve
```

```text
botai serve: ouvindo em http://127.0.0.1:8790 (Ctrl+C encerra)
```

Em outro terminal, peça a mesma pessoa:

```bash testar
curl -fsS 'http://127.0.0.1:8790/pessoa?semente=42&hoje=2026-10-05'
```

O corpo é igual, byte a byte, ao da CLI:

```bash testar
diff <(botai pessoa --semente 42 --hoje 2026-10-05) \
  <(curl -fsS 'http://127.0.0.1:8790/pessoa?semente=42&hoje=2026-10-05') \
  && echo "a mesma pessoa"
```

```text
a mesma pessoa
```

As rotas e os parâmetros estão em [API HTTP](../servidor/api-http.md).

## Pela imagem Docker

Sem Node, a imagem roda a CLI inteira:

```bash
docker run --rm ghcr.io/piluvitu/botai:0.4.1 pessoa --semente 42 --hoje 2026-10-05
```

Sem argumentos, ela sobe o servidor na porta 8790, e o mesmo `curl` de cima funciona:

```bash
docker run --rm -p 8790:8790 ghcr.io/piluvitu/botai:0.4.1
```

Mais em [A imagem](../docker/imagem.md).

## Pela biblioteca

No seu projeto JS ou TS, instale o pacote com a versão exata:

```bash
npm install --save-dev --save-exact @pilutech/botai-core@0.4.1
```

E gere a pessoa no código:

```js title="primeira.mjs"
import { gerarPessoa } from '@pilutech/botai-core'

const pessoa = gerarPessoa({ semente: 42, hoje: '2026-10-05' })
console.log(pessoa.nome.completo, pessoa.cpf, pessoa.endereco.cidade)
```

```text
Márcio Carvalho Rodrigues 634.132.403-07 São Luís
```

`gerarPessoa` devolve só a pessoa, sem o envelope. A semente `42` (número) e a `'42'` (texto) são a mesma. Mais em [Gerar uma pessoa](../biblioteca/gerar-pessoa.md).

## E no navegador

A extensão não usa semente: cada pessoa nova é sorteada. Instale pela loja ([Instalação](./instalacao.md#extensao)) e aperte o atalho num formulário: `⌥⇧P` no Mac, `Ctrl+Shift+Y` no Windows e no Linux, `Alt+Shift+P` no Firefox para Linux.

## Próximos passos

- [Semente e hoje](../conceitos/semente-e-hoje.md): o que fixar para reproduzir uma pessoa.
- [Lote e unicidade](../conceitos/lote-e-unicidade.md): muitas pessoas de uma vez, sem CPF repetido.
- [Escolha a sua porta](./escolha-sua-porta.md): qual porta serve para o seu caso.
