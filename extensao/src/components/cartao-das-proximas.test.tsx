import {
  CATALOGO_DE_CARTOES,
  type CartaoEscolhido,
} from '@pilutech/botai-core/cartao'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CartaoDasProximas } from './cartao-das-proximas'

function renderizar(escolha: CartaoEscolhido) {
  const onEscolher = vi.fn()
  const onNovaPessoa = vi.fn()
  render(
    <CartaoDasProximas
      escolha={escolha}
      onEscolher={onEscolher}
      onNovaPessoa={onNovaPessoa}
    />,
  )
  return { onEscolher, onNovaPessoa, user: userEvent.setup() }
}

const provedores = () =>
  within(screen.getByRole('group', { name: 'Provedor' })).getAllByRole('button')
const cenarios = () =>
  within(screen.getByRole('group', { name: 'Cenário' })).getAllByRole('button')

describe('CartaoDasProximas', () => {
  it('título, os dois provedores com aria-pressed e a nota de que vale só para as próximas', () => {
    renderizar({ provedor: 'stripe', cenario: 'aprovado' })
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Cartão das próximas pessoas',
      }),
    ).toBeInTheDocument()
    expect(provedores().map((b) => b.textContent)).toEqual([
      'Stripe',
      'Pagar.me',
    ])
    expect(provedores().map((b) => b.getAttribute('aria-pressed'))).toEqual([
      'true',
      'false',
    ])
    expect(
      screen.getByText(
        'Vale para as próximas pessoas. A atual e as favoritas mantêm o cartão com que foram geradas.',
      ),
    ).toBeInTheDocument()
  })

  it('um chip por cenário do provedor escolhido, na ordem do catálogo, com a descrição no title', () => {
    renderizar({ provedor: 'pagarme', cenario: 'recusado' })
    expect(cenarios().map((b) => b.textContent)).toEqual(
      CATALOGO_DE_CARTOES.pagarme.map((c) => c.rotulo),
    )
    expect(cenarios().map((b) => b.getAttribute('title'))).toEqual(
      CATALOGO_DE_CARTOES.pagarme.map((c) => c.descricao),
    )
    const pressionados = cenarios().filter(
      (b) => b.getAttribute('aria-pressed') === 'true',
    )
    expect(pressionados.map((b) => b.textContent)).toEqual(['recusado'])
  })

  it('o chip escolhido leva a cor do tipo; todo chip tem o ícone do tipo', () => {
    renderizar({ provedor: 'stripe', cenario: 'pendente' })
    const escolhido = screen.getByRole('button', { name: 'exige 3DS' })
    expect(escolhido).toHaveClass('text-warn')
    expect(screen.getByRole('button', { name: 'recusado' })).not.toHaveClass(
      'text-destructive',
    )
    for (const chip of cenarios())
      expect(chip.querySelector('svg[aria-hidden="true"]')).not.toBeNull()
  })

  it('escolher um cenário avisa com o provedor de agora', async () => {
    const { onEscolher, user } = renderizar({
      provedor: 'stripe',
      cenario: 'aprovado',
    })
    await user.click(screen.getByRole('button', { name: 'saldo insuficiente' }))
    expect(onEscolher).toHaveBeenCalledWith({
      provedor: 'stripe',
      cenario: 'recusado-saldo',
    })
  })

  it('trocar o provedor mantém o cenário se o novo o tiver', async () => {
    const { onEscolher, user } = renderizar({
      provedor: 'stripe',
      cenario: 'recusado',
    })
    await user.click(screen.getByRole('button', { name: 'Pagar.me' }))
    expect(onEscolher).toHaveBeenCalledWith({
      provedor: 'pagarme',
      cenario: 'recusado',
    })
  })

  it('trocar o provedor volta ao aprovado se o novo não tiver o cenário', async () => {
    const { onEscolher, user } = renderizar({
      provedor: 'stripe',
      cenario: 'recusado-cvc',
    })
    await user.click(screen.getByRole('button', { name: 'Pagar.me' }))
    expect(onEscolher).toHaveBeenCalledWith({
      provedor: 'pagarme',
      cenario: 'aprovado',
    })
  })

  it('clicar no provedor já escolhido não grava nada', async () => {
    const { onEscolher, user } = renderizar({
      provedor: 'pagarme',
      cenario: 'chargeback',
    })
    await user.click(screen.getByRole('button', { name: 'Pagar.me' }))
    expect(onEscolher).not.toHaveBeenCalled()
  })

  it('"Nova pessoa com <provedor> · <cenário>" gera a próxima pessoa', async () => {
    const { onNovaPessoa, onEscolher, user } = renderizar({
      provedor: 'pagarme',
      cenario: 'pendente-cancelado',
    })
    await user.click(
      screen.getByRole('button', {
        name: 'Nova pessoa com Pagar.me · pendente → cancela',
      }),
    )
    expect(onNovaPessoa).toHaveBeenCalledTimes(1)
    expect(onEscolher).not.toHaveBeenCalled()
  })
})
