import type { FieldKind } from '@pilutech/botai-core/campos'
import { browser } from 'wxt/browser'
import type { ResumoPreenchimento } from './resultado'

export type Mensagem =
  | { tipo: 'preencher'; tabId: number }
  | { tipo: 'mostrar'; tabId: number; documentId: string; idx: number }
  | {
      tipo: 'inserir'
      tabId: number
      frameId: number
      kind: FieldKind
      alvoId?: number
    }

export type RespostaPreencher =
  | { ok: true; resumo: ResumoPreenchimento }
  | { ok: false; motivo: 'proibida' | 'arquivo-sem-acesso' }

const inteiro = (valor: unknown): boolean => Number.isInteger(valor)

export function ehMensagem(valor: unknown): valor is Mensagem {
  if (typeof valor !== 'object' || valor === null) return false
  const m = valor as Record<string, unknown>
  if (!inteiro(m.tabId)) return false
  switch (m.tipo) {
    case 'preencher':
      return true
    case 'mostrar':
      return typeof m.documentId === 'string' && inteiro(m.idx)
    case 'inserir':
      return (
        inteiro(m.frameId) &&
        typeof m.kind === 'string' &&
        (m.alvoId === undefined || inteiro(m.alvoId))
      )
    default:
      return false
  }
}

export function enviar(m: Mensagem): Promise<unknown> {
  return browser.runtime.sendMessage(m)
}
