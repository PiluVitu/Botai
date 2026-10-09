import type { Meta, StoryObj } from '@storybook/nextjs'
import { Cuidados } from './cuidados'

const meta = {
  title: 'Landing/Cuidados',
  component: Cuidados,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Cuidados>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// A coluna útil de uma tela de 320 px: os dois cartões empilham.
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
