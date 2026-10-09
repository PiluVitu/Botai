/** @jest-environment node */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { EnvelopeDaPessoa, EnvelopeDasPessoas } from './envelope'
import { type OpcoesDaPessoa, resolverOpcoes } from './gerar'
import { type FormaDoLote, textoDoLote } from './lote'
import { ErroDeOpcao, LIMITE_DO_LOTE } from './opcoes'
import { type Dialeto, paraSql } from './plano'
import { MOTOR } from './versao'

interface ItemDoIndice {
  arquivo: string
  n?: number
  opcoes: OpcoesDaPessoa
  derivados?: { arquivo: string; formato: 'csv' | 'sql'; dialeto?: Dialeto }[]
}

const DOURADO = join(__dirname, '..', 'dourado', 'v1')
const ler = (arquivo: string) => readFileSync(join(DOURADO, arquivo), 'utf8')
const ITEM = (JSON.parse(ler('indice.json')) as ItemDoIndice[]).find(
  (item) => item.arquivo === 'pessoas-lote.json',
)!
const LOTE = JSON.parse(ler(ITEM.arquivo)) as EnvelopeDasPessoas
const OPCOES = resolverOpcoes(ITEM.opcoes)
const texto = (forma: FormaDoLote) =>
  Array.from(textoDoLote(ITEM.n!, OPCOES, forma)).join('')
const semPrimeiraLinha = (sql: string) => sql.slice(sql.indexOf('\n') + 1)

describe('textoDoLote', () => {
  test('json: o envelope do lote dourado, com 2 espaços e \\n no fim', () => {
    const json = texto({ formato: 'json' })
    expect(json).toBe(`${JSON.stringify({ ...LOTE, motor: MOTOR }, null, 2)}\n`)
  })

  // Cada linha reproduz sozinha: `botai pessoa --semente <a da linha> --hoje <o da linha>`.
  test('ndjson: um envelope por linha, com a semente exata da pessoa', () => {
    const linhas = texto({ formato: 'ndjson' })
      .trimEnd()
      .split('\n')
      .map((linha) => JSON.parse(linha) as EnvelopeDaPessoa)
    expect(linhas.map((l) => l.pessoa)).toEqual(LOTE.pessoas)
    expect(linhas.map((l) => l.semente)).toEqual(
      LOTE.pessoas.map((_, i) => `lote/${i}`),
    )
  })

  test.each((ITEM.derivados ?? []).map((d) => [d.arquivo, d] as const))(
    'igual ao derivado dourado %s',
    (_, derivado) => {
      const obtido = texto({
        formato: derivado.formato,
        ...(derivado.dialeto && { dialeto: derivado.dialeto }),
      })
      if (derivado.formato === 'csv') {
        expect(obtido).toBe(ler(derivado.arquivo))
        return
      }
      expect(obtido.split('\n')[0]).toBe(
        `-- botai: formato 2, motor ${MOTOR}, semente lote, hoje 2026-10-05`,
      )
      expect(semPrimeiraLinha(obtido)).toBe(ler(derivado.arquivo))
    },
  )

  test('sql com dialeto, tabela e colunas', () => {
    const forma = {
      formato: 'sql',
      dialeto: 'mysql',
      tabela: 'esquema.clientes',
      colunas: ['nome', 'cpf'],
    } as const
    expect(semPrimeiraLinha(texto(forma))).toBe(paraSql(LOTE.pessoas, forma))
  })

  test('csv com colunas: o cabeçalho segue a ordem pedida', () => {
    expect(texto({ formato: 'csv', colunas: ['cpf', 'nome'] })).toMatch(
      /^cpf,nome\r\n/,
    )
  })

  // Quem escreve as partes no stdout ou no corpo HTTP não pode ter escrito nada antes do erro.
  test('n fora do limite lança na chamada, antes de devolver qualquer parte', () => {
    expect(() =>
      textoDoLote(LIMITE_DO_LOTE + 1, OPCOES, { formato: 'csv' }),
    ).toThrow(ErroDeOpcao)
  })
})
