import { lerTextosDoCartao } from '../cartao'
import {
  type OpcoesDoLote,
  type OpcoesResolvidas,
  resolverOpcoes,
  somaDosCenarios,
} from '../gerar'
import { ErroDeOpcao, lerDominioEmail, lerUF } from '../opcoes'
import {
  type Coluna,
  type Dialeto,
  ErroDoPlano,
  type Formato,
  FORMATOS,
  lerCampos,
  lerDialeto,
  lerTabela,
} from '../plano'

export const LIMITE_DE_PESSOAS = 10_000

export class ErroDeConsulta extends Error {
  constructor(mensagem: string) {
    super(mensagem)
    this.name = 'ErroDeConsulta'
  }
}

export interface PedidoDePessoas {
  n: number
  opcoes: OpcoesResolvidas
  formato: Formato
  dialeto?: Dialeto
  tabela?: string
  colunas?: Coluna[]
}

const COMUNS = ['semente', 'hoje', 'uf', 'dominioEmail', 'cartao'] as const
const DA_PESSOA = [...COMUNS, 'cenario'] as const
const DAS_PESSOAS = [
  ...COMUNS,
  'cenarios',
  'n',
  'formato',
  'dialeto',
  'tabela',
  'campos',
] as const

export function mensagemDeUso(erro: unknown): string | undefined {
  if (erro instanceof ErroDeConsulta || erro instanceof ErroDoPlano)
    return erro.message
  if (erro instanceof ErroDeOpcao) return `${erro.opcao}: ${erro.message}`
  return undefined
}

function lerValores(
  params: URLSearchParams,
  aceitos: readonly string[],
): Map<string, string> {
  const valores = new Map<string, string>()
  for (const [nome, valor] of params) {
    if (!aceitos.includes(nome))
      throw new ErroDeConsulta(
        `parâmetro desconhecido: ${nome} (aceitos: ${aceitos.join(', ')})`,
      )
    if (valores.has(nome))
      throw new ErroDeConsulta(`parâmetro repetido: ${nome}`)
    if (valor === '') throw new ErroDeConsulta(`parâmetro vazio: ${nome}`)
    valores.set(nome, valor)
  }
  return valores
}

function lerOpcoes(valores: Map<string, string>): OpcoesResolvidas {
  const opcoes: OpcoesDoLote = {}
  const semente = valores.get('semente')
  const hoje = valores.get('hoje')
  const uf = valores.get('uf')
  const dominioEmail = valores.get('dominioEmail')
  if (semente !== undefined) opcoes.semente = semente
  if (hoje !== undefined) opcoes.hoje = hoje
  if (uf !== undefined) opcoes.uf = lerUF(uf)
  if (dominioEmail !== undefined)
    opcoes.dominioEmail = lerDominioEmail(dominioEmail)
  const cartao = lerTextosDoCartao({
    cartao: valores.get('cartao'),
    cenario: valores.get('cenario'),
    cenarios: valores.get('cenarios'),
  })
  if (cartao !== undefined) opcoes.cartao = cartao
  return resolverOpcoes(opcoes)
}

function lerN(n: string | undefined, opcoes: OpcoesResolvidas): number {
  if (n === undefined) {
    if (opcoes.cartao?.cenarios === undefined)
      throw new ErroDeConsulta(
        `falta o n (de 1 a ${LIMITE_DE_PESSOAS}) ou os cenarios`,
      )
    const soma = somaDosCenarios(opcoes.cartao)
    if (soma > LIMITE_DE_PESSOAS)
      throw new ErroDeConsulta(
        `cenarios: a soma dos cenários (${soma}) passa do limite de ${LIMITE_DE_PESSOAS} pessoas`,
      )
    return soma
  }
  if (!/^\d{1,6}$/.test(n) || Number(n) < 1 || Number(n) > LIMITE_DE_PESSOAS)
    throw new ErroDeConsulta(
      `n inválido: ${n} (um inteiro de 1 a ${LIMITE_DE_PESSOAS})`,
    )
  return Number(n)
}

export function lerConsultaDaPessoa(params: URLSearchParams): OpcoesResolvidas {
  return lerOpcoes(lerValores(params, DA_PESSOA))
}

export function lerConsultaDasPessoas(
  params: URLSearchParams,
): PedidoDePessoas {
  const valores = lerValores(params, DAS_PESSOAS)
  const opcoes = lerOpcoes(valores)
  const n = lerN(valores.get('n'), opcoes)

  const formato = valores.get('formato') ?? 'json'
  if (!(FORMATOS as readonly string[]).includes(formato))
    throw new ErroDeConsulta(
      `formato inválido: ${formato} (use ${FORMATOS.join(', ')})`,
    )
  const ehSql = formato === 'sql'
  for (const nome of ['dialeto', 'tabela'])
    if (valores.has(nome) && !ehSql)
      throw new ErroDeConsulta(`${nome} só vale com formato=sql`)
  const campos = valores.get('campos')
  if (campos !== undefined && formato !== 'csv' && !ehSql)
    throw new ErroDeConsulta('campos só vale com formato=csv ou formato=sql')

  const pedido: PedidoDePessoas = { n, opcoes, formato: formato as Formato }
  const dialeto = valores.get('dialeto')
  const tabela = valores.get('tabela')
  if (dialeto !== undefined) pedido.dialeto = lerDialeto(dialeto)
  if (tabela !== undefined) pedido.tabela = lerTabela(tabela)
  if (campos !== undefined) pedido.colunas = lerCampos(campos)
  return pedido
}
