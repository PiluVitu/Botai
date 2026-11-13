import { createElement } from 'react'
import Home from '@/app/page'
import PrivacidadePage from '@/app/privacidade/page'
import TermosPage from '@/app/termos/page'
import { llmsFullTxt } from '@/lib/llms'
import { urlDoSite } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  return new Response(
    llmsFullTxt(urlDoSite(), {
      '/': createElement(Home),
      '/privacidade': createElement(PrivacidadePage),
      '/termos': createElement(TermosPage),
    }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
}
