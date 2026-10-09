import {
  type OpcoesDaPessoa,
  type OpcoesDoLote,
  type OpcoesResolvidas,
  pessoaResolvida,
  pessoasDoLote,
  resolverOpcoes,
} from './gerar'
import type { Pessoa } from './pessoa'
import { MOTOR } from './versao'

export const FORMATO = 1

export interface EnvelopeDaPessoa {
  formato: 1
  motor: string
  semente: string
  hoje: string
  pessoa: Pessoa
}

export interface EnvelopeDasPessoas {
  formato: 1
  motor: string
  semente: string
  hoje: string
  pessoas: Pessoa[]
}

export function envelopar(
  semente: string,
  hoje: string,
  pessoa: Pessoa,
): EnvelopeDaPessoa {
  return { formato: FORMATO, motor: MOTOR, semente, hoje, pessoa }
}

export function envelopeDoLote(
  n: number,
  opcoes: OpcoesResolvidas,
): EnvelopeDasPessoas {
  const pessoas = Array.from(pessoasDoLote(n, opcoes), (p) => p.pessoa)
  return {
    formato: FORMATO,
    motor: MOTOR,
    semente: opcoes.semente,
    hoje: opcoes.hoje,
    pessoas,
  }
}

export function gerarEnvelopeDaPessoa(
  opcoes: OpcoesDaPessoa = {},
): EnvelopeDaPessoa {
  const resolvidas = resolverOpcoes(opcoes)
  return envelopar(
    resolvidas.semente,
    resolvidas.hoje,
    pessoaResolvida(resolvidas),
  )
}

export function gerarEnvelopeDasPessoas(
  n: number,
  opcoes: OpcoesDoLote = {},
): EnvelopeDasPessoas {
  return envelopeDoLote(n, resolverOpcoes(opcoes))
}
