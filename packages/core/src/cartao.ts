import { type Rng, rngPadrao } from './aleatorio'
import { lerDataISO } from './nascimento'
import { ErroDeOpcao, LIMITE_DO_LOTE } from './opcoes'

export type Bandeira = 'visa' | 'mastercard'

export interface NumeroDeTeste {
  readonly bandeira: Bandeira
  readonly numero: string
}

export type TipoDoCenario = 'ok' | 'erro' | 'espera'

export interface CenarioDoCartao<Id extends string = string> {
  readonly id: Id
  readonly rotulo: string
  readonly tipo: TipoDoCenario
  readonly descricao: string
  readonly numeros: readonly NumeroDeTeste[]
}

const visa = (numero: string) => [{ bandeira: 'visa', numero }] as const

// Números de docs.stripe.com/testing e do simulador da Pagar.me
// (docs.pagar.me/docs/simulador-de-cartão-de-crédito): só eles têm o efeito descrito em sandbox,
// e um número aleatório que passa no Luhn pode ser o de um cartão real.
export const CATALOGO_DE_CARTOES = {
  stripe: [
    {
      id: 'aprovado',
      rotulo: 'aprovado',
      tipo: 'ok',
      descricao: 'Aprova a cobrança.',
      numeros: [
        { bandeira: 'visa', numero: '4242424242424242' },
        { bandeira: 'mastercard', numero: '5555555555554444' },
      ],
    },
    {
      id: 'recusado',
      rotulo: 'recusado',
      tipo: 'erro',
      descricao: 'Recusa genérica (card_declined, generic_decline).',
      numeros: visa('4000000000000002'),
    },
    {
      id: 'pendente',
      rotulo: 'exige 3DS',
      tipo: 'espera',
      descricao: 'Fica aguardando a autenticação 3D Secure antes de cobrar.',
      numeros: visa('4000002760003184'),
    },
    {
      id: 'recusado-saldo',
      rotulo: 'saldo insuficiente',
      tipo: 'erro',
      descricao: 'Recusa por saldo insuficiente (insufficient_funds).',
      numeros: visa('4000000000009995'),
    },
    {
      id: 'recusado-roubado',
      rotulo: 'roubado',
      tipo: 'erro',
      descricao: 'Recusa por cartão roubado (stolen_card).',
      numeros: visa('4000000000009979'),
    },
    {
      id: 'recusado-perdido',
      rotulo: 'perdido',
      tipo: 'erro',
      descricao: 'Recusa por cartão perdido (lost_card).',
      numeros: visa('4000000000009987'),
    },
    {
      id: 'recusado-expirado',
      rotulo: 'expirado',
      tipo: 'erro',
      descricao: 'Recusa por cartão expirado (expired_card).',
      numeros: visa('4000000000000069'),
    },
    {
      id: 'recusado-cvc',
      rotulo: 'CVC incorreto',
      tipo: 'erro',
      descricao: 'Recusa por CVC incorreto (incorrect_cvc).',
      numeros: visa('4000000000000127'),
    },
    {
      id: 'erro-processamento',
      rotulo: 'erro de processamento',
      tipo: 'erro',
      descricao: 'Erro de processamento (processing_error).',
      numeros: visa('4000000000000119'),
    },
  ],
  pagarme: [
    {
      id: 'aprovado',
      rotulo: 'aprovado',
      tipo: 'ok',
      descricao: 'Pedido e cobrança pagos; transação capturada.',
      numeros: visa('4000000000000010'),
    },
    {
      id: 'recusado',
      rotulo: 'recusado',
      tipo: 'erro',
      descricao: 'Pedido e cobrança com falha; transação não autorizada.',
      numeros: visa('4000000000000028'),
    },
    {
      id: 'pendente',
      rotulo: 'pendente → aprova',
      tipo: 'espera',
      descricao: 'Fica processando e depois aprova.',
      numeros: visa('4000000000000036'),
    },
    {
      id: 'pendente-recusado',
      rotulo: 'pendente → recusa',
      tipo: 'espera',
      descricao: 'Fica processando e depois falha.',
      numeros: visa('4000000000000044'),
    },
    {
      id: 'pendente-cancelado',
      rotulo: 'pendente → cancela',
      tipo: 'espera',
      descricao: 'Fica pendente e depois é cancelado e estornado.',
      numeros: visa('4000000000000051'),
    },
    {
      id: 'chargeback',
      rotulo: 'chargeback',
      tipo: 'erro',
      descricao: 'Aprova e depois sofre chargeback.',
      numeros: visa('4000000000000069'),
    },
  ],
} as const satisfies Record<string, readonly CenarioDoCartao[]>

export type Provedor = keyof typeof CATALOGO_DE_CARTOES
export type CenarioDe<P extends Provedor> =
  (typeof CATALOGO_DE_CARTOES)[P][number]['id']
export type Cenario = CenarioDe<Provedor>

export const PROVEDORES: readonly Provedor[] = ['stripe', 'pagarme']
export const PROVEDOR_PADRAO: Provedor = 'stripe'
export const CENARIO_PADRAO: Cenario = 'aprovado'
export const NOME_DO_PROVEDOR: Readonly<Record<Provedor, string>> = {
  stripe: 'Stripe',
  pagarme: 'Pagar.me',
}

export const CARTOES_TESTE: readonly NumeroDeTeste[] =
  CATALOGO_DE_CARTOES.stripe[0].numeros

export interface OpcoesDoCartao {
  provedor?: Provedor
  cenario?: Cenario
}

export interface CartaoEscolhido {
  provedor: Provedor
  cenario: Cenario
}

export type DistribuicaoDeCenarios = Readonly<Partial<Record<Cenario, number>>>

export interface GrupoDeCenario {
  cenario: Cenario
  quantidade: number
}

function cenariosDo(provedor: Provedor): readonly CenarioDoCartao<Cenario>[] {
  return CATALOGO_DE_CARTOES[provedor]
}

function lerProvedor(texto: string): Provedor {
  const id = texto.toLowerCase()
  const provedor = PROVEDORES.find((p) => p === id)
  if (provedor === undefined)
    throw new ErroDeOpcao(
      'cartao',
      `provedor de cartão desconhecido "${texto}" (use ${PROVEDORES.join(', ')})`,
    )
  return provedor
}

function lerCenario(
  provedor: Provedor,
  texto: string,
  opcao: 'cenario' | 'cenarios',
): Cenario {
  const id = texto.toLowerCase()
  const achado = cenariosDo(provedor).find((c) => c.id === id)
  if (achado === undefined)
    throw new ErroDeOpcao(
      opcao,
      `cenário desconhecido "${texto}" para o provedor ${provedor} (use ${cenariosDo(
        provedor,
      )
        .map((c) => c.id)
        .join(', ')})`,
    )
  return achado.id
}

export function cenarioDoCartao(
  provedor: Provedor,
  cenario: Cenario,
): CenarioDoCartao<Cenario> {
  const lido = lerProvedor(provedor)
  const id = lerCenario(lido, cenario, 'cenario')
  return cenariosDo(lido).find((c) => c.id === id)!
}

export function lerCartao(opcoes: OpcoesDoCartao = {}): CartaoEscolhido {
  const provedor =
    opcoes.provedor === undefined
      ? PROVEDOR_PADRAO
      : lerProvedor(opcoes.provedor)
  const cenario =
    opcoes.cenario === undefined
      ? CENARIO_PADRAO
      : lerCenario(provedor, opcoes.cenario, 'cenario')
  return { provedor, cenario }
}

const EXEMPLO_DE_CENARIOS = 'ex.: recusado:10,aprovado:2'

function quantidadeInvalida(cenario: string, quantidade: unknown): ErroDeOpcao {
  return new ErroDeOpcao(
    'cenarios',
    `quantidade inválida "${String(quantidade)}" no cenário ${cenario} (um inteiro de 1 em diante)`,
  )
}

export function lerCenarios(texto: string): DistribuicaoDeCenarios {
  const pares = texto
    .split(',')
    .map((item) => item.split(':').map((p) => p.trim()))
  if (pares.some((par) => par.length !== 2 || par[0] === '' || par[1] === ''))
    throw new ErroDeOpcao(
      'cenarios',
      `cenarios precisa ser cenario:quantidade, separados por vírgula (${EXEMPLO_DE_CENARIOS}), recebido "${texto}"`,
    )
  const vistos = new Set<string>()
  for (const [cenario, quantidade] of pares) {
    if (!/^\d+$/.test(quantidade) || Number(quantidade) < 1)
      throw quantidadeInvalida(cenario, quantidade)
    if (vistos.has(cenario))
      throw new ErroDeOpcao('cenarios', `cenário repetido "${cenario}"`)
    vistos.add(cenario)
  }
  return Object.fromEntries(pares.map(([c, q]) => [c, Number(q)]))
}

export function lerDistribuicao(
  provedor: Provedor,
  cenarios: Readonly<Record<string, number | undefined>>,
): GrupoDeCenario[] {
  const lido = lerProvedor(provedor)
  const grupos: GrupoDeCenario[] = []
  for (const [texto, quantidade] of Object.entries(cenarios)) {
    const cenario = lerCenario(lido, texto, 'cenarios')
    if (
      typeof quantidade !== 'number' ||
      !Number.isInteger(quantidade) ||
      quantidade < 1
    )
      throw quantidadeInvalida(cenario, quantidade)
    if (grupos.some((g) => g.cenario === cenario))
      throw new ErroDeOpcao('cenarios', `cenário repetido "${cenario}"`)
    grupos.push({ cenario, quantidade })
  }
  if (grupos.length === 0)
    throw new ErroDeOpcao(
      'cenarios',
      'informe ao menos um cenário com quantidade, ex.: aprovado:1',
    )
  const soma = grupos.reduce((total, g) => total + g.quantidade, 0)
  if (soma > LIMITE_DO_LOTE)
    throw new ErroDeOpcao(
      'cenarios',
      `a soma dos cenários (${soma}) passa do limite de ${LIMITE_DO_LOTE} pessoas`,
    )
  return grupos
}

export interface OpcoesDoCartaoDoLote extends OpcoesDoCartao {
  cenarios?: DistribuicaoDeCenarios
}

export function conferirCenarioOuCenarios(opcoes: OpcoesDoCartaoDoLote): void {
  if (opcoes.cenario !== undefined && opcoes.cenarios !== undefined)
    throw new ErroDeOpcao('cenarios', 'use cenario ou cenarios, não os dois')
}

export interface TextosDoCartao {
  cartao?: string
  cenario?: string
  cenarios?: string
}

export function lerTextosDoCartao({
  cartao,
  cenario,
  cenarios,
}: TextosDoCartao): OpcoesDoCartaoDoLote | undefined {
  if (cartao === undefined && cenario === undefined && cenarios === undefined)
    return undefined
  const escolhido = lerCartao({
    provedor: cartao as Provedor | undefined,
    cenario: cenario as Cenario | undefined,
  })
  if (cenarios === undefined) return escolhido
  conferirCenarioOuCenarios({
    cenario: cenario as Cenario | undefined,
    cenarios: {},
  })
  return { provedor: escolhido.provedor, cenarios: lerCenarios(cenarios) }
}

export function escolherNumero(
  rng: Rng = rngPadrao,
  opcoes: OpcoesDoCartao = {},
): NumeroDeTeste {
  const { provedor, cenario } = lerCartao(opcoes)
  const { numeros } = cenarioDoCartao(provedor, cenario)
  // Sorteia sobre o par aprovado da Stripe em todo cenário, como o escolher de antes: a mesma
  // semente dá a mesma pessoa em qualquer cenário, e só o número do cartão muda.
  const sorteio = rng.int(CARTOES_TESTE.length)
  return numeros[sorteio % numeros.length]
}

export function luhnValido(numero: string): boolean {
  const s = numero.replace(/\D/g, '')
  if (s.length < 12) return false
  let soma = 0
  for (let i = 0; i < s.length; i++) {
    let d = Number(s[s.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    soma += d
  }
  return soma % 10 === 0
}

export function formatarNumeroCartao(numero: string): string {
  return numero.replace(/(\d{4})(?=\d)/g, '$1 ')
}

export interface Cartao {
  bandeira: Bandeira
  numero: string
  numeroFormatado: string
  titular: string
  validade: string
  mes: string
  ano: string
  cvv: string
  provedor: Provedor
  cenario: Cenario
}

export function gerarCartao(
  rng: Rng = rngPadrao,
  hojeISO: string,
  titular: string,
  opcoes: OpcoesDoCartao = {},
): Cartao {
  const { provedor, cenario } = lerCartao(opcoes)
  const c = escolherNumero(rng, { provedor, cenario })
  const hoje = lerDataISO(hojeISO)
  const meses = hoje.ano * 12 + (hoje.mes - 1) + 12 + rng.int(48)
  const mes = String((meses % 12) + 1).padStart(2, '0')
  const ano = String(Math.floor(meses / 12) % 100).padStart(2, '0')
  return {
    bandeira: c.bandeira,
    numero: c.numero,
    numeroFormatado: formatarNumeroCartao(c.numero),
    titular,
    validade: `${mes}/${ano}`,
    mes,
    ano,
    cvv: String(100 + rng.int(900)),
    provedor,
    cenario,
  }
}
