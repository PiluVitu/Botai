import { faChrome, faFirefoxBrowser } from '@fortawesome/free-brands-svg-icons'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@piluvitu/ui/button'
import { cn } from '@piluvitu/ui/cn'
import { NOME, POSICIONAMENTO, URL_DA_DOCUMENTACAO } from '@/lib/conteudo'
import { COMANDO_DO_EXEMPLO } from '@/lib/exemplo'
import { BotaoCopiar } from './botao-copiar'
import { FormularioExemplo } from './formulario-exemplo'
import { LinhaDeComando } from './linha-de-comando'
import { TerminalExemplo } from './terminal-exemplo'

const BOTAO_DO_HERO = 'h-12 max-w-full gap-2 text-[15px] font-semibold'

export function Hero() {
  return (
    <section
      aria-labelledby="hero-titulo"
      className="flex flex-col gap-7 pt-[clamp(48px,8vw,96px)]"
    >
      <p className="text-primary font-mono text-sm">~/pilulabs/botai</p>
      <h1
        id="hero-titulo"
        className="max-w-[980px] text-[clamp(38px,6vw,76px)] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance"
      >
        <span className="sr-only">{NOME}: </span>
        {POSICIONAMENTO}
      </h1>
      <p className="text-muted-foreground max-w-[720px] text-[clamp(17px,1.6vw,20px)] leading-[1.55] text-pretty">
        O Botaí gera uma pessoa brasileira fictícia e coerente, com CPF, CEP,
        celular e empresa que batem entre si, e preenche formulários com ela. Um
        motor só, com oito portas: extensão, CLI, biblioteca, HTTP, Docker,
        binários, Playwright e o motor direto na página.
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <Button asChild size="lg" className={cn(BOTAO_DO_HERO, 'px-[22px]')}>
          <a href={URL_DA_DOCUMENTACAO}>
            <FontAwesomeIcon icon={faBookOpen} className="size-4" />
            Ler a documentação
          </a>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className={cn(BOTAO_DO_HERO, 'px-5')}
        >
          <a href="#extensao">
            <FontAwesomeIcon icon={faChrome} className="size-4" />
            <FontAwesomeIcon icon={faFirefoxBrowser} className="size-4" />
            Instalar a extensão
          </a>
        </Button>
      </div>
      <div className="bg-card border-border flex max-w-[680px] items-center gap-2.5 rounded-md border py-1.5 pr-1.5 pl-3 font-mono text-[13px] min-[400px]:pl-4 min-[400px]:text-sm">
        <LinhaDeComando
          linhas={[COMANDO_DO_EXEMPLO]}
          prompt
          className="min-w-0 flex-1"
        />
        <BotaoCopiar
          texto={COMANDO_DO_EXEMPLO}
          rotulo={`Copiar comando: ${COMANDO_DO_EXEMPLO}`}
        />
      </div>
      <div className="relative mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-4">
        <TerminalExemplo />
        <FormularioExemplo />
      </div>
    </section>
  )
}
