import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ehHttps } from './pilulabs'
import { ARQUIVO_DAS_LOJAS, lerUrlsDasLojas } from './lojas'

const URL_CHROME = 'https://chromewebstore.google.com/detail/botai/abc'
const SEM_LOJA = { chromeUrl: '', firefoxUrl: '', edgeUrl: '', operaUrl: '' }

describe('lerUrlsDasLojas', () => {
  let pasta: string

  beforeEach(() => {
    pasta = mkdtempSync(join(tmpdir(), 'botai-lojas-'))
  })
  afterEach(() => {
    rmSync(pasta, { recursive: true, force: true })
  })

  function arquivo(conteudo: string): string {
    const caminho = join(pasta, 'lojas.json')
    writeFileSync(caminho, conteudo)
    return caminho
  }

  // O dono publica uma loja por PR neste arquivo; o card da PiluLabs lê o CMS do monorepo.
  it('lê o lojas.json da raiz do site', () => {
    expect(ARQUIVO_DAS_LOJAS).toMatch(/site\/lojas\.json$/)
  })

  it('lê o arquivo real: as 4 URLs, vazias ou https', () => {
    const urls = lerUrlsDasLojas()
    expect(Object.keys(urls).sort()).toEqual([
      'chromeUrl',
      'edgeUrl',
      'firefoxUrl',
      'operaUrl',
    ])
    for (const url of Object.values(urls))
      expect(url === '' || ehHttps(url)).toBe(true)
  })

  it('apara espaços e ignora o resto do objeto', () => {
    expect(
      lerUrlsDasLojas(
        arquivo(
          JSON.stringify({
            chromeUrl: `  ${URL_CHROME} `,
            firefoxUrl: '',
            edgeUrl: '',
            operaUrl: '',
            nota: 'qualquer coisa',
          }),
        ),
      ),
    ).toEqual({ ...SEM_LOJA, chromeUrl: URL_CHROME })
  })

  it('campo ausente, nulo ou que não é texto vira vazio', () => {
    expect(
      lerUrlsDasLojas(
        arquivo('{"chromeUrl": 12, "firefoxUrl": null, "edgeUrl": ["a"]}'),
      ),
    ).toEqual(SEM_LOJA)
  })

  // Sem o arquivo, ou com ele quebrado, o build tem de quebrar: em silêncio, a landing sairia "Em breve" com a loja publicada.
  it('arquivo que não existe lança', () => {
    expect(() => lerUrlsDasLojas(join(pasta, 'nao-existe.json'))).toThrow(
      /ENOENT/,
    )
  })

  it('JSON inválido lança, inclusive o arquivo vazio', () => {
    expect(() => lerUrlsDasLojas(arquivo(''))).toThrow(SyntaxError)
    expect(() => lerUrlsDasLojas(arquivo("chromeUrl: 'x'"))).toThrow(
      SyntaxError,
    )
  })

  // Só o playwright.lojas.config.ts define a variável: builda a landing com um arquivo de teste.
  it('BOTAI_LOJAS troca o arquivo lido por padrão', () => {
    process.env.BOTAI_LOJAS = arquivo(JSON.stringify({ chromeUrl: URL_CHROME }))
    try {
      expect(lerUrlsDasLojas().chromeUrl).toBe(URL_CHROME)
    } finally {
      delete process.env.BOTAI_LOJAS
    }
  })
})
