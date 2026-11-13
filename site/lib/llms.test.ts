import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render } from '@testing-library/react'
import { createElement, type ReactElement } from 'react'
import Home from '@/app/page'
import PrivacidadePage from '@/app/privacidade/page'
import TermosPage from '@/app/termos/page'
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
import { COMANDO_DO_EXEMPLO, PESSOA_DO_EXEMPLO } from './exemplo'
import { llmsFullTxt, llmsTxt } from './llms'
import { lerUrlsDasLojas } from './lojas'
import { CONVITE } from './personas'
import type { UrlsDasLojas } from './pilulabs'
import { PORTAS } from './portas'
import { DESCRICAO_DA_HOME, PAGINAS_DO_SITE } from './seo'
import { SITE_DE_PRODUCAO, urlAbsoluta, urlDoSite } from './site'

const RAIZ = join(__dirname, '..', '..')
const ITEM = /^- \[[^\]]+\]\((https:\/\/|mailto:)[^)]+\): .+$/
const URLS = lerUrlsDasLojas()
const TEXTO = llmsTxt(SITE_DE_PRODUCAO, URLS)
const ITEM_DO_LLMS_FULL = (site: string) =>
  `- [llms-full.txt do site](${site}/llms-full.txt): O conteúdo destas três páginas em Markdown, num arquivo só.`
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

  it('uma linha por página do site, com o título e a descrição das metas, e o llms-full.txt no fim', () => {
    expect(PAGINAS_DO_SITE.map((p) => p.caminho)).toEqual([
      '/',
      '/privacidade',
      '/termos',
    ])
    expect(itensDa(TEXTO, 'Páginas')).toEqual([
      ...PAGINAS_DO_SITE.map(
        ({ caminho, titulo, descricao }) =>
          `- [${titulo}](${new URL(caminho, `${SITE_DE_PRODUCAO}/`).href}): ${descricao}`,
      ),
      ITEM_DO_LLMS_FULL(SITE_DE_PRODUCAO),
    ])
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
    expect(itensDa(texto, 'Páginas')).toEqual([
      ...PAGINAS_DO_SITE.map(
        ({ caminho, titulo, descricao }) =>
          `- [${titulo}](${new URL(caminho, 'https://preview.exemplo.dev/').href}): ${descricao}`,
      ),
      ITEM_DO_LLMS_FULL('https://preview.exemplo.dev'),
    ])
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

// As árvores que o Next renderiza: o default export de cada page.tsx, as mesmas do route handler.
const ARVORES: Record<string, ReactElement> = {
  '/': createElement(Home),
  '/privacidade': createElement(PrivacidadePage),
  '/termos': createElement(TermosPage),
}
const COMPLETO = llmsFullTxt(SITE_DE_PRODUCAO, ARVORES)
const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g
// Domínio terminado em letras: o "botai-core@0.5.0" do comando não é e-mail.
const EMAIL = /[\w.+-]+@[a-z\d-]+(\.[a-z\d-]+)*\.[a-z]{2,}/gi

const normalizar = (texto: string | null | undefined) =>
  (texto ?? '').replace(/\s+/g, ' ').trim()

function trechoDa(caminho: string): string {
  const pagina = PAGINAS_DO_SITE.find((p) => p.caminho === caminho)
  if (!pagina) throw new Error(`fora de PAGINAS_DO_SITE: ${caminho}`)
  const cabecalho = `\n# ${pagina.titulo}\n\nURL: ${urlAbsoluta(caminho, SITE_DE_PRODUCAO)}\n\n`
  const inicio = COMPLETO.indexOf(cabecalho)
  if (inicio === -1) throw new Error(`página ausente: ${caminho}`)
  const resto = COMPLETO.slice(inicio + cabecalho.length)
  const fim = resto.indexOf('\n# ')
  return fim === -1 ? resto : resto.slice(0, fim)
}

// A página renderizada pelo Testing Library é a referência dos títulos, da vigência e das âncoras.
function renderizar(caminho: string): HTMLElement {
  return render(ARVORES[caminho]).container
}

describe('llmsFullTxt', () => {
  it('abre com o nome, a descrição da home e o índice das páginas', () => {
    expect(
      COMPLETO.startsWith(
        `# Botaí\n\n> ${DESCRICAO_DA_HOME}\n\nÍndice das páginas: ${SITE_DE_PRODUCAO}/llms.txt\n\n# `,
      ),
    ).toBe(true)
  })

  it('as três páginas, na ordem de PAGINAS_DO_SITE, cada uma com a URL e a description', () => {
    expect(COMPLETO.match(/^# .+$/gm)).toEqual([
      '# Botaí',
      ...PAGINAS_DO_SITE.map(({ titulo }) => `# ${titulo}`),
    ])
    expect(COMPLETO.match(/^# .+\n\nURL: .+\n\n> .+$/gm)).toEqual(
      PAGINAS_DO_SITE.map(
        ({ caminho, titulo, descricao }) =>
          `# ${titulo}\n\nURL: ${urlAbsoluta(caminho, SITE_DE_PRODUCAO)}\n\n> ${descricao}`,
      ),
    )
  })

  it('blocos separados por uma linha em branco, sem espaço no fim da linha, e uma quebra só no fim', () => {
    expect(COMPLETO).not.toMatch(/\n{3}/)
    expect(COMPLETO).not.toMatch(/[ \t]$/m)
    expect(COMPLETO).toMatch(/[^\n]\n$/)
  })

  it('os títulos de cada página, na ordem, rebaixados um nível: o h1 vira ##, os h2 viram ###', () => {
    for (const { caminho } of PAGINAS_DO_SITE) {
      const main = renderizar(caminho).querySelector('main') as HTMLElement
      const esperados = [...main.querySelectorAll('h1, h2, h3, h4, h5')].map(
        (titulo) =>
          `${'#'.repeat(Number(titulo.tagName[1]) + 1)} ${normalizar(titulo.textContent)}`,
      )
      expect(
        esperados.filter((t) => t.startsWith('### ')).length,
      ).toBeGreaterThan(5)
      const titulos = [
        ...trechoDa(caminho).matchAll(
          /^(?:[ \t]*(?:[-*]|\d+[.)])[ \t]+)?(#{2,6} .+)$/gm,
        ),
      ].map(([, titulo]) => titulo)
      expect(titulos).toEqual(esperados)
    }
  })

  it('o comando do hero num bloco de código e "A extensão não tem servidor" na home e na política', () => {
    expect(trechoDa('/')).toContain(`\`\`\`\n${COMANDO_DO_EXEMPLO}\n\`\`\``)
    expect(trechoDa('/')).toContain('A extensão não tem servidor nem analytics')
    expect(trechoDa('/privacidade')).toContain(
      'Nada. A extensão não tem servidor e não faz requisições',
    )
  })

  it('a vigência das duas páginas de texto', () => {
    for (const caminho of ['/privacidade', '/termos']) {
      const data = renderizar(caminho).querySelector('main time')
      expect(data).not.toBeNull()
      expect(trechoDa(caminho)).toContain(
        `\n\nEm vigor desde ${normalizar(data?.textContent)}\n\n`,
      )
    }
  })

  it('a tabela de permissões da política, de activeTab a menus', () => {
    const permissoes = [
      ...renderizar('/privacidade').querySelectorAll('main tbody th'),
    ].map((th) => normalizar(th.textContent))
    expect(permissoes).toEqual([
      'activeTab',
      'scripting',
      'contextMenus',
      'storage',
      'menus',
    ])
    expect(trechoDa('/privacidade')).toContain(
      '| Permissão | Para quê | Navegadores |\n| --- | --- | --- |\n',
    )
    for (const permissao of permissoes)
      expect(trechoDa('/privacidade')).toMatch(
        new RegExp(
          `^\\| \`${permissao}\` \\| .+ \\| (Todos|Só no Firefox) \\|$`,
          'm',
        ),
      )
  })

  it('sem lixo de conversão: [object Object], undefined, NaN, className nem tag HTML fora do código', () => {
    for (const lixo of ['[object Object]', 'undefined', 'NaN', 'className'])
      expect(COMPLETO).not.toContain(lixo)
    const semCodigo = COMPLETO.replace(
      /^[ \t]*```[^\n]*\n[\s\S]*?\n[ \t]*```$/gm,
      '',
    ).replace(/`[^`\n]+`/g, '')
    expect(semCodigo).not.toMatch(/<\/?[a-z][\w-]*(\s[^<>]*)?\/?>/i)
  })

  it('todo link é https:// ou mailto:; os do site levam a uma página de PAGINAS_DO_SITE, com âncora que existe nela', () => {
    const links = [...COMPLETO.matchAll(LINK)].map(([, url]) => url)
    expect(links.length).toBeGreaterThan(10)
    for (const url of links) expect(url).toMatch(/^(https:\/\/|mailto:)/)
    const doSite = links.filter((url) => url.startsWith(`${SITE_DE_PRODUCAO}/`))
    expect(doSite).toEqual(
      expect.arrayContaining([
        `${SITE_DE_PRODUCAO}/#extensao`,
        `${SITE_DE_PRODUCAO}/privacidade`,
        `${SITE_DE_PRODUCAO}/termos`,
      ]),
    )
    const caminhos = PAGINAS_DO_SITE.map(({ caminho }) => caminho)
    for (const url of doSite) {
      const { pathname, hash } = new URL(url)
      if (pathname === '/llms.txt' || pathname === '/llms-full.txt') continue
      expect(caminhos).toContain(pathname)
      if (hash)
        expect(
          renderizar(pathname).querySelector(`[id="${hash.slice(1)}"]`),
        ).not.toBeNull()
    }
  })

  // Os e-mails da pessoa do exemplo são fictícios: aparecem na home e são conferidos contra ela.
  it('e-mail real só o de suporte; o outro é o da pessoa do exemplo, na home', () => {
    expect([...new Set(COMPLETO.match(EMAIL))].sort()).toEqual(
      ['help@pilutech.com.br', PESSOA_DO_EXEMPLO.email.endereco].sort(),
    )
    expect(trechoDa('/')).toContain(PESSOA_DO_EXEMPLO.email.endereco)
    expect(COMPLETO).not.toMatch(/@gmail/i)
  })

  it('SITE_URL troca a origem das URLs e dos links do site', () => {
    const texto = llmsFullTxt(
      urlDoSite({ SITE_URL: 'https://preview.exemplo.dev/qualquer' }),
      ARVORES,
    )
    expect(texto).not.toContain(SITE_DE_PRODUCAO)
    expect(texto).toContain(
      'Índice das páginas: https://preview.exemplo.dev/llms.txt',
    )
    expect(texto).toContain('URL: https://preview.exemplo.dev/termos')
    expect(texto).toContain('(https://preview.exemplo.dev/#extensao)')
  })

  it('sem a árvore de uma página, ou com uma página fora de PAGINAS_DO_SITE: erro', () => {
    const semTermos = Object.fromEntries(
      Object.entries(ARVORES).filter(([caminho]) => caminho !== '/termos'),
    )
    expect(() => llmsFullTxt(SITE_DE_PRODUCAO, semTermos)).toThrow(
      'não recebeu a página /termos',
    )
    expect(() =>
      llmsFullTxt(SITE_DE_PRODUCAO, {
        ...ARVORES,
        '/outra': createElement('main'),
      }),
    ).toThrow('fora de PAGINAS_DO_SITE: /outra')
  })
})
