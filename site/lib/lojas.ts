import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { urlsDasLojas, type UrlsDasLojas } from './pilulabs'

export const ARQUIVO_DAS_LOJAS = join(process.cwd(), 'lojas.json')

export function lerUrlsDasLojas(
  caminho: string = process.env.BOTAI_LOJAS || ARQUIVO_DAS_LOJAS,
): UrlsDasLojas {
  return urlsDasLojas(JSON.parse(readFileSync(caminho, 'utf8')))
}
