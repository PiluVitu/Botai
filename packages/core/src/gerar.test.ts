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
