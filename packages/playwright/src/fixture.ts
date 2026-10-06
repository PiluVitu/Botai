import {
  FORMATO,
  gerarPessoa,
  hojeEmSaoPaulo,
  MOTOR,
  type EnvelopeDaPessoa,
  type Semente,
} from '@pilutech/botai-core'
import type { Pessoa } from '@pilutech/botai-core/pessoa'
import type { UF } from '@pilutech/botai-core/uf'
import {
  test as base,
  expect,
  type Fixtures,
  type Locator,
  type Page,
} from '@playwright/test'
import { preencherAlvo, type OpcoesDoPreenchimento } from './preencher.js'
import type { ResultadoDoPreenchimento } from './resultado.js'
import { conferirHoje, sementeDoTeste } from './semente.js'

export interface OpcoesBotai {
  botaiSemente: Semente | undefined
  botaiHoje: string | undefined
  botaiUf: UF | undefined
  botaiDominioEmail: string | undefined
}

export interface Botai {
  pessoa: Pessoa
  semente: string
  hoje: string
  preencher(
    alvo: Page | Locator,
    opcoes?: OpcoesDoPreenchimento,
  ): Promise<ResultadoDoPreenchimento>
}

export interface FixturesBotai extends OpcoesBotai {
  botai: Botai
}

export function fixturesBotai(): Fixtures<FixturesBotai> {
  return {
    botaiSemente: [undefined, { option: true }],
    botaiHoje: [undefined, { option: true }],
    botaiUf: [undefined, { option: true }],
    botaiDominioEmail: [undefined, { option: true }],
    botai: async (
      { botaiSemente, botaiHoje, botaiUf, botaiDominioEmail },
      use,
      testInfo,
    ) => {
      const semente =
        botaiSemente === undefined
          ? sementeDoTeste({
              projeto: testInfo.project.name,
              titulos: testInfo.titlePath,
            })
          : String(botaiSemente)
      const hoje =
        botaiHoje === undefined ? hojeEmSaoPaulo() : conferirHoje(botaiHoje)
      const pessoa = gerarPessoa({
        semente,
        hoje,
        ...(botaiUf !== undefined && { uf: botaiUf }),
        ...(botaiDominioEmail !== undefined && {
          dominioEmail: botaiDominioEmail,
        }),
      })
      testInfo.annotations.push(
        { type: 'botai-semente', description: semente },
        { type: 'botai-hoje', description: hoje },
      )
      await use({
        pessoa,
        semente,
        hoje,
        preencher: (alvo, opcoes) => preencherAlvo(alvo, pessoa, hoje, opcoes),
      })
      if (testInfo.status !== testInfo.expectedStatus) {
        const envelope: EnvelopeDaPessoa = {
          formato: FORMATO,
          motor: MOTOR,
          semente,
          hoje,
          pessoa,
        }
        await testInfo.attach('botai-pessoa.json', {
          body: JSON.stringify(envelope, null, 2),
          contentType: 'application/json',
        })
      }
    },
  }
}

export const test = base.extend<FixturesBotai>(fixturesBotai())

export { expect }
