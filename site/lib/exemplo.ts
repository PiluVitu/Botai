import { gerarPessoa, MOTOR } from '@pilutech/botai-core'
import { PACOTE_DO_CORE } from './conteudo'

export const SEMENTE_DO_EXEMPLO = 42
export const HOJE_DO_EXEMPLO = '2026-10-05'

export const PESSOA_DO_EXEMPLO = gerarPessoa({
  semente: SEMENTE_DO_EXEMPLO,
  hoje: HOJE_DO_EXEMPLO,
})

export const COMANDO_DO_EXEMPLO = `npx ${PACOTE_DO_CORE}@${MOTOR} pessoa --semente ${SEMENTE_DO_EXEMPLO} --hoje ${HOJE_DO_EXEMPLO}`
