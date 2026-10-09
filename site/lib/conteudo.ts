import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faAddressBook,
  faBuilding,
  faCreditCard,
  faIdCard,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons'
import { EMAIL_DA_PILUTECH, mailtoDaPilutech } from './contato'

export const NOME = 'Botaí'
export const PROPOSTA =
  'Gerador de dados fake para formulários (CPF, CNPJ, CEP)'
export const POSICIONAMENTO =
  'Dados de teste brasileiros em todo lugar que o seu teste roda.'
export const URL_DA_PILUTECH = 'https://pilutech.com.br'
export const URL_DA_DOCUMENTACAO = 'https://docs.botai.pilutech.com.br'
export const EMAIL_DE_SUPORTE = EMAIL_DA_PILUTECH
export const MAILTO = {
  suporte: mailtoDaPilutech(NOME, 'Suporte'),
  privacidade: mailtoDaPilutech(NOME, 'Privacidade'),
  termos: mailtoDaPilutech(NOME, 'Termos de uso'),
} as const
export const REPOSITORIO = 'https://github.com/PiluVitu/Botai'
export const URL_DA_LICENCA = `${REPOSITORIO}/blob/main/extensao/LICENSE`

export const ANCORAS_DA_LANDING = [
  { id: 'portas', rotulo: 'Portas' },
  { id: 'mesma-pessoa', rotulo: 'Mesma pessoa' },
  { id: 'para-quem', rotulo: 'Para quem' },
  { id: 'extensao', rotulo: 'Extensão' },
] as const
export type AncoraDaLanding = (typeof ANCORAS_DA_LANDING)[number]['id']

export function historicoDe(arquivo: string): string {
  return `${REPOSITORIO}/commits/main/site/${arquivo}`
}

export type Recurso = { titulo: string; texto: string; icone: IconDefinition }

export const RECURSOS: Recurso[] = [
  {
    titulo: 'Documentos',
    texto:
      'CPF, CNPJ, RG, PIS/NIS e título de eleitor, com os dígitos verificadores certos.',
    icone: faIdCard,
  },
  {
    titulo: 'Endereço',
    texto: 'CEP real, com rua, bairro, cidade e UF que batem com ele.',
    icone: faLocationDot,
  },
  {
    titulo: 'Contato',
    texto: 'Nome, data de nascimento, celular, e-mail e senha.',
    icone: faAddressBook,
  },
  {
    titulo: 'Empresa',
    texto: 'Razão social, nome fantasia e CNPJ.',
    icone: faBuilding,
  },
  {
    titulo: 'Cartão',
    texto:
      'O cartão de teste documentado da Stripe: número, nome impresso, validade e CVV.',
    icone: faCreditCard,
  },
]

export const PACOTE_DO_CORE = '@pilutech/botai-core'
export const PACOTE_DO_PLAYWRIGHT = '@pilutech/botai-playwright'
export const IMAGEM_DO_SERVIDOR = 'ghcr.io/piluvitu/botai:0.5.0'

export function npmDe(pacote: string): string {
  return `https://www.npmjs.com/package/${pacote}`
}

export const REQUISITOS_DO_SOFTWARE =
  'Chrome, Edge ou Opera com Chromium 123 ou superior, ou Firefox 153 ou superior'
