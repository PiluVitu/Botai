import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ITEM = /^- \[[^\]]+\]\((\S+)\)(?:: \S.*)?$/
const EMAIL = /[\w.+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}\b/gi
const EMAIL_PUBLICO = 'help@pilutech.com.br'
const URL_LOCAL =
  /[a-z][a-z0-9+.-]*:\/\/(?:[\w-]+\.)*(?:localhost|127\.0\.0\.1|0\.0\.0\.0)\b\S*/gi

function decodificarEntidades(texto) {
  return texto
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function terminaComUmaQuebra(texto, nome) {
  return texto.endsWith('\n') && !texto.endsWith('\n\n')
    ? []
    : [`${nome}: precisa terminar com exatamente uma quebra de linha`]
}

export function conferirLlmsTxt(texto) {
  const erros = terminaComUmaQuebra(texto, 'llms.txt')
  const linhas = texto.replace(/\n+$/, '').split('\n')
  if (!/^# \S/.test(linhas[0] ?? ''))
    erros.push('llms.txt: a linha 1 precisa ser "# Nome"')
  if (linhas[1] !== '' || !/^> \S/.test(linhas[2] ?? '') || linhas[3] !== '')
    erros.push('llms.txt: falta o "> resumo" entre linhas em branco')
  if (!linhas[4] || /^[#>-]/.test(linhas[4]))
    erros.push('llms.txt: falta o parágrafo depois do resumo')
  let i = 4
  while (i < linhas.length && linhas[i] !== '') i++
  let secoes = 0
  while (i < linhas.length) {
    if (!/^## \S/.test(linhas[i + 1] ?? '') || linhas[i + 2] !== '') {
      erros.push(
        `llms.txt: a linha ${i + 2} precisa ser "## Seção" entre linhas em branco`,
      )
      break
    }
    secoes++
    i += 3
    const primeiroItem = i
    for (; i < linhas.length && linhas[i] !== ''; i++) {
      const item = ITEM.exec(linhas[i])
      if (!item)
        erros.push(
          `llms.txt: a linha ${i + 1} não é "- [Título](url): descrição": ${linhas[i]}`,
        )
      else if (!item[1].startsWith('https://'))
        erros.push(`llms.txt: link sem https na linha ${i + 1}: ${item[1]}`)
    }
    if (i === primeiroItem)
      erros.push(`llms.txt: a seção da linha ${primeiroItem - 1} está vazia`)
  }
  if (secoes === 0) erros.push('llms.txt: nenhuma seção "## "')
  for (const [url] of texto.matchAll(URL_LOCAL))
    erros.push(`llms.txt: URL local: ${url}`)
  for (const [email] of texto.matchAll(EMAIL))
    if (email.toLowerCase() !== EMAIL_PUBLICO)
      erros.push(`llms.txt: e-mail que não é o público: ${email}`)
  return erros
}

export function conferirLlmsFull(texto, raiz) {
  const erros = terminaComUmaQuebra(texto, 'llms-full.txt')
  const linhas = texto.replace(/\n+$/, '').split('\n')
  if (
    !/^# \S/.test(linhas[0] ?? '') ||
    linhas[1] !== '' ||
    !/^> \S/.test(linhas[2] ?? '') ||
    linhas[3] !== '' ||
    !(linhas[4] ?? '').includes(`${raiz}llms.txt`) ||
    linhas[5] !== ''
  )
    erros.push(
      'llms-full.txt: o cabeçalho precisa ser "# Nome", "> resumo" e a linha com o link do llms.txt, separados por linha em branco',
    )
  const paginas = linhas.flatMap((linha, i) =>
    linha.startsWith('URL: ') ? [i] : [],
  )
  if (paginas.length === 0) erros.push('llms-full.txt: nenhuma página')
  if (paginas[0] !== undefined && paginas[0] !== 8)
    erros.push(
      'llms-full.txt: a primeira página não vem logo depois do cabeçalho',
    )
  for (const i of paginas) {
    if (
      linhas[i - 3] !== '' ||
      !/^# \S/.test(linhas[i - 2] ?? '') ||
      linhas[i - 1] !== '' ||
      linhas[i + 1] !== ''
    )
      erros.push(
        `llms-full.txt: a linha ${i + 1} precisa vir depois de "# Título" e de uma linha em branco, e antes de outra`,
      )
    if (!linhas[i].startsWith(`URL: ${raiz}`))
      erros.push(`llms-full.txt: URL de fora do site na linha ${i + 1}`)
  }
  linhas.forEach((linha, i) => {
    if (/\]\((?![a-z][a-z0-9+.-]*:)[^)\s]*\.mdx?(?:#[^)\s]*)?\)/i.test(linha))
      erros.push(`llms-full.txt: link relativo na linha ${i + 1}: ${linha}`)
    if (/^#{1,6} .*\{#[^}\s]+\}\s*$/.test(linha))
      erros.push(`llms-full.txt: título com {#id} na linha ${i + 1}`)
    if (/^\s*(?:`{3,}|~{3,}).*(?:^|[\s`~])testar(?:=\d+)?(?:\s|$)/.test(linha))
      erros.push(`llms-full.txt: bloco com "testar" na linha ${i + 1}`)
  })
  return erros
}

export function linksDoSite(texto, raiz) {
  const padrao = new RegExp(`${escaparRegex(raiz)}[^\\s)\\]>"'\`]*`, 'g')
  return [
    ...new Set(
      [...texto.matchAll(padrao)].map(([url]) => url.replace(/[.,;:!?]+$/, '')),
    ),
  ]
}

export function arquivoDaUrl(url, pasta, raiz) {
  const caminho = decodeURIComponent(new URL(url).pathname).slice(
    new URL(raiz).pathname.length,
  )
  const candidatos = /\.[a-z0-9]+$/i.test(caminho)
    ? [caminho]
    : [join(caminho, 'index.html'), `${caminho.replace(/\/$/, '')}.html`]
  return candidatos
    .map((candidato) => join(pasta, candidato))
    .find((arquivo) => existsSync(arquivo) && statSync(arquivo).isFile())
}

function idsDoHtml(html) {
  return new Set(
    [...html.matchAll(/\sid=(["'])(.*?)\1/g)].map(([, , id]) =>
      decodificarEntidades(id),
    ),
  )
}

export function conferirLinks(links, pasta, raiz) {
  const erros = []
  for (const link of links) {
    const arquivo = arquivoDaUrl(link, pasta, raiz)
    if (!arquivo) {
      erros.push(`link sem página no build: ${link}`)
      continue
    }
    const { hash } = new URL(link)
    if (
      hash &&
      !idsDoHtml(readFileSync(arquivo, 'utf8')).has(
        decodeURIComponent(hash.slice(1)),
      )
    )
      erros.push(`âncora que não existe na página: ${link}`)
  }
  return erros
}

function arquivosHtml(pasta) {
  return readdirSync(pasta, { recursive: true })
    .map(String)
    .filter((caminho) => caminho.endsWith('.html'))
    .map((caminho) => caminho.split(sep).join('/'))
}

export function paginasDoBuild(pasta, raiz) {
  return arquivosHtml(pasta)
    .filter((caminho) => caminho !== '404.html')
    .map(
      (caminho) =>
        raiz + caminho.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, ''),
    )
    .sort()
}

export function locsDoSitemap(xml) {
  return [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map(([, loc]) =>
    decodificarEntidades(loc.trim()),
  )
}

export function conferirSitemap(locs, paginas, raiz) {
  const erros = []
  const esperadas = new Set([...paginas, `${raiz}llms.txt`])
  const vistas = new Set()
  for (const loc of locs) {
    if (vistas.has(loc)) erros.push(`sitemap.xml: <loc> repetido: ${loc}`)
    vistas.add(loc)
    if (!esperadas.has(loc))
      erros.push(`sitemap.xml: <loc> sem página no build: ${loc}`)
  }
  for (const esperada of esperadas)
    if (!vistas.has(esperada))
      erros.push(`sitemap.xml: falta a página ${esperada}`)
  return erros
}

function atributos(tag) {
  const resultado = {}
  for (const [, nome, aspas, simples, solto] of tag
    .replace(/^<\w+/, '')
    .matchAll(/([^\s=<>"'/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))
    resultado[nome.toLowerCase()] = decodificarEntidades(
      aspas ?? simples ?? solto ?? '',
    )
  return resultado
}

export function conferirCabecalhos(html, loc) {
  const erros = []
  const tags = (nome) =>
    [...html.matchAll(new RegExp(`<${nome}\\b[^>]*>`, 'gi'))].map(([tag]) =>
      atributos(tag),
    )
  const canonicos = tags('link').filter(({ rel = '' }) =>
    rel.toLowerCase().split(/\s+/).includes('canonical'),
  )
  if (canonicos.length !== 1 || canonicos[0].href !== loc)
    erros.push(
      `${loc}: precisa de um canonical igual ao <loc> (achei ${canonicos.length}: ${canonicos.map(({ href }) => href).join(', ')})`,
    )
  const metas = tags('meta')
  const descricoes = metas.filter(
    ({ name = '' }) => name.toLowerCase() === 'description',
  )
  if (descricoes.length !== 1 || !descricoes[0].content?.trim())
    erros.push(`${loc}: precisa de uma <meta name="description"> não vazia`)
  if (
    metas.some(
      ({ name = '', content = '' }) =>
        ['robots', 'googlebot'].includes(name.toLowerCase()) &&
        /noindex/i.test(content),
    )
  )
    erros.push(`${loc}: está com noindex`)
  return erros
}

export function conferirRobots(texto, raiz) {
  const linhas = texto.split(/\r?\n/).map((linha) => linha.trim())
  return [
    'User-agent: *',
    `Sitemap: ${raiz}sitemap.xml`,
    `# llms.txt: ${raiz}llms.txt`,
  ]
    .filter((linha) => !linhas.includes(linha))
    .map((linha) => `robots.txt: falta a linha "${linha}"`)
}

export function conferirPaginasNoLlms(llms, paginas, raiz) {
  const citadas = new Set(
    linksDoSite(llms, raiz).map((link) => link.replace(/#.*$/, '')),
  )
  return paginas
    .filter((pagina) => !citadas.has(pagina))
    .map((pagina) => `llms.txt: falta a página ${pagina}`)
}

export function conferirBuild(pasta, raiz) {
  const ler = (nome) => {
    const arquivo = join(pasta, nome)
    return existsSync(arquivo) ? readFileSync(arquivo, 'utf8') : null
  }
  const llms = ler('llms.txt')
  const llmsFull = ler('llms-full.txt')
  const sitemap = ler('sitemap.xml')
  const robots = ler('robots.txt')
  const faltando = [
    ['llms.txt', llms],
    ['llms-full.txt', llmsFull],
    ['sitemap.xml', sitemap],
    ['robots.txt', robots],
  ]
    .filter(([, texto]) => texto === null)
    .map(
      ([nome]) => `falta o ${nome} em ${relative(process.cwd(), pasta) || '.'}`,
    )
  if (faltando.length > 0) return { erros: faltando }

  const paginas = paginasDoBuild(pasta, raiz)
  const locs = locsDoSitemap(sitemap)
  const links = linksDoSite(`${llms}\n${llmsFull}`, raiz)
  const erros = [
    ...conferirLlmsTxt(llms),
    ...conferirLlmsFull(llmsFull, raiz),
    ...conferirLinks(links, pasta, raiz),
    ...conferirPaginasNoLlms(llms, paginas, raiz),
    ...conferirSitemap(locs, paginas, raiz),
    ...conferirRobots(robots, raiz),
  ]
  for (const loc of locs) {
    const arquivo = loc.endsWith('.txt') ? null : arquivoDaUrl(loc, pasta, raiz)
    if (arquivo)
      erros.push(...conferirCabecalhos(readFileSync(arquivo, 'utf8'), loc))
  }
  return { erros, paginas: paginas.length, links: links.length }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { default: config } = await import('../docusaurus.config.mjs')
  const pasta =
    process.argv[2] ??
    join(dirname(fileURLToPath(import.meta.url)), '..', 'build')
  const { erros, paginas, links } = conferirBuild(
    pasta,
    config.url + config.baseUrl,
  )
  if (erros.length > 0) {
    console.error(`Build reprovado (${erros.length}):\n- ${erros.join('\n- ')}`)
    process.exit(1)
  }
  console.log(
    `Build conferido: ${paginas} páginas no sitemap.xml com canonical e description, llms.txt e llms-full.txt no formato, ${links} links do site respondendo, robots.txt com o Sitemap e o llms.txt`,
  )
}
