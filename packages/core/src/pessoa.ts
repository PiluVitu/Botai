import type { Rng } from './aleatorio'
import { type Celular, gerarCelular } from './celular'
import {
  type Cartao,
  gerarCartao,
  lerCartao,
  type OpcoesDoCartao,
} from './cartao'
import { gerarCPF } from './cpf'
import { type Empresa, gerarEmpresa } from './empresa'
import { type Endereco, gerarEndereco } from './endereco'
import { type Nascimento, gerarNascimento } from './nascimento'
import { type Email, type Nome, gerarEmail, gerarNome } from './nome'
import { lerDominioEmail, lerUF } from './opcoes'
import { gerarPIS } from './pis'
import { gerarRG } from './rg'
import { gerarSenha } from './senha'
import { gerarTituloEleitor } from './titulo-eleitor'
import type { UF } from './uf'

export interface Pessoa {
  nome: Nome
  nascimento: Nascimento
  cpf: string
  rg: { numero: string; orgaoEmissor: 'SSP'; uf: 'SP' }
  pis: string
  tituloEleitor: string
  celular: Celular
  email: Email
  senha: string
  endereco: Endereco
  empresa: Empresa
  cartao: Cartao
}

export interface OpcoesDaMontagem {
  uf?: UF
  dominioEmail?: string
  cartao?: OpcoesDoCartao
}

// A ordem das chamadas a rng é parte do contrato: mudar a ordem muda a pessoa de uma semente.
export function montarPessoa(
  rng: Rng,
  hojeISO: string,
  opcoes: OpcoesDaMontagem = {},
): Pessoa {
  const uf = opcoes.uf === undefined ? undefined : lerUF(opcoes.uf)
  const dominio =
    opcoes.dominioEmail === undefined
      ? undefined
      : lerDominioEmail(opcoes.dominioEmail)
  const cartao = lerCartao(opcoes.cartao)
  const nome = gerarNome(rng)
  const endereco = gerarEndereco(rng, uf)
  const nascimento = gerarNascimento(rng, hojeISO)
  return {
    nome,
    nascimento,
    cpf: gerarCPF(rng, endereco.uf),
    rg: { numero: gerarRG(rng), orgaoEmissor: 'SSP', uf: 'SP' },
    pis: gerarPIS(rng),
    tituloEleitor: gerarTituloEleitor(rng, endereco.uf),
    celular: gerarCelular(rng, endereco.ddd),
    email: gerarEmail(rng, nome, dominio),
    senha: gerarSenha(rng),
    endereco,
    empresa: gerarEmpresa(rng, nome.sobrenomes),
    cartao: gerarCartao(rng, hojeISO, nome.noCartao, cartao),
  }
}
