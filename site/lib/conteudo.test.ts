import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ANCORAS_DA_LANDING,
  EMAIL_DE_SUPORTE,
  historicoDe,
  MAILTO,
  npmDe,
  PACOTE_DO_CORE,
  PACOTE_DO_PLAYWRIGHT,
  POSICIONAMENTO,
  RECURSOS,
  REPOSITORIO,
  REQUISITOS_DO_SOFTWARE,
  URL_DA_DOCUMENTACAO,
  URL_DA_LICENCA,
  URL_DA_PILUTECH,
} from './conteudo'

const RAIZ = join(__dirname, '..', '..')
const ler = (...caminho: string[]) =>
  readFileSync(join(RAIZ, ...caminho), 'utf8')

const WXT_CONFIG = ler('extensao', 'wxt.config.ts')

describe('conteúdo da landing', () => {
  it('os 5 recursos do design, na ordem', () => {
    expect(RECURSOS.map((r) => r.titulo)).toEqual([
      'Documentos',
      'Endereço',
      'Contato',
      'Empresa',
      'Cartão',
    ])
  })

  // O h1 do hero e o card de Open Graph dizem a mesma frase.
  it('o posicionamento da v2', () => {
    expect(POSICIONAMENTO).toBe(
      'Dados de teste brasileiros em todo lugar que o seu teste roda.',
    )
  })

  // O cabeçalho lê a lista; cada seção ancorada usa o id dela (tipo AncoraDaLanding).
  it('as 4 âncoras do cabeçalho, na ordem da página', () => {
    expect(ANCORAS_DA_LANDING).toEqual([
      { id: 'portas', rotulo: 'Portas' },
      { id: 'mesma-pessoa', rotulo: 'Mesma pessoa' },
      { id: 'para-quem', rotulo: 'Para quem' },
      { id: 'extensao', rotulo: 'Extensão' },
    ])
  })

  // A página promete versões mínimas: elas têm de ser as do manifesto da extensão.
  it('os pisos de versão do texto são os do wxt.config.ts do Botaí', () => {
    const chromium = /minimum_chrome_version: '(\d+)'/.exec(WXT_CONFIG)?.[1]
    const firefox = /strict_min_version: '(\d+)\.0'/.exec(WXT_CONFIG)?.[1]
    expect([chromium, firefox]).toEqual(['123', '153'])
    expect(REQUISITOS_DO_SOFTWARE).toBe(
      `Chrome, Edge ou Opera com Chromium ${chromium} ou superior, ou Firefox ${firefox} ou superior`,
    )
  })
})

describe('documentos e código-fonte', () => {
  it('o histórico de um arquivo do site no GitHub', () => {
    expect(historicoDe('app/privacidade/page.tsx')).toBe(
      'https://github.com/PiluVitu/Botai/commits/main/site/app/privacidade/page.tsx',
    )
  })

  // Os termos dizem que o código é MIT: o link e o arquivo têm de bater.
  it('a licença citada nos termos é o LICENSE MIT do Botaí', () => {
    expect(URL_DA_LICENCA).toBe(`${REPOSITORIO}/blob/main/extensao/LICENSE`)
    const licenca = readFileSync(
      join(__dirname, '..', '..', 'extensao', 'LICENSE'),
      'utf8',
    )
    expect(licenca).toMatch(/^MIT License\n\nCopyright \(c\) \d{4} PiluTech\n/)
  })
})

describe('contato e links da PiluTech', () => {
  // O dono filtra no Gmail com subject:Botaí: cada link diz de onde veio (RFC 6068, UTF-8).
  it('suporte, privacidade e termos vão para o e-mail da PiluTech com [Botaí] no assunto', () => {
    expect(EMAIL_DE_SUPORTE).toBe('pilutechinformatica@gmail.com')
    expect(MAILTO).toEqual({
      suporte:
        'mailto:pilutechinformatica@gmail.com?subject=%5BBota%C3%AD%5D%20Suporte',
      privacidade:
        'mailto:pilutechinformatica@gmail.com?subject=%5BBota%C3%AD%5D%20Privacidade',
      termos:
        'mailto:pilutechinformatica@gmail.com?subject=%5BBota%C3%AD%5D%20Termos%20de%20uso',
    })
  })

  it('a PiluTech mora no pilutech.com.br', () => {
    expect(URL_DA_PILUTECH).toBe('https://pilutech.com.br')
  })

  // A documentação é outro projeto da Vercel (documentacao/), num subdomínio da landing.
  it('a documentação mora no docs.botai.pilutech.com.br', () => {
    expect(URL_DA_DOCUMENTACAO).toBe('https://docs.botai.pilutech.com.br')
  })
})

describe('pacotes', () => {
  it('os pacotes têm o nome do package.json e a página do npm', () => {
    const nome = (pasta: string) =>
      (JSON.parse(ler('packages', pasta, 'package.json')) as { name: string })
        .name
    expect([PACOTE_DO_CORE, PACOTE_DO_PLAYWRIGHT]).toEqual([
      nome('core'),
      nome('playwright'),
    ])
    expect(npmDe(PACOTE_DO_CORE)).toBe(
      'https://www.npmjs.com/package/@pilutech/botai-core',
    )
  })
})
