import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const SRC = __dirname
const PROIBIDOS = [
  /\bprocess\./,
  /from 'node:/,
  /\brequire\(/,
  /\bBuffer\b/,
  /\bdocument\./,
  /\bwindow\./,
]
// src/servidor/index.ts liga o servidor ao node:http (fase 2); consulta.ts e rotas.ts seguem portáveis.
const SO_NO_NODE = [join('servidor', 'index.ts')]

function modulosDeProducao(pasta: string): string[] {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(pasta, entrada.name)
    if (entrada.isDirectory())
      return entrada.name === 'bin' ? [] : modulosDeProducao(caminho)
    const ehModulo =
      entrada.name.endsWith('.ts') &&
      !entrada.name.endsWith('.test.ts') &&
      !SO_NO_NODE.includes(relative(SRC, caminho))
    return ehModulo ? [caminho] : []
  })
}

// O motor roda em Node, Bun, Deno e no navegador (extensão e Playwright):
// só src/bin conversa com o processo.
test('fora de src/bin, nenhum módulo usa API de Node ou do navegador', () => {
  const violacoes = modulosDeProducao(SRC).flatMap((arquivo) => {
    const texto = readFileSync(arquivo, 'utf8')
    return PROIBIDOS.filter((proibido) => proibido.test(texto)).map(
      (proibido) => `${relative(SRC, arquivo)}: ${proibido}`,
    )
  })
  expect(violacoes).toEqual([])
})
