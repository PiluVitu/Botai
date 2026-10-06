/** @jest-environment node */
import { once } from 'node:events'
import { request } from 'node:http'
import { connect, type Socket } from 'node:net'
import {
  HOST_PADRAO,
  iniciarServidor,
  PORTA_PADRAO,
  type ServidorNoAr,
} from './index'

interface RespostaHttp {
  status: number
  cabecalhos: Record<string, string | string[] | undefined>
  corpo: string
}

function pedir(url: string): Promise<RespostaHttp> {
  return new Promise((resolve, reject) => {
    request(url, { agent: false }, (res) => {
      let corpo = ''
      res.setEncoding('utf8')
      res.on('data', (parte: string) => (corpo += parte))
      res.on('end', () =>
        resolve({
          status: res.statusCode ?? 0,
          cabecalhos: res.headers,
          corpo,
        }),
      )
    })
      .on('error', reject)
      .end()
  })
}

interface ClienteParado {
  socket: Socket
  // A resposta crua (cabeçalho e corpo), quando o servidor fechar a conexão.
  resposta: Promise<Buffer>
}

// Pede e para de ler logo no primeiro pedaço: o resto da resposta fica no buffer do servidor.
async function pedirEParar(url: string, alvo: string): Promise<ClienteParado> {
  const { hostname, port } = new URL(url)
  const socket = connect(Number(port), hostname)
  await once(socket, 'connect')
  const partes: Buffer[] = []
  socket.on('data', (parte: Buffer) => partes.push(parte))
  const resposta = new Promise<Buffer>((resolve) =>
    socket.once('close', () => resolve(Buffer.concat(partes))),
  )
  socket.write(`GET ${alvo} HTTP/1.1\r\nHost: botai\r\n\r\n`)
  await once(socket, 'data')
  socket.pause()
  return { socket, resposta }
}

function bytesDoCorpo(resposta: Buffer): {
  recebidos: number
  contentLength: number
} {
  const fim = resposta.indexOf('\r\n\r\n')
  const cabecalho = resposta.subarray(0, fim).toString('latin1')
  return {
    recebidos: resposta.length - fim - 4,
    contentLength: Number(/^content-length: (\d+)$/im.exec(cabecalho)?.[1]),
  }
}

// ~17 MB de corpo: bem mais do que cabe nos buffers do sistema, então quase tudo fica no processo.
const ALVO_GRANDE = '/pessoas?n=10000&semente=lento&hoje=2026-10-05'

let noAr: ServidorNoAr | undefined

afterEach(async () => {
  await noAr?.encerrar()
  noAr = undefined
})

describe('iniciarServidor', () => {
  test('padrões do contrato: porta 8790 e só o loopback', () => {
    expect(PORTA_PADRAO).toBe(8790)
    expect(HOST_PADRAO).toBe('127.0.0.1')
  })

  test('sem host, escuta só em 127.0.0.1 (nunca na rede da máquina)', async () => {
    noAr = await iniciarServidor({ porta: 0 })
    expect(noAr.servidor.address()).toMatchObject({
      address: '127.0.0.1',
      family: 'IPv4',
    })
    expect(noAr.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/)
  })

  test('responde por HTTP com status, Content-Type e Content-Length em bytes', async () => {
    noAr = await iniciarServidor({ porta: 0 })
    const r = await pedir(
      `${noAr.url}/pessoas?n=50&semente=acentos&hoje=2026-10-05&formato=csv`,
    )
    expect(r.status).toBe(200)
    expect(r.cabecalhos['content-type']).toBe(
      'text/csv; charset=utf-8; header=present',
    )
    expect(Number(r.cabecalhos['content-length'])).toBe(
      Buffer.byteLength(r.corpo),
    )
  })

  test('400 por HTTP, com o corpo { erro }', async () => {
    noAr = await iniciarServidor({ porta: 0 })
    const r = await pedir(`${noAr.url}/pessoas?n=0`)
    expect(r.status).toBe(400)
    expect(JSON.parse(r.corpo).erro).toContain('n inválido: 0')
  })

  test('porta ocupada: rejeita com EADDRINUSE', async () => {
    noAr = await iniciarServidor({ porta: 0 })
    const porta = Number(new URL(noAr.url).port)
    await expect(iniciarServidor({ porta })).rejects.toMatchObject({
      code: 'EADDRINUSE',
    })
  })

  // Sem o fechamento das ociosas, uma conexão keep-alive parada segura o close() para sempre.
  test('encerrar não fica preso numa conexão keep-alive parada', async () => {
    noAr = await iniciarServidor({ porta: 0 })
    const { hostname, port } = new URL(noAr.url)
    const socket = connect(Number(port), hostname)
    await new Promise<void>((resolve) =>
      socket.once('connect', () => resolve()),
    )
    socket.write(
      'GET /saude HTTP/1.1\r\nHost: botai\r\nConnection: keep-alive\r\n\r\n',
    )
    await new Promise<void>((resolve) => socket.once('data', () => resolve()))

    const inicio = Date.now()
    await noAr.encerrar()
    noAr = undefined
    expect(Date.now() - inicio).toBeLessThan(2_500)
    socket.destroy()
  })

  // A sonda do revisor: antes, o encerrar() resolvia em 2 ms e o cliente recebia ~1,7 MB dos 17 MB.
  // O Node marca a resposta do res.end(corpo) como terminada mesmo com o corpo ainda no buffer, e o
  // close() a fecha como ociosa; o contrato dá 2 s a quem ainda está recebendo.
  test('encerrar espera a resposta ainda não entregue: o cliente que volta a ler dentro do prazo recebe o corpo inteiro', async () => {
    noAr = await iniciarServidor({ porta: 0 })
    const cliente = await pedirEParar(noAr.url, ALVO_GRANDE)

    const inicio = Date.now()
    const encerrado = noAr.encerrar().then(() => Date.now() - inicio)
    noAr = undefined
    setTimeout(() => cliente.socket.resume(), 300)

    const { recebidos, contentLength } = bytesDoCorpo(await cliente.resposta)
    expect(contentLength).toBeGreaterThan(10_000_000)
    expect(recebidos).toBe(contentLength)
    // Entregue a resposta, a conexão fica ociosa e fecha na hora, sem esperar o prazo.
    expect(await encerrado).toBeLessThan(1_900)
  }, 10_000)

  test('encerrar não fica preso num cliente que parou de ler: derruba a conexão no prazo de 2 s', async () => {
    noAr = await iniciarServidor({ porta: 0 })
    const cliente = await pedirEParar(noAr.url, ALVO_GRANDE)

    const inicio = Date.now()
    await noAr.encerrar()
    noAr = undefined
    const duracao = Date.now() - inicio
    cliente.socket.destroy()
    expect(duracao).toBeGreaterThanOrEqual(1_900)
    expect(duracao).toBeLessThan(3_000)
  }, 10_000)
})
