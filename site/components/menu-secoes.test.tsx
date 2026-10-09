import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ANCORAS_DA_LANDING } from '@/lib/conteudo'
import { MenuSecoes } from './menu-secoes'

function renderizar() {
  render(
    <div>
      <MenuSecoes ancoras={ANCORAS_DA_LANDING} />
      <p>fora do menu</p>
    </div>,
  )
  return screen.getByRole('button', { name: 'Abrir menu' })
}

describe('MenuSecoes', () => {
  // O jsdom não aplica CSS: um painel escondido só por classe duplicaria as âncoras no landing.test.
  it('fechado: só o botão, e o painel fora do DOM', () => {
    const botao = renderizar()
    expect(botao).toHaveAttribute('type', 'button')
    expect(botao).toHaveAttribute('aria-expanded', 'false')
    expect(botao).not.toHaveAttribute('aria-controls')
    expect(botao.querySelector('svg')).toHaveAttribute('data-icon', 'bars')
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryAllByRole('link')).toEqual([])
  })

  it('aberto: o painel "Seções", ligado ao botão, com as 4 âncoras na ordem', async () => {
    const botao = renderizar()
    await userEvent.click(botao)
    expect(botao).toHaveAttribute('aria-expanded', 'true')
    expect(botao.querySelector('svg')).toHaveAttribute('data-icon', 'xmark')
    const painel = screen.getByRole('navigation', { name: 'Seções' })
    expect(botao).toHaveAttribute('aria-controls', painel.id)
    expect(painel.id).not.toBe('')
    expect(
      within(painel)
        .getAllByRole('link')
        .map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual(ANCORAS_DA_LANDING.map(({ id, rotulo }) => [rotulo, `#${id}`]))
  })

  it('o botão de novo fecha', async () => {
    const botao = renderizar()
    await userEvent.click(botao)
    await userEvent.click(botao)
    expect(botao).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('clicar numa âncora fecha o painel', async () => {
    const botao = renderizar()
    await userEvent.click(botao)
    await userEvent.click(screen.getByRole('link', { name: 'Para quem' }))
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(botao).toHaveAttribute('aria-expanded', 'false')
  })

  it('Escape fecha e devolve o foco ao botão', async () => {
    const usuario = userEvent.setup()
    const botao = renderizar()
    await usuario.click(botao)
    await usuario.tab()
    expect(screen.getByRole('link', { name: 'Portas' })).toHaveFocus()
    await usuario.keyboard('{Escape}')
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(botao).toHaveFocus()
  })

  it('clique fora fecha; clique dentro do painel, não', async () => {
    const botao = renderizar()
    await userEvent.click(botao)
    await userEvent.click(screen.getByRole('navigation', { name: 'Seções' }))
    expect(screen.getByRole('navigation', { name: 'Seções' })).toBeVisible()
    await userEvent.click(screen.getByText('fora do menu'))
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(botao).toHaveAttribute('aria-expanded', 'false')
  })

  // A partir de 900 px o nav do cabeçalho aparece, e o botão e o painel saem pelo CSS.
  it('o botão e o painel só valem abaixo de 900 px', async () => {
    const botao = renderizar()
    expect(botao).toHaveClass('min-[900px]:hidden')
    await userEvent.click(botao)
    expect(screen.getByRole('navigation', { name: 'Seções' })).toHaveClass(
      'min-[900px]:hidden',
    )
  })

  it('cada âncora do painel tem alvo de toque de pelo menos 44 px', async () => {
    renderizar()
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    for (const link of screen.getAllByRole('link'))
      expect(link).toHaveClass('py-3.5', 'text-sm')
  })
})
