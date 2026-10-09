import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowPointer,
  faDatabase,
  faDiagramProject,
  faLaptopCode,
  faMasksTheater,
} from '@fortawesome/free-solid-svg-icons'
import { URL_DA_DOCUMENTACAO } from './conteudo'

export type Persona = {
  titulo: string
  icone: IconDefinition
  etiquetas: string[]
  itens: string[]
}

export const PERSONAS: Persona[] = [
  {
    titulo: 'QA manual',
    icone: faArrowPointer,
    etiquetas: ['extensão'],
    itens: [
      'Um atalho preenche o cadastro inteiro, e a mesma pessoa fica guardada entre as etapas de um fluxo.',
      'Guarde até 3 pessoas favoritas, com apelido, e preencha com qualquer uma em `Botão direito › Botaí › Preencher com`.',
      '`Botão direito › Botaí › Inserir` põe CPF, e-mail, CEP e mais 20 tipos num campo só.',
      '“Abrir caixa de entrada” abre a caixa pública, onde chega o e-mail de confirmação.',
    ],
  },
  {
    titulo: 'Dev frontend',
    icone: faLaptopCode,
    etiquetas: ['extensão', 'biblioteca'],
    itens: [
      'Funciona com React, Vue e máscaras (imask, jQuery Mask e maska).',
      'O popup lista os campos que não reconheceu.',
      'A biblioteca traz validadores de CPF, CNPJ, RG, PIS e título.',
    ],
  },
  {
    titulo: 'QA de automação',
    icone: faMasksTheater,
    etiquetas: ['playwright', 'motor'],
    itens: [
      '`botai.preencher(page)` em cadastro, checkout e onboarding, em todos os frames.',
      'A falha do CI é reproduzida com a mesma pessoa no terminal.',
    ],
  },
  {
    titulo: 'Backend semeando banco',
    icone: faDatabase,
    etiquetas: ['cli', 'sql', 'csv'],
    itens: [
      'Mil INSERTs iguais em qualquer máquina, compatíveis com colunas UNIQUE.',
      '`--uf PI` amarra o CEP, o DDD, a região do CPF e o código do título.',
    ],
  },
  {
    titulo: 'CI',
    icone: faDiagramProject,
    etiquetas: ['npx com versão fixa', 'imagem', 'binário'],
    itens: [
      'O seed de banco num passo do workflow.',
      'A imagem entra como service container.',
    ],
  },
]

export const CONVITE = {
  titulo: 'Não sabe por onde começar?',
  texto: 'A documentação tem um guia por porta e as integrações por linguagem.',
  href: URL_DA_DOCUMENTACAO,
  rotulo: 'docs.botai.pilutech.com.br',
}

export type Trecho = { texto: string; codigo: boolean }

export function trechos(texto: string): Trecho[] {
  return texto
    .split('`')
    .map((parte, indice) => ({ texto: parte, codigo: indice % 2 === 1 }))
    .filter((trecho) => trecho.texto !== '')
}
