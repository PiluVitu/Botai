import { render, screen } from '@testing-library/react'
import { Topo } from './topo'

describe('Topo', () => {
  it('voltar, âncoras e o botão de tema, numa navegação', () => {
    render(
      <Topo
        voltar={{
          href: 'https://piluvitu.com.br/pilulabs',
          rotulo: 'PiluLabs',
        }}
        ancoras={[
          { href: '#como-usar', rotulo: 'como usar' },
          { href: '#capturas', rotulo: 'capturas' },
        ]}
      />,
    )
    expect(screen.getByRole('navigation', { name: 'Topo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'PiluLabs' })).toHaveAttribute(
      'href',
      'https://piluvitu.com.br/pilulabs',
    )
    expect(screen.getByRole('link', { name: 'como usar' })).toHaveAttribute(
      'href',
      '#como-usar',
    )
    expect(screen.getByRole('link', { name: 'capturas' })).toHaveAttribute(
      'href',
      '#capturas',
    )
    expect(
      screen.getByRole('button', { name: 'Alternar tema' }),
    ).toBeInTheDocument()
  })

  it('com a documentação, o botão Docs leva a ela, na linha das âncoras e antes do tema', () => {
    render(
      <Topo
        voltar={{ href: '/', rotulo: 'Botaí' }}
        ancoras={[{ href: '#para-devs', rotulo: 'para devs' }]}
        docs="https://docs.botai.pilutech.com.br"
      />,
    )
    const docs = screen.getByRole('link', { name: 'Docs' })
    expect(docs).toHaveAttribute('href', 'https://docs.botai.pilutech.com.br')
    expect(docs).not.toHaveAttribute('target')
    const linha = screen.getByRole('link', { name: 'para devs' }).parentElement
    expect(docs.parentElement).toBe(linha)
    expect(
      [...(linha as HTMLElement).children].map(
        (filho) => filho.textContent || filho.getAttribute('aria-label'),
      ),
    ).toEqual(['para devs', 'Docs', 'Alternar tema'])
  })

  // As páginas de texto (/privacidade e /termos) têm só o voltar e o tema.
  it('sem a documentação, o topo não tem Docs', () => {
    render(<Topo voltar={{ href: '/', rotulo: 'Botaí' }} />)
    expect(screen.queryByRole('link', { name: 'Docs' })).toBeNull()
  })

  // A 320 px o voltar, as âncoras e o botão não cabem numa linha.
  it('quebra linha em tela estreita', () => {
    render(<Topo voltar={{ href: '/', rotulo: 'Botaí' }} />)
    expect(screen.getByRole('navigation')).toHaveClass('flex-wrap')
  })

  // Com três âncoras e o botão (~322 px), a linha delas passa dos 272 px úteis a 320 px.
  it('as âncoras e o botão também quebram linha entre si', () => {
    render(
      <Topo
        voltar={{ href: '/', rotulo: 'Botaí' }}
        ancoras={[{ href: '#para-devs', rotulo: 'para devs' }]}
      />,
    )
    expect(
      screen.getByRole('link', { name: 'para devs' }).parentElement,
    ).toHaveClass('flex-wrap')
  })
})
