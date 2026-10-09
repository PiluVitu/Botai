import { montarPessoa } from '@pilutech/botai-core/pessoa'
import { sfc32 } from '@pilutech/botai-core/prng'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { primeiroNome, type Favorito } from '../lib/favoritos'
import { PESSOA_DOURADA as P } from '../test/pessoa-dourada'
import { iniciais } from './cabecalho-pessoa'
import { FaixaFavoritos } from './faixa-favoritos'

const outra = (n: number) =>
  montarPessoa(sfc32(n, n + 1, n + 2, n + 3), '2026-10-01')
const [A, B, C] = [outra(10), outra(20), outra(30)]

const favorito = (id: string, apelido: string, pessoa = P): Favorito => ({
  id,
  apelido,
  pessoa,
  guardadoEm: '2026-10-09T12:00:00.000Z',
})

const chips = () =>
  within(screen.getByRole('group', { name: 'Favoritos' })).getAllByRole(
    'button',
  )

describe('FaixaFavoritos', () => {
  it('sem favoritos: título 0/3 e só o chip tracejado "Guardar esta"', async () => {
    const onGuardar = vi.fn()
    render(
      <FaixaFavoritos
        favoritos={[]}
        ativa={P}
        onUsar={vi.fn()}
        onGuardar={onGuardar}
      />,
    )
    expect(
      screen.getByRole('heading', { name: 'Favoritos' }),
    ).toBeInTheDocument()
    expect(screen.getByText('0/3')).toBeInTheDocument()
    expect(chips().map((c) => c.textContent)).toEqual(['Guardar esta'])
    await userEvent.setup().click(chips()[0])
    expect(onGuardar).toHaveBeenCalledTimes(1)
  })

  it('um chip por favorito, na ordem: iniciais escondidas do leitor e o apelido como nome', () => {
    render(
      <FaixaFavoritos
        favoritos={[
          favorito('f1', 'admin do staging', A),
          favorito('f2', 'comprador PJ', B),
        ]}
        ativa={P}
        onUsar={vi.fn()}
        onGuardar={vi.fn()}
      />,
    )
    expect(screen.getByText('2/3')).toBeInTheDocument()
    const [primeiro, segundo, guardar] = chips()
    expect(chips()).toHaveLength(3)
    expect(primeiro).toHaveAccessibleName('admin do staging')
    expect(primeiro).toHaveTextContent(
      `${iniciais(A.nome.completo)}admin do staging`,
    )
    expect(segundo).toHaveAccessibleName('comprador PJ')
    expect(guardar).toHaveAccessibleName('Guardar esta')
    expect(
      screen.getByRole('button', { name: 'admin do staging' }),
    ).toHaveAttribute('title', 'Usar admin do staging')
    expect(screen.getByText(iniciais(A.nome.completo))).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('o chip da ativa fica pressionado, e "Guardar esta" some quando a ativa já é favorita', () => {
    render(
      <FaixaFavoritos
        favoritos={[
          favorito('f1', 'admin do staging', A),
          favorito('f2', 'Maria', structuredClone(P)),
        ]}
        ativa={P}
        onUsar={vi.fn()}
        onGuardar={vi.fn()}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'admin do staging' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Maria' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.queryByRole('button', { name: 'Guardar esta' })).toBeNull()
  })

  it('clicar num chip pede para usar aquele favorito', async () => {
    const onUsar = vi.fn()
    render(
      <FaixaFavoritos
        favoritos={[
          favorito('f1', 'admin do staging', A),
          favorito('f2', 'comprador PJ', B),
        ]}
        ativa={P}
        onUsar={onUsar}
        onGuardar={vi.fn()}
      />,
    )
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'comprador PJ' }))
    expect(onUsar).toHaveBeenCalledWith('f2')
  })

  it('3 de 3 com a ativa fora: sem "Guardar esta" e com a nota do limite citando o primeiro nome', () => {
    render(
      <FaixaFavoritos
        favoritos={[
          favorito('f1', 'admin do staging', A),
          favorito('f2', 'comprador PJ', B),
          favorito('f3', 'cliente com CEP do PI', C),
        ]}
        ativa={P}
        onUsar={vi.fn()}
        onGuardar={vi.fn()}
      />,
    )
    expect(screen.getByText('3/3')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Guardar esta' })).toBeNull()
    const nota = screen.getByText(/Os 3 lugares estão ocupados\./)
    expect(nota).toHaveTextContent(
      `Os 3 lugares estão ocupados. Para guardar ${primeiroNome(P)}, abra um favorito e clique na estrela para tirá-lo.`,
    )
  })

  it('3 de 3 com a ativa entre eles: sem nota', () => {
    render(
      <FaixaFavoritos
        favoritos={[
          favorito('f1', 'admin do staging', A),
          favorito('f2', 'comprador PJ', B),
          favorito('f3', 'Maria', P),
        ]}
        ativa={P}
        onUsar={vi.fn()}
        onGuardar={vi.fn()}
      />,
    )
    expect(screen.queryByText(/Os 3 lugares estão ocupados/)).toBeNull()
  })
})
