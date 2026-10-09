import { faArrowLeft, faBookOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@piluvitu/ui/button'
import Link from 'next/link'
import { BotaoTema } from './botao-tema'

export type LinkDoTopo = { href: string; rotulo: string }

type TopoProps = { voltar: LinkDoTopo; ancoras?: LinkDoTopo[]; docs?: string }

export function Topo({ voltar, ancoras = [], docs }: TopoProps) {
  return (
    <nav
      aria-label="Topo"
      className="flex flex-wrap items-center justify-between gap-4"
    >
      <Link
        href={voltar.href}
        className="text-foreground inline-flex items-center gap-2 font-mono text-sm hover:underline"
      >
        <FontAwesomeIcon
          icon={faArrowLeft}
          className="text-primary size-[13px]"
        />
        {voltar.rotulo}
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        {ancoras.map((ancora) => (
          <a
            key={ancora.href}
            href={ancora.href}
            className="text-muted-foreground px-2.5 py-2 font-mono text-[13px] hover:underline"
          >
            {ancora.rotulo}
          </a>
        ))}
        {docs && (
          <Button
            asChild
            variant="outline"
            className="gap-2 px-3 font-mono text-[13px]"
          >
            <a href={docs}>
              <FontAwesomeIcon
                icon={faBookOpen}
                className="text-primary size-[13px]"
              />
              Docs
            </a>
          </Button>
        )}
        <BotaoTema />
      </div>
    </nav>
  )
}
