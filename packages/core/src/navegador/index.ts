/// <reference lib="dom" />
export {
  cabe,
  campos,
  descrever,
  ehCampo,
  elementoEmFoco,
  escrever,
  leuDeVolta,
  preenchivel,
  raizSombraAberta,
  seletor,
  tipoNaoPreenchivel,
  visivel,
  type Campo,
  type RaizSombra,
} from './dom'
export { criarRegistro, type Registro } from './registro'
export {
  cliqueDoUsuarioEmCampo,
  criarContornos,
  SEM_CONTORNOS,
  type Contornos,
  type TipoContorno,
} from './contornos'
export {
  agendarSegundaPassada,
  regravarAlterados,
  SEGUNDA_PASSADA_MS,
  type Escrito,
} from './segunda-passada'
export {
  contarIframesDeFora,
  preencherDocumento,
  type LinhaDoFrame,
  type OpcoesDePreencher,
  type ResultadoFrame,
} from './preencher'
export {
  instalarNoGlobal,
  NOME_DO_GLOBAL,
  preencherNaPagina,
  type ApiDoNavegador,
  type OpcoesNaPagina,
} from './pagina'
