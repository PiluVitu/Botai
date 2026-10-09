import type { Meta, StoryObj } from '@storybook/nextjs'
import { TeclaLocal } from './tecla-local'

// Mostra a tecla do sistema de quem abre o Storybook.
const meta = {
  title: 'Landing/TeclaLocal',
  component: TeclaLocal,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TeclaLocal>

export default meta
type Story = StoryObj<typeof meta>

export const DoSistemaAtual: Story = {}
export const DoSistemaAtualClaro: Story = { globals: { tema: 'claro' } }
// Como na barra do formulário do hero.
export const NaBarraDoFormulario: Story = {
  args: { className: 'py-px text-[11px]' },
}
