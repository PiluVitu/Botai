import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import llmsTxt, { sitemapComLlms } from './llms-txt.mjs'

const siteConfig = {
  title: 'Exemplo',
  tagline: 'Resumo.',
  url: 'https://docs.exemplo.com.br',
  baseUrl: '/',
  themeConfig: { navbar: { items: [] } },
}

const versao = (nome, isLast) => ({
  versionName: nome,
  isLast,
  docs: [
    {
      id: 'intro',
      title: `Intro ${nome}`,
      description: 'A raiz.',
      source: '@site/docs/intro.md',
      permalink: '/',
      unlisted: false,
      draft: false,
    },
  ],
  sidebars: { principal: [{ type: 'doc', id: 'intro' }] },
})

function montarSite() {
  const siteDir = mkdtempSync(join(tmpdir(), 'botai-llms-'))
  mkdirSync(join(siteDir, 'docs'))
  writeFileSync(
    join(siteDir, 'docs', 'intro.md'),
    '---\ntitle: Intro\nslug: /\n---\n\nO parágrafo.\n',
  )
  mkdirSync(join(siteDir, 'build'))
  return siteDir
}

test('no postBuild, escreve o llms.txt e o llms-full.txt no outDir, da versão servida na raiz', async () => {
  const siteDir = montarSite()
  try {
    const plugin = llmsTxt({ siteDir })
    await plugin.allContentLoaded({
      allContent: {
        'docusaurus-plugin-content-docs': {
          default: {
            loadedVersions: [versao('next', false), versao('1.0', true)],
          },
        },
      },
    })
    const outDir = join(siteDir, 'build')
    await plugin.postBuild({ outDir, siteConfig })
    const llms = readFileSync(join(outDir, 'llms.txt'), 'utf8')
    assert.match(llms, /^# Exemplo\n\n> Resumo\.\n\nO parágrafo\.\n/)
    assert.match(
      llms,
      /^- \[Intro 1\.0\]\(https:\/\/docs\.exemplo\.com\.br\/\): A raiz\.$/m,
    )
    assert.match(
      readFileSync(join(outDir, 'llms-full.txt'), 'utf8'),
      /\n# Intro 1\.0\n\nURL: https:\/\/docs\.exemplo\.com\.br\/\n\n> A raiz\.\n\nO parágrafo\.\n$/,
    )
  } finally {
    rmSync(siteDir, { recursive: true, force: true })
  }
})

test('sem o conteúdo do plugin de docs, o postBuild falha (não sai build sem llms.txt)', async () => {
  const siteDir = montarSite()
  try {
    const plugin = llmsTxt({ siteDir })
    await plugin.allContentLoaded({ allContent: {} })
    await assert.rejects(
      async () =>
        plugin.postBuild({ outDir: join(siteDir, 'build'), siteConfig }),
      /nenhuma versão/,
    )
  } finally {
    rmSync(siteDir, { recursive: true, force: true })
  }
})

test('o sitemap: os itens padrão, sem mexer, e o llms.txt no fim', async () => {
  const padrao = [
    {
      url: 'https://docs.exemplo.com.br/',
      changefreq: 'weekly',
      priority: 0.5,
    },
  ]
  let recebido
  const itens = await sitemapComLlms({
    siteConfig: { ...siteConfig, baseUrl: '/docs/' },
    routes: ['rotas'],
    defaultCreateSitemapItems: async (params) => {
      recebido = params
      return padrao
    },
  })
  assert.deepEqual(recebido, {
    siteConfig: { ...siteConfig, baseUrl: '/docs/' },
    routes: ['rotas'],
  })
  assert.deepEqual(itens, [
    ...padrao,
    { url: 'https://docs.exemplo.com.br/docs/llms.txt' },
  ])
})
