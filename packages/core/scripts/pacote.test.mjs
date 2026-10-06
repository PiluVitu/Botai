import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { importsQueNaoResolvem } from './extensoes.mjs'

const PACOTE = join(dirname(fileURLToPath(import.meta.url)), '..')
const FONTE = JSON.parse(readFileSync(join(PACOTE, 'package.json'), 'utf8'))
const PUBLICADOS = FONTE.publishConfig.exports
// Arquivo do tarball que nenhum subpath aponta (módulo interno, bin): as fases 1 a 3 acrescentam aqui.
const EXTRAS = [
  'dist/bin/botai.d.ts',
  'dist/bin/botai.js',
  'dist/bin/serve.d.ts',
  'dist/bin/serve.js',
  'dist/cli/ajuda.d.ts',
  'dist/cli/ajuda.js',
  'dist/cli/argumentos.d.ts',
  'dist/cli/argumentos.js',
  'dist/cli/avulsos.d.ts',
  'dist/cli/avulsos.js',
  'dist/cli/executar.d.ts',
  'dist/cli/executar.js',
  'dist/envelope.d.ts',
  'dist/envelope.js',
  'dist/gerar.d.ts',
  'dist/gerar.js',
  'dist/hoje.d.ts',
  'dist/hoje.js',
  'dist/index.d.ts',
  'dist/index.js',
  'dist/lote.d.ts',
  'dist/lote.js',
  'dist/opcoes.d.ts',
  'dist/opcoes.js',
  'dist/semente.d.ts',
  'dist/semente.js',
  'dist/servidor/consulta.d.ts',
  'dist/servidor/consulta.js',
  'dist/servidor/rotas.d.ts',
  'dist/servidor/rotas.js',
  'dist/versao.d.ts',
  'dist/versao.js',
  'esquema/envelope-v1.schema.json',
]
const alvos = (destino) =>
  typeof destino === 'string' ? [destino] : Object.values(destino)
const ESPERADOS = [
  ...new Set([
    'LICENSE',
    'README.md',
    'package.json',
    ...EXTRAS,
    ...Object.values(PUBLICADOS)
      .flatMap(alvos)
      .map((caminho) => caminho.replace(/^\.\//, '')),
  ]),
].sort()

// O pnpm pack aplica o publishConfig.exports (o npm pack não aplicaria) e roda o prepack (o build).
const pnpm = (...args) =>
  JSON.parse(execFileSync('pnpm', args, { cwd: PACOTE, encoding: 'utf8' }))

let pasta
let publicado

before(() => {
  pasta = mkdtempSync(join(tmpdir(), 'botai-core-pacote-'))
  const { filename } = pnpm('pack', '--json', '--pack-destination', pasta)
  execFileSync('tar', ['-xzf', filename, '-C', pasta])
  publicado = JSON.parse(
    readFileSync(join(pasta, 'package', 'package.json'), 'utf8'),
  )
})

after(() => rmSync(pasta, { recursive: true, force: true }))

test('o pnpm pack --dry-run leva só o build, o esquema, a licença e o README', () => {
  const { files } = pnpm('pack', '--dry-run', '--json')
  assert.deepEqual(files.map((arquivo) => arquivo.path).sort(), ESPERADOS)
})

// Subpath só num dos manifestos: o workspace e o npm enxergariam pacotes diferentes.
test('o manifesto publicado aponta cada subpath para o build e não tem dependência de runtime', () => {
  assert.equal(publicado.license, 'MIT')
  assert.deepEqual(publicado.publishConfig, { access: 'public' })
  assert.equal(
    publicado.repository.url,
    'git+https://github.com/PiluVitu/Botai.git',
  )
  assert.equal(publicado.dependencies, undefined)
  assert.deepEqual(
    Object.keys(FONTE.exports).sort(),
    Object.keys(PUBLICADOS).sort(),
  )
  assert.deepEqual(publicado.exports, PUBLICADOS)
  for (const [subpath, fonte] of Object.entries(FONTE.exports))
    assert.deepEqual(
      PUBLICADOS[subpath],
      /^\.\/src\/.+\.ts$/.test(fonte)
        ? {
            types: fonte.replace('./src/', './dist/').replace(/\.ts$/, '.d.ts'),
            default: fonte.replace('./src/', './dist/').replace(/\.ts$/, '.js'),
          }
        : fonte,
      subpath,
    )
})

test('todo import relativo do build aponta para um arquivo do pacote', () => {
  assert.deepEqual(importsQueNaoResolvem(join(pasta, 'package', 'dist')), [])
})

test('cada subpath carrega no Node como ESM', async () => {
  for (const destino of Object.values(publicado.exports))
    if (typeof destino !== 'string')
      await import(pathToFileURL(join(pasta, 'package', destino.default)).href)
})

// A pessoa dourada de src/pessoa.test.ts: o build não pode mudar a pessoa de uma semente.
test('o build gera a mesma pessoa dourada que o código-fonte', async () => {
  const { sfc32 } = await import(
    pathToFileURL(join(PACOTE, 'dist', 'prng.js')).href
  )
  const { montarPessoa } = await import(
    pathToFileURL(join(PACOTE, 'dist', 'pessoa.js')).href
  )
  const pessoa = montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01')
  assert.equal(pessoa.cpf, '647.692.234-39')
  assert.equal(
    pessoa.email.endereco,
    'vinicius-costa-6607@tuamaeaquelaursa.com',
  )
})
