import { render } from '@testing-library/react'
import { Marca } from './marca'

describe('Marca', () => {
  it('é decorativa: o texto ao lado dá o nome', () => {
    const { container } = render(<Marca tamanho={26} />)
    const svg = container.querySelector('svg') as SVGElement
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('width', '26')
    expect(svg).toHaveAttribute('height', '26')
    expect(svg).toHaveAttribute('viewBox', '0 0 16 16')
  })

  // A marca tem as mesmas cores nos dois temas, como o icone-128.png.
  it('o desenho do ícone: quadrado azul e quatro blocos escuros', () => {
    const { container } = render(<Marca tamanho={56} />)
    const cores = [...container.querySelectorAll('rect')].map((r) =>
      r.getAttribute('fill'),
    )
    expect(cores).toEqual([
      '#38bdf8',
      '#0a0f1a',
      '#0a0f1a',
      '#0a0f1a',
      '#0a0f1a',
    ])
  })
})
