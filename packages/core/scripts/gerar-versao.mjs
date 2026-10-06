import { readFileSync, writeFileSync } from 'node:fs'

const raiz = new URL('../', import.meta.url)
const { version } = JSON.parse(
  readFileSync(new URL('package.json', raiz), 'utf8'),
)
const destino = new URL('src/versao.ts', raiz)
const esperado = `export const MOTOR: string = '${version}'\n`

if (process.argv.includes('--conferir')) {
  if (readFileSync(destino, 'utf8') !== esperado) {
    console.error(
      `src/versao.ts não bate com o package.json (${version}): rode node scripts/gerar-versao.mjs`,
    )
    process.exit(1)
  }
} else {
  writeFileSync(destino, esperado)
}
