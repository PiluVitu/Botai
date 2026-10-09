import { render, screen, within } from '@testing-library/react'
import { ANCORAS_DA_LANDING } from '@/lib/conteudo'
import { modeloDaLanding } from '@/lib/modelo'
import { Landing } from './landing'

const SEM_LOJA = { chromeUrl: '', firefoxUrl: '', edgeUrl: '', operaUrl: '' }
const FIREFOX = 'https://addons.mozilla.org/pt-BR/firefox/addon/botai/'

function renderizar(urls = SEM_LOJA) {
  return render(<Landing {...modeloDaLanding(urls)} />)
}

describe('Landing', () => {
  it('um único h1, com o nome e o posicionamento', () => {
    renderizar()
    const [h1, ...outros] = screen.getAllByRole('heading', { level: 1 })
    expect(outros).toEqual([])
    expect(h1).toHaveTextContent(
      'Botaí: Dados de teste brasileiros em todo lugar que o seu teste roda.',
    )
  })

  it('as seções da v2, na ordem do design', () => {
    renderizar()
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent),
    ).toEqual([
      'Um motor, oito portas.',
      'Mesma semente, mesma pessoa.',
      'Uma pessoa onde tudo bate.',
      'Cada um entra pela sua porta.',
      'O que foi testado, e o que ainda não.',
      'Bota aí no navegador.',
      'Fictício, mas com cuidado.',
      'Botaí no seu teste.',
    ])
    expect(screen.getByRole('region', { name: 'Números' })).toBeInTheDocument()
  })

  it('as âncoras do cabeçalho levam a seções que existem, na ordem da página', () => {
    renderizar()
    const ancoras = within(screen.getByRole('banner'))
      .getAllByRole('link')
      .map((a) => a.getAttribute('href') as string)
      .filter((href) => href.startsWith('#') && href !== '#topo')
    expect(ancoras).toEqual(ANCORAS_DA_LANDING.map(({ id }) => `#${id}`))
    const secoes = ancoras.map((alvo) => document.getElementById(alvo.slice(1)))
    for (const secao of secoes) expect(secao?.tagName).toBe('SECTION')
    for (let i = 1; i < secoes.length; i++)
      expect(
        (secoes[i - 1] as Node).compareDocumentPosition(secoes[i] as Node) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
  })

  // O main é a coluna: o hero e as 10 seções; cabeçalho e rodapé ficam fora dele.
  it('o main tem o hero, os números e as seções; o cabeçalho e o rodapé ficam fora', () => {
    renderizar()
    const main = screen.getByRole('main')
    expect(
      [...main.children].map(
        (secao) =>
          secao.getAttribute('aria-labelledby') ??
          secao.getAttribute('aria-label'),
      ),
    ).toEqual([
      'hero-titulo',
      'Números',
      'portas-titulo',
      'semente-titulo',
      'pessoa-titulo',
      'quem-titulo',
      'integracoes-titulo',
      'extensao-titulo',
      'cuidados-titulo',
      'final-titulo',
    ])
    expect(main).not.toContainElement(screen.getByRole('banner'))
    expect(main).not.toContainElement(screen.getByRole('contentinfo'))
  })

  it('o «Instalar a extensão» do hero leva à seção Extensão', () => {
    renderizar()
    expect(
      screen.getByRole('link', { name: 'Instalar a extensão' }),
    ).toHaveAttribute('href', '#extensao')
  })

  it('a marca leva ao início da página', () => {
    renderizar()
    expect(
      within(screen.getByRole('banner')).getByRole('link', {
        name: 'Botaí, início',
      }),
    ).toHaveAttribute('href', '#topo')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'topo')
  })

  it('o cabeçalho e o rodapé levam à documentação', () => {
    renderizar()
    for (const regiao of [
      screen.getByRole('banner'),
      screen.getByRole('contentinfo'),
    ])
      expect(
        within(regiao).getByRole('link', { name: 'Docs' }),
      ).toHaveAttribute('href', 'https://docs.botai.pilutech.com.br')
  })

  // As lojas ficam só na seção Extensão; nenhum texto diz "disponível".
  it('sem loja publicada: uma lista só, sem o Edge e sem "disponível"', () => {
    renderizar()
    const listas = screen.getAllByRole('list', { name: 'Instalar pela loja' })
    expect(listas).toHaveLength(1)
    expect(
      within(
        screen.getByRole('region', { name: 'Bota aí no navegador.' }),
      ).getByRole('list', { name: 'Instalar pela loja' }),
    ).toBe(listas[0])
    expect(screen.queryByText('Microsoft Edge Add-ons')).toBeNull()
    expect(screen.queryByText(/dispon[ií]vel/i)).toBeNull()
    expect(screen.queryAllByRole('link', { name: 'Firefox Add-ons' })).toEqual(
      [],
    )
  })

  it('com o Firefox publicado: um link, em aba nova', () => {
    renderizar({ ...SEM_LOJA, firefoxUrl: FIREFOX })
    const [link, ...outros] = screen.getAllByRole('link', {
      name: 'Firefox Add-ons',
    })
    expect(outros).toEqual([])
    expect(link).toHaveAttribute('href', FIREFOX)
    expect(link).toHaveAttribute('target', '_blank')
    expect(screen.queryByText(/dispon[ií]vel/i)).toBeNull()
  })

  it('os cuidados levam à política e aos termos, e o rodapé à PiluTech', () => {
    renderizar()
    const cuidados = within(
      screen.getByRole('region', { name: 'Fictício, mas com cuidado.' }),
    )
    expect(
      cuidados.getByRole('link', { name: 'Política de privacidade' }),
    ).toHaveAttribute('href', '/privacidade')
    expect(
      cuidados.getByRole('link', { name: 'Termos de uso' }),
    ).toHaveAttribute('href', '/termos')
    expect(
      within(screen.getByRole('contentinfo')).getByRole('link', {
        name: 'Powered by PiluTech',
      }),
    ).toHaveAttribute('href', 'https://pilutech.com.br')
  })
})
