import { llmsTxt } from '@/lib/llms'
import { lerUrlsDasLojas } from '@/lib/lojas'
import { urlDoSite } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  return new Response(llmsTxt(urlDoSite(), lerUrlsDasLojas()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
