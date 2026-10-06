import { luhnValido } from '../cartao'
import { gerarCelular } from '../celular'
import { gerarCNPJ, validarCNPJ } from '../cnpj'
import { gerarCPF, validarCPF } from '../cpf'
import { gerarEndereco } from '../endereco'
import { gerarPIS, validarPIS } from '../pis'
import type { Prng } from '../prng'
import { gerarRG, validarRG } from '../rg'
import { gerarTituloEleitor, validarTituloEleitor } from '../titulo-eleitor'
import type { UF } from '../uf'

export interface Avulso {
  aceitaUf: boolean
  gerar(rng: Prng, uf: UF | undefined): string
}

export const AVULSOS: Readonly<Record<string, Avulso>> = {
  cpf: { aceitaUf: true, gerar: (rng, uf) => gerarCPF(rng, uf) },
  cnpj: { aceitaUf: false, gerar: (rng) => gerarCNPJ(rng) },
  rg: { aceitaUf: false, gerar: (rng) => gerarRG(rng) },
  pis: { aceitaUf: false, gerar: (rng) => gerarPIS(rng) },
  titulo: {
    aceitaUf: true,
    gerar: (rng, uf) => gerarTituloEleitor(rng, uf ?? 'SP'),
  },
  celular: {
    aceitaUf: true,
    gerar: (rng, uf) => gerarCelular(rng, gerarEndereco(rng, uf).ddd).formatado,
  },
  cep: { aceitaUf: true, gerar: (rng, uf) => gerarEndereco(rng, uf).cep },
}

export const VALIDADORES: Readonly<Record<string, (valor: string) => boolean>> =
  {
    cpf: validarCPF,
    cnpj: validarCNPJ,
    rg: validarRG,
    pis: validarPIS,
    titulo: (valor) => validarTituloEleitor(valor),
    cartao: luhnValido,
  }
