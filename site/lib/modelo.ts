import {
  LOJAS,
  lojasPublicadas,
  type Loja,
  type UrlsDasLojas,
} from './pilulabs'

export type BotaoDeLoja = { loja: Loja; url: string | null }
export type ModeloDaLanding = { lojas: BotaoDeLoja[] }

const SO_COM_LINK: readonly Loja[] = ['edge']

export function botoesDasLojas(urls: UrlsDasLojas): BotaoDeLoja[] {
  const publicadas = new Map(
    lojasPublicadas(urls).map(({ loja, url }) => [loja, url]),
  )
  return LOJAS.filter(
    (loja) => publicadas.has(loja) || !SO_COM_LINK.includes(loja),
  ).map((loja) => ({ loja, url: publicadas.get(loja) ?? null }))
}

export function modeloDaLanding(urls: UrlsDasLojas): ModeloDaLanding {
  return { lojas: botoesDasLojas(urls) }
}
