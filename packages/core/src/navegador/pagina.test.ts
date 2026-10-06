/** @jest-environment jsdom */
import { montarPessoa } from '../pessoa'
import { sfc32 } from '../prng'
import { garantirCssEscape, simularLayout } from './layout-teste'
import {
  instalarNoGlobal,
  NOME_DO_GLOBAL,
  preencherNaPagina,
  type ApiDoNavegador,
} from './pagina'
import { SEGUNDA_PASSADA_MS } from './segunda-passada'

garantirCssEscape()

const HOJE = '2026-10-01'
const P = montarPessoa(sfc32(1, 2, 3, 4), HOJE)
let desfazerLayout: () => void

beforeEach(() => {
  desfazerLayout = simularLayout()
  document.body.innerHTML =
    '<form id="endereco"><label>Complemento <input name="complemento"></label></form><label>Nome completo <input name="nome"></label>'
})

afterEach(() => {
  jest.useRealTimers()
  desfazerLayout()
  document.body.innerHTML = ''
})

const campo = (nome: string) =>
  document.querySelector(`[name="${nome}"]`) as HTMLInputElement

describe('preencherNaPagina', () => {
  it('só resolve depois da 2ª passada, que desfaz o que o site sobrescreveu', async () => {
    jest.useFakeTimers()
    let resolveu = false
    const promessa = preencherNaPagina(document, P, HOJE, {
      segundaPassada: true,
    }).then((resultado) => {
      resolveu = true
      return resultado
    })
    campo('complemento').value = 'de 612 a 1510 - lado par'
    await Promise.resolve()
    expect(resolveu).toBe(false)
    jest.advanceTimersByTime(SEGUNDA_PASSADA_MS)
    const resultado = await promessa
    expect(campo('complemento').value).toBe(P.endereco.complemento)
    expect(resultado.preenchidos.map((l) => l.rotulo)).toEqual([
      'Complemento',
      'Nome completo',
    ])
  })

  it('com segundaPassada false resolve sem agendar nada', async () => {
    jest.useFakeTimers()
    const resultado = await preencherNaPagina(document, P, HOJE, {
      segundaPassada: false,
    })
    expect(jest.getTimerCount()).toBe(0)
    expect(resultado.preenchidos).toHaveLength(2)
  })

  it('não pinta contorno nenhum', async () => {
    await preencherNaPagina(document, P, HOJE, { segundaPassada: false })
    expect(campo('nome').style.getPropertyValue('outline')).toBe('')
    expect(campo('complemento').style.getPropertyValue('outline')).toBe('')
  })

  it('com um Element, preenche só dentro dele', async () => {
    const resultado = await preencherNaPagina(
      document.getElementById('endereco') as HTMLElement,
      P,
      HOJE,
      { segundaPassada: false },
    )
    expect(resultado.preenchidos.map((l) => l.rotulo)).toEqual(['Complemento'])
    expect(campo('nome').value).toBe('')
  })
})

describe('instalarNoGlobal', () => {
  it('pendura a API num nome só, __botaiNavegador', () => {
    const alvo: Record<string, unknown> = {}
    instalarNoGlobal(alvo)
    expect(NOME_DO_GLOBAL).toBe('__botaiNavegador')
    expect(Object.keys(alvo)).toEqual([NOME_DO_GLOBAL])
    expect((alvo[NOME_DO_GLOBAL] as ApiDoNavegador).preencher).toBe(
      preencherNaPagina,
    )
  })
})
