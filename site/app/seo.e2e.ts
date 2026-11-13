import { expect, test, type Page } from '@playwright/test'
import { lojasPublicadas } from '../lib/pilulabs'
import type { AxeResults, RunOptions } from 'axe-core'
import { lerUrlsDasLojas } from '../lib/lojas'
import { faviconDoBotai } from '../lib/favicon'
import { DESCRICAO_DA_HOME, PAGINAS_DO_SITE } from '../lib/seo'
import { REPOSITORIO, URL_DA_DOCUMENTACAO } from '../lib/conteudo'
import { SITE_DE_PRODUCAO } from '../lib/site'

const ROTAS = PAGINAS_DO_SITE.map((pagina) => ({
  ...pagina,
  imagem: `${pagina.caminho.replace(/\/$/, '')}/opengraph-image`,
}))
const TEXTO_UTF8 = 'text/plain; charset=utf-8'
const ITEM_DO_LLMS = /^- \[[^\]]+\]\((https:\/\/|mailto:)[^)]+\): .+$/
const LINK_MARKDOWN = /\[[^\]]*\]\(([^)\s]+)\)/g
const URL_EM_LINHA = /^(?:URL|Índice das páginas): (\S+)$/gm

// O que o llms-full.txt deixa de fora de propósito, com o motivo (o resto do main tem de estar nele):
const FORA_DO_LLMS_FULL = [
  // o que nem o leitor de tela lê;
  '[aria-hidden="true"]',
  '[hidden]',
  // controles e mídia: o nome deles é aria-label ou alt, não texto da página;
  'button',
  'svg',
  'img',
  'input',
  'select',
  'textarea',
  'script',
  'style',
  'noscript',
  // da figure, tudo menos a legenda: as ilustrações do hero (o terminal e o formulário, com a tecla
  // da TeclaLocal, que muda com o sistema de quem visita) e as capturas da seção Extensão.
  'figure > :not(figcaption)',
]
// Além dos blocos, caption, pre, code e span: o comando do hero (div > code), a legenda da tabela de
// atalhos e os textos soltos em span (o selo "semente 42", o número de cada seção) não ficam sem conferir.
const TEXTO_DA_PAGINA =
  'h1, h2, h3, h4, h5, h6, p, li, th, td, dt, dd, figcaption, caption, pre, code, span'

function semMarcacao(markdown: string): string {
  return markdown
    .replace(/^[ \t]*`{3,}[^\n]*$/gm, '')
    .replace(LINK_MARKDOWN, (link) => link.slice(1, link.indexOf('](')))
    .replace(/^[ \t]*(?:(?:#{1,6}|>|[-*+]|\d+[.)])[ \t]+)+/gm, '')
    .replace(/\\\|/g, '|')
    .replace(/[*`]/g, '')
    .replace(/\s+/g, ' ')
}

const naProducao = (caminho: string) =>
  new URL(caminho, `${SITE_DE_PRODUCAO}/`).href

async function lerJsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const textos = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
  expect(textos.length).toBeGreaterThan(0)
  return textos.map((texto) => JSON.parse(texto) as Record<string, unknown>)
}

// O metadataBase é a produção; o servidor do teste é a 3020: só o caminho serve para pedir.
async function caminhoDaMeta(page: Page, seletor: string): Promise<string> {
  const conteudo = await page.locator(seletor).first().getAttribute('content')
  expect(conteudo).toBeTruthy()
  const url = new URL(conteudo as string)
  return url.pathname + url.search
}

async function tamanhoDoPng(page: Page, caminho: string) {
  const resposta = await page.request.get(caminho)
  expect(resposta.status()).toBe(200)
  expect(resposta.headers()['content-type']).toContain('image/png')
  const corpo = await resposta.body()
  return { largura: corpo.readUInt32BE(16), altura: corpo.readUInt32BE(20) }
}

for (const rota of ROTAS) {
  test.describe(`SEO de ${rota.caminho}`, () => {
    test('title, description, canonical, lang e indexável', async ({
      page,
    }) => {
      await page.goto(rota.caminho)
      await expect(page).toHaveTitle(rota.titulo)
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        rota.descricao,
      )
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute('href')
      expect(new URL(canonical as string).href).toBe(naProducao(rota.caminho))
      await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
      await expect(
        page.locator('meta[name="robots"][content*="noindex"]'),
      ).toHaveCount(0)
    })

    test('Open Graph e Twitter, com a imagem 1200×630 do próprio segmento', async ({
      page,
    }) => {
      await page.goto(rota.caminho)
      const og = (propriedade: string) =>
        page.locator(`meta[property="og:${propriedade}"]`)
      await expect(og('type')).toHaveAttribute('content', 'website')
      await expect(og('locale')).toHaveAttribute('content', 'pt_BR')
      await expect(og('site_name')).toHaveAttribute('content', 'Botaí')
      await expect(og('title')).toHaveAttribute('content', rota.titulo)
      await expect(og('description')).toHaveAttribute('content', rota.descricao)
      const urlOg = await og('url').getAttribute('content')
      expect(new URL(urlOg as string).href).toBe(naProducao(rota.caminho))
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        'content',
        'summary_large_image',
      )
      const imagemOg = await caminhoDaMeta(page, 'meta[property="og:image"]')
      expect(imagemOg.startsWith(rota.imagem)).toBe(true)
      expect(await tamanhoDoPng(page, imagemOg)).toEqual({
        largura: 1200,
        altura: 630,
      })
      const imagemTwitter = await caminhoDaMeta(
        page,
        'meta[name="twitter:image"]',
      )
      expect(await tamanhoDoPng(page, imagemTwitter)).toEqual({
        largura: 1200,
        altura: 630,
      })
    })

    test('um h1 só e títulos sem pular nível', async ({ page }) => {
      await page.goto(rota.caminho)
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
      const niveis = await page
        .locator('h1, h2, h3, h4, h5, h6')
        .evaluateAll((titulos) => titulos.map((t) => Number(t.tagName[1])))
      expect(niveis[0]).toBe(1)
      for (let i = 1; i < niveis.length; i++)
        expect(niveis[i] - niveis[i - 1]).toBeLessThanOrEqual(1)
    })

    test('toda imagem tem alt, e as capturas um alt descritivo', async ({
      page,
    }) => {
      await page.goto(rota.caminho)
      await expect(page.locator('img:not([alt])')).toHaveCount(0)
      const alts = await page
        .locator('img[src*="capturas"]')
        .evaluateAll((imagens) =>
          imagens.map((i) => i.getAttribute('alt') ?? ''),
        )
      for (const alt of alts) expect(alt.length).toBeGreaterThan(40)
    })

    // A meta da spec é o Lighthouse mobile: a 320 px a tabela de atalhos rola dentro da moldura, e só
    // ali o axe vê o scrollable-region-focusable.
    for (const tema of ['light', 'dark'] as const)
      for (const largura of [1280, 320]) {
        test(`acessibilidade (axe, WCAG 2.1 A e AA), tema ${tema}, ${largura} px`, async ({
          page,
        }) => {
          await page.setViewportSize({ width: largura, height: 800 })
          await page.emulateMedia({ colorScheme: tema })
          await page.goto(rota.caminho)
          await page.addScriptTag({
            path: require.resolve('axe-core/axe.min.js'),
          })
          const violacoes = await page.evaluate(async () => {
            const { axe } = window as unknown as {
              axe: {
                run: (alvo: Document, opcoes: RunOptions) => Promise<AxeResults>
              }
            }
            const { violations } = await axe.run(document, {
              runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
              },
            })
            return violations
              .filter((v) => v.impact === 'serious' || v.impact === 'critical')
              .map(
                (v) =>
                  `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
              )
          })
          expect(violacoes).toEqual([])
        })
      }
  })
}

test('JSON-LD de /: SoftwareApplication gratuito, sem nota, com as lojas do lojas.json', async ({
  page,
}) => {
  await page.goto('/')
  const [dados] = await lerJsonLd(page)
  const grafo = dados['@graph'] as Record<string, unknown>[]
  expect(grafo.map((n) => n['@type'])).toEqual([
    'Organization',
    'WebSite',
    'SoftwareApplication',
  ])
  const aplicacao = grafo[2]
  expect(aplicacao).toMatchObject({
    name: 'Botaí',
    applicationCategory: 'BrowserApplication',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'BRL' },
  })
  expect(aplicacao).not.toHaveProperty('aggregateRating')
  const lojas = lojasPublicadas(lerUrlsDasLojas()).map((l) => l.url)
  if (lojas.length > 0) expect(aplicacao.installUrl).toEqual(lojas)
  else expect(aplicacao).not.toHaveProperty('installUrl')
  expect(aplicacao.sameAs).toEqual([REPOSITORIO, ...lojas])
  expect(grafo[1]).toMatchObject({
    name: 'Botaí',
    alternateName: ['Botai', 'Bota Aí', 'Bota ai'],
  })
  expect(grafo[1].keywords).toContain('gerador de pessoa')
})

test('JSON-LD de /privacidade: a trilha Botaí › Política', async ({ page }) => {
  await page.goto('/privacidade')
  const [dados] = await lerJsonLd(page)
  expect(dados['@type']).toBe('BreadcrumbList')
})

test('JSON-LD de /termos: a trilha Botaí › Termos de uso', async ({ page }) => {
  await page.goto('/termos')
  const [dados] = await lerJsonLd(page)
  expect(dados['@type']).toBe('BreadcrumbList')
  const itens = dados.itemListElement as { name: string }[]
  expect(itens.map((i) => i.name)).toEqual(['Botaí', 'Termos de uso'])
})

test('robots.txt: texto, libera tudo, aponta o sitemap e cita o llms.txt e o llms-full.txt', async ({
  request,
}) => {
  const resposta = await request.get('/robots.txt')
  expect(resposta.status()).toBe(200)
  expect(resposta.headers()['content-type']).toBe(TEXTO_UTF8)
  const texto = await resposta.text()
  expect(texto).toContain('User-agent: *\nAllow: /\n')
  expect(texto).toContain(`Sitemap: ${SITE_DE_PRODUCAO}/sitemap.xml\n`)
  expect(texto).toContain(
    `# llms.txt: ${SITE_DE_PRODUCAO}/llms.txt\n# llms-full.txt: ${SITE_DE_PRODUCAO}/llms-full.txt\n`,
  )
})

test('sitemap.xml: XML com as três rotas, o llms.txt e o llms-full.txt, e cada um responde', async ({
  request,
}) => {
  const resposta = await request.get('/sitemap.xml')
  expect(resposta.status()).toBe(200)
  expect(resposta.headers()['content-type']).toContain('xml')
  const xml = await resposta.text()
  expect(xml).toContain('<urlset')
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc)
  expect(locs).toEqual([
    `${SITE_DE_PRODUCAO}/`,
    `${SITE_DE_PRODUCAO}/privacidade`,
    `${SITE_DE_PRODUCAO}/termos`,
    `${SITE_DE_PRODUCAO}/llms.txt`,
    `${SITE_DE_PRODUCAO}/llms-full.txt`,
  ])
  for (const loc of locs)
    expect((await request.get(new URL(loc).pathname)).status(), loc).toBe(200)
})

test('llms.txt: texto UTF-8 no formato do llmstxt.org', async ({ request }) => {
  const resposta = await request.get('/llms.txt')
  expect(resposta.status()).toBe(200)
  expect(resposta.headers()['content-type']).toBe(TEXTO_UTF8)
  const texto = await resposta.text()
  expect(texto.startsWith(`# Botaí\n\n> ${DESCRICAO_DA_HOME}\n\n`)).toBe(true)
  expect(texto).toMatch(/[^\n]\n$/)
  const itens = texto.split('\n').filter((linha) => linha.startsWith('- '))
  expect(itens.length).toBeGreaterThan(0)
  for (const item of itens) expect(item).toMatch(ITEM_DO_LLMS)
  expect(itens).toContain(
    `- [llms-full.txt do site](${SITE_DE_PRODUCAO}/llms-full.txt): O conteúdo destas três páginas em Markdown, num arquivo só.`,
  )
})

test('llms-full.txt: texto UTF-8, o cabeçalho e as três páginas, na ordem, com a URL e a descrição', async ({
  request,
}) => {
  const resposta = await request.get('/llms-full.txt')
  expect(resposta.status()).toBe(200)
  expect(resposta.headers()['content-type']).toBe(TEXTO_UTF8)
  const texto = await resposta.text()
  expect(
    texto.startsWith(
      `# Botaí\n\n> ${DESCRICAO_DA_HOME}\n\nÍndice das páginas: ${SITE_DE_PRODUCAO}/llms.txt\n\n`,
    ),
  ).toBe(true)
  expect(texto.match(/^# .+\n\nURL: .+\n\n> .+$/gm)).toEqual(
    PAGINAS_DO_SITE.map(
      ({ caminho, titulo, descricao }) =>
        `# ${titulo}\n\nURL: ${naProducao(caminho)}\n\n> ${descricao}`,
    ),
  )
  expect(texto).not.toMatch(/\n{3}|[ \t]$/m)
  expect(texto).toMatch(/[^\n]\n$/)
})

// O texto de cada elemento de TEXTO_DA_PAGINA do main renderizado (menos FORA_DO_LLMS_FULL) tem de
// estar no llms-full.txt: o arquivo sai da mesma árvore que o Next renderiza.
for (const { caminho, titulo } of PAGINAS_DO_SITE)
  test(`llms-full.txt traz o texto de ${caminho}`, async ({
    page,
    request,
  }) => {
    const completo = await (await request.get('/llms-full.txt')).text()
    const inicio = completo.indexOf(
      `\n# ${titulo}\n\nURL: ${naProducao(caminho)}\n`,
    )
    expect(inicio).toBeGreaterThan(0)
    const fim = completo.indexOf('\n# ', inicio + 1)
    const trecho = semMarcacao(
      completo.slice(inicio, fim === -1 ? undefined : fim),
    )
    await page.goto(caminho)
    const textos = await page.evaluate(
      ({ fora, seletor }) => {
        const ehBloco = (elemento: Element) => {
          const exibicao = getComputedStyle(elemento).display
          return !exibicao.startsWith('inline') && exibicao !== 'contents'
        }
        const textoDe = (no: Node): string => {
          if (no.nodeType === Node.TEXT_NODE) return no.nodeValue ?? ''
          if (!(no instanceof Element) || no.matches(fora)) return ''
          const dentro = [...no.childNodes].map(textoDe).join('')
          return ehBloco(no) ? ` ${dentro} ` : dentro
        }
        const main = document.querySelector('main')
        if (!main) return []
        return [...main.querySelectorAll(seletor)]
          .filter((elemento) => !elemento.closest(fora))
          .map((elemento) => textoDe(elemento).replace(/\s+/g, ' ').trim())
          .filter(Boolean)
      },
      { fora: FORA_DO_LLMS_FULL.join(', '), seletor: TEXTO_DA_PAGINA },
    )
    expect(textos.length).toBeGreaterThan(20)
    const faltando = textos
      .map((texto) => texto.replace(/[*`]/g, ''))
      .filter((texto) => !trecho.includes(texto))
    expect(faltando).toEqual([])
  })

// O build do E2E não tem SITE_URL: os links do site saem com a origem de produção, e o servidor
// local responde pelo caminho. O npm responde 403 a quem não é navegador (medido em 2026-11-12):
// os pacotes são conferidos na API do registro.
test('todo link do llms.txt e do llms-full.txt responde', async ({
  request,
}) => {
  test.setTimeout(180_000)
  const textos = await Promise.all(
    ['/llms.txt', '/llms-full.txt'].map(async (caminho) =>
      (await request.get(caminho)).text(),
    ),
  )
  const links = [
    ...new Set(
      textos.flatMap((texto) => [
        ...[...texto.matchAll(LINK_MARKDOWN)].map(([, link]) => link),
        ...[...texto.matchAll(URL_EM_LINHA)].map(([, link]) => link),
      ]),
    ),
  ]
  const doSite = links.filter((link) => link.startsWith(`${SITE_DE_PRODUCAO}/`))
  expect(new Set(doSite.map((link) => new URL(link).pathname))).toEqual(
    new Set([
      ...PAGINAS_DO_SITE.map(({ caminho }) => caminho),
      '/llms.txt',
      '/llms-full.txt',
    ]),
  )
  for (const link of doSite)
    expect((await request.get(new URL(link).pathname)).status(), link).toBe(200)
  // Os dois arquivos da documentação só existem depois do deploy deste PR; o build da
  // documentação os confere.
  const daDocumentacaoParaLlms = [
    `${URL_DA_DOCUMENTACAO}/llms.txt`,
    `${URL_DA_DOCUMENTACAO}/llms-full.txt`,
  ]
  expect(links).toEqual(expect.arrayContaining(daDocumentacaoParaLlms))
  const externos = links.filter(
    (link) =>
      link.startsWith('https://') &&
      !doSite.includes(link) &&
      !daDocumentacaoParaLlms.includes(link),
  )
  expect([
    ...new Set(
      links
        .filter((link) => !link.startsWith('https://'))
        .map((link) => link.split('?')[0]),
    ),
  ]).toEqual(['mailto:help@pilutech.com.br'])
  for (const link of externos) {
    const url = new URL(link)
    const pedido =
      url.hostname === 'www.npmjs.com'
        ? `https://registry.npmjs.org/${url.pathname.replace(/^\/package\//, '')}`
        : link
    expect((await request.get(pedido)).status(), link).toBe(200)
  }
})

// Quem não lê o <link rel="icon"> (favoritos, prévias de link, buscadores) pede o caminho padrão.
test('favicon.ico: os ícones de 16, 32 e 48 px da extensão', async ({
  page,
}) => {
  const resposta = await page.request.get('/favicon.ico')
  expect(resposta.status()).toBe(200)
  expect(resposta.headers()['content-type']).toBe('image/x-icon')
  expect(new Uint8Array(await resposta.body())).toEqual(faviconDoBotai())
})

test('ícones, manifest e theme-color claro e escuro', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('link[rel="icon"]')).toHaveCount(1)
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1)
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1)
  expect(await tamanhoDoPng(page, '/icon.png')).toEqual({
    largura: 300,
    altura: 300,
  })
  const manifesto = await (
    await page.request.get('/manifest.webmanifest')
  ).json()
  expect(manifesto.name).toBe('Botaí')
  await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2)
})
