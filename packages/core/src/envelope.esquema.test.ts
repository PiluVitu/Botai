import { Ajv2020 } from 'ajv/dist/2020.js'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gerarEnvelopeDaPessoa, gerarEnvelopeDasPessoas } from './envelope'

const RAIZ = join(__dirname, '..')
const esquema = JSON.parse(
  readFileSync(join(RAIZ, 'esquema', 'envelope-v1.schema.json'), 'utf8'),
) as object
const validar = new Ajv2020({ allErrors: true, strict: true }).compile(esquema)
const HOJE = '2026-10-05'

describe('esquema/envelope-v1.schema.json', () => {
  test('todo dourado .json (menos o índice) segue o esquema', () => {
    const pasta = join(RAIZ, 'dourado', 'v1')
    const arquivos = readdirSync(pasta).filter(
      (a) => a.endsWith('.json') && a !== 'indice.json',
    )
    expect(arquivos).toHaveLength(8)
    for (const arquivo of arquivos) {
      const ok = validar(JSON.parse(readFileSync(join(pasta, arquivo), 'utf8')))
      expect({ arquivo, erros: validar.errors ?? null }).toEqual({
        arquivo,
        erros: null,
      })
      expect(ok).toBe(true)
    }
  })

  test('envelopes com uf, outro domínio, 29/02 e lote vazio também seguem', () => {
    for (const envelope of [
      gerarEnvelopeDaPessoa({
        semente: 'x',
        hoje: HOJE,
        uf: 'AP',
        dominioEmail: 'example.com',
      }),
      gerarEnvelopeDasPessoas(500, { semente: 'y', hoje: '2028-02-29' }),
      gerarEnvelopeDasPessoas(0, { semente: 'z', hoje: HOJE }),
    ])
      expect(validar(envelope)).toBe(true)
  })

  test('recusa campo a mais, formato 2, CPF sem máscara e semente vazia', () => {
    const e = gerarEnvelopeDaPessoa({ semente: 42, hoje: HOJE })
    expect(validar({ ...e, extra: 1 })).toBe(false)
    expect(validar({ ...e, formato: 2 })).toBe(false)
    expect(validar({ ...e, pessoa: { ...e.pessoa, cpf: '64769223439' } })).toBe(
      false,
    )
    expect(validar({ ...e, semente: '' })).toBe(false)
  })
})
