import { cn } from '@piluvitu/ui/cn'
import { CAPTURAS } from '@/lib/capturas'
import { REQUISITOS_DA_EXTENSAO } from '@/lib/extensao'
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
          <p className="text-muted-foreground text-[17px] leading-[1.55] text-pretty">
            Um atalho preenche a página inteira. O botão direito põe um dado num
            campo só. A mesma pessoa fica guardada até você pedir outra. Até 3
            pessoas favoritas, cada uma com um apelido, voltam pelo popup ou
            pelo botão direito. O cartão de teste das próximas pessoas sai da
            Stripe ou da Pagar.me, no cenário que você escolher.
          </p>
          <BotoesLoja lojas={lojas} />
          <p className="text-muted-foreground font-mono text-[12.5px] leading-[1.6]">
            {REQUISITOS_DA_EXTENSAO}
          </p>
          <TabelaAtalhos />
        </div>
        <figure className="flex min-w-0 flex-col gap-3">
          <div className={cn(CARTAO, 'overflow-hidden')}>
            <ImagemPorTema
              variantes={CAPTURAS[0].variantes}
              sizes="(min-width: 1264px) 572px, (min-width: 900px) calc(48vw - 32px), calc(100vw - 32px)"
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
