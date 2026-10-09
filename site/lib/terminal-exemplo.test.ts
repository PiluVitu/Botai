import { gerarEnvelopeDaPessoa, MOTOR } from '@pilutech/botai-core'
import { executar } from '../../packages/core/src/cli/executar'
import {
  COMANDO_DO_EXEMPLO,
  HOJE_DO_EXEMPLO,
  PESSOA_DO_EXEMPLO,
  SEMENTE_DO_EXEMPLO,
} from './exemplo'
import {
  abreviar,
  ENVELOPE_DO_EXEMPLO,
  type LinhaDaSaida,
  SAIDA_DO_TERMINAL,
  textoDaSaida,
} from './terminal-exemplo'

function saidaDaCli(): string {
  const [, , ...argv] = COMANDO_DO_EXEMPLO.split(' ')
  let dados = ''
  const codigo = executar(argv, {
    dados: (texto) => {
      dados += texto
    },
    mensagem: () => {},
  })
  expect(codigo).toBe(0)
  return dados
}

const membrosNoRecuo = (recuo: number) =>
  SAIDA_DO_TERMINAL.filter((linha: LinhaDaSaida) => linha.recuo === recuo)
    .map((linha) => linha.trechos[0])
    .filter((trecho) => trecho.tipo === 'chave')
    .map((trecho) => JSON.parse(trecho.texto.replace(/: $/, '')) as string)

describe('a saída do terminal do hero', () => {
  // A janela mostra um recorte do que a CLI imprime: o envelope inteiro tem de ser o da CLI, byte a byte.
  it('o envelope é o que o comando do hero imprime, na mesma ordem de chaves', () => {
    expect(`${JSON.stringify(ENVELOPE_DO_EXEMPLO, null, 2)}\n`).toBe(
      saidaDaCli(),
    )
    expect(JSON.stringify(ENVELOPE_DO_EXEMPLO)).toBe(
      JSON.stringify(
        gerarEnvelopeDaPessoa({
          semente: SEMENTE_DO_EXEMPLO,
          hoje: HOJE_DO_EXEMPLO,
        }),
      ),
    )
    expect(ENVELOPE_DO_EXEMPLO.pessoa).toBe(PESSOA_DO_EXEMPLO)
    expect(ENVELOPE_DO_EXEMPLO.motor).toBe(MOTOR)
  })

  // A reticência vai no fim da linha anterior: uma linha só de "…," deixava o terminal bem mais alto que o formulário.
  it('o recorte, com reticências onde a CLI imprime chaves que a janela omite', () => {
    const p = PESSOA_DO_EXEMPLO
    const j = (valor: unknown) => JSON.stringify(valor)
    expect(textoDaSaida(SAIDA_DO_TERMINAL)).toBe(
      [
        '{',
        '  "formato": 2,',
        `  "motor": ${j(MOTOR)},`,
        '  "semente": "42",',
        '  "hoje": "2026-10-05",',
        '  "pessoa": {',
        `    "nome": { …, "completo": ${j(p.nome.completo)}, … }, …,`,
        `    "cpf": ${j(p.cpf)}, …,`,
        `    "celular": { …, "formatado": ${j(p.celular.formatado)}, … },`,
        `    "email": { …, "endereco": ${j(p.email.endereco)}, … }, …,`,
        `    "endereco": { "cep": ${j(p.endereco.cep)}, …, "cidade": ${j(p.endereco.cidade)}, "uf": ${j(p.endereco.uf)}, … },`,
        `    "empresa": { …, "cnpj": ${j(p.empresa.cnpj)} }, …`,
        '  }',
        '}',
      ].join('\n'),
    )
  })

  // O que o design mostra, conferido com a CLI local em 2026-10-09.
  it('os valores que aparecem são os da pessoa da semente 42', () => {
    const texto = textoDaSaida(SAIDA_DO_TERMINAL)
    for (const valor of [
      'Márcio Carvalho Rodrigues',
      '634.132.403-07',
      '(98) 97702-9128',
      'marcio-rodrigues-0337@tuamaeaquelaursa.com',
      '65071-377',
      'São Luís',
      '"MA"',
      '90.849.558/0001-39',
    ])
      expect(texto).toContain(valor)
  })

  it('as chaves mostradas seguem a ordem real, nível a nível', () => {
    const emOrdem = (mostradas: string[], reais: string[]) =>
      expect(mostradas).toEqual(
        reais.filter((chave) => mostradas.includes(chave)),
      )
    emOrdem(membrosNoRecuo(1), Object.keys(ENVELOPE_DO_EXEMPLO))
    emOrdem(membrosNoRecuo(2), Object.keys(PESSOA_DO_EXEMPLO))
    expect(membrosNoRecuo(2)).toEqual([
      'nome',
      'cpf',
      'celular',
      'email',
      'endereco',
      'empresa',
    ])
  })
})

describe('abreviar', () => {
  const OBJETO = {
    a: 1,
    b: 'dois',
    c: { x: 1, y: 2, z: 3 },
    d: { m: true, n: null },
    e: 5,
  }

  it('uma reticência por sequência de chaves omitidas, no fim da linha anterior', () => {
    expect(textoDaSaida(abreviar(OBJETO, { a: true, e: true }))).toBe(
      ['{', '  "a": 1, …,', '  "e": 5', '}'].join('\n'),
    )
  })

  it('a reticência que abre um objeto fica numa linha própria', () => {
    expect(textoDaSaida(abreviar(OBJETO, { e: true }))).toBe(
      ['{', '  …,', '  "e": 5', '}'].join('\n'),
    )
  })

  it('lista de chaves vira objeto numa linha; recorte aninhado, um bloco', () => {
    expect(textoDaSaida(abreviar(OBJETO, { c: ['y'], d: { n: true } }))).toBe(
      [
        '{',
        '  …,',
        '  "c": { …, "y": 2, … },',
        '  "d": {',
        '    …,',
        '    "n": null',
        '  }, …',
        '}',
      ].join('\n'),
    )
  })

  it('a reticência entra como sinal na linha anterior, sem mexer nas outras', () => {
    expect(abreviar({ a: 1, b: 2 }, { a: true })).toEqual([
      { recuo: 0, trechos: [{ tipo: 'sinal', texto: '{' }] },
      {
        recuo: 1,
        trechos: [
          { tipo: 'chave', texto: '"a": ' },
          { tipo: 'valor', texto: '1' },
          { tipo: 'sinal', texto: ',' },
          { tipo: 'sinal', texto: ' …' },
        ],
      },
      { recuo: 0, trechos: [{ tipo: 'sinal', texto: '}' }] },
    ])
  })

  it('sem omissão, sem reticências', () => {
    expect(textoDaSaida(abreviar({ x: 'a' }, { x: true }))).toBe(
      '{\n  "x": "a"\n}',
    )
  })

  // Um recorte com chave que não existe esconderia um campo renomeado no core.
  it('chave que o objeto não tem é erro', () => {
    expect(() => abreviar(OBJETO, { inexistente: true })).toThrow('inexistente')
    expect(() => abreviar(OBJETO, { c: ['w'] })).toThrow('w')
  })

  it('separa chave, valor e sinal, com o recuo de cada linha', () => {
    expect(abreviar({ a: 1, b: { c: 'x' } }, { a: true, b: ['c'] })).toEqual([
      { recuo: 0, trechos: [{ tipo: 'sinal', texto: '{' }] },
      {
        recuo: 1,
        trechos: [
          { tipo: 'chave', texto: '"a": ' },
          { tipo: 'valor', texto: '1' },
          { tipo: 'sinal', texto: ',' },
        ],
      },
      {
        recuo: 1,
        trechos: [
          { tipo: 'chave', texto: '"b": ' },
          { tipo: 'sinal', texto: '{ ' },
          { tipo: 'chave', texto: '"c": ' },
          { tipo: 'valor', texto: '"x"' },
          { tipo: 'sinal', texto: ' }' },
        ],
      },
      { recuo: 0, trechos: [{ tipo: 'sinal', texto: '}' }] },
    ])
  })
})
