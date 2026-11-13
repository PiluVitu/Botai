/**
 * @jest-environment node
 */
// O Response do route handler é o do Node: o jsdom não o tem.
import { createElement } from 'react'
import Home from '@/app/page'
import PrivacidadePage from '@/app/privacidade/page'
import TermosPage from '@/app/termos/page'
import { llmsFullTxt } from '@/lib/llms'
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

it('responde 200, em texto UTF-8, com as três páginas da produção', async () => {
  const resposta = GET()
  expect(resposta.status).toBe(200)
  expect(resposta.headers.get('content-type')).toBe('text/plain; charset=utf-8')
  const corpo = await resposta.text()
  expect(corpo).toBe(
    llmsFullTxt('https://botai.pilutech.com.br', {
      '/': createElement(Home),
      '/privacidade': createElement(PrivacidadePage),
      '/termos': createElement(TermosPage),
    }),
  )
  expect(corpo).toMatch(/^# Botaí\n\n> /)
  expect(corpo.match(/^URL: .+$/gm)).toEqual([
    'URL: https://botai.pilutech.com.br/',
    'URL: https://botai.pilutech.com.br/privacidade',
    'URL: https://botai.pilutech.com.br/termos',
  ])
})

it('SITE_URL troca a origem das URLs e dos links do site', async () => {
  process.env.SITE_URL = 'https://preview.exemplo.dev'
  const corpo = await GET().text()
  expect(corpo).toContain('URL: https://preview.exemplo.dev/termos')
  expect(corpo).toContain('(https://preview.exemplo.dev/privacidade)')
  expect(corpo).not.toContain('https://botai.pilutech.com.br')
})
