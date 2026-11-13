import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  APRESENTACAO,
  MAILTO,
  npmDe,
  PACOTE_DO_CORE,
  PACOTE_DO_PLAYWRIGHT,
  POSICIONAMENTO,
  REPOSITORIO,
  RESUMO_DO_PROJETO,
  URL_DA_DOCUMENTACAO,
  URL_DA_PILUTECH,
} from './conteudo'
import { llmsTxt } from './llms'
import { lerUrlsDasLojas } from './lojas'
import { CONVITE } from './personas'
import type { UrlsDasLojas } from './pilulabs'
import { PORTAS } from './portas'
import { DESCRICAO_DA_HOME, PAGINAS_DO_SITE } from './seo'
import { SITE_DE_PRODUCAO, urlDoSite } from './site'

const RAIZ = join(__dirname, '..', '..')
const ITEM = /^- \[[^\]]+\]\((https:\/\/|mailto:)[^)]+\): .+$/
const URLS = lerUrlsDasLojas()
const TEXTO = llmsTxt(SITE_DE_PRODUCAO, URLS)
const SEM_LOJA: UrlsDasLojas = {
  chromeUrl: '',
  firefoxUrl: '',
  edgeUrl: '',
  operaUrl: '',
}

function itensDa(texto: string, titulo: string): string[] {
  const cabecalho = `\n## ${titulo}\n\n`
  const inicio = texto.indexOf(cabecalho)
  if (inicio === -1) throw new Error(`seção ausente: ${titulo}`)
  const resto = texto.slice(inicio + cabecalho.length)
  const fim = resto.indexOf('\n\n')
  return (fim === -1 ? resto.trimEnd() : resto.slice(0, fim)).split('\n')
}

function slugsDaDocumentacao(): string[] {
  const docs = join(RAIZ, 'documentacao', 'docs')
  return readdirSync(docs, { withFileTypes: true })
    .filter((entrada) => entrada.isDirectory())
    .map((entrada) => join(docs, entrada.name, '_category_.json'))
    .filter((arquivo) => existsSync(arquivo))
    .map(
      (arquivo) =>
        (
          JSON.parse(readFileSync(arquivo, 'utf8')) as {
            link?: { slug?: string }
          }
        ).link?.slug,
    )
    .filter((slug): slug is string => typeof slug === 'string')
}

describe('llmsTxt', () => {
  // Formato do llmstxt.org: título, resumo em citação, um parágrafo e as seções de links.
  it('abre com o nome, a descrição da home como resumo e o parágrafo do hero', () => {
    expect(
      TEXTO.startsWith(
        `# Botaí\n\n> ${DESCRICAO_DA_HOME}\n\n${POSICIONAMENTO} ${APRESENTACAO}\n\n## `,
      ),
    ).toBe(true)
  })

  it('as seções, nesta ordem', () => {
    expect(TEXTO.match(/^## .+$/gm)).toEqual([
      '## Páginas',
      '## Portas',
      '## Instalar a extensão',
      '## Documentação',
      '## Código e pacotes',
      '## Contato',
    ])
  })

  it('depois do parágrafo, toda linha é um título de seção, um item ou vazia', () => {
    const linhas = TEXTO.split('\n').slice(6)
    const itens = linhas.filter((linha) => linha.startsWith('- '))
    expect(itens.length).toBeGreaterThan(0)
    for (const item of itens) expect(item).toMatch(ITEM)
    for (const linha of linhas)
      expect(linha === '' || linha.startsWith('## ') || ITEM.test(linha)).toBe(
        true,
      )
  })

  it('termina com uma quebra de linha só', () => {
    expect(TEXTO).toMatch(/[^\n]\n$/)
  })

  it('uma linha por página do site, com o título e a descrição das metas', () => {
    expect(PAGINAS_DO_SITE.map((p) => p.caminho)).toEqual([
      '/',
      '/privacidade',
      '/termos',
    ])
    expect(itensDa(TEXTO, 'Páginas')).toEqual(
      PAGINAS_DO_SITE.map(
        ({ caminho, titulo, descricao }) =>
          `- [${titulo}](${new URL(caminho, `${SITE_DE_PRODUCAO}/`).href}): ${descricao}`,
      ),
    )
  })

  it('uma linha por porta, na ordem, com a pasta dela na documentação', () => {
    expect(PORTAS.map((p) => [p.id, p.documentacao])).toEqual([
      ['extensao', '/extensao'],
      ['cli', '/cli'],
      ['http', '/servidor'],
      ['docker', '/docker'],
      ['binarios', '/binarios'],
      ['biblioteca', '/biblioteca'],
      ['playwright', '/playwright'],
      ['motor', '/navegador'],
    ])
    expect(itensDa(TEXTO, 'Portas')).toEqual(
      PORTAS.map(
        (p) =>
          `- [${p.nome}](${URL_DA_DOCUMENTACAO}${p.documentacao}): ${p.linha} ${p.onde}`,
      ),
    )
  })

  // A documentação é o Docusaurus do repo: cada pasta é o slug de uma categoria.
  it('a pasta de cada porta é o slug de uma categoria da documentação', () => {
    const slugs = slugsDaDocumentacao()
    expect(slugs.length).toBeGreaterThan(0)
    for (const { documentacao } of PORTAS) expect(slugs).toContain(documentacao)
  })

  // O lojas.json real publica o Chrome e o Firefox (lib/lojas.test.ts trava o arquivo).
  it('com o lojas.json real, só as lojas publicadas: Chrome e Firefox', () => {
    expect(itensDa(TEXTO, 'Instalar a extensão')).toEqual([
      `- [Chrome Web Store](${URLS.chromeUrl}): A extensão para Chrome e Edge.`,
      `- [Firefox Add-ons](${URLS.firefoxUrl}): A extensão para Firefox.`,
    ])
  })

  it('loja publicada entra na ordem das lojas; link de outra loja e http ficam de fora', () => {
    const urls: UrlsDasLojas = {
      chromeUrl: 'https://microsoftedge.microsoft.com/addons/detail/botai/x',
      firefoxUrl: URLS.firefoxUrl,
      edgeUrl: 'https://microsoftedge.microsoft.com/addons/detail/botai/abc',
      operaUrl: 'http://addons.opera.com/pt-br/extensions/details/botai/',
    }
    expect(
      itensDa(llmsTxt(SITE_DE_PRODUCAO, urls), 'Instalar a extensão'),
    ).toEqual([
      `- [Firefox Add-ons](${URLS.firefoxUrl}): A extensão para Firefox.`,
      '- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/botai/abc): A extensão para Edge.',
    ])
  })

  it('sem loja publicada, a seção não aparece vazia', () => {
    const texto = llmsTxt(SITE_DE_PRODUCAO, SEM_LOJA)
    expect(texto).not.toContain('## Instalar a extensão')
    expect(texto.match(/^## .+$/gm)).toHaveLength(5)
  })

  it('a documentação: a raiz com o convite da página e os dois arquivos para LLMs', () => {
    expect(itensDa(TEXTO, 'Documentação')).toEqual([
      `- [${CONVITE.rotulo}](${URL_DA_DOCUMENTACAO}): ${CONVITE.texto}`,
      `- [llms.txt da documentação](${URL_DA_DOCUMENTACAO}/llms.txt): O índice das páginas da documentação.`,
      `- [llms-full.txt da documentação](${URL_DA_DOCUMENTACAO}/llms-full.txt): O conteúdo das páginas da documentação em Markdown, num arquivo só.`,
    ])
  })

  it('o código: o GitHub com a frase do rodapé e os dois pacotes do npm', () => {
    expect(itensDa(TEXTO, 'Código e pacotes')).toEqual([
      `- [GitHub](${REPOSITORIO}): ${RESUMO_DO_PROJETO}`,
      `- [${PACOTE_DO_CORE}](${npmDe(PACOTE_DO_CORE)}): A CLI, o servidor HTTP, a biblioteca e o motor no navegador, num pacote só.`,
      `- [${PACOTE_DO_PLAYWRIGHT}](${npmDe(PACOTE_DO_PLAYWRIGHT)}): A fixture botai do Playwright, com a pessoa reproduzível pela semente do teste.`,
    ])
  })

  it('o contato: o e-mail de suporte, com [Botaí] no assunto, e a PiluTech', () => {
    expect(itensDa(TEXTO, 'Contato')).toEqual([
      `- [help@pilutech.com.br](${MAILTO.suporte}): Suporte, privacidade e termos de uso.`,
      `- [PiluTech](${URL_DA_PILUTECH}): O Botaí e este site são da PiluTech.`,
    ])
  })

  // Preview e local sem SITE_URL apontam para a produção, como o canonical e o sitemap.
  it('SITE_URL troca a origem dos links do site, e só deles', () => {
    const texto = llmsTxt(
      urlDoSite({ SITE_URL: 'https://preview.exemplo.dev/qualquer' }),
      URLS,
    )
    expect(itensDa(texto, 'Páginas')).toEqual(
      PAGINAS_DO_SITE.map(
        ({ caminho, titulo, descricao }) =>
          `- [${titulo}](${new URL(caminho, 'https://preview.exemplo.dev/').href}): ${descricao}`,
      ),
    )
    expect(texto).not.toContain(SITE_DE_PRODUCAO)
    expect(itensDa(texto, 'Portas')).toEqual(itensDa(TEXTO, 'Portas'))
  })

  it('sem dado privado: o único e-mail é o de suporte, sem gmail, localhost nem http://', () => {
    expect([...new Set(TEXTO.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g))]).toEqual([
      'help@pilutech.com.br',
    ])
    expect(TEXTO).not.toMatch(/gmail/i)
    expect(TEXTO).not.toMatch(/localhost|127\.0\.0\.1/)
    expect(TEXTO).not.toContain('http://')
  })
})
