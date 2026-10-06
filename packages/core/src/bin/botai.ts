#!/usr/bin/env node
import { executar } from '../cli/executar'

// Tipo mínimo local: só este arquivo fala com o processo, e o resto do pacote compila sem @types/node.
declare const process: {
  argv: string[]
  exitCode: number | undefined
  exit(codigo: number): never
  stdout: {
    write(texto: string): boolean
    on(evento: 'error', ouvinte: (erro: { code?: string }) => void): void
  }
  stderr: { write(texto: string): boolean }
}

// Leitor que foi embora (| head): EPIPE num pipe; ENOTCONN quando o stdout é o socketpair que o Node usa no macOS.
process.stdout.on('error', (erro) => {
  if (erro.code === 'EPIPE' || erro.code === 'ENOTCONN') process.exit(0)
  throw erro
})

process.exitCode = executar(process.argv.slice(2), {
  dados: (texto) => void process.stdout.write(texto),
  mensagem: (texto) => void process.stderr.write(texto),
})
