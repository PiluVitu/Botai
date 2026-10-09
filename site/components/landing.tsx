import type { ModeloDaLanding } from '@/lib/modelo'
import { Cabecalho } from './cabecalho'
import { ChamadaFinal } from './chamada-final'
import { Cuidados } from './cuidados'
import { Extensao } from './extensao'
import { Hero } from './hero'
import { Integracoes } from './integracoes'
import { MesmaSemente } from './mesma-semente'
import { Numeros } from './numeros'
import { ParaQuem } from './para-quem'
import { PessoaExemplo } from './pessoa-exemplo'
import { Portas } from './portas'
import { Rodape } from './rodape'

export function Landing({ lojas }: ModeloDaLanding) {
  return (
    <div className="min-h-screen overflow-x-clip">
      <div className="mx-auto max-w-[1264px] px-[clamp(16px,4vw,32px)]">
        <Cabecalho />
        <main id="topo">
          <Hero />
          <Numeros />
          <Portas />
          <MesmaSemente />
          <PessoaExemplo />
          <ParaQuem />
          <Integracoes />
          <Extensao lojas={lojas} />
          <Cuidados />
          <ChamadaFinal />
        </main>
        <Rodape />
      </div>
    </div>
  )
}
