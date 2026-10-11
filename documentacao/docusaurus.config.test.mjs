import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import config from './docusaurus.config.mjs'

const AQUI = dirname(fileURLToPath(import.meta.url))
const [, classico] = config.presets.find(
  ([nome]) => nome === 'classic' || nome === '@docusaurus/preset-classic',
)

test('só docs, na raiz de docs.botai.pilutech.com.br, em pt-BR', () => {
  assert.equal(config.title, 'Botaí — documentação')
  assert.equal(config.url, 'https://docs.botai.pilutech.com.br')
  assert.equal(config.baseUrl, '/')
  assert.deepEqual(config.i18n, {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  })
  assert.equal(classico.docs.routeBasePath, '/')
  assert.equal(classico.blog, false)
  assert.equal(classico.pages, false)
})

test('o sitemap fica ligado e o robots.txt aponta para ele', () => {
  assert.notEqual(classico.sitemap, false)
  assert.match(
    readFileSync(join(AQUI, 'static/robots.txt'), 'utf8'),
    /^Sitemap: https:\/\/docs\.botai\.pilutech\.com\.br\/sitemap\.xml$/m,
  )
})

test('link, âncora e link de markdown quebrados derrubam o build', () => {
  assert.equal(config.onBrokenLinks, 'throw')
  assert.equal(config.onBrokenAnchors, 'throw')
  assert.equal(config.markdown.hooks.onBrokenMarkdownLinks, 'throw')
  assert.equal(config.onBrokenMarkdownLinks, undefined)
})

test('o logo e o favicon são o ícone do Botaí das lojas (cópia exata)', () => {
  const icone = readFileSync(
    join(AQUI, '../extensao/loja/icone-1i.svg'),
    'utf8',
  )
  const { logo } = config.themeConfig.navbar
  assert.equal(readFileSync(join(AQUI, 'static', logo.src), 'utf8'), icone)
  assert.equal(
    readFileSync(join(AQUI, 'static', config.favicon), 'utf8'),
    icone,
  )
  assert.equal(logo.alt, 'Botaí')
})

test('navbar com Site, GitHub e npm', () => {
  assert.deepEqual(
    config.themeConfig.navbar.items.map(({ label, href }) => [label, href]),
    [
      ['Site', 'https://botai.pilutech.com.br'],
      ['GitHub', 'https://github.com/PiluVitu/Botai'],
      ['npm', 'https://www.npmjs.com/package/@pilutech/botai-core'],
    ],
  )
})

test('rodapé: "Powered by PiluTech" e a política de privacidade, que cobre a documentação', () => {
  assert.match(
    config.themeConfig.footer.copyright,
    /^<a href="https:\/\/pilutech\.com\.br">Powered by PiluTech<\/a>$/,
  )
  assert.deepEqual(config.themeConfig.footer.links, [
    {
      label: 'Política de privacidade',
      href: 'https://botai.pilutech.com.br/privacidade',
    },
  ])
})

// Só a produção da Vercel mede: o preview gastaria as cotas grátis da conta (Web Analytics e
// Speed Insights, divididas entre os projetos), e o build local não tem os scripts. Os dois
// são da própria Vercel, servidos pelo domínio da documentação: não é script de terceiro.
test('o Vercel Web Analytics e o Speed Insights entram só no build de produção da Vercel', async () => {
  assert.deepEqual(config.clientModules ?? [], [])
  process.env.VERCEL_ENV = 'production'
  try {
    const { default: producao } =
      await import('./docusaurus.config.mjs?producao')
    assert.deepEqual(producao.clientModules, ['./src/medicao-da-vercel.js'])
  } finally {
    delete process.env.VERCEL_ENV
  }
  const modulo = readFileSync(join(AQUI, 'src/medicao-da-vercel.js'), 'utf8')
  assert.match(modulo, /^import \{ inject \} from '@vercel\/analytics'$/m)
  assert.match(
    modulo,
    /^import \{ injectSpeedInsights \} from '@vercel\/speed-insights'$/m,
  )
  assert.match(modulo, /^inject\(\)$/m)
  assert.match(modulo, /^injectSpeedInsights\(\)$/m)
})

test('sem busca de serviço externo e sem script de terceiros', () => {
  assert.equal(config.themeConfig.algolia, undefined)
  assert.equal(classico.gtag, undefined)
  assert.equal(classico.googleTagManager, undefined)
  assert.deepEqual(config.scripts ?? [], [])
  assert.deepEqual(config.stylesheets ?? [], [])
})

test('tema claro e escuro, seguindo o sistema', () => {
  assert.equal(config.themeConfig.colorMode.respectPrefersColorScheme, true)
  assert.equal(config.themeConfig.colorMode.disableSwitch, false)
})

test('o bash dos exemplos tem realce (o Prism do Docusaurus não traz)', () => {
  assert.ok(config.themeConfig.prism.additionalLanguages.includes('bash'))
})
