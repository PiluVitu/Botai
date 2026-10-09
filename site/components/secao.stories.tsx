import type { Meta, StoryObj } from '@storybook/nextjs'
import { Secao } from './secao'

const meta = {
  title: 'Landing/Secao',
  component: Secao,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Secao>

export default meta
type Story = StoryObj<typeof meta>

export const ComApoio: Story = {
  args: {
    id: 'portas',
    tituloId: 'portas-titulo',
    numero: 1,
    rotulo: 'Portas',
    titulo: 'Um motor, oito portas.',
    apoio:
      'Todas usam o mesmo gerador, e as que preenchem formulário usam o mesmo motor. Escolha a que cabe no seu teste.',
    className: 'mt-0',
  },
}
export const SemApoio: Story = {
  args: {
    tituloId: 'quem-titulo',
    numero: 4,
    rotulo: 'Para quem',
    titulo: 'Cada um entra pela sua porta.',
    className: 'mt-0',
  },
}
export const ComApoioClaro: Story = {
  args: ComApoio.args,
  globals: { tema: 'claro' },
}
// A coluna útil de uma tela de 320 px (gutter de 16 px): o apoio desce para baixo do título.
export const ComApoioA320px: Story = {
  args: ComApoio.args,
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
