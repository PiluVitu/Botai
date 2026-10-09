import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { Pessoa } from '@pilutech/botai-core/pessoa'
import { cn } from '@piluvitu/ui/cn'
import { useId } from 'react'
import {
  favoritoDa,
  LIMITE_FAVORITOS,
  primeiroNome,
  type Favorito,
} from '../lib/favoritos'
import { iniciais } from './cabecalho-pessoa'
import { OVERLINE } from './tipografia'

const CHIP =
  'focus-visible:ring-ring inline-flex max-w-full cursor-pointer items-center rounded-full border text-[11.5px] leading-none font-medium transition-colors duration-200 focus-visible:ring-1 focus-visible:outline-none'

export function FaixaFavoritos({
  favoritos,
  ativa,
  onUsar,
  onGuardar,
}: {
  favoritos: readonly Favorito[]
  ativa: Pessoa
  onUsar: (id: string) => void
  onGuardar: () => void
}) {
  const titulo = useId()
  const idDaAtiva = favoritoDa(favoritos, ativa)?.id ?? null
  const cheia = favoritos.length >= LIMITE_FAVORITOS
  return (
    <div className="flex flex-col gap-2 px-4 pt-0.5 pb-3">
      <div className="flex items-center gap-2">
        <h2 id={titulo} className={cn(OVERLINE, 'text-muted-foreground m-0')}>
          Favoritos
        </h2>
        <span className="text-primary font-mono text-[10.5px] font-medium">
          {favoritos.length}/{LIMITE_FAVORITOS}
        </span>
        <span className="bg-border h-px flex-1" />
      </div>
      <div
        role="group"
        aria-labelledby={titulo}
        className="flex flex-wrap gap-1.5"
      >
        {favoritos.map((favorito) => {
          const ativo = favorito.id === idDaAtiva
          return (
            <button
              key={favorito.id}
              type="button"
              aria-pressed={ativo}
              title={`Usar ${favorito.apelido}`}
              onClick={() => onUsar(favorito.id)}
              className={cn(
                CHIP,
                'gap-[7px] py-[5px] pr-2.5 pl-[5px]',
                ativo
                  ? 'border-primary bg-accent-soft'
                  : 'bg-card hover:bg-accent',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-[22px] flex-none items-center justify-center rounded-full font-mono text-[9.5px] font-semibold',
                  ativo
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {iniciais(favorito.pessoa.nome.completo)}
              </span>
              <span className="truncate">{favorito.apelido}</span>
            </button>
          )
        })}
        {idDaAtiva === null && !cheia && (
          <button
            type="button"
            onClick={onGuardar}
            className={cn(
              CHIP,
              'border-primary/55 text-primary hover:bg-accent-soft gap-1.5 border-dashed bg-transparent px-[11px] py-[5px]',
            )}
          >
            <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
            Guardar esta
          </button>
        )}
      </div>
      {idDaAtiva === null && cheia && (
        <p className="bg-card text-muted-foreground m-0 rounded-xl border px-3 py-2.5 text-xs leading-normal text-pretty">
          Os {LIMITE_FAVORITOS} lugares estão ocupados. Para guardar{' '}
          <strong className="text-foreground font-semibold">
            {primeiroNome(ativa)}
          </strong>
          , abra um favorito e clique na estrela para tirá-lo.
        </p>
      )}
    </div>
  )
}
