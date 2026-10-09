import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { BotaoTema } from './botao-tema'

export type LinkDoTopo = { href: string; rotulo: string }

export function Topo({ voltar }: { voltar: LinkDoTopo }) {
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
      <BotaoTema />
    </nav>
  )
}
