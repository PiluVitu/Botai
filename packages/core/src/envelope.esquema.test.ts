import { Ajv2020 } from 'ajv/dist/2020.js'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CATALOGO_DE_CARTOES, PROVEDORES } from './cartao'
import {
  type EnvelopeDaPessoa,
  gerarEnvelopeDaPessoa,
  gerarEnvelopeDasPessoas,
} from './envelope'

const RAIZ = join(__dirname, '..')
const compilar = (arquivo: string) =>
  new Ajv2020({ allErrors: true, strict: true }).compile(
    JSON.parse(readFileSync(join(RAIZ, 'esquema', arquivo), 'utf8')) as object,
  )
const validar = compilar('envelope-v2.schema.json')
const validarV1 = compilar('envelope-v1.schema.json')
const HOJE = '2026-10-05'

// O envelope de formato 1 (motor 0.2.0 a 0.4.1): o mesmo, sem provedor e cenario no cartão.
function comoFormato1(e: EnvelopeDaPessoa): unknown {
  const { provedor: _p, cenario: _c, ...cartao } = e.pessoa.cartao
  return { ...e, formato: 1, pessoa: { ...e.pessoa, cartao } }
}

describe('esquema/envelope-v2.schema.json', () => {
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

  test('todo provedor e todo cenário seguem o esquema', () => {
    for (const provedor of PROVEDORES)
      for (const { id: cenario } of CATALOGO_DE_CARTOES[provedor]) {
        const e = gerarEnvelopeDaPessoa({
          semente: cenario,
          hoje: HOJE,
          cartao: { provedor, cenario },
        })
        expect({ provedor, cenario, ok: validar(e) }).toEqual({
          provedor,
          cenario,
          ok: true,
        })
      }
    expect(
      validar(
        gerarEnvelopeDasPessoas(13, {
          semente: 'lote',
          hoje: HOJE,
          cartao: {
            provedor: 'pagarme',
            cenarios: { recusado: 10, aprovado: 2, pendente: 1 },
          },
        }),
      ),
    ).toBe(true)
  })

  test('os cenários de cada provedor no esquema são os do catálogo', () => {
    const esquema = JSON.parse(
      readFileSync(join(RAIZ, 'esquema', 'envelope-v2.schema.json'), 'utf8'),
    ) as {
      $defs: {
        pessoa: {
          properties: {
            cartao: {
              properties: { provedor: { enum: string[] } }
              oneOf: {
                properties: {
                  provedor: { const: string }
                  cenario: { enum: string[] }
                }
              }[]
            }
          }
        }
      }
    }
    const { cartao } = esquema.$defs.pessoa.properties
    expect(cartao.properties.provedor.enum).toEqual([...PROVEDORES])
    expect(
      cartao.oneOf.map(({ properties: p }) => [
        p.provedor.const,
        p.cenario.enum,
      ]),
    ).toEqual(
      PROVEDORES.map((provedor) => [
        provedor,
        CATALOGO_DE_CARTOES[provedor].map((c) => c.id),
      ]),
    )
  })

  test('recusa campo a mais, formato 1, CPF sem máscara e semente vazia', () => {
    const e = gerarEnvelopeDaPessoa({ semente: 42, hoje: HOJE })
    expect(validar({ ...e, extra: 1 })).toBe(false)
    expect(validar({ ...e, formato: 1 })).toBe(false)
    expect(validar({ ...e, pessoa: { ...e.pessoa, cpf: '64769223439' } })).toBe(
      false,
    )
    expect(validar({ ...e, semente: '' })).toBe(false)
  })

  test('recusa cartão sem provedor, provedor desconhecido e cenário de outro provedor', () => {
    const e = gerarEnvelopeDaPessoa({ semente: 42, hoje: HOJE })
    const comCartao = (cartao: object) => ({
      ...e,
      pessoa: { ...e.pessoa, cartao: { ...e.pessoa.cartao, ...cartao } },
    })
    expect(validar(comCartao({}))).toBe(true)
    expect(validar(comCartao({ provedor: 'adyen' }))).toBe(false)
    expect(validar(comCartao({ cenario: 'chargeback' }))).toBe(false)
    expect(
      validar(comCartao({ provedor: 'pagarme', cenario: 'chargeback' })),
    ).toBe(true)
    expect(
      validar(comCartao({ provedor: 'pagarme', cenario: 'recusado-cvc' })),
    ).toBe(false)
    expect(validar(comoFormato1(e))).toBe(false)
  })
})

// O v1 continua no pacote para os envelopes guardados de antes da 0.5.0.
describe('esquema/envelope-v1.schema.json (formato 1)', () => {
  test('valida o envelope de formato 1 e recusa o de formato 2', () => {
    const e = gerarEnvelopeDaPessoa({ semente: 42, hoje: HOJE })
    expect(validarV1(comoFormato1(e))).toBe(true)
    expect(validarV1(e)).toBe(false)
  })
})
