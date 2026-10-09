import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { PESSOA_DOURADA } from '../test/pessoa-dourada'
import { CabecalhoPessoa } from './cabecalho-pessoa'

const meta = {
  title: 'Popup/1b · Cabeçalho da pessoa',
  component: CabecalhoPessoa,
  args: {
    pessoa: PESSOA_DOURADA,
    idade: PESSOA_DOURADA.nascimento.idade,
    apelido: null,
    limiteAtingido: false,
    edicao: null,
    onEstrela: fn(),
    onRenomear: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CabecalhoPessoa>

export default meta
type Story = StoryObj<typeof meta>

const CLARO = { globals: { tema: 'claro' } }

export const ForaDosFavoritos: Story = {}
export const ForaDosFavoritosClaro: Story = CLARO

const favorita: Story = { args: { apelido: 'admin do staging' } }
export const Favorita: Story = favorita
export const FavoritaClaro: Story = { ...favorita, ...CLARO }

const limite: Story = { args: { limiteAtingido: true } }
export const NoLimite: Story = limite
export const NoLimiteClaro: Story = { ...limite, ...CLARO }

const editando: Story = {
  args: {
    apelido: 'Maria',
    edicao: {
      rascunho: 'cliente com CEP do PI',
      onMudar: fn(),
      onSalvar: fn(),
      onCancelar: fn(),
    },
  },
}
export const EditandoApelido: Story = editando
export const EditandoApelidoClaro: Story = { ...editando, ...CLARO }
