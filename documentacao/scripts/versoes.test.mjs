import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { DOCS, RAIZ_DO_REPO, listarDocs } from './exemplos.mjs'
import { citacoes, versoesDoRepo } from './versoes.mjs'

const so = (texto) =>
  citacoes(texto).map(({ pacote, versao }) => `${pacote} ${versao}`)

describe('citacoes', () => {
  test('pacotes do npm com versão', () => {
    assert.deepEqual(so('npx -y @pilutech/botai-core@0.4.1 pessoa'), [
      'core 0.4.1',
    ])
    assert.deepEqual(so('npm i -D @pilutech/botai-playwright@0.1.0'), [
      'playwright 0.1.0',
    ])
  })

  test('imagem, tag do release, variável do install.sh e o motor da saída', () => {
    assert.deepEqual(so('docker run --rm ghcr.io/piluvitu/botai:0.4.1'), [
      'core 0.4.1',
    ])
    assert.deepEqual(
      so('gh release download core-v0.4.1 --repo PiluVitu/Botai'),
      ['core 0.4.1'],
    )
    assert.deepEqual(so('BOTAI_VERSAO=0.4.1 sh'), ['core 0.4.1'])
    assert.deepEqual(so('{ "formato": 1, "motor": "0.4.1" }'), ['core 0.4.1'])
    assert.deepEqual(
      so('-- botai: formato 1, motor 0.4.1, semente S, hoje D'),
      ['core 0.4.1'],
    )
  })

  test('a pontuação da frase não entra na versão', () => {
    assert.deepEqual(so('Use `@pilutech/botai-core@0.4.0`.'), ['core 0.4.0'])
    assert.deepEqual(so('fixe @pilutech/botai-core@0.4.1, sempre'), [
      'core 0.4.1',
    ])
  })

  test('faixa e dist-tag aparecem como estão, para o teste exigir a versão exata', () => {
    assert.deepEqual(so('@pilutech/botai-core@^0.4.1'), ['core ^0.4.1'])
    assert.deepEqual(so('ghcr.io/piluvitu/botai:latest'), ['core latest'])
  })

  test('subpath, nome sem versão e padrão de tag não são citação de versão', () => {
    assert.deepEqual(
      so("import { x } from '@pilutech/botai-core/navegador'"),
      [],
    )
    assert.deepEqual(so('npm i -D @pilutech/botai-playwright'), [])
    assert.deepEqual(so('a tag core-v* dispara o workflow'), [])
    assert.deepEqual(so('o anexo diz motor 0.4.0'), [])
  })

  test('cada citação traz a linha', () => {
    assert.deepEqual(
      citacoes('a\n\nnpx @pilutech/botai-core@0.4.1').map((c) => c.linha),
      [3],
    )
  })
})

test('versoesDoRepo lê os package.json do core e do plugin do Playwright', () => {
  const ler = (pasta) =>
    JSON.parse(readFileSync(join(RAIZ_DO_REPO, pasta, 'package.json'), 'utf8'))
      .version
  assert.deepEqual(versoesDoRepo(), {
    core: ler('packages/core'),
    playwright: ler('packages/playwright'),
  })
})

test('toda versão citada em docs/ é a dos package.json do repo', () => {
  const repo = versoesDoRepo()
  const erradas = listarDocs(DOCS).flatMap((arquivo) =>
    citacoes(readFileSync(arquivo, 'utf8'))
      .filter(({ pacote, versao }) => versao !== repo[pacote])
      .map(
        ({ pacote, versao, linha }) =>
          `${relative(join(DOCS, '..'), arquivo)}:${linha}: ${pacote} ${versao} (o repo está na ${repo[pacote]})`,
      ),
  )
  assert.deepEqual(erradas, [])
})
