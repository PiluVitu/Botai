import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@piluvitu/ui/cn'
import type { ReactNode } from 'react'
import { CARTAO } from './cartao'

type JanelaExemploProps = {
  id: string
  legenda: string
  icone: IconDefinition
  titulo: string
  detalhe: ReactNode
  children: ReactNode
}

export function JanelaExemplo({
  id,
  legenda,
  icone,
  titulo,
  detalhe,
  children,
}: JanelaExemploProps) {
  const idDaLegenda = `${id}-legenda`
  return (
    <figure
      aria-labelledby={idDaLegenda}
      className={cn(CARTAO, 'min-w-0 overflow-hidden')}
    >
      <figcaption id={idDaLegenda} className="sr-only">
        {legenda}
      </figcaption>
      <div className="border-border text-muted-foreground flex items-center justify-between gap-3 border-b px-[18px] py-3 font-mono text-xs">
        <span className="inline-flex min-w-0 items-center gap-2">
          <FontAwesomeIcon icon={icone} className="text-primary size-3.5" />
          {titulo}
        </span>
        {detalhe}
      </div>
      {children}
    </figure>
  )
}
