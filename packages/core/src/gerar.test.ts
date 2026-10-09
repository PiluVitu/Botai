import {
  gerarPessoa,
  gerarPessoas,
  loteCom,
  type OpcoesResolvidas,
  pessoasDoLote,
  resolverOpcoes,
  TENTATIVAS_POR_PESSOA,
} from './gerar'
import { hojeEmSaoPaulo } from './hoje'
import { ErroDeOpcao } from './opcoes'
import type { Pessoa } from './pessoa'
import type { UF } from './uf'

const semCartao = ({ cartao: _, ...resto }: Pessoa) => resto

function erroDe(f: () => unknown): ErroDeOpcao {
  try {
    f()
  } catch (erro) {
    if (erro instanceof ErroDeOpcao) return erro
    throw erro
  }
  throw new Error('esperava um ErroDeOpcao')
}

const HOJE = '2026-10-05'

describe('gerarPessoa(opcoes)', () => {
  test('semente e hoje fixos: pessoa conhecida', () => {
    const p = gerarPessoa({ semente: 'botai', hoje: HOJE })
    expect(p.nome.completo).toBe('Larissa Almeida Conceição')
    expect(p.cpf).toBe('610.246.647-08')
    expect(p.email.endereco).toBe('larissa-conceicao-1063@tuamaeaquelaursa.com')
    expect(p.endereco.uf).toBe('ES')
    expect(p.empresa.cnpj).toBe('68.069.290/0001-63')
  })

  test('semente numérica = a mesma semente em texto', () => {
    const p = gerarPessoa({ semente: 42, hoje: HOJE })
    expect(p).toEqual(gerarPessoa({ semente: '42', hoje: HOJE }))
    expect(p.nome.completo).toBe('Márcio Carvalho Rodrigues')
    expect(p.cpf).toBe('634.132.403-07')
  })

  test('uf: mesmo nome, endereço e documentos da UF pedida', () => {
    const p = gerarPessoa({ semente: 'botai', hoje: HOJE, uf: 'PI' })
    expect(p.nome.completo).toBe('Larissa Almeida Conceição')
    expect(p.endereco.cidade).toBe('Teresina')
    expect(p.cpf).toBe('610.246.643-84')
    expect(p.celular.ddd).toBe('86')
    expect(
      gerarPessoa({ semente: 'botai', hoje: HOJE, uf: 'pi' as UF }),
    ).toEqual(p)
  })

  test('dominioEmail: só o e-mail muda, e sem caixa pública', () => {
    const padrao = gerarPessoa({ semente: 'botai', hoje: HOJE })
    const p = gerarPessoa({
      semente: 'botai',
      hoje: HOJE,
      dominioEmail: 'example.com',
    })
    expect(p.email.endereco).toBe('larissa-conceicao-1063@example.com')
    expect(p.email.caixaUrl).toBeNull()
    expect({ ...p, email: padrao.email }).toEqual(padrao)
  })

  test('sem hoje usa a data de São Paulo', () => {
    expect(gerarPessoa({ semente: 'botai' })).toEqual(
      gerarPessoa({ semente: 'botai', hoje: hojeEmSaoPaulo() }),
    )
  })

  test('sem semente sorteia: duas chamadas dão pessoas diferentes', () => {
    expect(gerarPessoa({ hoje: HOJE }).cpf).not.toBe(
      gerarPessoa({ hoje: HOJE }).cpf,
    )
  })

  test.each([
    [{ hoje: '2026-02-30' }, 'hoje'],
    [{ uf: 'XX' as UF }, 'uf'],
    [{ dominioEmail: 'localhost' }, 'dominioEmail'],
    [{ semente: '' }, 'semente'],
  ])('opção inválida %j lança ErroDeOpcao(%s)', (opcoes, opcao) => {
    expect(() => gerarPessoa(opcoes)).toThrow(ErroDeOpcao)
    try {
      gerarPessoa(opcoes)
    } catch (erro) {
      expect((erro as ErroDeOpcao).opcao).toBe(opcao)
    }
  })
})

describe('resolverOpcoes', () => {
  test('registra a semente como texto e sorteia quando falta', () => {
    expect(resolverOpcoes({ semente: 42, hoje: HOJE })).toEqual({
      semente: '42',
      hoje: HOJE,
    })
    expect(resolverOpcoes({ hoje: HOJE }).semente).toMatch(/^[0-9a-f]{16}$/)
  })
})

describe('gerarPessoas(n, opcoes)', () => {
  test('a pessoa i do lote é a da semente S/i', () => {
    const lote = gerarPessoas(5, { semente: 'lote', hoje: HOJE })
    expect(lote).toHaveLength(5)
    lote.forEach((p, i) =>
      expect(p).toEqual(gerarPessoa({ semente: `lote/${i}`, hoje: HOJE })),
    )
  })

  test('n = 0 dá lote vazio; n inválido lança antes de gerar', () => {
    expect(gerarPessoas(0, { semente: 'x', hoje: HOJE })).toEqual([])
    const r = resolverOpcoes({ semente: 'x', hoje: HOJE })
    for (const n of [-1, 1.5, 100_001])
      expect(() => pessoasDoLote(n, r)).toThrow(ErroDeOpcao)
  })

  test('1000 pessoas da semente mil-3: sem e-mail, CPF ou CNPJ repetido', () => {
    const lote = gerarPessoas(1000, { semente: 'mil-3', hoje: HOJE })
    expect(new Set(lote.map((p) => p.email.endereco)).size).toBe(1000)
    expect(new Set(lote.map((p) => p.cpf)).size).toBe(1000)
    expect(new Set(lote.map((p) => p.empresa.cnpj)).size).toBe(1000)
  })

  // Caso real: mil-3/971 repete o e-mail de mil-3/387, e a 972ª pessoa sai de mil-3/971/2.
  test('repetição real é sorteada de novo com S/i/2', () => {
    const lote = [
      ...pessoasDoLote(1000, resolverOpcoes({ semente: 'mil-3', hoje: HOJE })),
    ]
    const sorteadasDeNovo = lote
      .map((p) => p.semente)
      .filter((s) => s.split('/').length === 3)
    expect(sorteadasDeNovo).toEqual(['mil-3/971/2'])
    const repetida = gerarPessoa({ semente: 'mil-3/971', hoje: HOJE })
    expect(repetida.email.endereco).toBe(
      'felipe-oliveira-9071@tuamaeaquelaursa.com',
    )
    expect(lote[387].pessoa.email.endereco).toBe(repetida.email.endereco)
    expect(lote[971].pessoa.email.endereco).toBe(
      'aline-pereira-1476@tuamaeaquelaursa.com',
    )
  })

  test('prefixo estável: as 200 primeiras de um lote de 1000 = o lote de 200', () => {
    const opcoes = { semente: 'mil-3', hoje: HOJE }
    expect(gerarPessoas(1000, opcoes).slice(0, 200)).toEqual(
      gerarPessoas(200, opcoes),
    )
  })

  test('UF com um só logradouro (PI), 2000 pessoas: nada repete', () => {
    const lote = gerarPessoas(2000, { semente: 'pi', hoje: HOJE, uf: 'PI' })
    expect(lote.every((p) => p.endereco.uf === 'PI')).toBe(true)
    expect(new Set(lote.map((p) => p.email.endereco)).size).toBe(2000)
    expect(new Set(lote.map((p) => p.cpf)).size).toBe(2000)
    expect(new Set(lote.map((p) => p.empresa.cnpj)).size).toBe(2000)
  })
})

describe('loteCom (sorteio de novo, campo a campo)', () => {
  const r: OpcoesResolvidas = { semente: 's', hoje: HOJE }
  const A = gerarPessoa({ semente: 'a', hoje: HOJE })
  const B = gerarPessoa({ semente: 'b', hoje: HOJE })

  test('e-mail, CPF e CNPJ repetidos forçam S/i/2, S/i/3, S/i/4…', () => {
    const porSemente: Record<string, Pessoa> = {
      's/0': A,
      's/1': { ...B, email: A.email },
      's/1/2': { ...B, cpf: A.cpf },
      's/1/3': { ...B, empresa: A.empresa },
      's/1/4': B,
    }
    const sementes = [...loteCom(2, r, (s) => porSemente[s])].map(
      (p) => p.semente,
    )
    expect(sementes).toEqual(['s/0', 's/1/4'])
  })

  test(`sem saída em ${TENTATIVAS_POR_PESSOA} tentativas, lança em vez de travar`, () => {
    expect(() => [...loteCom(2, r, () => A)]).toThrow(
      'nenhuma pessoa sem repetição na posição 1',
    )
  })
})

describe('cartão (gerarPessoa)', () => {
  test('provedor e cenário: a mesma pessoa, com o cartão do cenário', () => {
    const padrao = gerarPessoa({ semente: 'botai', hoje: HOJE })
    const p = gerarPessoa({
      semente: 'botai',
      hoje: HOJE,
      cartao: { provedor: 'pagarme', cenario: 'chargeback' },
    })
    expect(semCartao(p)).toEqual(semCartao(padrao))
    expect(p.cartao).toMatchObject({
      numero: '4000000000000069',
      provedor: 'pagarme',
      cenario: 'chargeback',
      validade: padrao.cartao.validade,
      cvv: padrao.cartao.cvv,
    })
    expect(padrao.cartao).toMatchObject({
      provedor: 'stripe',
      cenario: 'aprovado',
    })
  })

  test.each([
    [{ provedor: 'adyen' }, 'cartao'],
    [{ cenario: 'chargeback' }, 'cenario'],
  ])('cartao %j inválido lança ErroDeOpcao(%s)', (cartao, opcao) => {
    expect(
      erroDe(() =>
        gerarPessoa({ semente: 'x', hoje: HOJE, cartao: cartao as never }),
      ).opcao,
    ).toBe(opcao)
  })
})

describe('cartão no lote (gerarPessoas)', () => {
  const CENARIOS = { recusado: 10, aprovado: 2, pendente: 1 } as const
  const opcoes = {
    semente: 'lote',
    hoje: HOJE,
    cartao: { provedor: 'pagarme' as const, cenarios: CENARIOS },
  }

  test('os cenários saem em grupos, na ordem dada, e a pessoa i é a da semente S/i', () => {
    const lote = gerarPessoas(13, opcoes)
    expect(lote.map((p) => p.cartao.cenario)).toEqual([
      ...Array(10).fill('recusado'),
      'aprovado',
      'aprovado',
      'pendente',
    ])
    expect(new Set(lote.map((p) => p.cartao.provedor))).toEqual(
      new Set(['pagarme']),
    )
    lote.forEach((p, i) =>
      expect(p).toEqual(
        gerarPessoa({
          semente: `lote/${i}`,
          hoje: HOJE,
          cartao: { provedor: 'pagarme', cenario: p.cartao.cenario },
        }),
      ),
    )
  })

  test('fora do cartão, o lote é o mesmo do lote sem cenários', () => {
    expect(gerarPessoas(13, opcoes).map(semCartao)).toEqual(
      gerarPessoas(13, { semente: 'lote', hoje: HOJE }).map(semCartao),
    )
  })

  test('a ordem do objeto é a ordem dos grupos', () => {
    const lote = gerarPessoas(3, {
      semente: 'ordem',
      hoje: HOJE,
      cartao: { cenarios: { pendente: 1, recusado: 2 } },
    })
    expect(lote.map((p) => p.cartao.cenario)).toEqual([
      'pendente',
      'recusado',
      'recusado',
    ])
    expect(lote.map((p) => p.cartao.numero)).toEqual([
      '4000002760003184',
      '4000000000000002',
      '4000000000000002',
    ])
  })

  test('só o provedor: todas aprovadas nele; só o cenário: todas nele', () => {
    expect(
      gerarPessoas(3, {
        semente: 's',
        hoje: HOJE,
        cartao: { provedor: 'pagarme' },
      }).map((p) => [p.cartao.cenario, p.cartao.numero]),
    ).toEqual(Array(3).fill(['aprovado', '4000000000000010']))
    expect(
      gerarPessoas(2, {
        semente: 's',
        hoje: HOJE,
        cartao: { cenario: 'recusado-saldo' },
      }).map((p) => p.cartao.numero),
    ).toEqual(['4000000000009995', '4000000000009995'])
  })

  test('unicidade de e-mail, CPF e CNPJ no lote inteiro, com as mesmas sementes', () => {
    const cenarios = { aprovado: 400, recusado: 300, chargeback: 300 }
    const lote = [
      ...pessoasDoLote(
        1000,
        resolverOpcoes({
          semente: 'mil-3',
          hoje: HOJE,
          cartao: { provedor: 'pagarme', cenarios },
        }),
      ),
    ]
    expect(lote.map((p) => p.semente)).toEqual(
      [
        ...pessoasDoLote(
          1000,
          resolverOpcoes({ semente: 'mil-3', hoje: HOJE }),
        ),
      ].map((p) => p.semente),
    )
    expect(lote[971].semente).toBe('mil-3/971/2')
    expect(lote[971].pessoa.cartao.cenario).toBe('chargeback')
    expect(new Set(lote.map((p) => p.pessoa.email.endereco)).size).toBe(1000)
    expect(new Set(lote.map((p) => p.pessoa.cpf)).size).toBe(1000)
    expect(new Set(lote.map((p) => p.pessoa.empresa.cnpj)).size).toBe(1000)
  })

  test('n diferente da soma dos cenários é ErroDeOpcao(n)', () => {
    const erro = erroDe(() => gerarPessoas(12, opcoes))
    expect(erro.opcao).toBe('n')
    expect(erro.message).toBe('n (12) diferente da soma dos cenários (13)')
  })

  test('cenario e cenarios juntos é ErroDeOpcao(cenarios)', () => {
    const erro = erroDe(() =>
      gerarPessoas(1, {
        semente: 'x',
        hoje: HOJE,
        cartao: { cenario: 'recusado', cenarios: { aprovado: 1 } },
      }),
    )
    expect(erro.opcao).toBe('cenarios')
    expect(erro.message).toBe('use cenario ou cenarios, não os dois')
  })

  test.each([
    [{ provedor: 'adyen', cenarios: { aprovado: 1 } }, 'cartao'],
    [{ provedor: 'stripe', cenarios: { chargeback: 1 } }, 'cenarios'],
    [{ cenarios: {} }, 'cenarios'],
    [{ cenarios: { aprovado: 0 } }, 'cenarios'],
  ])('cartao %j lança ErroDeOpcao(%s)', (cartao, opcao) => {
    expect(
      erroDe(() =>
        gerarPessoas(1, { semente: 'x', hoje: HOJE, cartao: cartao as never }),
      ).opcao,
    ).toBe(opcao)
  })

  // Quem escreve o lote no stdout ou no corpo HTTP não pode ter escrito nada antes do erro.
  test('a distribuição é conferida na chamada, antes da primeira pessoa', () => {
    const r = resolverOpcoes({
      semente: 'x',
      hoje: HOJE,
      cartao: { cenarios: { aprovado: 2 } },
    })
    expect(() => pessoasDoLote(3, r)).toThrow(ErroDeOpcao)
  })
})
