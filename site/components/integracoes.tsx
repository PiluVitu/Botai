import { Secao } from './secao'

export function Integracoes() {
  return (
    <Secao
      tituloId="integracoes-titulo"
      numero={5}
      rotulo="Integrações"
      titulo="O que foi testado, e o que ainda não."
    >
      <p data-esqueleto className="text-muted-foreground font-mono text-xs">
        Em construção: integrações (grupo 3)
      </p>
    </Secao>
  )
}
