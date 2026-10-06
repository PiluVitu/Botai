#!/usr/bin/env node
// Sem a sentinela no CSS emitido, o `@source` do app não alcança o `@piluvitu/ui` em `node_modules`
// e o Tailwind descartou as classes dele sem erro (ver "Gate do design system" no CLAUDE.md da raiz).

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

const SENTINEL_SELECTOR = '.ui-sentinela-nao-remover'
const SENTINEL_SOURCE = 'node_modules/@piluvitu/ui/dist'
const SEGMENTOS_IGNORADOS = ['node_modules', 'cache', 'dev']

function falhar(mensagem) {
  console.error(mensagem)
  process.exit(1)
}

function usoErrado() {
  falhar(
    [
      'Uso: node scripts/check-tailwind-source.mjs <diretório-ou-glob-de-css>',
      '',
      'Exemplos (de dentro do workspace):',
      '  node ../scripts/check-tailwind-source.mjs .next',
      '  node ../scripts/check-tailwind-source.mjs .output/chrome-mv3',
    ].join('\n'),
  )
}

function ehGlob(caminho) {
  return /[*?[\]]/.test(caminho)
}

function globParaRegExp(segmento) {
  const escapado = segmento
    .replace(/[.+^${}()|\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.')
  return new RegExp(`^${escapado}$`)
}

function pastaAusente(pasta) {
  return [
    `[check-tailwind-source] Diretório não existe: ${pasta}`,
    '',
    'O build rodou antes deste gate? Ele lê o output já gerado',
    '(`next build`, `wxt build`): rode o build primeiro.',
  ].join('\n')
}

function listar(pasta, opcoes) {
  try {
    return readdirSync(pasta, opcoes)
  } catch (erro) {
    if (erro.code === 'ENOENT') falhar(pastaAusente(pasta))
    throw erro
  }
}

function arquivosCss(argumento) {
  const absoluto = resolve(process.cwd(), argumento)

  if (ehGlob(argumento)) {
    const pasta = dirname(absoluto)
    const padrao = globParaRegExp(absoluto.slice(pasta.length + 1))
    return listar(pasta, { withFileTypes: true })
      .filter(
        (e) => e.isFile() && e.name.endsWith('.css') && padrao.test(e.name),
      )
      .map((e) => join(pasta, e.name))
  }

  let info
  try {
    info = statSync(absoluto)
  } catch (erro) {
    if (erro.code === 'ENOENT') falhar(pastaAusente(absoluto))
    throw erro
  }
  if (info.isFile()) return absoluto.endsWith('.css') ? [absoluto] : []

  // `dev/` guarda o CSS de um `next dev` antigo: contá-lo aprovava `@source` quebrado (medido no monorepo).
  return listar(absoluto, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && e.name.endsWith('.css'))
    .map((e) => join(e.parentPath ?? e.path ?? absoluto, e.name))
    .filter(
      (arquivo) =>
        !relative(absoluto, arquivo)
          .split(sep)
          .some((segmento) => SEGMENTOS_IGNORADOS.includes(segmento)),
    )
}

function sentinelaAusente(argumento, arquivos) {
  const verificados =
    arquivos.length > 0
      ? arquivos.map((arquivo) => `    - ${arquivo}`).join('\n')
      : '    (nenhum arquivo .css encontrado)'
  return [
    `[check-tailwind-source] Classe sentinela ausente no CSS emitido de "${argumento}".`,
    '',
    `O que está errado: o \`@source\` do app não está alcançando \`${SENTINEL_SOURCE}\`.`,
    'O Tailwind v4 não varreu essa pasta, então TODA classe que só existe no',
    '@piluvitu/ui (não só a sentinela) saiu do CSS final, e os componentes do',
    'design system vão renderizar sem estilo.',
    '',
    'Como conferir:',
    '  1. No CSS de entrada do app, confirme as linhas (nesta ordem):',
    "       @import 'tailwindcss';",
    "       @import '@piluvitu/ui/styles.css';",
    `       @source '<caminho relativo para>/${SENTINEL_SOURCE}';`,
    '  2. O caminho do @source é relativo ao arquivo CSS e tem de chegar ao',
    '     node_modules do workspace (extensao/ ou site/), não ao da raiz.',
    '  3. Rode o build de novo e depois este gate:',
    `       node ../scripts/check-tailwind-source.mjs ${argumento}`,
    '',
    `Classe procurada: ${SENTINEL_SELECTOR} (definida no styles.css do @piluvitu/ui)`,
    'Arquivos .css verificados:',
    verificados,
  ].join('\n')
}

const argumento = process.argv[2]
if (!argumento) usoErrado()
const arquivos = arquivosCss(argumento)
if (
  !arquivos.some((arquivo) =>
    readFileSync(arquivo, 'utf8').includes(SENTINEL_SELECTOR),
  )
)
  falhar(sentinelaAusente(argumento, arquivos))
