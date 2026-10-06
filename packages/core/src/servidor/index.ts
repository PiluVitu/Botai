import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { responder } from './rotas'

export { LIMITE_DE_PESSOAS } from './consulta'
export { responder, ROTAS, TIPO_POR_FORMATO, type Resposta } from './rotas'

export const PORTA_PADRAO = 8790
export const HOST_PADRAO = '127.0.0.1'
const PRAZO_PARA_ENCERRAR_MS = 2_000

export interface OpcoesDoServidor {
  porta?: number
  host?: string
}

export interface ServidorNoAr {
  servidor: Server
  url: string
  encerrar(): Promise<void>
}

export function criarServidor(): Server {
  return createServer((req, res) => {
    const resposta = responder(req.method ?? 'GET', req.url ?? '/')
    res.writeHead(resposta.status, {
      ...resposta.cabecalhos,
      'Content-Length': Buffer.byteLength(resposta.corpo),
    })
    res.end(resposta.corpo)
  })
}

function encerrar(servidor: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    const prazo = setTimeout(
      () => servidor.closeAllConnections(),
      PRAZO_PARA_ENCERRAR_MS,
    )
    servidor.close((erro) => {
      clearTimeout(prazo)
      if (erro) reject(erro)
      else resolve()
    })
    servidor.closeIdleConnections()
  })
}

export function iniciarServidor({
  porta = PORTA_PADRAO,
  host = HOST_PADRAO,
}: OpcoesDoServidor = {}): Promise<ServidorNoAr> {
  const servidor = criarServidor()
  return new Promise((resolve, reject) => {
    servidor.once('error', reject)
    servidor.listen(porta, host, () => {
      servidor.off('error', reject)
      const { port } = servidor.address() as AddressInfo
      const hostDaUrl = host.includes(':') ? `[${host}]` : host
      resolve({
        servidor,
        url: `http://${hostDaUrl}:${port}`,
        encerrar: () => encerrar(servidor),
      })
    })
  })
}
