import { posix } from 'node:path'

export const TEXTOS = {
  geral: 'Geral',
  mais: 'Mais',
  completa: 'Documentação completa em texto',
  descricaoDaCompleta:
    'O texto das páginas desta documentação num arquivo só, em Markdown, na ordem da barra lateral.',
  site: 'Site do Botaí',
  descricaoDoSite:
    'A página do Botaí, com a extensão nas lojas, a política de privacidade e os termos de uso.',
  indice: 'Índice das páginas:',
}

const ESQUEMA = /^[a-z][a-z0-9+.-]*:/i
const ABERTURA_DE_CERCA = /^(\s*)(`{3,}|~{3,})(.*)$/
const LINK = /\]\(([^\s()\0]+)((?:[ \t]+"[^"\0]*")?)\)/g

export function tirarFrontmatter(markdown) {
  return markdown
    .replace(/\r\n?/g, '\n')
    .replace(/^---\n[\s\S]*?\n---[ \t]*(?:\n|$)/, '')
}

function fechaCerca(linha, cerca) {
  const fechamento = /^\s*(`{3,}|~{3,})\s*$/.exec(linha)
  return (
    fechamento !== null &&
    fechamento[1][0] === cerca[0] &&
    fechamento[1].length >= cerca.length
  )
}

function mascararCodigo(linha) {
  return linha.replace(
    /(`+)(.+?)(?<!`)\1(?!`)/g,
    (trecho, crases) =>
      crases + '\0'.repeat(trecho.length - 2 * crases.length) + crases,
  )
}

export function reescreverLinks(linha, reescrever) {
  const mascarada = mascararCodigo(linha)
  let saida = ''
  let ultimo = 0
  for (const achado of mascarada.matchAll(LINK)) {
    const inicio = achado.index + 2
    saida += linha.slice(ultimo, inicio) + reescrever(achado[1])
    ultimo = inicio + achado[1].length
  }
  return saida + linha.slice(ultimo)
}

export function tirarTestar(info) {
  return info.replace(/(^|[ \t]+)testar(?:=\d+)?(?=[ \t]|$)/g, '').trim()
}

export function tirarIdDeTitulo(linha) {
  return linha.replace(/^(#{1,6}[ \t].*?)[ \t]+\{#[^}\s]+\}[ \t]*$/, '$1')
}

function semLinhasEmBrancoNasPontas(linhas) {
  let inicio = 0
  let fim = linhas.length
  while (inicio < fim && linhas[inicio].trim() === '') inicio++
  while (fim > inicio && linhas[fim - 1].trim() === '') fim--
  return linhas.slice(inicio, fim)
}

export function transformarCorpo(markdown, reescrever) {
  const saida = []
  let cerca = null
  for (const linha of tirarFrontmatter(markdown).split('\n')) {
    if (cerca) {
      if (fechaCerca(linha, cerca)) cerca = null
      saida.push(linha)
      continue
    }
    const abertura = ABERTURA_DE_CERCA.exec(linha)
    if (abertura) {
      const [, recuo, marca, info] = abertura
      cerca = marca
      saida.push(recuo + marca + tirarTestar(info))
      continue
    }
    saida.push(reescreverLinks(tirarIdDeTitulo(linha), reescrever))
  }
  return semLinhasEmBrancoNasPontas(saida).join('\n')
}

export function primeiroParagrafo(markdown, reescrever) {
  const linhas = semLinhasEmBrancoNasPontas(
    tirarFrontmatter(markdown).split('\n'),
  )
  const fim = linhas.findIndex((linha) => linha.trim() === '')
  const bloco = linhas.slice(0, fim === -1 ? linhas.length : fim)
  if (
    bloco.length === 0 ||
    /^(#|:::|`{3}|~{3}|[-*+] |\d+[.)] |>|\||<|import |export )/.test(
      bloco[0].trim(),
    )
  )
    throw new Error(
      'a página raiz (slug /) precisa começar por um parágrafo: ele vira o parágrafo do llms.txt',
    )
  return reescreverLinks(
    bloco.map((linha) => linha.trim()).join(' '),
    reescrever,
  )
}

export function resolverLink(destino, { fonte, urlDaPagina, urlPorFonte }) {
  if (ESQUEMA.test(destino)) return destino
  const corte = destino.indexOf('#')
  const caminho = corte === -1 ? destino : destino.slice(0, corte)
  const ancora = corte === -1 ? '' : destino.slice(corte)
  if (caminho === '') return urlDaPagina + ancora
  if (!caminho.startsWith('/')) {
    const alvo = posix.join(posix.dirname(fonte), decodeURI(caminho))
    const url = urlPorFonte.get(alvo)
    if (url) return url + ancora
  }
  throw new Error(
    `${fonte}: o link "${destino}" não aponta para uma página da documentação`,
  )
}

export function percorrerBarra(barra, docs) {
  const porId = new Map(docs.map((doc) => [doc.id, doc]))
  const emOrdem = []
  const doDoc = (id) => {
    const doc = porId.get(id)
    if (!doc)
      throw new Error(`a barra lateral cita o doc "${id}", que não existe`)
    if (doc.unlisted || doc.draft) return []
    emOrdem.push(doc)
    return [
      {
        titulo: doc.title,
        permalink: doc.permalink,
        descricao: doc.description,
      },
    ]
  }
  const achatar = (categoria) => {
    const { link } = categoria
    const itens = []
    if (link?.type === 'generated-index')
      itens.push({
        titulo: link.title ?? categoria.label,
        permalink: link.permalink,
        descricao: link.description ?? categoria.description,
      })
    if (link?.type === 'doc') itens.push(...doDoc(link.id))
    for (const item of categoria.items) {
      if (item.type === 'doc') itens.push(...doDoc(item.id))
      if (item.type === 'category') itens.push(...achatar(item))
    }
    return itens
  }
  const geral = []
  const pastas = []
  for (const item of barra) {
    if (item.type === 'doc') geral.push(...doDoc(item.id))
    if (item.type === 'category')
      pastas.push({ titulo: item.label, itens: achatar(item) })
  }
  return { geral, pastas, docs: emOrdem }
}

const umaLinha = (texto) => (texto ?? '').replace(/\s+/g, ' ').trim()

export function linhaDoItem({ titulo, url, descricao }) {
  const texto = umaLinha(descricao)
  return `- [${umaLinha(titulo)}](${url})${texto ? `: ${texto}` : ''}`
}

export function montarLlmsTxt({ titulo, resumo, paragrafo, secoes }) {
  const blocos = [`# ${titulo}`, `> ${umaLinha(resumo)}`, paragrafo]
  for (const secao of secoes.filter(({ itens }) => itens.length > 0))
    blocos.push(
      [`## ${secao.titulo}`, '', ...secao.itens.map(linhaDoItem)].join('\n'),
    )
  return blocos.join('\n\n') + '\n'
}

export function montarLlmsFull({ titulo, resumo, urlDoIndice, paginas }) {
  const blocos = [
    `# ${titulo}`,
    `> ${umaLinha(resumo)}`,
    `${TEXTOS.indice} ${urlDoIndice}`,
  ]
  for (const pagina of paginas)
    blocos.push(
      [
        `# ${umaLinha(pagina.titulo)}`,
        `URL: ${pagina.url}`,
        umaLinha(pagina.descricao) && `> ${umaLinha(pagina.descricao)}`,
        pagina.corpo,
      ]
        .filter(Boolean)
        .join('\n\n'),
    )
  return blocos.join('\n\n') + '\n'
}

export function gerarLlms({ siteConfig, versao, lerFonte }) {
  const raiz = siteConfig.url + siteConfig.baseUrl
  const absoluta = (permalink) => siteConfig.url + permalink
  const fonte = (doc) => doc.source.replace(/^@site\//, '')
  const urlPorFonte = new Map(
    versao.docs.map((doc) => [fonte(doc), absoluta(doc.permalink)]),
  )
  const reescreverEm = (doc) => (destino) =>
    resolverLink(destino, {
      fonte: fonte(doc),
      urlDaPagina: absoluta(doc.permalink),
      urlPorFonte,
    })

  const { geral, pastas, docs } = percorrerBarra(
    Object.values(versao.sidebars).flat(),
    versao.docs,
  )
  const foraDaBarra = versao.docs.filter(
    (doc) => !doc.unlisted && !doc.draft && !docs.includes(doc),
  )
  if (foraDaBarra.length > 0)
    throw new Error(
      `doc fora da barra lateral, que ficaria fora do llms.txt: ${foraDaBarra.map(fonte).join(', ')}`,
    )
  const paginaRaiz = docs.find((doc) => doc.permalink === siteConfig.baseUrl)
  if (!paginaRaiz)
    throw new Error('nenhuma página com slug / para o parágrafo do llms.txt')

  const comUrl = (item) => ({ ...item, url: absoluta(item.permalink) })
  const site = siteConfig.themeConfig?.navbar?.items?.find(
    (item) => item.label === 'Site',
  )
  const mais = [
    {
      titulo: TEXTOS.completa,
      url: `${raiz}llms-full.txt`,
      descricao: TEXTOS.descricaoDaCompleta,
    },
    ...(site?.href
      ? [
          {
            titulo: TEXTOS.site,
            url: site.href,
            descricao: TEXTOS.descricaoDoSite,
          },
        ]
      : []),
  ]

  const llms = montarLlmsTxt({
    titulo: siteConfig.title,
    resumo: siteConfig.tagline,
    paragrafo: primeiroParagrafo(
      lerFonte(fonte(paginaRaiz)),
      reescreverEm(paginaRaiz),
    ),
    secoes: [
      { titulo: TEXTOS.geral, itens: geral.map(comUrl) },
      ...pastas.map(({ titulo, itens }) => ({
        titulo,
        itens: itens.map(comUrl),
      })),
      { titulo: TEXTOS.mais, itens: mais },
    ],
  })
  const llmsFull = montarLlmsFull({
    titulo: siteConfig.title,
    resumo: siteConfig.tagline,
    urlDoIndice: `${raiz}llms.txt`,
    paginas: docs.map((doc) => ({
      titulo: doc.title,
      url: absoluta(doc.permalink),
      descricao: doc.description,
      corpo: transformarCorpo(lerFonte(fonte(doc)), reescreverEm(doc)),
    })),
  })
  return { llms, llmsFull }
}
