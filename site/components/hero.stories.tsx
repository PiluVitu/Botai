import type { Meta, StoryObj } from '@storybook/nextjs'
import { Hero } from './hero'

const meta = {
  title: 'Landing/Hero',
  component: Hero,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Hero>

export default meta
type Story = StoryObj<typeof meta>

export const Escuro: Story = {}
export const Claro: Story = { globals: { tema: 'claro' } }
// A 320 px o comando quebra por palavra, as janelas empilham e o formulário fica numa coluna.
export const A320px: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
export const A320pxClaro: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false }, tema: 'claro' },
}
