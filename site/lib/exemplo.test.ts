import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { MOTOR } from '@pilutech/botai-core'
import { executar } from '../../packages/core/src/cli/executar'
import { PACOTE_DO_CORE } from './conteudo'
import {
  COMANDO_DO_EXEMPLO,
  HOJE_DO_EXEMPLO,
  PESSOA_DO_EXEMPLO,
  SEMENTE_DO_EXEMPLO,
} from './exemplo'

const RAIZ = join(__dirname, '..', '..')
const ler = (...caminho: string[]) =>
  readFileSync(join(RAIZ, ...caminho), 'utf8')

type Envelope = {
  formato: number
  motor: string
  semente: string
  hoje: string
  pessoa: unknown
}

function rodar(argv: string[]): Envelope {
  let dados = ''
  const codigo = executar(argv, {
    dados: (texto) => {
      dados += texto
    },
    mensagem: () => {},
  })
  expect(codigo).toBe(0)
  return JSON.parse(dados) as Envelope
}

describe('a pessoa do exemplo', () => {
  // Sem --hoje a saída muda a cada dia (medido em 2026-10-09: o nascimento vira 02/03/1970).
  it('o comando do hero fixa a versão, a semente e o hoje', () => {
    expect(COMANDO_DO_EXEMPLO).toBe(
      'npx @pilutech/botai-core@0.4.1 pessoa --semente 42 --hoje 2026-10-05',
    )
    expect([SEMENTE_DO_EXEMPLO, HOJE_DO_EXEMPLO]).toEqual([42, '2026-10-05'])
  })

  // Subiu o core? O comando do hero sobe junto, e a pessoa tem de continuar a do dourado.
  it('a versão do comando é a do packages/core/package.json', () => {
    const { version } = JSON.parse(ler('packages', 'core', 'package.json')) as {
      version: string
    }
    expect(MOTOR).toBe(version)
    expect(COMANDO_DO_EXEMPLO).toContain(`${PACOTE_DO_CORE}@${version} `)
  })

  // Comando inventado não passa: o argv que o terminal passaria, sem o npx e sem o pacote.
  it('o comando roda na CLI do core e devolve a PESSOA_DO_EXEMPLO', () => {
    const [npx, pacote, ...argv] = COMANDO_DO_EXEMPLO.split(' ')
    expect([npx, pacote]).toEqual(['npx', `${PACOTE_DO_CORE}@${MOTOR}`])
    const envelope = rodar(argv)
    expect(envelope).toMatchObject({
      formato: 1,
      motor: MOTOR,
      semente: '42',
      hoje: '2026-10-05',
    })
    expect(envelope.pessoa).toEqual(PESSOA_DO_EXEMPLO)
  })

  // O dourado foi gravado pelo motor 0.2.0: o campo motor fica de fora da comparação.
  it('é a pessoa do dourado pessoa-semente-numero.json', () => {
    const indice = JSON.parse(
      ler('packages', 'core', 'dourado', 'v1', 'indice.json'),
    ) as { arquivo: string; opcoes: unknown }[]
    expect(
      indice.find((d) => d.arquivo === 'pessoa-semente-numero.json')?.opcoes,
    ).toEqual({ semente: SEMENTE_DO_EXEMPLO, hoje: HOJE_DO_EXEMPLO })
    const dourado = JSON.parse(
      ler('packages', 'core', 'dourado', 'v1', 'pessoa-semente-numero.json'),
    ) as Envelope
    expect(dourado.pessoa).toEqual(PESSOA_DO_EXEMPLO)
  })

  // O design mostra estes valores; a página lê da PESSOA_DO_EXEMPLO, e o teste garante que batem.
  it('os valores que o design mostra', () => {
    expect({
      nome: PESSOA_DO_EXEMPLO.nome.completo,
      nascimento: PESSOA_DO_EXEMPLO.nascimento.br,
      idade: PESSOA_DO_EXEMPLO.nascimento.idade,
      cpf: PESSOA_DO_EXEMPLO.cpf,
      celular: PESSOA_DO_EXEMPLO.celular.formatado,
      email: PESSOA_DO_EXEMPLO.email.endereco,
      cep: PESSOA_DO_EXEMPLO.endereco.cep,
      cidade: PESSOA_DO_EXEMPLO.endereco.cidade,
      uf: PESSOA_DO_EXEMPLO.endereco.uf,
      cnpj: PESSOA_DO_EXEMPLO.empresa.cnpj,
      cartao: PESSOA_DO_EXEMPLO.cartao.numeroFormatado,
    }).toEqual({
      nome: 'Márcio Carvalho Rodrigues',
      nascimento: '26/02/1970',
      idade: 56,
      cpf: '634.132.403-07',
      celular: '(98) 97702-9128',
      email: 'marcio-rodrigues-0337@tuamaeaquelaursa.com',
      cep: '65071-377',
      cidade: 'São Luís',
      uf: 'MA',
      cnpj: '90.849.558/0001-39',
      cartao: '5555 5555 5555 4444',
    })
  })
})
