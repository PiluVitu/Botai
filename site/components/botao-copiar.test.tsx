import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BotaoCopiar, TEMPO_DO_COPIADO } from './botao-copiar'

const COMANDO = 'npx @pilutech/botai-core@0.5.0 pessoa --semente 42'

describe('BotaoCopiar', () => {
  afterEach(() => jest.useRealTimers())

  it('copia o texto, troca o ícone e avisa o leitor de tela', async () => {
    const usuario = userEvent.setup()
    render(
      <BotaoCopiar texto={COMANDO} rotulo={`Copiar comando: ${COMANDO}`} />,
    )
    const botao = screen.getByRole('button', {
      name: `Copiar comando: ${COMANDO}`,
    })
    expect(botao.querySelector('svg')).toHaveAttribute('data-icon', 'copy')
    expect(screen.getByRole('status')).toHaveTextContent('')
    await usuario.click(botao)
    expect(await navigator.clipboard.readText()).toBe(COMANDO)
    expect(botao.querySelector('svg')).toHaveAttribute('data-icon', 'check')
    expect(screen.getByRole('status')).toHaveTextContent('Copiado')
  })

  it('volta ao ícone de copiar depois de 1,6 s', async () => {
    jest.useFakeTimers()
    const usuario = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<BotaoCopiar texto="x" rotulo="Copiar" />)
    const botao = screen.getByRole('button', { name: 'Copiar' })
    await usuario.click(botao)
    await waitFor(() =>
      expect(botao.querySelector('svg')).toHaveAttribute('data-icon', 'check'),
    )
    expect(TEMPO_DO_COPIADO).toBe(1600)
    act(() => jest.advanceTimersByTime(TEMPO_DO_COPIADO))
    expect(botao.querySelector('svg')).toHaveAttribute('data-icon', 'copy')
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('se a área de transferência recusar, não mostra o check', async () => {
    const usuario = userEvent.setup()
    jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(new Error('negado'))
    render(<BotaoCopiar texto="x" rotulo="Copiar" />)
    const botao = screen.getByRole('button', { name: 'Copiar' })
    await usuario.click(botao)
    expect(botao.querySelector('svg')).toHaveAttribute('data-icon', 'copy')
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('dois tamanhos: 36 px no hero, 32 px nas portas', () => {
    render(
      <>
        <BotaoCopiar texto="a" rotulo="Médio" />
        <BotaoCopiar texto="b" rotulo="Pequeno" tamanho="pequeno" />
      </>,
    )
    expect(screen.getByRole('button', { name: 'Médio' })).toHaveClass('size-9')
    expect(screen.getByRole('button', { name: 'Pequeno' })).toHaveClass(
      'size-8',
    )
  })
})
