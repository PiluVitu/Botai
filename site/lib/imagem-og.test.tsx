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

type Fonte = { name: string; data: Buffer; weight: number; style: string }
type Falsa = {
  elemento: ReactElement
  opcoes: { width: number; height: number; fonts: Fonte[] }
}

let falsa: Falsa
beforeAll(async () => {
  falsa = (await imagemOgDaHome()) as unknown as Falsa
})

function cartao(): Falsa {
  return falsa
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
    expect(cartao().opcoes).toMatchObject({ width: 1200, height: 630 })
    expect(size).toEqual({ width: 1200, height: 630 })
  })

  // A hierarquia do design depende do peso 800 e da mono; a fonte padrão do next/og só tem o 400.
  // O Satori lê .woff (não .woff2), e nada é baixado no build: os arquivos vêm do node_modules.
  it('as fontes do design, de arquivo local: Plus Jakarta Sans 800 e JetBrains Mono 400', () => {
    const fontes = cartao().opcoes.fonts
    expect(
      fontes.map(({ name, weight, style }) => ({ name, weight, style })),
    ).toEqual([
      { name: 'Plus Jakarta Sans', weight: 800, style: 'normal' },
      { name: 'JetBrains Mono', weight: 400, style: 'normal' },
    ])
    for (const { data } of fontes)
      expect(Buffer.from(data).subarray(0, 4).toString('latin1')).toBe('wOFF')
  })

  it('a marca e o título em Plus Jakarta Sans; domínio, comando e pé em JetBrains Mono', () => {
    const fontes = new Map<string, unknown>()
    // A fonte é herdada, como no CSS: o texto fica com a do ancestral mais próximo que a declara.
    function percorrer(no: ReactNode, herdada: unknown) {
      if (!isValidElement<Props>(no)) return
      if (typeof no.type === 'function') {
        percorrer((no.type as (p: Props) => ReactNode)(no.props), herdada)
        return
      }
      const fonte = no.props.style?.fontFamily ?? herdada
      for (const filho of Children.toArray(no.props.children))
        if (typeof filho === 'string') fontes.set(filho, fonte)
        else percorrer(filho, fonte)
    }
    percorrer(cartao().elemento, undefined)
    for (const texto of [NOME, POSICIONAMENTO])
      expect(fontes.get(texto)).toBe('Plus Jakarta Sans')
    for (const texto of [
      'botai.pilutech.com.br',
      COMANDO_DO_OG,
      PE_DO_OG,
      'Powered by PiluTech',
    ])
      expect(fontes.get(texto)).toBe('JetBrains Mono')
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

  it('a rota da home usa o cartão novo e o alt do posicionamento', async () => {
    expect(alt).toBe(
      'Botaí: dados de teste brasileiros em todo lugar que o seu teste roda',
    )
    expect(alt).toBe(
      `${NOME}: ${POSICIONAMENTO.charAt(0).toLowerCase()}${POSICIONAMENTO.slice(1, -1)}`,
    )
    const { container } = render(((await Image()) as unknown as Falsa).elemento)
    expect(container).toHaveTextContent(POSICIONAMENTO)
  })
})
