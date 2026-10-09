import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FavoritoRemovido } from './favorito-removido'

describe('FavoritoRemovido', () => {
  it('a região de status existe vazia antes do aviso, para o leitor de tela anunciar quando ele entra', () => {
    render(<FavoritoRemovido apelido={null} onDesfazer={vi.fn()} />)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.queryByRole('button', { name: 'Desfazer' })).toBeNull()
  })

  it('"<apelido> saiu dos favoritos." com o Desfazer', async () => {
    const onDesfazer = vi.fn()
    render(<FavoritoRemovido apelido="comprador PJ" onDesfazer={onDesfazer} />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'comprador PJ saiu dos favoritos.',
    )
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Desfazer' }))
    expect(onDesfazer).toHaveBeenCalledTimes(1)
  })
})
