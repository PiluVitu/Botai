import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  type EnvelopeDaPessoa,
  type EnvelopeDasPessoas,
  gerarEnvelopeDaPessoa,
  gerarEnvelopeDasPessoas,
} from './envelope'
import type { OpcoesDaPessoa } from './gerar'
import { type Dialeto, paraCsv, paraSql } from './plano'

interface ItemDoIndice {
  arquivo: string
  n?: number
  compacto?: boolean
  opcoes: OpcoesDaPessoa & { semente: number | string; hoje: string }
  derivados?: { arquivo: string; formato: 'csv' | 'sql'; dialeto?: Dialeto }[]
}

const DOURADO = join(__dirname, '..', 'dourado', 'v1')
const ler = (arquivo: string) => readFileSync(join(DOURADO, arquivo), 'utf8')
const INDICE = JSON.parse(ler('indice.json')) as ItemDoIndice[]

// motor muda a cada versão; o que o dourado trava é a pessoa.
const semMotor = (e: EnvelopeDaPessoa | EnvelopeDasPessoas) => ({
  ...e,
  motor: '',
})

describe('arquivos dourados v1 (biblioteca)', () => {
  test('o índice cobre semente numérica, texto, Unicode, uf, domínio, 29/02, lote e 1000', () => {
    expect(INDICE.map((i) => i.arquivo)).toEqual([
      'pessoa-semente-numero.json',
      'pessoa-semente-texto.json',
      'pessoa-semente-unicode.json',
      'pessoa-uf.json',
      'pessoa-dominio-email.json',
      'pessoa-29-de-fevereiro.json',
      'pessoas-lote.json',
      'pessoas-1000.json',
    ])
  })

  test.each(INDICE.map((item) => [item.arquivo, item] as const))(
    '%s',
    (_, item) => {
      const dourado = JSON.parse(ler(item.arquivo)) as
        | EnvelopeDaPessoa
        | EnvelopeDasPessoas
      const gerado =
        item.n === undefined
          ? gerarEnvelopeDaPessoa(item.opcoes)
          : gerarEnvelopeDasPessoas(item.n, item.opcoes)
      expect(semMotor(gerado)).toEqual(semMotor(dourado))
      expect(dourado.motor).toMatch(/^\d+\.\d+\.\d+/)
      for (const derivado of item.derivados ?? []) {
        const pessoas = (gerado as EnvelopeDasPessoas).pessoas
        const texto =
          derivado.formato === 'csv'
            ? paraCsv(pessoas)
            : paraSql(pessoas, { dialeto: derivado.dialeto })
        expect(texto).toBe(ler(derivado.arquivo))
      }
    },
  )

  test('o lote de 1000 tem uma pessoa sorteada de novo (mil-3/971/2)', () => {
    const lote = JSON.parse(ler('pessoas-1000.json')) as EnvelopeDasPessoas
    expect(lote.pessoas[971].email.endereco).toBe(
      'aline-pereira-1476@tuamaeaquelaursa.com',
    )
  })
})
