/** @jest-environment jsdom */
import { montarPessoa } from '../pessoa'
import { sfc32 } from '../prng'
import { criarContornos } from './contornos'
import type { RaizSombra } from './dom'
import { garantirCssEscape, simularLayout } from './layout-teste'
import { contarIframesDeFora, preencherDocumento } from './preencher'
import { criarRegistro } from './registro'

garantirCssEscape()

const HOJE = '2026-10-01'
const P = montarPessoa(sfc32(1, 2, 3, 4), HOJE)
const FORMULARIO = `
<form>
  <fieldset><legend>Seus dados</legend>
    <label>Nome completo <input name="nome"></label>
    <label>E-mail <input type="email" name="email"></label>
    <label for="cpf">CPF</label><input id="cpf" name="cpf" maxlength="11">
    <label>Senha <input type="password" name="senha" maxlength="6"></label>
  </fieldset>
  <label>Código de indicação <input name="ref_code" placeholder="opcional"></label>
  <div aria-hidden="true" style="position:absolute;left:-5000px"><input name="b_isca" tabindex="-1"></div>
  <input type="hidden" name="csrf" value="x">
  <input type="search" name="q" placeholder="Buscar">
  <label>Cidade <input name="cidade" disabled></label>
  <label><input type="checkbox" name="termos"> Aceito os termos</label>
</form>`

let desfazerLayout: () => void

beforeEach(() => {
  desfazerLayout = simularLayout()
  document.body.innerHTML = FORMULARIO
})

afterEach(() => {
  desfazerLayout()
  document.body.innerHTML = ''
})

const campo = (nome: string) =>
  document.querySelector(`[name="${nome}"]`) as HTMLInputElement
const semIdx = (linhas: { rotulo: string; seletor: string }[]) =>
  linhas.map(({ rotulo, seletor }) => ({ rotulo, seletor }))

function preencher(
  raiz: Document | Element = document,
  raizSombra?: RaizSombra,
) {
  const registro = criarRegistro()
  const contornos = criarContornos((acao, ms) => setTimeout(acao, ms))
  return {
    resultado: preencherDocumento({
      raiz,
      pessoa: P,
      hojeISO: HOJE,
      registro,
      contornos,
      raizSombra,
    }),
    registro,
  }
}

describe('preencherDocumento', () => {
  it('conta X de Y: preenche os reconhecidos, recusa a senha que não cabe e lista o não reconhecido', () => {
    const { resultado } = preencher()
    expect(semIdx(resultado.preenchidos)).toEqual([
      { rotulo: 'Nome completo', seletor: 'input[name="nome"]' },
      { rotulo: 'E-mail', seletor: 'input[name="email"]' },
      { rotulo: 'CPF', seletor: 'input#cpf' },
    ])
    expect(semIdx(resultado.recusados)).toEqual([
      { rotulo: 'Senha', seletor: 'input[name="senha"]' },
    ])
    expect(semIdx(resultado.naoReconhecidos)).toEqual([
      { rotulo: 'Código de indicação', seletor: 'input[name="ref_code"]' },
    ])
    expect(resultado).toMatchObject({
      contentType: 'text/html',
      iframesDeFora: 0,
    })
    expect(campo('nome').value).toBe(P.nome.completo)
    expect(campo('email').value).toBe(P.email.endereco)
  })

  it('CPF com maxlength 11 recebe só os dígitos', () => {
    preencher()
    expect(campo('cpf').value).toBe(P.cpf.replace(/\D/g, ''))
  })

  it('senha maior que o maxlength não é truncada nem escrita', () => {
    preencher()
    expect(campo('senha').value).toBe('')
  })

  it('honeypot, hidden, busca, desabilitado e checkbox ficam fora da conta e intocados', () => {
    const { resultado } = preencher()
    expect([
      ...resultado.preenchidos,
      ...resultado.naoReconhecidos,
      ...resultado.recusados,
    ]).toHaveLength(5)
    expect(campo('b_isca').value).toBe('')
    expect(campo('csrf').value).toBe('x')
    expect(campo('q').value).toBe('')
    expect(campo('cidade').value).toBe('')
    expect(campo('termos').checked).toBe(false)
  })

  it('campo que já tem o valor certo não recebe input de novo e conta como preenchido', () => {
    campo('nome').value = P.nome.completo
    const ouvinte = jest.fn()
    campo('nome').addEventListener('input', ouvinte)
    const { resultado } = preencher()
    expect(ouvinte).not.toHaveBeenCalled()
    expect(resultado.preenchidos.map((l) => l.rotulo)).toContain(
      'Nome completo',
    )
  })

  it('select reconhecido sem a opção da pessoa vai para recusados, sem escolher outra nem disparar change', () => {
    document.body.innerHTML = `
      <label>Estado <select name="uf">
        <option value="">Selecione</option>
        <option value="ZZ">Zzzlândia</option>
      </select></label>`
    const uf = document.querySelector('select') as HTMLSelectElement
    const ouvinte = jest.fn()
    uf.addEventListener('change', ouvinte)
    const { resultado } = preencher()
    expect(semIdx(resultado.recusados)).toEqual([
      { rotulo: 'Estado', seletor: 'select[name="uf"]' },
    ])
    expect(resultado.naoReconhecidos).toEqual([])
    expect(resultado.preenchidos).toEqual([])
    expect(uf.value).toBe('')
    expect(ouvinte).not.toHaveBeenCalled()
    expect(uf.style.getPropertyValue('outline')).toBe('2px dashed #f5b82e')
  })

  it('campo sem label usa o aria-label como rótulo, e o label visível vence o aria-label', () => {
    document.body.innerHTML = `
      <input aria-label="Cupom de desconto" name="c1" placeholder="ABC123">
      <label>Apelido <input aria-label="ap-x" name="ap"></label>`
    const { resultado } = preencher()
    const rotulos = [
      ...resultado.preenchidos,
      ...resultado.naoReconhecidos,
      ...resultado.recusados,
    ]
      .sort((a, b) => a.idx - b.idx)
      .map((l) => l.rotulo)
    expect(rotulos).toEqual(['Cupom de desconto', 'Apelido'])
  })

  it('campo cuja página desfaz o valor vai para recusados', () => {
    campo('email').addEventListener('input', () => {
      campo('email').value = ''
    })
    const { resultado } = preencher()
    expect(semIdx(resultado.recusados)).toContainEqual({
      rotulo: 'E-mail',
      seletor: 'input[name="email"]',
    })
  })

  it('idx segue a ordem do DOM e o registro devolve o elemento', () => {
    const { resultado, registro } = preencher()
    const linhas = [
      ...resultado.preenchidos,
      ...resultado.recusados,
      ...resultado.naoReconhecidos,
    ].sort((a, b) => a.idx - b.idx)
    expect(linhas.map((l) => l.seletor)).toEqual([
      'input[name="nome"]',
      'input[name="email"]',
      'input#cpf',
      'input[name="senha"]',
      'input[name="ref_code"]',
    ])
    expect(registro.buscar(linhas[0].idx)).toBe(campo('nome'))
  })

  it('contorna em ciano os preenchidos e em âmbar os demais, sem tirar o foco de onde está', () => {
    preencher()
    expect(campo('nome').style.getPropertyValue('outline')).toBe(
      '2px solid #38bdf8',
    )
    expect(campo('senha').style.getPropertyValue('outline')).toBe(
      '2px dashed #f5b82e',
    )
    expect(campo('ref_code').style.getPropertyValue('outline')).toBe(
      '2px dashed #f5b82e',
    )
    expect(campo('csrf').style.getPropertyValue('outline')).toBe('')
    expect(document.activeElement).toBe(document.body)
  })

  it('entra em shadow root e prefixa o seletor com o host', () => {
    document.body.innerHTML = '<x-campo></x-campo>'
    const raiz = (
      document.querySelector('x-campo') as HTMLElement
    ).attachShadow({ mode: 'open' })
    raiz.innerHTML = '<label>CPF <input name="cpf"></label>'
    const { resultado } = preencher()
    expect(semIdx(resultado.preenchidos)).toEqual([
      { rotulo: 'CPF', seletor: 'x-campo › input[name="cpf"]' },
    ])
    expect((raiz.querySelector('input') as HTMLInputElement).value).toBe(P.cpf)
  })

  it('avisa cada campo que escreveu, com o valor lido logo depois; não avisa o que já estava certo nem o recusado', () => {
    campo('nome').value = P.nome.completo
    const escritos: { nome: string; valor: string; lido: string }[] = []
    preencherDocumento({
      raiz: document,
      pessoa: P,
      hojeISO: HOJE,
      registro: criarRegistro(),
      contornos: criarContornos((acao, ms) => setTimeout(acao, ms)),
      aoEscrever: (e) =>
        escritos.push({ nome: e.el.name, valor: e.valor, lido: e.lido }),
    })
    const cpfSoDigitos = P.cpf.replace(/\D/g, '')
    expect(escritos).toEqual([
      { nome: 'email', valor: P.email.endereco, lido: P.email.endereco },
      { nome: 'cpf', valor: cpfSoDigitos, lido: cpfSoDigitos },
    ])
  })

  it('raiz Element preenche só os campos dentro dela', () => {
    document.body.innerHTML =
      '<form id="a"><label>Nome completo <input name="nome"></label></form><form id="b"><label>E-mail <input type="email" name="email"></label></form>'
    const { resultado } = preencher(document.getElementById('a') as HTMLElement)
    expect(semIdx(resultado.preenchidos)).toEqual([
      { rotulo: 'Nome completo', seletor: 'input[name="nome"]' },
    ])
    expect(campo('nome').value).toBe(P.nome.completo)
    expect(campo('email').value).toBe('')
  })

  it('raiz que é o próprio campo preenche só ele', () => {
    const { resultado } = preencher(campo('email'))
    expect(semIdx(resultado.preenchidos)).toEqual([
      { rotulo: 'E-mail', seletor: 'input[name="email"]' },
    ])
    expect(campo('nome').value).toBe('')
  })

  it('o adaptador recebido abre a shadow root fechada; sem ele, ela fica de fora', () => {
    document.body.innerHTML = '<x-campo></x-campo>'
    const host = document.querySelector('x-campo') as HTMLElement
    const fechada = host.attachShadow({ mode: 'closed' })
    fechada.innerHTML = '<label>CPF <input name="cpf"></label>'
    expect(preencher().resultado.preenchidos).toEqual([])
    const { resultado } = preencher(document, (el) =>
      el === host ? fechada : el.shadowRoot,
    )
    expect(semIdx(resultado.preenchidos)).toEqual([
      { rotulo: 'CPF', seletor: 'x-campo › input[name="cpf"]' },
    ])
  })
})

describe('contarIframesDeFora', () => {
  it('conta os iframes cujo documento o script não alcança', () => {
    document.body.innerHTML =
      '<iframe id="mesma"></iframe><iframe id="outra"></iframe>'
    Object.defineProperty(document.getElementById('outra'), 'contentDocument', {
      value: null,
    })
    expect(contarIframesDeFora(document)).toBe(1)
  })

  it('com raiz Element, conta só os de dentro dela', () => {
    document.body.innerHTML =
      '<form id="f"><iframe id="dentro"></iframe></form><iframe id="fora"></iframe>'
    for (const id of ['dentro', 'fora'])
      Object.defineProperty(document.getElementById(id), 'contentDocument', {
        value: null,
      })
    expect(
      contarIframesDeFora(document.getElementById('f') as HTMLElement),
    ).toBe(1)
  })
})
