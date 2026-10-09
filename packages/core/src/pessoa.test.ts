import { sfc32 } from './prng'
import { montarPessoa } from './pessoa'
import { validarCPF } from './cpf'
import { validarCNPJ } from './cnpj'
import { validarRG } from './rg'
import { validarPIS } from './pis'
import { validarTituloEleitor } from './titulo-eleitor'
import { CODIGO_UF_TITULO, REGIAO_FISCAL_CPF, type UF, UFS } from './uf'
import { ErroDeOpcao } from './opcoes'
import { senhaAtendeRegrasComuns } from './senha'
import { LOGRADOUROS } from './endereco'
import {
  CATALOGO_DE_CARTOES,
  type Cenario,
  luhnValido,
  PROVEDORES,
  type Provedor,
} from './cartao'
import { slugNome } from './nome'
import { sementes } from './rng-teste'

describe('montarPessoa', () => {
  // Snapshot de propósito: muda quando um gerador muda, e a mudança tem que ser revista aqui.
  test('pessoa dourada: semente (1,2,3,4) em 2026-10-01', () => {
    expect(montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01')).toEqual({
      nome: {
        sexo: 'M',
        prenome: 'Vinícius',
        sobrenomes: ['Oliveira', 'Costa'],
        completo: 'Vinícius Oliveira Costa',
        noCartao: 'VINICIUS O COSTA',
      },
      nascimento: { iso: '1993-05-29', br: '29/05/1993', idade: 33 },
      cpf: '647.692.234-39',
      rg: { numero: '25.547.934-7', orgaoEmissor: 'SSP', uf: 'SP' },
      pis: '161.51127.87-1',
      tituloEleitor: '6080 6730 1600',
      celular: {
        ddd: '84',
        numero: '99114-8037',
        formatado: '(84) 99114-8037',
        digitos: '84991148037',
        e164: '+5584991148037',
      },
      email: {
        usuario: 'vinicius-costa-6607',
        endereco: 'vinicius-costa-6607@tuamaeaquelaursa.com',
        caixaUrl: 'https://tuamaeaquelaursa.com/vinicius-costa-6607',
      },
      senha: 's7YZgw&$iLak',
      endereco: {
        cep: '59090-000',
        logradouro: 'Avenida Engenheiro Roberto Freire',
        bairro: 'Ponta Negra',
        cidade: 'Natal',
        uf: 'RN',
        ddd: '84',
        numero: '3360',
        complemento: 'Apto 74',
      },
      empresa: {
        razaoSocial: 'Oliveira & Costa Logística Ltda',
        nomeFantasia: 'Costa Digital',
        cnpj: '35.728.569/0001-52',
      },
      cartao: {
        bandeira: 'mastercard',
        numero: '5555555555554444',
        numeroFormatado: '5555 5555 5555 4444',
        titular: 'VINICIUS O COSTA',
        validade: '08/28',
        mes: '08',
        ano: '28',
        cvv: '430',
        provedor: 'stripe',
        cenario: 'aprovado',
      },
    })
  })

  test('mesma semente ⇒ mesma pessoa', () => {
    expect(montarPessoa(sfc32(9, 8, 7, 6), '2026-10-01')).toEqual(
      montarPessoa(sfc32(9, 8, 7, 6), '2026-10-01'),
    )
  })

  test('1000 sementes: todo documento válido e todo campo coerente', () => {
    for (const r of sementes(1000)) {
      const p = montarPessoa(r, '2026-10-01')
      expect(validarCPF(p.cpf)).toBe(true)
      expect(validarRG(p.rg.numero)).toBe(true)
      expect(validarPIS(p.pis)).toBe(true)
      expect(validarCNPJ(p.empresa.cnpj)).toBe(true)
      expect(validarTituloEleitor(p.tituloEleitor, 'sem-excecao')).toBe(true)
      expect(validarTituloEleitor(p.tituloEleitor, 'com-excecao-sp-mg')).toBe(
        true,
      )
      expect(luhnValido(p.cartao.numero)).toBe(true)
      expect(senhaAtendeRegrasComuns(p.senha)).toBe(true)
      expect(p.senha).toHaveLength(12)

      expect(Number(p.cpf[10])).toBe(REGIAO_FISCAL_CPF[p.endereco.uf])
      expect(p.tituloEleitor.replace(/\s/g, '').slice(8, 10)).toBe(
        CODIGO_UF_TITULO[p.endereco.uf],
      )
      expect(p.celular.ddd).toBe(p.endereco.ddd)
      const faixa = LOGRADOUROS.find((l) => l.cep === p.endereco.cep)!.numeracao
      const numero = Number(p.endereco.numero)
      expect(numero >= faixa.min && numero <= faixa.max).toBe(true)
      if (faixa.lado !== 'ambos')
        expect(numero % 2).toBe(faixa.lado === 'par' ? 0 : 1)
      expect(p.email.usuario).toBe(
        `${slugNome(p.nome.prenome.split(' ')[0])}-${slugNome(p.nome.sobrenomes[1])}-${p.email.usuario.slice(-4)}`,
      )
      expect(p.email.usuario).toMatch(/^[a-z]+-[a-z]+-\d{4}$/)
      expect(p.email.caixaUrl).toBe(
        `https://tuamaeaquelaursa.com/${p.email.usuario}`,
      )
      expect(p.empresa.razaoSocial).toBe(
        `${p.nome.sobrenomes[0]} & ${p.nome.sobrenomes[1]} ${p.empresa.razaoSocial.split(' ').slice(3, -1).join(' ')} Ltda`,
      )
      expect(p.cartao.titular).toBe(p.nome.noCartao)
      expect(p.nascimento.idade).toBeGreaterThanOrEqual(18)
      expect(p.nascimento.idade).toBeLessThanOrEqual(65)
    }
  })
})

describe('montarPessoa com opções', () => {
  const DOURADA = () => montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01')

  test('opções vazias não mudam a pessoa dourada', () => {
    expect(montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', {})).toEqual(DOURADA())
  })

  test('uf fixa o endereço, e CPF, título e DDD seguem a UF', () => {
    for (const uf of UFS) {
      const p = montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', { uf })
      expect(p.endereco.uf).toBe(uf)
      expect(Number(p.cpf[10])).toBe(REGIAO_FISCAL_CPF[uf])
      expect(p.tituloEleitor.replace(/\s/g, '').slice(8, 10)).toBe(
        CODIGO_UF_TITULO[uf],
      )
      expect(p.celular.ddd).toBe(p.endereco.ddd)
      expect(p.nome).toEqual(DOURADA().nome)
    }
  })

  test('uf em minúscula vale; uf desconhecida lança ErroDeOpcao', () => {
    expect(
      montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', { uf: 'pi' as UF }).endereco
        .uf,
    ).toBe('PI')
    expect(() =>
      montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', { uf: 'XX' as UF }),
    ).toThrow(ErroDeOpcao)
  })

  test('dominioEmail troca só o domínio do e-mail e zera a caixa', () => {
    const p = montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', {
      dominioEmail: 'Example.COM',
    })
    expect(p.email).toEqual({
      usuario: 'vinicius-costa-6607',
      endereco: 'vinicius-costa-6607@example.com',
      caixaUrl: null,
    })
    expect({ ...p, email: DOURADA().email }).toEqual(DOURADA())
  })

  test('dominioEmail igual ao padrão mantém a caixa pública', () => {
    expect(
      montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', {
        dominioEmail: 'tuamaeaquelaursa.com',
      }),
    ).toEqual(DOURADA())
  })

  test.each(['localhost', '', 'a b.com'])(
    'dominioEmail %j lança ErroDeOpcao',
    (dominioEmail) => {
      expect(() =>
        montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', { dominioEmail }),
      ).toThrow(ErroDeOpcao)
    },
  )
})

describe('montarPessoa com cartão', () => {
  const DOURADA = () => montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01')
  const TODOS = PROVEDORES.flatMap((provedor) =>
    CATALOGO_DE_CARTOES[provedor].map(
      (c) => [provedor, c.id] as [Provedor, Cenario],
    ),
  )
  const semCartao = ({ cartao: _, ...resto }: ReturnType<typeof DOURADA>) =>
    resto

  test('cartao vazio ou padrão (stripe, aprovado) não muda a pessoa dourada', () => {
    for (const cartao of [
      {},
      { provedor: 'stripe' as const },
      { cenario: 'aprovado' as const },
      { provedor: 'stripe' as const, cenario: 'aprovado' as const },
    ])
      expect(montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', { cartao })).toEqual(
        DOURADA(),
      )
  })

  test('pagarme recusado: só o número, a bandeira, o provedor e o cenário mudam', () => {
    const p = montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', {
      cartao: { provedor: 'pagarme', cenario: 'recusado' },
    })
    expect(p.cartao).toEqual({
      ...DOURADA().cartao,
      bandeira: 'visa',
      numero: '4000000000000028',
      numeroFormatado: '4000 0000 0000 0028',
      provedor: 'pagarme',
      cenario: 'recusado',
    })
    expect(semCartao(p)).toEqual(semCartao(DOURADA()))
  })

  // A regra do contrato: a mesma semente gera a mesma pessoa em qualquer cenário.
  test.each(TODOS)(
    '%s %s: 200 sementes, todo campo fora do cartão igual ao do padrão',
    (provedor, cenario) => {
      for (let i = 0; i < 200; i++) {
        const semente = [i, i * 7, i * 13 + 1, 0xabcdef ^ i] as const
        const padrao = montarPessoa(sfc32(...semente), '2026-10-01')
        const p = montarPessoa(sfc32(...semente), '2026-10-01', {
          cartao: { provedor, cenario },
        })
        expect(semCartao(p)).toEqual(semCartao(padrao))
        const { numero, numeroFormatado, bandeira, ...resto } = p.cartao
        const { titular, validade, mes, ano, cvv } = padrao.cartao
        expect(resto).toEqual({
          titular,
          validade,
          mes,
          ano,
          cvv,
          provedor,
          cenario,
        })
        expect(luhnValido(numero)).toBe(true)
        expect(numeroFormatado.replace(/ /g, '')).toBe(numero)
        expect(bandeira).toBe(numero.startsWith('4') ? 'visa' : 'mastercard')
      }
    },
  )

  test('cartão inválido lança ErroDeOpcao com o nome da opção', () => {
    expect(() =>
      montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', {
        cartao: { provedor: 'adyen' as Provedor },
      }),
    ).toThrow(ErroDeOpcao)
    try {
      montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01', {
        cartao: { provedor: 'pagarme', cenario: 'recusado-cvc' },
      })
    } catch (erro) {
      expect((erro as ErroDeOpcao).opcao).toBe('cenario')
    }
    expect.assertions(2)
  })
})
