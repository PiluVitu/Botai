import { ErroDeOpcao } from './opcoes'
import { type Prng, sfc32 } from './prng'

export type Semente = number | string

const TAMANHO_MAXIMO_DA_SEMENTE = 256

export function textoDaSemente(semente: Semente): string {
  if (typeof semente === 'number') {
    if (!Number.isSafeInteger(semente))
      throw new ErroDeOpcao(
        'semente',
        `semente numérica precisa ser inteira, recebido ${semente}`,
      )
    return String(semente)
  }
  if (typeof semente !== 'string')
    throw new ErroDeOpcao('semente', 'semente precisa ser número ou texto')
  const texto = semente.normalize('NFC')
  if (texto.length === 0) throw new ErroDeOpcao('semente', 'semente vazia')
  if (texto.length > TAMANHO_MAXIMO_DA_SEMENTE)
    throw new ErroDeOpcao(
      'semente',
      `semente com mais de ${TAMANHO_MAXIMO_DA_SEMENTE} caracteres`,
    )
  if (/[\u0000-\u001f\u007f]/.test(texto))
    throw new ErroDeOpcao('semente', 'semente com caractere de controle')
  return texto
}

export function bytesUtf8(texto: string): number[] {
  const bytes: number[] = []
  for (const caractere of texto) {
    const c = caractere.codePointAt(0)!
    if (c < 0x80) bytes.push(c)
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f))
    else if (c < 0x10000)
      bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f))
    else
      bytes.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 0x3f),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f),
      )
  }
  return bytes
}

// cyrb128, de github.com/bryc/code (domínio público).
export function cyrb128(
  bytes: readonly number[],
): [number, number, number, number] {
  let h1 = 1779033703
  let h2 = 3144134277
  let h3 = 1013904242
  let h4 = 2773480762
  for (const k of bytes) {
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
  h1 ^= h2 ^ h3 ^ h4
  h2 ^= h1
  h3 ^= h1
  h4 ^= h1
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0]
}

export function rngDeSemente(semente: Semente): Prng {
  const [a, b, c, d] = cyrb128(bytesUtf8(textoDaSemente(semente)))
  return sfc32(a, b, c, d)
}

interface CryptoMinimo {
  getRandomValues(destino: Uint32Array): Uint32Array
}

export function sementeAleatoria(): string {
  const valores = new Uint32Array(2)
  const cripto = (globalThis as { crypto?: CryptoMinimo }).crypto
  if (cripto) cripto.getRandomValues(valores)
  else
    for (let i = 0; i < valores.length; i++)
      valores[i] = Math.floor(Math.random() * 0x100000000)
  return Array.from(valores, (v) => v.toString(16).padStart(8, '0')).join('')
}
