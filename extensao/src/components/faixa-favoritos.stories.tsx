import { montarPessoa } from '@pilutech/botai-core/pessoa'
import { sfc32 } from '@pilutech/botai-core/prng'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import type { Favorito } from '../lib/favoritos'
import { PESSOA_DOURADA } from '../test/pessoa-dourada'
import { FaixaFavoritos } from './faixa-favoritos'

const outra = (n: number) =>
  montarPessoa(sfc32(n, n + 1, n + 2, n + 3), '2026-10-01')
const [COMPRADOR, CLIENTE, NOVA] = [outra(10), outra(20), outra(30)]
const favorito = (id: string, apelido: string, pessoa = PESSOA_DOURADA) =>
  ({
    id,
    apelido,
    pessoa,
    guardadoEm: '2026-10-09T12:00:00.000Z',
  }) satisfies Favorito
const ADMIN = favorito('f-1', 'admin do staging')
const PJ = favorito('f-2', 'comprador PJ', COMPRADOR)
const PI = favorito('f-3', 'cliente com CEP do PI', CLIENTE)

const meta = {
  title: 'Popup/1b · Favoritos',
  component: FaixaFavoritos,
  args: {
    favoritos: [ADMIN, PJ],
    ativa: PESSOA_DOURADA,
    onUsar: fn(),
    onGuardar: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[380px] pt-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FaixaFavoritos>

export default meta
type Story = StoryObj<typeof meta>

const CLARO = { globals: { tema: 'claro' } }

export const AtivaEntreOsFavoritos: Story = {}
export const AtivaEntreOsFavoritosClaro: Story = CLARO

const cabe: Story = { args: { ativa: NOVA } }
export const CabeMaisUm: Story = cabe
export const CabeMaisUmClaro: Story = { ...cabe, ...CLARO }

const vazia: Story = { args: { favoritos: [] } }
export const Vazia: Story = vazia
export const VaziaClaro: Story = { ...vazia, ...CLARO }

const limite: Story = { args: { favoritos: [ADMIN, PJ, PI], ativa: NOVA } }
export const LimiteDeTres: Story = limite
export const LimiteDeTresClaro: Story = { ...limite, ...CLARO }
