import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import { dirname, join, sep } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { ROTAS, rotasNaoEstaticas } from './conferir-rotas-estaticas.mjs'

const estatica = { initialRevalidateSeconds: false }
const APP = join(dirname(fileURLToPath(import.meta.url)), '..', 'app')

test('rota estática passa, com ou sem o sufixo de hash das imagens', () => {
  assert.deepEqual(
    rotasNaoEstaticas({ '/': estatica, '/opengraph-image-1a2b3c': estatica }, [
      '/',
      '/opengraph-image',
    ]),
    [],
  )
})

test('rota com revalidate falha', () => {
  assert.deepEqual(
    rotasNaoEstaticas({ '/': { initialRevalidateSeconds: 60 } }, ['/']),
    ['/'],
  )
})

test('rota fora do manifesto falha: virou dinâmica ou sumiu', () => {
  assert.deepEqual(rotasNaoEstaticas({}, ['/privacidade']), ['/privacidade'])
})

test('a rota não é confundida com uma filha', () => {
  assert.deepEqual(
    rotasNaoEstaticas({ '/privacidade/opengraph-image': estatica }, [
      '/privacidade',
    ]),
    ['/privacidade'],
  )
})

// Os arquivos do SEO (robots, sitemap, llms.txt, llms-full.txt) têm de sair prontos do build.
test('os arquivos de texto do SEO estão em ROTAS', () => {
  for (const rota of [
    '/robots.txt',
    '/sitemap.xml',
    '/llms.txt',
    '/llms-full.txt',
  ])
    assert.ok(ROTAS.includes(rota), rota)
})

// Route handler novo no app/ entra em ROTAS no mesmo PR.
test('todo route handler do app/ está em ROTAS', () => {
  const rotas = readdirSync(APP, { recursive: true })
    .filter((arquivo) => /(^|[\\/])route\.ts$/.test(arquivo))
    .map((arquivo) => `/${dirname(arquivo).split(sep).join('/')}`)
    .sort()
  assert.deepEqual(rotas, [
    '/favicon.ico',
    '/llms-full.txt',
    '/llms.txt',
    '/robots.txt',
  ])
  for (const rota of rotas) assert.ok(ROTAS.includes(rota), rota)
})
