import { montarPessoa } from '@pilutech/botai-core/pessoa'
import { sfc32 } from '@pilutech/botai-core/prng'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { primeiroNome, type Favorito, type Removido } from '../lib/favoritos'
import { PESSOA_ANTIGA, PESSOA_DOURADA as P } from '../test/pessoa-dourada'
import { iniciais } from './cabecalho-pessoa'
import { PessoaPronta, type PessoaProntaProps } from './pessoa-pronta'

function props(extra: Partial<PessoaProntaProps> = {}): PessoaProntaProps {
  return {
    pessoa: P,
    idade: 33,
    atalho: '⌥⇧P',
    preencherDesabilitado: false,
    favoritos: [],
    onPreencher: vi.fn(),
    onNovaPessoa: vi.fn(),
    onAbrirCaixa: vi.fn(),
    onCopiar: vi
      .fn<(valor: string) => Promise<void>>()
      .mockResolvedValue(undefined),
    onGuardarFavorito: vi
      .fn<() => Promise<Favorito | null>>()
      .mockResolvedValue(null),
    onTirarFavorito: vi
      .fn<(id: string) => Promise<Removido | null>>()
      .mockResolvedValue(null),
    onDevolverFavorito: vi
      .fn<(removido: Removido) => Promise<unknown>>()
      .mockResolvedValue(true),
    onRenomearFavorito: vi
      .fn<(id: string, apelido: string) => Promise<unknown>>()
      .mockResolvedValue(true),
    onUsarFavorito: vi.fn(),
    escolhaDoCartao: { provedor: 'stripe', cenario: 'aprovado' },
    onEscolherCartao: vi.fn(),
    ...extra,
  }
}

const botaoPreencher = () =>
  screen.getByRole('button', { name: /Preencher esta página/ })

describe('PessoaPronta (1b)', () => {
  it('mostra iniciais, nome, idade e cidade da pessoa', () => {
    render(<PessoaPronta {...props()} />)
    expect(
      screen.getByRole('heading', { level: 1, name: P.nome.completo }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(`33 anos · ${P.endereco.cidade}, ${P.endereco.uf}`),
    ).toBeInTheDocument()
    expect(screen.getByText(iniciais(P.nome.completo))).toBeInTheDocument()
  })

  it('"Preencher esta página" mostra o atalho num kbd e chama onPreencher', async () => {
    const preencher = vi.fn()
    render(<PessoaPronta {...props({ onPreencher: preencher })} />)
    expect(within(botaoPreencher()).getByText('⌥⇧P').tagName).toBe('KBD')
    await userEvent.setup().click(botaoPreencher())
    expect(preencher).toHaveBeenCalledTimes(1)
  })

  it('sem atalho o chip some do botão', () => {
    render(<PessoaPronta {...props({ atalho: '' })} />)
    expect(botaoPreencher().querySelector('kbd')).toBeNull()
  })

  it('"Preencher" fica desabilitado quando a página é proibida', () => {
    render(<PessoaPronta {...props({ preencherDesabilitado: true })} />)
    expect(botaoPreencher()).toBeDisabled()
  })

  it('"Nova pessoa", "Caixa de entrada" e "abrir caixa →" chamam os callbacks', async () => {
    const nova = vi.fn()
    const caixa = vi.fn()
    const user = userEvent.setup()
    render(
      <PessoaPronta {...props({ onNovaPessoa: nova, onAbrirCaixa: caixa })} />,
    )
    await user.click(screen.getByRole('button', { name: 'Nova pessoa' }))
    await user.click(screen.getByRole('button', { name: 'Caixa de entrada' }))
    await user.click(screen.getByRole('button', { name: 'abrir caixa →' }))
    expect(nova).toHaveBeenCalledTimes(1)
    expect(caixa).toHaveBeenCalledTimes(2)
  })

  it('lista os 6 grupos e o filtro mostra só o escolhido, com o cenário do cartão', async () => {
    render(<PessoaPronta {...props()} />)
    const rotulosDosGrupos = () =>
      screen.getAllByRole('region').map((r) => r.getAttribute('aria-label'))
    expect(rotulosDosGrupos()).toEqual([
      'Pessoais',
      'E-mail',
      'Endereço',
      'Empresa',
      'Cartão',
      'Documentos',
    ])
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Cartão' }))
    expect(screen.getByRole('button', { name: 'Cartão' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(rotulosDosGrupos()).toEqual(['Cartão'])
    expect(
      screen.getByText(
        'Aprova a cobrança. Número de teste documentado da Stripe: passa no Luhn e só vale em sandbox.',
      ),
    ).toBeInTheDocument()
  })

  it('o grupo do e-mail avisa que a caixa é pública', () => {
    render(<PessoaPronta {...props()} />)
    const email = within(screen.getByRole('region', { name: 'E-mail' }))
    expect(email.getByText('Caixa pública.')).toBeInTheDocument()
    expect(email.getByText(P.email.endereco)).toBeInTheDocument()
  })

  it('copiar manda o valor para onCopiar e marca "copiado" naquela linha', async () => {
    const copiar = vi
      .fn<(valor: string) => Promise<void>>()
      .mockResolvedValue(undefined)
    render(<PessoaPronta {...props({ onCopiar: copiar })} />)
    const pessoais = within(screen.getByRole('region', { name: 'Pessoais' }))
    await userEvent
      .setup()
      .click(pessoais.getByRole('button', { name: 'Copiar CPF' }))
    expect(copiar).toHaveBeenCalledWith(P.cpf)
    expect(await pessoais.findByText('copiado')).toBeInTheDocument()
  })
})

describe('PessoaPronta (1b): favoritos', () => {
  const outra = (n: number) =>
    montarPessoa(sfc32(n, n + 1, n + 2, n + 3), '2026-10-01')
  const [A, B] = [outra(10), outra(20)]
  const favorito = (id: string, apelido: string, pessoa = P): Favorito => ({
    id,
    apelido,
    pessoa,
    guardadoEm: '2026-10-09T12:00:00.000Z',
  })
  const ATIVA = favorito('f-ativa', 'admin do staging')
  const estrela = () =>
    screen.getByRole('button', { name: /favoritos|Limite de 3/ })
  const campo = () =>
    screen.getByRole('textbox', { name: 'Apelido do favorito' })

  it('a faixa de favoritos fica entre a pessoa e o "Preencher"', () => {
    render(<PessoaPronta {...props()} />)
    const titulo = screen.getByRole('heading', { level: 2, name: 'Favoritos' })
    expect(
      screen
        .getByRole('heading', { level: 1 })
        .compareDocumentPosition(titulo) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      titulo.compareDocumentPosition(botaoPreencher()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('a estrela guarda a ativa e abre o apelido com o primeiro nome; Enter salva o que se digitou', async () => {
    const guardar = vi
      .fn<() => Promise<Favorito | null>>()
      .mockResolvedValue(favorito('f-novo', primeiroNome(P)))
    const renomear = vi
      .fn<(id: string, apelido: string) => Promise<unknown>>()
      .mockResolvedValue(true)
    render(
      <PessoaPronta
        {...props({ onGuardarFavorito: guardar, onRenomearFavorito: renomear })}
      />,
    )
    const user = userEvent.setup()
    await user.click(estrela())
    expect(guardar).toHaveBeenCalledTimes(1)
    expect(
      await screen.findByRole('textbox', { name: 'Apelido do favorito' }),
    ).toHaveValue(primeiroNome(P))
    expect(campo()).toHaveFocus()
    await user.keyboard('admin do staging{Enter}')
    expect(renomear).toHaveBeenCalledWith('f-novo', 'admin do staging')
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('Esc depois de guardar fecha o apelido sem renomear: fica o primeiro nome', async () => {
    const guardar = vi
      .fn<() => Promise<Favorito | null>>()
      .mockResolvedValue(favorito('f-novo', primeiroNome(P)))
    const renomear = vi.fn()
    render(
      <PessoaPronta
        {...props({ onGuardarFavorito: guardar, onRenomearFavorito: renomear })}
      />,
    )
    const user = userEvent.setup()
    await user.click(estrela())
    await screen.findByRole('textbox', { name: 'Apelido do favorito' })
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(renomear).not.toHaveBeenCalled()
  })

  it('"Guardar esta" faz o mesmo que a estrela', async () => {
    const guardar = vi
      .fn<() => Promise<Favorito | null>>()
      .mockResolvedValue(favorito('f-novo', primeiroNome(P)))
    render(<PessoaPronta {...props({ onGuardarFavorito: guardar })} />)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Guardar esta' }))
    expect(guardar).toHaveBeenCalledTimes(1)
    expect(
      await screen.findByRole('textbox', { name: 'Apelido do favorito' }),
    ).toBeInTheDocument()
  })

  it('se o storage não guardou (outra janela encheu a lista), não abre o apelido', async () => {
    render(<PessoaPronta {...props()} />)
    await userEvent.setup().click(estrela())
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('a ativa favorita mostra o apelido; o lápis abre a edição com ele e salva o novo', async () => {
    const renomear = vi
      .fn<(id: string, apelido: string) => Promise<unknown>>()
      .mockResolvedValue(true)
    render(
      <PessoaPronta
        {...props({ favoritos: [ATIVA], onRenomearFavorito: renomear })}
      />,
    )
    expect(screen.getAllByText('admin do staging')).toHaveLength(2)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Renomear favorito' }))
    expect(campo()).toHaveValue('admin do staging')
    await user.clear(campo())
    await user.type(campo(), 'admin novo')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(renomear).toHaveBeenCalledWith('f-ativa', 'admin novo')
  })

  it('tirar a ativa dos favoritos mostra o aviso com Desfazer, que devolve o mesmo favorito', async () => {
    const removido: Removido = { favorito: ATIVA, posicao: 1 }
    const tirar = vi
      .fn<(id: string) => Promise<Removido | null>>()
      .mockResolvedValue(removido)
    const devolver = vi
      .fn<(r: Removido) => Promise<unknown>>()
      .mockResolvedValue(true)
    render(
      <PessoaPronta
        {...props({
          favoritos: [favorito('f-a', 'outro', A), ATIVA],
          onTirarFavorito: tirar,
          onDevolverFavorito: devolver,
        })}
      />,
    )
    const user = userEvent.setup()
    await user.click(estrela())
    expect(tirar).toHaveBeenCalledWith('f-ativa')
    await vi.waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'admin do staging saiu dos favoritos.',
      ),
    )
    await user.click(screen.getByRole('button', { name: 'Desfazer' }))
    expect(devolver).toHaveBeenCalledWith(removido)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('o aviso some sozinho em 5 s', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const tirar = vi
        .fn<(id: string) => Promise<Removido | null>>()
        .mockResolvedValue({ favorito: ATIVA, posicao: 0 })
      render(
        <PessoaPronta
          {...props({ favoritos: [ATIVA], onTirarFavorito: tirar })}
        />,
      )
      await userEvent
        .setup({ advanceTimers: vi.advanceTimersByTime })
        .click(estrela())
      await vi.waitFor(() =>
        expect(screen.getByRole('status')).not.toBeEmptyDOMElement(),
      )
      act(() => vi.advanceTimersByTime(5000))
      expect(screen.getByRole('status')).toBeEmptyDOMElement()
    } finally {
      vi.useRealTimers()
    }
  })

  it('um chip pede para usar aquele favorito', async () => {
    const usar = vi.fn()
    render(
      <PessoaPronta
        {...props({
          favoritos: [favorito('f-a', 'comprador PJ', A)],
          onUsarFavorito: usar,
        })}
      />,
    )
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'comprador PJ' }))
    expect(usar).toHaveBeenCalledWith('f-a')
  })

  it('trocar a ativa no meio da edição cancela o apelido, e ele não volta com ela', async () => {
    const { rerender } = render(
      <PessoaPronta {...props({ favoritos: [ATIVA] })} />,
    )
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Renomear favorito' }))
    expect(campo()).toBeInTheDocument()
    rerender(<PessoaPronta {...props({ pessoa: B, favoritos: [ATIVA] })} />)
    expect(screen.queryByRole('textbox')).toBeNull()
    rerender(<PessoaPronta {...props({ favoritos: [ATIVA] })} />)
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('com 3 favoritos e a ativa de fora, a estrela fica no limite e a nota explica', async () => {
    const guardar = vi.fn()
    render(
      <PessoaPronta
        {...props({
          favoritos: [
            favorito('f-1', 'um', A),
            favorito('f-2', 'dois', B),
            favorito('f-3', 'três', outra(30)),
          ],
          onGuardarFavorito: guardar,
        })}
      />,
    )
    expect(estrela()).toHaveAccessibleName('Limite de 3 favoritos')
    expect(estrela()).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText(/Os 3 lugares estão ocupados/)).toBeInTheDocument()
    await userEvent.setup().click(estrela())
    expect(guardar).not.toHaveBeenCalled()
  })
})

describe('PessoaPronta (1b): cartão', () => {
  const cartao = () => within(screen.getByRole('region', { name: 'Cartão' }))
  const RECUSADA = montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', {
    cartao: { provedor: 'pagarme', cenario: 'recusado' },
  })

  it('o grupo mostra o número, o cenário e o provedor da pessoa atual', () => {
    render(<PessoaPronta {...props({ pessoa: RECUSADA })} />)
    expect(cartao().getByText('4000 0000 0000 0028')).toBeInTheDocument()
    expect(
      cartao().getByText('recusado', { selector: '[data-tipo]' }),
    ).toHaveAttribute('data-tipo', 'erro')
    expect(
      cartao().getByText('Pagar.me', { selector: 'span' }),
    ).toBeInTheDocument()
    expect(
      cartao().getByText(
        /^Pedido e cobrança com falha; transação não autorizada\./,
      ),
    ).toBeInTheDocument()
  })

  it('o bloco "Cartão das próximas pessoas" fica no grupo Cartão, depois da descrição, e não vira outra região', () => {
    render(<PessoaPronta {...props()} />)
    const titulo = cartao().getByRole('heading', {
      level: 3,
      name: 'Cartão das próximas pessoas',
    })
    expect(
      cartao()
        .getByText(/^Aprova a cobrança\./)
        .compareDocumentPosition(titulo) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(screen.getAllByRole('region')).toHaveLength(6)
  })

  it('a escolha mostrada é a das próximas, não a da pessoa atual', () => {
    render(
      <PessoaPronta
        {...props({
          pessoa: P,
          escolhaDoCartao: { provedor: 'pagarme', cenario: 'chargeback' },
        })}
      />,
    )
    expect(cartao().getByRole('button', { name: 'Pagar.me' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      cartao().getByRole('button', { name: 'chargeback' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      cartao().getByText('aprovado', { selector: '[data-tipo]' }),
    ).toBeInTheDocument()
    expect(
      cartao().getByRole('button', {
        name: 'Nova pessoa com Pagar.me · chargeback',
      }),
    ).toBeInTheDocument()
  })

  it('escolher um cenário pede para guardar a escolha', async () => {
    const escolher = vi.fn()
    render(<PessoaPronta {...props({ onEscolherCartao: escolher })} />)
    await userEvent
      .setup()
      .click(cartao().getByRole('button', { name: 'exige 3DS' }))
    expect(escolher).toHaveBeenCalledWith({
      provedor: 'stripe',
      cenario: 'pendente',
    })
  })

  it('"Nova pessoa com …" chama o mesmo onNovaPessoa e limpa o "copiado"', async () => {
    const nova = vi.fn()
    render(<PessoaPronta {...props({ onNovaPessoa: nova })} />)
    const user = userEvent.setup()
    await user.click(cartao().getByRole('button', { name: 'Copiar Número' }))
    expect(await cartao().findByText('copiado')).toBeInTheDocument()
    await user.click(
      cartao().getByRole('button', {
        name: 'Nova pessoa com Stripe · aprovado',
      }),
    )
    expect(nova).toHaveBeenCalledTimes(1)
    expect(cartao().queryByText('copiado')).toBeNull()
  })

  it('pessoa antiga, sem provedor nem cenário no cartão, aparece como Stripe aprovado', () => {
    render(<PessoaPronta {...props({ pessoa: PESSOA_ANTIGA })} />)
    expect(
      cartao().getByText('aprovado', { selector: '[data-tipo]' }),
    ).toHaveAttribute('data-tipo', 'ok')
    expect(
      cartao().getByText('Stripe', { selector: 'span' }),
    ).toBeInTheDocument()
  })

  it('com o filtro em outro grupo, o bloco do cartão some junto com o grupo', async () => {
    render(<PessoaPronta {...props()} />)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Pessoais' }))
    expect(
      screen.queryByRole('heading', { name: 'Cartão das próximas pessoas' }),
    ).toBeNull()
  })
})
