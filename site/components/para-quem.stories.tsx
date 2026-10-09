import type { Meta, StoryObj } from '@storybook/nextjs'
import { ParaQuem } from './para-quem'

const meta = {
  title: 'Landing/ParaQuem',
  component: ParaQuem,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ParaQuem>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// A coluna útil de uma tela de 320 px: os cartões ficam numa coluna e as etiquetas quebram linha.
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
