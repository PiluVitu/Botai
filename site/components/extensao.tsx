import { cn } from '@piluvitu/ui/cn'
import { CAPTURAS } from '@/lib/capturas'
import type { BotaoDeLoja } from '@/lib/modelo'
import { BotoesLoja } from './botoes-loja'
import { CARTAO } from './cartao'
import { ImagemPorTema } from './imagem-por-tema'
import { ESPACO_DE_SECAO, Sobrelinha, TITULO_DE_SECAO } from './secao'
import { TabelaAtalhos } from './tabela-atalhos'

export function Extensao({ lojas }: { lojas: BotaoDeLoja[] }) {
  return (
    <section
      id="extensao"
      aria-labelledby="extensao-titulo"
      className={cn(ESPACO_DE_SECAO, 'scroll-mt-6')}
    >
      <Sobrelinha numero={6} rotulo="Extensão" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-start gap-[clamp(28px,4vw,56px)]">
        <div className="flex min-w-0 flex-col gap-[22px]">
          <h2 id="extensao-titulo" className={TITULO_DE_SECAO}>
            Bota aí no navegador.
          </h2>
          <BotoesLoja lojas={lojas} />
          <TabelaAtalhos />
          <p data-esqueleto className="text-muted-foreground font-mono text-xs">
            Em construção: extensão (grupo 4)
          </p>
        </div>
        <figure className="flex min-w-0 flex-col gap-3">
          <div className={cn(CARTAO, 'overflow-hidden')}>
            <ImagemPorTema
              variantes={CAPTURAS[0].variantes}
              sizes="(min-width: 1264px) 572px, calc(100vw - 32px)"
            />
          </div>
          <figcaption className="text-muted-foreground font-mono text-xs">
            O popup mostra quantos campos entraram e lista os que ficaram de
            fora.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
