import { readFileSync, writeFileSync } from 'node:fs'
import {
  gerarEnvelopeDaPessoa,
  gerarEnvelopeDasPessoas,
} from '../dist/index.js'
import { paraCsv, paraSql } from '../dist/plano.js'

const pasta = new URL('../dourado/v1/', import.meta.url)
const indice = JSON.parse(readFileSync(new URL('indice.json', pasta), 'utf8'))

for (const item of indice) {
  const envelope =
    item.n === undefined
      ? gerarEnvelopeDaPessoa(item.opcoes)
      : gerarEnvelopeDasPessoas(item.n, item.opcoes)
  const json = item.compacto
    ? JSON.stringify(envelope)
    : JSON.stringify(envelope, null, 2)
  writeFileSync(new URL(item.arquivo, pasta), `${json}\n`)
  for (const derivado of item.derivados ?? []) {
    const texto =
      derivado.formato === 'csv'
        ? paraCsv(envelope.pessoas)
        : paraSql(envelope.pessoas, { dialeto: derivado.dialeto })
    writeFileSync(new URL(derivado.arquivo, pasta), texto)
  }
  console.log(`dourado/v1/${item.arquivo}`)
}
