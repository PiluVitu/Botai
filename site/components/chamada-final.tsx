import { cn } from '@piluvitu/ui/cn'
import { CARTAO } from './cartao'
import { Marca } from './marca'
import { TITULO_DE_SECAO } from './secao'

export function ChamadaFinal() {
  return (
    <section
      aria-labelledby="final-titulo"
      className={cn(
        CARTAO,
        'mt-[clamp(80px,11vw,140px)] flex flex-col items-center gap-[22px] rounded-[32px] px-[clamp(20px,4vw,48px)] py-[clamp(40px,6vw,72px)] text-center',
      )}
    >
      <Marca tamanho={56} />
      <h2 id="final-titulo" className={cn(TITULO_DE_SECAO, 'text-balance')}>
        Botaí no seu teste.
      </h2>
      <p data-esqueleto className="text-muted-foreground font-mono text-xs">
        Em construção: chamada final (grupo 4)
      </p>
    </section>
  )
}
