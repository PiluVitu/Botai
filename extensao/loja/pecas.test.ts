import { describe, expect, it } from 'vitest'
import { CAPTURAS, CENAS_DA_OPERA, COPIAS, PECAS_DA_LOJA } from './pecas'

describe('peças da loja', () => {
  it('seis capturas, cada cena nos dois temas, na ordem que o site mostra', () => {
    expect(CAPTURAS.map((c) => c.nome)).toEqual([
      '01-pagina-preenchida-escuro',
      '02-pagina-preenchida-claro',
      '03-pessoa-de-teste-escuro',
      '04-pessoa-de-teste-claro',
      '05-resultado-escuro',
      '06-resultado-claro',
    ])
  })

  it('o Opera recebe ao menos duas capturas', () => {
    expect(CENAS_DA_OPERA.length).toBeGreaterThanOrEqual(2)
  })

  it('nenhum arquivo repetido', () => {
    const arquivos = PECAS_DA_LOJA.map((p) => p.arquivo)
    expect(new Set(arquivos).size).toBe(arquivos.length)
  })

  // A landing (site/) usa o ícone, os ícones do app e as capturas de 1280×800. O logo do card
  // da PiluLabs, no monorepo, é uma cópia fixa do ícone, fora deste gerador.
  it('as cópias para a landing', () => {
    expect(COPIAS.slice(0, 3)).toEqual([
      { origem: 'icone-128.png', destino: 'site/public/icone-128.png' },
      { origem: 'edge-logo-300.png', destino: 'site/app/icon.png' },
      { origem: 'edge-logo-300.png', destino: 'site/app/apple-icon.png' },
    ])
    expect(COPIAS.slice(3)).toEqual(
      CAPTURAS.map((captura) => ({
        origem: `capturas/1280x800/${captura.nome}.png`,
        destino: `site/public/capturas/${captura.nome}.png`,
      })),
    )
  })
})
