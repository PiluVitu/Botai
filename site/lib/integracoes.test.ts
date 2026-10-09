import { INTEGRACOES } from './integracoes'

describe('integrações', () => {
  it('as 13 do design, na ordem', () => {
    expect(INTEGRACOES.map((i) => i.nome)).toEqual([
      'Playwright',
      'Postgres',
      'SQLite',
      'Python',
      'Node',
      'Bun',
      'Deno',
      'Cypress',
      'Selenium',
      'Puppeteer',
      'WebdriverIO',
      'Go',
      'Java',
    ])
  })

  // Texto honesto: só as 7 provadas no relatório de 2026-10-08 levam "Testado".
  it('só as provadas dizem "Testado"', () => {
    expect(
      INTEGRACOES.filter((i) => i.testado).map((i) => [i.nome, i.selo]),
    ).toEqual([
      ['Playwright', 'Testado'],
      ['Postgres', 'Testado'],
      ['SQLite', 'Testado'],
      ['Python', 'Testado via HTTP'],
      ['Node', 'Testado'],
      ['Bun', 'Testado'],
      ['Deno', 'Testado'],
    ])
  })

  it('as outras dizem "Sem teste" e por onde rodam', () => {
    expect(
      INTEGRACOES.filter((i) => !i.testado).map((i) => [i.nome, i.selo]),
    ).toEqual([
      ['Cypress', 'Sem teste · JS'],
      ['Selenium', 'Sem teste · JS'],
      ['Puppeteer', 'Sem teste · JS'],
      ['WebdriverIO', 'Sem teste · JS'],
      ['Go', 'Sem teste · HTTP'],
      ['Java', 'Sem teste · HTTP'],
    ])
  })

  // A 190 px por coluna (6 a 1440, como no design), "Testado via HTTP" é o maior que cabe numa linha.
  it('nenhum selo passa de 16 caracteres', () => {
    expect(INTEGRACOES.filter((i) => i.selo.length > 16)).toEqual([])
  })
})
