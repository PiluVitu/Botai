import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import {
  arquivoDaUrl,
  conferirBuild,
  conferirCabecalhos,
  conferirLlmsFull,
  conferirLlmsTxt,
  conferirRobots,
  conferirSitemap,
  linksDoSite,
  locsDoSitemap,
  paginasDoBuild,
} from './conferir-build.mjs'

const RAIZ = 'https://docs.exemplo.com.br/'

const pagina = (loc, { extra = '', corpo = '' } = {}) =>
  `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><title>X</title>` +
  `<link data-rh="true" rel="canonical" href="${loc}">` +
  `<meta data-rh="true" name="description" content="Uma descrição &quot;boa&quot;.">` +
  `<meta data-rh="true" property="og:description" content="Uma descrição.">${extra}` +
  `</head><body>${corpo}</body></html>`

const LLMS = [
  '# Exemplo — documentação',
  '',
  '> Um resumo.',
  '',
  'O parágrafo da raiz.',
  '',
  '## Geral',
  '',
  `- [Intro](${RAIZ}): A raiz.`,
  '',
  '## CLI',
  '',
  `- [CLI](${RAIZ}cli): A pasta.`,
  `- [Pessoa](${RAIZ}cli/pessoa): Uma pessoa.`,
  '',
  '## Mais',
  '',
  `- [Documentação completa em texto](${RAIZ}llms-full.txt): Tudo.`,
  '- [Site do Exemplo](https://exemplo.com.br): O site.',
  '',
].join('\n')

const LLMS_FULL = [
  '# Exemplo — documentação',
  '',
  '> Um resumo.',
  '',
  `Índice das páginas: ${RAIZ}llms.txt`,
  '',
  '# Intro',
  '',
  `URL: ${RAIZ}`,
  '',
  '> A raiz.',
  '',
  `Veja [a pessoa](${RAIZ}cli/pessoa#erros).`,
  '',
  '```bash',
  '# um comentário de shell não é página',
  'curl http://127.0.0.1:8790/pessoa',
  '```',
  '',
  '# Pessoa',
  '',
  `URL: ${RAIZ}cli/pessoa`,
  '',
  '> Uma pessoa.',
  '',
  '## Erros',
  '',
  'Texto.',
  '',
].join('\n')

const SITEMAP = (locs) =>
  `<?xml version="1.0" encoding="UTF-8"?><urlset>${locs.map((loc) => `<url><loc>${loc}</loc></url>`).join('')}</urlset>`

const ROBOTS = `User-agent: *\nAllow: /\n\nSitemap: ${RAIZ}sitemap.xml\n# llms.txt: ${RAIZ}llms.txt\n`

function montarBuild(trocas = {}) {
  const pasta = mkdtempSync(join(tmpdir(), 'botai-build-'))
  const arquivos = {
    'index.html': pagina(RAIZ),
    'cli/index.html': pagina(`${RAIZ}cli`),
    'cli/pessoa/index.html': pagina(`${RAIZ}cli/pessoa`, {
      corpo:
        '<h2 class="anchor" id="erros">Erros</h2><h2 id="1-inválido">x</h2>',
    }),
    '404.html': pagina(`${RAIZ}404`, {
      extra: '<meta name="robots" content="noindex">',
    }),
    'assets/js/main.js': '',
    'sitemap.xml': SITEMAP([
      RAIZ,
      `${RAIZ}cli`,
      `${RAIZ}cli/pessoa`,
      `${RAIZ}llms.txt`,
    ]),
    'robots.txt': ROBOTS,
    'llms.txt': LLMS,
    'llms-full.txt': LLMS_FULL,
    ...trocas,
  }
  for (const [caminho, conteudo] of Object.entries(arquivos)) {
    if (conteudo === null) continue
    mkdirSync(dirname(join(pasta, caminho)), { recursive: true })
    writeFileSync(join(pasta, caminho), conteudo)
  }
  return pasta
}

function conferir(trocas) {
  const pasta = montarBuild(trocas)
  try {
    return conferirBuild(pasta, RAIZ)
  } finally {
    rmSync(pasta, { recursive: true, force: true })
  }
}

test('o build certo passa', () => {
  const { erros, paginas, links } = conferir()
  assert.deepEqual(erros, [])
  assert.equal(paginas, 3)
  assert.equal(links, 6)
})

test('falta o llms.txt ou o llms-full.txt: reprova', () => {
  assert.match(
    conferir({ 'llms.txt': null }).erros.join('\n'),
    /falta o llms\.txt/,
  )
  assert.match(
    conferir({ 'llms-full.txt': null }).erros.join('\n'),
    /falta o llms-full\.txt/,
  )
})

test('llms.txt fora do formato: reprova', () => {
  const casos = [
    ['sem o # Nome', LLMS.replace('# Exemplo', 'Exemplo'), /linha 1/],
    ['sem o resumo', LLMS.replace('> Um resumo.', 'Um resumo.'), /resumo/],
    [
      'sem o parágrafo',
      LLMS.replace('O parágrafo da raiz.\n\n', ''),
      /parágrafo/,
    ],
    [
      'item fora do padrão',
      LLMS.replace(`- [Intro](${RAIZ}): A raiz.`, `* [Intro](${RAIZ})`),
      /linha 9/,
    ],
    [
      'link sem https',
      LLMS.replace('https://exemplo.com.br', 'http://exemplo.com.br'),
      /sem https/,
    ],
    [
      'seção vazia',
      LLMS.replace(`- [Intro](${RAIZ}): A raiz.\n`, ''),
      /vazia|## Seção/,
    ],
    ['duas quebras no fim', `${LLMS}\n`, /exatamente uma quebra/],
    ['sem quebra no fim', LLMS.trimEnd(), /exatamente uma quebra/],
    [
      'URL do localhost',
      LLMS.replace('O site.', 'Veja http://localhost:3022/x.'),
      /URL local: http:\/\/localhost:3022\/x/,
    ],
    [
      'URL do 127.0.0.1',
      LLMS.replace('O site.', 'Veja http://127.0.0.1:8790.'),
      /URL local: http:\/\/127\.0\.0\.1:8790/,
    ],
    [
      'e-mail que não é o público',
      LLMS.replace('O site.', 'Fale com fulano@gmail.com.'),
      /fulano@gmail\.com/,
    ],
  ]
  for (const [nome, texto, erro] of casos)
    assert.match(conferirLlmsTxt(texto).join('\n'), erro, nome)
  assert.deepEqual(
    conferirLlmsTxt(LLMS.replace('O site.', 'Fale com help@pilutech.com.br.')),
    [],
  )
  assert.deepEqual(
    conferirLlmsTxt(LLMS.replace('O site.', 'Use só em localhost e staging.')),
    [],
  )
})

test('llms-full.txt fora do formato: reprova', () => {
  const casos = [
    [
      'sem o link do llms.txt',
      LLMS_FULL.replace(`${RAIZ}llms.txt`, 'outro'),
      /cabeçalho/,
    ],
    [
      'URL sem o título antes',
      LLMS_FULL.replace('# Pessoa\n\n', ''),
      /linha \d+ precisa vir depois/,
    ],
    [
      'URL de outro site',
      LLMS_FULL.replace(`URL: ${RAIZ}cli/pessoa`, 'URL: https://outro.com/x'),
      /de fora do site/,
    ],
    [
      'link relativo que sobrou',
      LLMS_FULL.replace('Texto.', 'Veja [x](./outra.md#y).'),
      /link relativo/,
    ],
    [
      'título com {#id}',
      LLMS_FULL.replace('## Erros', '## Erros {#erros}'),
      /\{#id\}/,
    ],
    [
      'bloco com testar',
      LLMS_FULL.replace('```bash\n#', '```bash testar=1\n#'),
      /testar/,
    ],
    [
      'nenhuma página',
      LLMS_FULL.split('\n').slice(0, 6).join('\n') + '\n',
      /nenhuma página/,
    ],
    ['duas quebras no fim', `${LLMS_FULL}\n`, /exatamente uma quebra/],
  ]
  for (const [nome, texto, erro] of casos)
    assert.match(conferirLlmsFull(texto, RAIZ).join('\n'), erro, nome)
})

test('link do site sem página no build, ou com âncora que não existe: reprova', () => {
  assert.match(
    conferir({
      'llms.txt': LLMS.replace(`${RAIZ}cli/pessoa)`, `${RAIZ}cli/sumiu)`),
    }).erros.join('\n'),
    /link sem página no build: https:\/\/docs\.exemplo\.com\.br\/cli\/sumiu/,
  )
  assert.match(
    conferir({
      'llms-full.txt': LLMS_FULL.replace('pessoa#erros', 'pessoa#sumiu'),
    }).erros.join('\n'),
    /âncora que não existe na página: .*#sumiu/,
  )
  assert.deepEqual(
    conferir({
      'llms-full.txt': LLMS_FULL.replace(
        'pessoa#erros',
        'pessoa#1-inv%C3%A1lido',
      ),
    }).erros,
    [],
  )
  assert.match(
    conferir({ 'llms-full.txt': null, 'llms.txt': LLMS }).erros.join('\n'),
    /llms-full/,
  )
})

test('página do sitemap que não está no llms.txt: reprova', () => {
  assert.match(
    conferir({
      'llms.txt': LLMS.replace(`- [CLI](${RAIZ}cli): A pasta.\n`, ''),
    }).erros.join('\n'),
    /llms\.txt: falta a página https:\/\/docs\.exemplo\.com\.br\/cli$/m,
  )
})

test('sitemap diferente das páginas do build (menos o 404, mais o llms.txt): reprova', () => {
  const sem = (...fora) =>
    SITEMAP(
      [RAIZ, `${RAIZ}cli`, `${RAIZ}cli/pessoa`, `${RAIZ}llms.txt`].filter(
        (loc) => !fora.includes(loc),
      ),
    )
  assert.match(
    conferir({ 'sitemap.xml': sem(`${RAIZ}cli`) }).erros.join('\n'),
    /falta a página https:\/\/docs\.exemplo\.com\.br\/cli$/m,
  )
  assert.match(
    conferir({ 'sitemap.xml': sem(`${RAIZ}llms.txt`) }).erros.join('\n'),
    /falta a página .*llms\.txt/,
  )
  assert.match(
    conferir({
      'sitemap.xml': SITEMAP([
        RAIZ,
        `${RAIZ}cli`,
        `${RAIZ}cli/pessoa`,
        `${RAIZ}llms.txt`,
        `${RAIZ}404`,
      ]),
    }).erros.join('\n'),
    /<loc> sem página no build: .*\/404/,
  )
  assert.match(
    conferirSitemap([RAIZ, RAIZ, `${RAIZ}llms.txt`], [RAIZ], RAIZ).join('\n'),
    /repetido/,
  )
})

test('canonical, description e noindex de cada página do sitemap', () => {
  const loc = `${RAIZ}cli`
  assert.deepEqual(conferirCabecalhos(pagina(loc), loc), [])
  const casos = [
    ['canonical diferente', pagina(`${RAIZ}outra`), /canonical/],
    [
      'dois canonical',
      pagina(loc, { extra: `<link rel="canonical" href="${loc}">` }),
      /achei 2/,
    ],
    ['sem canonical', pagina(loc).replace(/<link[^>]*>/, ''), /achei 0/],
    [
      'sem description',
      pagina(loc).replace(/<meta data-rh="true" name="description"[^>]*>/, ''),
      /description/,
    ],
    [
      'description vazia',
      pagina(loc).replace(
        /content="Uma descrição &quot;boa&quot;\."/,
        'content="  "',
      ),
      /description/,
    ],
    [
      'noindex',
      pagina(loc, {
        extra: '<meta name="robots" content="noindex, nofollow">',
      }),
      /noindex/,
    ],
  ]
  for (const [nome, html, erro] of casos)
    assert.match(conferirCabecalhos(html, loc).join('\n'), erro, nome)
  assert.match(
    conferir({ 'cli/index.html': pagina(`${RAIZ}cli/`) }).erros.join('\n'),
    /https:\/\/docs\.exemplo\.com\.br\/cli: precisa de um canonical/,
  )
})

test('robots.txt sem a linha Sitemap ou sem a do llms.txt: reprova', () => {
  assert.deepEqual(conferirRobots(ROBOTS, RAIZ), [])
  assert.match(
    conferirRobots(ROBOTS.replace(/^Sitemap.*$/m, ''), RAIZ).join('\n'),
    /Sitemap/,
  )
  assert.match(
    conferirRobots(ROBOTS.replace(/^# llms.*$/m, ''), RAIZ).join('\n'),
    /# llms\.txt/,
  )
  assert.match(
    conferir({ 'robots.txt': 'User-agent: *\n' }).erros.join('\n'),
    /falta a linha "Sitemap/,
  )
})

test('as funções de apoio: links, URL para arquivo, páginas e <loc>', () => {
  assert.deepEqual(
    linksDoSite(
      `Veja ${RAIZ}a. E [b](${RAIZ}b#x), ${RAIZ}a e https://outro.com/c.`,
      RAIZ,
    ),
    [`${RAIZ}a`, `${RAIZ}b#x`],
  )
  assert.deepEqual(
    locsDoSitemap('<loc> https://x/a?b=1&amp;c=2 </loc><loc>https://x/</loc>'),
    ['https://x/a?b=1&c=2', 'https://x/'],
  )
  const pasta = montarBuild()
  try {
    assert.deepEqual(paginasDoBuild(pasta, RAIZ), [
      RAIZ,
      `${RAIZ}cli`,
      `${RAIZ}cli/pessoa`,
    ])
    assert.equal(
      arquivoDaUrl(`${RAIZ}cli/pessoa#erros`, pasta, RAIZ),
      join(pasta, 'cli/pessoa/index.html'),
    )
    assert.equal(
      arquivoDaUrl(`${RAIZ}llms.txt`, pasta, RAIZ),
      join(pasta, 'llms.txt'),
    )
    assert.equal(arquivoDaUrl(`${RAIZ}cli/sumiu`, pasta, RAIZ), undefined)
    assert.equal(arquivoDaUrl(`${RAIZ}assets`, pasta, RAIZ), undefined)
  } finally {
    rmSync(pasta, { recursive: true, force: true })
  }
})
