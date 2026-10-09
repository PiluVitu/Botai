import { faCircleCheck, faPlug } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@piluvitu/ui/cn'
import { INTEGRACOES } from '@/lib/integracoes'
import { Secao } from './secao'

export function Integracoes() {
  return (
    <Secao
      tituloId="integracoes-titulo"
      numero={5}
      rotulo="Integrações"
      titulo="O que foi testado, e o que ainda não."
      apoio="O motor roda em qualquer ferramenta que execute JS na página, e o servidor atende qualquer linguagem que fale HTTP. O selo diz o que já tem teste."
    >
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,190px),1fr))] gap-3">
        {INTEGRACOES.map(({ nome, testado, selo }) => (
          <li
            key={nome}
            className="bg-card border-border flex min-w-0 flex-col gap-3 rounded-md border p-[18px]"
          >
            <p className="text-base font-bold">{nome}</p>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 self-start rounded-full border px-[9px] py-[3px] font-mono text-[11.5px]',
                testado
                  ? 'border-ok/50 text-ok'
                  : 'border-border text-muted-foreground',
              )}
            >
              <FontAwesomeIcon
                icon={testado ? faCircleCheck : faPlug}
                className="size-3"
              />
              {selo}
            </span>
          </li>
        ))}
      </ul>
    </Secao>
  )
}
