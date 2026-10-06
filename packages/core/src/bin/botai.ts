#!/usr/bin/env node
import { executar } from '../cli/executar'
import { executarServe } from './serve'

// Leitor que foi embora (| head): EPIPE num pipe; ENOTCONN quando o stdout é o socketpair que o Node usa no macOS.
process.stdout.on('error', (erro: NodeJS.ErrnoException) => {
  if (erro.code === 'EPIPE' || erro.code === 'ENOTCONN') process.exit(0)
  throw erro
})

const [comando, ...resto] = process.argv.slice(2)
if (comando === 'serve') void executarServe(resto)
else
  process.exitCode = executar(process.argv.slice(2), {
    dados: (texto) => void process.stdout.write(texto),
    mensagem: (texto) => void process.stderr.write(texto),
  })
