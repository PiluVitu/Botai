'use client'

import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@piluvitu/ui/cn'
import { useEffect, useRef, useState } from 'react'

export const TEMPO_DO_COPIADO = 1600

const TAMANHO = {
  medio: { botao: 'size-9 rounded-[10px]', icone: 'size-[15px]' },
  pequeno: { botao: 'size-8 rounded-[8px]', icone: 'size-3.5' },
} as const

type BotaoCopiarProps = {
  texto: string
  rotulo: string
  tamanho?: keyof typeof TAMANHO
  className?: string
}

export function BotaoCopiar({
  texto,
  rotulo,
  tamanho = 'medio',
  className,
}: BotaoCopiarProps) {
  const [copiado, setCopiado] = useState(false)
  const relogio = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(relogio.current), [])

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      return
    }
    setCopiado(true)
    clearTimeout(relogio.current)
    relogio.current = setTimeout(() => setCopiado(false), TEMPO_DO_COPIADO)
  }

  return (
    <span className={cn('inline-flex shrink-0', className)}>
      <button
        type="button"
        aria-label={rotulo}
        onClick={copiar}
        className={cn(
          'border-border bg-muted text-foreground hover:bg-accent focus-visible:ring-ring inline-flex cursor-pointer items-center justify-center border outline-none focus-visible:ring-2',
          TAMANHO[tamanho].botao,
        )}
      >
        <FontAwesomeIcon
          icon={copiado ? faCheck : faCopy}
          className={TAMANHO[tamanho].icone}
        />
      </button>
      <span role="status" className="sr-only">
        {copiado ? 'Copiado' : ''}
      </span>
    </span>
  )
}
