import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ATALHOS } from '@pilutech/botai-core/atalhos'
import {
  ATALHOS_POR_SISTEMA,
  ESTADO_SEM_URL,
  INSERIR_UM_CAMPO,
  NOME_DO_NAVEGADOR,
  REQUISITOS_DA_EXTENSAO,
} from './extensao'
import { LOJAS } from './pilulabs'

const RAIZ = join(__dirname, '..', '..')
const ler = (...caminho: string[]) =>
  readFileSync(join(RAIZ, ...caminho), 'utf8')

const WXT_CONFIG = ler('extensao', 'wxt.config.ts')
const MENUS = ler('extensao', 'src', 'lib', 'menus.ts')

describe('requisitos da extensão', () => {
  // A seção promete versões mínimas: têm de ser as do manifesto. O Edge entra pela Chrome Web Store.
  it('os pisos do texto são os do wxt.config.ts', () => {
    const chromium = /minimum_chrome_version: '(\d+)'/.exec(WXT_CONFIG)?.[1]
    const firefox = /strict_min_version: '(\d+)\.0'/.exec(WXT_CONFIG)?.[1]
    expect([chromium, firefox]).toEqual(['123', '153'])
    expect(REQUISITOS_DA_EXTENSAO).toBe(
      `Chrome ${chromium}+ e Edge pela Chrome Web Store · Firefox ${firefox}+`,
    )
  })
})

describe('loja sem URL', () => {
  // Relatório de capacidades (2026-10-08): o Opera está em revisão na loja. Estado de terceiro, num texto só.
  it('o Opera diz "em revisão"; as outras, "em breve"', () => {
    expect(ESTADO_SEM_URL).toEqual({
      chrome: 'em breve',
      firefox: 'em breve',
      edge: 'em breve',
      opera: 'em revisão',
    })
  })

  it('nenhum estado diz que a loja está "disponível"', () => {
    for (const estado of Object.values(ESTADO_SEM_URL))
      expect(estado).not.toMatch(/dispon[ií]vel/i)
  })

  it('o nome curto de cada navegador', () => {
    expect(LOJAS.map((loja) => NOME_DO_NAVEGADOR[loja])).toEqual([
      'Chrome',
      'Firefox',
      'Edge',
      'Opera',
    ])
  })
})

describe('atalhos por sistema', () => {
  // A ordem do design: macOS, Windows, Linux. O Firefox no Linux é a exceção do manifesto.
  it('a tecla do Chromium em cada sistema, e o Firefox no Linux à parte', () => {
    expect(ATALHOS_POR_SISTEMA).toEqual([
      { sistema: 'macOS', tecla: '⌥⇧P', excecoes: [] },
      { sistema: 'Windows', tecla: 'Ctrl+Shift+Y', excecoes: [] },
      {
        sistema: 'Linux',
        tecla: 'Ctrl+Shift+Y',
        excecoes: [{ navegador: 'Firefox', tecla: 'Alt+Shift+P' }],
      },
    ])
  })

  // Mudou uma tecla no core? A tabela muda junto, sem atalho de navegador nenhum de fora.
  it('toda tecla de ATALHOS aparece: como a do sistema ou como exceção', () => {
    const publicadas = new Set(
      ATALHOS_POR_SISTEMA.flatMap(({ sistema, tecla, excecoes }) => [
        `${sistema}:${tecla}`,
        ...excecoes.map((e) => `${sistema}:${e.tecla}`),
      ]),
    )
    const nome = { mac: 'macOS', windows: 'Windows', linux: 'Linux' } as const
    for (const loja of LOJAS)
      for (const sistema of ['mac', 'windows', 'linux'] as const)
        expect(publicadas).toContain(
          `${nome[sistema]}:${ATALHOS[loja][sistema]}`,
        )
  })
})

describe('inserir um campo', () => {
  // O navegador agrupa os itens sob o nome da extensão; "Inserir" é o submenu de menus.ts.
  it('o caminho é o do manifesto e o do menu de contexto', () => {
    const nome = /manifest:[\s\S]*?\bname: '([^']+)'/.exec(WXT_CONFIG)?.[1]
    const inserir = /id: MENU\.inserir, title: '([^']+)'/.exec(MENUS)?.[1]
    expect([nome, inserir]).toEqual(['Botaí', 'Inserir'])
    expect(INSERIR_UM_CAMPO).toBe(`botão direito › ${nome} › ${inserir}`)
  })
})
