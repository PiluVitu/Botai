import {
  ehHttps,
  ehUrlDaLoja,
  fase,
  LOJAS,
  lojasPublicadas,
  urlsDasLojas,
} from './pilulabs'

const SEM_LOJA = { chromeUrl: '', firefoxUrl: '', edgeUrl: '', operaUrl: '' }

const URL_CHROME = 'https://chromewebstore.google.com/detail/botai/abc'
const URL_FIREFOX = 'https://addons.mozilla.org/pt-BR/firefox/addon/botai/'
const URL_EDGE = 'https://microsoftedge.microsoft.com/addons/detail/botai/xyz'
const URL_OPERA = 'https://addons.opera.com/pt-br/extensions/details/botai/'

describe('LOJAS', () => {
  it('as lojas em ordem fixa: chrome, firefox, edge, opera', () => {
    expect(LOJAS).toEqual(['chrome', 'firefox', 'edge', 'opera'])
  })
})

describe('ehUrlDaLoja', () => {
  it('aceita a URL https no host exato da loja, com espaços em volta', () => {
    expect(ehUrlDaLoja('chrome', ` ${URL_CHROME} `)).toBe(true)
    expect(ehUrlDaLoja('opera', URL_OPERA)).toBe(true)
  })

  it.each([
    [
      'http em vez de https',
      'http://chromewebstore.google.com/detail/botai/abc',
    ],
    [
      'host com sufixo',
      'https://chromewebstore.google.com.evil.io/detail/botai/abc',
    ],
    ['subdomínio', 'https://www.chromewebstore.google.com/detail/botai/abc'],
    ['host de outra loja', URL_FIREFOX],
    ['sem esquema', 'chromewebstore.google.com/detail/botai/abc'],
    ['javascript:', 'javascript:alert(1)'],
    ['vazio', ''],
  ])('recusa na Chrome Web Store: %s', (_caso, url) => {
    expect(ehUrlDaLoja('chrome', url)).toBe(false)
  })
})

describe('ehHttps', () => {
  it('aceita https e recusa o resto', () => {
    expect(ehHttps('https://botai.pilutech.com.br')).toBe(true)
    expect(ehHttps(' https://botai.pilutech.com.br ')).toBe(true)
    expect(ehHttps('http://botai.pilutech.com.br')).toBe(false)
    expect(ehHttps('javascript:alert(1)')).toBe(false)
    expect(ehHttps('botai.pilutech.com.br')).toBe(false)
    expect(ehHttps('')).toBe(false)
  })
})

describe('lojasPublicadas', () => {
  it('sem URL nenhuma, nenhuma loja', () => {
    expect(lojasPublicadas(SEM_LOJA)).toEqual([])
  })

  it('aceita cada loja no host dela, na ordem fixa, seja qual for a ordem do arquivo', () => {
    expect(
      lojasPublicadas({
        operaUrl: URL_OPERA,
        edgeUrl: URL_EDGE,
        firefoxUrl: URL_FIREFOX,
        chromeUrl: URL_CHROME,
      }),
    ).toEqual([
      { loja: 'chrome', url: URL_CHROME },
      { loja: 'firefox', url: URL_FIREFOX },
      { loja: 'edge', url: URL_EDGE },
      { loja: 'opera', url: URL_OPERA },
    ])
  })

  // As aprovações chegam em datas diferentes (o Opera pode levar meses).
  it('publica loja por loja', () => {
    expect(lojasPublicadas({ ...SEM_LOJA, firefoxUrl: URL_FIREFOX })).toEqual([
      { loja: 'firefox', url: URL_FIREFOX },
    ])
  })

  it('apara espaços antes de validar', () => {
    expect(
      lojasPublicadas({ ...SEM_LOJA, chromeUrl: `  ${URL_CHROME}\n` }),
    ).toEqual([{ loja: 'chrome', url: URL_CHROME }])
  })

  it.each([
    [
      'http em vez de https',
      'http://chromewebstore.google.com/detail/botai/abc',
    ],
    [
      'host com sufixo',
      'https://chromewebstore.google.com.evil.io/detail/botai/abc',
    ],
    ['subdomínio', 'https://www.chromewebstore.google.com/detail/botai/abc'],
    ['host de outra loja', URL_FIREFOX],
    ['sem esquema', 'chromewebstore.google.com/detail/botai/abc'],
    ['javascript:', 'javascript:alert(1)'],
  ])('recusa na Chrome Web Store: %s', (_caso, url) => {
    expect(lojasPublicadas({ ...SEM_LOJA, chromeUrl: url })).toEqual([])
  })
})

describe('fase', () => {
  it('em-breve sem loja publicada', () => {
    expect(fase(SEM_LOJA)).toBe('em-breve')
  })

  it('disponivel com uma loja publicada', () => {
    expect(fase({ ...SEM_LOJA, edgeUrl: URL_EDGE })).toBe('disponivel')
  })

  it('URL de host errado não conta como publicada', () => {
    expect(fase({ ...SEM_LOJA, chromeUrl: 'https://example.com/botai' })).toBe(
      'em-breve',
    )
  })
})

describe('urlsDasLojas', () => {
  it('as 4 URLs, aparadas, sem o resto do objeto', () => {
    expect(
      urlsDasLojas({
        slug: 'botai',
        nome: 'Botaí',
        chromeUrl: ` ${URL_CHROME} `,
        firefoxUrl: '',
        edgeUrl: URL_EDGE,
        operaUrl: '',
      }),
    ).toEqual({ ...SEM_LOJA, chromeUrl: URL_CHROME, edgeUrl: URL_EDGE })
  })

  it('campo ausente, nulo ou que não é texto vira vazio', () => {
    expect(
      urlsDasLojas({ chromeUrl: 12, firefoxUrl: null, edgeUrl: ['a'] }),
    ).toEqual(SEM_LOJA)
  })

  it.each([[null], [undefined], [''], ['texto'], [42], [[]]])(
    'conteúdo que não é um objeto (%p): nenhuma loja',
    (bruto) => {
      expect(urlsDasLojas(bruto)).toEqual(SEM_LOJA)
    },
  )
})
