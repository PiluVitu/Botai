import { envelopar, type EnvelopeDasPessoas, FORMATO } from './envelope'
import {
  type OpcoesResolvidas,
  type PessoaDoLote,
  pessoasDoLote,
} from './gerar'
import {
  cabecalhoCsv,
  type Coluna,
  COLUNAS,
  type Dialeto,
  type Formato,
  insertSql,
  linhaCsv,
} from './plano'
import { MOTOR } from './versao'

export interface FormaDoLote {
  formato: Formato
  dialeto?: Dialeto
  tabela?: string
  colunas?: readonly Coluna[]
}

// pessoasDoLote valida o n já aqui, fora do gerador: o erro sai antes da primeira parte.
export function textoDoLote(
  n: number,
  opcoes: OpcoesResolvidas,
  forma: FormaDoLote,
): Generator<string> {
  return partesDoLote(pessoasDoLote(n, opcoes), opcoes, forma)
}

function* partesDoLote(
  lote: Iterable<PessoaDoLote>,
  opcoes: OpcoesResolvidas,
  {
    formato,
    dialeto = 'postgres',
    tabela = 'pessoas',
    colunas = COLUNAS,
  }: FormaDoLote,
): Generator<string> {
  if (formato === 'json') {
    const envelope: EnvelopeDasPessoas = {
      formato: FORMATO,
      motor: MOTOR,
      semente: opcoes.semente,
      hoje: opcoes.hoje,
      pessoas: Array.from(lote, (p) => p.pessoa),
    }
    yield `${JSON.stringify(envelope, null, 2)}\n`
    return
  }
  if (formato === 'csv') yield cabecalhoCsv(colunas)
  if (formato === 'sql')
    yield `-- botai: formato ${FORMATO}, motor ${MOTOR}, semente ${opcoes.semente}, hoje ${opcoes.hoje}\n`
  for (const { semente, pessoa } of lote) {
    if (formato === 'ndjson')
      yield `${JSON.stringify(envelopar(semente, opcoes.hoje, pessoa))}\n`
    else if (formato === 'csv') yield linhaCsv(pessoa, colunas)
    else yield insertSql(pessoa, { dialeto, tabela, colunas })
  }
}
