import type { Meta, StoryObj } from '@storybook/nextjs'
import { COMANDO_DO_EXEMPLO } from '@/lib/exemplo'
import { LinhaDeComando } from './linha-de-comando'

const meta = {
  title: 'Landing/LinhaDeComando',
  component: LinhaDeComando,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <pre className="bg-card border-border rounded-md border p-4 font-mono text-sm">
        <Story />
      </pre>
    ),
  ],
} satisfies Meta<typeof LinhaDeComando>

export default meta
type Story = StoryObj<typeof meta>

export const Terminal: Story = {
  args: { linhas: [COMANDO_DO_EXEMPLO], prompt: true },
}
export const Codigo: Story = {
  args: {
    linhas: [
      "import { gerarPessoa } from '@pilutech/botai-core'",
      "gerarPessoa({ semente: 42, hoje: '2026-10-05' })",
    ],
  },
}
// A coluna útil de uma tela de 320 px: o comando quebra por palavra, com o recuo pendurado.
export const TerminalA320px: Story = {
  args: Terminal.args,
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
