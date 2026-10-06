import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { icoDePngs } from './ico'

export const ICONES_DA_EXTENSAO = join(
  process.cwd(),
  '..',
  'extensao',
  'public',
  'icon',
)
export const LADOS_DO_FAVICON = [16, 32, 48] as const

export function faviconDoBotai(
  pasta: string = ICONES_DA_EXTENSAO,
): Uint8Array<ArrayBuffer> {
  return icoDePngs(
    LADOS_DO_FAVICON.map(
      (lado) => new Uint8Array(readFileSync(join(pasta, `${lado}.png`))),
    ),
  )
}
