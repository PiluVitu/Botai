import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  NOME_DO_PROVEDOR,
  PROVEDORES,
  type CartaoEscolhido,
} from '@pilutech/botai-core/cartao'
import { Button } from '@piluvitu/ui/button'
import { cn } from '@piluvitu/ui/cn'
import { useId } from 'react'
import { cenariosDo, rotuloDaEscolha, trocarProvedor } from '../lib/cartao'
import { COR_DO_TIPO, ICONE_DO_TIPO } from './selo-do-cenario'
import { BOTAO_SM, OVERLINE } from './tipografia'

const FOCO =
  'focus-visible:ring-ring cursor-pointer transition-colors duration-200 focus-visible:ring-1 focus-visible:outline-none'

export function CartaoDasProximas({
  escolha,
  onEscolher,
  onNovaPessoa,
}: {
  escolha: CartaoEscolhido
  onEscolher: (escolha: CartaoEscolhido) => void
  onNovaPessoa: () => void
}) {
  const titulo = useId()
  return (
    <div
      role="group"
      aria-labelledby={titulo}
      className="bg-card mx-2 mt-3.5 mb-1 flex flex-col gap-2.5 rounded-[14px] border p-3"
    >
      <h3 id={titulo} className={cn(OVERLINE, 'text-muted-foreground m-0')}>
        Cartão das próximas pessoas
      </h3>
      <div
        role="group"
        aria-label="Provedor"
        className="bg-background grid grid-cols-2 gap-1 rounded-[10px] border p-[3px]"
      >
        {PROVEDORES.map((provedor) => {
          const ativo = provedor === escolha.provedor
          return (
            <button
              key={provedor}
              type="button"
              aria-pressed={ativo}
              onClick={() => {
                if (!ativo) onEscolher(trocarProvedor(escolha, provedor))
              }}
              className={cn(
                FOCO,
                'h-[30px] rounded-[8px] text-[12.5px] font-semibold',
                ativo
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent bg-transparent',
              )}
            >
              {NOME_DO_PROVEDOR[provedor]}
            </button>
          )
        })}
      </div>
      <div role="group" aria-label="Cenário" className="flex flex-wrap gap-1.5">
        {cenariosDo(escolha.provedor).map((cenario) => {
          const ativo = cenario.id === escolha.cenario
          return (
            <button
              key={cenario.id}
              type="button"
              aria-pressed={ativo}
              title={cenario.descricao}
              onClick={() =>
                onEscolher({ provedor: escolha.provedor, cenario: cenario.id })
              }
              className={cn(
                FOCO,
                'inline-flex items-center gap-1.5 rounded-full border px-[9px] py-1.5 font-mono text-[11px] leading-none',
                ativo
                  ? cn('bg-muted font-semibold', COR_DO_TIPO[cenario.tipo])
                  : 'text-muted-foreground border-border hover:bg-accent bg-transparent font-medium',
              )}
            >
              <FontAwesomeIcon
                icon={ICONE_DO_TIPO[cenario.tipo]}
                className="text-[10px]"
              />
              {cenario.rotulo}
            </button>
          )
        })}
      </div>
      <p className="text-muted-foreground m-0 text-[11.5px] leading-[1.45] text-pretty">
        Vale para as próximas pessoas. A atual e as favoritas mantêm o cartão
        com que foram geradas.
      </p>
      <Button
        size="sm"
        className={cn(
          BOTAO_SM,
          'h-auto min-h-[34px] py-1.5 text-balance whitespace-normal',
        )}
        onClick={onNovaPessoa}
      >
        Nova pessoa com {rotuloDaEscolha(escolha)}
      </Button>
    </div>
  )
}
