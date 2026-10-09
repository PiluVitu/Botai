import type { Meta, StoryObj } from '@storybook/nextjs'
import { Numeros } from './numeros'

const meta = {
  title: 'Landing/Numeros',
  component: Numeros,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Numeros>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// Na coluna de 320 px a grade cai para uma coluna (cada número pede 180 px).
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
