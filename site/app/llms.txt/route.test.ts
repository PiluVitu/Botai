/**
 * @jest-environment node
 */
// O Response do route handler é o do Node: o jsdom não o tem.
import { llmsTxt } from '@/lib/llms'
import { lerUrlsDasLojas } from '@/lib/lojas'
import { dynamic, GET } from './route'

const SITE_URL_ORIGINAL = process.env.SITE_URL
beforeEach(() => {
  delete process.env.SITE_URL
})
afterAll(() => {
  if (SITE_URL_ORIGINAL !== undefined) process.env.SITE_URL = SITE_URL_ORIGINAL
})

it('é estático: sai pronto do build', () => {
  expect(dynamic).toBe('force-static')
})

it('responde 200, em texto UTF-8, com o llms.txt da produção e do lojas.json', async () => {
  const resposta = GET()
  expect(resposta.status).toBe(200)
  expect(resposta.headers.get('content-type')).toBe('text/plain; charset=utf-8')
  const corpo = await resposta.text()
  expect(corpo).toBe(
    llmsTxt('https://botai.pilutech.com.br', lerUrlsDasLojas()),
  )
  expect(corpo).toMatch(/^# Botaí\n\n> /)
  expect(corpo).toContain('(https://botai.pilutech.com.br/privacidade)')
})

it('SITE_URL troca a origem dos links do site', async () => {
  process.env.SITE_URL = 'https://preview.exemplo.dev'
  const corpo = await GET().text()
  expect(corpo).toContain('(https://preview.exemplo.dev/termos)')
  expect(corpo).not.toContain('https://botai.pilutech.com.br')
})
