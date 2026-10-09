import {
  faCircleCheck,
  faWindowMaximize,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@piluvitu/ui/cn'
import { PESSOA_DO_EXEMPLO } from '@/lib/exemplo'
import { TeclaLocal } from './tecla-local'
import { JanelaExemplo } from './janela-exemplo'

const { nome, email, cpf, celular, endereco } = PESSOA_DO_EXEMPLO

const CAMPOS = [
  { rotulo: 'Nome completo', valor: nome.completo, linhaToda: true },
  { rotulo: 'E-mail', valor: email.endereco, linhaToda: true },
  { rotulo: 'CPF', valor: cpf },
  { rotulo: 'Celular', valor: celular.formatado },
  { rotulo: 'CEP', valor: endereco.cep },
  { rotulo: 'Cidade', valor: `${endereco.cidade} · ${endereco.uf}` },
]

export function FormularioExemplo() {
  return (
    <JanelaExemplo
      id="hero-formulario"
      legenda="Exemplo: um cadastro preenchido pela extensão"
      icone={faWindowMaximize}
      titulo="localhost:3000/cadastro"
      detalhe={
        <span className="inline-flex items-center">
          <span className="sr-only">Atalho da extensão: </span>
          <TeclaLocal className="py-px text-[11px]" />
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-3 p-[18px] min-[380px]:grid-cols-2">
        <p className="col-span-full mb-0.5 text-lg font-bold tracking-[-0.01em]">
          Criar conta
        </p>
        {CAMPOS.map((campo) => (
          <div
            key={campo.rotulo}
            className={cn(
              'flex min-w-0 flex-col gap-1.5',
              campo.linhaToda && 'col-span-full',
            )}
          >
            <span className="text-muted-foreground text-xs">
              {campo.rotulo}
            </span>
            <span className="bg-background border-primary block rounded-[10px] border-[1.5px] px-3 py-[9px] text-sm [overflow-wrap:anywhere]">
              {campo.valor}
            </span>
          </div>
        ))}
        <p className="text-ok col-span-full mt-1 flex items-center gap-2 font-mono text-xs">
          <FontAwesomeIcon icon={faCircleCheck} className="size-3.5" />
          {`${CAMPOS.length} de ${CAMPOS.length} campos preenchidos`}
        </p>
      </div>
    </JanelaExemplo>
  )
}
