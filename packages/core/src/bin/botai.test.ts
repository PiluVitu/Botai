import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { EnvelopeDaPessoa, EnvelopeDasPessoas } from '../envelope'
import type { OpcoesDaPessoa } from '../gerar'
import { type Dialeto, paraSql } from '../plano'

interface ItemDoIndice {
  arquivo: string
  n?: number
  opcoes: OpcoesDaPessoa & { semente: number | string; hoje: string }
  derivados?: { arquivo: string; formato: 'csv' | 'sql'; dialeto?: Dialeto }[]
}

const RAIZ = join(__dirname, '..', '..')
const BIN = join(RAIZ, 'dist', 'bin', 'botai.js')
const DOURADO = join(RAIZ, 'dourado', 'v1')
const ler = (arquivo: string) => readFileSync(join(DOURADO, arquivo), 'utf8')
const INDICE = JSON.parse(ler('indice.json')) as ItemDoIndice[]

function botai(...argv: string[]) {
  const r = spawnSync(process.execPath, [BIN, ...argv], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  return { codigo: r.status, stdout: r.stdout, stderr: r.stderr }
}

// Carrega o bin num processo próprio e, no tique seguinte, faz o stdout emitir um erro
// com o código dado, como o stream faz quando o leitor vai embora. Determinístico: não
// depende de corrida entre quem escreve e quem fecha o pipe.
function botaiComErroNoStdout(codigo: string) {
  const r = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      [
        `process.argv = [process.argv[0], ${JSON.stringify(BIN)}, '--versao']`,
        `await import(${JSON.stringify(pathToFileURL(BIN).href)})`,
        `setImmediate(() => process.stdout.emit('error', Object.assign(new Error('stdout fechado'), { code: ${JSON.stringify(codigo)} })))`,
      ].join('\n'),
    ],
    { encoding: 'utf8' },
  )
  return { codigo: r.status, stderr: r.stderr }
}

function argumentosDe(item: ItemDoIndice): string[] {
  const { semente, hoje, uf, dominioEmail } = item.opcoes
  const argv =
    item.n === undefined ? ['pessoa'] : ['pessoas', '-n', String(item.n)]
  argv.push('--semente', String(semente), '--hoje', hoje)
  if (uf !== undefined) argv.push('--uf', uf)
  if (dominioEmail !== undefined) argv.push('--dominio-email', dominioEmail)
  return argv
}

const semMotor = (e: EnvelopeDaPessoa | EnvelopeDasPessoas) => ({
  ...e,
  motor: '',
})

beforeAll(() => {
  if (!existsSync(BIN))
    throw new Error(`${BIN} não existe: rode pnpm run build antes`)
})

describe('bin botai do build', () => {
  test('começa com o shebang do node', () => {
    expect(readFileSync(BIN, 'utf8').split('\n')[0]).toBe('#!/usr/bin/env node')
  })

  test('--versao é a versão do package.json', () => {
    const { version } = JSON.parse(
      readFileSync(join(RAIZ, 'package.json'), 'utf8'),
    ) as { version: string }
    expect(botai('--versao')).toEqual({
      codigo: 0,
      stdout: `${version}\n`,
      stderr: '',
    })
  })

  test.each(INDICE.map((item) => [item.arquivo, item] as const))(
    'reproduz o dourado %s',
    (_, item) => {
      const r = botai(...argumentosDe(item))
      expect(r.stderr).toBe('')
      expect(r.codigo).toBe(0)
      const dourado = JSON.parse(ler(item.arquivo)) as
        EnvelopeDaPessoa | EnvelopeDasPessoas
      expect(semMotor(JSON.parse(r.stdout))).toEqual(semMotor(dourado))
    },
  )

  test('csv e sql do lote dourado, byte a byte', () => {
    const item = INDICE.find((i) => i.arquivo === 'pessoas-lote.json')!
    for (const derivado of item.derivados ?? []) {
      const argv = [...argumentosDe(item), '--formato', derivado.formato]
      if (derivado.dialeto) argv.push('--dialeto', derivado.dialeto)
      const r = botai(...argv)
      expect(r.codigo).toBe(0)
      const saida =
        derivado.formato === 'sql'
          ? r.stdout.slice(r.stdout.indexOf('\n') + 1)
          : r.stdout
      expect(saida).toBe(ler(derivado.arquivo))
    }
  })

  test('ndjson do lote dourado: uma pessoa por linha, na ordem', () => {
    const item = INDICE.find((i) => i.arquivo === 'pessoas-lote.json')!
    const r = botai(...argumentosDe(item), '--formato', 'ndjson')
    const dourado = JSON.parse(ler(item.arquivo)) as EnvelopeDasPessoas
    const linhas = r.stdout
      .trimEnd()
      .split('\n')
      .map((l) => JSON.parse(l) as EnvelopeDaPessoa)
    expect(linhas.map((l) => l.pessoa)).toEqual(dourado.pessoas)
    expect(linhas.map((l) => l.semente)).toEqual(
      dourado.pessoas.map((_, i) => `lote/${i}`),
    )
  })

  test('1000 pessoas em SQL: igual ao dourado e sem e-mail, CPF ou CNPJ repetido', () => {
    const dourado = JSON.parse(ler('pessoas-1000.json')) as EnvelopeDasPessoas
    const r = botai(
      'pessoas',
      '-n',
      '1000',
      '--semente',
      dourado.semente,
      '--hoje',
      dourado.hoje,
      '--formato',
      'sql',
    )
    expect(r.codigo).toBe(0)
    const [comentario, ...inserts] = r.stdout.split('\n')
    expect(comentario).toMatch(
      /^-- botai: formato 2, motor \d+\.\d+\.\d+\S*, semente mil-3, hoje 2026-10-05$/,
    )
    expect(inserts.join('\n')).toBe(paraSql(dourado.pessoas))
    expect(inserts.filter((l) => l.startsWith('INSERT INTO'))).toHaveLength(
      1000,
    )
    for (const campo of ['email', 'cpf', 'cnpj'] as const) {
      const valores = dourado.pessoas.map((p) =>
        campo === 'email'
          ? p.email.endereco
          : campo === 'cpf'
            ? p.cpf
            : p.empresa.cnpj,
      )
      expect(new Set(valores).size).toBe(1000)
    }
  })

  test('erro de uso: código 2, mensagem no stderr, stdout vazio', () => {
    expect(botai('pessoas', '-n', '100001', '--formato', 'csv')).toEqual({
      codigo: 2,
      stdout: '',
      stderr:
        'botai: -n: n precisa ser um inteiro de 0 a 100000, recebido 100001\n',
    })
  })

  test('cartões: lote de 13 em grupos (recusado, aprovado, pendente) da Pagar.me', () => {
    const r = botai(
      'pessoas',
      '--cartao',
      'pagarme',
      '--cenarios',
      'recusado:10,aprovado:2,pendente:1',
      '--semente',
      'cartoes',
      '--hoje',
      '2026-10-05',
      '--formato',
      'csv',
      '--campos',
      'nome,cartao_numero,cartao_provedor,cartao_cenario',
    )
    expect([r.codigo, r.stderr]).toEqual([0, ''])
    const [cabecalho, ...linhas] = r.stdout.trimEnd().split('\r\n')
    expect(cabecalho).toBe('nome,cartao_numero,cartao_provedor,cartao_cenario')
    expect(linhas.map((l) => l.split(',').slice(1).join(','))).toEqual([
      ...Array(10).fill('4000000000000028,pagarme,recusado'),
      '4000000000000010,pagarme,aprovado',
      '4000000000000010,pagarme,aprovado',
      '4000000000000036,pagarme,pendente',
    ])
  })

  test('cartões: cenário que o provedor não tem é erro de uso, com a lista dos dele', () => {
    expect(
      botai('pessoa', '--cartao', 'pagarme', '--cenario', 'recusado-cvc'),
    ).toEqual({
      codigo: 2,
      stdout: '',
      stderr:
        'botai: --cenario: cenário desconhecido "recusado-cvc" para o provedor pagarme (use aprovado, recusado, pendente, pendente-recusado, pendente-cancelado, chargeback)\n',
    })
    expect(
      botai('cartao', '--cartao', 'pagarme', '--cenario', 'chargeback'),
    ).toEqual({ codigo: 0, stdout: '4000000000000069\n', stderr: '' })
  })

  test('validar inválido sai com 1', () => {
    expect(botai('validar', 'cpf', '111.111.111-11')).toEqual({
      codigo: 1,
      stdout: 'inválido\n',
      stderr: '',
    })
  })

  test('saída cortada por pipe (| head) termina com 0 e sem mensagem', async () => {
    const filho = spawn(process.execPath, [
      BIN,
      'pessoas',
      '-n',
      '20000',
      '--semente',
      'pipe',
      '--hoje',
      '2026-10-05',
      '--formato',
      'ndjson',
    ])
    let stderr = ''
    filho.stderr.setEncoding('utf8').on('data', (t: string) => {
      stderr += t
    })
    filho.stdout.once('data', () => filho.stdout.destroy())
    const codigo = await new Promise<number | null>((resolve) =>
      filho.on('close', resolve),
    )
    expect(stderr).toBe('')
    expect(codigo).toBe(0)
  }, 30_000)

  // O teste do pipe acima pega um código só, o que a corrida der. No macOS o stdout de um
  // filho do Node é um socketpair, e o leitor que fecha dá ENOTCONN em vez de EPIPE.
  test.each(['EPIPE', 'ENOTCONN'])(
    'stdout com %s (o leitor foi embora) termina com 0 e sem mensagem',
    (codigo) => {
      expect(botaiComErroNoStdout(codigo)).toEqual({ codigo: 0, stderr: '' })
    },
  )

  test('outro erro do stdout não é engolido', () => {
    const r = botaiComErroNoStdout('EIO')
    expect(r.codigo).toBe(1)
    expect(r.stderr).toContain("code: 'EIO'")
  })
})
