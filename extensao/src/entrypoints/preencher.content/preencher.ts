import { preencherDocumento as preencherNoMotor } from '@pilutech/botai-core/navegador'
import type { Pessoa } from '@pilutech/botai-core/pessoa'
import type { ResultadoFrame } from '../../lib/resultado'
import type { Contornos } from './contornos'
import { raizSombraDaExtensao } from './dom'
import type { Registro } from './registro'
import type { Escrito } from './segunda-passada'

export { contarIframesDeFora } from '@pilutech/botai-core/navegador'

export function preencherDocumento(
  pessoa: Pessoa,
  hojeISO: string,
  registro: Registro,
  contornos: Contornos,
  aoEscrever?: (escrito: Escrito) => void,
): ResultadoFrame {
  return preencherNoMotor({
    raiz: document,
    pessoa,
    hojeISO,
    registro,
    contornos,
    raizSombra: raizSombraDaExtensao,
    aoEscrever,
  })
}
