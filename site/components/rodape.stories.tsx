import type { Meta, StoryObj } from '@storybook/nextjs'
import { Rodape } from './rodape'

const meta = {
  title: 'Landing/Rodape',
  component: Rodape,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Rodape>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// A largura útil de uma tela de 320 px (gutter de 24 px): o Docs e o Suporte descem para a linha de baixo.
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[272px]">
        <Story />
      </div>
    ),
  ],
}
