import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
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

const WORKFLOWS = join(RAIZ, '.github', 'workflows')
const workflows = () =>
  readdirSync(WORKFLOWS).filter((arquivo) => arquivo.endsWith('.yml'))
const workflow = (arquivo) => ler(join('.github', 'workflows', arquivo))

test('os workflows da fase 0 existem, e toda action de todo workflow está fixada por SHA', () => {
  for (const base of [
    'botai-e2e.yml',
    'botai-release.yml',
    'ci.yml',
    'publicar-core.yml',
    'trivy.yml',
  ])
    assert.ok(workflows().includes(base), base)
  for (const arquivo of workflows())
    for (const linha of workflow(arquivo)
      .split('\n')
      .filter((l) => /^\s*(-\s*)?uses:/.test(l)))
      assert.match(
        linha,
        /uses: \S+@[0-9a-f]{40} # \S+$/,
        `${arquivo}: ${linha.trim()}`,
      )
})

test('o CI barra lockfile solto, cópia duplicada e advisory high', () => {
  const ci = workflow('ci.yml')
  for (const comando of [
    'pnpm install --frozen-lockfile',
    'pnpm dedupe --check',
    'pnpm audit --audit-level high',
  ])
    assert.ok(ci.includes(comando), comando)
})

test('Dependabot com cooldown em todo ecossistema e sem merge automático', () => {
  const dependabot = ler('.github/dependabot.yml')
  const ecossistemas =
    dependabot.match(/^  - package-ecosystem:/gm)?.length ?? 0
  assert.ok(ecossistemas >= 2, 'npm e github-actions')
  assert.equal(dependabot.match(/^    cooldown:$/gm)?.length, ecossistemas)
  assert.doesNotMatch(dependabot, /auto-?merge/i)
})

// Spec §5.4: publicação só por tag, atrás de aprovação, com proveniência; id-token só onde publica.
test('todo workflow que publica no npm usa o environment npm, com proveniência', () => {
  const publicam = workflows().filter((arquivo) =>
    /npm publish/.test(workflow(arquivo)),
  )
  assert.ok(publicam.includes('publicar-core.yml'))
  assert.ok(publicam.includes('publicar-playwright.yml'))
  for (const arquivo of publicam) {
    const texto = workflow(arquivo)
    assert.match(texto, /^    environment: npm$/m, arquivo)
    assert.equal(texto.match(/id-token: write/g)?.length, 1, arquivo)
    assert.match(texto, /npm publish \S+ --access public --provenance/, arquivo)
  }
})
