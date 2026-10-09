import { montarPessoa } from '@pilutech/botai-core/pessoa'
import { sfc32 } from '@pilutech/botai-core/prng'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PESSOA_ANTIGA, PESSOA_DOURADA } from '../test/pessoa-dourada'
import { CartaoAtual } from './cartao-atual'

const comCartao = (provedor: 'stripe' | 'pagarme', cenario: string) =>
  montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', {
    cartao: { provedor, cenario: cenario as never },
  }).cartao

const linhaDoCenario = () => screen.getByText('Cenário').parentElement

describe('CartaoAtual', () => {
  it('Stripe aprovado: o selo ok, o provedor e a descrição do cenário', () => {
    render(<CartaoAtual cartao={PESSOA_DOURADA.cartao} />)
    expect(linhaDoCenario()).toHaveTextContent(/^Cenárioaprovado\s*Stripe$/)
    expect(screen.getByText('aprovado')).toHaveAttribute('data-tipo', 'ok')
    expect(
      screen.getByText(
        'Aprova a cobrança. Número de teste documentado da Stripe: passa no Luhn e só vale em sandbox.',
      ),
    ).toBeInTheDocument()
  })

  it('Pagar.me recusado: o selo de erro e a descrição da Pagar.me', () => {
    render(<CartaoAtual cartao={comCartao('pagarme', 'recusado')} />)
    expect(linhaDoCenario()).toHaveTextContent(/^Cenáriorecusado\s*Pagar\.me$/)
    expect(screen.getByText('recusado')).toHaveAttribute('data-tipo', 'erro')
    expect(
      screen.getByText(
        'Pedido e cobrança com falha; transação não autorizada. Número de teste documentado da Pagar.me: passa no Luhn e só vale em sandbox.',
      ),
    ).toBeInTheDocument()
  })

  it('cenário de espera (o pendente da Pagar.me)', () => {
    render(<CartaoAtual cartao={comCartao('pagarme', 'pendente')} />)
    expect(screen.getByText('pendente → aprova')).toHaveAttribute(
      'data-tipo',
      'espera',
    )
    expect(
      screen.getByText(/^Fica processando e depois aprova\./),
    ).toBeInTheDocument()
  })

  it('pessoa antiga, sem provedor nem cenário no cartão: Stripe aprovado', () => {
    render(<CartaoAtual cartao={PESSOA_ANTIGA.cartao} />)
    expect(linhaDoCenario()).toHaveTextContent(/^Cenárioaprovado\s*Stripe$/)
  })
})
