import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const AQUI = dirname(fileURLToPath(import.meta.url))
const { ignoreCommand } = JSON.parse(
  readFileSync(join(AQUI, 'vercel.json'), 'utf8'),
)
const [comando, caminhos] = ignoreCommand.split(' -- ')

// exit 0 cancela o build; o git diff --quiet sai 0 quando nada mudou.
test('cancela o build só quando nada que a documentação usa mudou', () => {
  assert.equal(comando, 'git diff --quiet HEAD^ HEAD')
})

// O core muda as versões e as saídas que as páginas citam; o resto é o install da raiz.
test('vigia a documentação, o core e os arquivos de install da raiz', () => {
  assert.deepEqual(caminhos.split(' '), [
    '.',
    '../packages/core',
    '../pnpm-lock.yaml',
    '../pnpm-workspace.yaml',
    '../package.json',
    '../.npmrc',
  ])
})

test('todo caminho vigiado existe (um rename deixaria o build preso no passado)', () => {
  for (const caminho of caminhos.split(' '))
    assert.deepEqual(
      [caminho, existsSync(join(AQUI, caminho))],
      [caminho, true],
    )
})
