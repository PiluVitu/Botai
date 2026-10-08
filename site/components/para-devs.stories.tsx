import type { Meta, StoryObj } from '@storybook/nextjs'
import { ParaDevs } from './para-devs'

const meta = {
  title: 'Landing/ParaDevs',
  component: ParaDevs,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ParaDevs>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// A largura útil de uma tela de 320 px (gutter de 24 px): os comandos quebram a linha.
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[272px]">
        <Story />
      </div>
    ),
  ],
}
