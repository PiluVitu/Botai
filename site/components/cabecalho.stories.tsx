import type { Meta, StoryObj } from '@storybook/nextjs'
import { Cabecalho } from './cabecalho'

const meta = {
  title: 'Landing/Cabecalho',
  component: Cabecalho,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Cabecalho>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// Abaixo de 900 px o nav vira o botão de menu; o painel abre por baixo do cabeçalho.
export const MenuAberto: Story = {
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Abrir menu' }))
  },
}
export const MenuAbertoClaro: Story = {
  ...MenuAberto,
  globals: { ...MenuAberto.globals, tema: 'claro' },
}
// A 320 px a marca e os quatro botões só cabem com o Docs reduzido ao ícone (o nome «Docs» fica).
export const A320px: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
