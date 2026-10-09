import type { Meta, StoryObj } from '@storybook/nextjs'
import { botoesDasLojas } from '@/lib/modelo'
import { Extensao } from './extensao'

const SEM_LOJA = { chromeUrl: '', firefoxUrl: '', edgeUrl: '', operaUrl: '' }
const NO_AR = {
  ...SEM_LOJA,
  chromeUrl: 'https://chromewebstore.google.com/detail/botai/abc',
  firefoxUrl: 'https://addons.mozilla.org/pt-BR/firefox/addon/botai/',
}

const meta = {
  title: 'Landing/Extensao',
  component: Extensao,
  parameters: { layout: 'padded' },
  args: { lojas: botoesDasLojas(NO_AR) },
} satisfies Meta<typeof Extensao>

export default meta
type Story = StoryObj<typeof meta>

// Chrome e Firefox no ar, Opera em revisão (o lojas.json de 2026-10-08).
export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
export const SemLoja: Story = { args: { lojas: botoesDasLojas(SEM_LOJA) } }
// A coluna útil de uma tela de 320 px: a captura desce para baixo da tabela.
export const A320px: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
