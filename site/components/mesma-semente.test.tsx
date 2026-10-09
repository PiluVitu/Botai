import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen, within } from '@testing-library/react'
import { MOTOR } from '@pilutech/botai-core'
import {
  HOJE_DO_EXEMPLO,
  PESSOA_DO_EXEMPLO,
  SEMENTE_DO_EXEMPLO,
} from '@/lib/exemplo'
import { PORTAS } from '@/lib/portas'
import { MesmaSemente } from './mesma-semente'

const DOURADOS = join(
  __dirname,
  '..',
  '..',
  'packages',
  'core',
  'dourado',
  'v1',
)

function secao() {
  return screen.getByRole('region', { name: 'Mesma semente, mesma pessoa.' })
}

describe('MesmaSemente', () => {
  it('é a seção #mesma-pessoa, com o número 02', () => {
    render(<MesmaSemente />)
    expect(secao()).toHaveAttribute('id', 'mesma-pessoa')
    expect(within(secao()).getByText('02')).toBeInTheDocument()
  })

  // A extensão sorteia com crypto e o motor recebe a pessoa pronta: "todas as portas" seria falso.
  it('o apoio fala só das portas que aceitam semente, com o hoje em código', () => {
    render(<MesmaSemente />)
    const apoio = within(secao()).getByText(/toda porta que aceita semente/)
    expect(apoio).toHaveTextContent(
      'Com a mesma semente e o mesmo hoje, toda porta que aceita semente devolve a mesma pessoa. O teste que falhou no CI roda na sua máquina com os mesmos dados.',
    )
    expect(within(apoio).getByText('hoje').tagName).toBe('CODE')
    expect(secao()).not.toHaveTextContent(/todas as portas/i)
  })

  it('a entrada é a semente e o hoje do exemplo', () => {
    render(<MesmaSemente />)
    expect(within(secao()).getByText('Entrada').tagName).toBe('P')
    expect(secao()).toHaveTextContent(`semente: ${SEMENTE_DO_EXEMPLO}`)
    expect(secao()).toHaveTextContent(`hoje: '${HOJE_DO_EXEMPLO}'`)
    expect(
      within(secao()).getByText('No Playwright, a semente é o nome do teste.'),
    ).toBeInTheDocument()
  })

  it('as pílulas são as seis portas que aceitam semente, sem a extensão e sem o motor', () => {
    render(<MesmaSemente />)
    const pilulas = within(
      within(secao()).getByRole('list', { name: 'Portas' }),
    )
      .getAllByRole('listitem')
      .map((item) => item.textContent)
    expect(pilulas).toEqual(PORTAS.filter((p) => p.semente).map((p) => p.nome))
    expect(pilulas).toEqual([
      'CLI',
      'HTTP',
      'Docker',
      'Binários',
      'Biblioteca',
      'Playwright',
    ])
  })

  // Nenhum valor escrito à mão: a saída é a PESSOA_DO_EXEMPLO (o lib/exemplo.test.ts trava os valores do design).
  it('a saída é a pessoa do exemplo, em pares chave e valor', () => {
    const { container } = render(<MesmaSemente />)
    expect(within(secao()).getByText('Saída').tagName).toBe('P')
    const pares = [...container.querySelectorAll('dl dt')].map((dt) => [
      dt.textContent,
      dt.nextElementSibling?.tagName === 'DD'
        ? dt.nextElementSibling.textContent
        : null,
    ])
    const { nome, cpf, celular, endereco, empresa, cartao } = PESSOA_DO_EXEMPLO
    expect(pares).toEqual([
      ['nome', nome.completo],
      ['cpf', cpf],
      ['celular', celular.formatado],
      ['cep', `${endereco.cep} · ${endereco.cidade}, ${endereco.uf}`],
      ['cnpj', empresa.cnpj],
      ['cartão', cartao.numeroFormatado],
    ])
  })

  // O 43 de 43 foi provado com outra semente (verificador-1); a 42 com o hoje do exemplo é um dourado.
  it('o pé diz que a semente 42 é um dos 12 dourados, sem o 43 de 43', () => {
    render(<MesmaSemente />)
    expect(
      within(secao()).getByText('a semente 42 é um dos 12 arquivos dourados'),
    ).toBeInTheDocument()
    expect(secao()).not.toHaveTextContent(/43 de 43/)
  })

  it('três cartões numerados: no CI, na sua máquina e entre versões', () => {
    const { container } = render(<MesmaSemente />)
    const cartoes = [...(container.querySelector('ol') as HTMLElement).children]
    expect(cartoes.map((c) => c.firstElementChild?.textContent)).toEqual([
      '01 · no CI',
      '02 · na sua máquina',
      '03 · entre versões',
    ])
    expect(cartoes.map((c) => c.lastElementChild?.textContent)).toEqual([
      'O teste falha e o relatório leva a pessoa que foi usada, com a semente.',
      'A mesma semente e o mesmo hoje no terminal devolvem a mesma pessoa, campo por campo.',
      'Arquivos dourados guardam as pessoas esperadas de um conjunto de sementes e são conferidos a cada PR. Os 12 não mudaram da 0.2.0 à 0.4.1. Fixe a versão do pacote.',
    ])
    expect(within(cartoes[1] as HTMLElement).getByText('hoje').tagName).toBe(
      'CODE',
    )
  })
})

describe('os fatos da seção', () => {
  it('a semente 42 com o hoje do exemplo é um dos 12 dourados', () => {
    const indice = JSON.parse(
      readFileSync(join(DOURADOS, 'indice.json'), 'utf8'),
    ) as { opcoes: unknown }[]
    expect(indice.map((d) => d.opcoes)).toContainEqual({
      semente: SEMENTE_DO_EXEMPLO,
      hoje: HOJE_DO_EXEMPLO,
    })
    expect(
      readdirSync(DOURADOS).filter((arquivo) => arquivo !== 'indice.json'),
    ).toHaveLength(12)
  })

  // Os dourados foram conferidos até a 0.4.1. Subiu o core? Confira de novo antes de mudar o texto.
  it('"da 0.2.0 à 0.4.1" vale para a versão atual do core', () => {
    expect(MOTOR).toBe('0.4.1')
  })
})
