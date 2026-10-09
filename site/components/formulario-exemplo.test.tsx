import { act, render, screen, within } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { PESSOA_DO_EXEMPLO } from '@/lib/exemplo'
import { FormularioExemplo } from './formulario-exemplo'

const NOME_DA_FIGURA = 'Exemplo: um cadastro preenchido pela extensão'

function renderizar() {
  render(<FormularioExemplo />)
  return screen.getByRole('figure', { name: NOME_DA_FIGURA })
}

afterEach(() => {
  jest.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('FormularioExemplo', () => {
  it('é uma figura com legenda para leitor de tela', () => {
    expect(renderizar().querySelector('figcaption')).toHaveClass('sr-only')
  })

  it('a barra: o endereço do cadastro e a tecla do atalho', () => {
    const figura = renderizar()
    expect(
      within(figura).getByText('localhost:3000/cadastro'),
    ).toBeInTheDocument()
    expect(figura.querySelector('kbd')).not.toBeNull()
  })

  // Nada escrito à mão: os seis campos saem da PESSOA_DO_EXEMPLO.
  it('os seis campos, com os valores da pessoa da semente 42', () => {
    const figura = within(renderizar())
    expect(figura.getByText('Criar conta')).toBeInTheDocument()
    const p = PESSOA_DO_EXEMPLO
    const campos: [string, string][] = [
      ['Nome completo', p.nome.completo],
      ['E-mail', p.email.endereco],
      ['CPF', p.cpf],
      ['Celular', p.celular.formatado],
      ['CEP', p.endereco.cep],
      ['Cidade', `${p.endereco.cidade} · ${p.endereco.uf}`],
    ]
    for (const [rotulo, valor] of campos)
      expect(figura.getByText(rotulo).nextElementSibling).toHaveTextContent(
        valor,
      )
    expect(figura.getByText('Cidade').nextElementSibling).toHaveTextContent(
      'São Luís · MA',
    )
  })

  // Os campos são ilustração: nada de input que o leitor de tela anuncie como editável.
  it('os campos são texto, não inputs', () => {
    const figura = renderizar()
    expect(within(figura).queryAllByRole('textbox')).toEqual([])
    expect(figura.querySelector('input')).toBeNull()
  })

  // A extensão sorteia com crypto, sem semente: o rodapé não fala dela.
  it('o rodapé diz «6 de 6 campos preenchidos», sem semente', () => {
    const figura = renderizar()
    expect(within(figura).getByText('6 de 6 campos preenchidos')).toHaveClass(
      'text-ok',
    )
    expect(figura).not.toHaveTextContent(/semente/i)
  })

  it('o HTML do servidor traz a tecla do Windows', () => {
    const raiz = document.createElement('div')
    raiz.innerHTML = renderToString(<FormularioExemplo />)
    expect(raiz.querySelector('kbd')).toHaveTextContent('Ctrl+Shift+Y')
  })

  it('no Mac, depois da hidratação, ⌥⇧P, sem erro', async () => {
    jest.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    const raiz = document.createElement('div')
    raiz.innerHTML = renderToString(<FormularioExemplo />)
    document.body.append(raiz)
    const erro = jest.spyOn(console, 'error').mockImplementation(() => {})
    await act(async () => {
      hydrateRoot(raiz, <FormularioExemplo />)
    })
    expect(raiz.querySelector('kbd')).toHaveTextContent('⌥⇧P')
    expect(erro).not.toHaveBeenCalled()
  })
})
