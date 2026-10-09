import { faTerminal } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@piluvitu/ui/cn'
import { COMANDO_DO_EXEMPLO } from '@/lib/exemplo'
import { SAIDA_DO_TERMINAL, type Trecho } from '@/lib/terminal-exemplo'
import { JanelaExemplo } from './janela-exemplo'
import { LinhaDeComando } from './linha-de-comando'

const RECUO = ['pl-[2ch]', 'pl-[4ch]', 'pl-[6ch]']

const COR: Record<Trecho['tipo'], string | undefined> = {
  chave: 'text-muted-foreground',
  sinal: 'text-muted-foreground',
  valor: undefined,
}

export function TerminalExemplo() {
  return (
    <JanelaExemplo
      id="hero-terminal"
      legenda="Exemplo: a pessoa da semente 42 no terminal"
      icone={faTerminal}
      titulo="~/pilulabs/botai"
      detalhe={<span>terminal</span>}
    >
      <pre className="m-0 p-[18px] font-mono text-[13px] leading-[1.75] [overflow-wrap:anywhere] whitespace-pre-wrap">
        <LinhaDeComando linhas={[COMANDO_DO_EXEMPLO]} prompt />
        <code className="block">
          {SAIDA_DO_TERMINAL.map((linha, indice) => (
            <span
              key={indice}
              className={cn('block -indent-[2ch]', RECUO[linha.recuo])}
            >
              {linha.trechos.map((trecho, posicao) => (
                <span key={posicao} className={COR[trecho.tipo]}>
                  {trecho.texto}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </JanelaExemplo>
  )
}
