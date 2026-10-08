---
title: Reproduzir uma falha
description: Como achar a semente e o hoje de um teste que falhou no relatório do Playwright e recriar a mesma pessoa, dentro ou fora dele.
sidebar_position: 5
---

## O que vai para o relatório

| O quê                                  | Quando                                                             |
| -------------------------------------- | ------------------------------------------------------------------ |
| anotação `botai-semente`               | em todo teste que pede o fixture `botai`                           |
| anotação `botai-hoje`                  | em todo teste que pede o fixture `botai`                           |
| anexo `botai-pessoa.json` (o envelope) | só na falha inesperada: `test.fail()` e teste que passa não anexam |

Teste que não pede o fixture `botai` não ganha nem as anotações nem o anexo.

O anexo é o envelope, com `formato`, `motor`, `semente`, `hoje` e `pessoa`. No CI, as anotações e o anexo trazem a pessoa de cada falha para o relatório do Playwright.

## Recriar a pessoa fora do Playwright

Suponha que o relatório mostra a semente `chromium › cadastro.spec.ts › cadastro` e o hoje `2026-10-08`. Sem instalar nada, onde houver Node:

```bash
npx -y @pilutech/botai-core@0.4.1 pessoa --semente "chromium › cadastro.spec.ts › cadastro" --hoje 2026-10-08
```

Com a CLI `botai` instalada:

```bash testar
botai pessoa --semente "chromium › cadastro.spec.ts › cadastro" --hoje 2026-10-08
```

<!-- prettier-ignore -->
```json
{
  "formato": 1,
  "motor": "0.4.1",
  "semente": "chromium › cadastro.spec.ts › cadastro",
  "hoje": "2026-10-08",
  "pessoa": {
    "nome": {
      "sexo": "F",
      "prenome": "Larissa",
      "sobrenomes": [
        "Barbosa",
        "Conceição"
      ],
      "completo": "Larissa Barbosa Conceição",
      "noCartao": "LARISSA B CONCEICAO"
    },
    "nascimento": {
      "iso": "1979-04-28",
      "br": "28/04/1979",
      "idade": 47
    },
    "cpf": "618.628.678-95",
    "rg": {
      "numero": "77.997.946-1",
      "orgaoEmissor": "SSP",
      "uf": "SP"
    },
    "pis": "191.29545.16-4",
    "tituloEleitor": "7213 5518 0183",
    "celular": {
      "ddd": "13",
      "numero": "97472-5145",
      "formatado": "(13) 97472-5145",
      "digitos": "13974725145",
      "e164": "+5513974725145"
    },
    "email": {
      "usuario": "larissa-conceicao-4809",
      "endereco": "larissa-conceicao-4809@tuamaeaquelaursa.com",
      "caixaUrl": "https://tuamaeaquelaursa.com/larissa-conceicao-4809"
    },
    "senha": "C6p$4LTuQhEH",
    "endereco": {
      "cep": "11060-001",
      "logradouro": "Avenida Ana Costa",
      "bairro": "Gonzaga",
      "cidade": "Santos",
      "uf": "SP",
      "ddd": "13",
      "numero": "213",
      "complemento": "Apto 84"
    },
    "empresa": {
      "razaoSocial": "Barbosa & Conceição Logística Ltda",
      "nomeFantasia": "Conceição Hub",
      "cnpj": "29.197.282/0001-40"
    },
    "cartao": {
      "bandeira": "visa",
      "numero": "4242424242424242",
      "numeroFormatado": "4242 4242 4242 4242",
      "titular": "LARISSA B CONCEICAO",
      "validade": "08/30",
      "mes": "08",
      "ano": "30",
      "cvv": "378"
    }
  }
}
```

Pelo servidor HTTP, a semente vai codificada na URL:

```bash testar
curl -fsS -G 'http://127.0.0.1:8790/pessoa' \
  --data-urlencode 'semente=chromium › cadastro.spec.ts › cadastro' \
  --data-urlencode 'hoje=2026-10-08'
```

O fixture 0.1.0 usa o core 0.4.0, e o anexo diz `motor` 0.4.0. A pessoa é a mesma que o core 0.4.1 gera.

## Recriar a pessoa dentro do teste

Para depurar o teste com a mesma pessoa, fixe as duas opções com os valores das anotações:

```ts
test.use({
  botaiSemente: 'chromium › cadastro.spec.ts › cadastro',
  botaiHoje: '2026-10-08',
})
```

Com a semente fixa, o teste recebe a mesma pessoa mesmo que você o renomeie ou o rode em outro navegador.

## Semente, hoje e versão

Reproduzir exige os três. Sem o hoje, a mesma semente gera outra pessoa no dia seguinte. E mudar a pessoa de uma semente é versão major; na série 0.x, é a minor. Fixe a versão do pacote: veja [versões e dourados](../conceitos/versoes-e-dourados.md).
