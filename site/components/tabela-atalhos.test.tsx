import { render, screen, within } from '@testing-library/react'
import { TabelaAtalhos } from './tabela-atalhos'

const LEGENDA = 'Atalhos por sistema'

describe('TabelaAtalhos', () => {
  // Na v2 a legenda aparece (é o rótulo da moldura no design), não só para leitor de tela.
  it('tem a legenda visível "Atalhos por sistema"', () => {
    render(<TabelaAtalhos />)
    const tabela = screen.getByRole('table', { name: LEGENDA })
    const legenda = tabela.querySelector('caption')
    expect(legenda).toHaveTextContent(LEGENDA)
    expect(legenda).not.toHaveClass('sr-only')
  })

  // A 320 px a tabela pode rolar dentro da moldura. Sem foco nela, quem usa teclado não rola,
  // e o axe acusa scrollable-region-focusable (serious, WCAG 2.1.1).
  it('a moldura que rola é uma região focável, com o nome da legenda', () => {
    render(<TabelaAtalhos />)
    const regiao = screen.getByRole('region', { name: LEGENDA })
    expect(regiao).toHaveAttribute('tabindex', '0')
    expect(regiao).toHaveClass('overflow-x-auto', 'focus-visible:ring-2')
  })

  it('colunas Sistema e Preencher a página', () => {
    render(<TabelaAtalhos />)
    expect(
      screen.getAllByRole('columnheader').map((th) => th.textContent),
    ).toEqual(['Sistema', 'Preencher a página'])
  })

  // É o que a página publica, lido do ATALHOS do core: o Firefox no Linux é a exceção do manifesto.
  it('uma linha por sistema, o Firefox no Linux e o Inserir de um campo só', () => {
    render(<TabelaAtalhos />)
    const [, ...linhas] = screen.getAllByRole('row')
    expect(
      linhas.map((linha) =>
        [...linha.querySelectorAll('th, td')].map((c) => c.textContent),
      ),
    ).toEqual([
      ['macOS', '⌥⇧P'],
      ['Windows', 'Ctrl+Shift+Y'],
      ['Linux', 'Ctrl+Shift+Y · Alt+Shift+P no Firefox'],
      ['Um campo só', 'botão direito › Botaí › Inserir'],
    ])
  })

  it('o sistema é o cabeçalho da linha, e cada tecla vai num kbd', () => {
    render(<TabelaAtalhos />)
    expect(
      screen.getAllByRole('rowheader').map((th) => th.textContent),
    ).toEqual(['macOS', 'Windows', 'Linux', 'Um campo só'])
    const linux = screen.getByRole('row', { name: /^Linux/ })
    expect(
      [...linux.querySelectorAll('kbd')].map((kbd) => kbd.textContent),
    ).toEqual(['Ctrl+Shift+Y', 'Alt+Shift+P'])
    expect(
      within(screen.getByRole('row', { name: /^Um campo só/ })).queryByText(
        'botão direito › Botaí › Inserir',
      )?.tagName,
    ).not.toBe('KBD')
  })
})
