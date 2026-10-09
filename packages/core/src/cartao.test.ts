import {
  CARTOES_TESTE,
  CATALOGO_DE_CARTOES,
  CENARIO_PADRAO,
  cenarioDoCartao,
  escolherNumero,
  formatarNumeroCartao,
  gerarCartao,
  lerCartao,
  lerCenarios,
  lerDistribuicao,
  luhnValido,
  NOME_DO_PROVEDOR,
  PROVEDOR_PADRAO,
  PROVEDORES,
  type Provedor,
} from './cartao'
import { ErroDeOpcao, LIMITE_DO_LOTE } from './opcoes'
import { sfc32 } from './prng'
import { minimo, maximo, sementes } from './rng-teste'

const ids = (provedor: Provedor) =>
  CATALOGO_DE_CARTOES[provedor].map((c) => c.id)

const TODOS = PROVEDORES.flatMap((provedor) =>
  CATALOGO_DE_CARTOES[provedor].map((c) => [provedor, c.id] as const),
)

function erroDe(f: () => unknown): ErroDeOpcao {
  try {
    f()
  } catch (erro) {
    if (erro instanceof ErroDeOpcao) return erro
    throw erro
  }
  throw new Error('esperava um ErroDeOpcao')
}

describe('catálogo de cartões de teste', () => {
  test('provedores: stripe (padrão) e pagarme, com o nome de cada um', () => {
    expect(PROVEDORES).toEqual(['stripe', 'pagarme'])
    expect(PROVEDOR_PADRAO).toBe('stripe')
    expect(CENARIO_PADRAO).toBe('aprovado')
    expect(NOME_DO_PROVEDOR).toEqual({ stripe: 'Stripe', pagarme: 'Pagar.me' })
  })

  // Números de docs.stripe.com/testing ("Recusas" e "Autenticar sempre"), conferidos em 2026-10-09.
  test('stripe: os números documentados de cada cenário, na ordem', () => {
    expect(
      CATALOGO_DE_CARTOES.stripe.map((c) => [
        c.id,
        c.numeros.map((n) => n.numero),
      ]),
    ).toEqual([
      ['aprovado', ['4242424242424242', '5555555555554444']],
      ['recusado', ['4000000000000002']],
      ['pendente', ['4000002760003184']],
      ['recusado-saldo', ['4000000000009995']],
      ['recusado-roubado', ['4000000000009979']],
      ['recusado-perdido', ['4000000000009987']],
      ['recusado-expirado', ['4000000000000069']],
      ['recusado-cvc', ['4000000000000127']],
      ['erro-processamento', ['4000000000000119']],
    ])
  })

  // Números do simulador da Pagar.me (docs.pagar.me/docs/simulador-de-cartão-de-crédito), conferidos em 2026-10-09.
  test('pagarme: os números do simulador de cada cenário, na ordem', () => {
    expect(
      CATALOGO_DE_CARTOES.pagarme.map((c) => [
        c.id,
        c.numeros.map((n) => n.numero),
      ]),
    ).toEqual([
      ['aprovado', ['4000000000000010']],
      ['recusado', ['4000000000000028']],
      ['pendente', ['4000000000000036']],
      ['pendente-recusado', ['4000000000000044']],
      ['pendente-cancelado', ['4000000000000051']],
      ['chargeback', ['4000000000000069']],
    ])
  })

  test('CARTOES_TESTE continua sendo o par aprovado da Stripe', () => {
    expect(CARTOES_TESTE).toEqual([
      { bandeira: 'visa', numero: '4242424242424242' },
      { bandeira: 'mastercard', numero: '5555555555554444' },
    ])
    expect(CARTOES_TESTE).toBe(CATALOGO_DE_CARTOES.stripe[0].numeros)
  })

  // Todos os 16 números do catálogo passam no Luhn (conferido um a um).
  test.each(
    PROVEDORES.flatMap((provedor) =>
      CATALOGO_DE_CARTOES[provedor].flatMap((c) =>
        c.numeros.map((n) => [provedor, c.id, n.numero, n.bandeira] as const),
      ),
    ),
  )(
    '%s %s %s passa no Luhn e tem a bandeira do prefixo',
    (...[, , numero, bandeira]) => {
      expect(luhnValido(numero)).toBe(true)
      expect(numero).toMatch(/^\d{16}$/)
      expect(bandeira).toBe(numero.startsWith('4') ? 'visa' : 'mastercard')
    },
  )

  test('cada cenário tem rótulo, descrição e tipo (ok, erro ou espera)', () => {
    for (const provedor of PROVEDORES)
      for (const c of CATALOGO_DE_CARTOES[provedor]) {
        expect(c.rotulo.length).toBeGreaterThan(0)
        expect(c.descricao).toMatch(/\.$/)
        expect(['ok', 'erro', 'espera']).toContain(c.tipo)
      }
    expect(
      CATALOGO_DE_CARTOES.pagarme.map((c) => [c.id, c.tipo, c.rotulo]),
    ).toEqual([
      ['aprovado', 'ok', 'aprovado'],
      ['recusado', 'erro', 'recusado'],
      ['pendente', 'espera', 'pendente → aprova'],
      ['pendente-recusado', 'espera', 'pendente → recusa'],
      ['pendente-cancelado', 'espera', 'pendente → cancela'],
      ['chargeback', 'erro', 'chargeback'],
    ])
    expect(cenarioDoCartao('stripe', 'pendente').rotulo).toBe('exige 3DS')
  })

  test('ids únicos por provedor, em minúsculas e com hífen', () => {
    for (const provedor of PROVEDORES) {
      expect(new Set(ids(provedor)).size).toBe(ids(provedor).length)
      for (const id of ids(provedor)) expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/)
    }
  })
})

describe('lerCartao', () => {
  test('sem nada: stripe e aprovado', () => {
    expect(lerCartao()).toEqual({ provedor: 'stripe', cenario: 'aprovado' })
    expect(lerCartao({})).toEqual({ provedor: 'stripe', cenario: 'aprovado' })
  })

  test('aceita qualquer caixa e devolve o id', () => {
    expect(
      lerCartao({
        provedor: 'PagarMe' as Provedor,
        cenario: 'Chargeback' as 'chargeback',
      }),
    ).toEqual({ provedor: 'pagarme', cenario: 'chargeback' })
  })

  test('só o cenário: vale o provedor padrão', () => {
    expect(lerCartao({ cenario: 'recusado-cvc' })).toEqual({
      provedor: 'stripe',
      cenario: 'recusado-cvc',
    })
  })

  test('provedor desconhecido: ErroDeOpcao(cartao) com os provedores', () => {
    const erro = erroDe(() => lerCartao({ provedor: 'adyen' as Provedor }))
    expect(erro.opcao).toBe('cartao')
    expect(erro.message).toBe(
      'provedor de cartão desconhecido "adyen" (use stripe, pagarme)',
    )
  })

  test('cenário que o provedor não tem: ErroDeOpcao(cenario) com os dele', () => {
    const erro = erroDe(() =>
      lerCartao({ provedor: 'stripe', cenario: 'chargeback' }),
    )
    expect(erro.opcao).toBe('cenario')
    expect(erro.message).toBe(
      'cenário desconhecido "chargeback" para o provedor stripe (use aprovado, recusado, pendente, recusado-saldo, recusado-roubado, recusado-perdido, recusado-expirado, recusado-cvc, erro-processamento)',
    )
    expect(
      erroDe(() => lerCartao({ provedor: 'pagarme', cenario: 'recusado-cvc' }))
        .message,
    ).toBe(
      'cenário desconhecido "recusado-cvc" para o provedor pagarme (use aprovado, recusado, pendente, pendente-recusado, pendente-cancelado, chargeback)',
    )
  })

  test.each(['', ' stripe', 'toString', '__proto__'])(
    'provedor %j é desconhecido',
    (provedor) => {
      expect(
        erroDe(() => lerCartao({ provedor: provedor as Provedor })).opcao,
      ).toBe('cartao')
    },
  )
})

describe('lerCenarios (texto da CLI e do servidor)', () => {
  test('lê cenario:quantidade separados por vírgula, na ordem dada', () => {
    const lidos = lerCenarios('recusado:10, aprovado:2 ,pendente:1')
    expect(lidos).toEqual({ recusado: 10, aprovado: 2, pendente: 1 })
    expect(Object.keys(lidos)).toEqual(['recusado', 'aprovado', 'pendente'])
  })

  test('não valida o cenário contra o provedor (isso é do lerDistribuicao)', () => {
    expect(lerCenarios('qualquer:3')).toEqual({ qualquer: 3 })
  })

  test('__proto__ vira um cenário comum, que o lerDistribuicao recusa', () => {
    const lidos = lerCenarios('__proto__:2')
    expect(Object.keys(lidos)).toEqual(['__proto__'])
    expect(erroDe(() => lerDistribuicao('stripe', lidos)).message).toMatch(
      /^cenário desconhecido "__proto__" para o provedor stripe/,
    )
  })

  test.each([
    [
      '',
      'cenarios precisa ser cenario:quantidade, separados por vírgula (ex.: recusado:10,aprovado:2), recebido ""',
    ],
    [
      'recusado',
      'cenarios precisa ser cenario:quantidade, separados por vírgula (ex.: recusado:10,aprovado:2), recebido "recusado"',
    ],
    [
      'recusado:10,',
      'cenarios precisa ser cenario:quantidade, separados por vírgula (ex.: recusado:10,aprovado:2), recebido "recusado:10,"',
    ],
    [
      'recusado:1:2',
      'cenarios precisa ser cenario:quantidade, separados por vírgula (ex.: recusado:10,aprovado:2), recebido "recusado:1:2"',
    ],
    [
      ':3',
      'cenarios precisa ser cenario:quantidade, separados por vírgula (ex.: recusado:10,aprovado:2), recebido ":3"',
    ],
    [
      'recusado:x',
      'quantidade inválida "x" no cenário recusado (um inteiro de 1 em diante)',
    ],
    [
      'recusado:0',
      'quantidade inválida "0" no cenário recusado (um inteiro de 1 em diante)',
    ],
    [
      'recusado:-1',
      'quantidade inválida "-1" no cenário recusado (um inteiro de 1 em diante)',
    ],
    [
      'recusado:1.5',
      'quantidade inválida "1.5" no cenário recusado (um inteiro de 1 em diante)',
    ],
    ['recusado:1,recusado:2', 'cenário repetido "recusado"'],
  ])('recusa %j', (texto, mensagem) => {
    const erro = erroDe(() => lerCenarios(texto))
    expect(erro.opcao).toBe('cenarios')
    expect(erro.message).toBe(mensagem)
  })
})

describe('lerDistribuicao', () => {
  test('valida contra o provedor e devolve os grupos na ordem dada', () => {
    expect(
      lerDistribuicao('pagarme', { recusado: 10, aprovado: 2, pendente: 1 }),
    ).toEqual([
      { cenario: 'recusado', quantidade: 10 },
      { cenario: 'aprovado', quantidade: 2 },
      { cenario: 'pendente', quantidade: 1 },
    ])
  })

  test('cenário em qualquer caixa vira o id', () => {
    expect(lerDistribuicao('stripe', { Recusado: 1 })).toEqual([
      { cenario: 'recusado', quantidade: 1 },
    ])
  })

  test.each([
    [{}, 'informe ao menos um cenário com quantidade, ex.: aprovado:1'],
    [
      { chargeback: 1 },
      'cenário desconhecido "chargeback" para o provedor stripe (use aprovado, recusado, pendente, recusado-saldo, recusado-roubado, recusado-perdido, recusado-expirado, recusado-cvc, erro-processamento)',
    ],
    [
      { aprovado: 0 },
      'quantidade inválida "0" no cenário aprovado (um inteiro de 1 em diante)',
    ],
    [
      { aprovado: 1.5 },
      'quantidade inválida "1.5" no cenário aprovado (um inteiro de 1 em diante)',
    ],
    [
      { aprovado: undefined },
      'quantidade inválida "undefined" no cenário aprovado (um inteiro de 1 em diante)',
    ],
    [{ recusado: 1, Recusado: 2 }, 'cenário repetido "recusado"'],
    [
      { aprovado: LIMITE_DO_LOTE, recusado: 1 },
      'a soma dos cenários (100001) passa do limite de 100000 pessoas',
    ],
    [
      { aprovado: 1e20 },
      'a soma dos cenários (100000000000000000000) passa do limite de 100000 pessoas',
    ],
  ])('recusa %j', (cenarios, mensagem) => {
    const erro = erroDe(() => lerDistribuicao('stripe', cenarios))
    expect(erro.opcao).toBe('cenarios')
    expect(erro.message).toBe(mensagem)
  })
})

describe('gerarCartao', () => {
  test('validade entre hoje + 12 e hoje + 59 meses, CVV de 3 dígitos', () => {
    expect(gerarCartao(minimo, '2026-10-01', 'MARIA E SOUZA')).toEqual({
      bandeira: 'visa',
      numero: '4242424242424242',
      numeroFormatado: '4242 4242 4242 4242',
      titular: 'MARIA E SOUZA',
      validade: '10/27',
      mes: '10',
      ano: '27',
      cvv: '100',
      provedor: 'stripe',
      cenario: 'aprovado',
    })
    expect(gerarCartao(maximo, '2026-10-01', 'MARIA E SOUZA')).toMatchObject({
      bandeira: 'mastercard',
      validade: '09/31',
      cvv: '999',
    })
    for (const r of sementes(300)) {
      const c = gerarCartao(r, '2026-10-01', 'MARIA E SOUZA')
      const [mm, aa] = c.validade.split('/').map(Number)
      expect(2000 + aa > 2026 || (2000 + aa === 2026 && mm >= 10)).toBe(true)
      expect(c.cvv).toMatch(/^\d{3}$/)
      expect(`${c.mes}/${c.ano}`).toBe(c.validade)
    }
  })

  test('provedor e cenário escolhem o número; o resto é igual ao do padrão', () => {
    const padrao = gerarCartao(sfc32(5, 6, 7, 8), '2026-10-01', 'ANA B LIMA')
    const c = gerarCartao(sfc32(5, 6, 7, 8), '2026-10-01', 'ANA B LIMA', {
      provedor: 'pagarme',
      cenario: 'recusado',
    })
    expect(c).toEqual({
      ...padrao,
      bandeira: 'visa',
      numero: '4000000000000028',
      numeroFormatado: '4000 0000 0000 0028',
      provedor: 'pagarme',
      cenario: 'recusado',
    })
  })

  // O contrato: o sorteio do número consome o rng como o escolher sobre o par da Stripe, em
  // qualquer cenário. Com isso, o que vem depois do cartão também não muda.
  test.each(TODOS)(
    '%s %s consome o rng como o padrão (300 sementes)',
    (provedor, cenario) => {
      const outras = sementes(300)
      for (const [a, b] of sementes(300).map((r, i) => [r, outras[i]])) {
        const padrao = gerarCartao(a, '2026-10-01', 'X')
        const c = gerarCartao(b, '2026-10-01', 'X', { provedor, cenario })
        expect([c.validade, c.cvv]).toEqual([padrao.validade, padrao.cvv])
        expect(b.int(1 << 30)).toBe(a.int(1 << 30))
      }
    },
  )

  test('stripe aprovado sorteia entre Visa e Mastercard; os outros têm um número só', () => {
    expect(
      new Set(
        sementes(50).map((r) => gerarCartao(r, '2026-10-01', 'X').numero),
      ),
    ).toEqual(new Set(['4242424242424242', '5555555555554444']))
    for (const [provedor, cenario] of TODOS) {
      const numeros = cenarioDoCartao(provedor, cenario).numeros.map(
        (n) => n.numero,
      )
      for (const r of sementes(20))
        expect(numeros).toContain(
          gerarCartao(r, '2026-10-01', 'X', { provedor, cenario }).numero,
        )
    }
  })

  test('escolha inválida lança ErroDeOpcao antes de sortear', () => {
    let chamadas = 0
    const contador = {
      int: (n: number) => {
        chamadas++
        return n - 1
      },
    }
    expect(
      erroDe(() =>
        gerarCartao(contador, '2026-10-01', 'X', {
          provedor: 'pagarme',
          cenario: 'pendente-3ds' as 'pendente',
        }),
      ).opcao,
    ).toBe('cenario')
    expect(chamadas).toBe(0)
  })
})

describe('escolherNumero (o comando botai cartao)', () => {
  test('um sorteio só, como o do gerarCartao', () => {
    expect(escolherNumero(minimo)).toEqual({
      bandeira: 'visa',
      numero: '4242424242424242',
    })
    expect(escolherNumero(maximo)).toEqual({
      bandeira: 'mastercard',
      numero: '5555555555554444',
    })
    expect(
      escolherNumero(maximo, { provedor: 'stripe', cenario: 'recusado-saldo' }),
    ).toEqual({ bandeira: 'visa', numero: '4000000000009995' })
  })
})

describe('Luhn e formatação', () => {
  test('Luhn recusa dígito trocado e número curto', () => {
    expect(luhnValido('4242424242424241')).toBe(false)
    expect(luhnValido('42424242')).toBe(false)
  })

  test('formata em grupos de 4', () => {
    expect(formatarNumeroCartao('4242424242424242')).toBe('4242 4242 4242 4242')
  })
})
