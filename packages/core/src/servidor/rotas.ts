import { envelopar, FORMATO } from '../envelope'
import { pessoaResolvida } from '../gerar'
import { textoDoLote } from '../lote'
import type { Formato } from '../plano'
import { MOTOR } from '../versao'
import {
  lerConsultaDaPessoa,
  lerConsultaDasPessoas,
  mensagemDeUso,
} from './consulta'

export interface Resposta {
  status: number
  cabecalhos: Record<string, string>
  corpo: string
}

export const ROTAS = ['/pessoa', '/pessoas', '/saude'] as const

const TIPO_JSON = 'application/json; charset=utf-8'

export const TIPO_POR_FORMATO: Record<Formato, string> = {
  json: TIPO_JSON,
  ndjson: 'application/x-ndjson; charset=utf-8',
  csv: 'text/csv; charset=utf-8; header=present',
  sql: 'application/sql; charset=utf-8',
}

const SEMPRE = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
}

function texto(status: number, tipo: string, corpo: string): Resposta {
  return { status, cabecalhos: { ...SEMPRE, 'Content-Type': tipo }, corpo }
}

function json(status: number, corpo: unknown): Resposta {
  return texto(status, TIPO_JSON, `${JSON.stringify(corpo, null, 2)}\n`)
}

function pessoa(params: URLSearchParams): Resposta {
  const r = lerConsultaDaPessoa(params)
  return json(200, envelopar(r.semente, r.hoje, pessoaResolvida(r)))
}

function pessoas(params: URLSearchParams): Resposta {
  const pedido = lerConsultaDasPessoas(params)
  const corpo = Array.from(textoDoLote(pedido.n, pedido.opcoes, pedido)).join(
    '',
  )
  return texto(200, TIPO_POR_FORMATO[pedido.formato], corpo)
}

function urlDe(alvo: string): URL | undefined {
  try {
    return new URL(alvo, 'http://botai.local')
  } catch {
    return undefined
  }
}

export function responder(metodo: string, alvo: string): Resposta {
  const url = urlDe(alvo)
  if (url === undefined) return json(400, { erro: `alvo inválido: ${alvo}` })
  if (!(ROTAS as readonly string[]).includes(url.pathname))
    return json(404, {
      erro: `rota desconhecida: ${url.pathname} (rotas: ${ROTAS.join(', ')})`,
    })
  if (metodo !== 'GET') {
    const r = json(405, { erro: `método ${metodo} não aceito: use GET` })
    return { ...r, cabecalhos: { ...r.cabecalhos, Allow: 'GET' } }
  }
  try {
    if (url.pathname === '/saude')
      return json(200, { ok: true, formato: FORMATO, motor: MOTOR })
    return url.pathname === '/pessoa'
      ? pessoa(url.searchParams)
      : pessoas(url.searchParams)
  } catch (erro) {
    const mensagem = mensagemDeUso(erro)
    if (mensagem !== undefined) return json(400, { erro: mensagem })
    console.error(erro)
    return json(500, { erro: 'erro interno do botai; veja o log do servidor' })
  }
}
