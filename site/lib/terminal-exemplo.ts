import { type EnvelopeDaPessoa, FORMATO, MOTOR } from '@pilutech/botai-core'
import {
  HOJE_DO_EXEMPLO,
  PESSOA_DO_EXEMPLO,
  SEMENTE_DO_EXEMPLO,
} from './exemplo'

export type Trecho = { tipo: 'chave' | 'valor' | 'sinal'; texto: string }
export type LinhaDaSaida = { recuo: number; trechos: Trecho[] }

export type Recorte = {
  readonly [chave: string]: true | readonly string[] | Recorte
}

type Objeto = Record<string, unknown>

const RETICENCIAS = '…'

export const ENVELOPE_DO_EXEMPLO: EnvelopeDaPessoa = {
  formato: FORMATO,
  motor: MOTOR,
  semente: String(SEMENTE_DO_EXEMPLO),
  hoje: HOJE_DO_EXEMPLO,
  pessoa: PESSOA_DO_EXEMPLO,
}

const RECORTE_DO_TERMINAL: Recorte = {
  formato: true,
  motor: true,
  semente: true,
  hoje: true,
  pessoa: {
    nome: ['completo'],
    nascimento: ['br'],
    cpf: true,
    celular: ['formatado'],
    email: ['endereco'],
    endereco: ['cep', 'cidade', 'uf'],
    empresa: ['cnpj'],
  },
}

const sinal = (texto: string): Trecho => ({ tipo: 'sinal', texto })
const chave = (nome: string): Trecho => ({
  tipo: 'chave',
  texto: `${JSON.stringify(nome)}: `,
})
const valor = (dado: unknown): Trecho => ({
  tipo: 'valor',
  texto: JSON.stringify(dado),
})

function membros(objeto: Objeto, escolhidas: readonly string[]): string[] {
  const faltando = escolhidas.filter((nome) => !(nome in objeto))
  if (faltando.length > 0)
    throw new Error(`o objeto não tem: ${faltando.join(', ')}`)
  const lista: string[] = []
  for (const nome of Object.keys(objeto))
    if (escolhidas.includes(nome)) lista.push(nome)
    else if (lista.at(-1) !== RETICENCIAS) lista.push(RETICENCIAS)
  return lista
}

function emUmaLinha(objeto: Objeto, escolhidas: readonly string[]): Trecho[] {
  const trechos = [sinal('{ ')]
  membros(objeto, escolhidas).forEach((nome, indice) => {
    if (indice > 0) trechos.push(sinal(', '))
    if (nome === RETICENCIAS) trechos.push(sinal(RETICENCIAS))
    else trechos.push(chave(nome), valor(objeto[nome]))
  })
  trechos.push(sinal(' }'))
  return trechos
}

function corpo(objeto: Objeto, recorte: Recorte, recuo: number) {
  const lista = membros(objeto, Object.keys(recorte))
  return lista.flatMap((nome, indice): LinhaDaSaida[] => {
    const virgula = indice < lista.length - 1 ? ',' : ''
    if (nome === RETICENCIAS)
      return [{ recuo, trechos: [sinal(RETICENCIAS + virgula)] }]
    const regra = recorte[nome]
    const dado = objeto[nome]
    const fim = virgula ? [sinal(virgula)] : []
    if (regra === true)
      return [{ recuo, trechos: [chave(nome), valor(dado), ...fim] }]
    if (Array.isArray(regra))
      return [
        {
          recuo,
          trechos: [chave(nome), ...emUmaLinha(dado as Objeto, regra), ...fim],
        },
      ]
    return [
      { recuo, trechos: [chave(nome), sinal('{')] },
      ...corpo(dado as Objeto, regra as Recorte, recuo + 1),
      { recuo, trechos: [sinal(`}${virgula}`)] },
    ]
  })
}

export function abreviar(objeto: object, recorte: Recorte): LinhaDaSaida[] {
  return [
    { recuo: 0, trechos: [sinal('{')] },
    ...corpo(objeto as Objeto, recorte, 1),
    { recuo: 0, trechos: [sinal('}')] },
  ]
}

export function textoDaSaida(linhas: readonly LinhaDaSaida[]): string {
  return linhas
    .map(
      ({ recuo, trechos }) =>
        '  '.repeat(recuo) + trechos.map(({ texto }) => texto).join(''),
    )
    .join('\n')
}

export const SAIDA_DO_TERMINAL = abreviar(
  ENVELOPE_DO_EXEMPLO,
  RECORTE_DO_TERMINAL,
)
