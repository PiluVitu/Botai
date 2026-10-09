import type { Meta, StoryObj } from '@storybook/nextjs'
import { AtalhoLocal, TeclaLocal } from './atalho-local'

// Mostra o atalho do sistema de quem abre o Storybook.
const meta = {
  title: 'Landing/AtalhoLocal',
  component: AtalhoLocal,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AtalhoLocal>

export default meta
type Story = StoryObj<typeof meta>

export const DoSistemaAtual: Story = {}
export const DoSistemaAtualClaro: Story = { globals: { tema: 'claro' } }
// Só a tecla, como na barra do formulário do hero.
export const SoATecla: Story = {
  render: () => <TeclaLocal className="py-px text-[11px]" />,
}
