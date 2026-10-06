import { describe, expect, it } from 'vitest'
import { cryptoRandomBytes } from './entropia'

describe('cryptoRandomBytes', () => {
  it('devolve o número de bytes pedido', () => {
    expect(cryptoRandomBytes(16)).toHaveLength(16)
  })

  // A semente de cada pessoa nova sai daqui (armazenamento.ts): dois sorteios iguais dariam a mesma pessoa.
  it('dois sorteios seguidos não se repetem', () => {
    expect(cryptoRandomBytes(16)).not.toEqual(cryptoRandomBytes(16))
  })
})
