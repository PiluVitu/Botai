import type { Pessoa } from './pessoa'

export const COLUNAS = [
  'nome',
  'prenome',
  'sobrenomes',
  'sexo',
  'nascimento',
  'idade',
  'cpf',
  'rg',
  'rg_orgao_emissor',
  'rg_uf',
  'pis',
  'titulo_eleitor',
  'email',
  'email_usuario',
  'email_caixa_url',
  'senha',
  'celular',
  'celular_e164',
  'cep',
  'logradouro',
  'numero',
  'complemento',
  'bairro',
  'cidade',
  'uf',
  'empresa_razao_social',
  'empresa_nome_fantasia',
  'empresa_cnpj',
  'cartao_bandeira',
  'cartao_numero',
  'cartao_titular',
  'cartao_validade',
  'cartao_cvv',
  'cartao_provedor',
  'cartao_cenario',
] as const

export type Coluna = (typeof COLUNAS)[number]
export type ValorPlano = string | number | null
export type PessoaPlana = Record<Coluna, ValorPlano>

const VALOR_DA_COLUNA: Record<Coluna, (p: Pessoa) => ValorPlano> = {
  nome: (p) => p.nome.completo,
  prenome: (p) => p.nome.prenome,
  sobrenomes: (p) => p.nome.sobrenomes.join(' '),
  sexo: (p) => p.nome.sexo,
  nascimento: (p) => p.nascimento.iso,
  idade: (p) => p.nascimento.idade,
  cpf: (p) => p.cpf,
  rg: (p) => p.rg.numero,
  rg_orgao_emissor: (p) => p.rg.orgaoEmissor,
  rg_uf: (p) => p.rg.uf,
  pis: (p) => p.pis,
  titulo_eleitor: (p) => p.tituloEleitor,
  email: (p) => p.email.endereco,
  email_usuario: (p) => p.email.usuario,
  email_caixa_url: (p) => p.email.caixaUrl,
  senha: (p) => p.senha,
  celular: (p) => p.celular.formatado,
  celular_e164: (p) => p.celular.e164,
  cep: (p) => p.endereco.cep,
  logradouro: (p) => p.endereco.logradouro,
  numero: (p) => p.endereco.numero,
  complemento: (p) => p.endereco.complemento,
  bairro: (p) => p.endereco.bairro,
  cidade: (p) => p.endereco.cidade,
  uf: (p) => p.endereco.uf,
  empresa_razao_social: (p) => p.empresa.razaoSocial,
  empresa_nome_fantasia: (p) => p.empresa.nomeFantasia,
  empresa_cnpj: (p) => p.empresa.cnpj,
  cartao_bandeira: (p) => p.cartao.bandeira,
  cartao_numero: (p) => p.cartao.numero,
  cartao_titular: (p) => p.cartao.titular,
  cartao_validade: (p) => p.cartao.validade,
  cartao_cvv: (p) => p.cartao.cvv,
  cartao_provedor: (p) => p.cartao.provedor,
  cartao_cenario: (p) => p.cartao.cenario,
}

export class ErroDoPlano extends Error {
  constructor(mensagem: string) {
    super(mensagem)
    this.name = 'ErroDoPlano'
  }
}

export function pessoaPlana(pessoa: Pessoa): PessoaPlana {
  return Object.fromEntries(
    COLUNAS.map((c) => [c, VALOR_DA_COLUNA[c](pessoa)]),
  ) as PessoaPlana
}

export function lerCampos(texto: string): Coluna[] {
  const nomes = texto.split(',').map((c) => c.trim())
  if (nomes.some((c) => c === ''))
    throw new ErroDoPlano('campos: lista vazia ou com vírgula sobrando')
  const repetida = nomes.find((c, i) => nomes.indexOf(c) !== i)
  if (repetida) throw new ErroDoPlano(`campos: coluna repetida "${repetida}"`)
  const desconhecida = nomes.find(
    (c) => !(COLUNAS as readonly string[]).includes(c),
  )
  if (desconhecida)
    throw new ErroDoPlano(
      `campos: coluna desconhecida "${desconhecida}" (colunas: ${COLUNAS.join(', ')})`,
    )
  return nomes as Coluna[]
}

function campoCsv(valor: ValorPlano): string {
  if (valor === null) return ''
  if (typeof valor === 'number') return String(valor)
  if (valor === '' || /[",\r\n]/.test(valor))
    return `"${valor.replace(/"/g, '""')}"`
  return valor
}

export function cabecalhoCsv(colunas: readonly Coluna[] = COLUNAS): string {
  return `${colunas.join(',')}\r\n`
}

export function linhaCsv(
  pessoa: Pessoa,
  colunas: readonly Coluna[] = COLUNAS,
): string {
  const campos = colunas.map((c) => campoCsv(VALOR_DA_COLUNA[c](pessoa)))
  return `${campos.join(',')}\r\n`
}

export function paraCsv(
  pessoas: readonly Pessoa[],
  colunas: readonly Coluna[] = COLUNAS,
): string {
  return (
    cabecalhoCsv(colunas) + pessoas.map((p) => linhaCsv(p, colunas)).join('')
  )
}

export const FORMATOS = ['json', 'ndjson', 'csv', 'sql'] as const
export type Formato = (typeof FORMATOS)[number]

export const DIALETOS = ['postgres', 'mysql', 'sqlite'] as const
export type Dialeto = (typeof DIALETOS)[number]

export interface OpcoesDoSql {
  dialeto?: Dialeto
  tabela?: string
  colunas?: readonly Coluna[]
}

const PARTE_DO_NOME_SQL = /^[A-Za-z_][A-Za-z0-9_]{0,62}$/

export function lerDialeto(texto: string): Dialeto {
  if (!(DIALETOS as readonly string[]).includes(texto))
    throw new ErroDoPlano(
      `dialeto desconhecido "${texto}" (use ${DIALETOS.join(', ')})`,
    )
  return texto as Dialeto
}

export function lerTabela(texto: string): string {
  const partes = texto.split('.')
  if (partes.length > 2 || !partes.every((p) => PARTE_DO_NOME_SQL.test(p)))
    throw new ErroDoPlano(
      `tabela inválida "${texto}" (letras, dígitos e _, até 63 caracteres; opcionalmente esquema.tabela)`,
    )
  return texto
}

function identificador(nome: string, dialeto: Dialeto): string {
  return dialeto === 'mysql' ? `\`${nome}\`` : `"${nome}"`
}

function literalSql(valor: ValorPlano, dialeto: Dialeto): string {
  if (valor === null) return 'NULL'
  if (typeof valor === 'number') return String(valor)
  const escapado = dialeto === 'mysql' ? valor.replace(/\\/g, '\\\\') : valor
  return `'${escapado.replace(/'/g, "''")}'`
}

export function insertSql(pessoa: Pessoa, opcoes: OpcoesDoSql = {}): string {
  const dialeto = opcoes.dialeto ?? 'postgres'
  const colunas = opcoes.colunas ?? COLUNAS
  const tabela = lerTabela(opcoes.tabela ?? 'pessoas')
    .split('.')
    .map((p) => identificador(p, dialeto))
    .join('.')
  const nomes = colunas.map((c) => identificador(c, dialeto)).join(', ')
  const valores = colunas
    .map((c) => literalSql(VALOR_DA_COLUNA[c](pessoa), dialeto))
    .join(', ')
  return `INSERT INTO ${tabela} (${nomes}) VALUES (${valores});\n`
}

export function paraSql(
  pessoas: readonly Pessoa[],
  opcoes: OpcoesDoSql = {},
): string {
  return pessoas.map((p) => insertSql(p, opcoes)).join('')
}
