---
title: A pessoa
description: Os campos da pessoa gerada, com formato e exemplo real, as regras de coerência entre eles e o que cada opção muda.
sidebar_position: 1
---

Toda porta gera a mesma pessoa: um objeto com nome, documentos, contato, endereço, empresa e cartão. O exemplo desta página é a semente `42` com o hoje `2026-10-05`, a mesma pessoa de `botai pessoa --semente 42 --hoje 2026-10-05`, de `GET /pessoa?semente=42&hoje=2026-10-05` e de `gerarPessoa({ semente: 42, hoje: '2026-10-05' })`.

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05
```

A saída completa está em [Primeira pessoa](../comecar/primeira-pessoa.md#pela-cli).

## Os campos {#campos}

| Campo           | Formato                                                                                                                                             | Exemplo (semente 42)                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `nome`          | `{ sexo, prenome, sobrenomes[], completo, noCartao }`                                                                                               | `M`, `Márcio`, `["Carvalho","Rodrigues"]`, `Márcio Carvalho Rodrigues`, `MARCIO C RODRIGUES` (no máximo 22 caracteres)          |
| `nascimento`    | `{ iso, br, idade }`; idade de 18 a 65                                                                                                              | `1970-02-26`, `26/02/1970`, `56`                                                                                                |
| `cpf`           | `NNN.NNN.NNN-NN`; o 9º dígito é a região fiscal da UF                                                                                               | `634.132.403-07` (3 = MA)                                                                                                       |
| `rg`            | `{ numero, orgaoEmissor, uf }`, modelo SSP-SP                                                                                                       | `92.957.904-5`, `SSP`, `SP`                                                                                                     |
| `pis`           | `NNN.NNNNN.NN-N`                                                                                                                                    | `166.24491.26-5`                                                                                                                |
| `tituloEleitor` | `NNNN NNNN NNNN`; os dígitos 9 e 10 são o código TSE da UF                                                                                          | `5022 4149 1171` (11 = MA)                                                                                                      |
| `celular`       | `{ ddd, numero, formatado, digitos, e164 }`; o DDD é o do CEP                                                                                       | `98`, `97702-9128`, `(98) 97702-9128`, `98977029128`, `+5598977029128`                                                          |
| `email`         | `{ usuario, endereco, caixaUrl }`; usuário `prenome-sobrenome-NNNN`                                                                                 | `marcio-rodrigues-0337`, `marcio-rodrigues-0337@tuamaeaquelaursa.com`, `https://tuamaeaquelaursa.com/marcio-rodrigues-0337`     |
| `senha`         | 12 caracteres, começa por letra                                                                                                                     | `g4JXwr#&PM8r`                                                                                                                  |
| `endereco`      | `{ cep, logradouro, bairro, cidade, uf, ddd, numero, complemento }`; CEP real, número dentro da faixa e do lado da rua                              | `65071-377`, `Avenida Litorânea`, `Calhau`, `São Luís`, `MA`, `98`, `199`, `Apto 171`                                           |
| `empresa`       | `{ razaoSocial, nomeFantasia, cnpj }`; nome tirado dos sobrenomes, CNPJ com filial 0001                                                             | `Carvalho & Rodrigues Engenharia Ltda`, `Rodrigues Store`, `90.849.558/0001-39`                                                 |
| `cartao`        | `{ bandeira, numero, numeroFormatado, titular, validade, mes, ano, cvv, provedor, cenario }`; cartão de teste da Stripe ou da Pagar.me, por cenário | `mastercard`, `5555555555554444`, `5555 5555 5555 4444`, `MARCIO C RODRIGUES`, `11/28`, `11`, `28`, `388`, `stripe`, `aprovado` |

São 45 valores folha na pessoa e 49 no envelope, que soma `formato`, `motor`, `semente` e `hoje` (veja [Envelope e esquema](./envelope-e-esquema.md)).

## Coerência entre os campos {#coerencia}

Os campos combinam entre si. Num lote de 10 000, cada uma das 15 regras passou em 10 000 de 10 000 pessoas, e a verificação refez a conta em 100 000. As regras, agrupadas:

- CPF, CNPJ, PIS e RG com dígitos verificadores válidos;
- 9º dígito do CPF = região fiscal da UF do endereço;
- título com o código da UF, válido nas duas leituras da regra de SP e MG;
- DDD do celular = DDD do CEP;
- CEP da lista real, com o número dentro da faixa;
- cartão de teste da Stripe ou da Pagar.me, com Luhn válido e validade de 12 a 59 meses a partir do hoje;
- idade de 18 a 65;
- e-mail derivado do nome, com caixa pública.

As tabelas por trás dessas regras (regiões fiscais, códigos do TSE, CEPs) estão em [Os dados por trás](./dados-por-tras.md).

## O que cada opção muda {#opcoes}

A pessoa aceita 5 opções: a semente, o hoje, a UF, o domínio do e-mail e o cartão (o provedor e o cenário, que mudam só o cartão: veja [Cartões de teste](./cartoes-de-teste.md)). A semente e o hoje estão em [Semente e hoje](./semente-e-hoje.md); aqui, o efeito de cada uma sobre a semente `42`.

### UF

`uf` muda o `endereco`, o DDD do `celular` e o `tituloEleitor`. O `cpf` só muda se a nova UF for de outra região fiscal: o Maranhão e o Piauí são da região 3, e o Rio Grande do Sul é da 0.

```bash testar
for uf in PI RS; do
  echo "--uf $uf"
  botai pessoa --semente 42 --hoje 2026-10-05 --uf "$uf" \
    | grep -E '"(cpf|tituloEleitor|formatado|cidade)"'
done
```

```text
--uf PI
    "cpf": "634.132.403-07",
    "tituloEleitor": "5022 4149 1570",
      "formatado": "(86) 97702-9128",
      "cidade": "Teresina",
--uf RS
    "cpf": "634.132.400-64",
    "tituloEleitor": "5022 4149 0477",
      "formatado": "(51) 97702-9128",
      "cidade": "Porto Alegre",
```

Nome, nascimento, e-mail, senha, empresa e cartão não mudam. O RG continua SSP/SP. A UF vale em qualquer caixa (`pi` é `PI`).

### Domínio do e-mail

`dominioEmail` (na CLI, `--dominio-email`) muda só `email.endereco` e `email.caixaUrl`, que vira `null`: um domínio que não é o padrão não tem caixa pública. O domínio sai em minúsculas.

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05 --dominio-email Example.COM \
  | grep -A 4 '"email"'
```

```text
    "email": {
      "usuario": "marcio-rodrigues-0337",
      "endereco": "marcio-rodrigues-0337@example.com",
      "caixaUrl": null
    },
```

### Hoje

`hoje` mantém a idade, mas move a data de nascimento e a validade do cartão:

```bash testar
for hoje in 2026-10-05 2030-10-05; do
  echo "--hoje $hoje"
  botai pessoa --semente 42 --hoje "$hoje" | grep -E '"(iso|idade|validade)"'
done
```

```text
--hoje 2026-10-05
      "iso": "1970-02-26",
      "idade": 56
      "validade": "11/28",
--hoje 2030-10-05
      "iso": "1974-02-26",
      "idade": 56
      "validade": "11/32",
```

### O que as opções não mudam

Na raiz do pacote há só essas 5 opções. Sexo, idade e cidade não são opções: para controlá-los, monte a pessoa à mão pelos subpaths da [biblioteca](../biblioteca/documentos.md).

## A visão plana {#visao-plana}

O CSV e o SQL achatam a pessoa em 35 colunas, nesta ordem:

```text
nome, prenome, sobrenomes, sexo, nascimento, idade, cpf, rg, rg_orgao_emissor, rg_uf, pis, titulo_eleitor, email, email_usuario, email_caixa_url, senha, celular, celular_e164, cep, logradouro, numero, complemento, bairro, cidade, uf, empresa_razao_social, empresa_nome_fantasia, empresa_cnpj, cartao_bandeira, cartao_numero, cartao_titular, cartao_validade, cartao_cvv, cartao_provedor, cartao_cenario
```

`idade` é número, e `email_caixa_url` é `null` com domínio próprio. O `--campos` escolhe e ordena as colunas:

```bash testar
botai pessoas -n 2 --semente demo --hoje 2026-10-08 --formato csv --campos nome,idade,cidade,uf
```

```csv
nome,idade,cidade,uf
Isabela Freitas Santos,50,Boa Vista,RR
Vitória Alves Carvalho,58,Curitiba,PR
```

Cada coluna está descrita em [Colunas](../referencia/colunas.md).
