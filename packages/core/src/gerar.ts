import { hojeEmSaoPaulo } from './hoje'
import { lerHoje, lerQuantidade } from './opcoes'
import { type OpcoesDaMontagem, type Pessoa, montarPessoa } from './pessoa'
import {
  type Semente,
  rngDeSemente,
  sementeAleatoria,
  textoDaSemente,
} from './semente'

export interface OpcoesDaPessoa extends OpcoesDaMontagem {
  semente?: Semente
  hoje?: string
}

export interface OpcoesResolvidas extends OpcoesDaMontagem {
  semente: string
  hoje: string
}

export interface PessoaDoLote {
  semente: string
  pessoa: Pessoa
}

export type Montador = (semente: string, opcoes: OpcoesResolvidas) => Pessoa

export const TENTATIVAS_POR_PESSOA = 1000

export function resolverOpcoes(opcoes: OpcoesDaPessoa = {}): OpcoesResolvidas {
  const { semente, hoje, ...montagem } = opcoes
  return {
    ...montagem,
    semente:
      semente === undefined ? sementeAleatoria() : textoDaSemente(semente),
    hoje: hoje === undefined ? hojeEmSaoPaulo() : lerHoje(hoje),
  }
}

const montarDaSemente: Montador = (semente, opcoes) =>
  montarPessoa(rngDeSemente(semente), opcoes.hoje, {
    uf: opcoes.uf,
    dominioEmail: opcoes.dominioEmail,
  })

export function pessoaResolvida(opcoes: OpcoesResolvidas): Pessoa {
  return montarDaSemente(opcoes.semente, opcoes)
}

export function gerarPessoa(opcoes: OpcoesDaPessoa = {}): Pessoa {
  return pessoaResolvida(resolverOpcoes(opcoes))
}

export function* loteCom(
  quantidade: number,
  opcoes: OpcoesResolvidas,
  montar: Montador,
): Generator<PessoaDoLote> {
  const emails = new Set<string>()
  const cpfs = new Set<string>()
  const cnpjs = new Set<string>()
  for (let i = 0; i < quantidade; i++) {
    let escolhida: PessoaDoLote | undefined
    for (let k = 1; k <= TENTATIVAS_POR_PESSOA && !escolhida; k++) {
      const semente =
        k === 1 ? `${opcoes.semente}/${i}` : `${opcoes.semente}/${i}/${k}`
      const pessoa = montar(semente, opcoes)
      const repete =
        emails.has(pessoa.email.endereco) ||
        cpfs.has(pessoa.cpf) ||
        cnpjs.has(pessoa.empresa.cnpj)
      if (!repete) escolhida = { semente, pessoa }
    }
    if (!escolhida)
      throw new Error(
        `gerarPessoas: nenhuma pessoa sem repetição na posição ${i} em ${TENTATIVAS_POR_PESSOA} tentativas`,
      )
    emails.add(escolhida.pessoa.email.endereco)
    cpfs.add(escolhida.pessoa.cpf)
    cnpjs.add(escolhida.pessoa.empresa.cnpj)
    yield escolhida
  }
}

export function pessoasDoLote(
  n: number,
  opcoes: OpcoesResolvidas,
): Generator<PessoaDoLote> {
  return loteCom(lerQuantidade(n), opcoes, montarDaSemente)
}

export function gerarPessoas(n: number, opcoes: OpcoesDaPessoa = {}): Pessoa[] {
  return Array.from(pessoasDoLote(n, resolverOpcoes(opcoes)), (p) => p.pessoa)
}
