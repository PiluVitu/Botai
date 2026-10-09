import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@piluvitu/ui/button'
import { cn } from '@piluvitu/ui/cn'
import { ESTADO_SEM_URL, NOME_DO_NAVEGADOR } from '@/lib/extensao'
import type { BotaoDeLoja } from '@/lib/modelo'
import { LOJA_UI } from './lojas-ui'

type BotoesLojaProps = { lojas: BotaoDeLoja[]; className?: string }

export function BotoesLoja({ lojas, className }: BotoesLojaProps) {
  return (
    <ul
      aria-label="Instalar pela loja"
      className={cn('flex flex-wrap gap-2.5', className)}
    >
      {lojas.map(({ loja, url }) => {
        const { rotulo, icone } = LOJA_UI[loja]
        return (
          <li key={loja} className="max-w-full">
            {url ? (
              <Button
                asChild
                size="lg"
                className="h-auto min-h-11 max-w-full gap-2 px-5 py-2 font-semibold whitespace-normal"
              >
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={icone} className="size-4" />
                  {rotulo}
                </a>
              </Button>
            ) : (
              <span className="border-border text-muted-foreground inline-flex min-h-11 max-w-full flex-wrap items-center gap-2 rounded-md border border-dashed px-4 py-2 text-sm">
                <FontAwesomeIcon icon={icone} className="size-4" />
                {NOME_DO_NAVEGADOR[loja]}{' '}
                <span className="text-warn font-mono text-xs">
                  {ESTADO_SEM_URL[loja]}
                </span>
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
