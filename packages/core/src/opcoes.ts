import { lerDataISO } from './nascimento'
import { type UF, UFS } from './uf'

export type NomeDaOpcao = 'semente' | 'hoje' | 'uf' | 'dominioEmail' | 'n'

export class ErroDeOpcao extends Error {
  readonly opcao: NomeDaOpcao

  constructor(opcao: NomeDaOpcao, mensagem: string) {
    super(mensagem)
    this.name = 'ErroDeOpcao'
    this.opcao = opcao
  }
}

export const LIMITE_DO_LOTE = 100_000

export function lerHoje(hoje: string): string {
  try {
    lerDataISO(hoje)
  } catch {
    throw new ErroDeOpcao(
      'hoje',
      `hoje precisa ser uma data AAAA-MM-DD que existe, recebido "${hoje}"`,
    )
  }
  return hoje
}

export function lerUF(uf: string): UF {
  const sigla = uf.toUpperCase()
  if (!(UFS as readonly string[]).includes(sigla))
    throw new ErroDeOpcao(
      'uf',
      `uf desconhecida "${uf}" (use uma das 27 siglas, ex.: SP)`,
    )
  return sigla as UF
}

const ROTULO_DE_DOMINIO = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

export function lerDominioEmail(dominio: string): string {
  const minusculo = dominio.toLowerCase()
  const rotulos = minusculo.split('.')
  const valido =
    minusculo.length <= 253 &&
    rotulos.length >= 2 &&
    rotulos.every((r) => ROTULO_DE_DOMINIO.test(r)) &&
    !/^\d+$/.test(rotulos[rotulos.length - 1])
  if (!valido)
    throw new ErroDeOpcao(
      'dominioEmail',
      `domínio de e-mail inválido "${dominio}" (ex.: example.com)`,
    )
  return minusculo
}

export function lerQuantidade(n: number): number {
  if (!Number.isInteger(n) || n < 0 || n > LIMITE_DO_LOTE)
    throw new ErroDeOpcao(
      'n',
      `n precisa ser um inteiro de 0 a ${LIMITE_DO_LOTE}, recebido ${n}`,
    )
  return n
}
