import { faGithub, faNpm } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@piluvitu/ui/button'
import { cn } from '@piluvitu/ui/cn'
import { Fragment } from 'react'
import {
  type CodigoDaPorta,
  npmDe,
  PACOTE_DO_CORE,
  PACOTE_DO_PLAYWRIGHT,
  PORTAS,
  REPOSITORIO,
} from '@/lib/conteudo'
import { AtalhoLocal } from './atalho-local'
import { CabecalhoSecao } from './cabecalho-secao'
import { CARTAO, TEXTO_DE_CARTAO } from './cartao'

const LINKS = [
  { href: REPOSITORIO, rotulo: 'Código no GitHub', icone: faGithub },
  {
    href: npmDe(PACOTE_DO_CORE),
    rotulo: `${PACOTE_DO_CORE} no npm`,
    icone: faNpm,
  },
  {
    href: npmDe(PACOTE_DO_PLAYWRIGHT),
    rotulo: `${PACOTE_DO_PLAYWRIGHT} no npm`,
    icone: faNpm,
  },
]

const BLOCO =
  'bg-background border-border text-foreground rounded-md border px-4 py-3 font-mono text-[13px] leading-[1.6]'
const CODIGO_NO_TEXTO = 'text-foreground font-mono text-[13px]'

function comTrechosDeCodigo(texto: string) {
  return texto.split('`').map((trecho, indice) =>
    indice % 2 === 1 ? (
      <code key={indice} className={CODIGO_NO_TEXTO}>
        {trecho}
      </code>
    ) : (
      trecho
    ),
  )
}

function Codigo({ codigo }: { codigo: CodigoDaPorta }) {
  if (codigo.tipo === 'atalho')
    return (
      <div className={BLOCO}>
        <AtalhoLocal />
      </div>
    )
  return (
    <pre className={cn(BLOCO, '[overflow-wrap:anywhere] whitespace-pre-wrap')}>
      <code>
        {codigo.linhas.map((linha) => (
          <span key={linha} className="block pl-[2ch] -indent-[2ch]">
            {codigo.tipo === 'terminal' ? (
              <span aria-hidden className="text-primary mr-[1ch] select-none">
                $
              </span>
            ) : null}
            <span>
              {linha.split(' ').map((palavra, indice) => (
                <Fragment key={indice}>
                  {indice > 0 ? ' ' : null}
                  <span className="inline-block indent-0">{palavra}</span>
                </Fragment>
              ))}
            </span>
          </span>
        ))}
      </code>
    </pre>
  )
}

export function ParaDevs() {
  return (
    <section
      id="para-devs"
      aria-labelledby="devs-heading"
      className="flex scroll-mt-6 flex-col gap-6"
    >
      <CabecalhoSecao
        id="devs-heading"
        rotulo="Para devs"
        contagem={PORTAS.length}
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-8">
        <div className="flex flex-col gap-4 text-lg leading-[1.6] text-pretty">
          <p>
            O Botaí deixou de ser só uma extensão. O motor que preenche o
            formulário no navegador agora gera dados de teste brasileiros no seu
            código, no terminal, num servidor HTTP e no Playwright.
          </p>
          <p className="text-muted-foreground">
            A pessoa é a mesma da extensão: CPF da região fiscal da UF, CEP real
            com rua e cidade, celular com o DDD do CEP. O código é aberto, sob a
            licença MIT.
          </p>
        </div>
        <div className={cn(CARTAO, 'flex flex-col gap-3 p-6 shadow-sm')}>
          <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
            Reproduzível
          </p>
          <p className="text-primary text-[28px] leading-tight font-bold tracking-[-0.02em] text-balance">
            mesma semente, mesma pessoa
          </p>
          <p className={cn(TEXTO_DE_CARTAO, 'text-base/[1.55]')}>
            Com a mesma semente e o mesmo{' '}
            <code className={CODIGO_NO_TEXTO}>hoje</code>, a biblioteca, a CLI,
            o servidor e o Playwright geram a mesma pessoa. Arquivos dourados
            conferem isso a cada PR, e um patch nunca muda a pessoa de uma
            semente: fixe a versão do pacote.
          </p>
        </div>
      </div>
      <ul className={cn(CARTAO, 'divide-border divide-y shadow-sm')}>
        {PORTAS.map((porta) => (
          <li
            key={porta.titulo}
            className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-8 md:p-6"
          >
            <div className="flex items-start gap-4">
              <div className="bg-accent-soft text-primary flex size-10 shrink-0 items-center justify-center rounded-[14px]">
                <FontAwesomeIcon icon={porta.icone} className="size-4" />
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <h3 className="text-base leading-tight font-semibold">
                  {porta.titulo}
                </h3>
                <p className={cn(TEXTO_DE_CARTAO, 'text-sm/[1.55]')}>
                  {comTrechosDeCodigo(porta.texto)}
                </p>
              </div>
            </div>
            <Codigo codigo={porta.codigo} />
          </li>
        ))}
      </ul>
      <ul aria-label="Código e pacotes" className="flex flex-wrap gap-3">
        {LINKS.map((link) => (
          <li key={link.href} className="max-w-full">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto min-h-10 max-w-full gap-2 px-5 py-2 [overflow-wrap:anywhere] whitespace-normal"
            >
              <a href={link.href}>
                <FontAwesomeIcon icon={link.icone} className="size-4" />
                {link.rotulo}
              </a>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
