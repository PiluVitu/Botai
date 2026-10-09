import { render, screen, within } from '@testing-library/react'
import { LEGENDA_DOS_NUMEROS, NUMEROS } from '@/lib/numeros'
import { Numeros } from './numeros'

function renderizar() {
  render(<Numeros />)
  return screen.getByRole('region', { name: 'Números' })
}

describe('Numeros', () => {
  it('é a região «Números», sem título', () => {
    const regiao = renderizar()
    expect(regiao.tagName).toBe('SECTION')
    expect(within(regiao).queryAllByRole('heading')).toEqual([])
  })

  it('uma lista com os 6 números, valor em cima e texto embaixo, na ordem', () => {
    const itens = within(renderizar()).getAllByRole('listitem')
    expect(
      itens.map((item) => [...item.children].map((filho) => filho.textContent)),
    ).toEqual(NUMEROS.map(({ valor, texto }) => [valor, texto]))
  })

  // A data e a máquina ficam junto dos números: «1.454 testes» envelhece a cada PR.
  it('a legenda datada fica dentro da região, depois da lista', () => {
    const regiao = renderizar()
    const legenda = within(regiao).getByText(LEGENDA_DOS_NUMEROS)
    expect(
      within(regiao).getByRole('list').compareDocumentPosition(legenda) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('nada é esqueleto', () => {
    expect(renderizar().querySelector('[data-esqueleto]')).toBeNull()
  })
})
