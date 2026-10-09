import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const PACOTE = resolve(__dirname, '..')
const PLAYWRIGHT = join(PACOTE, 'node_modules/.bin/playwright')
const VERSAO_DO_CORE: string = JSON.parse(
  readFileSync(join(PACOTE, '../core/package.json'), 'utf8'),
).version
const TITULO_RETRY = 'falha na primeira tentativa e passa na segunda'
const TITULO_HOJE = 'botaiHoje fora do formato falha com mensagem clara'
const TITULO_CARTAO =
  'botaiCartao com cenário que o provedor não tem falha com mensagem clara'

interface Anexo {
  name: string
  contentType: string
  body?: string
}
interface Tentativa {
  retry: number
  status: string
  attachments: Anexo[]
  annotations: { type: string; description?: string }[]
  errors: { message: string }[]
}
interface Especificacao {
  title: string
  tests: { results: Tentativa[] }[]
}
interface Suite {
  specs: Especificacao[]
  suites?: Suite[]
}

const especificacoes = (suites: Suite[]): Especificacao[] =>
  suites.flatMap((suite) => [
    ...suite.specs,
    ...especificacoes(suite.suites ?? []),
  ])

let status: number | null
let relatorio: { suites: Suite[] }

beforeAll(() => {
  const pasta = mkdtempSync(join(tmpdir(), 'botai-filho-'))
  try {
    const arquivo = join(pasta, 'relatorio.json')
    // O Playwright se recusa a rodar ("excluded from Jest test runs") quando acha JEST_WORKER_ID no ambiente.
    const { JEST_WORKER_ID: _doJest, ...ambiente } = process.env
    const execucao = spawnSync(
      PLAYWRIGHT,
      ['test', '-c', 'src/teste/filho/playwright.config.ts', '--reporter=json'],
      {
        cwd: PACOTE,
        encoding: 'utf8',
        env: { ...ambiente, PLAYWRIGHT_JSON_OUTPUT_FILE: arquivo },
      },
    )
    status = execucao.status
    relatorio = JSON.parse(readFileSync(arquivo, 'utf8'))
  } finally {
    rmSync(pasta, { recursive: true, force: true })
  }
}, 120_000)

function tentativas(titulo: string): Tentativa[] {
  const especificacao = especificacoes(relatorio.suites).find(
    (s) => s.title === titulo,
  )
  if (!especificacao) throw new Error(`o relatório não tem "${titulo}"`)
  return especificacao.tests[0].results
}

const anexoDaPessoa = (tentativa: Tentativa) =>
  tentativa.attachments.find((a) => a.name === 'botai-pessoa.json')
const decodificar = (anexo: Anexo) =>
  JSON.parse(Buffer.from(anexo.body ?? '', 'base64').toString('utf8'))
const anotacao = (tentativa: Tentativa, tipo: string) =>
  tentativa.annotations.find((a) => a.type === tipo)?.description

describe('fixture botai num projeto de verdade (relatório JSON)', () => {
  it('o projeto filho termina com falha, porque o teste de botaiHoje ruim falha de propósito', () => {
    expect(status).toBe(1)
  })

  it('em falha anexa botai-pessoa.json com o envelope; na tentativa que passa, não anexa', () => {
    const [primeira, segunda] = tentativas(TITULO_RETRY)
    expect(primeira.status).toBe('failed')
    expect(segunda.status).toBe('passed')
    const anexo = anexoDaPessoa(primeira)
    expect(anexo?.contentType).toBe('application/json')
    const envelope = decodificar(anexo as Anexo)
    expect(envelope).toMatchObject({
      formato: 2,
      motor: VERSAO_DO_CORE,
      semente: `filho › filho.teste.ts › ${TITULO_RETRY}`,
    })
    expect(envelope.hoje).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(anexoDaPessoa(segunda)).toBeUndefined()
  })

  it('o retry gera a mesma pessoa, e as anotações registram semente e hoje', () => {
    const [primeira, segunda] = tentativas(TITULO_RETRY)
    const envelope = decodificar(anexoDaPessoa(primeira) as Anexo)
    expect(
      JSON.parse(anotacao(primeira, 'pessoa-da-tentativa') ?? 'null'),
    ).toEqual(envelope.pessoa)
    expect(
      JSON.parse(anotacao(segunda, 'pessoa-da-tentativa') ?? 'null'),
    ).toEqual(envelope.pessoa)
    expect(anotacao(segunda, 'botai-semente')).toBe(envelope.semente)
    expect(anotacao(segunda, 'botai-hoje')).toBe(envelope.hoje)
  })

  it('botaiHoje fora do formato falha no setup com mensagem que nomeia a opção', () => {
    const [primeira] = tentativas(TITULO_HOJE)
    expect(primeira.status).toBe('failed')
    expect(primeira.errors.map((e) => e.message).join('\n')).toContain(
      'botaiHoje: esperado AAAA-MM-DD, recebido "05/10/2026"',
    )
  })

  it('botaiCartao inválido falha no setup com a opção e os cenários do provedor', () => {
    const [primeira] = tentativas(TITULO_CARTAO)
    expect(primeira.status).toBe('failed')
    expect(primeira.errors.map((e) => e.message).join('\n')).toContain(
      'botaiCartao: cenário desconhecido "recusado-cvc" para o provedor pagarme (use aprovado, recusado, pendente, pendente-recusado, pendente-cancelado, chargeback)',
    )
  })

  it('o anexo leva o provedor e o cenário do cartão (padrão: stripe, aprovado)', () => {
    const [primeira] = tentativas(TITULO_RETRY)
    expect(
      decodificar(anexoDaPessoa(primeira) as Anexo).pessoa.cartao,
    ).toMatchObject({ provedor: 'stripe', cenario: 'aprovado' })
  })
})
