import type { Pessoa } from '@pilutech/botai-core/pessoa'

export const LIMITE_FAVORITOS = 3
export const APELIDO_MAX = 24

export interface Favorito {
  id: string
  apelido: string
  pessoa: Pessoa
  guardadoEm: string
}

export interface Removido {
  favorito: Favorito
  posicao: number
}

export function primeiroNome(pessoa: Pessoa): string {
  return pessoa.nome.completo.trim().split(/\s+/)[0]
}

export function normalizarApelido(texto: string, pessoa: Pessoa): string {
  const aparado = texto.trim().slice(0, APELIDO_MAX).trim()
  return aparado === '' ? primeiroNome(pessoa).slice(0, APELIDO_MAX) : aparado
}

const digitosDoCpf = (pessoa: Pessoa) => pessoa.cpf.replace(/\D/g, '')

export function mesmaPessoa(a: Pessoa, b: Pessoa): boolean {
  return digitosDoCpf(a) === digitosDoCpf(b)
}

export function favoritoDa(
  lista: readonly Favorito[],
  pessoa: Pessoa | null,
): Favorito | null {
  if (!pessoa) return null
  return lista.find((f) => mesmaPessoa(f.pessoa, pessoa)) ?? null
}

export function guardarNaLista(
  lista: readonly Favorito[],
  pessoa: Pessoa,
  novo: { id: string; guardadoEm: string },
): { lista: Favorito[]; favorito: Favorito } | null {
  if (favoritoDa(lista, pessoa) || lista.length >= LIMITE_FAVORITOS) return null
  const favorito: Favorito = {
    id: novo.id,
    apelido: normalizarApelido('', pessoa),
    pessoa,
    guardadoEm: novo.guardadoEm,
  }
  return { lista: [...lista, favorito], favorito }
}

export function tirarDaLista(
  lista: readonly Favorito[],
  id: string,
): { lista: Favorito[]; removido: Removido } | null {
  const posicao = lista.findIndex((f) => f.id === id)
  if (posicao === -1) return null
  return {
    lista: lista.filter((f) => f.id !== id),
    removido: { favorito: lista[posicao], posicao },
  }
}

export function devolverNaLista(
  lista: readonly Favorito[],
  { favorito, posicao }: Removido,
): Favorito[] | null {
  const jaVoltou = lista.some(
    (f) => f.id === favorito.id || mesmaPessoa(f.pessoa, favorito.pessoa),
  )
  if (jaVoltou || lista.length >= LIMITE_FAVORITOS) return null
  const nova = [...lista]
  nova.splice(Math.min(posicao, nova.length), 0, favorito)
  return nova
}

export function renomearNaLista(
  lista: readonly Favorito[],
  id: string,
  texto: string,
): Favorito[] | null {
  if (!lista.some((f) => f.id === id)) return null
  return lista.map((f) =>
    f.id === id ? { ...f, apelido: normalizarApelido(texto, f.pessoa) } : f,
  )
}
