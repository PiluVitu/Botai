import { hojeEmSaoPaulo } from './hoje'

describe('hojeEmSaoPaulo', () => {
  test('usa o dia civil de São Paulo, não o de UTC', () => {
    expect(hojeEmSaoPaulo(new Date('2026-10-02T02:30:00Z'))).toBe('2026-10-01')
    expect(hojeEmSaoPaulo(new Date('2026-10-01T03:00:00Z'))).toBe('2026-10-01')
    expect(hojeEmSaoPaulo(new Date('2026-10-01T02:59:59Z'))).toBe('2026-09-30')
  })

  test('vira o ano à meia-noite de Brasília', () => {
    expect(hojeEmSaoPaulo(new Date('2027-01-01T02:59:59Z'))).toBe('2026-12-31')
    expect(hojeEmSaoPaulo(new Date('2027-01-01T03:00:00Z'))).toBe('2027-01-01')
  })

  test('sem argumento devolve a data de agora no formato AAAA-MM-DD', () => {
    expect(hojeEmSaoPaulo()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
