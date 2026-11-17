import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

const ler = (arquivo: string) =>
  readFileSync(path.join(import.meta.dirname, arquivo), 'utf8')

// tema.ts roda no import (é o primeiro import do popup); cada teste reimporta o módulo.
function simularPreferencia(escuro: boolean) {
  const ouvintes: (() => void)[] = []
  const media = {
    matches: escuro,
    addEventListener: (_tipo: string, ouvinte: () => void) =>
      ouvintes.push(ouvinte),
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media),
  )
  return {
    trocar(novo: boolean) {
      media.matches = novo
      ouvintes.forEach((ouvinte) => ouvinte())
    },
  }
}

describe('tema', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
    document.documentElement.classList.remove('dark')
  })

  it('aplica .dark no <html> quando o sistema está no escuro', async () => {
    simularPreferencia(true)
    await import('./tema')
    expect(document.documentElement).toHaveClass('dark')
  })

  it('fica claro no tema claro e acompanha a troca do sistema', async () => {
    const preferencia = simularPreferencia(false)
    await import('./tema')
    expect(document.documentElement).not.toHaveClass('dark')
    preferencia.trocar(true)
    expect(document.documentElement).toHaveClass('dark')
  })
})

// O meta vale antes de qualquer CSS ou JS: sem ele, o popup pinta claro e só depois escurece.
describe('color-scheme', () => {
  it('o popup declara light dark no <head>', () => {
    const doc = new DOMParser().parseFromString(ler('index.html'), 'text/html')
    expect(
      doc.head.querySelector('meta[name="color-scheme"]'),
    ).toHaveAttribute('content', 'light dark')
  })

  it('o :root aceita os dois esquemas, e o .dark fixa o escuro', () => {
    const css = ler('../../styles.css')
    expect(css).toMatch(/:root\s*\{[^}]*color-scheme:\s*light dark;/)
    expect(css).toMatch(/\.dark\s*\{[^}]*color-scheme:\s*dark;/)
  })
})
