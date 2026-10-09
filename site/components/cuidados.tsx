import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowRight,
  faShieldHalved,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@piluvitu/ui/cn'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { CARTAO } from './cartao'
import { Secao } from './secao'

const AVISOS = [
  'Os dados são fictícios, mas um CPF, CNPJ ou celular gerado pode pertencer a alguém de verdade.',
  'A caixa de e-mail é pública: quem souber o endereço lê as mensagens.',
  'Use só em localhost e em ambiente de teste.',
]

type CartaoProps = {
  icone: IconDefinition
  corDoIcone: string
  titulo: string
  link: { href: string; rotulo: string }
  children: ReactNode
}

function Cartao({ icone, corDoIcone, titulo, link, children }: CartaoProps) {
  return (
    <div className={cn(CARTAO, 'flex min-w-0 flex-col gap-3.5 p-[26px]')}>
      <div className="flex items-center gap-2.5">
        <FontAwesomeIcon
          icon={icone}
          className={cn('size-[18px]', corDoIcone)}
        />
        <h3 className="text-lg font-extrabold">{titulo}</h3>
      </div>
      {children}
      <Link
        href={link.href}
        className="text-primary focus-visible:ring-ring mt-auto inline-flex items-center gap-1.5 self-start rounded-sm text-sm underline-offset-[3px] outline-none hover:underline focus-visible:ring-2"
      >
        {link.rotulo}
        <FontAwesomeIcon icon={faArrowRight} className="size-[13px]" />
      </Link>
    </div>
  )
}

export function Cuidados() {
  return (
    <Secao
      tituloId="cuidados-titulo"
      numero={7}
      rotulo="Privacidade e cuidados"
      titulo="Fictício, mas com cuidado."
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-4">
        <Cartao
          icone={faShieldHalved}
          corDoIcone="text-primary"
          titulo="Privacidade"
          link={{ href: '/privacidade', rotulo: 'Política de privacidade' }}
        >
          <p className="text-[15px] leading-[1.6] text-pretty">
            A extensão não tem servidor nem analytics e só age na aba em que
            você a aciona.
          </p>
        </Cartao>
        <Cartao
          icone={faTriangleExclamation}
          corDoIcone="text-warn"
          titulo="Cuidados"
          link={{ href: '/termos', rotulo: 'Termos de uso' }}
        >
          <ul className="flex list-disc flex-col gap-2 pl-[18px] text-[15px] leading-[1.55] text-pretty">
            {AVISOS.map((aviso) => (
              <li key={aviso}>{aviso}</li>
            ))}
          </ul>
        </Cartao>
      </div>
    </Secao>
  )
}
