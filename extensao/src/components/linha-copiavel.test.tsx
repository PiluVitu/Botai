import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LinhaCopiavel } from './linha-copiavel'

describe('LinhaCopiavel', () => {
  it('mostra rótulo e valor e copia pelo botão', async () => {
    const copiar = vi.fn()
    render(
      <LinhaCopiavel
        rotulo="CPF"
        valor="529.982.247-25"
        copiado={false}
        onCopiar={copiar}
      />,
    )
    expect(screen.getByText('CPF')).toBeInTheDocument()
    expect(screen.getByText('529.982.247-25')).toBeInTheDocument()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Copiar CPF' }))
    expect(copiar).toHaveBeenCalledTimes(1)
  })

  it('copiado troca o rótulo por "copiado" e o ícone por um check, sem tirar o valor do lugar', () => {
    render(
      <LinhaCopiavel
        rotulo="CPF"
        valor="529.982.247-25"
        copiado
        onCopiar={vi.fn()}
      />,
    )
    expect(screen.getByText('copiado')).toBeInTheDocument()
    expect(screen.queryByText('CPF')).toBeNull()
    expect(screen.getByText('529.982.247-25')).toBeInTheDocument()
    expect(
      screen
        .getByRole('button', { name: 'Copiar CPF' })
        .querySelector('svg[data-icon="check"]'),
    ).not.toBeNull()
  })

  // A animação vem só com motion-safe: com "reduzir movimento" o CSS não a aplica (o E2E do popup confere).
  it('o check entra com a animação motion-safe, e o ícone de copiar fica parado', () => {
    const { rerender } = render(
      <LinhaCopiavel
        rotulo="CPF"
        valor="529.982.247-25"
        copiado={false}
        onCopiar={vi.fn()}
      />,
    )
    const botao = screen.getByRole('button', { name: 'Copiar CPF' })
    expect(botao.querySelector('svg')).not.toHaveClass(
      'motion-safe:animate-botai-surgir',
    )
    rerender(
      <LinhaCopiavel
        rotulo="CPF"
        valor="529.982.247-25"
        copiado
        onCopiar={vi.fn()}
      />,
    )
    expect(botao.querySelector('svg')).toHaveClass(
      'motion-safe:animate-botai-surgir',
    )
    expect(screen.getByText('copiado')).toHaveClass(
      'motion-safe:animate-botai-aparecer',
    )
  })
})
