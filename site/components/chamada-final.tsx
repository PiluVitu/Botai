import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@piluvitu/ui/button'
import { cn } from '@piluvitu/ui/cn'
import { REPOSITORIO, URL_DA_DOCUMENTACAO } from '@/lib/conteudo'
import { CARTAO } from './cartao'
import { Marca } from './marca'
import { TITULO_DE_SECAO } from './secao'

const BOTAO =
  'h-auto min-h-12 max-w-full gap-2 py-2 text-[15px] font-semibold whitespace-normal'

export function ChamadaFinal() {
  return (
    <section
      aria-labelledby="final-titulo"
      className={cn(
        CARTAO,
        'mt-[clamp(80px,11vw,140px)] flex flex-col items-center gap-[22px] rounded-[32px] px-[clamp(20px,4vw,48px)] py-[clamp(40px,6vw,72px)] text-center',
      )}
    >
      <Marca tamanho={56} />
      <h2 id="final-titulo" className={cn(TITULO_DE_SECAO, 'text-balance')}>
        Botaí no seu teste.
      </h2>
      <p className="text-muted-foreground max-w-[540px] text-[17px] leading-[1.55] text-pretty">
        Comece pela porta que você já usa. A documentação tem o guia de cada
        uma.
      </p>
      <div className="flex max-w-full flex-wrap justify-center gap-3">
        <Button asChild size="lg" className={cn(BOTAO, 'px-[22px]')}>
          <a href={URL_DA_DOCUMENTACAO}>
            <FontAwesomeIcon icon={faBookOpen} className="size-4" />
            Ler a documentação
          </a>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className={cn(BOTAO, 'px-5')}
        >
          <a href={REPOSITORIO}>
            <FontAwesomeIcon icon={faGithub} className="size-4" />
            Código no GitHub
          </a>
        </Button>
      </div>
    </section>
  )
}
