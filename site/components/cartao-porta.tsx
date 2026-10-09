import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@piluvitu/ui/cn'
import type { Porta } from '@/lib/portas'
import { BotaoCopiar } from './botao-copiar'
import { CARTAO } from './cartao'
import { LinhaDeComando } from './linha-de-comando'

export function CartaoPorta({ porta }: { porta: Porta }) {
  const { nome, numero, icone, linha, onde, comando } = porta
  return (
    <li className={cn(CARTAO, 'flex min-w-0 flex-col gap-3.5 p-[22px]')}>
      <div className="flex items-center gap-3">
        <span className="bg-accent-soft text-primary inline-flex size-10 shrink-0 items-center justify-center rounded-[14px]">
          <FontAwesomeIcon icon={icone} className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[17px] font-bold tracking-[-0.01em]">{nome}</h3>
          <p className="text-muted-foreground mt-0.5 font-mono text-[11px] tracking-[0.04em]">
            porta {numero}
          </p>
        </div>
      </div>
      <p className="text-sm leading-[1.55] text-pretty">{linha}</p>
      <p className="text-muted-foreground text-[13px] leading-[1.5] text-pretty">
        {onde}
      </p>
      <div className="bg-background border-border mt-auto flex items-start gap-2 rounded-[12px] border py-2 pr-2 pl-3">
        <pre className="min-w-0 flex-1 py-[5px] font-mono text-[12.5px] leading-[1.55]">
          <LinhaDeComando linhas={comando.linhas} />
        </pre>
        {comando.copiavel ? (
          <BotaoCopiar
            texto={comando.linhas.join('\n')}
            rotulo={`Copiar comando da porta ${nome}`}
            tamanho="pequeno"
          />
        ) : null}
      </div>
    </li>
  )
}
