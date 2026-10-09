import type { TipoDoCenario } from '@pilutech/botai-core/cartao'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeloDoCenario } from './selo-do-cenario'

describe('SeloDoCenario', () => {
  // Cor nunca é a única pista: o rótulo diz o cenário e cada tipo tem um ícone de forma própria.
  it.each<[TipoDoCenario, string, string, string]>([
    ['ok', 'aprovado', 'text-ok', 'circle-check'],
    ['erro', 'recusado', 'text-destructive', 'circle-xmark'],
    ['espera', 'exige 3DS', 'text-warn', 'clock'],
  ])(
    'tipo %s: o rótulo "%s" em texto, a cor %s e o ícone %s escondido do leitor',
    (tipo, rotulo, cor, icone) => {
      render(<SeloDoCenario tipo={tipo} rotulo={rotulo} />)
      const selo = screen.getByText(rotulo)
      expect(selo).toHaveClass(cor)
      expect(selo).toHaveAttribute('data-tipo', tipo)
      const svg = selo.querySelector('svg')
      expect(svg).toHaveAttribute('data-icon', icone)
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(selo).toHaveTextContent(new RegExp(`^${rotulo}$`))
    },
  )

  it('os três tipos têm ícones diferentes', () => {
    const { container } = render(
      <>
        <SeloDoCenario tipo="ok" rotulo="a" />
        <SeloDoCenario tipo="erro" rotulo="b" />
        <SeloDoCenario tipo="espera" rotulo="c" />
      </>,
    )
    const icones = [...container.querySelectorAll('svg')].map((svg) =>
      svg.getAttribute('data-icon'),
    )
    expect(new Set(icones).size).toBe(3)
  })
})
