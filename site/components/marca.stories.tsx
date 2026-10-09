import type { Meta, StoryObj } from '@storybook/nextjs'
import { Marca } from './marca'

const meta = {
  title: 'Landing/Marca',
  component: Marca,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Marca>

export default meta
type Story = StoryObj<typeof meta>

export const Cabecalho: Story = { args: { tamanho: 26 } }
export const Rodape: Story = { args: { tamanho: 22 } }
export const ChamadaFinal: Story = { args: { tamanho: 56 } }
export const ChamadaFinalClaro: Story = {
  args: { tamanho: 56 },
  globals: { tema: 'claro' },
}
