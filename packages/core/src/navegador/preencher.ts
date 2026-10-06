/// <reference lib="dom" />
import { classificarFormulario } from '../campos'
import { valorPara } from '../campos-formatar'
import type { Pessoa } from '../pessoa'
import type { Contornos } from './contornos'
import {
  cabe,
  campos,
  descrever,
  escrever,
  leuDeVolta,
  preenchivel,
  raizSombraAberta,
  seletor,
  visivel,
  type RaizSombra,
} from './dom'
import type { Registro } from './registro'
import type { Escrito } from './segunda-passada'

export interface LinhaDoFrame {
  idx: number
  rotulo: string
  seletor: string
}

export interface ResultadoFrame {
  preenchidos: LinhaDoFrame[]
  naoReconhecidos: LinhaDoFrame[]
  recusados: LinhaDoFrame[]
  contentType: string
  iframesDeFora: number
}

export interface OpcoesDePreencher {
  raiz: Document | ShadowRoot | Element
  pessoa: Pessoa
  hojeISO: string
  registro: Registro
  contornos: Contornos
  raizSombra?: RaizSombra
  aoEscrever?: (escrito: Escrito) => void
}

export function contarIframesDeFora(raiz: ParentNode): number {
  return Array.from(
    raiz.querySelectorAll<HTMLIFrameElement>('iframe, frame'),
  ).filter((quadro) => quadro.contentDocument === null).length
}

export function preencherDocumento({
  raiz,
  pessoa,
  hojeISO,
  registro,
  contornos,
  raizSombra = raizSombraAberta,
  aoEscrever,
}: OpcoesDePreencher): ResultadoFrame {
  const elementos = Array.from(campos(raiz, raizSombra)).filter(
    (el) => preenchivel(el) && visivel(el),
  )
  const descritores = elementos.map((el) => descrever(el))
  const classes = classificarFormulario(descritores, hojeISO)
  const resultado: ResultadoFrame = {
    preenchidos: [],
    naoReconhecidos: [],
    recusados: [],
    contentType: ((raiz.ownerDocument ?? raiz) as Document).contentType,
    iframesDeFora: contarIframesDeFora(raiz),
  }

  elementos.forEach((el, i) => {
    const classe = classes[i]
    const kind = classe?.kind
    if (kind === 'ignorar') return
    const d = descritores[i]
    const linha = {
      idx: registro.guardar(el),
      rotulo: d.label || d.ariaLabel || d.placeholder || d.name,
      seletor: seletor(el),
    }
    if (kind === undefined) {
      resultado.naoReconhecidos.push(linha)
      contornos.marcar(el, 'nao-reconhecido')
      return
    }
    const valor = valorPara(kind, pessoa, d, classe?.dicas)
    if (valor !== null && cabe(valor, d)) {
      const escreveu = el.value !== valor
      if (escreveu) escrever(el, valor)
      if (leuDeVolta(el, valor)) {
        if (escreveu) aoEscrever?.({ el, valor, lido: el.value })
        resultado.preenchidos.push(linha)
        contornos.marcar(el, 'preenchido')
        return
      }
    }
    resultado.recusados.push(linha)
    contornos.marcar(el, 'nao-reconhecido')
  })
  return resultado
}
