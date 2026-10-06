/** @jest-environment jsdom */
import type { Campo } from './dom'
import {
  agendarSegundaPassada,
  regravarAlterados,
  SEGUNDA_PASSADA_MS,
  type Escrito,
} from './segunda-passada'

beforeEach(() => {
  document.body.innerHTML =
    '<input name="complemento"><input name="rua"><input name="cep">'
})

afterEach(() => {
  jest.useRealTimers()
  document.body.innerHTML = ''
})

const campo = (nome: string) =>
  document.querySelector(`[name="${nome}"]`) as HTMLInputElement

// Simula o que preencherDocumento entrega: o campo já escrito, com o valor lido logo depois.
function escrito(nome: string, valor: string): Escrito {
  campo(nome).value = valor
  return { el: campo(nome), valor, lido: campo(nome).value }
}

describe('regravarAlterados', () => {
  it('regrava o campo que o site mudou depois da nossa escrita, com os eventos de input', () => {
    const complemento = escrito('complemento', 'Apto 81')
    const ouvinte = jest.fn()
    campo('complemento').addEventListener('input', ouvinte)
    campo('complemento').value = 'de 612 a 1510 - lado par'
    regravarAlterados([complemento])
    expect(campo('complemento').value).toBe('Apto 81')
    expect(ouvinte).toHaveBeenCalledTimes(1)
  })

  it('não toca no campo que ficou como estava, nem dispara de novo a busca de CEP', () => {
    const cep = escrito('cep', '01310-100')
    const busca = jest.fn()
    campo('cep').addEventListener('input', busca)
    regravarAlterados([cep])
    expect(busca).not.toHaveBeenCalled()
  })

  it('compara com o valor lido, não com o escrito: máscara que reformatou na hora não conta como mudança', () => {
    campo('cep').value = '01310-100'
    const cep: Escrito = {
      el: campo('cep'),
      valor: '01310100',
      lido: '01310-100',
    }
    const busca = jest.fn()
    campo('cep').addEventListener('input', busca)
    regravarAlterados([cep])
    expect(busca).not.toHaveBeenCalled()
    expect(campo('cep').value).toBe('01310-100')
  })

  it('ignora campo que saiu da página ou ficou desabilitado', () => {
    const rua = escrito('rua', 'Avenida Paulista')
    const complemento = escrito('complemento', 'Apto 81')
    const ruaSolta = campo('rua')
    ruaSolta.value = 'outra'
    ruaSolta.remove()
    campo('complemento').value = 'outro'
    campo('complemento').disabled = true
    expect(() => regravarAlterados([rua, complemento])).not.toThrow()
    expect(ruaSolta.value).toBe('outra')
    expect(campo('complemento').value).toBe('outro')
  })

  it('ignora campo que o site travou depois da busca: fieldset desabilitado ou readonly', () => {
    // el.disabled só reflete o atributo do próprio campo; o <fieldset disabled> desabilita sem tocá-lo.
    const complemento = escrito('complemento', 'Apto 81')
    const rua = escrito('rua', 'Avenida Paulista')
    const fieldset = document.createElement('fieldset')
    document.body.append(fieldset)
    fieldset.append(campo('complemento'))
    campo('complemento').value = 'de 612 a 1510 - lado par'
    fieldset.disabled = true
    campo('rua').value = 'Av. Paulista'
    campo('rua').readOnly = true
    const ouvinte = jest.fn()
    document.body.addEventListener('input', ouvinte)
    regravarAlterados([complemento, rua])
    expect(campo('complemento').value).toBe('de 612 a 1510 - lado par')
    expect(campo('rua').value).toBe('Av. Paulista')
    expect(ouvinte).not.toHaveBeenCalled()
  })
})

describe('agendarSegundaPassada', () => {
  it('agenda uma passada só, ~1 s depois', () => {
    jest.useFakeTimers()
    const complemento = escrito('complemento', 'Apto 81')
    void agendarSegundaPassada([complemento], (acao, ms) => {
      setTimeout(acao, ms)
    })
    campo('complemento').value = 'de 612 a 1510 - lado par'
    jest.advanceTimersByTime(SEGUNDA_PASSADA_MS - 1)
    expect(campo('complemento').value).toBe('de 612 a 1510 - lado par')
    jest.advanceTimersByTime(1)
    expect(campo('complemento').value).toBe('Apto 81')
  })

  it('a Promise só resolve depois da regravação', async () => {
    jest.useFakeTimers()
    const complemento = escrito('complemento', 'Apto 81')
    let resolveu = false
    const promessa = agendarSegundaPassada([complemento], (acao, ms) => {
      setTimeout(acao, ms)
    }).then(() => {
      resolveu = true
    })
    campo('complemento').value = 'de 612 a 1510 - lado par'
    await Promise.resolve()
    expect(resolveu).toBe(false)
    jest.advanceTimersByTime(SEGUNDA_PASSADA_MS)
    await promessa
    expect(resolveu).toBe(true)
    expect(campo('complemento').value).toBe('Apto 81')
  })

  it('sem nada escrito não agenda nada e resolve na hora', async () => {
    const agendar = jest.fn()
    await expect(agendarSegundaPassada([], agendar)).resolves.toBeUndefined()
    expect(agendar).not.toHaveBeenCalled()
  })

  it('se a regravação lança, a Promise rejeita em vez de ficar pendurada', async () => {
    jest.useFakeTimers()
    const quebrado = {
      get isConnected(): boolean {
        throw new Error('campo quebrado')
      },
    } as unknown as Campo
    const promessa = agendarSegundaPassada(
      [{ el: quebrado, valor: 'x', lido: 'y' }],
      (acao, ms) => {
        setTimeout(acao, ms)
      },
    )
    jest.advanceTimersByTime(SEGUNDA_PASSADA_MS)
    await expect(promessa).rejects.toThrow('campo quebrado')
  })
})
