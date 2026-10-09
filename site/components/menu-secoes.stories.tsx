import type { Meta, StoryObj } from '@storybook/nextjs'
import { ANCORAS_DA_LANDING } from '@/lib/conteudo'
import { MenuSecoes } from './menu-secoes'

// O painel é absoluto: a moldura faz o papel do cabeçalho (relative), na largura de um celular.
const meta = {
  title: 'Landing/MenuSecoes',
  component: MenuSecoes,
  parameters: { layout: 'padded' },
  args: { ancoras: ANCORAS_DA_LANDING },
  decorators: [
    (Story) => (
      <div className="border-border relative flex max-w-[358px] justify-end border-b py-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MenuSecoes>

export default meta
type Story = StoryObj<typeof meta>

export const Fechado: Story = {}
export const Aberto: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Abrir menu' }))
  },
}
export const AbertoClaro: Story = {
  ...Aberto,
  globals: { tema: 'claro' },
}
export const AbertoA320px: Story = {
  ...Aberto,
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
