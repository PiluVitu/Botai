import { render } from '@testing-library/react'
import { LinhaDeComando } from './linha-de-comando'

const CLI =
  'npx @pilutech/botai-core@0.4.1 pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql'

describe('LinhaDeComando', () => {
  // Rolar pediria uma região focável por bloco (axe, scrollable-region-focusable): a linha quebra.
  it('quebra a linha em vez de rolar, com recuo pendurado', () => {
    const { container } = render(<LinhaDeComando linhas={[CLI]} />)
    const codigo = container.querySelector('code') as HTMLElement
    expect(codigo).toHaveClass(
      'whitespace-pre-wrap',
      '[overflow-wrap:anywhere]',
    )
    const [linha] = codigo.children
    expect(linha).toHaveClass('block', 'pl-[2ch]', '-indent-[2ch]')
    expect(codigo).toHaveTextContent(CLI)
  })

  // Sem o inline-block, o Chromium quebra depois do hífen (`--` numa linha, `formato` na outra).
  // Só a flag: palavra maior que a caixa (o pacote, a URL) num inline-block descia inteira e deixava o `npx` sozinho.
  it('cada flag é um bloco inteiro, sem herdar o recuo negativo; o resto é texto corrido', () => {
    const { container } = render(<LinhaDeComando linhas={[CLI]} />)
    const blocos = [...container.querySelectorAll('span.inline-block')]
    expect(blocos.map((p) => p.textContent)).toEqual(
      CLI.split(' ').filter((p) => p.startsWith('-')),
    )
    for (const bloco of blocos) expect(bloco).toHaveClass('indent-0')
    expect(container.querySelector('code')).toHaveTextContent(CLI)
  })

  it('com o prompt, o $ fica fora da leitura e da seleção', () => {
    const { container } = render(<LinhaDeComando linhas={[CLI]} prompt />)
    const prompt = container.querySelector(
      '[aria-hidden="true"]',
    ) as HTMLElement
    expect(prompt).toHaveTextContent('$')
    expect(prompt).toHaveClass('select-none')
  })

  it('sem o prompt, nenhum $', () => {
    const { container } = render(
      <LinhaDeComando linhas={['await botai.preencher(page)']} />,
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
    expect(container).not.toHaveTextContent('$')
  })

  it('uma linha por item', () => {
    const linhas = [
      "import { gerarPessoa } from '@pilutech/botai-core'",
      "gerarPessoa({ semente: 42, hoje: '2026-10-05' })",
    ]
    const { container } = render(<LinhaDeComando linhas={linhas} />)
    const blocos = [
      ...(container.querySelector('code') as HTMLElement).children,
    ]
    expect(blocos.map((b) => b.textContent)).toEqual(linhas)
  })
})
