import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { Secao } from './secao'

const LINK =
  'text-primary inline-flex items-center gap-2 text-sm hover:underline'

export function Cuidados() {
  return (
    <Secao
      tituloId="cuidados-titulo"
      numero={7}
      rotulo="Privacidade e cuidados"
      titulo="Fictício, mas com cuidado."
    >
      <div className="flex flex-wrap gap-6">
        <Link href="/privacidade" className={LINK}>
          Política de privacidade
          <FontAwesomeIcon icon={faArrowRight} className="size-3" />
        </Link>
        <Link href="/termos" className={LINK}>
          Termos de uso
          <FontAwesomeIcon icon={faArrowRight} className="size-3" />
        </Link>
      </div>
      <p data-esqueleto className="text-muted-foreground font-mono text-xs">
        Em construção: privacidade e cuidados (grupo 4)
      </p>
    </Secao>
  )
}
