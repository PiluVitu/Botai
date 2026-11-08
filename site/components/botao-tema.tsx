'use client'

import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTheme } from 'next-themes'
import { flushSync } from 'react-dom'
import { PRESSIONAR } from './pressionar'

function semMovimento(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function BotaoTema() {
  const { resolvedTheme, setTheme } = useTheme()

  function alternar() {
    const proximo = resolvedTheme === 'dark' ? 'light' : 'dark'
    if (!document.startViewTransition || semMovimento()) {
      setTheme(proximo)
      return
    }
    document.startViewTransition(() => flushSync(() => setTheme(proximo)))
  }

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      onClick={alternar}
      className={`border-input bg-background text-foreground hover:bg-accent focus-visible:ring-ring inline-flex size-9 cursor-pointer items-center justify-center rounded-md border outline-none focus-visible:ring-2 ${PRESSIONAR}`}
    >
      <FontAwesomeIcon icon={faMoon} className="size-3.5 dark:hidden" />
      <FontAwesomeIcon icon={faSun} className="hidden size-3.5 dark:block" />
    </button>
  )
}
