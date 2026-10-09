import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PORTAS, type IdDaPorta } from '@/lib/portas'
import { CartaoPorta } from './cartao-porta'

function porta(id: IdDaPorta) {
  const achada = PORTAS.find((p) => p.id === id)
  if (!achada) throw new Error(`porta inexistente: ${id}`)
  return achada
}

function renderizar(id: IdDaPorta) {
  return render(
    <ul>
      <CartaoPorta porta={porta(id)} />
    </ul>,
  )
}

describe('CartaoPorta', () => {
  it('um item da lista, com o nome em h3, o número, o que faz e onde roda', () => {
    renderizar('http')
    const item = within(screen.getByRole('listitem'))
    expect(
      item.getByRole('heading', { level: 3, name: 'HTTP' }),
    ).toBeInTheDocument()
    expect(item.getByText('porta 03')).toBeInTheDocument()
    expect(item.getByText(porta('http').linha).tagName).toBe('P')
    expect(item.getByText(porta('http').onde).tagName).toBe('P')
  })

  // Rolar pediria uma região focável por bloco: o comando quebra por palavra, como no hero.
  it('o comando sai num bloco de código que quebra a linha', () => {
    const { container } = renderizar('cli')
    const codigo = container.querySelector('pre > code') as HTMLElement
    expect(codigo).toHaveTextContent(porta('cli').comando.linhas[0])
    expect(codigo).toHaveClass(
      'whitespace-pre-wrap',
      '[overflow-wrap:anywhere]',
    )
  })

  it('o botão de copiar diz de que porta é e copia o comando', async () => {
    const usuario = userEvent.setup()
    renderizar('cli')
    const botao = screen.getByRole('button', {
      name: 'Copiar comando da porta CLI',
    })
    expect(botao).toHaveClass('size-8')
    await usuario.click(botao)
    expect(await navigator.clipboard.readText()).toBe(
      porta('cli').comando.linhas[0],
    )
  })

  it('o comando de duas linhas é copiado com a quebra de linha', async () => {
    const usuario = userEvent.setup()
    const { container } = renderizar('biblioteca')
    const linhas = porta('biblioteca').comando.linhas
    expect(linhas).toHaveLength(2)
    expect(
      [...(container.querySelector('pre > code') as HTMLElement).children].map(
        (linha) => linha.textContent,
      ),
    ).toEqual(linhas)
    await usuario.click(
      screen.getByRole('button', {
        name: 'Copiar comando da porta Biblioteca',
      }),
    )
    expect(await navigator.clipboard.readText()).toBe(linhas.join('\n'))
  })

  it('a extensão mostra os atalhos e não tem o que copiar', () => {
    renderizar('extensao')
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByRole('listitem')).toHaveTextContent(
      '⌥⇧P no Mac · Ctrl+Shift+Y no Windows e no Linux · Alt+Shift+P no Firefox para Linux',
    )
  })

  it('o ícone é decorativo', () => {
    const { container } = renderizar('docker')
    const icones = [...container.querySelectorAll('svg')]
    expect(icones.length).toBeGreaterThan(0)
    for (const icone of icones) expect(icone).toHaveAttribute('aria-hidden')
  })
})
