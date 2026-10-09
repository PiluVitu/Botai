import { cryptoRandomBytes } from './entropia'
import { hojeEmSaoPaulo } from '@pilutech/botai-core'
import type { CartaoEscolhido } from '@pilutech/botai-core/cartao'
import { montarPessoa, type Pessoa } from '@pilutech/botai-core/pessoa'
import { seedFromBytes } from '@pilutech/botai-core/prng'
import { storage } from 'wxt/utils/storage'
import { ESCOLHA_PADRAO, normalizarEscolha } from './cartao'
import {
  devolverNaLista,
  guardarNaLista,
  renomearNaLista,
  tirarDaLista,
  type Favorito,
  type Removido,
} from './favoritos'

export const pessoaItem = storage.defineItem<Pessoa | null>(
  'local:botai_pessoa',
  {
    fallback: null,
    version: 1,
  },
)

export const favoritosItem = storage.defineItem<Favorito[]>(
  'local:botai_favoritos',
  {
    fallback: [],
    version: 1,
  },
)

export const cartaoItem = storage.defineItem<CartaoEscolhido>(
  'local:botai_cartao',
  {
    fallback: ESCOLHA_PADRAO,
    version: 1,
  },
)

export async function lerEscolhaDoCartao(): Promise<CartaoEscolhido> {
  return normalizarEscolha(await cartaoItem.getValue())
}

export async function escolherCartao(escolha: CartaoEscolhido): Promise<void> {
  await cartaoItem.setValue(normalizarEscolha(escolha))
}

export async function gerarPessoaNova(): Promise<Pessoa> {
  const pessoa = montarPessoa(
    seedFromBytes(cryptoRandomBytes(16)),
    hojeEmSaoPaulo(),
    { cartao: await lerEscolhaDoCartao() },
  )
  await pessoaItem.setValue(pessoa)
  return pessoa
}

export async function obterOuGerarPessoa(): Promise<Pessoa> {
  return (await pessoaItem.getValue()) ?? gerarPessoaNova()
}

export async function guardarFavorito(
  pessoa: Pessoa,
): Promise<Favorito | null> {
  const resultado = guardarNaLista(await favoritosItem.getValue(), pessoa, {
    id: globalThis.crypto.randomUUID(),
    guardadoEm: new Date().toISOString(),
  })
  if (!resultado) return null
  await favoritosItem.setValue(resultado.lista)
  return resultado.favorito
}

export async function tirarFavorito(id: string): Promise<Removido | null> {
  const resultado = tirarDaLista(await favoritosItem.getValue(), id)
  if (!resultado) return null
  await favoritosItem.setValue(resultado.lista)
  return resultado.removido
}

export async function devolverFavorito(removido: Removido): Promise<boolean> {
  const lista = devolverNaLista(await favoritosItem.getValue(), removido)
  if (!lista) return false
  await favoritosItem.setValue(lista)
  return true
}

export async function renomearFavorito(
  id: string,
  apelido: string,
): Promise<boolean> {
  const lista = renomearNaLista(await favoritosItem.getValue(), id, apelido)
  if (!lista) return false
  await favoritosItem.setValue(lista)
  return true
}

export async function usarFavorito(id: string): Promise<Pessoa | null> {
  const favorito = (await favoritosItem.getValue()).find((f) => f.id === id)
  if (!favorito) return null
  await pessoaItem.setValue(favorito.pessoa)
  return favorito.pessoa
}
