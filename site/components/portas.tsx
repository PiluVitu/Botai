import { Secao } from './secao'

export function Portas() {
  return (
    <Secao
      id="portas"
      tituloId="portas-titulo"
      numero={1}
      rotulo="Portas"
      titulo="Um motor, oito portas."
    >
      <p data-esqueleto className="text-muted-foreground font-mono text-xs">
        Em construção: portas (grupo 2)
      </p>
    </Secao>
  )
}
