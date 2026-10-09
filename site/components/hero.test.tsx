import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NOME, POSICIONAMENTO, URL_DA_DOCUMENTACAO } from '@/lib/conteudo'
import { COMANDO_DO_EXEMPLO } from '@/lib/exemplo'
import { Hero } from './hero'

function renderizar() {
  render(<Hero />)
  return screen.getByRole('region', {
    name: `${NOME}: ${POSICIONAMENTO}`,
  })
}

describe('Hero', () => {
  it('um h1 só, com «Botaí: » só para leitor de tela', () => {
    const hero = renderizar()
    const [h1, ...outros] = within(hero).getAllByRole('heading')
    expect(outros).toEqual([])
    expect(h1.tagName).toBe('H1')
    expect(h1).toHaveAttribute('id', 'hero-titulo')
    expect(hero).toHaveAttribute('aria-labelledby', 'hero-titulo')
    expect(h1).toHaveTextContent(`${NOME}: ${POSICIONAMENTO}`)
    expect(within(h1).getByText(`${NOME}:`)).toHaveClass('sr-only')
  })

  it('a sobrelinha e o parágrafo das oito portas', () => {
    const hero = renderizar()
    expect(hero.querySelector('p')).toHaveTextContent('~/pilulabs/botai')
    expect(
      within(hero).getByText(/^O Botaí gera uma pessoa brasileira fictícia/),
    ).toHaveTextContent(
      'O Botaí gera uma pessoa brasileira fictícia e coerente, com CPF, CEP, celular e empresa que batem entre si, e preenche formulários com ela. Um motor só, com oito portas: extensão, CLI, biblioteca, HTTP, Docker, binários, Playwright e o motor direto na página.',
    )
  })

  it('os dois botões: a documentação e a extensão', () => {
    const hero = within(renderizar())
    expect(
      hero.getByRole('link', { name: 'Ler a documentação' }),
    ).toHaveAttribute('href', URL_DA_DOCUMENTACAO)
    const extensao = hero.getByRole('link', { name: 'Instalar a extensão' })
    expect(extensao).toHaveAttribute('href', '#extensao')
    expect(
      [...extensao.querySelectorAll('svg')].map((icone) =>
        icone.getAttribute('data-icon'),
      ),
    ).toEqual(['chrome', 'firefox-browser'])
  })

  // O comando leva a versão e o --hoje: sem eles a pessoa muda (lib/exemplo.test.ts).
  it('a caixa do comando: o COMANDO_DO_EXEMPLO e o botão de copiar', async () => {
    const usuario = userEvent.setup()
    const hero = within(renderizar())
    const botao = hero.getByRole('button', {
      name: `Copiar comando: ${COMANDO_DO_EXEMPLO}`,
    })
    const caixa = botao.closest('div') as HTMLElement
    expect(caixa.querySelector('code')).toHaveTextContent(COMANDO_DO_EXEMPLO)
    await usuario.click(botao)
    expect(await navigator.clipboard.readText()).toBe(COMANDO_DO_EXEMPLO)
    expect(hero.getByRole('status')).toHaveTextContent('Copiado')
  })

  it('as duas janelas, terminal e formulário, com a tecla de quem visita', () => {
    const hero = renderizar()
    expect(
      within(hero)
        .getAllByRole('figure')
        .map((figura) => figura.querySelector('figcaption')?.textContent),
    ).toEqual([
      'Exemplo: a pessoa da semente 42 no terminal',
      'Exemplo: um cadastro preenchido pela extensão',
    ])
    expect(hero.querySelector('kbd')).toHaveTextContent('Ctrl+Shift+Y')
  })

  it('o formulário diz «6 de 6 campos preenchidos»', () => {
    const hero = renderizar()
    expect(
      within(hero).getByText('6 de 6 campos preenchidos'),
    ).toBeInTheDocument()
  })
})
