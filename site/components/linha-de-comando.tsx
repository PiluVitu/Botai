import { cn } from '@piluvitu/ui/cn'
import { Fragment } from 'react'

type LinhaDeComandoProps = {
  linhas: readonly string[]
  prompt?: boolean
  className?: string
}

export function LinhaDeComando({
  linhas,
  prompt = false,
  className,
}: LinhaDeComandoProps) {
  return (
    <code
      className={cn(
        'block [overflow-wrap:anywhere] whitespace-pre-wrap',
        className,
      )}
    >
      {linhas.map((linha) => (
        <span key={linha} className="block pl-[2ch] -indent-[2ch]">
          {prompt ? (
            <span aria-hidden className="text-primary mr-[1ch] select-none">
              $
            </span>
          ) : null}
          <span>
            {linha.split(' ').map((palavra, indice) => (
              <Fragment key={indice}>
                {indice > 0 ? ' ' : null}
                {palavra.startsWith('-') ? (
                  <span className="inline-block indent-0">{palavra}</span>
                ) : (
                  palavra
                )}
              </Fragment>
            ))}
          </span>
        </span>
      ))}
    </code>
  )
}
