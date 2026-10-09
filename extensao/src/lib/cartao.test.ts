import { CATALOGO_DE_CARTOES } from '@pilutech/botai-core/cartao'
import { montarPessoa } from '@pilutech/botai-core/pessoa'
import { sfc32 } from '@pilutech/botai-core/prng'
import { describe, expect, it } from 'vitest'
import { PESSOA_ANTIGA } from '../test/pessoa-dourada'
import {
  cartaoParaMostrar,
  cenariosDo,
  ESCOLHA_PADRAO,
  normalizarEscolha,
  rotuloDaEscolha,
  trocarProvedor,
} from './cartao'

describe('a escolha do cartão das próximas pessoas', () => {
  it('o padrão é o aprovado da Stripe, o mesmo do core sem opção', () => {
    expect(ESCOLHA_PADRAO).toEqual({ provedor: 'stripe', cenario: 'aprovado' })
  })

  it('aceita todo par do catálogo, como veio', () => {
    for (const provedor of ['stripe', 'pagarme'] as const)
      for (const { id } of CATALOGO_DE_CARTOES[provedor])
        expect(normalizarEscolha({ provedor, cenario: id })).toEqual({
          provedor,
          cenario: id,
        })
  })

  // O catálogo pode mudar entre versões: o que ficou guardado e não existe mais volta ao padrão.
  it.each([
    [
      'cenário que o provedor não tem',
      { provedor: 'pagarme', cenario: 'recusado-cvc' },
    ],
    ['provedor que não existe', { provedor: 'adyen', cenario: 'aprovado' }],
    ['caixa diferente', { provedor: 'Stripe', cenario: 'aprovado' }],
    ['sem cenário', { provedor: 'pagarme' }],
    ['objeto vazio', {}],
    ['null', null],
    ['undefined', undefined],
    ['texto', 'stripe:aprovado'],
    ['número', 42],
  ])('%s volta ao padrão', (_caso, valor) => {
    expect(normalizarEscolha(valor)).toEqual(ESCOLHA_PADRAO)
  })

  it('devolve um objeto novo só com provedor e cenário', () => {
    const guardado = { provedor: 'pagarme', cenario: 'recusado', extra: 1 }
    const lido = normalizarEscolha(guardado)
    expect(lido).toEqual({ provedor: 'pagarme', cenario: 'recusado' })
    expect(lido).not.toBe(guardado)
  })

  it('os cenários de cada provedor, na ordem do catálogo', () => {
    expect(cenariosDo('pagarme').map((c) => c.id)).toEqual([
      'aprovado',
      'recusado',
      'pendente',
      'pendente-recusado',
      'pendente-cancelado',
      'chargeback',
    ])
    expect(cenariosDo('stripe')).toBe(CATALOGO_DE_CARTOES.stripe)
  })

  it('trocar o provedor mantém o cenário que o novo também tem', () => {
    expect(
      trocarProvedor({ provedor: 'stripe', cenario: 'recusado' }, 'pagarme'),
    ).toEqual({ provedor: 'pagarme', cenario: 'recusado' })
    expect(
      trocarProvedor({ provedor: 'pagarme', cenario: 'pendente' }, 'stripe'),
    ).toEqual({ provedor: 'stripe', cenario: 'pendente' })
  })

  it('trocar para um provedor sem aquele cenário volta ao aprovado', () => {
    expect(
      trocarProvedor(
        { provedor: 'stripe', cenario: 'recusado-cvc' },
        'pagarme',
      ),
    ).toEqual({ provedor: 'pagarme', cenario: 'aprovado' })
    expect(
      trocarProvedor({ provedor: 'pagarme', cenario: 'chargeback' }, 'stripe'),
    ).toEqual({ provedor: 'stripe', cenario: 'aprovado' })
  })

  it('trocar para o mesmo provedor não muda nada', () => {
    const escolha = { provedor: 'pagarme', cenario: 'chargeback' } as const
    expect(trocarProvedor(escolha, 'pagarme')).toEqual(escolha)
  })

  it('o rótulo junta o nome do provedor e o rótulo do cenário', () => {
    expect(rotuloDaEscolha({ provedor: 'pagarme', cenario: 'recusado' })).toBe(
      'Pagar.me · recusado',
    )
    expect(rotuloDaEscolha({ provedor: 'stripe', cenario: 'pendente' })).toBe(
      'Stripe · exige 3DS',
    )
  })
})

describe('o cartão da pessoa, para mostrar', () => {
  it('o provedor e o cenário com que ela foi gerada', () => {
    const recusada = montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', {
      cartao: { provedor: 'pagarme', cenario: 'recusado' },
    })
    expect(cartaoParaMostrar(recusada.cartao)).toEqual({
      provedor: 'pagarme',
      cenario: CATALOGO_DE_CARTOES.pagarme[1],
    })
  })

  // Pessoas guardadas antes da 1.2.0 (core 0.4) não têm provedor nem cenário: eram todas Stripe aprovado.
  it('pessoa antiga, sem provedor nem cenário no cartão, é Stripe aprovado', () => {
    expect(cartaoParaMostrar(PESSOA_ANTIGA.cartao)).toEqual({
      provedor: 'stripe',
      cenario: CATALOGO_DE_CARTOES.stripe[0],
    })
  })
})
