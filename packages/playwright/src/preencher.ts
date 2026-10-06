import type { ApiDoNavegador } from '@pilutech/botai-core/navegador'
import type { Pessoa } from '@pilutech/botai-core/pessoa'
import type { Frame, Locator, Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { juntarFrames, type ResultadoDoPreenchimento } from './resultado.js'

export interface OpcoesDoPreenchimento {
  segundaPassada?: boolean
}

type ComNavegador = typeof globalThis & { __botaiNavegador?: ApiDoNavegador }

let codigoDoNavegador: string | undefined

function codigo(): string {
  codigoDoNavegador ??= readFileSync(
    createRequire(import.meta.url).resolve(
      '@pilutech/botai-core/navegador.iife.js',
    ),
    'utf8',
  )
  return codigoDoNavegador
}

// O código vai como texto pelo evaluate, e não por addScriptTag: o evaluate passa pela CSP da página.
async function instalar(frame: Frame): Promise<void> {
  const instalado = await frame.evaluate(
    () =>
      typeof (globalThis as ComNavegador).__botaiNavegador?.preencher ===
      'function',
  )
  if (!instalado) await frame.evaluate(codigo())
}

function ehPagina(alvo: Page | Locator): alvo is Page {
  return typeof (alvo as Page).frames === 'function'
}

export async function preencherAlvo(
  alvo: Page | Locator,
  pessoa: Pessoa,
  hoje: string,
  opcoes: OpcoesDoPreenchimento = {},
): Promise<ResultadoDoPreenchimento> {
  const argumentos = {
    pessoa,
    hoje,
    segundaPassada: opcoes.segundaPassada ?? true,
  }
  if (ehPagina(alvo)) {
    const frames = alvo.frames().filter((frame) => !frame.isDetached())
    const resultados = await Promise.all(
      frames.map(async (frame) => {
        await instalar(frame)
        const resultado = await frame.evaluate(
          ({ pessoa, hoje, segundaPassada }) => {
            const api = (globalThis as ComNavegador).__botaiNavegador
            if (!api) throw new Error('o motor do Botaí não está na página')
            return api.preencher(document, pessoa, hoje, { segundaPassada })
          },
          argumentos,
        )
        return { frame: frame.url(), resultado }
      }),
    )
    return juntarFrames(resultados)
  }
  const elemento = await alvo.elementHandle()
  if (!elemento) throw new Error('o Botaí não achou o elemento do locator')
  try {
    const frame = await elemento.ownerFrame()
    if (!frame) throw new Error('o Botaí não achou o frame do locator')
    await instalar(frame)
    const resultado = await elemento.evaluate(
      (el, { pessoa, hoje, segundaPassada }) => {
        const api = (globalThis as ComNavegador).__botaiNavegador
        if (!api) throw new Error('o motor do Botaí não está na página')
        return api.preencher(el, pessoa, hoje, { segundaPassada })
      },
      argumentos,
    )
    return juntarFrames([{ frame: frame.url(), resultado }])
  } finally {
    await elemento.dispose()
  }
}
