import { render, screen, within } from '@testing-library/react'
import { NOTA_DAS_PORTAS, PORTAS } from '@/lib/portas'
import { Portas } from './portas'

function secao() {
  return screen.getByRole('region', { name: 'Um motor, oito portas.' })
}

describe('Portas', () => {
  it('é a seção #portas, com o número 01 e o apoio do design', () => {
    render(<Portas />)
    expect(secao()).toHaveAttribute('id', 'portas')
    expect(within(secao()).getByText('01')).toBeInTheDocument()
    expect(
      within(secao()).getByText(
        'Todas usam o mesmo gerador, e as que preenchem formulário usam o mesmo motor. Escolha a que cabe no seu teste.',
      ),
    ).toBeInTheDocument()
  })

  it('um cartão por porta, na ordem de PORTAS', () => {
    render(<Portas />)
    expect(within(secao()).getAllByRole('listitem')).toHaveLength(8)
    expect(
      within(secao())
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(PORTAS.map((p) => p.nome))
    expect(
      PORTAS.map((p) => within(secao()).getByText(`porta ${p.numero}`)),
    ).toHaveLength(8)
  })

  it('toda porta tem o botão de copiar, menos a extensão', () => {
    render(<Portas />)
    expect(
      within(secao())
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label')),
    ).toEqual(
      PORTAS.filter((p) => p.id !== 'extensao').map(
        (p) => `Copiar comando da porta ${p.nome}`,
      ),
    )
  })

  it('a nota dos formatos fecha a seção', () => {
    render(<Portas />)
    const nota = within(secao()).getByText(NOTA_DAS_PORTAS)
    expect(nota.tagName).toBe('P')
    expect(secao().lastElementChild).toBe(nota)
  })

  // Texto honesto: "testado" só no que o relatório prova; nada diz "disponível".
  it('"testado" só no cartão do motor, e nenhum "disponível"', () => {
    render(<Portas />)
    const comTestado = within(secao())
      .getAllByRole('listitem')
      .filter((item) => /testad/i.test(item.textContent ?? ''))
      .map(
        (item) => within(item).getByRole('heading', { level: 3 }).textContent,
      )
    expect(comTestado).toEqual(['Motor'])
    expect(secao()).not.toHaveTextContent(/dispon[ií]vel/i)
  })
})
