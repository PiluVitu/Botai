import { montarPessoa } from '@pilutech/botai-core/pessoa'
import { sfc32 } from '@pilutech/botai-core/prng'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PESSOA_ANTIGA, PESSOA_DOURADA } from '../test/pessoa-dourada'
import { CartaoAtual } from './cartao-atual'

const cartaoDe = (provedor: 'stripe' | 'pagarme', cenario: string) =>
  montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', {
    cartao: { provedor, cenario: cenario as never },
  }).cartao

const meta = {
  title: 'Popup/1b · Cartão atual',
  component: CartaoAtual,
  args: { cartao: PESSOA_DOURADA.cartao },
  decorators: [
    (Story) => (
      <div className="w-[380px] px-2 py-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CartaoAtual>

export default meta
type Story = StoryObj<typeof meta>

const CLARO = { globals: { tema: 'claro' } }

export const StripeAprovado: Story = {}
export const StripeAprovadoClaro: Story = CLARO

const recusado: Story = { args: { cartao: cartaoDe('pagarme', 'recusado') } }
export const PagarmeRecusado: Story = recusado
export const PagarmeRecusadoClaro: Story = { ...recusado, ...CLARO }

const pendente: Story = { args: { cartao: cartaoDe('stripe', 'pendente') } }
export const StripePendente: Story = pendente
export const StripePendenteClaro: Story = { ...pendente, ...CLARO }

const antiga: Story = { args: { cartao: PESSOA_ANTIGA.cartao } }
export const PessoaAntigaSemProvedor: Story = antiga
export const PessoaAntigaSemProvedorClaro: Story = { ...antiga, ...CLARO }
