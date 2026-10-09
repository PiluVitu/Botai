import {
  CATALOGO_DE_CARTOES,
  CENARIO_PADRAO,
  NOME_DO_PROVEDOR,
  PROVEDOR_PADRAO,
  PROVEDORES,
  type Cartao,
  type CartaoEscolhido,
  type Cenario,
  type CenarioDoCartao,
  type Provedor,
} from '@pilutech/botai-core/cartao'

export const ESCOLHA_PADRAO: CartaoEscolhido = {
  provedor: PROVEDOR_PADRAO,
  cenario: CENARIO_PADRAO,
}

export function cenariosDo(
  provedor: Provedor,
): readonly CenarioDoCartao<Cenario>[] {
  return CATALOGO_DE_CARTOES[provedor]
}

function acharCenario(
  provedor: Provedor,
  cenario: unknown,
): CenarioDoCartao<Cenario> | undefined {
  return cenariosDo(provedor).find((c) => c.id === cenario)
}

export function normalizarEscolha(valor: unknown): CartaoEscolhido {
  if (typeof valor !== 'object' || valor === null) return { ...ESCOLHA_PADRAO }
  const { provedor, cenario } = valor as Record<string, unknown>
  const valido = PROVEDORES.find((p) => p === provedor)
  const achado = valido && acharCenario(valido, cenario)
  return valido && achado
    ? { provedor: valido, cenario: achado.id }
    : { ...ESCOLHA_PADRAO }
}

export function trocarProvedor(
  escolha: CartaoEscolhido,
  provedor: Provedor,
): CartaoEscolhido {
  return {
    provedor,
    cenario: acharCenario(provedor, escolha.cenario)?.id ?? CENARIO_PADRAO,
  }
}

export function cenarioDaEscolha(
  escolha: CartaoEscolhido,
): CenarioDoCartao<Cenario> {
  const { provedor, cenario } = normalizarEscolha(escolha)
  return acharCenario(provedor, cenario)!
}

export function rotuloDaEscolha(escolha: CartaoEscolhido): string {
  return `${NOME_DO_PROVEDOR[escolha.provedor]} · ${cenarioDaEscolha(escolha).rotulo}`
}

export interface CartaoParaMostrar {
  provedor: Provedor
  cenario: CenarioDoCartao<Cenario>
}

export function cartaoParaMostrar(
  cartao: Partial<Pick<Cartao, 'provedor' | 'cenario'>>,
): CartaoParaMostrar {
  const escolha = normalizarEscolha(cartao)
  return { provedor: escolha.provedor, cenario: cenarioDaEscolha(escolha) }
}
