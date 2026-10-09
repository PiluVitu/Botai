import type { Meta, StoryObj } from '@storybook/nextjs'
import { MesmaSemente } from './mesma-semente'

const meta = {
  title: 'Landing/MesmaSemente',
  component: MesmaSemente,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MesmaSemente>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// A coluna útil de uma tela de 320 px: entrada, portas e saída empilhadas.
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
export const A320pxClaro: Story = {
  ...A320px,
  globals: { tema: 'claro' },
}
