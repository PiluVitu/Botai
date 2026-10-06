import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const saida = process.argv[2] ?? `${raiz}dist/navegador.iife.js`

await build({
  entryPoints: [`${raiz}src/navegador/iife.ts`],
  outfile: saida,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  legalComments: 'none',
  logLevel: 'warning',
})
