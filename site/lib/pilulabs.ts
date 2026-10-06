// Cópia das regras de loja de @piluvitu/tools/pilulabs (monorepo PiluVitu-Dev), que o card da PiluLabs usa: mude os dois.
export type Loja = 'chrome' | 'firefox' | 'edge' | 'opera'
export type Fase = 'em-breve' | 'disponivel'
export type UrlsDasLojas = {
  chromeUrl: string
  firefoxUrl: string
  edgeUrl: string
  operaUrl: string
}
export type LojaPublicada = { loja: Loja; url: string }

export const LOJAS: readonly Loja[] = ['chrome', 'firefox', 'edge', 'opera']

const HOST_DA_LOJA: Record<Loja, string> = {
  chrome: 'chromewebstore.google.com',
  firefox: 'addons.mozilla.org',
  edge: 'microsoftedge.microsoft.com',
  opera: 'addons.opera.com',
}

const CAMPO_DA_LOJA = {
  chrome: 'chromeUrl',
  firefox: 'firefoxUrl',
  edge: 'edgeUrl',
  opera: 'operaUrl',
} as const satisfies Record<Loja, keyof UrlsDasLojas>

function urlOuNulo(valor: string): URL | null {
  try {
    return new URL(valor)
  } catch {
    return null
  }
}

export function ehHttps(valor: string): boolean {
  return urlOuNulo(valor.trim())?.protocol === 'https:'
}

export function ehUrlDaLoja(loja: Loja, valor: string): boolean {
  const url = urlOuNulo(valor.trim())
  return url?.protocol === 'https:' && url.hostname === HOST_DA_LOJA[loja]
}

export function lojasPublicadas(urls: UrlsDasLojas): LojaPublicada[] {
  return LOJAS.flatMap((loja) => {
    const url = urls[CAMPO_DA_LOJA[loja]].trim()
    return ehUrlDaLoja(loja, url) ? [{ loja, url }] : []
  })
}

export function fase(urls: UrlsDasLojas): Fase {
  return lojasPublicadas(urls).length > 0 ? 'disponivel' : 'em-breve'
}

function textoOuVazio(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

export function urlsDasLojas(item: unknown): UrlsDasLojas {
  const campos =
    typeof item === 'object' && item !== null
      ? (item as Record<string, unknown>)
      : {}
  return {
    chromeUrl: textoOuVazio(campos.chromeUrl),
    firefoxUrl: textoOuVazio(campos.firefoxUrl),
    edgeUrl: textoOuVazio(campos.edgeUrl),
    operaUrl: textoOuVazio(campos.operaUrl),
  }
}
