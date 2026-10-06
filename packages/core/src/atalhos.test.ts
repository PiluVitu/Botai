import { ATALHOS, TECLAS_DO_MANIFESTO, teclaNoMac } from './atalhos'

// É o suggested_key do manifesto da extensão (extensao/wxt.config.ts) e a tabela de atalhos da landing.
describe('TECLAS_DO_MANIFESTO', () => {
  it('Chromium: Ctrl+Shift+Y por padrão e Alt+Shift+P no Mac', () => {
    expect(TECLAS_DO_MANIFESTO.chromium).toEqual({
      default: 'Ctrl+Shift+Y',
      mac: 'Alt+Shift+P',
    })
  })

  // No Firefox para Linux, Ctrl+Shift+Y abre os Downloads e não é cedido.
  it('Firefox: igual, mais Alt+Shift+P no Linux', () => {
    expect(TECLAS_DO_MANIFESTO.firefox).toEqual({
      default: 'Ctrl+Shift+Y',
      mac: 'Alt+Shift+P',
      linux: 'Alt+Shift+P',
    })
  })
})

describe('teclaNoMac', () => {
  it('troca os modificadores pelos símbolos do macOS, na ordem do manifesto', () => {
    expect(teclaNoMac('Alt+Shift+P')).toBe('⌥⇧P')
  })

  // No Mac o Chrome lê o Ctrl do suggested_key como Command; o Control é MacCtrl.
  it('Ctrl vira ⌘ e MacCtrl vira ⌃', () => {
    expect(teclaNoMac('Ctrl+Shift+Y')).toBe('⌘⇧Y')
    expect(teclaNoMac('MacCtrl+Shift+Y')).toBe('⌃⇧Y')
  })
})

describe('ATALHOS', () => {
  it('Chromium: Ctrl+Shift+Y no Windows e no Linux, ⌥⇧P no Mac', () => {
    for (const navegador of ['chrome', 'edge', 'opera'] as const) {
      expect(ATALHOS[navegador]).toEqual({
        windows: 'Ctrl+Shift+Y',
        mac: '⌥⇧P',
        linux: 'Ctrl+Shift+Y',
      })
    }
  })

  it('Firefox: igual, mas Alt+Shift+P no Linux', () => {
    expect(ATALHOS.firefox).toEqual({
      windows: 'Ctrl+Shift+Y',
      mac: '⌥⇧P',
      linux: 'Alt+Shift+P',
    })
  })

  it('cobre as 4 lojas', () => {
    expect(Object.keys(ATALHOS).sort()).toEqual([
      'chrome',
      'edge',
      'firefox',
      'opera',
    ])
  })
})
