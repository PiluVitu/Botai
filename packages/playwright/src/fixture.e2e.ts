import {
  gerarPessoa,
  type EnvelopeDaPessoa,
  type Semente,
  type UF,
} from '@pilutech/botai-core'
import { test as base, mergeTests } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  expect,
  fixturesBotai,
  sementeDoTeste,
  test,
  type FixturesBotai,
} from './index.js'
import { ORIGEM, servir } from './teste/paginas.js'

test('a semente padrão vem do projeto e do título do teste, e fica nas anotações', ({
  botai,
}, testInfo) => {
  expect(botai.semente).toBe(
    sementeDoTeste({
      projeto: testInfo.project.name,
      titulos: testInfo.titlePath,
    }),
  )
  expect(botai.semente).toBe(
    `${testInfo.project.name} › fixture.e2e.ts › a semente padrão vem do projeto e do título do teste, e fica nas anotações`,
  )
  expect(testInfo.annotations).toContainEqual({
    type: 'botai-semente',
    description: botai.semente,
  })
  expect(testInfo.annotations).toContainEqual({
    type: 'botai-hoje',
    description: botai.hoje,
  })
  expect(botai.pessoa).toEqual(
    gerarPessoa({ semente: botai.semente, hoje: botai.hoje }),
  )
})

test.describe('opções', () => {
  test.use({
    botaiSemente: 42,
    botaiHoje: '2026-10-05',
    botaiUf: 'PI',
    botaiDominioEmail: 'exemplo.com.br',
  })

  test('semente, hoje, UF e domínio fixam a pessoa', ({ botai }) => {
    expect(botai.semente).toBe('42')
    expect(botai.hoje).toBe('2026-10-05')
    expect(botai.pessoa).toEqual(
      gerarPessoa({
        semente: 42,
        hoje: '2026-10-05',
        uf: 'PI',
        dominioEmail: 'exemplo.com.br',
      }),
    )
    expect(botai.pessoa.endereco.uf).toBe('PI')
    expect(botai.pessoa.email.endereco.endsWith('@exemplo.com.br')).toBe(true)
  })
})

test('sem botaiCartao, o cartão é o aprovado da Stripe', ({ botai }) => {
  expect(botai.pessoa.cartao).toMatchObject({
    provedor: 'stripe',
    cenario: 'aprovado',
  })
})

test.describe('botaiCartao', () => {
  const SEMENTE = 'checkout'
  const HOJE = '2026-10-05'
  test.use({
    botaiSemente: SEMENTE,
    botaiHoje: HOJE,
    botaiCartao: { provedor: 'pagarme', cenario: 'recusado' },
  })

  test('o cartão sai do provedor e do cenário; o resto da pessoa é o do padrão', ({
    botai,
  }) => {
    expect(botai.pessoa).toEqual(
      gerarPessoa({
        semente: SEMENTE,
        hoje: HOJE,
        cartao: { provedor: 'pagarme', cenario: 'recusado' },
      }),
    )
    expect(botai.pessoa.cartao).toMatchObject({
      numero: '4000000000000028',
      provedor: 'pagarme',
      cenario: 'recusado',
    })
    const padrao = gerarPessoa({ semente: SEMENTE, hoje: HOJE })
    expect({ ...botai.pessoa, cartao: padrao.cartao }).toEqual(padrao)
  })

  test('botai.preencher escreve o número do cenário no campo do cartão', async ({
    context,
    page,
    botai,
  }) => {
    await servir(context, ORIGEM, {
      '/checkout': {
        corpo:
          '<!doctype html><meta charset="utf-8"><label>Número do cartão <input name="cc" autocomplete="cc-number"></label>',
      },
    })
    await page.goto(`${ORIGEM}/checkout`)

    const resultado = await botai.preencher(page)

    expect(resultado.preenchidos).toHaveLength(1)
    await expect(page.getByLabel('Número do cartão')).toHaveValue(
      '4000 0000 0000 0028',
    )
    expect(botai.pessoa.cartao.numeroFormatado).toBe('4000 0000 0000 0028')
  })
})

test('botai.preencher usa a pessoa do fixture', async ({
  context,
  page,
  botai,
}) => {
  await servir(context, ORIGEM, {
    '/cpf': {
      corpo:
        '<!doctype html><meta charset="utf-8"><label>CPF <input name="cpf"></label>',
    },
  })
  await page.goto(`${ORIGEM}/cpf`)

  const resultado = await botai.preencher(page)

  expect(resultado.naoReconhecidos).toEqual([])
  await expect(page.getByLabel('CPF')).toHaveValue(botai.pessoa.cpf)
})

const outro = base.extend<{ saudacao: string }>({ saudacao: 'olá' })
const juntos = mergeTests(test, outro)

juntos(
  'mergeTests junta o botai com fixtures de outro módulo',
  ({ botai, saudacao }) => {
    expect(saudacao).toBe('olá')
    expect(botai.pessoa.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
  },
)

const estendido = base.extend<FixturesBotai>(fixturesBotai())

estendido('fixturesBotai() estende um test próprio', ({ botai }, testInfo) => {
  expect(botai.semente).toBe(
    sementeDoTeste({
      projeto: testInfo.project.name,
      titulos: testInfo.titlePath,
    }),
  )
})

// O envelope não guarda uf nem dominioEmail: as opções de cada dourado vêm do indice.json da fase 1.
interface ItemDoIndice {
  arquivo: string
  n?: number
  opcoes: { semente: Semente; hoje: string; uf?: UF; dominioEmail?: string }
}

const PASTA_DOURADA = new URL('../../core/dourado/v1/', import.meta.url)
const lerDourado = (arquivo: string): unknown =>
  JSON.parse(readFileSync(new URL(arquivo, PASTA_DOURADA), 'utf8'))
const dourados = (lerDourado('indice.json') as ItemDoIndice[]).filter(
  (item) => item.n === undefined,
)

test('há dourados de pessoa única, inclusive com UF e com domínio de e-mail', () => {
  expect(dourados.length).toBeGreaterThan(0)
  expect(dourados.some((item) => item.opcoes.uf !== undefined)).toBe(true)
  expect(dourados.some((item) => item.opcoes.dominioEmail !== undefined)).toBe(
    true,
  )
})

for (const { arquivo, opcoes } of dourados) {
  const envelope = lerDourado(arquivo) as EnvelopeDaPessoa
  test.describe(`dourado ${arquivo}`, () => {
    test.use({
      botaiSemente: opcoes.semente,
      botaiHoje: opcoes.hoje,
      botaiUf: opcoes.uf,
      botaiDominioEmail: opcoes.dominioEmail,
    })

    test('o fixture gera a pessoa do arquivo', ({ botai }) => {
      expect(botai.semente).toBe(envelope.semente)
      expect(botai.hoje).toBe(envelope.hoje)
      expect(botai.pessoa).toEqual(envelope.pessoa)
    })
  })
}
