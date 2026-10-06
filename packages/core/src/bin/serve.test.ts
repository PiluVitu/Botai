/** @jest-environment node */
import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { request } from 'node:http'
import { join } from 'node:path'
import * as servidor from '../servidor/index'
import { HOST_PADRAO, PORTA_PADRAO } from '../servidor/index'
import { MOTOR } from '../versao'
import { ErroDoServe, lerOpcoesDoServe, subirServe } from './serve'

interface ItemDoIndice {
  arquivo: string
  n?: number
  opcoes: {
    semente: number | string
    hoje: string
    uf?: string
    dominioEmail?: string
  }
}

const RAIZ = join(__dirname, '..', '..')
const BIN = join(
  RAIZ,
  (
    JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8')) as {
      bin: { botai: string }
    }
  ).bin.botai,
)
const DOURADO = join(RAIZ, 'dourado', 'v1')
const ler = (arquivo: string) => readFileSync(join(DOURADO, arquivo), 'utf8')
const INDICE = JSON.parse(ler('indice.json')) as ItemDoIndice[]

interface Servindo {
  filho: ChildProcessWithoutNullStreams
  url: string
}

function botai(args: string[]): ChildProcessWithoutNullStreams {
  return spawn(process.execPath, [BIN, ...args])
}

function servir(args: string[]): Promise<Servindo> {
  const filho = botai(['serve', ...args])
  let erro = ''
  return new Promise((resolve, reject) => {
    filho.stderr.on('data', (parte: Buffer) => {
      erro += parte.toString()
      const achado = /ouvindo em (http:\/\/\S+)/.exec(erro)
      if (achado) resolve({ filho, url: achado[1] })
    })
    filho.on('exit', (codigo) =>
      reject(new Error(`serve saiu com ${codigo}: ${erro}`)),
    )
  })
}

function saida(
  filho: ChildProcessWithoutNullStreams,
): Promise<{ codigo: number | null; stdout: string; erro: string }> {
  let stdout = ''
  let erro = ''
  filho.stdout.on('data', (parte: Buffer) => (stdout += parte.toString()))
  filho.stderr.on('data', (parte: Buffer) => (erro += parte.toString()))
  return new Promise((resolve) =>
    filho.once('exit', (codigo) => resolve({ codigo, stdout, erro })),
  )
}

function pedir(url: string): Promise<{ status: number; corpo: string }> {
  return new Promise((resolve, reject) => {
    request(url, { agent: false }, (res) => {
      let corpo = ''
      res.setEncoding('utf8')
      res.on('data', (parte: string) => (corpo += parte))
      res.on('end', () => resolve({ status: res.statusCode ?? 0, corpo }))
    })
      .on('error', reject)
      .end()
  })
}

// O envelope não registra uf nem dominioEmail: a consulta sai do índice.
function alvoDe(item: ItemDoIndice): string {
  const { semente, hoje, uf, dominioEmail } = item.opcoes
  const consulta = new URLSearchParams({ semente: String(semente), hoje })
  if (uf !== undefined) consulta.set('uf', uf)
  if (dominioEmail !== undefined) consulta.set('dominioEmail', dominioEmail)
  if (item.n !== undefined) consulta.set('n', String(item.n))
  return `${item.n === undefined ? '/pessoa' : '/pessoas'}?${consulta}`
}

describe('lerOpcoesDoServe', () => {
  test('sem opção: porta 8790 em 127.0.0.1', () => {
    expect(lerOpcoesDoServe([])).toEqual({
      porta: PORTA_PADRAO,
      host: HOST_PADRAO,
    })
  })

  test('--porta 0 (uma livre) e --host', () => {
    expect(lerOpcoesDoServe(['--porta', '0', '--host', '0.0.0.0'])).toEqual({
      porta: 0,
      host: '0.0.0.0',
    })
  })

  // O leitor de argumentos da fase 1: as flags valem como nos outros comandos.
  test('--porta=0 e --host=::1, como as outras flags da CLI', () => {
    expect(lerOpcoesDoServe(['--porta=0', '--host=::1'])).toEqual({
      porta: 0,
      host: '::1',
    })
  })

  test.each([
    [['--porta', 'abc'], '--porta inválida: abc'],
    [['--porta', '65536'], '--porta inválida: 65536'],
    [['--porta', '-1'], '--porta inválida: -1'],
    [['--porta'], '--porta precisa de um valor'],
    [['--porta='], '--porta precisa de um valor'],
    [['--host', ''], '--host precisa de um valor'],
    [['--porta', '1', '--porta', '2'], 'opção repetida: --porta'],
    [['--port', '1'], 'opção desconhecida: --port'],
    [['extra'], 'argumento inesperado: extra'],
  ])('%j → erro de uso (código 2)', (args, mensagem) => {
    let erro: unknown
    try {
      lerOpcoesDoServe(args)
    } catch (e) {
      erro = e
    }
    expect(erro).toBeInstanceOf(ErroDoServe)
    expect((erro as ErroDoServe).codigo).toBe(2)
    expect((erro as ErroDoServe).message).toContain(mensagem)
  })
})

// O listen recusado tem de virar ErroDoServe: qualquer outro erro escapa do executarServe como
// rejeição não tratada, e o processo sai com 1 e o stack trace do Node no lugar da mensagem.
// O erro é simulado porque cada sistema recusa coisas diferentes (ver o teste por processo abaixo).
describe('subirServe: listen recusado pelo sistema', () => {
  afterEach(() => jest.restoreAllMocks())

  test.each([
    [
      'EADDRINUSE',
      ['--porta', '9000'],
      1,
      'a porta 9000 já está em uso em 127.0.0.1',
    ],
    [
      'EADDRNOTAVAIL',
      ['--host', '203.0.113.1'],
      2,
      '--host inválido: 203.0.113.1',
    ],
    [
      'ENOTFOUND',
      ['--host', 'nao-existe.invalid'],
      2,
      '--host inválido: nao-existe.invalid',
    ],
    // macOS: endereço de multicast ou de broadcast (224.0.0.1, 255.255.255.255).
    ['EINVAL', ['--host', '224.0.0.1'], 2, '--host inválido: 224.0.0.1'],
    // Porta abaixo de 1024 sem root.
    [
      'EACCES',
      ['--porta', '80'],
      2,
      'sem permissão para a porta 80 em 127.0.0.1',
    ],
  ] as const)(
    '%s com %j → ErroDoServe com código %i',
    async (code, args, codigo, mensagem) => {
      jest.spyOn(servidor, 'iniciarServidor').mockRejectedValue(
        Object.assign(new Error(`listen ${code}`), {
          code,
          syscall: 'listen',
        }),
      )
      const subida = subirServe(args, () => {})
      await expect(subida).rejects.toBeInstanceOf(ErroDoServe)
      await expect(subida).rejects.toMatchObject({ codigo })
      await expect(subida).rejects.toThrow(mensagem)
    },
  )
})

// Medido em 2026-10-06: o macOS recusa 127.0.0.1:80 sem root; o Linux recusa a 80 sem root fora de
// container, mas num container o Docker põe ip_unprivileged_port_start = 0 e ela escuta.
function sistemaRecusaPorta80(): boolean {
  if (process.getuid?.() === 0) return false
  if (process.platform === 'darwin') return true
  try {
    const inicio = readFileSync(
      '/proc/sys/net/ipv4/ip_unprivileged_port_start',
      'utf8',
    )
    return Number(inicio) > 80
  } catch {
    return false
  }
}

// Medido em 2026-10-06: o macOS dá EINVAL no listen em 224.0.0.1; o Linux escuta nele.
const soNoMac = process.platform === 'darwin' ? test : test.skip
const comPorta80Recusada = sistemaRecusaPorta80() ? test : test.skip

describe('botai serve (o bin do build, por processo e HTTP)', () => {
  let servindo: Servindo | undefined

  beforeAll(() => {
    if (!existsSync(BIN))
      throw new Error(`${BIN} não existe: rode pnpm run build antes`)
  })

  afterEach(async () => {
    if (servindo && servindo.filho.exitCode === null) {
      const fim = saida(servindo.filho)
      servindo.filho.kill('SIGKILL')
      await fim
    }
    servindo = undefined
  })

  test('escuta em 127.0.0.1 por padrão e responde igual aos dourados', async () => {
    servindo = await servir(['--porta', '0'])
    expect(servindo.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/)

    for (const item of INDICE) {
      const r = await pedir(`${servindo.url}${alvoDe(item)}`)
      expect(r.status).toBe(200)
      const corpo = JSON.parse(r.corpo) as { motor: string }
      expect(corpo.motor).toBe(MOTOR)
      expect({ ...corpo, motor: '' }).toEqual({
        ...JSON.parse(ler(item.arquivo)),
        motor: '',
      })
    }
  })

  test.each(['SIGTERM', 'SIGINT'] as const)(
    '%s encerra com código 0',
    async (sinal) => {
      servindo = await servir(['--porta', '0'])
      const fim = saida(servindo.filho)
      servindo.filho.kill(sinal)
      expect((await fim).codigo).toBe(0)
    },
  )

  test('--help: a ajuda no stdout, saída 0, sem subir', async () => {
    const { codigo, stdout } = await saida(botai(['serve', '--help']))
    expect(codigo).toBe(0)
    expect(stdout).toContain('GET /pessoa, /pessoas, /saude')
  })

  test('porta ocupada: sai com 1 e diz o que fazer', async () => {
    servindo = await servir(['--porta', '0'])
    const porta = new URL(servindo.url).port
    const { codigo, erro } = await saida(botai(['serve', '--porta', porta]))
    expect(codigo).toBe(1)
    expect(erro).toContain(`a porta ${porta} já está em uso`)
  })

  test('host que não é desta máquina: sai com 2', async () => {
    const { codigo, erro } = await saida(
      botai(['serve', '--porta', '0', '--host', '203.0.113.1']),
    )
    expect(codigo).toBe(2)
    expect(erro).toContain('--host inválido: 203.0.113.1')
  })

  // A sonda do revisor: antes, saía com 1 e o stack trace do Node (rejeição não tratada do listen).
  soNoMac(
    'host de multicast (EINVAL): sai com 2 e só a mensagem no stderr',
    async () => {
      const { codigo, erro } = await saida(
        botai(['serve', '--porta', '0', '--host', '224.0.0.1']),
      )
      expect(erro).toBe(
        'botai: --host inválido: 224.0.0.1 (use um endereço desta máquina, como 127.0.0.1 ou 0.0.0.0)\n',
      )
      expect(codigo).toBe(2)
    },
  )

  comPorta80Recusada(
    'porta 80 sem root (EACCES): sai com 2 e só a mensagem no stderr',
    async () => {
      const { codigo, erro } = await saida(botai(['serve', '--porta', '80']))
      expect(erro).toBe(
        'botai: sem permissão para a porta 80 em 127.0.0.1 (abaixo de 1024 costuma exigir root); escolha outra com --porta\n',
      )
      expect(codigo).toBe(2)
    },
  )

  test('opção inválida: sai com 2, sem subir', async () => {
    const { codigo, erro } = await saida(botai(['serve', '--porta', 'abc']))
    expect(codigo).toBe(2)
    expect(erro).toContain('--porta inválida: abc')
  })
})
