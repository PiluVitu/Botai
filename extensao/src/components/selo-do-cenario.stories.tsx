import type { Meta, StoryObj } from '@storybook/react-vite'
import { SeloDoCenario } from './selo-do-cenario'

const meta = {
  title: 'Popup/1b · Selo do cenário',
  component: SeloDoCenario,
  args: { tipo: 'ok', rotulo: 'aprovado' },
  decorators: [
    (Story) => (
      <div className="flex w-[380px] gap-2 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SeloDoCenario>

export default meta
type Story = StoryObj<typeof meta>

const CLARO = { globals: { tema: 'claro' } }

export const Aprovado: Story = {}
export const AprovadoClaro: Story = CLARO

const recusado: Story = { args: { tipo: 'erro', rotulo: 'recusado' } }
export const Recusado: Story = recusado
export const RecusadoClaro: Story = { ...recusado, ...CLARO }

const pendente: Story = { args: { tipo: 'espera', rotulo: 'exige 3DS' } }
export const Pendente: Story = pendente
export const PendenteClaro: Story = { ...pendente, ...CLARO }
