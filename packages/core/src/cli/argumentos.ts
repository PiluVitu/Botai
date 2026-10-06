export interface DefinicaoDeOpcao {
  tipo: 'texto' | 'booleano'
  curta?: string
}

export type DefinicaoDeOpcoes = Readonly<Record<string, DefinicaoDeOpcao>>

export interface ArgumentosLidos {
  opcoes: Record<string, string | true>
  posicionais: string[]
}

export class ErroDeUso extends Error {
  constructor(mensagem: string) {
    super(mensagem)
    this.name = 'ErroDeUso'
  }
}

function tem(objeto: object, chave: string): boolean {
  return Object.prototype.hasOwnProperty.call(objeto, chave)
}

function nomeDaCurta(curta: string, definicao: DefinicaoDeOpcoes): string {
  const nome = Object.keys(definicao).find((n) => definicao[n].curta === curta)
  if (nome === undefined) throw new ErroDeUso(`opção desconhecida: -${curta}`)
  return nome
}

function separar(
  atual: string,
  definicao: DefinicaoDeOpcoes,
): { nome: string; valor: string | undefined } {
  if (atual.startsWith('--')) {
    const igual = atual.indexOf('=')
    const nome = igual === -1 ? atual.slice(2) : atual.slice(2, igual)
    if (!tem(definicao, nome))
      throw new ErroDeUso(`opção desconhecida: --${nome}`)
    return { nome, valor: igual === -1 ? undefined : atual.slice(igual + 1) }
  }
  const nome = nomeDaCurta(atual[1], definicao)
  const resto = atual.slice(2).replace(/^=/, '')
  return { nome, valor: resto === '' ? undefined : resto }
}

export function lerArgumentos(
  argv: readonly string[],
  definicao: DefinicaoDeOpcoes,
): ArgumentosLidos {
  const opcoes: Record<string, string | true> = {}
  const posicionais: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const atual = argv[i]
    if (atual === '--') {
      posicionais.push(...argv.slice(i + 1))
      break
    }
    if (!atual.startsWith('-') || atual === '-') {
      posicionais.push(atual)
      continue
    }
    const { nome, valor } = separar(atual, definicao)
    const { tipo, curta } = definicao[nome]
    const rotulo = curta === undefined ? `--${nome}` : `-${curta}`
    if (tem(opcoes, nome)) throw new ErroDeUso(`opção repetida: ${rotulo}`)
    if (tipo === 'booleano') {
      if (valor !== undefined) throw new ErroDeUso(`${rotulo} não recebe valor`)
      opcoes[nome] = true
    } else if (valor !== undefined) opcoes[nome] = valor
    else if (i + 1 < argv.length) opcoes[nome] = argv[++i]
    else throw new ErroDeUso(`${rotulo} precisa de um valor`)
  }
  return { opcoes, posicionais }
}
