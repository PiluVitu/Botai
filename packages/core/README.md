# @pilutech/botai-core

O motor do [Botaí](https://botai.pilutech.com.br): gera uma pessoa brasileira de teste coerente (nome, CPF, RG, PIS, título de eleitor, celular com o DDD do CEP, endereço com CEP real, e-mail, empresa com CNPJ, cartão de teste da Stripe) e classifica campos de formulário. TypeScript puro, sem dependência de runtime e sem DOM: roda no Node, no navegador e em extensão.

## Instalar

```sh
npm install @pilutech/botai-core
```

Só ESM. Um import por módulo (não há import da raiz nesta versão).

## Usar

```ts
import { sfc32 } from '@pilutech/botai-core/prng'
import { gerarPessoa } from '@pilutech/botai-core/pessoa'
import { gerarCPF, validarCPF } from '@pilutech/botai-core/cpf'

const pessoa = gerarPessoa(sfc32(1, 2, 3, 4), '2026-10-01')
pessoa.cpf // '647.692.234-39'
pessoa.email.endereco // 'vinicius-costa-6607@tuamaeaquelaursa.com'

gerarCPF() // um CPF válido qualquer
validarCPF('647.692.234-39') // true
```

Nesta versão, a mesma semente e a mesma data geram sempre a mesma pessoa. Sem semente, os geradores usam `Math.random`.

## Módulos

| Módulo                                                                    | O que tem                                                                                                                                    |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `pessoa`                                                                  | `gerarPessoa(rng, hojeISO)`: a pessoa inteira, coerente (CPF e título da UF do endereço, DDD do CEP, e-mail do nome, empresa dos sobrenomes) |
| `cpf`, `cnpj`, `rg`, `pis`, `titulo-eleitor`                              | `gerarX(rng?)` e `validarX(valor)`                                                                                                           |
| `celular`, `nascimento`, `senha`, `nome`, `endereco`, `empresa`, `cartao` | os geradores que a pessoa usa                                                                                                                |
| `campos`                                                                  | `classificarFormulario(descritores, hojeISO)` e `classificarCampo(descritor)`: o tipo de cada campo de um formulário                         |
| `campos-formatar`                                                         | `valorPara(tipo, pessoa, descritor)`: o valor que cabe no campo (máscara, `maxlength`, `pattern`, `<select>`)                                |
| `prng`, `aleatorio`, `uf`                                                 | o gerador determinístico (`sfc32`, `seedFromBytes`), os sorteios e as tabelas de UF                                                          |
| `atalhos`                                                                 | o atalho de teclado da extensão por navegador e sistema                                                                                      |

## Cuidados

- Os dados são fictícios, mas um CPF, um CNPJ ou um celular gerado pode pertencer a alguém de verdade. Use só em teste.
- O e-mail é de uma caixa pública (`tuamaeaquelaursa.com`): nunca para conta real.
- Versão 0.x: a API e a pessoa que uma semente gera podem mudar entre versões. Para reproduzir, fixe a versão.

## Licença

MIT, © PiluTech ([`LICENSE`](./LICENSE)). Código: https://github.com/PiluVitu/Botai/tree/main/packages/core
