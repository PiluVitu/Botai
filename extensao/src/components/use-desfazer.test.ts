import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDesfazer } from './use-desfazer'

describe('useDesfazer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('guarda o que dá para desfazer por 5 s', () => {
    const { result } = renderHook(() => useDesfazer<string>())
    expect(result.current.valor).toBeNull()
    act(() => result.current.mostrar('admin do staging'))
    expect(result.current.valor).toBe('admin do staging')
    act(() => vi.advanceTimersByTime(4999))
    expect(result.current.valor).toBe('admin do staging')
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.valor).toBeNull()
  })

  it('outro aviso troca o anterior e recomeça a contagem', () => {
    const { result } = renderHook(() => useDesfazer<string>())
    act(() => result.current.mostrar('admin do staging'))
    act(() => vi.advanceTimersByTime(4000))
    act(() => result.current.mostrar('comprador PJ'))
    act(() => vi.advanceTimersByTime(4000))
    expect(result.current.valor).toBe('comprador PJ')
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.valor).toBeNull()
  })

  it('limpar apaga na hora', () => {
    const { result } = renderHook(() => useDesfazer<string>())
    act(() => result.current.mostrar('admin do staging'))
    act(() => result.current.limpar())
    expect(result.current.valor).toBeNull()
  })
})
