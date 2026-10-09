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
// A coluna útil de uma tela de 320 px (gutter de 16 px): as colunas descem para baixo da marca.
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
