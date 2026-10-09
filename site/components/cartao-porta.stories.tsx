import type { Meta, StoryObj } from '@storybook/nextjs'
import { PORTAS, type IdDaPorta } from '@/lib/portas'
import { CartaoPorta } from './cartao-porta'

function porta(id: IdDaPorta) {
  const achada = PORTAS.find((p) => p.id === id)
  if (!achada) throw new Error(`porta inexistente: ${id}`)
  return achada
}

// No desktop a grade tem 4 colunas de 288 px, a mesma largura útil de uma tela de 320 px.
const meta = {
  title: 'Landing/CartaoPorta',
  component: CartaoPorta,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <ul className="grid max-w-[288px]">
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof CartaoPorta>

export default meta
type Story = StoryObj<typeof meta>

export const Cli: Story = { args: { porta: porta('cli') } }
export const Extensao: Story = { args: { porta: porta('extensao') } }
export const Biblioteca: Story = { args: { porta: porta('biblioteca') } }
export const Motor: Story = { args: { porta: porta('motor') } }
export const CliClaro: Story = {
  args: Cli.args,
  globals: { tema: 'claro' },
}
export const ExtensaoClaro: Story = {
  args: Extensao.args,
  globals: { tema: 'claro' },
}
