import { describe, expect, it } from 'vitest'
import { idadeEm } from './hoje'

describe('idadeEm', () => {
  it('só completa o ano no dia do aniversário', () => {
    expect(idadeEm('1993-05-29', '2026-05-28')).toBe(32)
    expect(idadeEm('1993-05-29', '2026-05-29')).toBe(33)
  })
})
