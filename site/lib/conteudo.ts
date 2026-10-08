import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faAddressBook,
  faBuilding,
  faCode,
  faCreditCard,
  faIdCard,
  faLocationDot,
  faMasksTheater,
  faPuzzlePiece,
  faServer,
  faTerminal,
} from '@fortawesome/free-solid-svg-icons'
import { EMAIL_DA_PILUTECH, mailtoDaPilutech } from './contato'

export const NOME = 'Botaí'
export const PROPOSTA =
  'Gerador de dados fake para formulários (CPF, CNPJ, CEP)'
export const URL_DA_PILUTECH = 'https://pilutech.com.br'
export const URL_DA_PILULABS = 'https://piluvitu.com.br/pilulabs'
export const EMAIL_DE_SUPORTE = EMAIL_DA_PILUTECH
export const MAILTO = {
  suporte: mailtoDaPilutech(NOME, 'Suporte'),
  privacidade: mailtoDaPilutech(NOME, 'Privacidade'),
  termos: mailtoDaPilutech(NOME, 'Termos de uso'),
} as const
export const REPOSITORIO = 'https://github.com/PiluVitu/Botai'
export const URL_DA_LICENCA = `${REPOSITORIO}/blob/main/extensao/LICENSE`

export const DOCUMENTOS = [
  { href: '/privacidade', rotulo: 'Privacidade' },
  { href: '/termos', rotulo: 'Termos de uso' },
]

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
export const IMAGEM_DO_SERVIDOR = 'ghcr.io/piluvitu/botai:0.4.1'

export function npmDe(pacote: string): string {
  return `https://www.npmjs.com/package/${pacote}`
}

export type CodigoDaPorta =
  { tipo: 'atalho' } | { tipo: 'terminal' | 'codigo'; linhas: string[] }

export type Porta = {
  titulo: string
  texto: string
  icone: IconDefinition
  codigo: CodigoDaPorta
}

export const PORTAS: Porta[] = [
  {
    titulo: 'Extensão',
    texto:
      'Preenche o formulário da aba num atalho, ou um campo só pelo botão direito.',
    icone: faPuzzlePiece,
    codigo: { tipo: 'atalho' },
  },
  {
    titulo: 'Biblioteca',
    texto:
      'Uma pessoa ou um lote sem e-mail, CPF ou CNPJ repetido. ESM com tipos e sem dependência de runtime: roda em Node, Bun, Deno e no navegador.',
    icone: faCode,
    codigo: {
      tipo: 'codigo',
      linhas: [
        `import { gerarPessoa } from '${PACOTE_DO_CORE}'`,
        "gerarPessoa({ semente: 'cadastro-1', hoje: '2026-10-05' })",
      ],
    },
  },
  {
    titulo: 'CLI',
    texto:
      'Uma pessoa, um lote em JSON, NDJSON, CSV ou SQL (Postgres, MySQL e SQLite), um documento avulso ou a validação de um.',
    icone: faTerminal,
    codigo: {
      tipo: 'terminal',
      linhas: [
        `npx ${PACOTE_DO_CORE} pessoas -n 1000 --semente carga --formato sql > pessoas.sql`,
      ],
    },
  },
  {
    titulo: 'Servidor, Docker e binários',
    texto:
      'O `botai serve` responde em `127.0.0.1:8790` para qualquer linguagem que fale HTTP, sem pacote nenhum. A imagem entra como `services:` no GitHub Actions e no docker compose, e os binários rodam sem Node no macOS, no Linux e no Windows.',
    icone: faServer,
    codigo: {
      tipo: 'terminal',
      linhas: [`docker run --rm -p 8790:8790 ${IMAGEM_DO_SERVIDOR}`],
    },
  },
  {
    titulo: 'Plugin do Playwright',
    texto:
      'A fixture `botai` preenche todos os frames. A semente é o nome do teste, então o retry usa a mesma pessoa, e na falha o relatório leva o `botai-pessoa.json`.',
    icone: faMasksTheater,
    codigo: {
      tipo: 'codigo',
      linhas: [
        `import { test } from '${PACOTE_DO_PLAYWRIGHT}'`,
        'await botai.preencher(page)',
      ],
    },
  },
]

export const REQUISITOS =
  'Chrome, Edge e Opera a partir do Chromium 123. Firefox a partir da versão 153.'
export const REQUISITOS_DO_SOFTWARE =
  'Chrome, Edge ou Opera com Chromium 123 ou superior, ou Firefox 153 ou superior'
