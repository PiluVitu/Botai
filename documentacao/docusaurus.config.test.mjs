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

test('rodapé: "Powered by PiluTech" com link para pilutech.com.br', () => {
  assert.match(
    config.themeConfig.footer.copyright,
    /^<a href="https:\/\/pilutech\.com\.br">Powered by PiluTech<\/a>$/,
  )
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
