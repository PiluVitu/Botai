---
title: Os dados por trás
description: As listas e tabelas de que a pessoa sai, com a fonte de cada uma, da Receita Federal ao TSE, ao ViaCEP e à Stripe.
sidebar_position: 5
---

A pessoa sai de listas pequenas e conferidas, todas dentro do pacote. Nada é buscado na rede.

## As listas {#listas}

| Dado                                        | Valor                                                                                                                                                          | Fonte                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Prenomes femininos, masculinos e sobrenomes | 20, 20 e 30                                                                                                                                                    | `packages/core/src/nome.ts`                                         |
| Nomes completos possíveis                   | 34 800 (40 prenomes × 30 × 29 pares de sobrenomes distintos)                                                                                                   | calculado a partir de `src/nome.ts`                                 |
| Usuários de e-mail possíveis                | 11 700 000 (39 primeiros nomes distintos × 30 sobrenomes × 10 000 sufixos)                                                                                     | `src/nome.ts`                                                       |
| CEPs reais                                  | 34 CEPs, 29 cidades, 27 UFs e 29 DDDs. SP tem 6 (São Paulo, Campinas e Santos), RJ e MG têm 2, as outras 24 UFs têm 1 cada. Conferidos no ViaCEP em 2026-10-01 | `packages/core/src/endereco.ts` (`LOGRADOUROS`)                     |
| Regiões fiscais do CPF (9º dígito)          | a tabela abaixo                                                                                                                                                | `packages/core/src/uf.ts` (`REGIAO_FISCAL_CPF`, folheto da Receita) |
| Código da UF no título                      | SP 01 … TO 27; exterior ZZ 28                                                                                                                                  | `src/uf.ts` (Resolução TSE 23.659/2021)                             |
| Domínio de e-mail padrão                    | `tuamaeaquelaursa.com`, com caixa pública em `https://tuamaeaquelaursa.com/<usuario>`                                                                          | `src/nome.ts`                                                       |
| Cartões                                     | só Visa `4242424242424242` e Mastercard `5555555555554444`, os de teste da Stripe. Validade de hoje + 12 a hoje + 59 meses, CVV de 100 a 999                   | `src/cartao.ts`                                                     |
| Empresa                                     | 7 ramos e 6 sufixos de nome fantasia                                                                                                                           | `src/empresa.ts`                                                    |
| UFs aceitas                                 | as 27 siglas, em qualquer caixa (`ZZ` só no gerador de título)                                                                                                 | `UFS` e `lerUF`                                                     |
| Tentativas por pessoa no lote               | 1000                                                                                                                                                           | `src/gerar.ts`                                                      |
| Tamanho máximo da semente                   | 256 caracteres                                                                                                                                                 | `src/semente.ts`                                                    |

Os caminhos são do repositório [PiluVitu/Botai](https://github.com/PiluVitu/Botai). As tabelas de UF também saem do subpath `@pilutech/botai-core/uf`, como `UFS`, `REGIAO_FISCAL_CPF` e `CODIGO_UF_TITULO`.

## Regiões fiscais do CPF {#regioes-fiscais}

O 9º dígito do CPF é a região fiscal da UF do endereço:

| Dígito | UFs                    |
| ------ | ---------------------- |
| 0      | RS                     |
| 1      | DF, GO, MT, MS, TO     |
| 2      | PA, AM, AC, AP, RO, RR |
| 3      | CE, MA, PI             |
| 4      | PE, RN, PB, AL         |
| 5      | BA, SE                 |
| 6      | MG                     |
| 7      | RJ, ES                 |
| 8      | SP                     |
| 9      | PR, SC                 |

Por isso trocar a UF da pessoa só muda o CPF quando a nova UF é de outra região ([A pessoa](./a-pessoa.md#opcoes)).

## Os 34 CEPs {#ceps}

Um lote grande passa por todos os CEPs da lista:

```bash testar
botai pessoas -n 10000 --semente carga --hoje 2026-10-05 --formato csv --campos cep \
  | tail -n +2 | sort -u | wc -l | tr -d ' '
```

```text
34
```

Com a UF fixa, a escolha encolhe. 24 das 27 UFs têm um CEP só, e o lote inteiro recebe o mesmo endereço:

```bash testar
botai pessoas -n 3 --semente teresina --hoje 2026-10-05 --uf PI \
  --formato csv --campos nome,cep,logradouro,cidade
```

```csv
nome,cep,logradouro,cidade
Luiz Fernando Monteiro Ferreira,64000-020,Avenida Frei Serafim,Teresina
Beatriz Pereira Martins,64000-020,Avenida Frei Serafim,Teresina
Bruno Silva Freitas,64000-020,Avenida Frei Serafim,Teresina
```

A distribuição por UF segue a lista: SP, com 6 CEPs, aparece em cerca de 18% das pessoas.

## Os cartões {#cartoes}

O cartão é sempre um dos dois de teste da Stripe, em proporção parecida:

```bash testar
botai pessoas -n 10000 --semente cartoes --hoje 2026-10-05 --formato csv \
  --campos cartao_bandeira,cartao_numero \
  | tail -n +2 | tr -d '\r' | sort | uniq -c | awk '{ print $1, $2 }'
```

```text
4947 mastercard,5555555555554444
5053 visa,4242424242424242
```

O número passa no Luhn; a validade e o CVV mudam por pessoa. Não há Elo, Amex nem Hipercard.

## O RG {#rg}

O RG segue o modelo da SSP de São Paulo em qualquer UF: `orgaoEmissor` é `SSP` e `uf` é `SP`, mesmo quando o endereço é de outro estado. Por padrão, o dígito verificador nunca é `X`; o gerador avulso do subpath `/rg` aceita `permitirX`.

## O e-mail {#email}

O usuário é `prenome-sobrenome-NNNN`, sem acento, e o domínio padrão é `tuamaeaquelaursa.com`, uma caixa de entrada pública: quem souber o endereço lê. Isso serve para testar a confirmação por e-mail; para não usar a caixa pública, troque o domínio com `--dominio-email` ([Uso responsável](./uso-responsavel.md)).
