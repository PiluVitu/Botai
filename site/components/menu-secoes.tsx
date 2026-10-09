'use client'

import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useId, useRef, useState } from 'react'

export type AncoraDoMenu = { id: string; rotulo: string }

type MenuSecoesProps = { ancoras: readonly AncoraDoMenu[] }

export function MenuSecoes({ ancoras }: MenuSecoesProps) {
  const [aberto, setAberto] = useState(false)
  const idDoPainel = useId()
  const raiz = useRef<HTMLDivElement>(null)
  const botao = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!aberto) return
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key !== 'Escape') return
      setAberto(false)
      botao.current?.focus()
    }
    function aoTocar(evento: PointerEvent) {
      if (!raiz.current?.contains(evento.target as Node)) setAberto(false)
    }
    document.addEventListener('keydown', aoTeclar)
    document.addEventListener('pointerdown', aoTocar)
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.removeEventListener('pointerdown', aoTocar)
    }
  }, [aberto])

  return (
    <div ref={raiz} className="contents">
      <button
        ref={botao}
        type="button"
        aria-label="Abrir menu"
        aria-expanded={aberto}
        aria-controls={aberto ? idDoPainel : undefined}
        onClick={() => setAberto(!aberto)}
        className="border-input text-foreground hover:bg-accent focus-visible:ring-ring inline-flex size-9 cursor-pointer items-center justify-center rounded-md border bg-transparent outline-none focus-visible:ring-2 min-[900px]:hidden"
      >
        <FontAwesomeIcon icon={aberto ? faXmark : faBars} className="size-4" />
      </button>
      {aberto ? (
        <nav
          id={idDoPainel}
          aria-label="Seções"
          className="bg-card border-border absolute inset-x-0 top-[calc(100%+8px)] z-10 flex flex-col rounded-lg border p-2 min-[900px]:hidden"
        >
          {ancoras.map((ancora) => (
            <a
              key={ancora.id}
              href={`#${ancora.id}`}
              onClick={() => setAberto(false)}
              className="hover:bg-accent focus-visible:ring-ring rounded-md px-3 py-3.5 font-mono text-sm outline-none focus-visible:ring-2"
            >
              {ancora.rotulo}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  )
}
