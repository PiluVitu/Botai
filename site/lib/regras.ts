import { PESSOA_DO_EXEMPLO } from './exemplo'

export type Partes = readonly [antes: string, destaque: string, depois: string]

export function destacarDigitos(
  texto: string,
  primeiro: number,
  ultimo: number = primeiro,
): Partes {
  const indices = Array.from(texto.matchAll(/\d/g), (m) => m.index)
  const inicio = indices[primeiro - 1]
  const fim = indices[ultimo - 1]
  if (inicio === undefined || fim === undefined)
    throw new RangeError(`"${texto}" não tem o dígito ${ultimo}`)
  return [
    texto.slice(0, inicio),
    texto.slice(inicio, fim + 1),
    texto.slice(fim + 1),
  ]
}

const { cpf, celular, tituloEleitor, endereco } = PESSOA_DO_EXEMPLO

export const DESTAQUES = {
  cpf: destacarDigitos(cpf, 9),
  ddd: destacarDigitos(celular.formatado, 1, 2),
  titulo: destacarDigitos(tituloEleitor, 9, 10),
}

export type Regra = { chip: string; titulo: string; texto: string }

export const REGRAS: Regra[] = [
  {
    chip: endereco.uf,
    titulo: 'CEP real',
    texto:
      'O CEP existe, e a rua, o bairro e a cidade batem com ele. A UF dele amarra o CPF, o DDD e o título.',
  },
  {
    chip: `…${DESTAQUES.cpf[1]}${DESTAQUES.cpf[2]}`,
    titulo: 'CPF da região fiscal',
    texto: 'O nono dígito é o da região fiscal da UF: 3 cobre CE, MA e PI.',
  },
  {
    chip: `(${DESTAQUES.ddd[1]})`,
    titulo: 'DDD do CEP',
    texto: 'O celular usa o DDD daquele CEP.',
  },
  {
    chip: `…${DESTAQUES.titulo[1]}${DESTAQUES.titulo[2].replace(/\d/g, '.')}`,
    titulo: 'Título com o código da UF',
    texto:
      'O título de eleitor traz o código da UF, 11 para o Maranhão. RG e PIS também passam no dígito.',
  },
  {
    chip: '@',
    titulo: 'E-mail do nome',
    texto:
      'Derivado do nome, com caixa de entrada pública para ler a confirmação.',
  },
]
