/// <reference lib="dom" />
import type { Pessoa } from '../pessoa'
import { SEM_CONTORNOS } from './contornos'
import { preencherDocumento, type ResultadoFrame } from './preencher'
import { criarRegistro } from './registro'
import { agendarSegundaPassada, type Escrito } from './segunda-passada'

export const NOME_DO_GLOBAL = '__botaiNavegador'

export interface OpcoesNaPagina {
  segundaPassada: boolean
}

export interface ApiDoNavegador {
  preencher(
    alvo: Document | Element,
    pessoa: Pessoa,
    hojeISO: string,
    opcoes: OpcoesNaPagina,
  ): Promise<ResultadoFrame>
}

export async function preencherNaPagina(
  alvo: Document | Element,
  pessoa: Pessoa,
  hojeISO: string,
  opcoes: OpcoesNaPagina,
): Promise<ResultadoFrame> {
  const escritos: Escrito[] = []
  const resultado = preencherDocumento({
    raiz: alvo,
    pessoa,
    hojeISO,
    registro: criarRegistro(),
    contornos: SEM_CONTORNOS,
    aoEscrever: (escrito) => escritos.push(escrito),
  })
  if (opcoes.segundaPassada)
    await agendarSegundaPassada(escritos, (acao, ms) => {
      setTimeout(acao, ms)
    })
  return resultado
}

export function instalarNoGlobal(alvo: object = globalThis): void {
  const api: ApiDoNavegador = { preencher: preencherNaPagina }
  Object.assign(alvo, { [NOME_DO_GLOBAL]: api })
}
