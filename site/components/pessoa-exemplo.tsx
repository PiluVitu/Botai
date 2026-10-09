import { Secao } from './secao'

export function PessoaExemplo() {
  return (
    <Secao
      tituloId="pessoa-titulo"
      numero={3}
      rotulo="A pessoa"
      titulo="Uma pessoa onde tudo bate."
      tituloClassName="max-w-[640px] text-balance"
    >
      <p data-esqueleto className="text-muted-foreground font-mono text-xs">
        Em construção: a pessoa (grupo 3)
      </p>
    </Secao>
  )
}
