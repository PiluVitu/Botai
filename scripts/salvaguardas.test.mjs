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

// O Docker Hub limita o download anônimo por IP, e os runners do GitHub dividem IP com milhares
// de repositórios: em 2026-10-09 o limite derrubou a imagem do core e o actionlint em 4 rodadas
// seguidas. Os jobs do repositório não dependem mais do Docker Hub para passar.
const jobs = (texto) =>
  texto
    .split(/^jobs:\n/m)[1]
    .split(/^(?=  [\w-]+:\s*$)/m)
    .filter((bloco) => /^  [\w-]+:/.test(bloco))

test('o actionlint vem do release do GitHub, fixado por versão e SHA-256, e não da imagem do Docker Hub', () => {
  const script = ler('scripts/actionlint.sh')
  assert.match(script, /^versao=1\.7\.12$/m)
  assert.match(script, /^sha256=[0-9a-f]{64}$/m)
  assert.match(script, /sha256sum -c/)
  const rodam = workflows().filter((arquivo) =>
    workflow(arquivo).includes('actionlint'),
  )
  for (const arquivo of [
    'ci.yml',
    'botai-release.yml',
    'core-distribuicao.yml',
    'publicar-playwright.yml',
  ])
    assert.ok(rodam.includes(arquivo), arquivo)
  for (const arquivo of rodam) {
    assert.doesNotMatch(workflow(arquivo), /rhysd\/actionlint/, arquivo)
    assert.match(workflow(arquivo), /bash scripts\/actionlint\.sh/, arquivo)
  }
})

test('todo job que constrói imagem passa antes pelo espelho do Docker Hub (mirror.gcr.io)', () => {
  let constroem = 0
  for (const arquivo of workflows())
    for (const job of jobs(workflow(arquivo))) {
      const primeiro = job.search(
        /run: docker build|uses: docker\/setup-(qemu|buildx)-action/,
      )
      if (primeiro < 0) continue
      constroem++
      const nome = `${arquivo}: ${job.split('\n')[0].trim()}`
      const espelho = job.indexOf('bash scripts/espelho-docker-hub.sh')
      assert.ok(espelho >= 0 && espelho < primeiro, nome)
      if (job.includes('setup-buildx-action'))
        assert.match(
          job,
          /buildkitd-config-inline: \|\n\s+\[registry\."docker\.io"\]\n\s+mirrors = \["mirror\.gcr\.io"\]/,
          nome,
        )
    }
  assert.ok(constroem >= 2, 'a imagem do CI e a do release do core')
  assert.match(
    ler('scripts/espelho-docker-hub.sh'),
    /https:\/\/mirror\.gcr\.io/,
  )
})

// A imagem ghcr.io/piluvitu/botai é usada por outros projetos: a base fica numa linha LTS do Node
// (par). O Dependabot propõe toda major, inclusive a Current e as ímpares, que nunca viram LTS
// (o PR #1 propôs a 26.10.0, Current, em 2026-10-06); a troca de major é manual.
test('a base da imagem do core é uma linha LTS do Node, e o Dependabot não propõe major dela', () => {
  const major = Number(
    /^FROM node:(\d+)\./m.exec(ler('packages/core/Dockerfile'))?.[1],
  )
  assert.equal(major % 2, 0, `node ${major}`)
  const docker = ler('.github/dependabot.yml').split(
    /^  - package-ecosystem: 'docker'$/m,
  )[1]
  assert.match(
    docker,
    /ignore:\n\s+- dependency-name: 'node'\n\s+update-types:\n\s+- 'version-update:semver-major'/,
  )
})

// O ruleset da main mora no GitHub (Settings → Rules → Rulesets) e é aplicado a partir deste
// JSON (ver "Proteção da main" no CLAUDE.md). Check exigido que nenhum job produz fica
// "Expected" para sempre e trava todo PR: renomear um job do CI pede o JSON junto.
test('o ruleset da main exige PR com squash, histórico linear e os checks que rodam em todo PR', () => {
  const ruleset = JSON.parse(ler('.github/rulesets/main.json'))
  assert.equal(ruleset.target, 'branch')
  assert.equal(ruleset.enforcement, 'active')
  assert.deepEqual(ruleset.conditions.ref_name.include, ['~DEFAULT_BRANCH'])
  const regra = (tipo) => ruleset.rules.find((r) => r.type === tipo)
  for (const tipo of [
    'deletion',
    'non_fast_forward',
    'required_linear_history',
  ])
    assert.ok(regra(tipo), tipo)
  assert.deepEqual(regra('pull_request').parameters.allowed_merge_methods, [
    'squash',
  ])
  assert.ok(
    ruleset.bypass_actors.every((ator) => ator.bypass_mode === 'pull_request'),
    'ninguém pula o ruleset num push direto',
  )

  const exigidos = regra(
    'required_status_checks',
  ).parameters.required_status_checks.map((c) => c.context)
  const nomesDosJobs = (arquivo) => {
    const texto = workflow(arquivo)
    assert.match(texto, /^  pull_request:\n    branches: \[main\]$/m, arquivo)
    assert.doesNotMatch(texto, /^    paths(-ignore)?:/m, arquivo)
    assert.doesNotMatch(texto, /^    if:/m, arquivo)
    return [...texto.matchAll(/^    name: (.+)$/gm)].map((m) => m[1])
  }
  const doCi = nomesDosJobs('ci.yml')
  const doTrivy = nomesDosJobs('trivy.yml')
  for (const nome of doCi) assert.ok(exigidos.includes(nome), nome)
  assert.ok(exigidos.includes('Segredos (falha o PR)'))
  for (const nome of exigidos)
    assert.ok([...doCi, ...doTrivy].includes(nome), `sem job: ${nome}`)
})
