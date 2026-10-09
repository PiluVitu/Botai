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
import { MenuSecoes } from './menu-secoes'

export function Cabecalho() {
  return (
    <header className="border-border relative flex flex-wrap items-center justify-between gap-4 border-b py-5">
      <a
        href="#topo"
        aria-label={`${NOME}, início`}
        className="focus-visible:ring-ring inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2"
      >
        <Marca tamanho={26} />
        <span className="text-xl font-extrabold tracking-[-0.03em]">
          {NOME}
        </span>
      </a>
      <nav
        aria-label="Seções"
        className="hidden items-center gap-1 min-[900px]:flex"
      >
        {ANCORAS_DA_LANDING.map((ancora) => (
          <a
            key={ancora.id}
            href={`#${ancora.id}`}
            className="text-muted-foreground focus-visible:ring-ring rounded-md px-2.5 py-2 font-mono text-[13px] underline-offset-[3px] outline-none hover:underline focus-visible:ring-2"
          >
            {ancora.rotulo}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <Button
          asChild
          className="gap-2 px-3.5 font-semibold max-[379px]:w-9 max-[379px]:px-0"
        >
          <a href={URL_DA_DOCUMENTACAO}>
            <FontAwesomeIcon icon={faBookOpen} className="size-[15px]" />
            <span className="max-[379px]:sr-only">Docs</span>
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
        <MenuSecoes ancoras={ANCORAS_DA_LANDING} />
      </div>
    </header>
  )
}
