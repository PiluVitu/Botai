export interface LinhaDoPreenchimento {
  frame: string
  rotulo: string
  seletor: string
}

export interface ResultadoDoPreenchimento {
  preenchidos: LinhaDoPreenchimento[]
  naoReconhecidos: LinhaDoPreenchimento[]
  recusados: LinhaDoPreenchimento[]
}

interface LinhaRecebida {
  rotulo: string
  seletor: string
}

export interface ResultadoDeUmFrame {
  preenchidos: readonly LinhaRecebida[]
  naoReconhecidos: readonly LinhaRecebida[]
  recusados: readonly LinhaRecebida[]
}

export interface FrameComResultado {
  frame: string
  resultado: ResultadoDeUmFrame
}

export function juntarFrames(
  frames: readonly FrameComResultado[],
): ResultadoDoPreenchimento {
  const linhas = (lista: keyof ResultadoDeUmFrame) =>
    frames.flatMap(({ frame, resultado }) =>
      resultado[lista].map(({ rotulo, seletor }) => ({
        frame,
        rotulo,
        seletor,
      })),
    )
  return {
    preenchidos: linhas('preenchidos'),
    naoReconhecidos: linhas('naoReconhecidos'),
    recusados: linhas('recusados'),
  }
}
