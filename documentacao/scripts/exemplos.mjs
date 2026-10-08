import { spawn } from 'node:child_process'
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join } from 'node:path'
import { setTimeout as esperar } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

export const RAIZ_DO_REPO = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
)
export const DOCS = join(RAIZ_DO_REPO, 'documentacao', 'docs')

const CORE = join(RAIZ_DO_REPO, 'packages', 'core')
const SERVIDOR_DOS_EXEMPLOS = '127.0.0.1:8790'
const LIMITE_DO_BLOCO_MS = 60_000
const PRAZO_DO_DIST_MS = 30_000

const COMANDOS_PROIBIDOS = [
  'docker',
  'docker-compose',
  'npx',
  'npm',
  'pnpm',
  'sudo',
  'gh',
  'psql',
  'mysql',
  'sqlite3',
]

export function lerMeta(meta) {
  const marca = meta
    .split(/\s+/)
    .find((parte) => parte === 'testar' || parte.startsWith('testar='))
  if (!marca) return null
  if (marca === 'testar') return { codigo: 0 }
  const valor = marca.slice('testar='.length)
  if (!/^\d{1,3}$/.test(valor) || Number(valor) > 255)
    throw new Error(
      `código de saída inválido em "${marca}": use testar=N, com N de 0 a 255`,
    )
  return { codigo: Number(valor) }
}

function fecha(linha, cerca) {
  const fechamento = /^\s*(`{3,}|~{3,})\s*$/.exec(linha)
  return (
    fechamento !== null &&
    fechamento[1][0] === cerca[0] &&
    fechamento[1].length >= cerca.length
  )
}

export function extrairBlocos(texto) {
  const linhas = texto.split(/\r?\n/)
  const blocos = []
  for (let i = 0; i < linhas.length; i++) {
    const abertura = /^(\s*)(`{3,}|~{3,})([^\s`]*)[ \t]*(.*)$/.exec(linhas[i])
    if (!abertura) continue
    const [, recuo, cerca, linguagem, meta] = abertura
    let fim = i + 1
    while (fim < linhas.length && !fecha(linhas[fim], cerca)) fim++
    if (fim === linhas.length)
      throw new Error(`cerca de código sem fechamento na linha ${i + 1}`)
    const marca = lerMeta(meta)
    if (marca)
      blocos.push({
        linha: i + 1,
        linguagem,
        codigo: marca.codigo,
        conteudo: linhas
          .slice(i + 1, fim)
          .map((linha) =>
            linha.startsWith(recuo)
              ? linha.slice(recuo.length)
              : linha.trimStart(),
          )
          .join('\n'),
      })
    i = fim
  }
  return blocos
}

export function listarDocs(pasta) {
  if (!existsSync(pasta)) return []
  return readdirSync(pasta, { withFileTypes: true, recursive: true })
    .filter((item) => item.isFile() && /\.mdx?$/.test(item.name))
    .map((item) => join(item.parentPath, item.name))
    .sort()
}

export function proibicoes(conteudo) {
  const achadas = COMANDOS_PROIBIDOS.filter((comando) =>
    new RegExp(`(^|[\\s;&|(\`])${comando}(?=[\\s;&|)\`]|$)`, 'm').test(
      conteudo,
    ),
  )
  if (/(^|[\s;&|(`])botai\s+serve\b/m.test(conteudo))
    achadas.push('botai serve')
  for (const [url] of conteudo.matchAll(/\bhttps?:\/\/[^\s'"`)<>]+/g))
    if (!new RegExp(`^http://${SERVIDOR_DOS_EXEMPLOS}(/|$)`).test(url))
      achadas.push(`rede externa: ${url}`)
  return achadas
}

export const precisaDoServidor = (conteudo) =>
  conteudo.includes(SERVIDOR_DOS_EXEMPLOS)

export const trocarServidor = (conteudo, porta) =>
  conteudo.replaceAll(SERVIDOR_DOS_EXEMPLOS, `127.0.0.1:${porta}`)

function ambiente(pastaBin) {
  const env = {
    ...process.env,
    PATH: `${pastaBin}${delimiter}${process.env.PATH}`,
  }
  delete env.NODE_TEST_CONTEXT
  return env
}

function executar(comando, argumentos, { cwd, env, limiteMs }) {
  return new Promise((resolver, rejeitar) => {
    const filho = spawn(comando, argumentos, {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    filho.stdout.on('data', (parte) => (stdout += parte))
    filho.stderr.on('data', (parte) => (stderr += parte))
    const relogio = setTimeout(() => {
      stderr += `\n[o bloco passou de ${limiteMs / 1000} s e foi encerrado]`
      filho.kill('SIGKILL')
    }, limiteMs)
    filho.on('error', rejeitar)
    filho.on('close', (status) => {
      clearTimeout(relogio)
      resolver({ status, stdout, stderr })
    })
  })
}

export async function prepararBotai() {
  const pasta = mkdtempSync(join(tmpdir(), 'botai-docs-'))
  const dist = join(pasta, 'dist')
  const cli = join(dist, 'bin', 'botai.js')
  const bin = join(pasta, 'bin')
  const versao = JSON.parse(
    readFileSync(join(CORE, 'package.json'), 'utf8'),
  ).version
  const prazo = Date.now() + PRAZO_DO_DIST_MS

  // Cópia, não o dist em si: no `make test`, o plugin do Playwright reconstrói o core em paralelo (rm -rf dist).
  for (;;) {
    if (existsSync(join(CORE, 'dist', 'bin', 'botai.js'))) {
      rmSync(dist, { recursive: true, force: true })
      try {
        cpSync(join(CORE, 'dist'), dist, { recursive: true })
        const r = await executar(process.execPath, [cli, '--versao'], {
          env: ambiente(''),
          limiteMs: 10_000,
        })
        if (r.status === 0 && r.stdout.trim() === versao) break
      } catch {}
    }
    if (Date.now() > prazo) {
      rmSync(pasta, { recursive: true, force: true })
      throw new Error(
        `packages/core/dist ausente ou de outra versão (esperada a ${versao}): rode "make build-core"`,
      )
    }
    await esperar(500)
  }

  mkdirSync(bin)
  writeFileSync(
    join(bin, 'botai'),
    `#!/bin/sh\nexec '${process.execPath}' '${cli}' "$@"\n`,
  )
  chmodSync(join(bin, 'botai'), 0o755)
  return {
    pasta,
    cli,
    bin,
    limpar: () => rmSync(pasta, { recursive: true, force: true }),
  }
}

export function subirServidor(botai) {
  return new Promise((resolver, rejeitar) => {
    const filho = spawn(
      process.execPath,
      [botai.cli, 'serve', '--porta', '0'],
      { env: ambiente(botai.bin), stdio: ['ignore', 'ignore', 'pipe'] },
    )
    let stderr = ''
    const relogio = setTimeout(() => {
      filho.kill('SIGKILL')
      rejeitar(new Error(`botai serve não subiu em 10 s:\n${stderr}`))
    }, 10_000)
    const encerrar = () =>
      new Promise((pronto) => {
        if (filho.exitCode !== null) return pronto()
        filho.once('exit', () => pronto())
        filho.kill('SIGTERM')
      })
    filho.on('error', rejeitar)
    filho.stderr.on('data', (parte) => {
      stderr += parte
      const ouvindo = /ouvindo em http:\/\/127\.0\.0\.1:(\d+)/.exec(stderr)
      if (ouvindo) {
        clearTimeout(relogio)
        resolver({ porta: Number(ouvindo[1]), encerrar })
      }
    })
  })
}

export function rodarBloco(conteudo, botai) {
  const cwd = mkdtempSync(join(botai.pasta, 'bloco-'))
  return executar('bash', ['-c', `set -eo pipefail\n${conteudo}`], {
    cwd,
    env: ambiente(botai.bin),
    limiteMs: LIMITE_DO_BLOCO_MS,
  }).finally(() => rmSync(cwd, { recursive: true, force: true }))
}
