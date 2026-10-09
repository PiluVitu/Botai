import { render, screen, within } from '@testing-library/react'
import { CAPTURAS } from '@/lib/capturas'
import { REQUISITOS_DA_EXTENSAO } from '@/lib/extensao'
import { botoesDasLojas } from '@/lib/modelo'
import { Extensao } from './extensao'

const SEM_LOJA = { chromeUrl: '', firefoxUrl: '', edgeUrl: '', operaUrl: '' }
const NO_AR = botoesDasLojas({
  ...SEM_LOJA,
  chromeUrl: 'https://chromewebstore.google.com/detail/botai/abc',
  firefoxUrl: 'https://addons.mozilla.org/pt-BR/firefox/addon/botai/',
})

function renderizar(lojas = NO_AR) {
  const resultado = render(<Extensao lojas={lojas} />)
  const secao = screen.getByRole('region', { name: 'Bota aí no navegador.' })
  return { ...resultado, secao, dentro: within(secao) }
}

describe('Extensao', () => {
  // O cabeçalho leva a #extensao, e o E2E do tema procura as capturas dentro dela.
  it('é a seção #extensao, com a sobrelinha 06', () => {
    const { secao, dentro } = renderizar()
    expect(secao).toHaveAttribute('id', 'extensao')
    expect(secao).toHaveClass('scroll-mt-6')
    expect(dentro.getByText('Extensão').tagName).toBe('P')
    expect(dentro.getByText('06')).toBeInTheDocument()
    expect(
      dentro.getByRole('heading', { level: 2, name: 'Bota aí no navegador.' }),
    ).toHaveAttribute('id', 'extensao-titulo')
  })

  // A 4ª frase é a dos favoritos da 1.1.0: até 3, com apelido, no popup e no "Preencher com".
  it('o que a extensão faz, em quatro frases', () => {
    const { dentro } = renderizar()
    expect(
      dentro.getByText(
        'Um atalho preenche a página inteira. O botão direito põe um dado num campo só. A mesma pessoa fica guardada até você pedir outra. Até 3 pessoas favoritas, cada uma com um apelido, voltam pelo popup ou pelo botão direito.',
      ),
    ).toBeInTheDocument()
  })

  it('a lista das lojas fica dentro da seção, e os requisitos logo abaixo', () => {
    const { dentro } = renderizar()
    const lista = dentro.getByRole('list', { name: 'Instalar pela loja' })
    const requisitos = dentro.getByText(REQUISITOS_DA_EXTENSAO)
    expect(
      lista.compareDocumentPosition(requisitos) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      dentro.getByRole('link', { name: 'Firefox Add-ons' }),
    ).toHaveAttribute('target', '_blank')
    expect(dentro.getByText('em revisão')).toBeInTheDocument()
  })

  it('sem loja publicada, nenhum botão e nenhum "disponível"', () => {
    const { dentro } = renderizar(botoesDasLojas(SEM_LOJA))
    expect(dentro.queryAllByRole('button')).toEqual([])
    expect(dentro.queryByText(/dispon[ií]vel/i)).toBeNull()
    expect(dentro.queryByText('Microsoft Edge Add-ons')).toBeNull()
  })

  it('a tabela de atalhos, numa região focável', () => {
    const { dentro } = renderizar()
    expect(
      dentro.getByRole('region', { name: 'Atalhos por sistema' }),
    ).toHaveAttribute('tabindex', '0')
  })

  it('a captura 01/02 numa figura com legenda, lazy e sem prioridade', () => {
    const { secao, dentro } = renderizar()
    const figura = dentro.getByRole('figure')
    expect(
      within(figura).getByText(
        'O popup mostra quantos campos entraram e lista os que ficaram de fora.',
      ).tagName,
    ).toBe('FIGCAPTION')
    const imagens = [...secao.querySelectorAll('figure img')]
    expect(imagens.map((img) => img.getAttribute('alt'))).toEqual([
      CAPTURAS[0].variantes.claro.alt,
      CAPTURAS[0].variantes.escuro.alt,
    ])
    for (const img of imagens) {
      expect(img).toHaveAttribute('loading', 'lazy')
      expect(img).not.toHaveAttribute('fetchpriority')
      expect(img).toHaveAttribute(
        'sizes',
        '(min-width: 1264px) 572px, (min-width: 900px) calc(48vw - 32px), calc(100vw - 32px)',
      )
    }
  })
})
