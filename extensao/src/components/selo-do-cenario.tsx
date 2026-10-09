import {
  faCircleCheck,
  faCircleXmark,
  faClock,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { TipoDoCenario } from '@pilutech/botai-core/cartao'
import { cn } from '@piluvitu/ui/cn'

export const ICONE_DO_TIPO: Record<TipoDoCenario, IconDefinition> = {
  ok: faCircleCheck,
  erro: faCircleXmark,
  espera: faClock,
}

export const COR_DO_TIPO: Record<TipoDoCenario, string> = {
  ok: 'text-ok border-ok/45',
  erro: 'text-destructive border-destructive/45',
  espera: 'text-warn border-warn/45',
}

export function SeloDoCenario({
  tipo,
  rotulo,
}: {
  tipo: TipoDoCenario
  rotulo: string
}) {
  return (
    <span
      data-tipo={tipo}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] font-mono text-[11px] leading-none font-semibold',
        COR_DO_TIPO[tipo],
      )}
    >
      <FontAwesomeIcon icon={ICONE_DO_TIPO[tipo]} className="text-[10px]" />
      {rotulo}
    </span>
  )
}
