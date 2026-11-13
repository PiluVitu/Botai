import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  TEXTOS,
  gerarLlms,
  linhaDoItem,
  percorrerBarra,
  primeiroParagrafo,
  resolverLink,
  reescreverLinks,
  tirarFrontmatter,
  tirarIdDeTitulo,
  tirarTestar,
  transformarCorpo,
} from './llms-conteudo.mjs'

const URL_DO_SITE = 'https://docs.exemplo.com.br'

const doc = (id, extra = {}) => ({
  id,
  title: `Título de ${id}`,
  description: `Descrição de ${id}.`,
  source: `@site/docs/${id}.md`,
  permalink: `/${id}`,
  unlisted: false,
  draft: false,
  ...extra,
})

const contexto = {
  fonte: 'docs/cli/pessoa.md',
  urlDaPagina: `${URL_DO_SITE}/cli/pessoa`,
  urlPorFonte: new Map([
    ['docs/cli/pessoa.md', `${URL_DO_SITE}/cli/pessoa`],
    ['docs/cli/pessoas.md', `${URL_DO_SITE}/cli/pessoas`],
    ['docs/conceitos/a-pessoa.md', `${URL_DO_SITE}/conceitos/a-pessoa`],
    ['docs/intro.md', `${URL_DO_SITE}/`],
  ]),
}
const reescrever = (destino) => resolverLink(destino, contexto)

test('tira o frontmatter (com CRLF também) e deixa o corpo', () => {
  assert.equal(
    tirarFrontmatter('---\ntitle: X\ndescription: Y\n---\n\nCorpo.\n'),
    '\nCorpo.\n',
  )
  assert.equal(tirarFrontmatter('---\r\ntitle: X\r\n---\r\nCorpo'), 'Corpo')
  assert.equal(
    tirarFrontmatter('Sem frontmatter.\n\n---\n'),
    'Sem frontmatter.\n\n---\n',
  )
})

test('link relativo para .md vira a URL absoluta da página, com a âncora', () => {
  assert.equal(reescrever('./pessoas.md'), `${URL_DO_SITE}/cli/pessoas`)
  assert.equal(reescrever('pessoas.md#lote'), `${URL_DO_SITE}/cli/pessoas#lote`)
  assert.equal(
    reescrever('../conceitos/a-pessoa.md#campos'),
    `${URL_DO_SITE}/conceitos/a-pessoa#campos`,
  )
  assert.equal(reescrever('../intro.md'), `${URL_DO_SITE}/`)
})

test('âncora da própria página vira a URL da página com a âncora', () => {
  assert.equal(reescrever('#erros'), `${URL_DO_SITE}/cli/pessoa#erros`)
})

test('link com esquema fica como está', () => {
  for (const destino of [
    'https://github.com/PiluVitu/Botai',
    'http://127.0.0.1:8790/pessoa',
    'mailto:help@pilutech.com.br',
  ])
    assert.equal(reescrever(destino), destino)
})

test('link relativo que não resolve lança, com o arquivo e o link', () => {
  for (const destino of [
    './nao-existe.md',
    '../cli/pessoa',
    '/cli/pessoa',
    '/cli/pessoa.md',
    './imagem.png',
  ])
    assert.throws(
      () => reescrever(destino),
      (erro) =>
        erro.message.includes('docs/cli/pessoa.md') &&
        erro.message.includes(`"${destino}"`),
    )
})

test('reescreve só links fora de código inline, inclusive com código no texto do link', () => {
  assert.equal(
    reescreverLinks(
      'Veja [`botai pessoas`](./pessoas.md) e [a pessoa](../conceitos/a-pessoa.md#x "título").',
      reescrever,
    ),
    `Veja [\`botai pessoas\`](${URL_DO_SITE}/cli/pessoas) e [a pessoa](${URL_DO_SITE}/conceitos/a-pessoa#x "título").`,
  )
  const emCodigo = 'Escreva `[x](./nao-existe.md)` no seu README.'
  assert.equal(reescreverLinks(emCodigo, reescrever), emCodigo)
  const duplo = 'Use ``a`[x](./nao-existe.md)`` assim.'
  assert.equal(reescreverLinks(duplo, reescrever), duplo)
})

test('tira o testar e o testar=N do info string, e mais nada', () => {
  assert.equal(tirarTestar('bash testar'), 'bash')
  assert.equal(tirarTestar('bash testar=1'), 'bash')
  assert.equal(tirarTestar('bash testar=12 title="x.sh"'), 'bash title="x.sh"')
  assert.equal(
    tirarTestar('json title="envelope.json"'),
    'json title="envelope.json"',
  )
  assert.equal(tirarTestar('bash testarx'), 'bash testarx')
  assert.equal(tirarTestar(''), '')
})

test('tira o {#id} dos títulos, e só dos títulos', () => {
  assert.equal(
    tirarIdDeTitulo('## Códigos de saída {#codigos-de-saida}'),
    '## Códigos de saída',
  )
  assert.equal(tirarIdDeTitulo('### A tabela {#a-tabela}  '), '### A tabela')
  assert.equal(
    tirarIdDeTitulo('Texto com {#id} no fim {#x}'),
    'Texto com {#id} no fim {#x}',
  )
  assert.equal(tirarIdDeTitulo('## Sem id'), '## Sem id')
})

test('o corpo: sem frontmatter, links absolutos, títulos sem id, blocos sem testar, o resto igual', () => {
  const markdown = [
    '---',
    'title: Pessoa',
    'description: D.',
    '---',
    '',
    'Gera [uma pessoa](../conceitos/a-pessoa.md).',
    '',
    '## Erros {#erros}',
    '',
    ':::note[Documentado]',
    '',
    'Veja [os erros](#erros).',
    '',
    ':::',
    '',
    '```bash testar',
    'botai pessoa --semente 42',
    '```',
    '',
    '````md',
    '```bash testar',
    '[x](./nao-existe.md)',
    '```',
    '````',
    '',
    '```json title="envelope.json"',
    '{ "link": "[x](./nao-existe.md)" }',
    '```',
    '',
  ].join('\n')
  assert.equal(
    transformarCorpo(markdown, reescrever),
    [
      `Gera [uma pessoa](${URL_DO_SITE}/conceitos/a-pessoa).`,
      '',
      '## Erros',
      '',
      ':::note[Documentado]',
      '',
      `Veja [os erros](${URL_DO_SITE}/cli/pessoa#erros).`,
      '',
      ':::',
      '',
      '```bash',
      'botai pessoa --semente 42',
      '```',
      '',
      '````md',
      '```bash testar',
      '[x](./nao-existe.md)',
      '```',
      '````',
      '',
      '```json title="envelope.json"',
      '{ "link": "[x](./nao-existe.md)" }',
      '```',
    ].join('\n'),
  )
})

test('o primeiro parágrafo, numa linha só e com os links absolutos', () => {
  assert.equal(
    primeiroParagrafo(
      '---\ntitle: X\n---\n\nO Botaí gera\n[uma pessoa](../conceitos/a-pessoa.md).\n\nOutro parágrafo.\n',
      reescrever,
    ),
    `O Botaí gera [uma pessoa](${URL_DO_SITE}/conceitos/a-pessoa).`,
  )
})

test('a página raiz que não começa por um parágrafo lança', () => {
  for (const corpo of [
    '## Título',
    ':::note[X]',
    '```bash',
    '- item',
    '| a |',
    '',
  ])
    assert.throws(
      () => primeiroParagrafo(`---\ntitle: X\n---\n\n${corpo}\n`, reescrever),
      /parágrafo/,
    )
})

const barra = [
  { type: 'doc', id: 'intro' },
  {
    type: 'category',
    label: 'Começar',
    items: [
      { type: 'doc', id: 'comecar/a' },
      {
        type: 'category',
        label: 'Sub',
        items: [{ type: 'doc', id: 'comecar/sub/b' }],
        link: {
          type: 'generated-index',
          permalink: '/comecar/sub',
          description: 'A subpasta.',
        },
      },
      { type: 'link', href: 'https://exemplo.com', label: 'Fora' },
      { type: 'html', value: '<hr>' },
      { type: 'doc', id: 'comecar/escondido' },
    ],
    link: {
      type: 'generated-index',
      permalink: '/comecar',
      description: 'Comece aqui.',
    },
  },
  {
    type: 'category',
    label: 'Com página',
    items: [{ type: 'doc', id: 'com-pagina/c' }],
    link: { type: 'doc', id: 'com-pagina/indice' },
  },
  { type: 'doc', id: 'faq' },
]
const docs = [
  doc('intro', { permalink: '/' }),
  doc('comecar/a'),
  doc('comecar/sub/b'),
  doc('comecar/escondido', { unlisted: true }),
  doc('com-pagina/indice'),
  doc('com-pagina/c'),
  doc('faq'),
]

test('a barra lateral: docs da raiz em Geral, uma seção por pasta, subpasta achatada, na ordem', () => {
  const { geral, pastas, docs: emOrdem } = percorrerBarra(barra, docs)
  assert.deepEqual(
    geral.map(({ permalink }) => permalink),
    ['/', '/faq'],
  )
  assert.deepEqual(
    pastas.map(({ titulo, itens }) => [
      titulo,
      itens.map(({ permalink }) => permalink),
    ]),
    [
      ['Começar', ['/comecar', '/comecar/a', '/comecar/sub', '/comecar/sub/b']],
      ['Com página', ['/com-pagina/indice', '/com-pagina/c']],
    ],
  )
  assert.deepEqual(pastas[0].itens[0], {
    titulo: 'Começar',
    permalink: '/comecar',
    descricao: 'Comece aqui.',
  })
  assert.deepEqual(
    emOrdem.map(({ id }) => id),
    [
      'intro',
      'comecar/a',
      'comecar/sub/b',
      'com-pagina/indice',
      'com-pagina/c',
      'faq',
    ],
  )
})

test('a barra que cita um doc inexistente lança', () => {
  assert.throws(
    () => percorrerBarra([{ type: 'doc', id: 'sumiu' }], docs),
    /"sumiu"/,
  )
})

test('o item: "- [Título](url): descrição", numa linha, sem os dois-pontos se não houver descrição', () => {
  assert.equal(
    linhaDoItem({ titulo: 'A', url: 'https://x/a', descricao: 'Uma\nfrase.' }),
    '- [A](https://x/a): Uma frase.',
  )
  assert.equal(
    linhaDoItem({ titulo: 'A', url: 'https://x/a', descricao: '' }),
    '- [A](https://x/a)',
  )
})

const siteConfig = {
  title: 'Exemplo — documentação',
  tagline: 'Um resumo de uma linha.',
  url: URL_DO_SITE,
  baseUrl: '/',
  themeConfig: {
    navbar: { items: [{ label: 'Site', href: 'https://exemplo.com.br' }] },
  },
}

const fontes = {
  'docs/intro.md':
    '---\ntitle: Intro\nslug: /\n---\n\nO Exemplo faz [uma coisa](./comecar/a.md).\n\n## Mais {#mais}\n\nResto.\n',
  'docs/comecar/a.md': '---\ntitle: A\n---\n\nVeja o [FAQ](../faq.md#x).\n',
  'docs/comecar/sub/b.md':
    '---\ntitle: B\n---\n\n```bash testar=2\nexemplo\n```\n',
  'docs/com-pagina/indice.md': '---\ntitle: Índice\n---\n\nÍndice.\n',
  'docs/com-pagina/c.md': '---\ntitle: C\n---\n\nC.\n',
  'docs/faq.md': '---\ntitle: FAQ\n---\n\n## X {#x}\n\nResposta.\n',
}
const versao = { docs, sidebars: { principal: barra } }
const lerFonte = (caminho) => {
  if (!(caminho in fontes)) throw new Error(`leu ${caminho}`)
  return fontes[caminho]
}

test('o llms.txt inteiro, a partir dos dados das páginas', () => {
  const { llms } = gerarLlms({ siteConfig, versao, lerFonte })
  assert.equal(
    llms,
    [
      '# Exemplo — documentação',
      '',
      '> Um resumo de uma linha.',
      '',
      `O Exemplo faz [uma coisa](${URL_DO_SITE}/comecar/a).`,
      '',
      `## ${TEXTOS.geral}`,
      '',
      `- [Título de intro](${URL_DO_SITE}/): Descrição de intro.`,
      `- [Título de faq](${URL_DO_SITE}/faq): Descrição de faq.`,
      '',
      '## Começar',
      '',
      `- [Começar](${URL_DO_SITE}/comecar): Comece aqui.`,
      `- [Título de comecar/a](${URL_DO_SITE}/comecar/a): Descrição de comecar/a.`,
      `- [Sub](${URL_DO_SITE}/comecar/sub): A subpasta.`,
      `- [Título de comecar/sub/b](${URL_DO_SITE}/comecar/sub/b): Descrição de comecar/sub/b.`,
      '',
      '## Com página',
      '',
      `- [Título de com-pagina/indice](${URL_DO_SITE}/com-pagina/indice): Descrição de com-pagina/indice.`,
      `- [Título de com-pagina/c](${URL_DO_SITE}/com-pagina/c): Descrição de com-pagina/c.`,
      '',
      `## ${TEXTOS.mais}`,
      '',
      `- [${TEXTOS.completa}](${URL_DO_SITE}/llms-full.txt): ${TEXTOS.descricaoDaCompleta}`,
      `- [${TEXTOS.site}](https://exemplo.com.br): ${TEXTOS.descricaoDoSite}`,
      '',
    ].join('\n'),
  )
})

test('o llms-full.txt: cabeçalho e cada doc na ordem da barra, com URL, descrição e corpo', () => {
  const { llmsFull } = gerarLlms({ siteConfig, versao, lerFonte })
  assert.ok(llmsFull.endsWith('Resposta.\n') && !llmsFull.endsWith('\n\n'))
  assert.ok(
    llmsFull.startsWith(
      [
        '# Exemplo — documentação',
        '',
        '> Um resumo de uma linha.',
        '',
        `${TEXTOS.indice} ${URL_DO_SITE}/llms.txt`,
        '',
        '# Título de intro',
        '',
        `URL: ${URL_DO_SITE}/`,
        '',
        '> Descrição de intro.',
        '',
        `O Exemplo faz [uma coisa](${URL_DO_SITE}/comecar/a).`,
        '',
        '## Mais',
        '',
        'Resto.',
        '',
        '# Título de comecar/a',
        '',
        `URL: ${URL_DO_SITE}/comecar/a`,
        '',
        '> Descrição de comecar/a.',
        '',
        `Veja o [FAQ](${URL_DO_SITE}/faq#x).`,
        '',
        '# Título de comecar/sub/b',
      ].join('\n'),
    ),
  )
  assert.match(llmsFull, /\n```bash\nexemplo\n```\n/)
  assert.deepEqual(
    [...llmsFull.matchAll(/^URL: (.*)$/gm)].map(([, url]) =>
      url.slice(URL_DO_SITE.length),
    ),
    [
      '/',
      '/comecar/a',
      '/comecar/sub/b',
      '/com-pagina/indice',
      '/com-pagina/c',
      '/faq',
    ],
  )
  assert.doesNotMatch(llmsFull, /escondido/)
})

test('sem o item Site na navbar, a seção Mais fica só com a documentação completa', () => {
  const { llms } = gerarLlms({
    siteConfig: { ...siteConfig, themeConfig: { navbar: { items: [] } } },
    versao,
    lerFonte,
  })
  assert.ok(
    llms.endsWith(
      `- [${TEXTOS.completa}](${URL_DO_SITE}/llms-full.txt): ${TEXTOS.descricaoDaCompleta}\n`,
    ),
  )
})

test('baseUrl fora da raiz entra nas URLs', () => {
  const { llms, llmsFull } = gerarLlms({
    siteConfig: { ...siteConfig, baseUrl: '/docs/' },
    versao: {
      docs: docs.map((item) => ({
        ...item,
        permalink: `/docs${item.permalink === '/' ? '/' : item.permalink}`,
      })),
      sidebars: versao.sidebars,
    },
    lerFonte,
  })
  assert.match(
    llms,
    /\(https:\/\/docs\.exemplo\.com\.br\/docs\/llms-full\.txt\)/,
  )
  assert.match(
    llmsFull,
    /^Índice das páginas: https:\/\/docs\.exemplo\.com\.br\/docs\/llms\.txt$/m,
  )
})

test('link relativo quebrado numa página derruba a geração', () => {
  assert.throws(
    () =>
      gerarLlms({
        siteConfig,
        versao,
        lerFonte: (caminho) =>
          caminho === 'docs/faq.md'
            ? 'Veja [isto](./sumiu.md).\n'
            : lerFonte(caminho),
      }),
    /docs\/faq\.md: o link "\.\/sumiu\.md"/,
  )
})

test('doc publicado fora da barra lateral derruba a geração', () => {
  assert.throws(
    () =>
      gerarLlms({
        siteConfig,
        versao: { ...versao, docs: [...docs, doc('solto')] },
        lerFonte,
      }),
    /docs\/solto\.md/,
  )
})

test('sem página com slug / a geração lança', () => {
  assert.throws(
    () =>
      gerarLlms({
        siteConfig,
        versao: {
          ...versao,
          docs: docs.map((item) => ({
            ...item,
            permalink: `/x${item.permalink}`,
          })),
        },
        lerFonte,
      }),
    /slug \//,
  )
})
