import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@piluvitu/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import {
  Fragment,
  isValidElement,
  type JSXElementConstructor,
  type ReactElement,
  type ReactNode,
} from 'react'
import { BotaoCopiar } from '@/components/botao-copiar'
import { BotaoTema } from '@/components/botao-tema'
import { LinhaDeComando } from '@/components/linha-de-comando'
import { MenuSecoes } from '@/components/menu-secoes'
import { TeclaLocal } from '@/components/tecla-local'
import { urlAbsoluta } from './site'

export type OpcoesDoMarkdown = {
  siteUrl: string
  caminho?: string
  rebaixar?: number
}

type Contexto = Required<OpcoesDoMarkdown>
type Props = Record<string, unknown>
type Texto = { tipo: 'texto'; texto: string }
type Elemento = { tipo: 'elemento'; tag: string; props: Props; filhos: No[] }
type No = Texto | Elemento
type Bloco = { texto: string; tipo: 'paragrafo' | 'lista' | 'outro' }

type Regra = (props: never) => ReactNode

const regra = <P,>(
  componente: JSXElementConstructor<P>,
  converter: (props: P) => ReactNode,
): [unknown, Regra] => [componente, converter]

const nada = () => null

const REGRAS = new Map<unknown, Regra>([
  regra(BotaoCopiar, nada),
  regra(BotaoTema, nada),
  regra(MenuSecoes, nada),
  regra(TeclaLocal, nada),
  regra(Image, nada),
  regra(FontAwesomeIcon, nada),
  regra(Link, ({ href, children }) => {
    if (typeof href !== 'string')
      throw new Error(
        'O llms-full.txt só converte o Link com href em texto (caminho ou URL).',
      )
    return <a href={href}>{children}</a>
  }),
  regra(LinhaDeComando, ({ linhas }) => <pre>{linhas.join('\n')}</pre>),
  regra(Button, ({ asChild, children }) => (asChild ? children : null)),
])

const REFERENCIA_DE_CLIENTE = Symbol.for('react.client.reference')

const DESCARTADOS = new Set([
  'button',
  'img',
  'svg',
  'input',
  'select',
  'textarea',
  'script',
  'style',
  'noscript',
])
const CONTEINERES = new Set([
  'main',
  'div',
  'section',
  'article',
  'header',
  'footer',
  'nav',
  'figcaption',
  'aside',
  'form',
  'fieldset',
  'label',
])
const BLOCOS = new Set([
  ...CONTEINERES,
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'ul',
  'ol',
  'table',
  'dl',
  'pre',
  'blockquote',
  'figure',
])
const ESTRUTURA = new Set([
  'li',
  'dt',
  'dd',
  'caption',
  'colgroup',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
])

const PONTUACAO_NO_INICIO = /^[\s.,;:!?)\]…]/

function nomeDe(tipo: unknown): string {
  if (typeof tipo === 'string') return `<${tipo}>`
  if (typeof tipo !== 'function' && (typeof tipo !== 'object' || !tipo))
    return String(tipo)
  // A referência de cliente (o componente 'use client' visto do route handler) só deixa ler $$typeof, $$id e name.
  const referencia = tipo as { $$typeof?: unknown; $$id?: unknown }
  if (referencia.$$typeof === REFERENCIA_DE_CLIENTE)
    return (
      String(referencia.$$id ?? '')
        .split('#')
        .pop() || 'anônimo'
    )
  const componente = tipo as {
    displayName?: unknown
    name?: unknown
    render?: { displayName?: unknown; name?: unknown }
    type?: unknown
  }
  for (const nome of [
    componente.displayName,
    componente.name,
    componente.render?.displayName,
    componente.render?.name,
  ])
    if (typeof nome === 'string' && nome) return nome
  return componente.type ? nomeDe(componente.type) : 'anônimo'
}

function semRegra(tipo: unknown, motivo: string): Error {
  return new Error(
    `O llms-full.txt não converte o componente "${nomeDe(tipo)}" (${motivo}): ponha uma regra para ele na tabela de site/lib/markdown.tsx.`,
  )
}

function renderizar(elemento: ReactElement): ReactNode {
  const { type: tipo } = elemento
  const props = elemento.props as Props
  if (tipo === Fragment) return props.children as ReactNode
  const regraDoTipo = REGRAS.get(tipo)
  if (regraDoTipo) return regraDoTipo(props as never)
  if ((tipo as { $$typeof?: unknown }).$$typeof === REFERENCIA_DE_CLIENTE)
    throw semRegra(tipo, 'é um componente de cliente')
  if (typeof tipo !== 'function')
    throw semRegra(tipo, 'é forwardRef, memo, lazy ou outro objeto do React')
  if (
    (tipo as { prototype?: { isReactComponent?: unknown } }).prototype
      ?.isReactComponent
  )
    throw semRegra(tipo, 'é um componente de classe')
  let saida: unknown
  try {
    saida = (tipo as (props: Props) => unknown)(props)
  } catch (erro) {
    throw new Error(
      `O llms-full.txt não conseguiu chamar o componente "${nomeDe(tipo)}" (${erro instanceof Error ? erro.message : String(erro)}): se ele usa hook, ponha uma regra para ele na tabela de site/lib/markdown.tsx.`,
      { cause: erro },
    )
  }
  if (typeof (saida as { then?: unknown } | null)?.then === 'function')
    throw semRegra(tipo, 'é assíncrono')
  return saida as ReactNode
}

function descartado(tag: string, props: Props): boolean {
  const oculto = props['aria-hidden']
  return (
    DESCARTADOS.has(tag) ||
    oculto === true ||
    oculto === 'true' ||
    (props.hidden !== undefined && props.hidden !== false)
  )
}

function noDesconhecido(no: unknown): Error {
  return new Error(
    `O llms-full.txt não sabe converter este nó da árvore: ${Object.prototype.toString.call(no)}.`,
  )
}

function ehFolha(no: unknown): boolean {
  return (
    no === null ||
    no === undefined ||
    ['boolean', 'string', 'number', 'bigint'].includes(typeof no)
  )
}

function acharMain(no: ReactNode): ReactElement<Props> | undefined {
  if (ehFolha(no)) return undefined
  if (!isValidElement(no)) {
    if (typeof no === 'object' && no !== null && Symbol.iterator in no) {
      for (const filho of no as Iterable<ReactNode>) {
        const achado = acharMain(filho)
        if (achado) return achado
      }
      return undefined
    }
    throw noDesconhecido(no)
  }
  const props = no.props as Props
  if (typeof no.type !== 'string') return acharMain(renderizar(no))
  if (descartado(no.type, props)) return undefined
  if (no.type === 'main') return no as ReactElement<Props>
  return acharMain(props.children as ReactNode)
}

function expandir(no: ReactNode): No[] {
  if (no === null || no === undefined || typeof no === 'boolean') return []
  if (
    typeof no === 'string' ||
    typeof no === 'number' ||
    typeof no === 'bigint'
  )
    return [{ tipo: 'texto', texto: String(no) }]
  if (!isValidElement(no)) {
    if (typeof no === 'object' && Symbol.iterator in no)
      return [...(no as Iterable<ReactNode>)].flatMap(expandir)
    throw noDesconhecido(no)
  }
  if (typeof no.type !== 'string') return expandir(renderizar(no))
  const props = no.props as Props
  if (descartado(no.type, props)) return []
  if (props.dangerouslySetInnerHTML !== undefined)
    throw new Error(
      `O llms-full.txt não lê o dangerouslySetInnerHTML de <${no.type}>.`,
    )
  return [
    {
      tipo: 'elemento',
      tag: no.type,
      props,
      filhos: expandir(props.children as ReactNode),
    },
  ]
}

function elementoDesconhecido(tag: string, onde: string): Error {
  return new Error(
    `O llms-full.txt não sabe converter <${tag}> ${onde}: ponha a regra em site/lib/markdown.tsx.`,
  )
}

function elementosDe(pai: Elemento, tags: readonly string[]): Elemento[] {
  return pai.filhos.flatMap((filho) => {
    if (filho.tipo === 'texto') {
      if (filho.texto.trim())
        throw new Error(
          `O llms-full.txt não sabe onde pôr o texto "${filho.texto.trim()}", solto dentro de <${pai.tag}>.`,
        )
      return []
    }
    if (!tags.includes(filho.tag))
      throw elementoDesconhecido(filho.tag, `dentro de <${pai.tag}>`)
    return [filho]
  })
}

function textoCru(nos: readonly No[]): string {
  return nos
    .map((no) =>
      no.tipo === 'texto'
        ? no.texto
        : no.tag === 'br'
          ? '\n'
          : textoCru(no.filhos),
    )
    .join('')
}

function cercar(texto: string, montar: (conteudo: string) => string): string {
  const conteudo = texto.trim()
  if (!conteudo) return texto ? ' ' : ''
  return `${/^\s/.test(texto) ? ' ' : ''}${montar(conteudo)}${/\s$/.test(texto) ? ' ' : ''}`
}

function maiorSequencia(texto: string, caractere: string): number {
  return Math.max(
    0,
    ...Array.from(
      texto.matchAll(new RegExp(`${caractere}+`, 'g')),
      ([sequencia]) => sequencia.length,
    ),
  )
}

function codigoEmLinha(texto: string): string {
  return cercar(texto.replace(/\s+/g, ' '), (conteudo) => {
    const maior = maiorSequencia(conteudo, '`')
    const crases = '`'.repeat(maior + 1)
    const folga = maior > 0 ? ' ' : ''
    return `${crases}${folga}${conteudo}${folga}${crases}`
  })
}

function urlDoLink(href: string, ctx: Contexto): string {
  if (/^(https?:|mailto:)/i.test(href)) return href
  if (href.startsWith('#'))
    return new URL(href, urlAbsoluta(ctx.caminho, ctx.siteUrl)).href
  if (href.startsWith('/') && !href.startsWith('//'))
    return urlAbsoluta(href, ctx.siteUrl)
  throw new Error(
    `O llms-full.txt só aceita link https:, http:, mailto:, "/" ou "#": "${href}".`,
  )
}

function link(elemento: Elemento, ctx: Contexto): string {
  const { href } = elemento.props
  if (typeof href !== 'string')
    throw new Error('O llms-full.txt não converte <a> sem href em texto.')
  const url = urlDoLink(href, ctx).replace(
    /[\s()]/g,
    (caractere) =>
      `%${caractere.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`,
  )
  const rotulo = elemento.props['aria-label']
  const texto =
    emLinha(elemento.filhos, ctx).replace(/\s*\n\s*/g, ' ') ||
    (typeof rotulo === 'string' ? rotulo : '')
  if (!texto.trim())
    throw new Error(
      `O link para "${href}" não tem texto nem aria-label para o llms-full.txt.`,
    )
  return cercar(texto, (conteudo) => `[${conteudo}](${url})`)
}

function elementoEmLinha(elemento: Elemento, ctx: Contexto): string {
  switch (elemento.tag) {
    case 'strong':
      return cercar(emLinha(elemento.filhos, ctx), (c) => `**${c}**`)
    case 'em':
      return cercar(emLinha(elemento.filhos, ctx), (c) => `*${c}*`)
    case 'code':
    case 'kbd':
      return codigoEmLinha(textoDoCodigo(elemento.filhos))
    case 'a':
      return link(elemento, ctx)
    case 'br':
      return '\n'
    case 'time':
    case 'span':
    case 'small':
    case 'abbr':
      return emLinha(elemento.filhos, ctx)
  }
  if (BLOCOS.has(elemento.tag)) return ` ${emLinha(elemento.filhos, ctx)} `
  throw elementoDesconhecido(elemento.tag, 'no meio do texto')
}

function juntar(nos: readonly No[], pedacoDe: (no: No) => string): string {
  let saida = ''
  let anteriorEraElemento = false
  for (const no of nos) {
    const pedaco = pedacoDe(no)
    if (pedaco === '') continue
    const ehElemento = no.tipo === 'elemento'
    if (
      ehElemento &&
      anteriorEraElemento &&
      /\S$/.test(saida) &&
      !PONTUACAO_NO_INICIO.test(pedaco)
    )
      saida += ' '
    saida += pedaco
    anteriorEraElemento = ehElemento
  }
  return saida
}

function textoDoCodigo(nos: readonly No[]): string {
  return juntar(nos, (no) =>
    no.tipo === 'texto'
      ? no.texto
      : no.tag === 'br'
        ? '\n'
        : textoDoCodigo(no.filhos),
  )
}

function emLinha(nos: readonly No[], ctx: Contexto): string {
  return juntar(nos, (no) =>
    no.tipo === 'texto'
      ? no.texto.replace(/\s+/g, ' ')
      : elementoEmLinha(no, ctx),
  )
    .replace(/ {2,}/g, ' ')
    .replace(/ *\n */g, '\n')
}

function umaLinha(nos: readonly No[], ctx: Contexto): string {
  return emLinha(nos, ctx)
    .replace(/\s*\n\s*/g, ' ')
    .trim()
}

function paragrafo(nos: readonly No[], ctx: Contexto): Bloco[] {
  const texto = emLinha(nos, ctx)
    .split('\n')
    .map((linha) => linha.trim())
    .filter(Boolean)
    .join('\n')
  return texto ? [{ texto, tipo: 'paragrafo' }] : []
}

function titulo(elemento: Elemento, ctx: Contexto): Bloco[] {
  const texto = umaLinha(elemento.filhos, ctx)
  const nivel = Math.min(6, Number(elemento.tag[1]) + ctx.rebaixar)
  return texto
    ? [{ texto: `${'#'.repeat(nivel)} ${texto}`, tipo: 'outro' }]
    : []
}

function lista(elemento: Elemento, ctx: Contexto): Bloco[] {
  const ordenada = elemento.tag === 'ol'
  const inicio =
    typeof elemento.props.start === 'number' ? elemento.props.start : 1
  const itens = elementosDe(elemento, ['li'])
    .map((item) => blocos(item.filhos, ctx))
    .filter((blocosDoItem) => blocosDoItem.length > 0)
  if (itens.length === 0) return []
  const junta = itens.every(
    ([primeiro, ...resto]) =>
      primeiro.tipo === 'paragrafo' &&
      resto.length <= 1 &&
      resto.every((bloco) => bloco.tipo === 'lista'),
  )
  const separador = junta ? '\n' : '\n\n'
  const texto = itens
    .map((blocosDoItem, indice) => {
      const marcador = ordenada ? `${inicio + indice}. ` : '- '
      const recuo = ' '.repeat(marcador.length)
      return blocosDoItem
        .map((bloco) => bloco.texto)
        .join(separador)
        .split('\n')
        .map((linha, posicao) =>
          posicao === 0 ? marcador + linha : linha && recuo + linha,
        )
        .join('\n')
    })
    .join(separador)
  return [{ texto, tipo: 'lista' }]
}

function tabela(elemento: Elemento, ctx: Contexto): Bloco[] {
  const legenda: Bloco[] = []
  const cabecalho: Elemento[] = []
  const corpo: Elemento[] = []
  for (const filho of elementosDe(elemento, [
    'caption',
    'colgroup',
    'thead',
    'tbody',
    'tfoot',
    'tr',
  ])) {
    if (filho.tag === 'caption') legenda.push(...blocos(filho.filhos, ctx))
    else if (filho.tag === 'tr') corpo.push(filho)
    else if (filho.tag === 'thead')
      cabecalho.push(...elementosDe(filho, ['tr']))
    else if (filho.tag !== 'colgroup') corpo.push(...elementosDe(filho, ['tr']))
  }
  const linhas = [...cabecalho, ...corpo].map((linha) =>
    elementosDe(linha, ['th', 'td']).map((celula) =>
      umaLinha(celula.filhos, ctx).replace(/\|/g, '\\|'),
    ),
  )
  if (linhas.length === 0) return legenda
  const colunas = Math.max(...linhas.map((celulas) => celulas.length))
  const montar = (celulas: readonly string[]) =>
    `|${Array.from({ length: colunas }, (_, i) => (celulas[i] ? ` ${celulas[i]} ` : ' ')).join('|')}|`
  const [primeira, ...resto] = linhas
  return [
    ...legenda,
    {
      texto: [
        montar(primeira),
        montar(Array<string>(colunas).fill('---')),
        ...resto.map(montar),
      ].join('\n'),
      tipo: 'outro',
    },
  ]
}

function definicoes(elemento: Elemento, ctx: Contexto): Bloco[] {
  const pares: { termo: string; definicoes: string[] }[] = []
  const visitar = (pai: Elemento) => {
    for (const filho of elementosDe(pai, ['dt', 'dd', 'div'])) {
      if (filho.tag === 'div') {
        visitar(filho)
        continue
      }
      const texto = umaLinha(filho.filhos, ctx)
      const ultimo = pares[pares.length - 1]
      if (filho.tag === 'dt') pares.push({ termo: texto, definicoes: [] })
      else if (ultimo) ultimo.definicoes.push(texto)
      else pares.push({ termo: '', definicoes: [texto] })
    }
  }
  visitar(elemento)
  const linhas = pares.flatMap(({ termo, definicoes: dds }) => {
    const definicao = dds.filter(Boolean).join(' ')
    if (!termo) return definicao ? [`- ${definicao}`] : []
    const rotulo = termo.replace(/:$/, '')
    return [definicao ? `- **${rotulo}:** ${definicao}` : `- **${rotulo}**`]
  })
  return linhas.length > 0 ? [{ texto: linhas.join('\n'), tipo: 'lista' }] : []
}

function codigo(elemento: Elemento): Bloco[] {
  const texto = textoCru(elemento.filhos)
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((linha) => linha.trimEnd())
    .join('\n')
    .replace(/^\n+|\n+$/g, '')
  if (!texto.trim()) return []
  const cerca = '`'.repeat(Math.max(3, maiorSequencia(texto, '`') + 1))
  return [{ texto: `${cerca}\n${texto}\n${cerca}`, tipo: 'outro' }]
}

function citacao(elemento: Elemento, ctx: Contexto): Bloco[] {
  const texto = blocos(elemento.filhos, ctx)
    .map((bloco) => bloco.texto)
    .join('\n\n')
  if (!texto) return []
  return [
    {
      texto: texto
        .split('\n')
        .map((linha) => (linha ? `> ${linha}` : '>'))
        .join('\n'),
      tipo: 'outro',
    },
  ]
}

function bloco(elemento: Elemento, ctx: Contexto): Bloco[] {
  const { tag, filhos } = elemento
  if (/^h[1-6]$/.test(tag)) return titulo(elemento, ctx)
  if (CONTEINERES.has(tag)) return blocos(filhos, ctx)
  switch (tag) {
    case 'p':
      return paragrafo(filhos, ctx)
    case 'ul':
    case 'ol':
      return lista(elemento, ctx)
    case 'table':
      return tabela(elemento, ctx)
    case 'dl':
      return definicoes(elemento, ctx)
    case 'pre':
      return codigo(elemento)
    case 'blockquote':
      return citacao(elemento, ctx)
    case 'figure':
      return filhos
        .filter(
          (filho): filho is Elemento =>
            filho.tipo === 'elemento' && filho.tag === 'figcaption',
        )
        .flatMap((legenda) => blocos(legenda.filhos, ctx))
  }
  throw elementoDesconhecido(tag, 'fora do lugar')
}

const OUTRO_MARCADOR: Record<string, string> = {
  '-': '*',
  '*': '-',
  '.': ')',
  ')': '.',
}

function marcadorDa(lista: string): string | undefined {
  const [, simbolo, delimitador] = /^(?:([-*])|\d+([.)])) /.exec(lista) ?? []
  return simbolo ?? delimitador
}

function semGrudarNaAnterior(anterior: Bloco | undefined, novo: Bloco): Bloco {
  if (anterior?.tipo !== 'lista' || novo.tipo !== 'lista') return novo
  const marcador = marcadorDa(novo.texto)
  if (!marcador || marcador !== marcadorDa(anterior.texto)) return novo
  const outro = OUTRO_MARCADOR[marcador]
  const texto =
    marcador === '-' || marcador === '*'
      ? novo.texto.replace(/^[-*] /gm, `${outro} `)
      : novo.texto.replace(/^(\d+)[.)] /gm, `$1${outro} `)
  return { ...novo, texto }
}

function blocos(nos: readonly No[], ctx: Contexto): Bloco[] {
  const saida: Bloco[] = []
  const acrescentar = (novos: readonly Bloco[]) => {
    for (const novo of novos)
      saida.push(semGrudarNaAnterior(saida[saida.length - 1], novo))
  }
  let corrida: No[] = []
  const fecharParagrafo = () => {
    acrescentar(paragrafo(corrida, ctx))
    corrida = []
  }
  for (const no of nos) {
    if (
      no.tipo === 'elemento' &&
      (BLOCOS.has(no.tag) || ESTRUTURA.has(no.tag))
    ) {
      fecharParagrafo()
      acrescentar(bloco(no, ctx))
    } else corrida.push(no)
  }
  fecharParagrafo()
  return saida
}

export function markdownDoMain(
  arvore: ReactNode,
  { siteUrl, caminho = '/', rebaixar = 0 }: OpcoesDoMarkdown,
): string {
  const main = acharMain(arvore)
  if (!main)
    throw new Error(
      'A página não tem <main>: o llms-full.txt converte só o conteúdo dele.',
    )
  return blocos(expandir(main.props.children as ReactNode), {
    siteUrl,
    caminho,
    rebaixar,
  })
    .map(({ texto }) => texto)
    .join('\n\n')
    .split('\n')
    .map((linha) => linha.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
