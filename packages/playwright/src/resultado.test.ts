import { juntarFrames } from './resultado.js'

const linha = (idx: number, rotulo: string, seletor: string) => ({
  idx,
  rotulo,
  seletor,
})

describe('juntarFrames', () => {
  it('junta os frames na ordem recebida, põe o frame em cada linha e tira o idx', () => {
    const resultado = juntarFrames([
      {
        frame: 'http://teste.local/cadastro',
        resultado: {
          preenchidos: [linha(1, 'Nome completo', 'input[name="nome"]')],
          naoReconhecidos: [
            linha(2, 'Código de indicação', 'input[name="ref_code"]'),
          ],
          recusados: [linha(3, 'Senha', 'input[name="senha"]')],
        },
      },
      {
        frame: 'http://outro.local/quadro',
        resultado: {
          preenchidos: [linha(1, 'CPF', 'input[name="cpf"]')],
          naoReconhecidos: [],
          recusados: [],
        },
      },
    ])
    expect(resultado).toEqual({
      preenchidos: [
        {
          frame: 'http://teste.local/cadastro',
          rotulo: 'Nome completo',
          seletor: 'input[name="nome"]',
        },
        {
          frame: 'http://outro.local/quadro',
          rotulo: 'CPF',
          seletor: 'input[name="cpf"]',
        },
      ],
      naoReconhecidos: [
        {
          frame: 'http://teste.local/cadastro',
          rotulo: 'Código de indicação',
          seletor: 'input[name="ref_code"]',
        },
      ],
      recusados: [
        {
          frame: 'http://teste.local/cadastro',
          rotulo: 'Senha',
          seletor: 'input[name="senha"]',
        },
      ],
    })
  })

  it('sem frames, tudo vazio', () => {
    expect(juntarFrames([])).toEqual({
      preenchidos: [],
      naoReconhecidos: [],
      recusados: [],
    })
  })

  it('ignora os campos extras do ResultadoFrame (contentType, iframesDeFora)', () => {
    const resultado = juntarFrames([
      {
        frame: 'about:blank',
        resultado: {
          preenchidos: [],
          naoReconhecidos: [],
          recusados: [],
          contentType: 'text/html',
          iframesDeFora: 2,
        } as Parameters<typeof juntarFrames>[0][number]['resultado'],
      },
    ])
    expect(Object.keys(resultado)).toEqual([
      'preenchidos',
      'naoReconhecidos',
      'recusados',
    ])
  })
})
