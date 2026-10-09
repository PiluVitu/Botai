import type { Meta, StoryObj } from '@storybook/nextjs'
import { PessoaExemplo } from './pessoa-exemplo'

const meta = {
  title: 'Landing/PessoaExemplo',
  component: PessoaExemplo,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PessoaExemplo>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// A coluna útil de uma tela de 320 px: o cartão e as regras empilham, e o dl cai para uma coluna.
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
