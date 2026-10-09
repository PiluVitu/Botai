import { render, screen, within } from '@testing-library/react'
import { Cuidados } from './cuidados'

function renderizar() {
  const resultado = render(<Cuidados />)
  const secao = screen.getByRole('region', {
    name: 'Fictício, mas com cuidado.',
  })
  return { ...resultado, secao, dentro: within(secao) }
}

describe('Cuidados', () => {
  it('a sobrelinha 07 e o h2', () => {
    const { secao, dentro } = renderizar()
    expect(secao).toHaveAttribute('aria-labelledby', 'cuidados-titulo')
    expect(dentro.getByText('Privacidade e cuidados').tagName).toBe('P')
    expect(dentro.getByText('07')).toBeInTheDocument()
  })

  it('dois cartões, Privacidade e Cuidados, em h3', () => {
    const { dentro } = renderizar()
    expect(
      dentro.getAllByRole('heading', { level: 3 }).map((h) => h.textContent),
    ).toEqual(['Privacidade', 'Cuidados'])
  })

  // O mesmo que a política diz: a extensão não tem servidor (o servidor das portas roda na máquina de quem usa).
  it('privacidade: sem servidor nem analytics, e o link para a política', () => {
    const { dentro } = renderizar()
    expect(
      dentro.getByText(
        'A extensão não tem servidor nem analytics e só age na aba em que você a aciona.',
      ),
    ).toBeInTheDocument()
    expect(
      dentro.getByRole('link', { name: 'Política de privacidade' }),
    ).toHaveAttribute('href', '/privacidade')
  })

  it('cuidados: os três avisos, na ordem, e o link para os termos', () => {
    const { dentro } = renderizar()
    expect(dentro.getByRole('list').querySelectorAll('li').length).toBe(3)
    expect(dentro.getAllByRole('listitem').map((li) => li.textContent)).toEqual(
      [
        'Os dados são fictícios, mas um CPF, CNPJ ou celular gerado pode pertencer a alguém de verdade.',
        'A caixa de e-mail é pública: quem souber o endereço lê as mensagens.',
        'Use só em localhost e em ambiente de teste.',
      ],
    )
    expect(dentro.getByRole('link', { name: 'Termos de uso' })).toHaveAttribute(
      'href',
      '/termos',
    )
  })

  // A seta é ícone: o nome do link fica sem ela.
  it('a seta dos links é decorativa', () => {
    const { dentro } = renderizar()
    for (const nome of ['Política de privacidade', 'Termos de uso'])
      expect(
        dentro.getByRole('link', { name: nome }).querySelector('svg'),
      ).toHaveAttribute('aria-hidden', 'true')
  })
})
