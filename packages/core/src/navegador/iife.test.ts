/** @jest-environment node */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createContext, runInContext } from 'node:vm'

const SCRIPT = resolve(__dirname, '../../scripts/construir-iife.mjs')

describe('navegador.iife.js', () => {
  it('executado numa página vazia, cria só o global __botaiNavegador, com preencher', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'botai-iife-'))
    try {
      const saida = join(pasta, 'navegador.iife.js')
      execFileSync(process.execPath, [SCRIPT, saida])
      const pagina = createContext({})
      runInContext(readFileSync(saida, 'utf8'), pagina)
      expect(Object.keys(pagina)).toEqual(['__botaiNavegador'])
      expect(typeof pagina.__botaiNavegador.preencher).toBe('function')
    } finally {
      rmSync(pasta, { recursive: true, force: true })
    }
  }, 30_000)
})
