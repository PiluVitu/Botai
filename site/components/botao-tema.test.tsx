import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'next-themes'
import { BotaoTema } from './botao-tema'

function renderizar(temaInicial: 'dark' | 'light') {
  return render(
    <ThemeProvider
      attribute="class"
      defaultTheme={temaInicial}
      enableSystem={false}
    >
      <BotaoTema />
    </ThemeProvider>,
  )
}

function preferirMovimento(reduzido: boolean) {
  window.matchMedia = jest.fn().mockImplementation((consulta: string) => ({
    matches: reduzido && consulta === '(prefers-reduced-motion: reduce)',
    media: consulta,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }))
}

function simularViewTransition() {
  const iniciar = jest.fn((trocar: () => void) => {
    trocar()
    return {} as ViewTransition
  })
  document.startViewTransition =
    iniciar as unknown as typeof document.startViewTransition
  return iniciar
}

const matchMediaOriginal = window.matchMedia

beforeEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
})

afterEach(() => {
  window.matchMedia = matchMediaOriginal
  Reflect.deleteProperty(document, 'startViewTransition')
})

describe('BotaoTema', () => {
  it('no escuro, troca para o claro e guarda a escolha', async () => {
    renderizar('dark')
    await userEvent.click(screen.getByRole('button', { name: 'Alternar tema' }))
    expect(document.documentElement).toHaveClass('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('no claro, troca para o escuro', async () => {
    renderizar('light')
    await userEvent.click(screen.getByRole('button', { name: 'Alternar tema' }))
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  // A troca de tema vira um cross-fade da página inteira pela View Transitions API.
  it('com movimento, troca o tema dentro de uma View Transition', async () => {
    preferirMovimento(false)
    const iniciar = simularViewTransition()
    renderizar('light')
    await userEvent.click(screen.getByRole('button', { name: 'Alternar tema' }))
    expect(iniciar).toHaveBeenCalledTimes(1)
    expect(document.documentElement).toHaveClass('dark')
  })

  it('com "reduzir movimento", troca o tema na hora, sem View Transition', async () => {
    preferirMovimento(true)
    const iniciar = simularViewTransition()
    renderizar('light')
    await userEvent.click(screen.getByRole('button', { name: 'Alternar tema' }))
    expect(iniciar).not.toHaveBeenCalled()
    expect(document.documentElement).toHaveClass('dark')
  })

  it('sem a API (Firefox antigo), troca o tema na hora', async () => {
    preferirMovimento(false)
    renderizar('dark')
    await userEvent.click(screen.getByRole('button', { name: 'Alternar tema' }))
    expect(document.documentElement).toHaveClass('light')
  })

  // A classe .dark do <html> sai do script do next-themes antes da hidratação: o ícone certo aparece sem piscar.
  it('os dois ícones vêm no HTML, e a classe dark decide qual aparece', () => {
    renderizar('dark')
    const botao = screen.getByRole('button', { name: 'Alternar tema' })
    expect(botao.querySelector('svg[data-icon="moon"]')).toHaveClass(
      'dark:hidden',
    )
    expect(botao.querySelector('svg[data-icon="sun"]')).toHaveClass(
      'hidden',
      'dark:block',
    )
  })
})
