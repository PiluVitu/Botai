import { faTerminal } from '@fortawesome/free-solid-svg-icons'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { JanelaExemplo } from './janela-exemplo'

const meta = {
  title: 'Landing/JanelaExemplo',
  component: JanelaExemplo,
  parameters: { layout: 'padded' },
  args: {
    id: 'janela',
    legenda: 'Exemplo: uma janela',
    icone: faTerminal,
    titulo: '~/pilulabs/botai',
    detalhe: <span>terminal</span>,
    children: <p className="p-[18px] font-mono text-[13px]">conteúdo</p>,
  },
  decorators: [
    (Story) => (
      <div className="max-w-[592px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof JanelaExemplo>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
