import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@piluvitu/ui/cn'
import { CONVITE, PERSONAS, type Persona, trechos } from '@/lib/personas'
import { CARTAO } from './cartao'
import { Secao } from './secao'

function ComCodigo({ texto }: { texto: string }) {
  return trechos(texto).map(({ texto: parte, codigo }, indice) =>
    codigo ? (
      <code key={indice} className="text-foreground font-mono text-[13px]">
        {parte}
      </code>
    ) : (
      parte
    ),
  )
}

function CartaoPersona({ titulo, icone, etiquetas, itens }: Persona) {
  return (
    <li className={cn(CARTAO, 'flex min-w-0 flex-col gap-3.5 p-6')}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[19px] font-extrabold tracking-[-0.02em]">
          {titulo}
        </h3>
        <FontAwesomeIcon icon={icone} className="text-primary size-[18px]" />
      </div>
      <ul aria-label="Etiquetas" className="flex flex-wrap gap-1.5">
        {etiquetas.map((etiqueta) => (
          <li
            key={etiqueta}
            className="border-accent-line text-primary rounded-full border px-[9px] py-[3px] font-mono text-[11.5px]"
          >
            {etiqueta}
          </li>
        ))}
      </ul>
      <ul className="text-muted-foreground flex list-disc flex-col gap-2 pl-[18px] text-[14.5px] leading-[1.55]">
        {itens.map((item) => (
          <li key={item}>
            <ComCodigo texto={item} />
          </li>
        ))}
      </ul>
    </li>
  )
}

export function ParaQuem() {
  return (
    <Secao
      id="para-quem"
      tituloId="quem-titulo"
      numero={4}
      rotulo="Para quem"
      titulo="Cada um entra pela sua porta."
    >
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-4">
        {PERSONAS.map((persona) => (
          <CartaoPersona key={persona.titulo} {...persona} />
        ))}
        <li className="border-border flex min-w-0 flex-col justify-between gap-5 rounded-lg border border-dashed p-6">
          <p className="text-[19px] leading-[1.25] font-extrabold tracking-[-0.02em] text-balance">
            {CONVITE.titulo}
          </p>
          <p className="text-muted-foreground text-[14.5px] leading-[1.55]">
            {CONVITE.texto}
          </p>
          <a
            href={CONVITE.href}
            className="text-primary focus-visible:ring-ring inline-flex items-center gap-1.5 self-start rounded-sm font-mono text-[13px] underline-offset-[3px] outline-none hover:underline focus-visible:ring-2"
          >
            {CONVITE.rotulo}
            <FontAwesomeIcon icon={faArrowRight} className="size-[13px]" />
          </a>
        </li>
      </ul>
    </Secao>
  )
}
