import type { Meta, StoryObj } from '@storybook/nextjs'
import { ChamadaFinal } from './chamada-final'

const meta = {
  title: 'Landing/ChamadaFinal',
  component: ChamadaFinal,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ChamadaFinal>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// A coluna útil de uma tela de 320 px: os dois botões descem um embaixo do outro.
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
