import type { Meta, StoryObj } from '@storybook/nextjs'
import { Integracoes } from './integracoes'

const meta = {
  title: 'Landing/Integracoes',
  component: Integracoes,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Integracoes>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// A coluna útil de uma tela de 320 px: a grade cai para uma coluna.
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
