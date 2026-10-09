import { cn } from '@piluvitu/ui/cn'
import { ATALHOS_POR_SISTEMA, INSERIR_UM_CAMPO } from '@/lib/extensao'
import { CARTAO } from './cartao'

const LEGENDA = 'atalhos-legenda'
const CELULA = 'px-[18px] py-3 text-left'
const CABECALHO = cn(CELULA, 'font-semibold')
const TECLA =
  'border-border bg-muted rounded-[6px] border px-2 py-0.5 font-mono text-[13px] whitespace-nowrap'

export function TabelaAtalhos() {
  return (
    <div
      role="region"
      aria-labelledby={LEGENDA}
      tabIndex={0}
      className={cn(
        CARTAO,
        'focus-visible:ring-ring overflow-x-auto outline-none focus-visible:ring-2',
      )}
    >
      <table className="w-full border-collapse text-sm">
        <caption
          id={LEGENDA}
          className="text-muted-foreground px-[18px] pt-3.5 text-left font-mono text-[11px] tracking-[0.2em] uppercase"
        >
          Atalhos por sistema
        </caption>
        <thead>
          <tr className="text-muted-foreground font-mono text-xs">
            <th scope="col" className={CABECALHO}>
              Sistema
            </th>
            <th scope="col" className={CABECALHO}>
              Preencher a página
            </th>
          </tr>
        </thead>
        <tbody>
          {ATALHOS_POR_SISTEMA.map(({ sistema, tecla, excecoes }) => (
            <tr key={sistema} className="border-border border-t">
              <th scope="row" className={CABECALHO}>
                {sistema}
              </th>
              <td className={cn(CELULA, 'leading-[1.9]')}>
                <kbd className={TECLA}>{tecla}</kbd>
                {excecoes.map((excecao) => (
                  <span
                    key={excecao.navegador}
                    className="text-muted-foreground"
                  >
                    {' · '}
                    <kbd className={cn(TECLA, 'text-foreground')}>
                      {excecao.tecla}
                    </kbd>{' '}
                    no {excecao.navegador}
                  </span>
                ))}
              </td>
            </tr>
          ))}
          <tr className="border-border border-t">
            <th scope="row" className={CABECALHO}>
              Um campo só
            </th>
            <td className={cn(CELULA, 'font-mono text-[13px]')}>
              {INSERIR_UM_CAMPO}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
