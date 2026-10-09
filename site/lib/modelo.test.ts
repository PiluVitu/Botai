import { botoesDasLojas, modeloDaLanding } from './modelo'

const SEM_LOJA = { chromeUrl: '', firefoxUrl: '', edgeUrl: '', operaUrl: '' }
const URL_CHROME = 'https://chromewebstore.google.com/detail/botai/abc'
const URL_FIREFOX = 'https://addons.mozilla.org/pt-BR/firefox/addon/botai/'
const URL_EDGE = 'https://microsoftedge.microsoft.com/addons/detail/botai/xyz'

describe('botoesDasLojas', () => {
  // Decisão do dono (2026-10-05): o Edge não ganha "Em breve"; quem usa Edge instala pela Chrome Web Store.
  it('sem URL, Chrome, Firefox e Opera em breve, na ordem fixa, e o Edge de fora', () => {
    expect(botoesDasLojas(SEM_LOJA)).toEqual([
      { loja: 'chrome', url: null },
      { loja: 'firefox', url: null },
      { loja: 'opera', url: null },
    ])
  })

  it('o Edge só entra com o link publicado, no lugar dele na ordem', () => {
    expect(botoesDasLojas({ ...SEM_LOJA, edgeUrl: URL_EDGE })).toEqual([
      { loja: 'chrome', url: null },
      { loja: 'firefox', url: null },
      { loja: 'edge', url: URL_EDGE },
      { loja: 'opera', url: null },
    ])
  })

  it('a loja publicada leva a URL dela, aparada', () => {
    expect(
      botoesDasLojas({ ...SEM_LOJA, firefoxUrl: ` ${URL_FIREFOX} ` }),
    ).toEqual([
      { loja: 'chrome', url: null },
      { loja: 'firefox', url: URL_FIREFOX },
      { loja: 'opera', url: null },
    ])
  })

  // O dono cola o link pelo /admin/pilulabs: um link de outra loja ou em http não vira botão.
  it('URL de outro host ou sem https fica sem link', () => {
    expect(
      botoesDasLojas({
        ...SEM_LOJA,
        chromeUrl: URL_FIREFOX,
        edgeUrl: 'http://microsoftedge.microsoft.com/addons/detail/botai/x',
      }).map((b) => [b.loja, b.url]),
    ).toEqual([
      ['chrome', null],
      ['firefox', null],
      ['opera', null],
    ])
  })
})

// A v2 não tem selo de fase nem nota das lojas: a página só precisa dos botões.
describe('modeloDaLanding', () => {
  it('só as lojas', () => {
    expect(modeloDaLanding(SEM_LOJA)).toEqual({
      lojas: botoesDasLojas(SEM_LOJA),
    })
  })

  it('com o Chrome publicado', () => {
    const urls = { ...SEM_LOJA, chromeUrl: URL_CHROME }
    expect(modeloDaLanding(urls)).toEqual({ lojas: botoesDasLojas(urls) })
  })
})
