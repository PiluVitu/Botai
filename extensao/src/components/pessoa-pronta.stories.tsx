import { montarPessoa } from '@pilutech/botai-core/pessoa'
import { sfc32 } from '@pilutech/botai-core/prng'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn, userEvent, within } from 'storybook/test'
import {
  devolverNaLista,
  guardarNaLista,
  renomearNaLista,
  tirarDaLista,
  type Favorito,
} from '../lib/favoritos'
import { PESSOA_DOURADA } from '../test/pessoa-dourada'
import { PessoaPronta, type PessoaProntaProps } from './pessoa-pronta'
import { PopupShell } from './popup-shell'
import { Rodape } from './rodape'

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

// O storage de verdade fica no App; aqui os favoritos e a ativa vivem num useState,
// com as mesmas funções puras, para a story responder aos cliques.
function PopupComFavoritos(args: PessoaProntaProps) {
  const [pessoa, setPessoa] = useState(args.pessoa)
  const [favoritos, setFavoritos] = useState(args.favoritos)
  return (
    <PopupShell
      host={args.preencherDesabilitado ? 'chrome://settings' : 'localhost:3000'}
      status={args.preencherDesabilitado ? 'lock' : 'ok'}
      rodape={
        <Rodape
          atalho={args.atalho}
          texto="preenche sem abrir"
          comAlterar
          onAlterarAtalho={fn()}
        />
      }
      onAbrirPiluTech={fn()}
    >
      <PessoaPronta
        {...args}
        pessoa={pessoa}
        idade={pessoa.nascimento.idade}
        favoritos={favoritos}
        onGuardarFavorito={async () => {
          void args.onGuardarFavorito()
          const resultado = guardarNaLista(favoritos, pessoa, {
            id: `f-${Date.now()}`,
            guardadoEm: new Date().toISOString(),
          })
          if (resultado) setFavoritos(resultado.lista)
          return resultado?.favorito ?? null
        }}
        onTirarFavorito={async (id) => {
          void args.onTirarFavorito(id)
          const resultado = tirarDaLista(favoritos, id)
          if (resultado) setFavoritos(resultado.lista)
          return resultado?.removido ?? null
        }}
        onDevolverFavorito={async (removido) => {
          void args.onDevolverFavorito(removido)
          setFavoritos((lista) => devolverNaLista(lista, removido) ?? lista)
        }}
        onRenomearFavorito={async (id, apelido) => {
          void args.onRenomearFavorito(id, apelido)
          setFavoritos((lista) => renomearNaLista(lista, id, apelido) ?? lista)
        }}
        onUsarFavorito={(id) => {
          args.onUsarFavorito(id)
          const escolhido = favoritos.find((f) => f.id === id)
          if (escolhido) setPessoa(escolhido.pessoa)
        }}
      />
    </PopupShell>
  )
}

const meta = {
  title: 'Popup/1b · Pessoa pronta',
  component: PessoaPronta,
  args: {
    pessoa: PESSOA_DOURADA,
    idade: PESSOA_DOURADA.nascimento.idade,
    atalho: 'Ctrl+Shift+Y',
    preencherDesabilitado: false,
    favoritos: [],
    onPreencher: fn(),
    onNovaPessoa: fn(),
    onAbrirCaixa: fn(),
    onCopiar: fn(async () => undefined),
    onGuardarFavorito: fn(async () => null),
    onTirarFavorito: fn(async () => null),
    onDevolverFavorito: fn(async () => undefined),
    onRenomearFavorito: fn(async () => undefined),
    onUsarFavorito: fn(),
  },
  render: (args) => <PopupComFavoritos {...args} />,
} satisfies Meta<typeof PessoaPronta>

export default meta
type Story = StoryObj<typeof meta>

const CLARO = { globals: { tema: 'claro' } }

export const Escuro: Story = {}
export const Claro: Story = CLARO
export const SemAtalho: Story = { args: { atalho: '' } }
export const AtalhoDoMac: Story = { args: { atalho: '⌥⇧P' } }
export const VindoDaPaginaProibida: Story = {
  args: { preencherDesabilitado: true },
}

const ativaFavorita: Story = { args: { favoritos: [ADMIN, PJ] } }
export const AtivaFavorita: Story = ativaFavorita
export const AtivaFavoritaClaro: Story = { ...ativaFavorita, ...CLARO }

const novaNaoGuardada: Story = {
  args: { pessoa: NOVA, favoritos: [ADMIN, PJ] },
}
export const NovaPessoaNaoGuardada: Story = novaNaoGuardada
export const NovaPessoaNaoGuardadaClaro: Story = {
  ...novaNaoGuardada,
  ...CLARO,
}

const guardando: Story = {
  args: { pessoa: CLIENTE, favoritos: [ADMIN, PJ] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Guardar nos favoritos' }),
    )
    const campo = await canvas.findByRole('textbox', {
      name: 'Apelido do favorito',
    })
    await userEvent.clear(campo)
    await userEvent.type(campo, 'cliente com CEP do PI')
  },
}
export const GuardandoComApelido: Story = guardando
export const GuardandoComApelidoClaro: Story = { ...guardando, ...CLARO }

const limite: Story = {
  args: { pessoa: NOVA, favoritos: [ADMIN, PJ, PI] },
}
export const LimiteDeTres: Story = limite
export const LimiteDeTresClaro: Story = { ...limite, ...CLARO }

const tirou: Story = {
  args: { pessoa: COMPRADOR, favoritos: [ADMIN, PJ, PI] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Tirar dos favoritos' }),
    )
    await canvas.findByRole('button', { name: 'Desfazer' })
  },
}
export const TirouComDesfazer: Story = tirou
export const TirouComDesfazerClaro: Story = { ...tirou, ...CLARO }
