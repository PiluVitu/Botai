import { render, screen, within } from '@testing-library/react'
import { REPOSITORIO, URL_DA_DOCUMENTACAO } from '@/lib/conteudo'
import { ChamadaFinal } from './chamada-final'

function renderizar() {
  const resultado = render(<ChamadaFinal />)
  const secao = screen.getByRole('region', { name: 'Botaí no seu teste.' })
  return { ...resultado, secao, dentro: within(secao) }
}

describe('ChamadaFinal', () => {
  it('a marca, decorativa, e o h2', () => {
    const { secao, dentro } = renderizar()
    expect(secao).toHaveAttribute('aria-labelledby', 'final-titulo')
    expect(secao.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(
      dentro.getByRole('heading', { level: 2, name: 'Botaí no seu teste.' }),
    ).toHaveAttribute('id', 'final-titulo')
  })

  it('o convite para começar pela documentação', () => {
    const { dentro } = renderizar()
    expect(
      dentro.getByText(
        'Comece pela porta que você já usa. A documentação tem o guia de cada uma.',
      ),
    ).toBeInTheDocument()
  })

  // Os dois abrem na mesma aba, como o Docs do cabeçalho.
  it('leva à documentação e ao código, nessa ordem', () => {
    const { dentro } = renderizar()
    const links = dentro.getAllByRole('link')
    expect(links.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Ler a documentação', URL_DA_DOCUMENTACAO],
      ['Código no GitHub', REPOSITORIO],
    ])
    for (const link of links) expect(link).not.toHaveAttribute('target')
  })

  it('a documentação é o botão principal, o GitHub o contornado', () => {
    const { dentro } = renderizar()
    expect(
      dentro.getByRole('link', { name: 'Ler a documentação' }),
    ).toHaveClass('bg-primary')
    expect(dentro.getByRole('link', { name: 'Código no GitHub' })).toHaveClass(
      'border-input',
    )
  })
})
