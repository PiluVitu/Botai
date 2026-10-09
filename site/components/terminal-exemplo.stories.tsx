import type { Meta, StoryObj } from '@storybook/nextjs'
import { TerminalExemplo } from './terminal-exemplo'

const meta = {
  title: 'Landing/TerminalExemplo',
  component: TerminalExemplo,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-[592px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TerminalExemplo>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// A coluna útil de 320 px: as linhas longas quebram com o recuo pendurado.
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
