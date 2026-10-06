import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const { ignoreCommand } = JSON.parse(
  readFileSync(join(__dirname, 'vercel.json'), 'utf8'),
) as { ignoreCommand: string }

const [comando, caminhos] = ignoreCommand.split(' -- ')

describe('vercel.json (Ignored Build Step)', () => {
  // exit 0 cancela o build; o git diff --quiet sai 0 quando nada mudou.
  it('cancela o build só quando nada que a landing usa mudou', () => {
    expect(comando).toBe('git diff --quiet HEAD^ HEAD')
  })

  // As lojas moram no lojas.json (dentro do site); o favicon.ico sai dos ícones da extensão;
  // o @piluvitu/ui muda pelo lockfile.
  it('vigia o site, o core, os ícones da extensão e os arquivos de install e build', () => {
    expect(caminhos.split(' ')).toEqual([
      '.',
      '../packages/core',
      '../extensao/public/icon',
      '../pnpm-lock.yaml',
      '../pnpm-workspace.yaml',
      '../package.json',
      '../.npmrc',
      '../scripts/check-tailwind-source.mjs',
    ])
  })

  it('todo caminho vigiado existe (um rename deixaria o build preso no passado)', () => {
    for (const caminho of caminhos.split(' '))
      expect([caminho, existsSync(join(__dirname, caminho))]).toEqual([
        caminho,
        true,
      ])
  })
})
