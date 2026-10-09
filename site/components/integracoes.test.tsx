import { render, screen, within } from '@testing-library/react'
import { INTEGRACOES } from '@/lib/integracoes'
import { Integracoes } from './integracoes'

function renderizar() {
  render(<Integracoes />)
  return screen.getByRole('region', {
    name: 'O que foi testado, e o que ainda não.',
  })
}

describe('Integracoes', () => {
  it('é a seção 05, sem âncora, com o apoio', () => {
    const secao = renderizar()
    expect(secao).not.toHaveAttribute('id')
    expect(secao).toHaveAttribute('aria-labelledby', 'integracoes-titulo')
    expect(within(secao).getByText('05')).toBeInTheDocument()
    expect(
      within(secao).getByText(
        'O motor roda em qualquer ferramenta que execute JS na página, e o servidor atende qualquer linguagem que fale HTTP. O selo diz o que já tem teste.',
      ),
    ).toBeInTheDocument()
  })

  it('as 13 integrações, cada uma com o nome e o selo', () => {
    const secao = renderizar()
    const itens = within(within(secao).getByRole('list')).getAllByRole(
      'listitem',
    )
    expect(itens.map((li) => li.textContent)).toEqual(
      INTEGRACOES.map((i) => `${i.nome}${i.selo}`),
    )
  })

  // Texto honesto: "Testado" só nas 7 provadas; o design dizia "Roda via JS/HTTP".
  it('"Testado" só nas provadas, e nada de "Roda via"', () => {
    const secao = renderizar()
    expect(within(secao).getAllByText(/^Testado/)).toHaveLength(7)
    expect(within(secao).getAllByText(/^Sem teste · via /)).toHaveLength(6)
    expect(secao).not.toHaveTextContent(/Roda via/)
  })

  it('o selo testado e o sem teste têm ícone e cor diferentes', () => {
    const secao = renderizar()
    const [playwright] = within(secao).getAllByText('Testado')
    expect(playwright).toHaveClass('text-ok')
    expect(playwright.querySelector('svg')).toHaveAttribute(
      'data-icon',
      'circle-check',
    )
    const [cypress] = within(secao).getAllByText('Sem teste · via JS')
    expect(cypress).toHaveClass('text-muted-foreground')
    expect(cypress.querySelector('svg')).toHaveAttribute('data-icon', 'plug')
  })
})
