import { conferirHoje, sementeDoTeste } from './semente.js'

describe('sementeDoTeste', () => {
  it('junta projeto, arquivo e títulos com ›', () => {
    expect(
      sementeDoTeste({
        projeto: 'chromium',
        titulos: ['cadastro.e2e.ts', 'Cadastro', 'cria a conta'],
      }),
    ).toBe('chromium › cadastro.e2e.ts › Cadastro › cria a conta')
  })

  it('sem projeto (config sem projects), começa pelo arquivo', () => {
    expect(
      sementeDoTeste({
        projeto: '',
        titulos: ['cadastro.e2e.ts', 'cria a conta'],
      }),
    ).toBe('cadastro.e2e.ts › cria a conta')
  })

  it('caminho do Windows dá a mesma semente que no macOS e no Linux', () => {
    expect(
      sementeDoTeste({
        projeto: 'chromium',
        titulos: ['e2e\\cadastro.e2e.ts', 'cria a conta'],
      }),
    ).toBe('chromium › e2e/cadastro.e2e.ts › cria a conta')
  })

  it('só o arquivo é caminho: barra invertida num título fica como está', () => {
    expect(
      sementeDoTeste({ projeto: 'x', titulos: ['a.e2e.ts', 'C:\\pasta'] }),
    ).toBe('x › a.e2e.ts › C:\\pasta')
  })

  it('mesmo título em arquivos diferentes dá sementes diferentes', () => {
    const titulo = 'preenche o formulário'
    expect(
      sementeDoTeste({ projeto: 'chromium', titulos: ['a.e2e.ts', titulo] }),
    ).not.toBe(
      sementeDoTeste({ projeto: 'chromium', titulos: ['b.e2e.ts', titulo] }),
    )
  })
})

describe('conferirHoje', () => {
  it('aceita AAAA-MM-DD e devolve a mesma data', () => {
    expect(conferirHoje('2026-10-05')).toBe('2026-10-05')
  })

  it.each(['05/10/2026', '2026-1-5', '20261005', ''])(
    'recusa "%s" com mensagem que nomeia a opção',
    (hoje) => {
      expect(() => conferirHoje(hoje)).toThrow(
        `botaiHoje: esperado AAAA-MM-DD, recebido "${hoje}"`,
      )
    },
  )
})
