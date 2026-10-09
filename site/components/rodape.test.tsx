import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen, within } from '@testing-library/react'
import {
  MAILTO,
  npmDe,
  PACOTE_DO_CORE,
  PACOTE_DO_PLAYWRIGHT,
  REPOSITORIO,
  URL_DA_DOCUMENTACAO,
  URL_DA_PILUTECH,
} from '@/lib/conteudo'
import { Rodape } from './rodape'

function links(nav: HTMLElement) {
  return within(nav)
    .getAllByRole('link')
    .map((a) => [a.textContent, a.getAttribute('href')])
}

describe('Rodape', () => {
  it('é o contentinfo, com a marca, a licença e o Powered by PiluTech', () => {
    render(<Rodape />)
    const rodape = within(screen.getByRole('contentinfo'))
    expect(rodape.getByText('Botaí')).toBeInTheDocument()
    expect(
      rodape.getByText(
        'Dados de teste brasileiros. Código aberto, licença MIT.',
      ),
    ).toBeInTheDocument()
    expect(
      rodape.getByRole('link', { name: 'Powered by PiluTech' }),
    ).toHaveAttribute('href', URL_DA_PILUTECH)
    expect(
      screen.getByRole('contentinfo').querySelector('svg'),
    ).toHaveAttribute('aria-hidden', 'true')
  })

  // O rodapé diz "licença MIT": o repo, a extensão e os dois pacotes têm de ser MIT.
  it('a licença do texto é a de todo LICENSE do repo', () => {
    const raiz = join(__dirname, '..', '..')
    for (const pasta of [
      '.',
      'extensao',
      'packages/core',
      'packages/playwright',
    ])
      expect(readFileSync(join(raiz, pasta, 'LICENSE'), 'utf8')).toMatch(
        /^MIT License\n/,
      )
  })

  // O «Suporte» fica na coluna Projeto (o design o tirou; a v1 e os testes o garantem): decisão do dono.
  it('a coluna Projeto: Docs, GitHub, os dois pacotes do npm e o Suporte', () => {
    render(<Rodape />)
    expect(links(screen.getByRole('navigation', { name: 'Projeto' }))).toEqual([
      ['Docs', URL_DA_DOCUMENTACAO],
      ['GitHub', REPOSITORIO],
      [PACOTE_DO_CORE, npmDe(PACOTE_DO_CORE)],
      [PACOTE_DO_PLAYWRIGHT, npmDe(PACOTE_DO_PLAYWRIGHT)],
      ['Suporte', MAILTO.suporte],
    ])
  })

  it('o Docs abre na mesma aba, e o suporte leva [Botaí] no assunto', () => {
    render(<Rodape />)
    expect(screen.getByRole('link', { name: 'Docs' })).not.toHaveAttribute(
      'target',
    )
    expect(screen.getByRole('link', { name: 'Suporte' })).toHaveAttribute(
      'href',
      'mailto:pilutechinformatica@gmail.com?subject=%5BBota%C3%AD%5D%20Suporte',
    )
  })

  it('a coluna Legal: termos de uso e política de privacidade', () => {
    render(<Rodape />)
    expect(links(screen.getByRole('navigation', { name: 'Legal' }))).toEqual([
      ['Termos de uso', '/termos'],
      ['Política de privacidade', '/privacidade'],
    ])
    expect(screen.queryByRole('link', { name: 'Privacidade' })).toBeNull()
  })

  // O título visível de cada coluna é o nome dela (WCAG 2.5.3), e não um título de seção.
  it('cada coluna leva o nome do seu título', () => {
    render(<Rodape />)
    for (const nome of ['Projeto', 'Legal']) {
      const nav = screen.getByRole('navigation', { name: nome })
      const titulo = document.getElementById(
        nav.getAttribute('aria-labelledby') as string,
      )
      expect(titulo?.tagName).toBe('P')
      expect(titulo).toHaveTextContent(nome)
    }
    expect(screen.queryAllByRole('heading')).toEqual([])
  })
})
