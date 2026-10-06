/** @jest-environment node */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const SCRIPT = join(__dirname, 'install.sh')
const BINARIOS = [
  'botai-darwin-arm64',
  'botai-darwin-x64',
  'botai-linux-x64',
  'botai-linux-arm64',
]

interface Maquina {
  sistema: string
  arquitetura: string
  rosetta?: boolean
  musl?: boolean
}

interface Execucao {
  codigo: number | null
  stdout: string
  stderr: string
}

let pasta: string
let release: string
let servidor: Server
let releases: string
let pedidos: string[]

function escrever(caminho: string, conteudo: string): void {
  writeFileSync(caminho, conteudo)
  chmodSync(caminho, 0o755)
}

// Cada "binário" falso é um script que diz o próprio nome: prova qual arquivo foi instalado.
function montarRelease(): void {
  release = join(pasta, 'release')
  mkdirSync(release)
  const linhas = BINARIOS.map((nome) => {
    const conteudo = `#!/bin/sh\necho ${nome}\n`
    escrever(join(release, nome), conteudo)
    return `${createHash('sha256').update(conteudo).digest('hex')}  ${nome}`
  })
  writeFileSync(join(release, 'SHA256SUMS'), `${linhas.join('\n')}\n`)
}

// uname, sysctl e ldd falsos na frente do PATH: o teste escolhe a máquina.
function binFalso(maquina: Maquina): string {
  const bin = mkdtempSync(join(pasta, 'bin-'))
  escrever(
    join(bin, 'uname'),
    `#!/bin/sh\ncase "$1" in -s) echo ${maquina.sistema} ;; -m) echo ${maquina.arquitetura} ;; esac\n`,
  )
  escrever(join(bin, 'sysctl'), `#!/bin/sh\necho ${maquina.rosetta ? 1 : 0}\n`)
  escrever(
    join(bin, 'ldd'),
    maquina.musl
      ? '#!/bin/sh\necho "musl libc (x86_64)" >&2\nexit 1\n'
      : '#!/bin/sh\necho "ldd (GNU libc) 2.39"\n',
  )
  return bin
}

function instalar(
  maquina: Maquina,
  env: Record<string, string> = {},
): Promise<Execucao> {
  return new Promise((resolve, reject) => {
    // spawn assíncrono: o servidor do release falso roda neste mesmo processo.
    const filho = spawn('sh', [SCRIPT], {
      env: {
        HOME: pasta,
        PATH: `${binFalso(maquina)}:${process.env.PATH ?? ''}`,
        BOTAI_RELEASES: releases,
        BOTAI_DESTINO: join(pasta, 'destino'),
        ...env,
      },
    })
    let stdout = ''
    let stderr = ''
    filho.stdout.on('data', (parte: Buffer) => (stdout += parte.toString()))
    filho.stderr.on('data', (parte: Buffer) => (stderr += parte.toString()))
    filho.on('error', reject)
    filho.on('close', (codigo) => resolve({ codigo, stdout, stderr }))
  })
}

function rodar(caminho: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const filho = spawn(caminho, [])
    let saida = ''
    filho.stdout.on('data', (parte: Buffer) => (saida += parte.toString()))
    filho.on('error', reject)
    filho.on('close', () => resolve(saida.trim()))
  })
}

const instalado = () => join(pasta, 'destino', 'botai')

beforeEach(async () => {
  pasta = mkdtempSync(join(tmpdir(), 'botai-install-'))
  pedidos = []
  montarRelease()
  servidor = createServer((req, res) => {
    pedidos.push(req.url ?? '')
    const arquivo = (req.url ?? '').split('/').pop() ?? ''
    const caminho = join(release, arquivo)
    if (!arquivo || !existsSync(caminho)) {
      res.writeHead(404).end()
      return
    }
    res.writeHead(200).end(readFileSync(caminho))
  })
  await new Promise<void>((resolve) =>
    servidor.listen(0, '127.0.0.1', () => resolve()),
  )
  releases = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`
})

afterEach(async () => {
  await new Promise<void>((resolve) => servidor.close(() => resolve()))
  rmSync(pasta, { recursive: true, force: true })
})

describe('install.sh', () => {
  test('Linux x64 com glibc: baixa da última versão, confere e instala executável', async () => {
    const r = await instalar({ sistema: 'Linux', arquitetura: 'x86_64' })

    expect(r.codigo).toBe(0)
    expect(statSync(instalado()).mode & 0o111).toBe(0o111)
    expect(await rodar(instalado())).toBe('botai-linux-x64')
    expect(pedidos).toEqual([
      '/latest/download/SHA256SUMS',
      '/latest/download/botai-linux-x64',
    ])
    expect(r.stdout).toContain('botai instalado em')
  })

  test('aarch64 vira arm64', async () => {
    const r = await instalar({ sistema: 'Linux', arquitetura: 'aarch64' })

    expect(r.codigo).toBe(0)
    expect(await rodar(instalado())).toBe('botai-linux-arm64')
  })

  test('Mac Apple Silicon num terminal sob Rosetta instala o arm64', async () => {
    const r = await instalar({
      sistema: 'Darwin',
      arquitetura: 'x86_64',
      rosetta: true,
    })

    expect(r.codigo).toBe(0)
    expect(await rodar(instalado())).toBe('botai-darwin-arm64')
  })

  test('Mac Intel instala o x64', async () => {
    const r = await instalar({ sistema: 'Darwin', arquitetura: 'x86_64' })

    expect(r.codigo).toBe(0)
    expect(await rodar(instalado())).toBe('botai-darwin-x64')
  })

  test('BOTAI_VERSAO baixa da tag core-v<versão>', async () => {
    const r = await instalar(
      { sistema: 'Linux', arquitetura: 'x86_64' },
      { BOTAI_VERSAO: '0.3.0' },
    )

    expect(r.codigo).toBe(0)
    expect(pedidos).toEqual([
      '/download/core-v0.3.0/SHA256SUMS',
      '/download/core-v0.3.0/botai-linux-x64',
    ])
  })

  test('SHA256 que não confere: sai com erro e não instala nada', async () => {
    writeFileSync(join(release, 'botai-linux-x64'), '#!/bin/sh\necho trocado\n')

    const r = await instalar({ sistema: 'Linux', arquitetura: 'x86_64' })

    expect(r.codigo).not.toBe(0)
    expect(r.stderr).toContain('não confere')
    expect(existsSync(instalado())).toBe(false)
  })

  test('binário ausente no release: erro com a URL', async () => {
    rmSync(join(release, 'botai-linux-arm64'))

    const r = await instalar({ sistema: 'Linux', arquitetura: 'arm64' })

    expect(r.codigo).not.toBe(0)
    expect(r.stderr).toContain('/latest/download/botai-linux-arm64')
  })

  test('Linux com musl (Alpine): recusa sem baixar e indica a imagem e o npm', async () => {
    const r = await instalar({
      sistema: 'Linux',
      arquitetura: 'x86_64',
      musl: true,
    })

    expect(r.codigo).not.toBe(0)
    expect(r.stderr).toContain('musl')
    expect(r.stderr).toContain('ghcr.io/piluvitu/botai')
    expect(pedidos).toEqual([])
  })

  test('Windows (Git Bash): recusa e indica os .exe', async () => {
    const r = await instalar({
      sistema: 'MINGW64_NT-10.0-26100',
      arquitetura: 'x86_64',
    })

    expect(r.codigo).not.toBe(0)
    expect(r.stderr).toContain('botai-windows-x64.exe')
    expect(r.stderr).toContain('botai-windows-arm64.exe')
    expect(pedidos).toEqual([])
  })

  test('arquitetura sem binário (armv7l): recusa', async () => {
    const r = await instalar({ sistema: 'Linux', arquitetura: 'armv7l' })

    expect(r.codigo).not.toBe(0)
    expect(r.stderr).toContain('armv7l')
  })

  test('destino fora do PATH: avisa como acrescentar', async () => {
    const r = await instalar({ sistema: 'Linux', arquitetura: 'x86_64' })

    expect(r.stderr).toContain('não está no PATH')
    expect(r.stderr).toContain(`export PATH="${join(pasta, 'destino')}:$PATH"`)
  })

  test('destino no PATH: sem aviso', async () => {
    const bin = binFalso({ sistema: 'Linux', arquitetura: 'x86_64' })
    const r = await instalar(
      { sistema: 'Linux', arquitetura: 'x86_64' },
      { PATH: `${bin}:${join(pasta, 'destino')}:${process.env.PATH ?? ''}` },
    )

    expect(r.codigo).toBe(0)
    expect(r.stderr).toBe('')
  })

  test('reinstalar troca o binário anterior', async () => {
    await instalar({ sistema: 'Linux', arquitetura: 'x86_64' })
    const r = await instalar({ sistema: 'Linux', arquitetura: 'aarch64' })

    expect(r.codigo).toBe(0)
    expect(await rodar(instalado())).toBe('botai-linux-arm64')
  })
})
