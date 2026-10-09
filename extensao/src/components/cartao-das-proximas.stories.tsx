import type { CartaoEscolhido } from '@pilutech/botai-core/cartao'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { CartaoDasProximas } from './cartao-das-proximas'

// A escolha de verdade fica no storage (App); aqui ela vive num useState para a story responder aos cliques.
function ComEscolha(args: {
  escolha: CartaoEscolhido
  onEscolher: (escolha: CartaoEscolhido) => void
  onNovaPessoa: () => void
}) {
  const [escolha, setEscolha] = useState(args.escolha)
  return (
    <CartaoDasProximas
      escolha={escolha}
      onEscolher={(nova) => {
        args.onEscolher(nova)
        setEscolha(nova)
      }}
      onNovaPessoa={args.onNovaPessoa}
    />
  )
}

const meta = {
  title: 'Popup/1b · Cartão das próximas pessoas',
  component: CartaoDasProximas,
  args: {
    escolha: { provedor: 'stripe', cenario: 'aprovado' },
    onEscolher: fn(),
    onNovaPessoa: fn(),
  },
  render: (args) => <ComEscolha {...args} />,
  decorators: [
    (Story) => (
      <div className="w-[380px] px-2 py-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CartaoDasProximas>

export default meta
type Story = StoryObj<typeof meta>

const CLARO = { globals: { tema: 'claro' } }

export const StripeAprovado: Story = {}
export const StripeAprovadoClaro: Story = CLARO

const recusado: Story = {
  args: { escolha: { provedor: 'pagarme', cenario: 'recusado' } },
}
export const PagarmeRecusado: Story = recusado
export const PagarmeRecusadoClaro: Story = { ...recusado, ...CLARO }

const pendente: Story = {
  args: { escolha: { provedor: 'pagarme', cenario: 'pendente' } },
}
export const PagarmePendente: Story = pendente
export const PagarmePendenteClaro: Story = { ...pendente, ...CLARO }

// O rótulo mais longo do catálogo: o botão quebra a linha em vez de vazar.
const longo: Story = {
  args: { escolha: { provedor: 'stripe', cenario: 'erro-processamento' } },
}
export const RotuloLongo: Story = longo
export const RotuloLongoClaro: Story = { ...longo, ...CLARO }
