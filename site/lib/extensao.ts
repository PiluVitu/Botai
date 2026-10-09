import { ATALHOS, type Sistema } from '@pilutech/botai-core/atalhos'
import { LOJAS, type Loja } from './pilulabs'

export const NOME_DO_NAVEGADOR: Record<Loja, string> = {
  chrome: 'Chrome',
  firefox: 'Firefox',
  edge: 'Edge',
  opera: 'Opera',
}

export const REQUISITOS_DA_EXTENSAO =
  'Chrome 123+ e Edge pela Chrome Web Store · Firefox 153+'

export const ESTADO_SEM_URL: Record<Loja, string> = {
  chrome: 'em breve',
  firefox: 'em breve',
  edge: 'em breve',
  opera: 'em revisão',
}

export const INSERIR_UM_CAMPO = 'botão direito › Botaí › Inserir'

export type ExcecaoDoAtalho = { navegador: string; tecla: string }
export type AtalhoDoSistema = {
  sistema: string
  tecla: string
  excecoes: ExcecaoDoAtalho[]
}

const SISTEMAS: { sistema: Sistema; nome: string }[] = [
  { sistema: 'mac', nome: 'macOS' },
  { sistema: 'windows', nome: 'Windows' },
  { sistema: 'linux', nome: 'Linux' },
]

export const ATALHOS_POR_SISTEMA: AtalhoDoSistema[] = SISTEMAS.map(
  ({ sistema, nome }) => {
    const tecla = ATALHOS.chrome[sistema]
    return {
      sistema: nome,
      tecla,
      excecoes: LOJAS.filter((loja) => ATALHOS[loja][sistema] !== tecla).map(
        (loja) => ({
          navegador: NOME_DO_NAVEGADOR[loja],
          tecla: ATALHOS[loja][sistema],
        }),
      ),
    }
  },
)
