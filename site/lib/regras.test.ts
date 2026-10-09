import { gerarPessoa } from '@pilutech/botai-core'
import {
  CODIGO_UF_TITULO,
  REGIAO_FISCAL_CPF,
  UFS,
} from '@pilutech/botai-core/uf'
import { HOJE_DO_EXEMPLO, PESSOA_DO_EXEMPLO } from './exemplo'
import { DESTAQUES, destacarDigitos, REGRAS } from './regras'

describe('destacarDigitos', () => {
  it('separa o dígito pedido, contando só os dígitos', () => {
    expect(destacarDigitos('634.132.403-07', 9)).toEqual([
      '634.132.40',
      '3',
      '-07',
    ])
    expect(destacarDigitos('5022 4149 1171', 9, 10)).toEqual([
      '5022 4149 ',
      '11',
      '71',
    ])
    expect(destacarDigitos('(98) 97702-9128', 1, 2)).toEqual([
      '(',
      '98',
      ') 97702-9128',
    ])
  })

  it('texto sem o dígito pedido é erro, não destaque vazio', () => {
    expect(() => destacarDigitos('12-3', 4)).toThrow(RangeError)
  })

  // Os índices fixos valem para qualquer UF: o destaque é sempre o dado que a UF amarra.
  it.each(UFS)('com a UF %s, os destaques são os da tabela do core', (uf) => {
    const pessoa = gerarPessoa({
      semente: `uf-${uf}`,
      hoje: HOJE_DO_EXEMPLO,
      uf,
    })
    expect(destacarDigitos(pessoa.cpf, 9)[1]).toBe(
      String(REGIAO_FISCAL_CPF[uf]),
    )
    expect(destacarDigitos(pessoa.tituloEleitor, 9, 10)[1]).toBe(
      CODIGO_UF_TITULO[uf],
    )
    expect(destacarDigitos(pessoa.celular.formatado, 1, 2)[1]).toBe(
      pessoa.endereco.ddd,
    )
  })
})

describe('a pessoa do exemplo', () => {
  const { cpf, tituloEleitor, celular, endereco } = PESSOA_DO_EXEMPLO

  it('os destaques remontam o valor da pessoa', () => {
    expect(DESTAQUES.cpf.join('')).toBe(cpf)
    expect(DESTAQUES.titulo.join('')).toBe(tituloEleitor)
    expect(DESTAQUES.ddd.join('')).toBe(celular.formatado)
  })

  it('os destaques batem com a UF do endereço', () => {
    expect(endereco.uf).toBe('MA')
    expect(DESTAQUES.cpf[1]).toBe(String(REGIAO_FISCAL_CPF.MA))
    expect(DESTAQUES.titulo[1]).toBe(CODIGO_UF_TITULO.MA)
    expect(celular.ddd).toBe(endereco.ddd)
    expect(DESTAQUES.ddd[1]).toBe(endereco.ddd)
  })
})

describe('as regras', () => {
  it('os chips do design, montados da pessoa', () => {
    expect(REGRAS.map((r) => [r.chip, r.titulo])).toEqual([
      ['MA', 'CEP real'],
      ['…3-07', 'CPF da região fiscal'],
      ['(98)', 'DDD do CEP'],
      ['…11..', 'Título com o código da UF'],
      ['@', 'E-mail do nome'],
    ])
  })

  // A UF muda CPF, título, DDD e endereço; nome, nascimento, e-mail, empresa e cartão não.
  // O RG é sempre SSP/SP, e o PIS e o CNPJ não dependem dela: "os documentos" prometeria demais.
  it('a UF amarra o CPF, o DDD e o título, não "o resto" nem "os documentos"', () => {
    const [cep] = REGRAS
    expect(cep.texto).toBe(
      'O CEP existe, e a rua, o bairro e a cidade batem com ele. A UF dele amarra o CPF, o DDD e o título.',
    )
    expect(REGRAS.map((r) => r.texto).join(' ')).not.toMatch(/os documentos/)
    expect(REGRAS.map((r) => r.texto).join(' ')).not.toMatch(/o resto/)
  })

  it('"3 cobre CE, MA e PI" é a região fiscal 3 do core', () => {
    const regiao = REGIAO_FISCAL_CPF.MA
    const ufs = UFS.filter((uf) => REGIAO_FISCAL_CPF[uf] === regiao)
    expect(ufs).toEqual(['CE', 'MA', 'PI'])
    expect(REGRAS[1].texto).toBe(
      `O nono dígito é o da região fiscal da UF: ${regiao} cobre CE, MA e PI.`,
    )
  })

  it('o DDD é o do CEP', () => {
    expect(REGRAS[2].texto).toBe('O celular usa o DDD daquele CEP.')
  })

  it('"11 para o Maranhão" é o código do MA no título', () => {
    expect(REGRAS[3].texto).toBe(
      `O título de eleitor traz o código da UF, ${CODIGO_UF_TITULO.MA} para o Maranhão. RG e PIS também passam no dígito.`,
    )
  })

  // O RG é sempre SSP/SP: nenhuma regra o amarra à UF do endereço.
  it('nada de "RG do MA"', () => {
    expect(PESSOA_DO_EXEMPLO.rg).toMatchObject({
      orgaoEmissor: 'SSP',
      uf: 'SP',
    })
    expect(REGRAS.map((r) => r.texto).join(' ')).not.toMatch(/RG d[oa] /)
  })

  it('o e-mail sai do nome e tem caixa pública', () => {
    const { email, nome } = PESSOA_DO_EXEMPLO
    const slug = (texto: string) =>
      texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    expect(email.usuario).toMatch(
      new RegExp(
        `^${slug(nome.prenome)}-${slug(nome.sobrenomes.at(-1) ?? '')}-\\d{4}$`,
      ),
    )
    expect(email.caixaUrl).toBe(`https://tuamaeaquelaursa.com/${email.usuario}`)
    expect(REGRAS[4].texto).toBe(
      'Derivado do nome, com caixa de entrada pública para ler a confirmação.',
    )
  })
})
