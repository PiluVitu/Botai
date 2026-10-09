import { cn } from '@piluvitu/ui/cn'
import type { ReactNode } from 'react'
import type { AncoraDaLanding } from '@/lib/conteudo'

export const ESPACO_DE_SECAO = 'mt-[clamp(80px,11vw,140px)] flex flex-col gap-7'
export const TITULO_DE_SECAO =
  'text-[clamp(32px,4.4vw,52px)] leading-[1.05] font-extrabold tracking-[-0.035em]'

type SobrelinhaProps = { numero: number; rotulo: string }

export function Sobrelinha({ numero, rotulo }: SobrelinhaProps) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-muted-foreground font-mono text-xs font-semibold tracking-[0.2em] uppercase">
        {rotulo}
      </p>
      <span className="text-primary font-mono text-xs">
        {String(numero).padStart(2, '0')}
      </span>
      <span aria-hidden className="bg-border h-px flex-1" />
    </div>
  )
}

type SecaoProps = SobrelinhaProps & {
  id?: AncoraDaLanding
  tituloId: string
  titulo: ReactNode
  apoio?: ReactNode
  className?: string
  tituloClassName?: string
  children?: ReactNode
}

export function Secao({
  id,
  tituloId,
  numero,
  rotulo,
  titulo,
  apoio,
  className,
  tituloClassName,
  children,
}: SecaoProps) {
  return (
    <section
      id={id}
      aria-labelledby={tituloId}
      className={cn(ESPACO_DE_SECAO, id && 'scroll-mt-6', className)}
    >
      <Sobrelinha numero={numero} rotulo={rotulo} />
      <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
        <h2 id={tituloId} className={cn(TITULO_DE_SECAO, tituloClassName)}>
          {titulo}
        </h2>
        {apoio ? (
          <p className="text-muted-foreground max-w-[520px] text-[17px] leading-[1.55] text-pretty">
            {apoio}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}
