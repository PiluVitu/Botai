import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@piluvitu/ui/cn'
import type { ReactNode } from 'react'
import {
  HOJE_DO_EXEMPLO,
  PESSOA_DO_EXEMPLO,
  SEMENTE_DO_EXEMPLO,
} from '@/lib/exemplo'
import { PORTAS } from '@/lib/portas'
import { CARTAO } from './cartao'
import { Secao } from './secao'

const ROTULO =
  'text-muted-foreground font-mono text-[11px] tracking-[0.2em] uppercase'
const CAIXA = 'border-primary bg-background rounded-[14px] border-[1.5px]'
const COLUNA = 'flex min-w-0 flex-col gap-3 py-4'

const { nome, cpf, celular, endereco, empresa, cartao } = PESSOA_DO_EXEMPLO
const SAIDA: [string, string][] = [
  ['nome', nome.completo],
  ['cpf', cpf],
  ['celular', celular.formatado],
  ['cep', `${endereco.cep} · ${endereco.cidade}, ${endereco.uf}`],
  ['cnpj', empresa.cnpj],
  ['cartão', cartao.numeroFormatado],
]

const HOJE = <code className="text-foreground text-[15px]">hoje</code>

const CARTOES: [string, ReactNode][] = [
  [
    '01 · no CI',
    'O teste falha e o relatório leva a pessoa que foi usada, com a semente.',
  ],
  [
    '02 · na sua máquina',
    <>
      A mesma semente e o mesmo {HOJE} no terminal devolvem a mesma pessoa,
      campo por campo.
    </>,
  ],
  [
    '03 · entre versões',
    'Arquivos dourados guardam as pessoas esperadas de um conjunto de sementes e são conferidos a cada PR. Os 12 não mudaram da 0.2.0 à 0.4.1. Fixe a versão do pacote.',
  ],
]

export function MesmaSemente() {
  return (
    <Secao
      id="mesma-pessoa"
      tituloId="semente-titulo"
      numero={2}
      rotulo="Mesma pessoa"
      titulo="Mesma semente, mesma pessoa."
      apoio={
        <>
          Com a mesma semente e o mesmo {HOJE}, toda porta que aceita semente
          devolve a mesma pessoa. O teste que falhou no CI roda na sua máquina
          com os mesmos dados.
        </>
      }
    >
      <div
        className={cn(
          CARTAO,
          'grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-center p-[clamp(20px,3vw,36px)]',
        )}
      >
        <div className={COLUNA}>
          <p className={ROTULO}>Entrada</p>
          <code
            className={cn(
              CAIXA,
              'flex flex-col gap-2 p-[18px] font-mono text-[15px]',
            )}
          >
            <span>
              <span className="text-muted-foreground">semente:</span>{' '}
              <span className="text-primary">{SEMENTE_DO_EXEMPLO}</span>
            </span>
            <span>
              <span className="text-muted-foreground">hoje:</span>{' '}
              {`'${HOJE_DO_EXEMPLO}'`}
            </span>
          </code>
          <p className="text-muted-foreground text-[13px] leading-[1.5]">
            No Playwright, a semente é o nome do teste.
          </p>
        </div>
        <ul aria-label="Portas" className="flex flex-col gap-1.5 py-4">
          {PORTAS.filter((porta) => porta.semente).map((porta) => (
            <li key={porta.id} className="flex items-center">
              <span aria-hidden className="bg-primary/45 h-px flex-1" />
              <span className="border-border bg-muted inline-flex min-w-[150px] shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[12.5px]">
                <FontAwesomeIcon
                  icon={porta.icone}
                  className="text-primary size-[13px]"
                />
                {porta.nome}
              </span>
              <span aria-hidden className="bg-primary/45 h-px flex-1" />
            </li>
          ))}
        </ul>
        <div className={COLUNA}>
          <p className={ROTULO}>Saída</p>
          <div className={cn(CAIXA, 'flex flex-col px-[18px] py-1.5')}>
            <dl>
              {SAIDA.map(([chave, valor]) => (
                <div
                  key={chave}
                  className="border-border flex justify-between gap-3 border-b py-[9px] text-[13.5px]"
                >
                  <dt className="text-muted-foreground shrink-0 font-mono text-xs">
                    {chave}
                  </dt>
                  <dd className="min-w-0 text-right [overflow-wrap:anywhere]">
                    {valor}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-ok flex items-center gap-2 pt-2.5 pb-2 font-mono text-xs">
              <FontAwesomeIcon icon={faCircleCheck} className="size-3.5" />
              {`a semente ${SEMENTE_DO_EXEMPLO} é um dos 12 arquivos dourados`}
            </p>
          </div>
        </div>
      </div>
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
        {CARTOES.map(([rotulo, texto]) => (
          <li
            key={rotulo}
            className="border-border flex flex-col gap-2.5 rounded-lg border p-[22px]"
          >
            <span className="text-primary font-mono text-xs">{rotulo}</span>
            <p className="text-[15px] leading-[1.55] text-pretty">{texto}</p>
          </li>
        ))}
      </ol>
    </Secao>
  )
}
