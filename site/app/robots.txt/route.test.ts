/**
 * @jest-environment node
 */
// O Response do route handler é o do Node: o jsdom não o tem.
import { dynamic, GET } from './route'

const SITE_URL_ORIGINAL = process.env.SITE_URL
beforeEach(() => {
  delete process.env.SITE_URL
})
afterAll(() => {
  if (SITE_URL_ORIGINAL !== undefined) process.env.SITE_URL = SITE_URL_ORIGINAL
})

it('é estático: sai pronto do build', () => {
  expect(dynamic).toBe('force-static')
})

// O Google ignora o comentário; ele só aponta os dois arquivos para quem os procura no robots.
it('libera tudo, aponta o sitemap e cita o llms.txt e o llms-full.txt, em texto UTF-8', async () => {
  const resposta = GET()
  expect(resposta.status).toBe(200)
  expect(resposta.headers.get('content-type')).toBe('text/plain; charset=utf-8')
  expect(await resposta.text()).toBe(
    [
      'User-agent: *',
      'Allow: /',
      '',
      'Sitemap: https://botai.pilutech.com.br/sitemap.xml',
      '# llms.txt: https://botai.pilutech.com.br/llms.txt',
      '# llms-full.txt: https://botai.pilutech.com.br/llms-full.txt',
      '',
    ].join('\n'),
  )
})

it('SITE_URL troca a origem do sitemap, do llms.txt e do llms-full.txt', async () => {
  process.env.SITE_URL = 'https://preview.exemplo.dev'
  const corpo = await GET().text()
  expect(corpo).toContain('Sitemap: https://preview.exemplo.dev/sitemap.xml\n')
  expect(corpo).toContain('# llms.txt: https://preview.exemplo.dev/llms.txt\n')
  expect(corpo).toContain(
    '# llms-full.txt: https://preview.exemplo.dev/llms-full.txt\n',
  )
})
