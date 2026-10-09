import { render, screen, within } from '@testing-library/react'
import { URL_DA_DOCUMENTACAO } from '@/lib/conteudo'
import { CONVITE, PERSONAS } from '@/lib/personas'
import { ParaQuem } from './para-quem'

function renderizar() {
  render(<ParaQuem />)
  return screen.getByRole('region', { name: 'Cada um entra pela sua porta.' })
}

function cartoes(secao: HTMLElement) {
  const [grade] = within(secao).getAllByRole('list')
  return within(grade)
    .getAllByRole('listitem')
    .filter((li) => li.parentElement === grade)
}

describe('ParaQuem', () => {
  it('é a seção 04, com a âncora do cabeçalho e sem apoio', () => {
    const secao = renderizar()
    expect(secao).toHaveAttribute('id', 'para-quem')
    expect(secao).toHaveAttribute('aria-labelledby', 'quem-titulo')
    expect(within(secao).getByText('04')).toBeInTheDocument()
  })

  it('cinco personas e o convite, numa grade só', () => {
    const secao = renderizar()
    expect(cartoes(secao)).toHaveLength(PERSONAS.length + 1)
    expect(
      within(secao)
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent),
    ).toEqual([
      'QA manual',
      'Dev frontend',
      'QA de automação',
      'Backend semeando banco',
      'CI',
    ])
  })

  it('cada persona leva as etiquetas e os itens dela', () => {
    const secao = renderizar()
    const lis = cartoes(secao)
    PERSONAS.forEach((persona, i) => {
      const cartao = within(lis[i])
      expect(
        cartao.getByRole('list', { name: 'Etiquetas' }).querySelectorAll('li'),
      ).toHaveLength(persona.etiquetas.length)
      for (const etiqueta of persona.etiquetas)
        expect(cartao.getByText(etiqueta)).toBeInTheDocument()
      const itens = cartao
        .getAllByRole('list')
        .find((ul) => !ul.hasAttribute('aria-label')) as HTMLElement
      expect(
        within(itens)
          .getAllByRole('listitem')
          .map((li) => li.textContent),
      ).toEqual(persona.itens.map((item) => item.replaceAll('`', '')))
    })
  })

  // Trecho entre crases sai em <code>, e a crase não aparece.
  it('o trecho de código vira <code>', () => {
    const secao = renderizar()
    expect(
      Array.from(secao.querySelectorAll('code'), (c) => c.textContent),
    ).toEqual([
      'Botão direito › Botaí › Preencher com',
      'Botão direito › Botaí › Inserir',
      'botai.preencher(page)',
      '--uf PI',
    ])
    expect(secao).not.toHaveTextContent('`')
  })

  it('o texto honesto: maska, caixa pública e nada de react-number-format', () => {
    const secao = renderizar()
    expect(secao).toHaveTextContent(
      'Funciona com React, Vue e máscaras (imask, jQuery Mask e maska).',
    )
    expect(secao).toHaveTextContent(
      '“Abrir caixa de entrada” abre a caixa pública, onde chega o e-mail de confirmação.',
    )
    expect(secao).not.toHaveTextContent(/react-number-format/)
  })

  it('o convite não é título e leva à documentação', () => {
    const secao = renderizar()
    const convite = within(cartoes(secao).at(-1) as HTMLElement)
    expect(convite.queryByRole('heading')).toBeNull()
    expect(convite.getByText(CONVITE.titulo).tagName).toBe('P')
    expect(convite.getByText(CONVITE.texto)).toBeInTheDocument()
    expect(
      convite.getByRole('link', { name: 'docs.botai.pilutech.com.br' }),
    ).toHaveAttribute('href', URL_DA_DOCUMENTACAO)
  })
})
