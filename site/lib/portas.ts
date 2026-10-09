import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faDocker } from '@fortawesome/free-brands-svg-icons'
import {
  faCode,
  faMasksTheater,
  faMicrochip,
  faPuzzlePiece,
  faServer,
  faTerminal,
  faWindowMaximize,
} from '@fortawesome/free-solid-svg-icons'
import { MOTOR } from '@pilutech/botai-core'
import { ATALHOS } from '@pilutech/botai-core/atalhos'
import { IMAGEM_DO_SERVIDOR, PACOTE_DO_CORE } from './conteudo'
import { HOJE_DO_EXEMPLO, SEMENTE_DO_EXEMPLO } from './exemplo'

export type IdDaPorta =
  | 'extensao'
  | 'cli'
  | 'http'
  | 'docker'
  | 'binarios'
  | 'biblioteca'
  | 'playwright'
  | 'motor'

export type Porta = {
  id: IdDaPorta
  numero: string
  nome: string
  icone: IconDefinition
  linha: string
  onde: string
  comando: { linhas: string[]; copiavel: boolean }
  semente: boolean
}

type Dados = Omit<Porta, 'numero'>

const NPX = `npx ${PACOTE_DO_CORE}@${MOTOR}`

const DADOS: Dados[] = [
  {
    id: 'extensao',
    nome: 'Extensão',
    icone: faPuzzlePiece,
    linha:
      'Preenche o formulário da aba num atalho, ou um campo só pelo botão direito.',
    onde: 'Chrome 123+ e Edge pela Chrome Web Store, Firefox 153+ pela Firefox Add-ons. Opera em revisão.',
    comando: {
      linhas: [
        `${ATALHOS.chrome.mac} no Mac · ${ATALHOS.chrome.windows} no Windows e no Linux · ${ATALHOS.firefox.linux} no Firefox para Linux`,
      ],
      copiavel: false,
    },
    semente: false,
  },
  {
    id: 'cli',
    nome: 'CLI',
    icone: faTerminal,
    linha:
      'Uma pessoa ou um lote em JSON, NDJSON, CSV ou SQL, direto no banco.',
    onde: 'Onde houver Node.',
    comando: {
      linhas: [
        `${NPX} pessoas -n 1000 --semente carga --hoje ${HOJE_DO_EXEMPLO} --formato sql | psql "$DATABASE_URL"`,
      ],
      copiavel: true,
    },
    semente: true,
  },
  {
    id: 'http',
    nome: 'HTTP',
    icone: faServer,
    linha:
      'Python, Go, Java ou qualquer linguagem que fale HTTP pede uma pessoa.',
    onde: 'Node, imagem ou binário.',
    comando: {
      linhas: [
        `curl 'http://127.0.0.1:8790/pessoa?semente=${SEMENTE_DO_EXEMPLO}&hoje=${HOJE_DO_EXEMPLO}'`,
      ],
      copiavel: true,
    },
    semente: true,
  },
  {
    id: 'docker',
    nome: 'Docker',
    icone: faDocker,
    linha: 'O servidor numa imagem, que entra como service no CI.',
    onde: 'linux/amd64 e linux/arm64.',
    comando: {
      linhas: [`docker run --rm -p 8790:8790 ${IMAGEM_DO_SERVIDOR}`],
      copiavel: true,
    },
    semente: true,
  },
  {
    id: 'binarios',
    nome: 'Binários',
    icone: faMicrochip,
    linha: 'A CLI e o servidor sem instalar Node.',
    onde: 'macOS, Linux e Windows, x64 e arm64. No Windows, baixe o .exe do release.',
    comando: {
      linhas: [
        'curl -fsSL https://github.com/PiluVitu/Botai/releases/latest/download/install.sh | sh',
      ],
      copiavel: true,
    },
    semente: true,
  },
  {
    id: 'biblioteca',
    nome: 'Biblioteca',
    icone: faCode,
    linha: 'O mesmo gerador no seu código JS ou TS, sem nenhuma dependência.',
    onde: 'Node, Bun, Deno e navegador.',
    comando: {
      linhas: [
        `import { gerarPessoa } from '${PACOTE_DO_CORE}'`,
        `gerarPessoa({ semente: ${SEMENTE_DO_EXEMPLO}, hoje: '${HOJE_DO_EXEMPLO}' })`,
      ],
      copiavel: true,
    },
    semente: true,
  },
  {
    id: 'playwright',
    nome: 'Playwright',
    icone: faMasksTheater,
    linha:
      'A semente é o nome do teste: o retry usa a mesma pessoa e a falha leva a pessoa no relatório.',
    onde: 'Chromium, Firefox e WebKit.',
    comando: { linhas: ['await botai.preencher(page)'], copiavel: true },
    semente: true,
  },
  {
    id: 'motor',
    nome: 'Motor',
    icone: faWindowMaximize,
    linha: 'Um script de 40 KB que preenche o formulário da página.',
    onde: 'Qualquer ferramenta que execute JS na página. Testado com Playwright e CDP.',
    comando: {
      linhas: [
        'window.__botaiNavegador.preencher(document, pessoa, hoje, { segundaPassada: true })',
      ],
      copiavel: true,
    },
    semente: false,
  },
]

export const PORTAS: Porta[] = DADOS.map((dados, indice) => ({
  ...dados,
  numero: String(indice + 1).padStart(2, '0'),
}))

export const NOTA_DAS_PORTAS =
  'Saída em JSON, NDJSON, CSV e SQL para Postgres, MySQL e SQLite. Importação provada no Postgres 16 e no SQLite.'
