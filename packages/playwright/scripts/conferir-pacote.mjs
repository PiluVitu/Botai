import { execFileSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PACOTE = fileURLToPath(new URL('..', import.meta.url))
const ESPERADOS = [
  'LICENSE',
  'README.md',
  'dist/fixture.d.ts',
  'dist/fixture.js',
  'dist/index.d.ts',
  'dist/index.js',
  'dist/preencher.d.ts',
  'dist/preencher.js',
  'dist/resultado.d.ts',
  'dist/resultado.js',
  'dist/semente.d.ts',
  'dist/semente.js',
  'package.json',
]

const indice = process.argv.indexOf('--destino')
const manter = indice !== -1
const destino = manter
  ? path.resolve(process.argv[indice + 1])
  : mkdtempSync(path.join(tmpdir(), 'botai-playwright-'))
mkdirSync(destino, { recursive: true })

try {
  execFileSync('pnpm', ['pack', '--pack-destination', destino], {
    cwd: PACOTE,
    stdio: ['ignore', 'ignore', 'inherit'],
  })
  const tarballs = readdirSync(destino).filter((nome) => nome.endsWith('.tgz'))
  if (tarballs.length !== 1)
    throw new Error(`esperado 1 .tgz em ${destino}, achei ${tarballs.length}`)
  const tarball = path.join(destino, tarballs[0])
  const arquivos = execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .map((linha) => linha.replace(/^package\//, ''))
    .sort()
  const faltando = ESPERADOS.filter((arquivo) => !arquivos.includes(arquivo))
  const sobrando = arquivos.filter((arquivo) => !ESPERADOS.includes(arquivo))
  if (faltando.length > 0 || sobrando.length > 0) {
    console.error(`faltando: ${faltando.join(', ') || '-'}`)
    console.error(`sobrando: ${sobrando.join(', ') || '-'}`)
    process.exitCode = 1
  }
  const manifesto = JSON.parse(
    execFileSync('tar', ['-xzOf', tarball, 'package/package.json'], {
      encoding: 'utf8',
    }),
  )
  const versaoDoCore = JSON.parse(
    readFileSync(path.join(PACOTE, '../core/package.json'), 'utf8'),
  ).version
  const dependencia = manifesto.dependencies?.['@pilutech/botai-core']
  if (dependencia !== versaoDoCore) {
    console.error(
      `@pilutech/botai-core saiu como "${dependencia}" no pacote; esperado "${versaoDoCore}"`,
    )
    process.exitCode = 1
  }
  if (process.exitCode !== 1)
    console.log(
      `pacote confere: ${tarballs[0]}, ${arquivos.length} arquivos, core ${versaoDoCore}`,
    )
} finally {
  if (!manter) rmSync(destino, { recursive: true, force: true })
}
