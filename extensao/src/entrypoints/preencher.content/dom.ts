import {
  campos as camposDoMotor,
  elementoEmFoco as elementoEmFocoDoMotor,
  type Campo,
} from '@pilutech/botai-core/navegador'
import { browser } from 'wxt/browser'

export {
  cabe,
  descrever,
  ehCampo,
  escrever,
  leuDeVolta,
  preenchivel,
  seletor,
  tipoNaoPreenchivel,
  visivel,
  type Campo,
} from '@pilutech/botai-core/navegador'

type ComRaizFechada = Element & {
  readonly openOrClosedShadowRoot?: ShadowRoot | null
}

export function raizSombraDaExtensao(el: Element): ShadowRoot | null {
  if (el.shadowRoot) return el.shadowRoot
  if (!(el instanceof HTMLElement)) return null
  // O Firefox não tem browser.dom: o equivalente é um atributo do elemento (não método), só em content scripts.
  return import.meta.env.FIREFOX
    ? ((el as ComRaizFechada).openOrClosedShadowRoot ?? null)
    : (browser.dom.openOrClosedShadowRoot(el) ?? null)
}

export function campos(raiz: Document | ShadowRoot): Generator<Campo> {
  return camposDoMotor(raiz, raizSombraDaExtensao)
}

export function elementoEmFoco(doc: Document): Element | null {
  return elementoEmFocoDoMotor(doc, raizSombraDaExtensao)
}
