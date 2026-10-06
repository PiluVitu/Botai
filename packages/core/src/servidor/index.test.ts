/** @jest-environment node */
import { request } from 'node:http'
import { connect } from 'node:net'
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
})
