import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT = join(
  dirname(fileURLToPath(import.meta.url)),
  'check-tailwind-source.mjs',
)
// Montado em pedaços: o literal inteiro num arquivo varrido pelo Tailwind geraria a classe sozinho.
const SENTINELA = ['.ui', 'sentinela', 'nao', 'remover'].join('-')

function gate(arquivos) {
  const pasta = mkdtempSync(join(tmpdir(), 'gate-'))
  try {
    for (const [caminho, css] of Object.entries(arquivos)) {
      mkdirSync(dirname(join(pasta, caminho)), { recursive: true })
      writeFileSync(join(pasta, caminho), css)
    }
    return spawnSync(process.execPath, [SCRIPT, pasta], { encoding: 'utf8' })
  } finally {
    rmSync(pasta, { recursive: true, force: true })
  }
}

test('passa quando o CSS emitido tem a sentinela', () => {
  assert.equal(gate({ 'static/a.css': `${SENTINELA}{content:'x'}` }).status, 0)
})

test('reprova sem a sentinela e aponta o @piluvitu/ui do node_modules', () => {
  const { status, stderr } = gate({ 'static/a.css': '.outra{}' })
  assert.equal(status, 1)
  assert.match(stderr, /node_modules\/@piluvitu\/ui\/dist/)
})

// O `next dev` deixa CSS de uma sessão antiga em .next/dev: contá-lo aprovaria @source quebrado.
test('ignora o CSS de dev/, cache/ e node_modules/ abaixo da pasta pedida', () => {
  const { status } = gate({
    'dev/a.css': `${SENTINELA}{}`,
    'cache/b.css': `${SENTINELA}{}`,
    'node_modules/c.css': `${SENTINELA}{}`,
    'static/d.css': '.outra{}',
  })
  assert.equal(status, 1)
})

test('pasta que não existe reprova', () => {
  const { status, stderr } = spawnSync(
    process.execPath,
    [SCRIPT, join(tmpdir(), 'gate-que-nao-existe')],
    { encoding: 'utf8' },
  )
  assert.equal(status, 1)
  assert.match(stderr, /Diretório não existe/)
})
