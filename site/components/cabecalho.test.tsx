import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ANCORAS_DA_LANDING,
  REPOSITORIO,
  URL_DA_DOCUMENTACAO,
} from '@/lib/conteudo'
import { Cabecalho } from './cabecalho'

function renderizar() {
  render(<Cabecalho />)
  return within(screen.getByRole('banner'))
}

describe('Cabecalho', () => {
  it('a marca leva ao início, com o nome «Botaí, início»', () => {
    const banner = renderizar()
    const marca = banner.getByRole('link', { name: 'Botaí, início' })
    expect(marca).toHaveAttribute('href', '#topo')
    expect(marca.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(marca).toHaveTextContent('Botaí')
  })

  it('o nav «Seções» do desktop tem as 4 âncoras da landing, na ordem', () => {
    const banner = renderizar()
    const navs = banner.getAllByRole('navigation', { name: 'Seções' })
    expect(navs).toHaveLength(1)
    expect(
      within(navs[0])
        .getAllByRole('link')
        .map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual(ANCORAS_DA_LANDING.map(({ id, rotulo }) => [rotulo, `#${id}`]))
    expect(navs[0]).toHaveClass('hidden', 'min-[900px]:flex')
  })

  it('Docs leva à documentação, na mesma aba', () => {
    const docs = renderizar().getByRole('link', { name: 'Docs' })
    expect(docs).toHaveAttribute('href', URL_DA_DOCUMENTACAO)
    expect(docs).not.toHaveAttribute('target')
  })

  // A 320 px a marca e os quatro botões não cabem: o texto «Docs» vira só leitor de tela, e o nome fica.
  it('abaixo de 380 px o Docs é só o ícone, com o mesmo nome', () => {
    const docs = renderizar().getByRole('link', { name: 'Docs' })
    expect(within(docs).getByText('Docs')).toHaveClass('max-[379px]:sr-only')
  })

  it('o GitHub é um ícone com nome', () => {
    const github = renderizar().getByRole('link', { name: 'Código no GitHub' })
    expect(github).toHaveAttribute('href', REPOSITORIO)
    expect(github.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('tem o botão de tema e o de menu, este fechado', () => {
    const banner = renderizar()
    expect(
      banner.getByRole('button', { name: 'Alternar tema' }),
    ).toBeInTheDocument()
    expect(banner.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('o menu aberto abre um segundo nav «Seções», dentro do banner', async () => {
    const banner = renderizar()
    await userEvent.click(banner.getByRole('button', { name: 'Abrir menu' }))
    expect(banner.getAllByRole('navigation', { name: 'Seções' })).toHaveLength(
      2,
    )
  })

  it('a linha pode quebrar, e nada fica marcado como esqueleto', () => {
    renderizar()
    const banner = screen.getByRole('banner')
    expect(banner).toHaveClass('relative', 'flex-wrap')
    expect(banner.querySelector('[data-esqueleto]')).toBeNull()
  })
})
