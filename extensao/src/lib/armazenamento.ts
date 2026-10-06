import { cryptoRandomBytes } from './entropia'
import { hojeEmSaoPaulo } from '@pilutech/botai-core'
import { montarPessoa, type Pessoa } from '@pilutech/botai-core/pessoa'
import { seedFromBytes } from '@pilutech/botai-core/prng'
import { storage } from 'wxt/utils/storage'

export const pessoaItem = storage.defineItem<Pessoa | null>(
  'local:botai_pessoa',
  {
    fallback: null,
    version: 1,
  },
)

export async function gerarPessoaNova(): Promise<Pessoa> {
  const pessoa = montarPessoa(
    seedFromBytes(cryptoRandomBytes(16)),
    hojeEmSaoPaulo(),
  )
  await pessoaItem.setValue(pessoa)
  return pessoa
}

export async function obterOuGerarPessoa(): Promise<Pessoa> {
  return (await pessoaItem.getValue()) ?? gerarPessoaNova()
}
