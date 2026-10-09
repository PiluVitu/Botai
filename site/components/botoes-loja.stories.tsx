import type { Meta, StoryObj } from '@storybook/nextjs'
import { botoesDasLojas } from '@/lib/modelo'
import { BotoesLoja } from './botoes-loja'

const SEM_LOJA = { chromeUrl: '', firefoxUrl: '', edgeUrl: '', operaUrl: '' }
const NAS_QUATRO = {
  chromeUrl: 'https://chromewebstore.google.com/detail/botai/abc',
  firefoxUrl: 'https://addons.mozilla.org/pt-BR/firefox/addon/botai/',
  edgeUrl: 'https://microsoftedge.microsoft.com/addons/detail/botai/xyz',
  operaUrl: 'https://addons.opera.com/pt-br/extensions/details/botai/',
}
const NO_AR = {
  ...SEM_LOJA,
  chromeUrl: NAS_QUATRO.chromeUrl,
  firefoxUrl: NAS_QUATRO.firefoxUrl,
}

const meta = {
  title: 'Landing/BotoesLoja',
  component: BotoesLoja,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BotoesLoja>

export default meta
type Story = StoryObj<typeof meta>

// Chrome e Firefox no ar, Opera em revisão e o Edge de fora (o lojas.json de 2026-10-08).
export const NoAr: Story = { args: { lojas: botoesDasLojas(NO_AR) } }
export const NoArClaro: Story = {
  args: NoAr.args,
  globals: { tema: 'claro' },
}
export const SemLoja: Story = { args: { lojas: botoesDasLojas(SEM_LOJA) } }
export const NasQuatro: Story = { args: { lojas: botoesDasLojas(NAS_QUATRO) } }
// A coluna útil de uma tela de 320 px (gutter de 16 px): os itens descem de linha.
export const NasQuatroA320px: Story = {
  args: NasQuatro.args,
  decorators: [
    (Story) => (
      <div className="max-w-[288px]">
        <Story />
      </div>
    ),
  ],
}
