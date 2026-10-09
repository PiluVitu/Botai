import type { Meta, StoryObj } from '@storybook/nextjs'
import { COMANDO_DO_EXEMPLO } from '@/lib/exemplo'
import { BotaoCopiar } from './botao-copiar'

const meta = {
  title: 'Landing/BotaoCopiar',
  component: BotaoCopiar,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BotaoCopiar>

export default meta
type Story = StoryObj<typeof meta>

export const DoHero: Story = {
  args: {
    texto: COMANDO_DO_EXEMPLO,
    rotulo: `Copiar comando: ${COMANDO_DO_EXEMPLO}`,
  },
}
export const DaPorta: Story = {
  args: {
    texto: 'await botai.preencher(page)',
    rotulo: 'Copiar comando da porta Playwright',
    tamanho: 'pequeno',
  },
}
export const DoHeroClaro: Story = {
  args: DoHero.args,
  globals: { tema: 'claro' },
}

// O stub evita a recusa do clipboard no iframe do Storybook; o check dura TEMPO_DO_COPIADO.
export const Copiado: Story = {
  args: DoHero.args,
  beforeEach: () => {
    const original = navigator.clipboard.writeText
    navigator.clipboard.writeText = () => Promise.resolve()
    return () => {
      navigator.clipboard.writeText = original
    }
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button'))
  },
}
export const CopiadoClaro: Story = {
  ...Copiado,
  globals: { tema: 'claro' },
}
