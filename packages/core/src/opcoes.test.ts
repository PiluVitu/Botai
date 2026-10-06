import {
  ErroDeOpcao,
  LIMITE_DO_LOTE,
  lerDominioEmail,
  lerHoje,
  lerQuantidade,
  lerUF,
} from './opcoes'

const opcaoDoErro = (f: () => unknown): string | undefined => {
  try {
    f()
  } catch (erro) {
    if (erro instanceof ErroDeOpcao) return erro.opcao
    throw erro
  }
  return undefined
}

describe('lerHoje', () => {
  test('aceita data que existe, inclusive 29 de fevereiro de ano bissexto', () => {
    expect(lerHoje('2026-10-05')).toBe('2026-10-05')
    expect(lerHoje('2028-02-29')).toBe('2028-02-29')
  })

  test.each(['2026-02-30', '2027-02-29', '2026-13-01', '2026-1-5', 'hoje', ''])(
    'recusa %j',
    (valor) => {
      expect(opcaoDoErro(() => lerHoje(valor))).toBe('hoje')
    },
  )
})

describe('lerUF', () => {
  test('aceita sigla em qualquer caixa e devolve maiúscula', () => {
    expect(lerUF('PI')).toBe('PI')
    expect(lerUF('pi')).toBe('PI')
  })

  test.each(['XX', 'Piauí', '', 'P I'])('recusa %j', (valor) => {
    expect(opcaoDoErro(() => lerUF(valor))).toBe('uf')
  })
})

describe('lerDominioEmail', () => {
  test.each([
    ['example.com', 'example.com'],
    ['Example.COM', 'example.com'],
    ['teste.empresa.com.br', 'teste.empresa.com.br'],
    ['meu-dominio.local', 'meu-dominio.local'],
  ])('aceita %j', (valor, esperado) => {
    expect(lerDominioEmail(valor)).toBe(esperado)
  })

  test.each([
    'localhost',
    '',
    'a..com',
    '-a.com',
    'a-.com',
    'a_b.com',
    'a b.com',
    'ção.com',
    '1.2.3.4',
    `${'a'.repeat(64)}.com`,
    `${'a.'.repeat(127)}com`,
    'user@example.com',
  ])('recusa %j', (valor) => {
    expect(opcaoDoErro(() => lerDominioEmail(valor))).toBe('dominioEmail')
  })
})

describe('lerQuantidade', () => {
  test('aceita de 0 ao limite', () => {
    expect(lerQuantidade(0)).toBe(0)
    expect(lerQuantidade(LIMITE_DO_LOTE)).toBe(100_000)
  })

  test.each([-1, 1.5, Number.NaN, LIMITE_DO_LOTE + 1])('recusa %j', (n) => {
    expect(opcaoDoErro(() => lerQuantidade(n))).toBe('n')
  })
})
