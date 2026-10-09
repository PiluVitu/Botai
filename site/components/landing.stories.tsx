import type { Meta, StoryObj } from '@storybook/nextjs'
import { modeloDaLanding } from '@/lib/modelo'
import { Landing } from './landing'

const SEM_LOJA = { chromeUrl: '', firefoxUrl: '', edgeUrl: '', operaUrl: '' }
const NAS_QUATRO = {
  chromeUrl: 'https://chromewebstore.google.com/detail/botai/abc',
  firefoxUrl: 'https://addons.mozilla.org/pt-BR/firefox/addon/botai/',
  edgeUrl: 'https://microsoftedge.microsoft.com/addons/detail/botai/xyz',
  operaUrl: 'https://addons.opera.com/pt-br/extensions/details/botai/',
}
// O lojas.json de hoje: Chrome Web Store e Firefox Add-ons publicadas.
const HOJE = {
  ...SEM_LOJA,
  chromeUrl: NAS_QUATRO.chromeUrl,
  firefoxUrl: NAS_QUATRO.firefoxUrl,
}
const A_320 = { viewport: { value: 'mobile1', isRotated: false } }
const A_390 = { viewport: { value: 'mobile2', isRotated: false } }

const meta = {
  title: 'Landing/Página',
  component: Landing,
  parameters: { layout: 'fullscreen' },
  args: modeloDaLanding(HOJE),
} satisfies Meta<typeof Landing>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
export const Mobile: Story = { globals: A_390 }
export const MobileClaro: Story = { globals: { ...A_390, tema: 'claro' } }
export const A320px: Story = { globals: A_320 }
export const SemLoja: Story = { args: modeloDaLanding(SEM_LOJA) }
export const NasQuatroLojas: Story = { args: modeloDaLanding(NAS_QUATRO) }
