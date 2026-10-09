import type { Meta, StoryObj } from '@storybook/nextjs'
import { URL_DA_DOCUMENTACAO } from '@/lib/conteudo'
import { Topo } from './topo'

const meta = {
  title: 'Landing/Topo',
  component: Topo,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Topo>

export default meta
type Story = StoryObj<typeof meta>

export const DaLanding: Story = {
  args: {
    voltar: { href: 'https://piluvitu.com.br/pilulabs', rotulo: 'PiluLabs' },
    ancoras: [
      { href: '#como-usar', rotulo: 'como usar' },
      { href: '#capturas', rotulo: 'capturas' },
      { href: '#para-devs', rotulo: 'para devs' },
    ],
    docs: URL_DA_DOCUMENTACAO,
  },
}
export const DaLandingClaro: Story = {
  args: DaLanding.args,
  globals: { tema: 'claro' },
}
// A largura útil de uma tela de 320 px (gutter de 24 px): as âncoras, o Docs e o tema quebram a linha.
export const DaLandingA320px: Story = {
  args: DaLanding.args,
  decorators: [
    (Story) => (
      <div className="max-w-[272px]">
        <Story />
      </div>
    ),
  ],
}
export const DaPolitica: Story = {
  args: { voltar: { href: '/', rotulo: 'Botaí' } },
}
