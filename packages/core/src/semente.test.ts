import { ErroDeOpcao } from './opcoes'
import {
  bytesUtf8,
  cyrb128,
  rngDeSemente,
  sementeAleatoria,
  textoDaSemente,
} from './semente'

const primeiros = (semente: number | string, n = 3) => {
  const rng = rngDeSemente(semente)
  return Array.from({ length: n }, () => rng.nextUint32())
}

describe('rngDeSemente', () => {
  test('número e texto são a mesma semente: 42 ≡ "42"', () => {
    expect(primeiros(42, 20)).toEqual(primeiros('42', 20))
    expect(primeiros(-5, 20)).toEqual(primeiros('-5', 20))
    expect(primeiros(0, 20)).toEqual(primeiros('0', 20))
  })

  // Valores fixos de propósito: mudar o hash, a codificação ou o sfc32 muda
  // a pessoa de toda semente, e isso é versão major.
  test('estável: os primeiros valores de sementes conhecidas não mudam', () => {
    expect(primeiros(42)).toEqual([2258495261, 801819658, 1739561921])
    expect(primeiros('botai')).toEqual([2689368236, 3757199645, 1206963042])
    expect(primeiros('ação 🧀')).toEqual([2218003296, 965529650, 4207509537])
  })

  test('o hash é o cyrb128 dos bytes UTF-8 do texto', () => {
    expect(cyrb128(bytesUtf8('42'))).toEqual([
      2814168319, 14930478, 1039855864, 944835771,
    ])
  })

  test('sementes diferentes dão sequências diferentes', () => {
    expect(primeiros('lote/0')).not.toEqual(primeiros('lote/1'))
    expect(primeiros('a')).not.toEqual(primeiros('A'))
  })

  test('texto em NFD (acento separado) é a mesma semente que em NFC', () => {
    const nfd = 'São João'
    const nfc = 'São João'
    expect(nfd).not.toBe(nfc)
    expect(primeiros(nfd, 10)).toEqual(primeiros(nfc, 10))
    expect(textoDaSemente(nfd)).toBe(nfc)
  })

  test.each([
    ['', 'semente vazia'],
    [1.5, 'inteira'],
    [Number.NaN, 'inteira'],
    [2 ** 53, 'inteira'],
    ['x'.repeat(257), 'mais de 256'],
    ['a\nDROP TABLE x', 'caractere de controle'],
    ['a\u0000b', 'caractere de controle'],
  ])('recusa %j', (semente, trecho) => {
    expect(() => rngDeSemente(semente)).toThrow(ErroDeOpcao)
    expect(() => rngDeSemente(semente)).toThrow(trecho)
  })

  test('aceita até 256 caracteres e números negativos', () => {
    expect(() => rngDeSemente('x'.repeat(256))).not.toThrow()
    expect(() => rngDeSemente(-5)).not.toThrow()
  })

  test('o erro diz qual opção falhou', () => {
    try {
      rngDeSemente('')
      throw new Error('não lançou')
    } catch (erro) {
      expect((erro as ErroDeOpcao).opcao).toBe('semente')
    }
  })
})

describe('bytesUtf8', () => {
  test('1, 2, 3 e 4 bytes por caractere', () => {
    expect(bytesUtf8('a')).toEqual([97])
    expect(bytesUtf8('é')).toEqual([195, 169])
    expect(bytesUtf8('€')).toEqual([226, 130, 172])
    expect(bytesUtf8('🧀')).toEqual([240, 159, 167, 128])
    expect(bytesUtf8('ação 🧀')).toEqual([
      97, 195, 167, 195, 163, 111, 32, 240, 159, 167, 128,
    ])
  })
})

describe('sementeAleatoria', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  const trocarCrypto = (valor: unknown) =>
    Object.defineProperty(globalThis, 'crypto', {
      value: valor,
      configurable: true,
      writable: true,
    })
  afterEach(() => {
    if (original) Object.defineProperty(globalThis, 'crypto', original)
    else delete (globalThis as { crypto?: unknown }).crypto
    jest.restoreAllMocks()
  })

  test('16 dígitos hexadecimais, e duas chamadas não repetem', () => {
    const a = sementeAleatoria()
    expect(a).toMatch(/^[0-9a-f]{16}$/)
    expect(sementeAleatoria()).not.toBe(a)
  })

  test('usa crypto.getRandomValues quando existe', () => {
    trocarCrypto({
      getRandomValues: (destino: Uint32Array) => {
        destino[0] = 0xdeadbeef
        destino[1] = 1
        return destino
      },
    })
    expect(sementeAleatoria()).toBe('deadbeef00000001')
  })

  test('sem crypto, cai no Math.random', () => {
    trocarCrypto(undefined)
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
    expect(sementeAleatoria()).toBe('8000000080000000')
  })
})
