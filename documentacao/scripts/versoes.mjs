import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { RAIZ_DO_REPO } from './exemplos.mjs'

const VERSAO = String.raw`([^\s'"\x60()\[\]{}<>,;|&/]+)`

const PADROES = [
  ['core', new RegExp(String.raw`@pilutech/botai-core@` + VERSAO, 'g')],
  [
    'playwright',
    new RegExp(String.raw`@pilutech/botai-playwright@` + VERSAO, 'g'),
  ],
  ['core', new RegExp(String.raw`ghcr\.io/piluvitu/botai:` + VERSAO, 'g')],
  ['core', /\bcore-v(\d[^\s'"`()[\]{}<>,;|&/]*)/g],
  ['core', /\bBOTAI_VERSAO=["']?(\d[^\s'"`()[\]{}<>,;|&/]*)/g],
  ['core', /"motor":\s*"([^"]+)"/g],
  ['core', /--\s*botai:\s*formato\s+\d+,\s*motor\s+([^\s,]+)/g],
]

export function citacoes(texto) {
  return PADROES.flatMap(([pacote, padrao]) =>
    [...texto.matchAll(padrao)].map((achado) => ({
      pacote,
      versao: achado[1].replace(/[.:!?]+$/, ''),
      indice: achado.index,
    })),
  )
    .sort((a, b) => a.indice - b.indice)
    .map(({ pacote, versao, indice }) => ({
      pacote,
      versao,
      linha: texto.slice(0, indice).split('\n').length,
    }))
}

export function versoesDoRepo() {
  const versao = (pasta) =>
    JSON.parse(readFileSync(join(RAIZ_DO_REPO, pasta, 'package.json'), 'utf8'))
      .version
  return {
    core: versao('packages/core'),
    playwright: versao('packages/playwright'),
  }
}
