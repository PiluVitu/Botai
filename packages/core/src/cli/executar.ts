import { somenteDigitos } from '../aleatorio'
import { envelopar, envelopeDoLote, FORMATO } from '../envelope'
import {
  type OpcoesDaPessoa,
  type OpcoesResolvidas,
  pessoaResolvida,
  pessoasDoLote,
  resolverOpcoes,
} from '../gerar'
import {
  ErroDeOpcao,
  lerDominioEmail,
  lerUF,
  type NomeDaOpcao,
} from '../opcoes'
import {
  cabecalhoCsv,
  COLUNAS,
  ErroDoPlano,
  type Formato,
  FORMATOS,
  insertSql,
  lerCampos,
  lerDialeto,
  lerTabela,
  linhaCsv,
} from '../plano'
import { rngDeSemente, sementeAleatoria } from '../semente'
import { MOTOR } from '../versao'
import {
  AJUDA_AVULSO,
  AJUDA_GERAL,
  AJUDA_PESSOA,
  AJUDA_PESSOAS,
  AJUDA_VALIDAR,
} from './ajuda'
import {
  type ArgumentosLidos,
  type DefinicaoDeOpcoes,
  ErroDeUso,
  lerArgumentos,
} from './argumentos'
import { AVULSOS, VALIDADORES } from './avulsos'

export interface Saida {
  dados(texto: string): void
  mensagem(texto: string): void
}

export const SAIDA = { ok: 0, invalido: 1, uso: 2, interno: 3 } as const

const FLAG_DA_OPCAO: Record<NomeDaOpcao, string> = {
  semente: '--semente',
  hoje: '--hoje',
  uf: '--uf',
  dominioEmail: '--dominio-email',
  n: '-n',
}

const AJUDA = { tipo: 'booleano', curta: 'h' } as const

const OPCOES_DA_PESSOA = {
  semente: { tipo: 'texto' },
  hoje: { tipo: 'texto' },
  uf: { tipo: 'texto' },
  'dominio-email': { tipo: 'texto' },
  help: AJUDA,
} as const satisfies DefinicaoDeOpcoes

const OPCOES_DAS_PESSOAS = {
  ...OPCOES_DA_PESSOA,
  n: { tipo: 'texto', curta: 'n' },
  formato: { tipo: 'texto' },
  dialeto: { tipo: 'texto' },
  tabela: { tipo: 'texto' },
  campos: { tipo: 'texto' },
} as const satisfies DefinicaoDeOpcoes

const OPCOES_DO_AVULSO = {
  formatado: { tipo: 'booleano' },
  uf: { tipo: 'texto' },
  semente: { tipo: 'texto' },
  help: AJUDA,
} as const satisfies DefinicaoDeOpcoes

function texto(lidos: ArgumentosLidos, nome: string): string | undefined {
  const valor = lidos.opcoes[nome]
  return typeof valor === 'string' ? valor : undefined
}

function semPosicionais(lidos: ArgumentosLidos): void {
  if (lidos.posicionais.length > 0)
    throw new ErroDeUso(`argumento inesperado: ${lidos.posicionais[0]}`)
}

function opcoesDaPessoa(lidos: ArgumentosLidos): OpcoesResolvidas {
  const opcoes: OpcoesDaPessoa = {}
  const semente = texto(lidos, 'semente')
  const hoje = texto(lidos, 'hoje')
  const uf = texto(lidos, 'uf')
  const dominioEmail = texto(lidos, 'dominio-email')
  if (semente !== undefined) opcoes.semente = semente
  if (hoje !== undefined) opcoes.hoje = hoje
  if (uf !== undefined) opcoes.uf = lerUF(uf)
  if (dominioEmail !== undefined)
    opcoes.dominioEmail = lerDominioEmail(dominioEmail)
  return resolverOpcoes(opcoes)
}

const json = (valor: unknown) => `${JSON.stringify(valor, null, 2)}\n`

function comandoPessoa(argv: readonly string[], saida: Saida): number {
  const lidos = lerArgumentos(argv, OPCOES_DA_PESSOA)
  if (lidos.opcoes.help) {
    saida.dados(AJUDA_PESSOA)
    return SAIDA.ok
  }
  semPosicionais(lidos)
  const r = opcoesDaPessoa(lidos)
  saida.dados(json(envelopar(r.semente, r.hoje, pessoaResolvida(r))))
  return SAIDA.ok
}

function lerN(valor: string | undefined): number {
  if (valor === undefined) throw new ErroDeUso('-n é obrigatório')
  if (!/^\d+$/.test(valor))
    throw new ErroDeUso(`-n precisa ser um inteiro, recebido "${valor}"`)
  return Number(valor)
}

function lerFormato(valor: string | undefined): Formato {
  const formato = valor ?? 'json'
  if (!(FORMATOS as readonly string[]).includes(formato))
    throw new ErroDeUso(
      `--formato desconhecido "${formato}" (use ${FORMATOS.join(', ')})`,
    )
  return formato as Formato
}

function comandoPessoas(argv: readonly string[], saida: Saida): number {
  const lidos = lerArgumentos(argv, OPCOES_DAS_PESSOAS)
  if (lidos.opcoes.help) {
    saida.dados(AJUDA_PESSOAS)
    return SAIDA.ok
  }
  semPosicionais(lidos)
  const n = lerN(texto(lidos, 'n'))
  const formato = lerFormato(texto(lidos, 'formato'))
  const ehSql = formato === 'sql'
  for (const nome of ['dialeto', 'tabela'])
    if (texto(lidos, nome) !== undefined && !ehSql)
      throw new ErroDeUso(`--${nome} só vale com --formato sql`)
  const campos = texto(lidos, 'campos')
  if (campos !== undefined && formato !== 'csv' && !ehSql)
    throw new ErroDeUso('--campos só vale com --formato csv ou sql')
  const colunas = campos === undefined ? COLUNAS : lerCampos(campos)
  const dialeto = lerDialeto(texto(lidos, 'dialeto') ?? 'postgres')
  const tabela = lerTabela(texto(lidos, 'tabela') ?? 'pessoas')
  const r = opcoesDaPessoa(lidos)

  if (formato === 'json') {
    saida.dados(json(envelopeDoLote(n, r)))
    return SAIDA.ok
  }
  const lote = pessoasDoLote(n, r)
  if (formato === 'csv') {
    if (texto(lidos, 'semente') === undefined)
      saida.mensagem(`botai: semente ${r.semente}, hoje ${r.hoje}\n`)
    saida.dados(cabecalhoCsv(colunas))
  }
  if (ehSql)
    saida.dados(
      `-- botai: formato ${FORMATO}, motor ${MOTOR}, semente ${r.semente}, hoje ${r.hoje}\n`,
    )
  for (const { semente, pessoa } of lote) {
    if (formato === 'ndjson')
      saida.dados(`${JSON.stringify(envelopar(semente, r.hoje, pessoa))}\n`)
    else if (formato === 'csv') saida.dados(linhaCsv(pessoa, colunas))
    else saida.dados(insertSql(pessoa, { dialeto, tabela, colunas }))
  }
  return SAIDA.ok
}

function comandoAvulso(
  nome: string,
  argv: readonly string[],
  saida: Saida,
): number {
  const lidos = lerArgumentos(argv, OPCOES_DO_AVULSO)
  if (lidos.opcoes.help) {
    saida.dados(AJUDA_AVULSO)
    return SAIDA.ok
  }
  semPosicionais(lidos)
  const avulso = AVULSOS[nome]
  const uf = texto(lidos, 'uf')
  if (uf !== undefined && !avulso.aceitaUf)
    throw new ErroDeUso(`--uf não vale para ${nome}`)
  const rng = rngDeSemente(texto(lidos, 'semente') ?? sementeAleatoria())
  const valor = avulso.gerar(rng, uf === undefined ? undefined : lerUF(uf))
  saida.dados(`${lidos.opcoes.formatado ? valor : somenteDigitos(valor)}\n`)
  return SAIDA.ok
}

function comandoValidar(argv: readonly string[], saida: Saida): number {
  const lidos = lerArgumentos(argv, { help: AJUDA })
  if (lidos.opcoes.help) {
    saida.dados(AJUDA_VALIDAR)
    return SAIDA.ok
  }
  const [tipo, valor, ...sobra] = lidos.posicionais
  if (tipo === undefined || valor === undefined || sobra.length > 0)
    throw new ErroDeUso('uso: botai validar <tipo> <valor>')
  if (!Object.prototype.hasOwnProperty.call(VALIDADORES, tipo))
    throw new ErroDeUso(
      `tipo desconhecido "${tipo}" (use ${Object.keys(VALIDADORES).join(', ')})`,
    )
  const valido = VALIDADORES[tipo](valor)
  saida.dados(valido ? 'válido\n' : 'inválido\n')
  return valido ? SAIDA.ok : SAIDA.invalido
}

function despachar(argv: readonly string[], saida: Saida): number {
  const [comando, ...resto] = argv
  if (comando === undefined) {
    saida.mensagem(AJUDA_GERAL)
    return SAIDA.uso
  }
  if (comando === '--help' || comando === '-h' || comando === 'ajuda') {
    saida.dados(AJUDA_GERAL)
    return SAIDA.ok
  }
  if (comando === '--versao' || comando === '--version') {
    saida.dados(`${MOTOR}\n`)
    return SAIDA.ok
  }
  if (comando === 'pessoa') return comandoPessoa(resto, saida)
  if (comando === 'pessoas') return comandoPessoas(resto, saida)
  if (comando === 'validar') return comandoValidar(resto, saida)
  if (Object.prototype.hasOwnProperty.call(AVULSOS, comando))
    return comandoAvulso(comando, resto, saida)
  throw new ErroDeUso(`comando desconhecido "${comando}" (veja botai --help)`)
}

export function executar(argv: readonly string[], saida: Saida): number {
  try {
    return despachar(argv, saida)
  } catch (erro) {
    if (erro instanceof ErroDeUso || erro instanceof ErroDoPlano) {
      saida.mensagem(`botai: ${erro.message}\n`)
      return SAIDA.uso
    }
    if (erro instanceof ErroDeOpcao) {
      saida.mensagem(`botai: ${FLAG_DA_OPCAO[erro.opcao]}: ${erro.message}\n`)
      return SAIDA.uso
    }
    const mensagem = erro instanceof Error ? erro.message : String(erro)
    saida.mensagem(`botai: erro interno: ${mensagem}\n`)
    return SAIDA.interno
  }
}
