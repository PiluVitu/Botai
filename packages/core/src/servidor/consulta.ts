import {
  type OpcoesDaPessoa,
  type OpcoesResolvidas,
  resolverOpcoes,
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

const DA_PESSOA = ['semente', 'hoje', 'uf', 'dominioEmail'] as const
const DAS_PESSOAS = [
  ...DA_PESSOA,
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
  const opcoes: OpcoesDaPessoa = {}
  const semente = valores.get('semente')
  const hoje = valores.get('hoje')
  const uf = valores.get('uf')
  const dominioEmail = valores.get('dominioEmail')
  if (semente !== undefined) opcoes.semente = semente
  if (hoje !== undefined) opcoes.hoje = hoje
  if (uf !== undefined) opcoes.uf = lerUF(uf)
  if (dominioEmail !== undefined)
    opcoes.dominioEmail = lerDominioEmail(dominioEmail)
  return resolverOpcoes(opcoes)
}

export function lerConsultaDaPessoa(params: URLSearchParams): OpcoesResolvidas {
  return lerOpcoes(lerValores(params, DA_PESSOA))
}

export function lerConsultaDasPessoas(
  params: URLSearchParams,
): PedidoDePessoas {
  const valores = lerValores(params, DAS_PESSOAS)

  const n = valores.get('n')
  if (n === undefined)
    throw new ErroDeConsulta(`falta o n (de 1 a ${LIMITE_DE_PESSOAS})`)
  if (!/^\d{1,6}$/.test(n) || Number(n) < 1 || Number(n) > LIMITE_DE_PESSOAS)
    throw new ErroDeConsulta(
      `n inválido: ${n} (um inteiro de 1 a ${LIMITE_DE_PESSOAS})`,
    )

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

  const pedido: PedidoDePessoas = {
    n: Number(n),
    opcoes: lerOpcoes(valores),
    formato: formato as Formato,
  }
  const dialeto = valores.get('dialeto')
  const tabela = valores.get('tabela')
  if (dialeto !== undefined) pedido.dialeto = lerDialeto(dialeto)
  if (tabela !== undefined) pedido.tabela = lerTabela(tabela)
  if (campos !== undefined) pedido.colunas = lerCampos(campos)
  return pedido
}
