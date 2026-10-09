import { montarPessoa, type Pessoa } from '@pilutech/botai-core/pessoa'
import { sfc32 } from '@pilutech/botai-core/prng'

export const PESSOA_DOURADA = montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01')

// Como uma pessoa guardada antes da 1.2.0 (core 0.4) chega do storage: o cartão sem provedor nem cenário.
export function comoPessoaAntiga(pessoa: Pessoa): Pessoa {
  const cartao: Partial<Pessoa['cartao']> = { ...pessoa.cartao }
  delete cartao.provedor
  delete cartao.cenario
  return { ...pessoa, cartao } as Pessoa
}

export const PESSOA_ANTIGA = comoPessoaAntiga(PESSOA_DOURADA)
