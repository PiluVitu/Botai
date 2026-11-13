import sitemap from './sitemap'

const SITE_URL_ORIGINAL = process.env.SITE_URL
beforeEach(() => {
  delete process.env.SITE_URL
})
afterAll(() => {
  if (SITE_URL_ORIGINAL !== undefined) process.env.SITE_URL = SITE_URL_ORIGINAL
})

it('lista /, /privacidade, /termos e o /llms.txt, no domínio de produção', () => {
  expect(sitemap()).toEqual([
    { url: 'https://botai.pilutech.com.br/' },
    { url: 'https://botai.pilutech.com.br/privacidade' },
    { url: 'https://botai.pilutech.com.br/termos' },
    { url: 'https://botai.pilutech.com.br/llms.txt' },
  ])
})

it('SITE_URL troca a origem', () => {
  process.env.SITE_URL = 'https://preview.exemplo.dev'
  expect(sitemap().map(({ url }) => url)).toEqual([
    'https://preview.exemplo.dev/',
    'https://preview.exemplo.dev/privacidade',
    'https://preview.exemplo.dev/termos',
    'https://preview.exemplo.dev/llms.txt',
  ])
})
