import type { MetadataRoute } from 'next'
import {
  CAMINHO_DO_LLMS,
  CAMINHO_DO_LLMS_FULL,
  PAGINAS_DO_SITE,
} from '@/lib/seo'
import { urlAbsoluta } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGINAS_DO_SITE.map(({ caminho }) => caminho),
    CAMINHO_DO_LLMS,
    CAMINHO_DO_LLMS_FULL,
  ].map((caminho) => ({ url: urlAbsoluta(caminho) }))
}
