import { robotsTxt } from '@/lib/seo'
import { urlDoSite } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  return new Response(robotsTxt(urlDoSite()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
