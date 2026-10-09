import { Secao } from './secao'

export function ParaQuem() {
  return (
    <Secao
      id="para-quem"
      tituloId="quem-titulo"
      numero={4}
      rotulo="Para quem"
      titulo="Cada um entra pela sua porta."
    >
      <p data-esqueleto className="text-muted-foreground font-mono text-xs">
        Em construção: para quem (grupo 3)
      </p>
    </Secao>
  )
}
