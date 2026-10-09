import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import { ESTADO_SEM_URL, NOME_DO_NAVEGADOR } from '../lib/extensao'
import { lerUrlsDasLojas } from '../lib/lojas'

// Roda só pelo playwright.lojas.config.ts, que builda a landing com este arquivo no lugar do lojas.json.
const URLS = lerUrlsDasLojas(join(__dirname, 'lojas-publicadas.json'))

test('a fixture: Firefox publicado, Chrome com link de outra loja, Edge em http', () => {
  expect(URLS.firefoxUrl).toMatch(/^https:\/\/addons\.mozilla\.org\//)
  expect(URLS.chromeUrl).toMatch(/^https:\/\/microsoftedge\.microsoft\.com\//)
  expect(URLS.edgeUrl).toMatch(/^http:\/\//)
  expect(URLS.operaUrl).toBe('')
})

test('Firefox publicado: um link, na seção Extensão, em aba nova', async ({
  page,
}) => {
  await page.goto('/')
  const links = page
    .locator('#extensao')
    .getByRole('link', { name: 'Firefox Add-ons', exact: true })
  await expect(links).toHaveCount(1)
  await expect(
    page.getByRole('link', { name: 'Firefox Add-ons', exact: true }),
  ).toHaveCount(1)
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('href', URLS.firefoxUrl)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  }
})

// Review Focus 1: link de outra loja ou em http não vira link. Sem URL, a loja é texto com o estado
// (nunca botão desabilitado), e o Edge sem link nem aparece.
test('Chrome e Opera viram texto com o estado, sem link nem botão, e o Edge some', async ({
  page,
}) => {
  await page.goto('/')
  const lista = page
    .locator('#extensao')
    .getByRole('list', { name: 'Instalar pela loja' })
  await expect(page.getByText('Microsoft Edge Add-ons')).toHaveCount(0)
  for (const loja of ['chrome', 'opera'] as const)
    await expect(
      lista.getByRole('listitem').filter({
        hasText: `${NOME_DO_NAVEGADOR[loja]} ${ESTADO_SEM_URL[loja]}`,
      }),
    ).toHaveCount(1)
  await expect(lista.getByRole('button')).toHaveCount(0)
  await expect(lista.getByRole('link')).toHaveCount(1)
  await expect(page.locator('a[href*="microsoftedge"]')).toHaveCount(0)
})

// A v2 tirou o selo de fase e a nota das lojas: o link da loja é o que diz que dá para instalar.
test('nenhum texto diz "disponível"', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByText(/dispon[ií]vel/i)).toHaveCount(0)
})

test('JSON-LD: installUrl só com o Firefox', async ({ page }) => {
  await page.goto('/')
  const texto = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent()
  const grafo = (
    JSON.parse(texto as string) as { '@graph': Record<string, unknown>[] }
  )['@graph']
  const aplicacao = grafo.find((no) => no['@type'] === 'SoftwareApplication')
  expect(aplicacao?.installUrl).toEqual([URLS.firefoxUrl])
})
