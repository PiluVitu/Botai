import { calcularIdade, lerDataISO } from '@pilutech/botai-core/nascimento'

export function idadeEm(nascimentoISO: string, hoje: string): number {
  return calcularIdade(lerDataISO(nascimentoISO), lerDataISO(hoje))
}
