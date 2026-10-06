import { createServer, type Server } from 'node:http'
import type { AddressInfo, Socket } from 'node:net'
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
  const servidor = createServer((req, res) => {
    const resposta = responder(req.method ?? 'GET', req.url ?? '/')
    res.writeHead(resposta.status, {
      ...resposta.cabecalhos,
      'Content-Length': Buffer.byteLength(resposta.corpo),
    })
    // O close() do Node fecha como ociosa a conexão de resposta já terminada, mesmo com o corpo no buffer:
    // por isso o end só vem com o corpo fora do processo, e a que fica ociosa depois do close() fecha no finish.
    res.write(resposta.corpo, () => res.end())
    res.once('finish', () => {
      if (!servidor.listening) servidor.closeIdleConnections()
    })
  })
  return servidor
}

function encerrar(
  servidor: Server,
  conexoes: ReadonlySet<Socket>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // O closeAllConnections() do Bun 1.4.2 não derruba conexão com resposta em curso; o destroy derruba.
    const prazo = setTimeout(() => {
      for (const conexao of conexoes) conexao.destroy()
    }, PRAZO_PARA_ENCERRAR_MS)
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
  const conexoes = new Set<Socket>()
  servidor.on('connection', (conexao: Socket) => {
    conexoes.add(conexao)
    conexao.once('close', () => conexoes.delete(conexao))
  })
  return new Promise((resolve, reject) => {
    servidor.once('error', reject)
    servidor.listen(porta, host, () => {
      servidor.off('error', reject)
      const { port } = servidor.address() as AddressInfo
      const hostDaUrl = host.includes(':') ? `[${host}]` : host
      resolve({
        servidor,
        url: `http://${hostDaUrl}:${port}`,
        encerrar: () => encerrar(servidor, conexoes),
      })
    })
  })
}
