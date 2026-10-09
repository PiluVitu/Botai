import {
  type Cenario,
  type DistribuicaoDeCenarios,
  lerCartao,
  lerDistribuicao,
  type OpcoesDoCartao,
} from './cartao'
import { hojeEmSaoPaulo } from './hoje'
import { ErroDeOpcao, lerHoje, lerQuantidade } from './opcoes'
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

export interface OpcoesDoCartaoDoLote extends OpcoesDoCartao {
  cenarios?: DistribuicaoDeCenarios
}

export interface OpcoesDoLote extends Omit<OpcoesDaPessoa, 'cartao'> {
  cartao?: OpcoesDoCartaoDoLote
}

export interface OpcoesResolvidas extends Omit<
  OpcoesDoLote,
  'semente' | 'hoje'
> {
  semente: string
  hoje: string
}

export interface PessoaDoLote {
  semente: string
  pessoa: Pessoa
}

export type Montador = (
  semente: string,
  opcoes: OpcoesResolvidas,
  posicao: number,
) => Pessoa

export const TENTATIVAS_POR_PESSOA = 1000

export function resolverOpcoes(opcoes: OpcoesDoLote = {}): OpcoesResolvidas {
  const { semente, hoje, ...montagem } = opcoes
  return {
    ...montagem,
    semente:
      semente === undefined ? sementeAleatoria() : textoDaSemente(semente),
    hoje: hoje === undefined ? hojeEmSaoPaulo() : lerHoje(hoje),
  }
}

function montarDaSemente(
  semente: string,
  opcoes: OpcoesResolvidas,
  cartao: OpcoesDoCartao | undefined = opcoes.cartao,
): Pessoa {
  return montarPessoa(rngDeSemente(semente), opcoes.hoje, {
    uf: opcoes.uf,
    dominioEmail: opcoes.dominioEmail,
    cartao: cartao && { provedor: cartao.provedor, cenario: cartao.cenario },
  })
}

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
      const pessoa = montar(semente, opcoes, i)
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

export function somaDosCenarios(cartao: OpcoesDoCartaoDoLote): number {
  const { provedor } = lerCartao({ provedor: cartao.provedor })
  return lerDistribuicao(provedor, cartao.cenarios ?? {}).reduce(
    (soma, g) => soma + g.quantidade,
    0,
  )
}

function cenarioDaPosicao(
  quantidade: number,
  cartao: OpcoesDoCartaoDoLote = {},
): (posicao: number) => Cenario {
  const { provedor, cenario } = lerCartao(cartao)
  if (cartao.cenarios === undefined) return () => cenario
  if (cartao.cenario !== undefined)
    throw new ErroDeOpcao('cenarios', 'use cenario ou cenarios, não os dois')
  const grupos = lerDistribuicao(provedor, cartao.cenarios)
  const fins: number[] = []
  for (const { quantidade: q } of grupos) fins.push((fins.at(-1) ?? 0) + q)
  const soma = fins.at(-1)!
  if (soma !== quantidade)
    throw new ErroDeOpcao(
      'n',
      `n (${quantidade}) diferente da soma dos cenários (${soma})`,
    )
  return (posicao) => grupos[fins.findIndex((fim) => posicao < fim)].cenario
}

export function pessoasDoLote(
  n: number,
  opcoes: OpcoesResolvidas,
): Generator<PessoaDoLote> {
  const quantidade = lerQuantidade(n)
  const cenarioNa = cenarioDaPosicao(quantidade, opcoes.cartao)
  const provedor = opcoes.cartao?.provedor
  return loteCom(quantidade, opcoes, (semente, r, posicao) =>
    montarDaSemente(semente, r, { provedor, cenario: cenarioNa(posicao) }),
  )
}

export function gerarPessoas(n: number, opcoes: OpcoesDoLote = {}): Pessoa[] {
  return Array.from(pessoasDoLote(n, resolverOpcoes(opcoes)), (p) => p.pessoa)
}
