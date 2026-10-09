'use client'

import { cn } from '@piluvitu/ui/cn'
import { useSyncExternalStore } from 'react'
import {
  atalhoDoVisitante,
  ehFirefox,
  sistemaDoVisitante,
  VISITANTE_DO_SERVIDOR,
} from '@/lib/visitante'

const semInscricao = () => () => {}

function useAtalhoDoVisitante() {
  const sistema = useSyncExternalStore(
    semInscricao,
    () => sistemaDoVisitante(navigator),
    () => VISITANTE_DO_SERVIDOR.sistema,
  )
  const firefox = useSyncExternalStore(
    semInscricao,
    () => ehFirefox(navigator),
    () => VISITANTE_DO_SERVIDOR.firefox,
  )
  return atalhoDoVisitante(sistema, firefox)
}

export function TeclaLocal({ className }: { className?: string }) {
  const { tecla } = useAtalhoDoVisitante()
  return (
    <kbd
      className={cn(
        'border-border bg-muted text-foreground rounded-[6px] border px-1.5 py-0.5 font-mono text-xs',
        className,
      )}
    >
      {tecla}
    </kbd>
  )
}
