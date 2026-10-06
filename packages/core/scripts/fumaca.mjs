// Fumaça contra os dourados, sem dependência: roda com o node puro nos 6 runners do release.
//   node scripts/fumaca.mjs --binario dist-bin/botai-linux-x64
//   node scripts/fumaca.mjs --url http://127.0.0.1:8790
import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const VERSAO = JSON.parse(
  readFileSync(join(RAIZ, 'package.json'), 'utf8'),
).version
const PASTA_DOURADA = join(RAIZ, 'dourado', 'v1')
const ler = (arquivo) => readFileSync(join(PASTA_DOURADA, arquivo), 'utf8')
// O índice da fase 1 diz como cada dourado foi gerado; o envelope não guarda uf nem dominioEmail.
const INDICE = JSON.parse(ler('indice.json'))

function argumentosDe(item, extras = []) {
  const { semente, hoje, uf, dominioEmail } = item.opcoes
  const args =
    item.n === undefined ? ['pessoa'] : ['pessoas', '-n', String(item.n)]
  args.push('--semente', String(semente), '--hoje', hoje)
  if (uf !== undefined) args.push('--uf', uf)
  if (dominioEmail !== undefined) args.push('--dominio-email', dominioEmail)
  return [...args, ...extras]
}

function alvoDe(item, extras = {}) {
  const { semente, hoje, uf, dominioEmail } = item.opcoes
  const consulta = new URLSearchParams({ semente: String(semente), hoje })
  if (uf !== undefined) consulta.set('uf', uf)
  if (dominioEmail !== undefined) consulta.set('dominioEmail', dominioEmail)
  if (item.n !== undefined) consulta.set('n', String(item.n))
  for (const [nome, valor] of Object.entries(extras)) consulta.set(nome, valor)
  return `${item.n === undefined ? '/pessoa' : '/pessoas'}?${consulta}`
}

// O sql da CLI e do servidor tem a linha "-- botai: …" antes dos INSERT; o derivado dourado, não.
const comoDerivado = (derivado, texto) =>
  derivado.formato === 'sql' ? texto.slice(texto.indexOf('\n') + 1) : texto

// O motor é a versão do pacote: um binário que não a embutiu (lendo o package.json em
// tempo de execução, por exemplo) falha aqui, e não no computador de quem baixou.
function igualAoDourado(obtido, item, origem) {
  const dourado = JSON.parse(ler(item.arquivo))
  assert.equal(
    obtido.motor,
    VERSAO,
    `${origem}: motor ${obtido.motor}, esperado ${VERSAO}`,
  )
  assert.deepEqual(
    { ...obtido, motor: dourado.motor },
    dourado,
    `${origem}: difere do dourado`,
  )
}

function conferirSha256(binario) {
  const somas = join(dirname(binario), 'SHA256SUMS')
  if (!existsSync(somas)) return
  const linha = readFileSync(somas, 'utf8')
    .split('\n')
    .find((l) => l.trim().split(/\s+\*?/)[1] === basename(binario))
  assert.ok(linha, `SHA256SUMS sem a linha de ${basename(binario)}`)
  const obtido = createHash('sha256')
    .update(readFileSync(binario))
    .digest('hex')
  assert.equal(
    obtido,
    linha.split(/\s+/)[0],
    `SHA256 de ${basename(binario)} não confere`,
  )
}

async function conferirUrl(base) {
  const saude = await fetch(`${base}/saude`)
  assert.equal(saude.status, 200, '/saude')
  assert.deepEqual(await saude.json(), { ok: true, formato: 1, motor: VERSAO })
  for (const item of INDICE) {
    const resposta = await fetch(`${base}${alvoDe(item)}`)
    assert.equal(
      resposta.status,
      200,
      `${item.arquivo}: status ${resposta.status}`,
    )
    igualAoDourado(await resposta.json(), item, `HTTP ${item.arquivo}`)
    for (const derivado of item.derivados ?? []) {
      const extras = { formato: derivado.formato }
      if (derivado.dialeto) extras.dialeto = derivado.dialeto
      const texto = await (await fetch(`${base}${alvoDe(item, extras)}`)).text()
      assert.equal(
        comoDerivado(derivado, texto),
        ler(derivado.arquivo),
        `HTTP ${derivado.arquivo}`,
      )
    }
  }
  const invalida = await fetch(`${base}/pessoas?n=0`)
  assert.equal(invalida.status, 400, '/pessoas?n=0')
}

function servir(binario) {
  const filho = spawn(binario, ['serve', '--porta', '0'])
  const url = new Promise((resolve, reject) => {
    let erro = ''
    filho.stderr.on('data', (parte) => {
      erro += parte
      const achado = /ouvindo em (http:\/\/\S+)/.exec(erro)
      if (achado) resolve(achado[1])
    })
    filho.on('exit', (codigo) =>
      reject(new Error(`serve saiu com ${codigo}: ${erro}`)),
    )
  })
  return { filho, url }
}

async function conferirBinario(binario) {
  conferirSha256(binario)
  const botai = (args) =>
    execFileSync(binario, args, {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    })
  for (const item of INDICE) {
    igualAoDourado(
      JSON.parse(botai(argumentosDe(item))),
      item,
      `CLI ${item.arquivo}`,
    )
    for (const derivado of item.derivados ?? []) {
      const extras = ['--formato', derivado.formato]
      if (derivado.dialeto) extras.push('--dialeto', derivado.dialeto)
      assert.equal(
        comoDerivado(derivado, botai(argumentosDe(item, extras))),
        ler(derivado.arquivo),
        `CLI ${derivado.arquivo}`,
      )
    }
  }
  const { filho, url } = servir(binario)
  try {
    await conferirUrl(await url)
  } finally {
    const fim = new Promise((resolve) => filho.once('exit', resolve))
    filho.kill('SIGTERM')
    const codigo = await fim
    // No Windows o kill não entrega sinal: o processo morre sem passar pelo encerrar().
    if (process.platform !== 'win32')
      assert.equal(codigo, 0, `serve saiu com ${codigo} no SIGTERM`)
  }
}

const [modo, alvo] = process.argv.slice(2)
assert.ok(INDICE.length > 0, `nenhum dourado em ${PASTA_DOURADA}/indice.json`)
if (modo === '--binario' && alvo) await conferirBinario(alvo)
else if (modo === '--url' && alvo) await conferirUrl(alvo)
else {
  console.error(
    'uso: node scripts/fumaca.mjs --binario <caminho> | --url <base>',
  )
  process.exit(2)
}
console.log(`fumaça ok: ${alvo} (${INDICE.length} dourados, motor ${VERSAO})`)
