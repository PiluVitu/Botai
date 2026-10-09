import { NOME_DO_PROVEDOR, type Cartao } from '@pilutech/botai-core/cartao'
import { cartaoParaMostrar } from '../lib/cartao'
import { SeloDoCenario } from './selo-do-cenario'

export function CartaoAtual({
  cartao,
}: {
  cartao: Partial<Pick<Cartao, 'provedor' | 'cenario'>>
}) {
  const { provedor, cenario } = cartaoParaMostrar(cartao)
  const nome = NOME_DO_PROVEDOR[provedor]
  return (
    <>
      <div className="grid grid-cols-[92px_minmax(0,1fr)_28px] items-center gap-2.5 py-[5px] pr-1 pl-2">
        <span className="text-muted-foreground text-xs">Cenário</span>
        <span className="flex flex-wrap items-center gap-2">
          <SeloDoCenario tipo={cenario.tipo} rotulo={cenario.rotulo} />
          <span className="text-muted-foreground font-mono text-[11px] font-medium">
            {nome}
          </span>
        </span>
      </div>
      <p className="text-muted-foreground mx-2 mt-1.5 mb-0.5 text-xs leading-normal text-pretty">
        {cenario.descricao} Número de teste documentado da {nome}: passa no Luhn
        e só vale em sandbox.
      </p>
    </>
  )
}
