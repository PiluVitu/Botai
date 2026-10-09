import type { Meta, StoryObj } from '@storybook/nextjs'
import { TabelaAtalhos } from './tabela-atalhos'

const meta = {
  title: 'Landing/TabelaAtalhos',
  component: TabelaAtalhos,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TabelaAtalhos>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// A coluna útil de uma tela de 320 px: a célula do Linux quebra, e a moldura rola se precisar.
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
