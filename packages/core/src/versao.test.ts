import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { MOTOR } from './versao'

const RAIZ = join(__dirname, '..')

describe('MOTOR', () => {
  test('é a versão do package.json', () => {
    const pacote = JSON.parse(
      readFileSync(join(RAIZ, 'package.json'), 'utf8'),
    ) as { version: string }
    expect(MOTOR).toBe(pacote.version)
  })

  test('src/versao.ts está em dia (gerar-versao --conferir sai com 0)', () => {
    const r = spawnSync(
      process.execPath,
      [join(RAIZ, 'scripts', 'gerar-versao.mjs'), '--conferir'],
      { encoding: 'utf8' },
    )
    expect(r.stderr).toBe('')
    expect(r.status).toBe(0)
  })
})
