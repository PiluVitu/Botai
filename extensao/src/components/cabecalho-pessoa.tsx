import { faPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { Pessoa } from '@pilutech/botai-core/pessoa'
import { Avatar, AvatarFallback } from '@piluvitu/ui/avatar'
import { Button } from '@piluvitu/ui/button'
import { cn } from '@piluvitu/ui/cn'
import { Input } from '@piluvitu/ui/input'
import { useEffect, useId, useRef } from 'react'
import { APELIDO_MAX, LIMITE_FAVORITOS } from '../lib/favoritos'
import { META_MONO, OVERLINE } from './tipografia'

export interface EdicaoApelido {
  rascunho: string
  onMudar: (texto: string) => void
  onSalvar: () => void
  onCancelar: () => void
}

export interface CabecalhoPessoaProps {
  pessoa: Pessoa
  idade: number
  apelido: string | null
  limiteAtingido: boolean
  edicao: EdicaoApelido | null
  onEstrela: () => void
  onRenomear: () => void
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

const FOCO =
  'focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none'

function Estrela({
  preenchida,
  className,
}: {
  preenchida: boolean
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill={preenchida ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
    >
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </svg>
  )
}

function BotaoEstrela({
  favorita,
  limiteAtingido,
  onClick,
}: {
  favorita: boolean
  limiteAtingido: boolean
  onClick: () => void
}) {
  const bloqueada = !favorita && limiteAtingido
  const rotulo = favorita
    ? 'Tirar dos favoritos'
    : bloqueada
      ? `Limite de ${LIMITE_FAVORITOS} favoritos`
      : 'Guardar nos favoritos'
  return (
    <button
      type="button"
      aria-pressed={favorita}
      aria-disabled={bloqueada || undefined}
      aria-label={rotulo}
      title={rotulo}
      onClick={bloqueada ? undefined : onClick}
      className={cn(
        'flex size-9 flex-none items-center justify-center rounded-[10px] border transition-colors duration-200',
        FOCO,
        favorita
          ? 'text-warn hover:bg-accent cursor-pointer border-transparent'
          : 'text-muted-foreground',
        !favorita && !bloqueada && 'hover:bg-accent cursor-pointer',
        bloqueada && 'cursor-not-allowed opacity-45',
      )}
    >
      <Estrela preenchida={favorita} className="size-[17px]" />
    </button>
  )
}

function CampoApelido({
  rascunho,
  onMudar,
  onSalvar,
  onCancelar,
}: EdicaoApelido) {
  const id = useId()
  const campo = useRef<HTMLInputElement>(null)
  useEffect(() => {
    campo.current?.focus()
    campo.current?.select()
  }, [])
  return (
    <form
      className="flex min-w-0 flex-1 flex-col gap-1.5"
      onSubmit={(evento) => {
        evento.preventDefault()
        onSalvar()
      }}
    >
      <label htmlFor={id} className={cn(OVERLINE, 'text-warn')}>
        Apelido do favorito
      </label>
      <div className="flex gap-1.5">
        <Input
          ref={campo}
          id={id}
          value={rascunho}
          maxLength={APELIDO_MAX}
          autoComplete="off"
          spellCheck={false}
          onChange={(evento) => onMudar(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key !== 'Escape') return
            evento.preventDefault()
            onCancelar()
          }}
          className="border-primary bg-card h-8 min-w-0 flex-1 rounded-[10px] px-2.5 text-[12.5px] font-medium shadow-none"
        />
        <Button
          type="submit"
          size="sm"
          className="h-8 rounded-[10px] px-3 text-[12.5px] font-semibold"
        >
          Salvar
        </Button>
      </div>
      <span className={META_MONO}>
        {rascunho.length}/{APELIDO_MAX} · Enter salva, Esc cancela
      </span>
    </form>
  )
}

export function CabecalhoPessoa({
  pessoa,
  idade,
  apelido,
  limiteAtingido,
  edicao,
  onEstrela,
  onRenomear,
}: CabecalhoPessoaProps) {
  return (
    <div className="flex items-center gap-3 pt-4 pr-3 pb-2.5 pl-4">
      <Avatar>
        <AvatarFallback className="bg-accent-soft text-primary font-sans text-[13px] font-bold">
          {iniciais(pessoa.nome.completo)}
        </AvatarFallback>
      </Avatar>
      {edicao ? (
        <CampoApelido {...edicao} />
      ) : (
        <>
          <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
            {apelido !== null && (
              <div className="text-warn flex min-w-0 items-center gap-1.5 font-mono text-[11px] font-semibold">
                <Estrela preenchida className="size-[11px] flex-none" />
                <span className="truncate">{apelido}</span>
                <button
                  type="button"
                  aria-label="Renomear favorito"
                  title="Renomear"
                  onClick={onRenomear}
                  className={cn(
                    'text-muted-foreground hover:bg-accent hover:text-foreground flex size-[22px] flex-none cursor-pointer items-center justify-center rounded-[6px] transition-colors duration-200',
                    FOCO,
                  )}
                >
                  <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                </button>
              </div>
            )}
            <h1 className="m-0 text-base font-bold tracking-[-0.01em]">
              {pessoa.nome.completo}
            </h1>
            <div className={META_MONO}>
              {idade} anos · {pessoa.endereco.cidade}, {pessoa.endereco.uf}
            </div>
          </div>
          <BotaoEstrela
            favorita={apelido !== null}
            limiteAtingido={limiteAtingido}
            onClick={onEstrela}
          />
        </>
      )}
    </div>
  )
}
