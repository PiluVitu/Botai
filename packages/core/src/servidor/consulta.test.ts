/** @jest-environment node */
import { hojeEmSaoPaulo } from '../hoje'
import {
  ErroDeConsulta,
  LIMITE_DE_PESSOAS,
  lerConsultaDaPessoa,
  lerConsultaDasPessoas,
  mensagemDeUso,
} from './consulta'

const q = (texto: string) => new URLSearchParams(texto)

// A mensagem que o servidor devolveria no 400.
function erroDe(ler: () => unknown): string {
  try {
    ler()
  } catch (erro) {
    const mensagem = mensagemDeUso(erro)
    if (mensagem === undefined) throw erro
    return mensagem
  }
  throw new Error('esperava um erro de uso')
}

describe('mensagemDeUso', () => {
  test('erro que não é de uso não vira 400', () => {
    expect(mensagemDeUso(new Error('quebrou'))).toBeUndefined()
    expect(mensagemDeUso(new ErroDeConsulta('falta o n'))).toBe('falta o n')
  })
})

describe('lerConsultaDaPessoa', () => {
  test('sem parâmetro: sorteia a semente e usa o hoje de São Paulo', () => {
    const antes = hojeEmSaoPaulo()
    const r = lerConsultaDaPessoa(q(''))
    expect(Object.keys(r).sort()).toEqual(['hoje', 'semente'])
    expect(r.semente).toMatch(/^[0-9a-f]{16}$/)
    expect([antes, hojeEmSaoPaulo()]).toContain(r.hoje)
  })

  test('os quatro parâmetros, lidos como na CLI (uf e domínio em qualquer caixa)', () => {
    expect(
      lerConsultaDaPessoa(
        q('semente=42&hoje=2026-10-05&uf=pi&dominioEmail=Example.com'),
      ),
    ).toEqual({
      semente: '42',
      hoje: '2026-10-05',
      uf: 'PI',
      dominioEmail: 'example.com',
    })
  })

  test('semente com acento separado (NFD) fica registrada em NFC, como na biblioteca', () => {
    expect(lerConsultaDaPessoa(q('semente=Sa%CC%83o')).semente).toBe('São')
  })

  test('semente de 256 caracteres passa; 257, não', () => {
    const noLimite = 's'.repeat(256)
    expect(lerConsultaDaPessoa(q(`semente=${noLimite}`)).semente).toBe(noLimite)
    expect(erroDe(() => lerConsultaDaPessoa(q(`semente=${noLimite}s`)))).toBe(
      'semente: semente com mais de 256 caracteres',
    )
  })

  // Nome errado ou repetido não pode cair no padrão em silêncio.
  test.each([
    ['dominio-email=example.com', 'parâmetro desconhecido: dominio-email'],
    ['n=3', 'parâmetro desconhecido: n'],
    ['semente=1&semente=2', 'parâmetro repetido: semente'],
    ['semente=', 'parâmetro vazio: semente'],
    ['semente=a%01b', 'semente: semente com caractere de controle'],
    [
      'hoje=2026-02-30',
      'hoje: hoje precisa ser uma data AAAA-MM-DD que existe, recebido "2026-02-30"',
    ],
    [
      'hoje=05/10/2026',
      'hoje: hoje precisa ser uma data AAAA-MM-DD que existe, recebido "05/10/2026"',
    ],
    [
      'hoje=2026-10-5',
      'hoje: hoje precisa ser uma data AAAA-MM-DD que existe, recebido "2026-10-5"',
    ],
    ['uf=XX', 'uf: uf desconhecida "XX"'],
    [
      'dominioEmail=semponto',
      'dominioEmail: domínio de e-mail inválido "semponto"',
    ],
    [
      'dominioEmail=a@b.com',
      'dominioEmail: domínio de e-mail inválido "a@b.com"',
    ],
  ])('%s → %s', (consulta, mensagem) => {
    expect(erroDe(() => lerConsultaDaPessoa(q(consulta)))).toContain(mensagem)
  })

  test('o erro de parâmetro desconhecido lista os aceitos', () => {
    expect(erroDe(() => lerConsultaDaPessoa(q('x=1')))).toContain(
      'aceitos: semente, hoje, uf, dominioEmail',
    )
  })
})

describe('lerConsultaDasPessoas', () => {
  test('só o n: formato json, semente sorteada', () => {
    const pedido = lerConsultaDasPessoas(q('n=3'))
    expect(Object.keys(pedido).sort()).toEqual(['formato', 'n', 'opcoes'])
    expect(pedido).toMatchObject({ n: 3, formato: 'json' })
    expect(pedido.opcoes.semente).toMatch(/^[0-9a-f]{16}$/)
  })

  test('tudo junto, no sql (esquema.tabela vale, como na CLI)', () => {
    expect(
      lerConsultaDasPessoas(
        q(
          'n=2&semente=s&hoje=2026-10-05&uf=sp&dominioEmail=example.com&formato=sql&dialeto=mysql&tabela=esquema.clientes&campos=nome,cpf',
        ),
      ),
    ).toEqual({
      n: 2,
      opcoes: {
        semente: 's',
        hoje: '2026-10-05',
        uf: 'SP',
        dominioEmail: 'example.com',
      },
      formato: 'sql',
      dialeto: 'mysql',
      tabela: 'esquema.clientes',
      colunas: ['nome', 'cpf'],
    })
  })

  test('campos também valem no csv', () => {
    expect(
      lerConsultaDasPessoas(q('n=1&formato=csv&campos=cpf')).colunas,
    ).toEqual(['cpf'])
  })

  test(`n de 1 a ${LIMITE_DE_PESSOAS}`, () => {
    expect(lerConsultaDasPessoas(q('n=1')).n).toBe(1)
    expect(lerConsultaDasPessoas(q(`n=${LIMITE_DE_PESSOAS}`)).n).toBe(
      LIMITE_DE_PESSOAS,
    )
  })

  test.each([
    ['', `falta o n (de 1 a ${LIMITE_DE_PESSOAS})`],
    ['n=0', 'n inválido: 0'],
    ['n=-1', 'n inválido: -1'],
    ['n=1.5', 'n inválido: 1.5'],
    ['n=1e3', 'n inválido: 1e3'],
    ['n=%205', 'n inválido:  5'],
    ['n=dez', 'n inválido: dez'],
    [`n=${LIMITE_DE_PESSOAS + 1}`, `n inválido: ${LIMITE_DE_PESSOAS + 1}`],
    ['n=1&n=2', 'parâmetro repetido: n'],
    ['n=1&quantidade=3', 'parâmetro desconhecido: quantidade'],
    ['n=1&formato=xml', 'formato inválido: xml'],
    ['n=1&formato=sql&dialeto=oracle', 'dialeto desconhecido "oracle"'],
    ['n=1&dialeto=mysql', 'dialeto só vale com formato=sql'],
    ['n=1&formato=sql&tabela=a;drop', 'tabela inválida "a;drop"'],
    ['n=1&formato=sql&tabela=1abc', 'tabela inválida "1abc"'],
    ['n=1&formato=csv&tabela=t', 'tabela só vale com formato=sql'],
    ['n=1&campos=nome', 'campos só vale com formato=csv ou formato=sql'],
    [
      'n=1&formato=csv&campos=nao_existe',
      'campos: coluna desconhecida "nao_existe"',
    ],
    ['n=1&formato=csv&campos=nome,nome', 'campos: coluna repetida "nome"'],
    [
      'n=1&formato=csv&campos=nome,',
      'campos: lista vazia ou com vírgula sobrando',
    ],
    [
      'n=1&hoje=2026-02-30',
      'hoje: hoje precisa ser uma data AAAA-MM-DD que existe',
    ],
  ])('%s → %s', (consulta, mensagem) => {
    expect(erroDe(() => lerConsultaDasPessoas(q(consulta)))).toContain(mensagem)
  })
})
