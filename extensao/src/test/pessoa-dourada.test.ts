import { readFileSync } from 'node:fs'
import path from 'node:path'
import { type EnvelopeDaPessoa, gerarPessoa } from '@pilutech/botai-core'
import { describe, expect, it } from 'vitest'
import { PESSOA_DOURADA } from './pessoa-dourada'

const DOURADO = path.resolve(
  import.meta.dirname,
  '../../../packages/core/dourado/v1',
)

describe('o motor que a extensão empacota', () => {
  it('a pessoa dourada de sfc32(1, 2, 3, 4) continua a mesma', () => {
    expect(PESSOA_DOURADA.cpf).toBe('647.692.234-39')
    expect(PESSOA_DOURADA.email.endereco).toBe(
      'vinicius-costa-6607@tuamaeaquelaursa.com',
    )
  })

  it.each([
    'pessoa-semente-texto.json',
    'pessoa-semente-unicode.json',
    'pessoa-29-de-fevereiro.json',
  ])('reproduz o dourado %s', (arquivo) => {
    const dourado = JSON.parse(
      readFileSync(path.join(DOURADO, arquivo), 'utf8'),
    ) as EnvelopeDaPessoa
    expect(
      gerarPessoa({ semente: dourado.semente, hoje: dourado.hoje }),
    ).toEqual(dourado.pessoa)
  })
})
