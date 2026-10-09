import { NOTA_DAS_PORTAS, PORTAS } from '@/lib/portas'
import { CartaoPorta } from './cartao-porta'
import { Secao } from './secao'

export function Portas() {
  return (
    <Secao
      id="portas"
      tituloId="portas-titulo"
      numero={1}
      rotulo="Portas"
      titulo="Um motor, oito portas."
      apoio="Todas usam o mesmo gerador, e as que preenchem formulário usam o mesmo motor. Escolha a que cabe no seu teste."
    >
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4">
        {PORTAS.map((porta) => (
          <CartaoPorta key={porta.id} porta={porta} />
        ))}
      </ul>
      <p className="text-muted-foreground text-sm">{NOTA_DAS_PORTAS}</p>
    </Secao>
  )
}
