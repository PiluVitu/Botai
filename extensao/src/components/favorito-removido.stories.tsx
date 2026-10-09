import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { FavoritoRemovido } from './favorito-removido'

const meta = {
  title: 'Popup/1b · Favorito removido',
  component: FavoritoRemovido,
  args: {
    apelido: 'comprador PJ',
    onDesfazer: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[380px] pt-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FavoritoRemovido>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
export const ApelidoLongo: Story = {
  args: { apelido: 'cliente com CEP do PI 24' },
}
