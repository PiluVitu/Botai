import { render, screen, within } from '@testing-library/react'
import { CODIGO_UF_TITULO, REGIAO_FISCAL_CPF } from '@pilutech/botai-core/uf'
import { PESSOA_DO_EXEMPLO, SEMENTE_DO_EXEMPLO } from '@/lib/exemplo'
import { REGRAS } from '@/lib/regras'
import { PessoaExemplo } from './pessoa-exemplo'

const P = PESSOA_DO_EXEMPLO

function renderizar() {
  render(<PessoaExemplo />)
  return screen.getByRole('region', { name: 'Uma pessoa onde tudo bate.' })
}

function campos(secao: HTMLElement): Map<string, HTMLElement> {
  const termos = within(secao).getAllByRole('term')
  return new Map(
    termos.map((dt) => [
      dt.textContent ?? '',
      dt.nextElementSibling as HTMLElement,
    ]),
  )
}

describe('PessoaExemplo', () => {
  it('é a seção 03, sem âncora, com o apoio da UF', () => {
    const secao = renderizar()
    expect(secao).not.toHaveAttribute('id')
    expect(secao).toHaveAttribute('aria-labelledby', 'pessoa-titulo')
    expect(within(secao).getByText('03')).toBeInTheDocument()
    expect(
      within(secao).getByText(
        'A UF do endereço amarra o CPF, o DDD e o título. Todos os documentos passam no dígito verificador.',
      ),
    ).toBeInTheDocument()
    expect(secao.querySelector('[data-esqueleto]')).toBeNull()
  })

  it('o nome, o nascimento e a semente saem da pessoa do exemplo', () => {
    const secao = renderizar()
    expect(within(secao).getByText(P.nome.completo)).toBeInTheDocument()
    expect(
      within(secao).getByText(
        `${P.nascimento.br} · ${P.nascimento.idade} anos`,
      ),
    ).toBeInTheDocument()
    expect(
      within(secao).getByText(`semente ${SEMENTE_DO_EXEMPLO}`),
    ).toBeInTheDocument()
  })

  it('os campos, na ordem do design, com os valores da pessoa', () => {
    const secao = renderizar()
    const dl = campos(secao)
    const { endereco, empresa, cartao } = P
    expect(Array.from(dl, ([rotulo, dd]) => [rotulo, dd.textContent])).toEqual([
      ['CEP', endereco.cep],
      [
        'Endereço',
        `${endereco.logradouro}, ${endereco.numero}, ${endereco.complemento} · ${endereco.bairro} · ${endereco.cidade}, ${endereco.uf}`,
      ],
      ['CPF', P.cpf],
      ['Celular', P.celular.formatado],
      ['Título de eleitor', P.tituloEleitor],
      ['RG · PIS', `${P.rg.numero} · ${P.pis}`],
      ['E-mail', P.email.endereco],
      [
        'Empresa',
        `${empresa.razaoSocial} · ${empresa.nomeFantasia} · ${empresa.cnpj}`,
      ],
      [
        'Cartão de teste Stripe',
        `${cartao.numeroFormatado} · ${cartao.validade}`,
      ],
    ])
  })

  // O destaque é o pedaço que a UF do endereço decide, conferido contra as tabelas do core.
  it('os destaques são os que a UF amarra', () => {
    const secao = renderizar()
    const dl = campos(secao)
    const destaque = (rotulo: string) =>
      Array.from(
        dl.get(rotulo)?.querySelectorAll('strong') ?? [],
        (s) => s.textContent,
      )
    const { uf, ddd } = P.endereco
    expect(destaque('Endereço')).toEqual([uf])
    expect(destaque('CPF')).toEqual([String(REGIAO_FISCAL_CPF[uf])])
    expect(P.celular.ddd).toBe(ddd)
    expect(destaque('Celular')).toEqual([ddd])
    expect(destaque('Título de eleitor')).toEqual([CODIGO_UF_TITULO[uf]])
    expect(secao.querySelectorAll('dl strong')).toHaveLength(4)
  })

  it('as cinco regras, com o chip, o título e o texto', () => {
    const secao = renderizar()
    const lista = within(secao).getByRole('list')
    const itens = within(lista).getAllByRole('listitem')
    expect(itens.map((li) => li.textContent)).toEqual(
      REGRAS.map((r) => `${r.chip}${r.titulo}${r.texto}`),
    )
  })

  // O RG é sempre SSP/SP.
  it('não diz que o RG é da UF do endereço', () => {
    const secao = renderizar()
    expect(secao).not.toHaveTextContent(/RG d[oa] /)
    expect(secao).not.toHaveTextContent(/SSP/)
  })
})
