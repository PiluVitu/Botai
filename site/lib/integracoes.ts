export type Integracao = { nome: string; testado: boolean; selo: string }

const testado = (nome: string, selo = 'Testado'): Integracao => ({
  nome,
  testado: true,
  selo,
})
const semTeste = (nome: string, via: 'JS' | 'HTTP'): Integracao => ({
  nome,
  testado: false,
  selo: `Sem teste · ${via}`,
})

export const INTEGRACOES: Integracao[] = [
  testado('Playwright'),
  testado('Postgres'),
  testado('SQLite'),
  testado('Python', 'Testado via HTTP'),
  testado('Node'),
  testado('Bun'),
  testado('Deno'),
  semTeste('Cypress', 'JS'),
  semTeste('Selenium', 'JS'),
  semTeste('Puppeteer', 'JS'),
  semTeste('WebdriverIO', 'JS'),
  semTeste('Go', 'HTTP'),
  semTeste('Java', 'HTTP'),
]
