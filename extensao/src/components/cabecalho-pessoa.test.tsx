import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { PESSOA_DOURADA as P } from '../test/pessoa-dourada'
import {
  CabecalhoPessoa,
  iniciais,
  type CabecalhoPessoaProps,
  type EdicaoApelido,
} from './cabecalho-pessoa'

function props(
  extra: Partial<CabecalhoPessoaProps> = {},
): CabecalhoPessoaProps {
  return {
    pessoa: P,
    idade: 33,
    apelido: null,
    limiteAtingido: false,
    edicao: null,
    onEstrela: vi.fn(),
    onRenomear: vi.fn(),
    ...extra,
  }
}

const estrela = () =>
  screen.getByRole('button', { name: /favoritos|Limite de 3/ })

describe('iniciais', () => {
  it('pega a primeira letra do primeiro e do último nome', () => {
    expect(iniciais('Maria Eduarda Souza')).toBe('MS')
    expect(iniciais('  vinícius oliveira costa ')).toBe('VC')
  })
})

describe('CabecalhoPessoa', () => {
  it('mostra iniciais, nome, idade e cidade', () => {
    render(<CabecalhoPessoa {...props()} />)
    expect(
      screen.getByRole('heading', { level: 1, name: P.nome.completo }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(`33 anos · ${P.endereco.cidade}, ${P.endereco.uf}`),
    ).toBeInTheDocument()
    expect(screen.getByText(iniciais(P.nome.completo))).toBeInTheDocument()
  })

  it('ativa fora dos favoritos: estrela "Guardar nos favoritos", não pressionada, sem apelido', async () => {
    const onEstrela = vi.fn()
    render(<CabecalhoPessoa {...props({ onEstrela })} />)
    expect(estrela()).toHaveAccessibleName('Guardar nos favoritos')
    expect(estrela()).toHaveAttribute('aria-pressed', 'false')
    expect(estrela()).not.toHaveAttribute('aria-disabled')
    expect(
      screen.queryByRole('button', { name: 'Renomear favorito' }),
    ).toBeNull()
    await userEvent.setup().click(estrela())
    expect(onEstrela).toHaveBeenCalledTimes(1)
  })

  it('ativa favorita: apelido acima do nome, lápis para renomear e estrela "Tirar dos favoritos" pressionada', async () => {
    const onEstrela = vi.fn()
    const onRenomear = vi.fn()
    render(
      <CabecalhoPessoa
        {...props({ apelido: 'admin do staging', onEstrela, onRenomear })}
      />,
    )
    expect(screen.getByText('admin do staging')).toBeInTheDocument()
    expect(estrela()).toHaveAccessibleName('Tirar dos favoritos')
    expect(estrela()).toHaveAttribute('aria-pressed', 'true')
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Renomear favorito' }))
    await user.click(estrela())
    expect(onRenomear).toHaveBeenCalledTimes(1)
    expect(onEstrela).toHaveBeenCalledTimes(1)
  })

  it('o apelido vem antes do nome na leitura', () => {
    render(<CabecalhoPessoa {...props({ apelido: 'admin do staging' })} />)
    const apelido = screen.getByText('admin do staging')
    const nome = screen.getByRole('heading', { level: 1 })
    expect(
      apelido.compareDocumentPosition(nome) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('no limite, a estrela fica aria-disabled com o rótulo do limite e não chama nada', async () => {
    const onEstrela = vi.fn()
    render(<CabecalhoPessoa {...props({ limiteAtingido: true, onEstrela })} />)
    expect(estrela()).toHaveAccessibleName('Limite de 3 favoritos')
    expect(estrela()).toHaveAttribute('aria-disabled', 'true')
    expect(estrela()).toHaveAttribute('aria-pressed', 'false')
    await userEvent.setup().click(estrela())
    expect(onEstrela).not.toHaveBeenCalled()
  })

  it('a favorita no limite continua podendo sair: o limite só vale para guardar', () => {
    render(
      <CabecalhoPessoa
        {...props({ apelido: 'admin do staging', limiteAtingido: true })}
      />,
    )
    expect(estrela()).toHaveAccessibleName('Tirar dos favoritos')
    expect(estrela()).not.toHaveAttribute('aria-disabled')
  })
})

function ComEdicao({
  inicial,
  aoSalvar,
  aoCancelar,
}: {
  inicial: string
  aoSalvar: (rascunho: string) => void
  aoCancelar: () => void
}) {
  const [rascunho, setRascunho] = useState(inicial)
  const edicao: EdicaoApelido = {
    rascunho,
    onMudar: setRascunho,
    onSalvar: () => aoSalvar(rascunho),
    onCancelar: aoCancelar,
  }
  return <CabecalhoPessoa {...props({ apelido: inicial, edicao })} />
}

describe('CabecalhoPessoa: editando o apelido', () => {
  const campo = () =>
    screen.getByRole('textbox', { name: 'Apelido do favorito' })

  it('troca o nome e a estrela pelo campo, focado e com o texto selecionado', () => {
    render(
      <ComEdicao inicial="Maria" aoSalvar={vi.fn()} aoCancelar={vi.fn()} />,
    )
    expect(campo()).toHaveFocus()
    expect(campo()).toHaveValue('Maria')
    expect((campo() as HTMLInputElement).selectionStart).toBe(0)
    expect((campo() as HTMLInputElement).selectionEnd).toBe(5)
    expect(campo()).toHaveAttribute('maxLength', '24')
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
    expect(screen.queryByRole('button', { name: /favoritos/ })).toBeNull()
    expect(
      screen.getByText('5/24 · Enter salva, Esc cancela'),
    ).toBeInTheDocument()
  })

  it('o contador acompanha o que se digita', async () => {
    render(<ComEdicao inicial="" aoSalvar={vi.fn()} aoCancelar={vi.fn()} />)
    await userEvent.setup().type(campo(), 'admin do staging')
    expect(
      screen.getByText('16/24 · Enter salva, Esc cancela'),
    ).toBeInTheDocument()
  })

  it('Enter salva com o rascunho', async () => {
    const aoSalvar = vi.fn()
    render(<ComEdicao inicial="" aoSalvar={aoSalvar} aoCancelar={vi.fn()} />)
    await userEvent.setup().type(campo(), 'admin do staging{Enter}')
    expect(aoSalvar).toHaveBeenCalledWith('admin do staging')
  })

  it('o botão Salvar também salva', async () => {
    const aoSalvar = vi.fn()
    render(
      <ComEdicao inicial="Maria" aoSalvar={aoSalvar} aoCancelar={vi.fn()} />,
    )
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Salvar' }))
    expect(aoSalvar).toHaveBeenCalledWith('Maria')
  })

  it('Esc cancela sem salvar, e o evento não segue (o Chrome fecharia o popup)', async () => {
    const aoSalvar = vi.fn()
    const aoCancelar = vi.fn()
    render(
      <ComEdicao inicial="Maria" aoSalvar={aoSalvar} aoCancelar={aoCancelar} />,
    )
    const seguiu = vi.fn()
    const ouvir = (e: KeyboardEvent) => seguiu(e.defaultPrevented)
    document.addEventListener('keydown', ouvir)
    await userEvent.setup().type(campo(), '{Escape}')
    document.removeEventListener('keydown', ouvir)
    expect(aoCancelar).toHaveBeenCalledTimes(1)
    expect(aoSalvar).not.toHaveBeenCalled()
    expect(seguiu).toHaveBeenCalledWith(true)
  })
})
