import { render, screen, within } from '@testing-library/react'
import { PORTAS, REPOSITORIO } from '@/lib/conteudo'
import { ParaDevs } from './para-devs'

const CLI =
  'npx @pilutech/botai-core pessoas -n 1000 --semente carga --formato sql > pessoas.sql'
const DOCKER = 'docker run --rm -p 8790:8790 ghcr.io/piluvitu/botai:0.4.1'

function secao() {
  render(<ParaDevs />)
  return screen.getByRole('region', { name: 'Para devs' })
}

describe('ParaDevs', () => {
  // O topo leva a #para-devs.
  it('é uma seção com âncora, rotulada pelo seu h2', () => {
    const regiao = secao()
    expect(regiao).toHaveAttribute('id', 'para-devs')
    expect(
      within(regiao).getByRole('heading', { level: 2, name: 'Para devs' }),
    ).toBeInTheDocument()
  })

  it('uma porta por h3, na ordem do anúncio, com a contagem no cabeçalho', () => {
    const regiao = secao()
    expect(
      within(regiao)
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(PORTAS.map((p) => p.titulo))
    expect(within(regiao).getByText('05')).toBeInTheDocument()
  })

  // O texto de cada linha dos blocos, fora o que é aria-hidden (o `$` do terminal).
  function linhasDosBlocos(regiao: HTMLElement) {
    return [...regiao.querySelectorAll('pre > code > span')].map(
      (linha) =>
        linha.querySelector(':scope > span:not([aria-hidden])')?.textContent,
    )
  }

  // O `$` do terminal é só visual: o leitor de tela e a cópia levam o comando puro.
  it('os comandos saem inteiros, sem o prompt', () => {
    const regiao = secao()
    const linhas = linhasDosBlocos(regiao)
    expect(linhas).toEqual(
      PORTAS.flatMap((p) =>
        p.codigo.tipo === 'atalho' ? [] : p.codigo.linhas,
      ),
    )
    expect(linhas).toEqual(
      expect.arrayContaining([CLI, DOCKER, 'await botai.preencher(page)']),
    )
    const prompts = within(regiao).getAllByText('$')
    expect(prompts).toHaveLength(2)
    for (const prompt of prompts)
      expect(prompt).toHaveAttribute('aria-hidden', 'true')
  })

  // A 320 px um comando de 85 caracteres não cabe: rolar exigiria uma região focável por bloco
  // (axe, scrollable-region-focusable), então o bloco quebra a linha.
  it('o bloco de código quebra a linha em vez de rolar', () => {
    const bloco = secao().querySelector('pre')
    expect(bloco).toHaveClass('whitespace-pre-wrap')
    expect(bloco).not.toHaveClass('overflow-x-auto')
  })

  // Sem isso o Chromium quebra depois do hífen: "--" numa linha e "formato" na outra.
  // O recuo pendurado da linha é herdado, e cada palavra o zera.
  it('cada palavra do comando é um bloco inline, e a quebra cai entre as palavras', () => {
    const regiao = secao()
    const linha = [...regiao.querySelectorAll('pre > code > span')].find((l) =>
      l.textContent?.endsWith('pessoas.sql'),
    ) as HTMLElement
    const palavras = [...linha.querySelectorAll('.inline-block')]
    expect(palavras.map((p) => p.textContent)).toEqual(CLI.split(' '))
    for (const palavra of palavras) expect(palavra).toHaveClass('indent-0')
  })

  it('a extensão mostra o atalho de quem visita', () => {
    const regiao = secao()
    const extensao = within(regiao)
      .getByRole('heading', { level: 3, name: 'Extensão' })
      .closest('li') as HTMLElement
    expect(extensao.querySelector('kbd')).not.toBeNull()
    expect(extensao).toHaveTextContent(/preenche a página no \w+/)
  })

  it('trechos entre crases do texto saem em fonte mono', () => {
    const regiao = secao()
    const codigo = within(regiao).getByText('botai serve')
    expect(codigo.tagName).toBe('CODE')
    expect(within(regiao).queryByText(/`/)).toBeNull()
  })

  // Na série 0.x a pessoa de uma semente pode mudar numa minor (packages/core/CLAUDE.md, "Versões"):
  // a promessa é "nunca num patch", nunca "só na major".
  it('promete a mesma pessoa para a mesma semente, sem prometer o que a 0.x não cumpre', () => {
    const regiao = secao()
    expect(
      within(regiao).getByText('mesma semente, mesma pessoa'),
    ).toBeInTheDocument()
    expect(regiao).toHaveTextContent(
      'um patch nunca muda a pessoa de uma semente: fixe a versão do pacote',
    )
    expect(regiao.textContent).not.toMatch(/major/i)
  })

  it('leva ao repositório e aos dois pacotes no npm', () => {
    const regiao = secao()
    const links = within(
      within(regiao).getByRole('list', { name: 'Código e pacotes' }),
    ).getAllByRole('link')
    expect(links.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Código no GitHub', REPOSITORIO],
      [
        '@pilutech/botai-core no npm',
        'https://www.npmjs.com/package/@pilutech/botai-core',
      ],
      [
        '@pilutech/botai-playwright no npm',
        'https://www.npmjs.com/package/@pilutech/botai-playwright',
      ],
    ])
  })

  // A Opera e o Edge seguem em revisão.
  it('não diz que nada está disponível', () => {
    expect(secao().textContent).not.toMatch(/dispon[ií]vel/i)
  })
})
