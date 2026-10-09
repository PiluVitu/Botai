/** @jest-environment node */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { executar } from '../cli/executar'
import type { EnvelopeDaPessoa, EnvelopeDasPessoas } from '../envelope'
import { hojeEmSaoPaulo } from '../hoje'
import { type Dialeto, FORMATOS } from '../plano'
import { MOTOR } from '../versao'
import { LIMITE_DE_PESSOAS } from './consulta'
import { responder, TIPO_POR_FORMATO } from './rotas'

interface ItemDoIndice {
  arquivo: string
  n?: number
  opcoes: {
    semente: number | string
    hoje: string
    uf?: string
    dominioEmail?: string
  }
  derivados?: { arquivo: string; formato: 'csv' | 'sql'; dialeto?: Dialeto }[]
}

const DOURADO = join(__dirname, '..', '..', 'dourado', 'v1')
const ler = (arquivo: string) => readFileSync(join(DOURADO, arquivo), 'utf8')
const INDICE = JSON.parse(ler('indice.json')) as ItemDoIndice[]
const LOTE = INDICE.find((item) => item.arquivo === 'pessoas-lote.json')!

// O envelope não registra uf nem dominioEmail: a consulta sai do índice, não do .json.
function alvoDe(
  item: ItemDoIndice,
  extras: Record<string, string> = {},
): string {
  const { semente, hoje, uf, dominioEmail } = item.opcoes
  const consulta = new URLSearchParams({ semente: String(semente), hoje })
  if (uf !== undefined) consulta.set('uf', uf)
  if (dominioEmail !== undefined) consulta.set('dominioEmail', dominioEmail)
  if (item.n !== undefined) consulta.set('n', String(item.n))
  for (const [nome, valor] of Object.entries(extras)) consulta.set(nome, valor)
  return `${item.n === undefined ? '/pessoa' : '/pessoas'}?${consulta}`
}

function json(alvo: string): {
  status: number
  corpo: Record<string, unknown>
} {
  const r = responder('GET', alvo)
  expect(r.cabecalhos['Content-Type']).toBe('application/json; charset=utf-8')
  return { status: r.status, corpo: JSON.parse(r.corpo) }
}

// O stdout de `botai …`, pelo mesmo executar que o bin usa.
function cli(...argv: string[]): string {
  let dados = ''
  const codigo = executar(argv, {
    dados: (texto) => {
      dados += texto
    },
    mensagem: () => {},
  })
  expect(codigo).toBe(0)
  return dados
}

const semMotor = (envelope: object) => ({ ...envelope, motor: '' })
const semPrimeiraLinha = (sql: string) => sql.slice(sql.indexOf('\n') + 1)

describe('responder: dourados', () => {
  test.each(INDICE.map((item) => [item.arquivo, item] as const))(
    'igual ao dourado %s',
    (_, item) => {
      const { status, corpo } = json(alvoDe(item))
      expect(status).toBe(200)
      expect(corpo.motor).toBe(MOTOR)
      const dourado = JSON.parse(ler(item.arquivo)) as
        EnvelopeDaPessoa | EnvelopeDasPessoas
      expect(semMotor(corpo)).toEqual(semMotor(dourado))
    },
  )

  test.each((LOTE.derivados ?? []).map((d) => [d.arquivo, d] as const))(
    'igual ao derivado dourado %s',
    (_, derivado) => {
      const extras: Record<string, string> = { formato: derivado.formato }
      if (derivado.dialeto) extras.dialeto = derivado.dialeto
      const r = responder('GET', alvoDe(LOTE, extras))
      expect(r.status).toBe(200)
      expect(r.cabecalhos['Content-Type']).toBe(
        TIPO_POR_FORMATO[derivado.formato],
      )
      const corpo =
        derivado.formato === 'sql' ? semPrimeiraLinha(r.corpo) : r.corpo
      expect(corpo).toBe(ler(derivado.arquivo))
    },
  )
})

describe('responder: o mesmo texto da CLI', () => {
  test.each(FORMATOS)(
    '/pessoas em %s é o stdout de botai pessoas',
    (formato) => {
      const r = responder(
        'GET',
        `/pessoas?n=3&semente=s&hoje=2026-10-05&uf=pi&formato=${formato}`,
      )
      expect(r.status).toBe(200)
      expect(r.corpo).toBe(
        cli(
          'pessoas',
          '-n',
          '3',
          '--semente',
          's',
          '--hoje',
          '2026-10-05',
          '--uf',
          'pi',
          '--formato',
          formato,
        ),
      )
    },
  )

  test('dialeto, tabela e campos chegam ao sql como na CLI', () => {
    const r = responder(
      'GET',
      '/pessoas?n=2&semente=s&hoje=2026-10-05&formato=sql&dialeto=mysql&tabela=esquema.clientes&campos=nome,cpf',
    )
    expect(r.corpo).toBe(
      cli(
        'pessoas',
        '-n',
        '2',
        '--semente',
        's',
        '--hoje',
        '2026-10-05',
        '--formato',
        'sql',
        '--dialeto',
        'mysql',
        '--tabela',
        'esquema.clientes',
        '--campos',
        'nome,cpf',
      ),
    )
  })

  test('/pessoa é o stdout de botai pessoa, com uf e domínio em qualquer caixa', () => {
    const r = responder(
      'GET',
      '/pessoa?semente=7&hoje=2026-10-05&uf=pi&dominioEmail=Example.com',
    )
    expect(r.corpo).toBe(
      cli(
        'pessoa',
        '--semente',
        '7',
        '--hoje',
        '2026-10-05',
        '--uf',
        'pi',
        '--dominio-email',
        'Example.com',
      ),
    )
  })
})

describe('responder', () => {
  test('/saude diz o formato e o motor', () => {
    expect(json('/saude')).toEqual({
      status: 200,
      corpo: { ok: true, formato: 2, motor: MOTOR },
    })
  })

  test('Content-Type de cada formato', () => {
    expect(TIPO_POR_FORMATO).toEqual({
      json: 'application/json; charset=utf-8',
      ndjson: 'application/x-ndjson; charset=utf-8',
      csv: 'text/csv; charset=utf-8; header=present',
      sql: 'application/sql; charset=utf-8',
    })
  })

  test('/pessoa sem semente sorteia uma e a registra: repetir com ela dá a mesma pessoa', () => {
    const primeira = json('/pessoa?hoje=2026-10-05').corpo
    expect(primeira.semente).toMatch(/^[0-9a-f]{16}$/)
    const segunda = json(
      `/pessoa?semente=${String(primeira.semente)}&hoje=2026-10-05`,
    ).corpo
    expect(segunda.pessoa).toEqual(primeira.pessoa)
  })

  test('/pessoa sem hoje usa o dia de São Paulo e o registra', () => {
    const antes = hojeEmSaoPaulo()
    const { corpo } = json('/pessoa?semente=1')
    expect([antes, hojeEmSaoPaulo()]).toContain(corpo.hoje)
  })

  test(`n=${LIMITE_DE_PESSOAS} ainda responde`, () => {
    const r = responder(
      'GET',
      `/pessoas?n=${LIMITE_DE_PESSOAS}&semente=limite&hoje=2026-10-05&formato=ndjson`,
    )
    expect(r.status).toBe(200)
    expect(r.corpo.trimEnd().split('\n')).toHaveLength(LIMITE_DE_PESSOAS)
  })

  test.each([
    [
      '/pessoa?dominio-email=example.com',
      'parâmetro desconhecido: dominio-email',
    ],
    [
      '/pessoa?hoje=2026-02-30',
      'hoje: hoje precisa ser uma data AAAA-MM-DD que existe, recebido "2026-02-30"',
    ],
    ['/pessoas?n=0', 'n inválido: 0'],
    ['/pessoas?n=1&n=2', 'parâmetro repetido: n'],
    ['/pessoas?n=1&formato=csv&campos=x', 'campos: coluna desconhecida "x"'],
  ])('%s → 400 com a mensagem de uso', (alvo, mensagem) => {
    const { status, corpo } = json(alvo)
    expect(status).toBe(400)
    expect(corpo.erro).toContain(mensagem)
  })

  test('rota desconhecida → 404 com as rotas', () => {
    const { status, corpo } = json('/pessoa/')
    expect(status).toBe(404)
    expect(corpo.erro).toBe(
      'rota desconhecida: /pessoa/ (rotas: /pessoa, /pessoas, /saude)',
    )
  })

  test('método que não é GET → 405 com Allow: GET', () => {
    const r = responder('POST', '/pessoa')
    expect(r.status).toBe(405)
    expect(r.cabecalhos.Allow).toBe('GET')
  })

  // O node:http entrega o alvo em forma absoluta sem validar; um throw aqui derruba o servidor.
  test.each(['http://[', 'http://a:b:c/pessoa', 'http://%/x', 'http://[::1/x'])(
    'alvo que não é URL (%s) → 400, sem lançar',
    (alvo) => {
      const r = responder('GET', alvo)
      expect(r.status).toBe(400)
      expect(r.cabecalhos['Content-Type']).toBe(
        'application/json; charset=utf-8',
      )
      expect(r.cabecalhos['Cache-Control']).toBe('no-store')
      expect(r.cabecalhos['X-Content-Type-Options']).toBe('nosniff')
      expect(JSON.parse(r.corpo).erro).toBe(`alvo inválido: ${alvo}`)
    },
  )

  test('toda resposta leva no-store e nosniff', () => {
    for (const alvo of ['/saude', '/pessoa?semente=1', '/x', '/pessoas']) {
      const r = responder('GET', alvo)
      expect(r.cabecalhos['Cache-Control']).toBe('no-store')
      expect(r.cabecalhos['X-Content-Type-Options']).toBe('nosniff')
    }
  })
})
