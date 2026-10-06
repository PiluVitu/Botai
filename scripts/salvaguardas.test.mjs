import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const ler = (arquivo) => readFileSync(join(RAIZ, arquivo), 'utf8')
const workspace = ler('pnpm-workspace.yaml')
const valor = (chave) =>
  new RegExp(`^${chave}:[ \\t]*(\\S+)`, 'm').exec(workspace)?.[1]

// Spec §5.3: uma conta do npm invadida não empurra versão nova para cá no mesmo dia.
test('versão publicada há menos de 24 h não instala, inclusive @pilutech/* e @piluvitu/*', () => {
  assert.equal(valor('minimumReleaseAge'), '1440')
  assert.doesNotMatch(workspace, /^minimumReleaseAgeExclude:/m)
})

test('pacote que perde a proveniência, ou dependência transitiva de git/tarball, falha o install', () => {
  assert.equal(valor('trustPolicy'), 'no-downgrade')
  assert.equal(valor('blockExoticSubdeps'), 'true')
})

test('script de instalação só roda para quem está no allowBuilds', () => {
  assert.match(workspace, /^allowBuilds:$/m)
  assert.doesNotMatch(workspace, /dangerouslyAllowAllBuilds/)
})

// O pnpm do repo é o mesmo que o revisor da AMO instala pelo corepack.
test('o pnpm é o 11.1.1 fixado no packageManager', () => {
  assert.equal(JSON.parse(ler('package.json')).packageManager, 'pnpm@11.1.1')
})

test('credencial não entra no repo: .env* ignorado, só o .env.example passa', () => {
  const linhas = ler('.gitignore').split('\n')
  assert.ok(linhas.includes('.env*'))
  assert.ok(linhas.includes('!.env.example'))
})
