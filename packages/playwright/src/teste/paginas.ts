import type { BrowserContext } from '@playwright/test'
import { build } from 'esbuild'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const ORIGEM = 'http://teste.local'
export const ORIGEM_DE_FORA = 'http://outro.local'

const PAGINAS_DA_EXTENSAO = new URL(
  '../../../../extensao/src/entrypoints/preencher.content/',
  import.meta.url,
)
const daExtensao = (arquivo: string) =>
  readFileSync(new URL(arquivo, PAGINAS_DA_EXTENSAO), 'utf8')

export const CADASTRO = daExtensao('cadastro.pagina.html')
export const REACT = daExtensao('react.pagina.html')
export const ENDERECO = readFileSync(
  new URL('./endereco.pagina.html', import.meta.url),
  'utf8',
)

let scriptReact: Promise<string> | undefined

// O React 19 não publica UMD: a página é empacotada aqui, com o react da extensão.
export function scriptDaPaginaReact(): Promise<string> {
  scriptReact ??= build({
    entryPoints: [
      fileURLToPath(new URL('react.pagina.tsx', PAGINAS_DA_EXTENSAO)),
    ],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    jsx: 'automatic',
    // Sem isso o esbuild lê o tsconfig da extensão, que estende o .wxt/ gerado pelo `wxt prepare` (ausente no job do CI).
    tsconfigRaw: {},
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent',
  }).then((saida) => saida.outputFiles[0].text)
  return scriptReact
}

export interface Rota {
  corpo: string
  tipo?: string
  cabecalhos?: Record<string, string>
}

export async function servir(
  context: BrowserContext,
  origem: string,
  rotas: Record<string, Rota>,
): Promise<void> {
  await context.route(`${origem}/**`, (rota) => {
    const pagina = rotas[new URL(rota.request().url()).pathname]
    if (!pagina) return rota.fulfill({ status: 404, body: 'não encontrado' })
    return rota.fulfill({
      status: 200,
      contentType: pagina.tipo ?? 'text/html; charset=utf-8',
      headers: pagina.cabecalhos,
      body: pagina.corpo,
    })
  })
}
