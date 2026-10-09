import type { Meta, StoryObj } from '@storybook/nextjs'
import { FormularioExemplo } from './formulario-exemplo'

// A tecla da barra é a do sistema de quem abre o Storybook.
const meta = {
  title: 'Landing/FormularioExemplo',
  component: FormularioExemplo,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-[592px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormularioExemplo>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// Abaixo de 380 px de tela os campos ficam numa coluna: em duas, o CPF quebraria no meio.
export const A320px: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
