import { render, screen } from '@testing-library/react'
import { Secao, Sobrelinha } from './secao'

describe('Secao', () => {
  it('é uma região com o nome do h2, e a sobrelinha não é título', () => {
    render(
      <Secao
        tituloId="portas-titulo"
        numero={1}
        rotulo="Portas"
        titulo="Um motor, oito portas."
      >
        <p>corpo</p>
      </Secao>,
    )
    const secao = screen.getByRole('region', { name: 'Um motor, oito portas.' })
    expect(secao.tagName).toBe('SECTION')
    expect(screen.getAllByRole('heading')).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute(
      'id',
      'portas-titulo',
    )
    expect(screen.getByText('Portas').tagName).toBe('P')
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(secao).toHaveTextContent('corpo')
  })

  // As âncoras do cabeçalho rolam até o id; o scroll-mt deixa um respiro acima do título.
  it('com âncora, leva o id e o scroll-mt', () => {
    render(
      <Secao
        id="portas"
        tituloId="portas-titulo"
        numero={1}
        rotulo="Portas"
        titulo="Título"
      />,
    )
    const secao = screen.getByRole('region', { name: 'Título' })
    expect(secao).toHaveAttribute('id', 'portas')
    expect(secao).toHaveClass('scroll-mt-6')
  })

  it('sem âncora, sem id', () => {
    render(<Secao tituloId="t" numero={3} rotulo="A pessoa" titulo="Título" />)
    const secao = screen.getByRole('region', { name: 'Título' })
    expect(secao).not.toHaveAttribute('id')
    expect(secao).not.toHaveClass('scroll-mt-6')
  })

  it('o apoio fica ao lado do título, num parágrafo', () => {
    render(
      <Secao
        tituloId="t"
        numero={1}
        rotulo="Portas"
        titulo="Título"
        apoio="O texto de apoio."
      />,
    )
    expect(screen.getByText('O texto de apoio.').tagName).toBe('P')
  })
})

describe('Sobrelinha', () => {
  it('número com dois dígitos e a régua escondida do leitor de tela', () => {
    const { container } = render(
      <Sobrelinha numero={7} rotulo="Privacidade e cuidados" />,
    )
    expect(screen.getByText('07')).toBeInTheDocument()
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)
  })
})
