import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@piluvitu/ui/button'
import {
  ANCORAS_DA_LANDING,
  NOME,
  REPOSITORIO,
  URL_DA_DOCUMENTACAO,
} from '@/lib/conteudo'
import { BotaoTema } from './botao-tema'
import { Marca } from './marca'

export function Cabecalho() {
  return (
    <header className="border-border relative flex flex-wrap items-center justify-between gap-4 border-b py-5">
      <a
        href="#topo"
        aria-label={`${NOME}, início`}
        className="inline-flex items-center gap-2.5"
      >
        <Marca tamanho={26} />
        <span className="text-xl font-extrabold tracking-[-0.03em]">
          {NOME}
        </span>
      </a>
      <nav aria-label="Seções" className="flex flex-wrap items-center gap-1">
        {ANCORAS_DA_LANDING.map((ancora) => (
          <a
            key={ancora.id}
            href={`#${ancora.id}`}
            className="text-muted-foreground px-2.5 py-2 font-mono text-[13px] hover:underline"
          >
            {ancora.rotulo}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <Button asChild className="gap-2 px-3.5 font-semibold">
          <a href={URL_DA_DOCUMENTACAO}>
            <FontAwesomeIcon icon={faBookOpen} className="size-[15px]" />
            Docs
          </a>
        </Button>
        <a
          href={REPOSITORIO}
          aria-label="Código no GitHub"
          className="border-input text-foreground hover:bg-accent focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-md border outline-none focus-visible:ring-2"
        >
          <FontAwesomeIcon icon={faGithub} className="size-4" />
        </a>
        <BotaoTema />
      </div>
      <p data-esqueleto className="text-muted-foreground font-mono text-xs">
        Em construção: menu abaixo de 900 px (grupo 1)
      </p>
    </header>
  )
}
