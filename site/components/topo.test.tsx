import { render, screen, within } from '@testing-library/react'
import { Topo } from './topo'

// O topo das páginas de texto (/privacidade e /termos); a landing tem o Cabecalho.
describe('Topo', () => {
  it('o voltar e o botão de tema, numa navegação', () => {
    render(<Topo voltar={{ href: '/', rotulo: 'Botaí' }} />)
    const topo = screen.getByRole('navigation', { name: 'Topo' })
    expect(within(topo).getByRole('link', { name: 'Botaí' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(
      within(topo).getByRole('button', { name: 'Alternar tema' }),
    ).toBeInTheDocument()
  })

  it('sem âncoras nem Docs: só o voltar é link', () => {
    render(<Topo voltar={{ href: '/', rotulo: 'Botaí' }} />)
    expect(screen.getAllByRole('link').map((a) => a.textContent)).toEqual([
      'Botaí',
    ])
  })

  it('quebra linha em tela estreita', () => {
    render(<Topo voltar={{ href: '/', rotulo: 'Botaí' }} />)
    expect(screen.getByRole('navigation')).toHaveClass('flex-wrap')
  })
})
