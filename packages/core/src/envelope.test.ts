import {
  envelopar,
  FORMATO,
  gerarEnvelopeDaPessoa,
  gerarEnvelopeDasPessoas,
} from './envelope'
import { gerarPessoa, gerarPessoas } from './gerar'
import { MOTOR } from './versao'

const HOJE = '2026-10-05'

describe('envelopes', () => {
  test('FORMATO é 1', () => {
    expect(FORMATO).toBe(1)
  })

  test('envelope da pessoa: formato, motor, semente em texto, hoje e a pessoa', () => {
    expect(gerarEnvelopeDaPessoa({ semente: 42, hoje: HOJE })).toEqual({
      formato: 1,
      motor: MOTOR,
      semente: '42',
      hoje: HOJE,
      pessoa: gerarPessoa({ semente: 42, hoje: HOJE }),
    })
  })

  test('sem semente e sem hoje, o envelope traz o que reproduz a pessoa', () => {
    const e = gerarEnvelopeDaPessoa()
    expect(e.semente).toMatch(/^[0-9a-f]{16}$/)
    expect(e.hoje).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(gerarPessoa({ semente: e.semente, hoje: e.hoje })).toEqual(e.pessoa)
  })

  test('semente em NFD fica registrada em NFC', () => {
    expect(
      gerarEnvelopeDaPessoa({ semente: 'Sa\u0303o', hoje: HOJE }).semente,
    ).toBe('S\u00e3o')
  })

  test('envelope do lote: a semente do lote e as pessoas em ordem', () => {
    expect(gerarEnvelopeDasPessoas(3, { semente: 'lote', hoje: HOJE })).toEqual(
      {
        formato: 1,
        motor: MOTOR,
        semente: 'lote',
        hoje: HOJE,
        pessoas: gerarPessoas(3, { semente: 'lote', hoje: HOJE }),
      },
    )
  })

  test('lote sem semente: a semente sorteada reproduz o lote', () => {
    const e = gerarEnvelopeDasPessoas(3, { hoje: HOJE })
    expect(gerarPessoas(3, { semente: e.semente, hoje: HOJE })).toEqual(
      e.pessoas,
    )
  })

  test('envelopar monta o envelope de uma pessoa do lote', () => {
    const pessoa = gerarPessoa({ semente: 'lote/0', hoje: HOJE })
    expect(envelopar('lote/0', HOJE, pessoa)).toEqual({
      formato: 1,
      motor: MOTOR,
      semente: 'lote/0',
      hoje: HOJE,
      pessoa,
    })
  })
})
