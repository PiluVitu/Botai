import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as core from '@pilutech/botai-core'
import { executar } from '../../packages/core/src/cli/executar'
import {
  DOCUMENTOS,
  EMAIL_DE_SUPORTE,
  historicoDe,
  IMAGEM_DO_SERVIDOR,
  MAILTO,
  npmDe,
  PACOTE_DO_CORE,
  PACOTE_DO_PLAYWRIGHT,
  PORTAS,
  RECURSOS,
  REPOSITORIO,
  REQUISITOS,
  REQUISITOS_DO_SOFTWARE,
  URL_DA_DOCUMENTACAO,
  URL_DA_LICENCA,
  URL_DA_PILULABS,
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

  // A página promete versões mínimas: elas têm de ser as do manifesto da extensão.
  it('os pisos de versão do texto são os do wxt.config.ts do Botaí', () => {
    const chromium = /minimum_chrome_version: '(\d+)'/.exec(WXT_CONFIG)?.[1]
    const firefox = /strict_min_version: '(\d+)\.0'/.exec(WXT_CONFIG)?.[1]
    expect([chromium, firefox]).toEqual(['123', '153'])
    expect(REQUISITOS).toBe(
      `Chrome, Edge e Opera a partir do Chromium ${chromium}. Firefox a partir da versão ${firefox}.`,
    )
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

  it('o rodapé leva à privacidade e aos termos, nessa ordem', () => {
    expect(DOCUMENTOS).toEqual([
      { href: '/privacidade', rotulo: 'Privacidade' },
      { href: '/termos', rotulo: 'Termos de uso' },
    ])
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

  it('a vitrine PiluLabs mora no piluvitu.com.br, e a PiluTech no pilutech.com.br', () => {
    expect(URL_DA_PILULABS).toBe('https://piluvitu.com.br/pilulabs')
    expect(URL_DA_PILUTECH).toBe('https://pilutech.com.br')
  })

  // A documentação é outro projeto da Vercel (documentacao/), num subdomínio da landing.
  it('a documentação mora no docs.botai.pilutech.com.br', () => {
    expect(URL_DA_DOCUMENTACAO).toBe('https://docs.botai.pilutech.com.br')
  })
})

// A seção "Para devs" mostra comandos de verdade: cada um é conferido contra o código que ele chama.
describe('para devs', () => {
  function linhasDe(titulo: string): string[] {
    const porta = PORTAS.find((p) => p.titulo === titulo)
    if (!porta || porta.codigo.tipo === 'atalho')
      throw new Error(`porta sem código: ${titulo}`)
    return porta.codigo.linhas
  }

  it('as cinco portas do motor, na ordem do anúncio', () => {
    expect(PORTAS.map((p) => p.titulo)).toEqual([
      'Extensão',
      'Biblioteca',
      'CLI',
      'Servidor, Docker e binários',
      'Plugin do Playwright',
    ])
    expect(PORTAS[0].codigo).toEqual({ tipo: 'atalho' })
  })

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

  it('a biblioteca importa da raiz do core uma função que existe', () => {
    const [importacao, chamada] = linhasDe('Biblioteca')
    const lido = /^import \{ (\w+) \} from '(.+)'$/.exec(importacao)
    expect(lido?.[2]).toBe(PACOTE_DO_CORE)
    const funcao = lido?.[1] as keyof typeof core
    expect(typeof core[funcao]).toBe('function')
    expect(chamada.startsWith(`${funcao}(`)).toBe(true)
  })

  // Roda na CLI do core o argv que o terminal passaria, sem o `npx` e sem o `>`.
  it('o comando da CLI roda e sai com o SQL de 1000 pessoas', () => {
    const [linha] = linhasDe('CLI')
    const [npx, pacote, ...resto] = linha.split(' ')
    expect([npx, pacote]).toEqual(['npx', PACOTE_DO_CORE])
    const argv = resto.slice(0, resto.indexOf('>'))
    let dados = ''
    const codigo = executar(argv, {
      dados: (texto) => {
        dados += texto
      },
      mensagem: () => {},
    })
    expect(codigo).toBe(0)
    expect(dados).toMatch(/^-- botai: formato 1, /)
    expect(dados.match(/^INSERT /gm)).toHaveLength(1000)
  })

  // Subiu a versão do core? A imagem da landing sobe no mesmo PR.
  it('a imagem do servidor é a da versão do core, na porta em que a imagem escuta', () => {
    const { version } = JSON.parse(ler('packages', 'core', 'package.json')) as {
      version: string
    }
    expect(IMAGEM_DO_SERVIDOR).toBe(`ghcr.io/piluvitu/botai:${version}`)
    expect(linhasDe('Servidor, Docker e binários')).toEqual([
      `docker run --rm -p 8790:8790 ${IMAGEM_DO_SERVIDOR}`,
    ])
    expect(ler('packages', 'core', 'Dockerfile')).toContain(
      'CMD ["serve", "--host", "0.0.0.0", "--porta", "8790"]',
    )
  })

  it('o plugin exporta o test com a fixture botai, que tem o preencher', () => {
    expect(linhasDe('Plugin do Playwright')).toEqual([
      `import { test } from '${PACOTE_DO_PLAYWRIGHT}'`,
      'await botai.preencher(page)',
    ])
    expect(ler('packages', 'playwright', 'src', 'index.ts')).toMatch(
      /export \{[^}]*\btest,[^}]*\} from '\.\/fixture\.js'/,
    )
    const fixture = ler('packages', 'playwright', 'src', 'fixture.ts')
    expect(fixture).toMatch(/^\s+botai: async \(/m)
    expect(fixture).toMatch(/^\s+preencher\(\n\s+alvo: Page \| Locator,/m)
  })
})
