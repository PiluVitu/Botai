import { Secao } from './secao'

export function MesmaSemente() {
  return (
    <Secao
      id="mesma-pessoa"
      tituloId="semente-titulo"
      numero={2}
      rotulo="Mesma pessoa"
      titulo="Mesma semente, mesma pessoa."
    >
      <p data-esqueleto className="text-muted-foreground font-mono text-xs">
        Em construção: mesma semente (grupo 2)
      </p>
    </Secao>
  )
}
