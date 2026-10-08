---
title: Visão geral da CLI
sidebar_label: Visão geral
description: O comando botai no terminal, com os 11 comandos, a ajuda real, as opções com =, a divisão entre stdout e stderr e o uso em pipes.
sidebar_position: 1
---

A CLI do Botaí é o comando `botai`. Ele gera uma pessoa, um lote de pessoas ou documentos avulsos, valida documentos e sobe o servidor HTTP local. A saída é a mesma em qualquer máquina: a mesma semente e o mesmo `--hoje` geram a mesma pessoa.

## Como rodar

Nos exemplos desta documentação, `botai` é o comando. Escolha como chegar nele:

| Onde               | Como                                                     | Página                                                |
| ------------------ | -------------------------------------------------------- | ----------------------------------------------------- |
| Onde houver Node   | `npx -y @pilutech/botai-core@0.4.1 <comando>`            | [Instalação](../comecar/instalacao.md)                |
| Sem Node (binário) | `botai <comando>`, depois do `install.sh`                | [Instalar pelo install.sh](../binarios/install-sh.md) |
| Sem Node (imagem)  | `docker run --rm ghcr.io/piluvitu/botai:0.4.1 <comando>` | [A imagem Docker](../docker/imagem.md)                |

Com o `npx`, o comando fica assim:

```bash
npx -y @pilutech/botai-core@0.4.1 pessoa --semente 42 --hoje 2026-10-05
```

O pacote publicado no npm gera exatamente a mesma saída. Nos exemplos, o mesmo comando se escreve assim:

```bash testar
botai pessoa --semente 42 --hoje 2026-10-05
```

Fixe a versão no `npx`. Mudar a pessoa de uma semente é versão major; na série 0.x, é a minor. Veja [Versões e dourados](../conceitos/versoes-e-dourados.md).

A CLI foi provada no Node 22 e no 24. O pacote não declara `engines`.

## A ajuda

```bash testar
botai --help
```

```text
botai: gera pessoas brasileiras de teste, coerentes e reproduzíveis.

Uso:
  botai pessoa  [--semente S] [--hoje AAAA-MM-DD] [--uf UF] [--dominio-email D]
  botai pessoas -n N [--semente S] [--hoje AAAA-MM-DD] [--uf UF] [--dominio-email D]
                [--formato json|ndjson|csv|sql] [--dialeto postgres|mysql|sqlite]
                [--tabela T] [--campos a,b,c]
  botai cpf|cnpj|rg|pis|titulo|celular|cep [--formatado] [--uf UF] [--semente S]
  botai validar cpf|cnpj|rg|pis|titulo|cartao <valor>
  botai serve [--porta 8790] [--host 127.0.0.1]
  botai --versao

A mesma semente e o mesmo --hoje geram a mesma pessoa em qualquer máquina.
Sem --semente, sorteia uma; sem --hoje, usa a data de hoje em São Paulo.

Saída: dados no stdout, mensagens no stderr.
Códigos de saída: 0 ok, 1 valor inválido (validar), 2 erro de uso, 3 erro interno.

Ajuda de um comando: botai <comando> --help
```

Cada comando tem a sua ajuda:

```bash testar
botai pessoas --help
```

Também funcionam `--version` (igual a `--versao`), `-h` e `ajuda` (iguais a `--help`), que não aparecem na ajuda.

## Os 11 comandos

| Comando                                                | O que faz                                    | Página                                      |
| ------------------------------------------------------ | -------------------------------------------- | ------------------------------------------- |
| `pessoa`                                               | uma pessoa, num envelope JSON                | [Uma pessoa](./pessoa.md)                   |
| `pessoas`                                              | um lote em json, ndjson, csv ou sql          | [Um lote de pessoas](./pessoas.md)          |
| `cpf`, `cnpj`, `rg`, `pis`, `titulo`, `celular`, `cep` | um valor avulso                              | [Geradores avulsos](./geradores-avulsos.md) |
| `validar`                                              | confere o dígito verificador de um documento | [Validar documentos](./validar.md)          |
| `serve`                                                | o servidor HTTP local                        | [botai serve](../servidor/botai-serve.md)   |

`botai --versao` imprime a versão do pacote:

```bash testar
botai --versao
```

```text
0.4.1
```

## Opções com `=`

As opções aceitam o valor depois de um espaço ou de um `=`. `--semente=42` é igual a `--semente 42`:

```bash testar
diff <(botai pessoa --semente=42 --hoje=2026-10-05) <(botai pessoa --semente 42 --hoje 2026-10-05)
```

Repetir uma opção é erro de uso (`botai: opção repetida: --semente`).

## Semente e hoje

- `--semente` é um número ou um texto. A mesma semente gera a mesma pessoa. Sem ela, a CLI sorteia uma.
- `--hoje AAAA-MM-DD` é a data de referência da idade e da validade do cartão. Sem ela, vale a data de hoje em São Paulo, e a mesma semente gera outra pessoa no dia seguinte.
- Reproduzir uma pessoa exige a semente, o `--hoje` e a versão.

As regras completas estão em [Semente e hoje](../conceitos/semente-e-hoje.md).

## stdout e stderr

Os dados saem no stdout e as mensagens no stderr. Assim, um redirecionamento ou um pipe recebe só os dados:

```bash testar
botai pessoas -n 50 --formato csv --campos nome,cpf,email > p.csv
```

Sem `--semente`, o CSV não guarda a semente sorteada. A CLI a escreve no stderr, para você reproduzir o lote depois:

```text
botai: semente 75bf48f551f1dd10, hoje 2026-10-08
```

Num erro de uso, o stdout fica vazio e a mensagem vai para o stderr. Veja [Códigos de saída](./codigos-de-saida.md) e [Mensagens de erro](../referencia/mensagens-de-erro.md#cli).

## Pipes que fecham cedo

Um `| head` que fecha o pipe antes do fim não gera erro: a CLI para e sai com 0.

```bash testar
botai pessoas -n 100000 --formato ndjson | head -1
```

## Tempo de partida

Medido em 2026-10-08, num macOS arm64 com Node 22.22.3 (máquina compartilhada, com variação):

| Medida                                     | Valor                  |
| ------------------------------------------ | ---------------------- |
| Partida da CLI no Node                     | 0,04 a 0,048 s         |
| Partida do binário                         | 17 ms                  |
| Um comando pelo `npx`, cache frio / quente | 2,26 a 2,32 s / 0,89 s |

Os outros números estão em [Números](../referencia/numeros.md).
