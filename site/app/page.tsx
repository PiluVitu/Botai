import type { Metadata } from 'next'
import { JsonLd } from '@/components/json-ld'
import { Landing } from '@/components/landing'
import { lerUrlsDasLojas } from '@/lib/lojas'
import { jsonLdDaHome } from '@/lib/json-ld'
import { modeloDaLanding } from '@/lib/modelo'
import { metadataDaPagina, PAGINA_INICIAL } from '@/lib/seo'
import { urlDoSite } from '@/lib/site'

export const metadata: Metadata = metadataDaPagina(PAGINA_INICIAL)

export default function Home() {
  const urls = lerUrlsDasLojas()
  return (
    <>
      <JsonLd dados={jsonLdDaHome(urlDoSite(), urls)} />
      <Landing {...modeloDaLanding(urls)} />
    </>
  )
}
