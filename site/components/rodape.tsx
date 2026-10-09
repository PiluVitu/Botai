import { cn } from '@piluvitu/ui/cn'
import Link from 'next/link'
import {
  MAILTO,
  NOME,
  npmDe,
  PACOTE_DO_CORE,
  PACOTE_DO_PLAYWRIGHT,
  REPOSITORIO,
  URL_DA_DOCUMENTACAO,
  URL_DA_PILUTECH,
} from '@/lib/conteudo'
import { Marca } from './marca'

const FOCO =
  'focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2'
const LINK = cn(
  'inline-block py-1.5 text-sm underline-offset-[3px] hover:underline',
  FOCO,
)

type LinkDoRodape = { href: string; rotulo: string; codigo?: boolean }
type Coluna = { id: string; titulo: string; links: LinkDoRodape[] }

const COLUNAS: Coluna[] = [
  {
    id: 'rodape-projeto',
    titulo: 'Projeto',
    links: [
      { href: URL_DA_DOCUMENTACAO, rotulo: 'Docs' },
      { href: REPOSITORIO, rotulo: 'GitHub' },
      { href: npmDe(PACOTE_DO_CORE), rotulo: PACOTE_DO_CORE, codigo: true },
      {
        href: npmDe(PACOTE_DO_PLAYWRIGHT),
        rotulo: PACOTE_DO_PLAYWRIGHT,
        codigo: true,
      },
      { href: MAILTO.suporte, rotulo: 'Suporte' },
    ],
  },
  {
    id: 'rodape-legal',
    titulo: 'Legal',
    links: [
      { href: '/termos', rotulo: 'Termos de uso' },
      { href: '/privacidade', rotulo: 'Política de privacidade' },
    ],
  },
]

function Ligacao({ href, rotulo, codigo }: LinkDoRodape) {
  const className = cn(LINK, codigo && 'font-mono text-[13px]')
  return href.startsWith('/') ? (
    <Link href={href} className={className}>
      {rotulo}
    </Link>
  ) : (
    <a href={href} className={className}>
      {rotulo}
    </a>
  )
}

export function Rodape() {
  return (
    <footer className="border-border mt-[72px] flex flex-wrap justify-between gap-8 border-t pt-8 pb-10">
      <div className="flex max-w-[320px] flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <Marca tamanho={22} />
          <span className="text-lg font-extrabold tracking-[-0.03em]">
            {NOME}
          </span>
        </div>
        <p className="text-muted-foreground text-sm leading-[1.55]">
          Dados de teste brasileiros. Código aberto, licença MIT.
        </p>
        <a
          href={URL_DA_PILUTECH}
          className={cn(
            'text-muted-foreground self-start py-1.5 font-mono text-xs underline-offset-[3px] hover:underline',
            FOCO,
          )}
        >
          Powered by PiluTech
        </a>
      </div>
      <div className="flex flex-wrap gap-10">
        {COLUNAS.map((coluna) => (
          <nav key={coluna.id} aria-labelledby={coluna.id}>
            <p
              id={coluna.id}
              className="text-muted-foreground mb-1.5 font-mono text-[11px] tracking-[0.2em] uppercase"
            >
              {coluna.titulo}
            </p>
            <ul className="flex flex-col gap-0.5">
              {coluna.links.map((link) => (
                <li key={link.href}>
                  <Ligacao {...link} />
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  )
}
