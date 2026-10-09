import { render, screen, within } from '@testing-library/react'
import { botoesDasLojas } from '@/lib/modelo'
import { BotoesLoja } from './botoes-loja'

const SEM_LOJA = { chromeUrl: '', firefoxUrl: '', edgeUrl: '', operaUrl: '' }
const CHROME = 'https://chromewebstore.google.com/detail/botai/abc'
const FIREFOX = 'https://addons.mozilla.org/pt-BR/firefox/addon/botai/'
const EDGE = 'https://microsoftedge.microsoft.com/addons/detail/botai/xyz'

// Como no lojas.json de 2026-10-08: Chrome e Firefox no ar, Opera em revisão, Edge sem URL.
const NO_AR = botoesDasLojas({
  ...SEM_LOJA,
  chromeUrl: CHROME,
  firefoxUrl: FIREFOX,
})

function itens() {
  return within(screen.getByRole('list', { name: 'Instalar pela loja' }))
    .getAllByRole('listitem')
    .map((li) => li.textContent)
}

describe('BotoesLoja', () => {
  it('uma lista "Instalar pela loja", na ordem recebida, sem o Edge sem URL', () => {
    render(<BotoesLoja lojas={NO_AR} />)
    expect(itens()).toEqual([
      'Chrome Web Store',
      'Firefox Add-ons',
      'Opera em revisão',
    ])
  })

  it('loja publicada: link para a loja, em aba nova', () => {
    render(<BotoesLoja lojas={NO_AR} />)
    for (const [nome, url] of [
      ['Chrome Web Store', CHROME],
      ['Firefox Add-ons', FIREFOX],
    ]) {
      const link = screen.getByRole('link', { name: nome })
      expect(link).toHaveAttribute('href', url)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  // A v1 punha um <button disabled>: um controle que não faz nada. Na v2 é texto, com o estado da loja.
  it('loja sem URL: texto com o nome curto e o estado, sem botão e sem link', () => {
    const { container } = render(
      <BotoesLoja lojas={botoesDasLojas(SEM_LOJA)} />,
    )
    expect(itens()).toEqual([
      'Chrome em breve',
      'Firefox em breve',
      'Opera em revisão',
    ])
    expect(screen.queryAllByRole('button')).toEqual([])
    expect(container.querySelectorAll('a')).toHaveLength(0)
    expect(screen.getByText('em revisão')).toHaveClass('text-warn', 'font-mono')
    expect(screen.getByText('em revisão').parentElement).toHaveClass(
      'border-dashed',
    )
  })

  it('nenhum texto diz "disponível"', () => {
    render(<BotoesLoja lojas={botoesDasLojas(SEM_LOJA)} />)
    expect(screen.queryByText(/dispon[ií]vel/i)).toBeNull()
  })

  it('o Edge com URL entra no lugar dele, como link', () => {
    render(
      <BotoesLoja lojas={botoesDasLojas({ ...SEM_LOJA, edgeUrl: EDGE })} />,
    )
    expect(itens()).toEqual([
      'Chrome em breve',
      'Firefox em breve',
      'Microsoft Edge Add-ons',
      'Opera em revisão',
    ])
    expect(
      screen.getByRole('link', { name: 'Microsoft Edge Add-ons' }),
    ).toHaveAttribute('href', EDGE)
  })

  // A 320 px um rótulo longo numa linha só passa da lista e invade o gutter; o scrollWidth da página
  // não acusa. O item quebra o texto em vez de vazar.
  it('o item quebra linha em vez de passar da largura da lista', () => {
    render(
      <BotoesLoja lojas={botoesDasLojas({ ...SEM_LOJA, edgeUrl: EDGE })} />,
    )
    const link = screen.getByRole('link', { name: 'Microsoft Edge Add-ons' })
    expect(link).toHaveClass('whitespace-normal', 'max-w-full', 'min-h-11')
    expect(link).not.toHaveClass('whitespace-nowrap')
    expect(screen.getByText('em revisão').parentElement).toHaveClass(
      'max-w-full',
    )
  })
})
