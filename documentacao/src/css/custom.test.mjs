import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const AQUI = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const css = readFileSync(join(AQUI, 'custom.css'), 'utf8')
const ui = readFileSync(require.resolve('@piluvitu/ui/styles.css'), 'utf8')

function bloco(texto, seletor) {
  const inicio = texto.indexOf(`${seletor} {`)
  assert.notEqual(inicio, -1, `bloco ${seletor}`)
  let profundidade = 0
  for (let i = texto.indexOf('{', inicio); i < texto.length; i++) {
    if (texto[i] === '{') profundidade++
    if (texto[i] === '}' && --profundidade === 0)
      return texto.slice(inicio, i + 1)
  }
  assert.fail(`bloco ${seletor} sem fechamento`)
}

function variaveis(trecho) {
  const semComentarios = trecho.replace(/\/\*[\s\S]*?\*\//g, '')
  return Object.fromEntries(
    [...semComentarios.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(
      ([, nome, valor]) => [nome, valor.trim()],
    ),
  )
}

const TOKENS = {
  '--botai-fundo': '--background',
  '--botai-cartao': '--card',
  '--botai-borda': '--border',
  '--botai-texto': '--foreground',
  '--botai-texto-suave': '--muted-foreground',
  '--botai-primaria': '--primary',
}

const claro = variaveis(bloco(css, ':root'))
const escuro = variaveis(bloco(css, "[data-theme='dark']"))

for (const [tema, nosso, seletorDaUi] of [
  ['claro', claro, ':root'],
  ['escuro', escuro, '.dark'],
])
  test(`tema ${tema}: os tokens são os do @piluvitu/ui (${seletorDaUi})`, () => {
    const daUi = variaveis(bloco(ui, seletorDaUi))
    for (const [token, original] of Object.entries(TOKENS))
      assert.equal(nosso[token], daUi[original], `${token} = ${original}`)
  })

test('os valores pedidos no design da landing', () => {
  assert.equal(escuro['--botai-fundo'], '220 33% 5%')
  assert.equal(escuro['--botai-cartao'], '222 36% 9%')
  assert.equal(escuro['--botai-borda'], '205 40% 18%')
  assert.equal(escuro['--botai-texto'], '215 33% 93%')
  assert.equal(escuro['--botai-primaria'], '198 93% 60%')
  assert.equal(claro['--botai-primaria'], '198 93% 26%')
  assert.equal(claro['--botai-fundo'], '220 50% 98%')
})

test('as variáveis do Infima saem dos tokens, nos dois temas', () => {
  for (const [infima, token] of [
    ['--ifm-color-primary', '--botai-primaria'],
    ['--ifm-background-color', '--botai-fundo'],
    ['--ifm-background-surface-color', '--botai-cartao'],
    ['--ifm-font-color-base', '--botai-texto'],
    ['--ifm-toc-border-color', '--botai-borda'],
  ])
    assert.equal(claro[infima], `hsl(var(${token}))`, infima)
})

test('fontes do @fontsource, sem CDN externo', () => {
  assert.match(
    css,
    /@import '@fontsource-variable\/plus-jakarta-sans\/wght\.css';/,
  )
  assert.match(
    css,
    /@import '@fontsource-variable\/jetbrains-mono\/wght\.css';/,
  )
  assert.match(claro['--ifm-font-family-base'], /^'Plus Jakarta Sans Variable'/)
  assert.match(
    claro['--ifm-font-family-monospace'],
    /^'JetBrains Mono Variable'/,
  )
  assert.doesNotMatch(css, /https?:\/\/|url\(\s*['"]?\/\//)
})
