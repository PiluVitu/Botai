import { montarPessoa } from '@pilutech/botai-core/pessoa'
import { sfc32 } from '@pilutech/botai-core/prng'
import { describe, expect, it } from 'vitest'
import { PESSOA_DOURADA as P } from '../test/pessoa-dourada'
import {
  APELIDO_MAX,
  devolverNaLista,
  favoritoDa,
  guardarNaLista,
  LIMITE_FAVORITOS,
  mesmaPessoa,
  normalizarApelido,
  primeiroNome,
  renomearNaLista,
  tirarDaLista,
  type Favorito,
} from './favoritos'

const outra = (n: number) =>
  montarPessoa(sfc32(n, n + 1, n + 2, n + 3), '2026-10-01')
const [A, B, C, D] = [outra(10), outra(20), outra(30), outra(40)]
const NOVO = { id: 'f-novo', guardadoEm: '2026-10-09T13:00:00.000Z' }

function favorito(
  id: string,
  pessoa = P,
  apelido = primeiroNome(pessoa),
): Favorito {
  return { id, apelido, pessoa, guardadoEm: '2026-10-09T12:00:00.000Z' }
}

describe('constantes', () => {
  it('cabem 3 favoritos, com apelido de até 24 caracteres', () => {
    expect(LIMITE_FAVORITOS).toBe(3)
    expect(APELIDO_MAX).toBe(24)
  })
})

describe('primeiroNome', () => {
  it('é a primeira palavra do nome completo, mesmo com prenome composto', () => {
    const maria = { ...P, nome: { ...P.nome, completo: 'Maria Eduarda Souza' } }
    expect(primeiroNome(maria)).toBe('Maria')
    expect(primeiroNome(P)).toBe(P.nome.completo.split(' ')[0])
  })
})

describe('normalizarApelido', () => {
  it('apara as pontas', () => {
    expect(normalizarApelido('  admin do staging  ', P)).toBe(
      'admin do staging',
    )
  })

  it('vazio, ou só espaços, volta ao primeiro nome', () => {
    expect(normalizarApelido('', P)).toBe(primeiroNome(P))
    expect(normalizarApelido('   ', P)).toBe(primeiroNome(P))
  })

  it('corta em 24 caracteres e não deixa espaço sobrando no fim', () => {
    expect(normalizarApelido('a'.repeat(30), P)).toBe('a'.repeat(24))
    // 21 caracteres + 3 espaços = 24: o corte cai nos espaços.
    expect(normalizarApelido('cliente com CEP do PI   xyz', P)).toBe(
      'cliente com CEP do PI',
    )
  })
})

describe('mesmaPessoa e favoritoDa', () => {
  it('compara pelos dígitos do CPF, com ou sem máscara', () => {
    expect(mesmaPessoa(P, { ...P, cpf: P.cpf.replace(/\D/g, '') })).toBe(true)
    expect(mesmaPessoa(P, A)).toBe(false)
  })

  it('a mesma pessoa com outro objeto (vinda do storage) continua favorita', () => {
    const lista = [favorito('f1', A), favorito('f2', P)]
    expect(favoritoDa(lista, structuredClone(P))?.id).toBe('f2')
  })

  it('sem pessoa, ou pessoa fora da lista, não há favorito', () => {
    expect(favoritoDa([favorito('f1', A)], null)).toBeNull()
    expect(favoritoDa([favorito('f1', A)], B)).toBeNull()
  })
})

describe('guardarNaLista', () => {
  it('guarda no fim, com o primeiro nome de apelido, o id e a data recebidos', () => {
    const resultado = guardarNaLista([favorito('f1', A)], P, NOVO)
    expect(resultado?.favorito).toEqual({
      id: 'f-novo',
      apelido: primeiroNome(P),
      pessoa: P,
      guardadoEm: '2026-10-09T13:00:00.000Z',
    })
    expect(resultado?.lista.map((f) => f.id)).toEqual(['f1', 'f-novo'])
  })

  it('não guarda a mesma pessoa duas vezes', () => {
    expect(guardarNaLista([favorito('f1', P)], P, NOVO)).toBeNull()
  })

  it('com 3 favoritos, não guarda a quarta', () => {
    const cheia = [favorito('f1', A), favorito('f2', B), favorito('f3', C)]
    expect(guardarNaLista(cheia, D, NOVO)).toBeNull()
  })

  it('não muda a lista recebida', () => {
    const lista = [favorito('f1', A)]
    guardarNaLista(lista, P, NOVO)
    expect(lista).toHaveLength(1)
  })
})

describe('tirarDaLista e devolverNaLista', () => {
  const lista = [favorito('f1', A), favorito('f2', B), favorito('f3', C)]

  it('tirar devolve a lista sem ele e de onde ele saiu', () => {
    const resultado = tirarDaLista(lista, 'f2')
    expect(resultado?.lista.map((f) => f.id)).toEqual(['f1', 'f3'])
    expect(resultado?.removido).toEqual({ favorito: lista[1], posicao: 1 })
  })

  it('tirar um id que não está na lista não muda nada', () => {
    expect(tirarDaLista(lista, 'f9')).toBeNull()
  })

  it('desfazer devolve na mesma posição', () => {
    const tirado = tirarDaLista(lista, 'f1')
    if (!tirado) throw new Error('não tirou')
    expect(
      devolverNaLista(tirado.lista, tirado.removido)?.map((f) => f.id),
    ).toEqual(['f1', 'f2', 'f3'])
  })

  it('se a lista encolheu, devolve no fim', () => {
    const removido = { favorito: favorito('f3', C), posicao: 2 }
    expect(
      devolverNaLista([favorito('f1', A)], removido)?.map((f) => f.id),
    ).toEqual(['f1', 'f3'])
  })

  it('não devolve quando a pessoa voltou por outro caminho', () => {
    const removido = { favorito: favorito('f1', A), posicao: 0 }
    expect(devolverNaLista([favorito('f9', A)], removido)).toBeNull()
    expect(devolverNaLista([favorito('f1', A)], removido)).toBeNull()
  })

  it('não devolve quando os 3 lugares já foram ocupados, para não tirar outro em silêncio', () => {
    const removido = { favorito: favorito('f0', D), posicao: 0 }
    expect(devolverNaLista(lista, removido)).toBeNull()
  })
})

describe('renomearNaLista', () => {
  const lista = [favorito('f1', A), favorito('f2', P)]

  it('troca só o apelido daquele favorito, normalizado', () => {
    const nova = renomearNaLista(lista, 'f2', '  admin do staging ')
    expect(nova?.[1]).toEqual({ ...lista[1], apelido: 'admin do staging' })
    expect(nova?.[0]).toBe(lista[0])
  })

  it('apelido vazio volta ao primeiro nome da pessoa daquele favorito', () => {
    const renomeada = [{ ...lista[1], apelido: 'outro' }]
    expect(renomearNaLista(renomeada, 'f2', '')?.[0].apelido).toBe(
      primeiroNome(P),
    )
  })

  it('id que não está na lista não muda nada', () => {
    expect(renomearNaLista(lista, 'f9', 'x')).toBeNull()
  })
})
