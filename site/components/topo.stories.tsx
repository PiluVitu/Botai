import type { Meta, StoryObj } from '@storybook/nextjs'
import { Topo } from './topo'

const meta = {
  title: 'Páginas de texto/Topo',
  component: Topo,
  parameters: { layout: 'padded' },
  args: { voltar: { href: '/', rotulo: 'Botaí' } },
} satisfies Meta<typeof Topo>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
