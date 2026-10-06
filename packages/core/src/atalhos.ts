export type Loja = 'chrome' | 'firefox' | 'edge' | 'opera'
export type Sistema = 'windows' | 'mac' | 'linux'
export type TeclasSugeridas = { default: string; mac: string; linux?: string }

// No Windows e no Linux o Chrome reserva Alt+Shift+P ("criar novo grupo de abas") e não o cede à extensão.
const TECLAS_CHROMIUM: TeclasSugeridas = {
  default: 'Ctrl+Shift+Y',
  mac: 'Alt+Shift+P',
}
// No Linux o Firefox usa Ctrl+Shift+Y para os Downloads e também não cede a tecla.
const TECLAS_FIREFOX: TeclasSugeridas = {
  ...TECLAS_CHROMIUM,
  linux: 'Alt+Shift+P',
}

export const TECLAS_DO_MANIFESTO = {
  chromium: TECLAS_CHROMIUM,
  firefox: TECLAS_FIREFOX,
} as const

// No Mac o Chrome lê o Ctrl do suggested_key como Command; o Control é MacCtrl.
const SIMBOLO_NO_MAC: ReadonlyMap<string, string> = new Map([
  ['Alt', '⌥'],
  ['Shift', '⇧'],
  ['Ctrl', '⌘'],
  ['Command', '⌘'],
  ['MacCtrl', '⌃'],
])

export function teclaNoMac(tecla: string): string {
  return tecla
    .split('+')
    .map((parte) => SIMBOLO_NO_MAC.get(parte) ?? parte)
    .join('')
}

function porSistema(teclas: TeclasSugeridas): Record<Sistema, string> {
  return {
    windows: teclas.default,
    mac: teclaNoMac(teclas.mac),
    linux: teclas.linux ?? teclas.default,
  }
}

export const ATALHOS: Record<Loja, Record<Sistema, string>> = {
  chrome: porSistema(TECLAS_CHROMIUM),
  edge: porSistema(TECLAS_CHROMIUM),
  opera: porSistema(TECLAS_CHROMIUM),
  firefox: porSistema(TECLAS_FIREFOX),
}
