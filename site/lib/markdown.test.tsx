import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@piluvitu/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import {
  Component,
  createElement,
  forwardRef,
  memo,
  useState,
  type ReactNode,
} from 'react'
import { BotaoCopiar } from '@/components/botao-copiar'
import { BotaoTema } from '@/components/botao-tema'
import { LinhaDeComando } from '@/components/linha-de-comando'
import { MenuSecoes } from '@/components/menu-secoes'
import { TeclaLocal } from '@/components/tecla-local'
import { markdownDoMain, type OpcoesDoMarkdown } from './markdown'

const SITE = 'https://botai.pilutech.com.br'

function md(
  conteudo: ReactNode,
  opcoes: Partial<OpcoesDoMarkdown> = {},
): string {
  return markdownDoMain(<main>{conteudo}</main>, { siteUrl: SITE, ...opcoes })
}

describe('o que entra', () => {
  it('só o main: cabeçalho, menus e rodapé ficam fora', () => {
    expect(
      markdownDoMain(
        <div>
          <header>
            <nav>
              <a href="https://exemplo.dev">Menu</a>
            </nav>
          </header>
          <main>
            <p>Corpo</p>
          </main>
          <footer>
            <p>Rodapé</p>
          </footer>
        </div>,
        { siteUrl: SITE },
      ),
    ).toBe('Corpo')
  })

  it('componente de servidor é chamado, inclusive o que vem antes do main', () => {
    function Cabeca() {
      return <header>Cabeça</header>
    }
    function Corpo({ texto }: { texto: string }) {
      return <p>{texto}</p>
    }
    function Pagina() {
      return (
        <>
          <Cabeca />
          <main>
            <Corpo texto="Do componente" />
          </main>
        </>
      )
    }
    expect(markdownDoMain(<Pagina />, { siteUrl: SITE })).toBe('Do componente')
  })

  it('sem main, erro', () => {
    expect(() => markdownDoMain(<p>Solto</p>, { siteUrl: SITE })).toThrow(
      'A página não tem <main>',
    )
  })
})

describe('componentes', () => {
  // Nada some em silêncio: componente que o conversor não sabe chamar derruba o build.
  it('sem regra e com hook: erro alto, com o nome do componente', () => {
    const erroDoReact = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    function Contador() {
      const [valor] = useState(1)
      return <p>{valor}</p>
    }
    expect(() => md(<Contador />)).toThrow(
      /não conseguiu chamar o componente "Contador".*tabela de site\/lib\/markdown\.tsx/,
    )
    erroDoReact.mockRestore()
  })

  it('forwardRef, memo, referência de cliente, classe e assíncrono sem regra: erro com o nome', () => {
    const Referencia = forwardRef<HTMLParagraphElement>(
      function Referencia(_, ref) {
        return <p ref={ref}>x</p>
      },
    )
    const Memorizado = memo(function Memorizado() {
      return <p>x</p>
    })
    const Cliente = Object.assign(
      () => {
        throw new Error('Attempted to call Cliente() from the server')
      },
      {
        $$typeof: Symbol.for('react.client.reference'),
        $$id: '[project]/site/components/cliente.tsx#Cliente',
      },
    )
    class Classe extends Component {
      render() {
        return <p>x</p>
      }
    }
    async function Assincrono() {
      return <p>x</p>
    }
    expect(() => md(<Referencia />)).toThrow(/"Referencia" \(é forwardRef/)
    expect(() => md(<Memorizado />)).toThrow(/"Memorizado" \(é forwardRef/)
    expect(() => md(createElement(Cliente))).toThrow(
      /"Cliente" \(é um componente de cliente\)/,
    )
    expect(() => md(<Classe />)).toThrow(/"Classe" \(é um componente de classe/)
    expect(() => md(<Assincrono />)).toThrow(/"Assincrono" \(é assíncrono/)
  })

  it('BotaoCopiar, BotaoTema, MenuSecoes, TeclaLocal, Image e FontAwesomeIcon não entram', () => {
    expect(
      md(
        <p>
          Texto
          <BotaoCopiar texto="npx botai" rotulo="Copiar" />
          <BotaoTema />
          <MenuSecoes ancoras={[{ id: 'portas', rotulo: 'Portas' }]} />
          <TeclaLocal />
          <Image src="/captura.png" alt="Captura" width={10} height={10} />
          <FontAwesomeIcon icon={faCopy} />
        </p>,
      ),
    ).toBe('Texto')
  })

  it('Link vira link com o caminho absoluto e os filhos', () => {
    expect(
      md(
        <p>
          Leia os <Link href="/termos">termos de uso</Link>.
        </p>,
      ),
    ).toBe(`Leia os [termos de uso](${SITE}/termos).`)
  })

  it('LinhaDeComando vira bloco cercado, sem linguagem e sem o $ do prompt', () => {
    expect(md(<LinhaDeComando linhas={['npx a', 'npx b']} prompt />)).toBe(
      '```\nnpx a\nnpx b\n```',
    )
    expect(
      md(
        <pre>
          <LinhaDeComando linhas={['npx c']} />
        </pre>,
      ),
    ).toBe('```\nnpx c\n```')
  })

  it('Button com asChild segue os filhos; sem asChild, é um botão e não entra', () => {
    expect(
      md(
        <Button asChild>
          <a href="https://docs.exemplo.dev">
            <FontAwesomeIcon icon={faCopy} />
            Docs
          </a>
        </Button>,
      ),
    ).toBe('[Docs](https://docs.exemplo.dev)')
    expect(
      md(
        <p>
          Antes<Button>Clique</Button>
        </p>,
      ),
    ).toBe('Antes')
  })
})

describe('o que não entra', () => {
  it('aria-hidden (true ou "true") e hidden; o texto só para leitor de tela entra', () => {
    expect(
      md(
        <h1>
          <span className="sr-only">Botaí: </span>
          Visível
          <span aria-hidden>$</span>
          <span aria-hidden="true">x</span>
          <span hidden>y</span>
        </h1>,
      ),
    ).toBe('# Botaí: Visível')
  })

  it('da figure, só a legenda', () => {
    expect(
      md(
        <figure>
          <div>
            <p>Ilustração</p>
          </div>
          <figcaption>A legenda</figcaption>
        </figure>,
      ),
    ).toBe('A legenda')
  })

  it('button, img, svg, input, select, textarea, script, style e noscript', () => {
    expect(
      md(
        <div>
          Texto
          <button type="button">B</button>
          {createElement('img', { src: '/x.png', alt: 'imagem' })}
          <svg>
            <title>s</title>
          </svg>
          <input defaultValue="v" />
          <select defaultValue="o">
            <option>o</option>
          </select>
          <textarea defaultValue="t" />
          <script>{'x'}</script>
          <style>{'y'}</style>
          <noscript>n</noscript>
        </div>,
      ),
    ).toBe('Texto')
  })
})

describe('blocos', () => {
  it('títulos rebaixados, no máximo h6; título vazio não sai', () => {
    expect(
      md(
        <>
          <h1>Um</h1>
          <h2>Dois</h2>
          <h5>Cinco</h5>
          <h6>Seis</h6>
          <h3>
            <span aria-hidden>·</span>
          </h3>
        </>,
        { rebaixar: 1 },
      ),
    ).toBe('## Um\n\n### Dois\n\n###### Cinco\n\n###### Seis')
  })

  it('contêiner: o texto solto vira parágrafo, entre os blocos', () => {
    expect(
      md(
        <section>
          Solto <strong>forte</strong>
          <p>Bloco</p>e depois
        </section>,
      ),
    ).toBe('Solto **forte**\n\nBloco\n\ne depois')
  })

  it('listas aninhadas com recuo de 2 espaços, e a ol numerada', () => {
    expect(
      md(
        <ul>
          <li>
            Um
            <ul>
              <li>Dois</li>
              <li>Três</li>
            </ul>
          </li>
          <li>Quatro</li>
        </ul>,
      ),
    ).toBe('- Um\n  - Dois\n  - Três\n- Quatro')
    expect(
      md(
        <ol>
          <li>Primeiro</li>
          <li>Segundo</li>
        </ol>,
      ),
    ).toBe('1. Primeiro\n2. Segundo')
  })

  it('item com mais de um bloco: lista solta, com o resto do item recuado', () => {
    expect(
      md(
        <ol>
          <li>
            <h3>Nome</h3>
            <p>Texto</p>
          </li>
          <li>Outro</li>
        </ol>,
        { rebaixar: 1 },
      ),
    ).toBe('1. #### Nome\n\n   Texto\n\n2. Outro')
  })

  // No CommonMark, duas listas com o mesmo marcador separadas só por uma linha em branco viram uma
  // lista só: as etiquetas de "Para quem" entrariam na lista de itens, e a dl da pessoa na de regras.
  it('lista logo depois de outra troca o marcador, para não virar uma lista só', () => {
    expect(
      md(
        <div>
          <ul>
            <li>a</li>
          </ul>
          <div>
            <ul>
              <li>b</li>
              <li>
                c
                <ul>
                  <li>c1</li>
                </ul>
              </li>
            </ul>
          </div>
          <dl>
            <dt>d</dt>
            <dd>e</dd>
          </dl>
        </div>,
      ),
    ).toBe('- a\n\n* b\n* c\n  - c1\n\n- **d:** e')
    expect(
      md(
        <>
          <ol>
            <li>um</li>
            <li>dois</li>
          </ol>
          <ol>
            <li>três</li>
          </ol>
          <ul>
            <li>x</li>
          </ul>
        </>,
      ),
    ).toBe('1. um\n2. dois\n\n1) três\n\n- x')
    expect(
      md(
        <ul>
          <li>
            <h3>Persona</h3>
            <ul>
              <li>etiqueta</li>
            </ul>
            <ul>
              <li>item</li>
            </ul>
          </li>
        </ul>,
        { rebaixar: 1 },
      ),
    ).toBe('- #### Persona\n\n  - etiqueta\n\n  * item')
  })

  it('com um parágrafo no meio, as duas listas mantêm o marcador', () => {
    expect(
      md(
        <>
          <ul>
            <li>a</li>
          </ul>
          <p>texto</p>
          <ul>
            <li>b</li>
          </ul>
        </>,
      ),
    ).toBe('- a\n\ntexto\n\n- b')
  })

  it('item vazio não sai', () => {
    expect(
      md(
        <ul>
          <li>
            <span aria-hidden>•</span>
          </li>
          <li>Item</li>
        </ul>,
      ),
    ).toBe('- Item')
  })

  it('tabela GFM: legenda, cabeçalho, separador e linhas; "|" escapado e quebra vira espaço', () => {
    expect(
      md(
        <table>
          <caption>Atalhos</caption>
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">
                <code>a|b</code>
              </th>
              <td>
                um
                <br />
                dois
              </td>
            </tr>
            <tr>
              <td>só</td>
            </tr>
          </tbody>
        </table>,
      ),
    ).toBe(
      'Atalhos\n\n| Nome | Valor |\n| --- | --- |\n| `a\\|b` | um dois |\n| só | |',
    )
  })

  it('dl: cada dt com o seu dd, inclusive dentro de div', () => {
    expect(
      md(
        <dl>
          <div>
            <dt>Para quê</dt>
            <dd>Testar</dd>
          </div>
          <dt>Prazo:</dt>
          <dd>Um dia</dd>
          <dd>ou dois</dd>
        </dl>,
      ),
    ).toBe('- **Para quê:** Testar\n- **Prazo:** Um dia ou dois')
  })

  it('pre: bloco cercado, sem espaço no fim da linha; crase no código alonga a cerca', () => {
    expect(
      md(
        <pre>
          <code>{'linha 1   \n  linha 2\n'}</code>
        </pre>,
      ),
    ).toBe('```\nlinha 1\n  linha 2\n```')
    expect(md(<pre>{'a ``` b'}</pre>)).toBe('````\na ``` b\n````')
  })

  it('blockquote', () => {
    expect(
      md(
        <blockquote>
          <p>Um</p>
          <p>Dois</p>
        </blockquote>,
      ),
    ).toBe('> Um\n>\n> Dois')
  })
})

describe('em linha', () => {
  it('strong, em, code e kbd', () => {
    expect(
      md(
        <p>
          <strong>Forte</strong>, <em>ênfase</em>, <code>código</code> e{' '}
          <kbd>Ctrl+Shift+Y</kbd>.
        </p>,
      ),
    ).toBe('**Forte**, *ênfase*, `código` e `Ctrl+Shift+Y`.')
  })

  it('crase dupla quando o código tem crase', () => {
    expect(md(<p>{<code>a`b</code>}</p>)).toBe('`` a`b ``')
  })

  it('time, span, small e abbr viram texto; br quebra a linha', () => {
    expect(
      md(
        <p>
          <time dateTime="2026-10-02">2 de outubro</time> <small>pequeno</small>{' '}
          <abbr title="Lei Geral de Proteção de Dados">LGPD</abbr>
          <br />
          <span>segunda linha</span>
        </p>,
      ),
    ).toBe('2 de outubro pequeno LGPD\nsegunda linha')
  })

  it('links: "/x" e "#x" ficam absolutos; https, http e mailto ficam como estão', () => {
    expect(
      md(
        <p>
          <a href="/privacidade">P</a> <a href="#extensao">E</a>{' '}
          <a href="https://exemplo.dev/a">H</a>{' '}
          <a href="http://127.0.0.1:8790">L</a>{' '}
          <a href="mailto:help@pilutech.com.br?subject=x">M</a>
        </p>,
        { caminho: '/termos' },
      ),
    ).toBe(
      `[P](${SITE}/privacidade) [E](${SITE}/termos#extensao) [H](https://exemplo.dev/a) [L](http://127.0.0.1:8790) [M](mailto:help@pilutech.com.br?subject=x)`,
    )
    expect(md(<a href="#portas">Portas</a>)).toBe(`[Portas](${SITE}/#portas)`)
  })

  it('link de outro esquema, relativo sem "/" ou para outro host sem esquema: erro', () => {
    for (const href of [
      'javascript:alert(1)',
      'ftp://exemplo.dev',
      'termos',
      '//exemplo.dev',
    ])
      expect(() => md(<a href={href}>x</a>)).toThrow(
        `só aceita link https:, http:, mailto:, "/" ou "#": "${href}"`,
      )
  })

  it('link sem texto usa o aria-label; sem os dois, erro', () => {
    expect(
      md(
        <a
          href="https://github.com/PiluVitu/Botai"
          aria-label="Código no GitHub"
        >
          <FontAwesomeIcon icon={faCopy} />
        </a>,
      ),
    ).toBe('[Código no GitHub](https://github.com/PiluVitu/Botai)')
    expect(() =>
      md(
        <a href="https://exemplo.dev">
          <FontAwesomeIcon icon={faCopy} />
        </a>,
      ),
    ).toThrow('não tem texto nem aria-label')
  })
})

describe('espaços', () => {
  it('colapsa os repetidos, sem espaço no fim da linha nem três quebras seguidas', () => {
    const texto = md(
      <div>
        <p>{'  muito    espaço  '}</p>
        {'   '}
        <div>
          <span aria-hidden>x</span>
        </div>
        <p>fim</p>
      </div>,
    )
    expect(texto).toBe('muito espaço\n\nfim')
    expect(texto).not.toMatch(/ $|\n{3}/m)
  })

  // No site, elementos colados sem texto entre eles são itens de flex, não texto corrido.
  it('elementos colados ganham um espaço, menos antes de pontuação', () => {
    expect(
      md(
        <div>
          <a href="https://a.dev">A</a>
          <a href="https://b.dev">B</a>
          <span>.</span>
        </div>,
      ),
    ).toBe('[A](https://a.dev) [B](https://b.dev).')
    expect(
      md(
        <p>
          <code>
            <span>semente: 42</span>
            <span>hoje: 1</span>
          </code>
        </p>,
      ),
    ).toBe('`semente: 42 hoje: 1`')
  })
})

describe('erros de estrutura', () => {
  it('elemento sem regra, li fora de lista, texto solto na lista e dangerouslySetInnerHTML', () => {
    expect(() =>
      md(
        <p>
          x<sup>2</sup>
        </p>,
      ),
    ).toThrow('não sabe converter <sup>')
    expect(() => md(<li>solto</li>)).toThrow('<li> fora do lugar')
    expect(() =>
      md(
        <ul>
          texto<li>item</li>
        </ul>,
      ),
    ).toThrow('"texto", solto dentro de <ul>')
    expect(() =>
      md(<div dangerouslySetInnerHTML={{ __html: '<p>x</p>' }} />),
    ).toThrow('dangerouslySetInnerHTML de <div>')
  })
})
