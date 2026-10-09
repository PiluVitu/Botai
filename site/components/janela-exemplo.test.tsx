import { faTerminal } from '@fortawesome/free-solid-svg-icons'
import { render, screen, within } from '@testing-library/react'
import { JanelaExemplo } from './janela-exemplo'

function renderizar() {
  render(
    <JanelaExemplo
      id="janela-teste"
      legenda="Exemplo: uma janela"
      icone={faTerminal}
      titulo="~/pilulabs/botai"
      detalhe="terminal"
    >
      <p>conteúdo</p>
    </JanelaExemplo>,
  )
  return screen.getByRole('figure', { name: 'Exemplo: uma janela' })
}

describe('JanelaExemplo', () => {
  // As janelas do hero são ilustração: a figura ganha nome pela legenda, que só o leitor de tela ouve.
  it('é uma figura com a legenda só para leitor de tela', () => {
    const figura = renderizar()
    expect(figura.tagName).toBe('FIGURE')
    const legenda = figura.querySelector('figcaption')
    expect(legenda).toHaveClass('sr-only')
    expect(figura).toHaveAttribute('aria-labelledby', legenda?.id)
    expect(legenda?.id).toBe('janela-teste-legenda')
    expect(figura).toHaveClass('bg-card', 'min-w-0', 'overflow-hidden')
  })

  it('a barra traz o ícone, o título e o detalhe; depois, o conteúdo', () => {
    const figura = renderizar()
    const titulo = within(figura).getByText('~/pilulabs/botai')
    expect(titulo.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(titulo.querySelector('svg')).toHaveAttribute('data-icon', 'terminal')
    expect(within(figura).getByText('terminal')).toBeInTheDocument()
    expect(
      titulo.compareDocumentPosition(within(figura).getByText('conteúdo')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
