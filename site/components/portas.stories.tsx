import type { Meta, StoryObj } from '@storybook/nextjs'
import { Portas } from './portas'

const meta = {
  title: 'Landing/Portas',
  component: Portas,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Portas>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// A coluna útil de uma tela de 320 px: uma coluna, e os comandos quebram por palavra.
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
