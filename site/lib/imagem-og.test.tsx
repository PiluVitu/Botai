import { render } from '@testing-library/react'
import {
  Children,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'
import { executar } from '../../packages/core/src/cli/executar'
import Image, { alt } from '@/app/opengraph-image'
import { NOME, PACOTE_DO_CORE, POSICIONAMENTO } from './conteudo'
import { SEMENTE_DO_EXEMPLO } from './exemplo'
import { COMANDO_DO_OG, imagemOgDaHome, PE_DO_OG, size } from './imagem-og'
import { PORTAS } from './portas'

// O ImageResponse de verdade (Satori + resvg) não roda no jsdom; o PNG 1200×630 é conferido no seo.e2e.ts.
jest.mock('next/og', () => ({
  ImageResponse: class {
    constructor(
      readonly elemento: unknown,
      readonly opcoes: unknown,
    ) {}
  },
}))

type Falsa = { elemento: ReactElement; opcoes: unknown }

function cartao(): Falsa {
  return imagemOgDaHome() as unknown as Falsa
}

type Props = { style?: CSSProperties; children?: ReactNode }

// Resolve os componentes de função, como o Satori faz antes de desenhar.
function* elementos(no: ReactNode): Generator<ReactElement<Props>> {
  if (!isValidElement<Props>(no)) return
  if (typeof no.type === 'function') {
    yield* elementos((no.type as (p: Props) => ReactNode)(no.props))
    return
  }
  yield no
  if (no.type === 'svg') return
  for (const filho of Children.toArray(no.props.children))
    yield* elementos(filho)
}

describe('imagem OG da home', () => {
  it('1200×630, como as outras rotas', () => {
    expect(cartao().opcoes).toEqual({ width: 1200, height: 630 })
    expect(size).toEqual({ width: 1200, height: 630 })
  })

  it('o texto do design: marca, domínio, posicionamento, comando, portas e PiluTech', () => {
    const { container } = render(cartao().elemento)
    const texto = container.textContent
    for (const trecho of [
      NOME,
      'botai.pilutech.com.br',
      POSICIONAMENTO,
      `$${COMANDO_DO_OG}`,
      PE_DO_OG,
      'Powered by PiluTech',
    ])
      expect(texto).toContain(trecho)
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  // O pé lista as portas da seção 01, na ordem, em minúsculas.
  it('o pé são as oito portas', () => {
    expect(PE_DO_OG).toBe(
      'extensão · cli · http · docker · binários · biblioteca · playwright · motor',
    )
    expect(PE_DO_OG).toBe(
      PORTAS.map((p) => p.nome.toLocaleLowerCase('pt-BR')).join(' · '),
    )
  })

  // Comando inventado não passa: o argv sem o npx e sem o pacote roda na CLI do core.
  it('o comando roda na CLI do core', () => {
    const [npx, pacote, ...argv] = COMANDO_DO_OG.split(' ')
    expect([npx, pacote]).toEqual(['npx', PACOTE_DO_CORE])
    let dados = ''
    const codigo = executar(argv, {
      dados: (texto) => {
        dados += texto
      },
      mensagem: () => {},
    })
    expect(codigo).toBe(0)
    expect(JSON.parse(dados)).toMatchObject({
      semente: String(SEMENTE_DO_EXEMPLO),
    })
  })

  // O Satori não lê variáveis CSS e só aceita mais de um filho com display flex.
  it('cores fixas e flex onde há mais de um filho', () => {
    const lista = Array.from(elementos(cartao().elemento))
    expect(lista.map((el) => el.type)).toContain('svg')
    for (const el of lista) {
      for (const valor of Object.values(el.props.style ?? {}))
        expect(String(valor)).not.toMatch(/var\(/)
      if (el.type !== 'svg' && Children.count(el.props.children) > 1)
        expect(el.props.style?.display).toBe('flex')
    }
  })

  it('a rota da home usa o cartão novo e o alt do posicionamento', () => {
    expect(alt).toBe(
      'Botaí: dados de teste brasileiros em todo lugar que o seu teste roda',
    )
    expect(alt).toBe(
      `${NOME}: ${POSICIONAMENTO.charAt(0).toLowerCase()}${POSICIONAMENTO.slice(1, -1)}`,
    )
    const { container } = render((Image() as unknown as Falsa).elemento)
    expect(container).toHaveTextContent(POSICIONAMENTO)
  })
})
