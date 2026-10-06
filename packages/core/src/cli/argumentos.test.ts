import { type DefinicaoDeOpcoes, ErroDeUso, lerArgumentos } from './argumentos'

const DEFINICAO: DefinicaoDeOpcoes = {
  semente: { tipo: 'texto' },
  n: { tipo: 'texto', curta: 'n' },
  formatado: { tipo: 'booleano' },
  help: { tipo: 'booleano', curta: 'h' },
}

const ler = (...argv: string[]) => lerArgumentos(argv, DEFINICAO)

describe('lerArgumentos', () => {
  test('opção longa com espaço ou com =', () => {
    expect(ler('--semente', 'abc').opcoes).toEqual({ semente: 'abc' })
    expect(ler('--semente=abc').opcoes).toEqual({ semente: 'abc' })
    expect(ler('--semente=a=b').opcoes).toEqual({ semente: 'a=b' })
    expect(ler('--semente=').opcoes).toEqual({ semente: '' })
  })

  test('opção curta separada, colada ou com =', () => {
    expect(ler('-n', '5').opcoes).toEqual({ n: '5' })
    expect(ler('-n5').opcoes).toEqual({ n: '5' })
    expect(ler('-n=5').opcoes).toEqual({ n: '5' })
    expect(ler('--n', '5').opcoes).toEqual({ n: '5' })
  })

  test('valor que começa com traço é valor, não opção', () => {
    expect(ler('--semente', '-5').opcoes).toEqual({ semente: '-5' })
    expect(ler('--semente=-5').opcoes).toEqual({ semente: '-5' })
    expect(ler('-n', '-1').opcoes).toEqual({ n: '-1' })
  })

  test('booleanas', () => {
    expect(ler('--formatado', '-h').opcoes).toEqual({
      formatado: true,
      help: true,
    })
  })

  test('posicionais, "-" sozinho e tudo depois de "--"', () => {
    expect(ler('cpf', '-', '--', '--semente', 'x')).toEqual({
      opcoes: {},
      posicionais: ['cpf', '-', '--semente', 'x'],
    })
  })

  test.each([
    [['--x'], 'opção desconhecida: --x'],
    [['-x'], 'opção desconhecida: -x'],
    [['--constructor'], 'opção desconhecida: --constructor'],
    [['--semente'], '--semente precisa de um valor'],
    [['-n'], '-n precisa de um valor'],
    [['--semente', 'a', '--semente', 'b'], 'opção repetida: --semente'],
    [['-n', '1', '--n', '2'], 'opção repetida: -n'],
    [['--formatado=sim'], '--formatado não recebe valor'],
  ])('%j: %s', (argv, mensagem) => {
    expect(() => lerArgumentos(argv, DEFINICAO)).toThrow(ErroDeUso)
    expect(() => lerArgumentos(argv, DEFINICAO)).toThrow(mensagem)
  })
})
