import { montarPessoa } from '@pilutech/botai-core/pessoa'
import { sfc32 } from '@pilutech/botai-core/prng'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Browser } from 'wxt/browser'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { cartaoItem, favoritosItem, pessoaItem } from '../../lib/armazenamento'
import type { Favorito } from '../../lib/favoritos'
import type { Mensagem } from '../../lib/mensagens'
import { PESSOA_DOURADA as P } from '../../test/pessoa-dourada'
import {
  aoClicarMenu,
  aoComando,
  aoReceberMensagem,
  recriarMenus,
} from './ouvintes'

interface Injecao {
  target: Record<string, unknown>
  files?: string[]
  args?: unknown[]
}
const executar = vi.fn<(injecao: Injecao) => Promise<unknown>>()
const criar = vi.fn()

beforeEach(async () => {
  executar.mockReset()
  executar.mockImplementation(async (injecao) =>
    injecao.files
      ? [{ documentId: 'doc-0', frameId: 0 }]
      : [{ documentId: 'doc-0', frameId: 0, result: null }],
  )
  criar.mockReset()
  Object.assign(fakeBrowser.scripting, { executeScript: executar })
  Object.assign(fakeBrowser.contextMenus, {
    create: criar,
    removeAll: vi.fn(async () => undefined),
    update: vi.fn(async () => undefined),
  })
  await pessoaItem.setValue(P)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

const ABA = { id: 7 } as Browser.tabs.Tab
const clique = (menuItemId: string, frameId = 0) =>
  ({
    menuItemId,
    frameId,
    editable: true,
    pageUrl: 'http://localhost:3000/',
  }) as Browser.contextMenus.OnClickData
const chamada = (n: number) => executar.mock.calls[n][0]

describe('aoComando', () => {
  it('o atalho (botai-preencher) preenche a aba do comando', async () => {
    await aoComando('botai-preencher', ABA)
    expect(chamada(0).target).toEqual({ tabId: 7, allFrames: true })
  })

  it('ignora outro comando (inclusive o antigo preencher-pagina) e comando sem aba', async () => {
    await aoComando('outro', ABA)
    await aoComando('preencher-pagina', ABA)
    await aoComando('botai-preencher', undefined)
    expect(executar).not.toHaveBeenCalled()
  })

  it('sem pessoa guardada, o atalho gera uma antes de preencher', async () => {
    await pessoaItem.setValue(null)
    await aoComando('botai-preencher', ABA)
    expect(await pessoaItem.getValue()).not.toBeNull()
  })

  it('a pessoa que o atalho gera sai com o cartão escolhido no popup', async () => {
    await pessoaItem.setValue(null)
    await cartaoItem.setValue({ provedor: 'pagarme', cenario: 'recusado' })
    await aoComando('botai-preencher', ABA)
    expect((await pessoaItem.getValue())?.cartao).toMatchObject({
      numero: '4000000000000028',
      provedor: 'pagarme',
      cenario: 'recusado',
    })
  })
})

describe('aoClicarMenu', () => {
  it('"Preencher esta página" preenche a aba do clique', async () => {
    await aoClicarMenu(clique('botai-preencher'), ABA)
    expect(chamada(0).target).toEqual({ tabId: 7, allFrames: true })
  })

  it('Inserir › CPF injeta no frame do clique com o kind', async () => {
    await aoClicarMenu(clique('botai-inserir:cpf', 3), ABA)
    expect(chamada(0).target).toEqual({ tabId: 7, frameIds: [3] })
    expect(chamada(1).args).toEqual([P, 'cpf', null])
  })

  it('no Firefox, o Inserir leva o targetElementId do clique até o content script', async () => {
    await aoClicarMenu(
      {
        ...clique('botai-inserir:cpf', 3),
        targetElementId: 42,
      } as Browser.contextMenus.OnClickData,
      ABA,
    )
    expect(chamada(1).args).toEqual([P, 'cpf', 42])
  })

  it('"Nova pessoa" troca a pessoa guardada', async () => {
    await aoClicarMenu(clique('botai-nova-pessoa'), ABA)
    expect(await pessoaItem.getValue()).not.toEqual(P)
  })

  it('"Nova pessoa" do menu gera com o cartão escolhido no popup', async () => {
    await cartaoItem.setValue({ provedor: 'stripe', cenario: 'pendente' })
    await aoClicarMenu(clique('botai-nova-pessoa'), ABA)
    expect((await pessoaItem.getValue())?.cartao).toMatchObject({
      numero: '4000002760003184',
      provedor: 'stripe',
      cenario: 'pendente',
    })
  })

  it('"Abrir caixa de entrada" abre a caixa pública da pessoa numa aba nova', async () => {
    const abrir = vi.spyOn(fakeBrowser.tabs, 'create')
    await aoClicarMenu(clique('botai-abrir-caixa'), ABA)
    expect(abrir).toHaveBeenCalledWith({ url: P.email.caixaUrl })
  })

  it('"Abrir caixa de entrada" com pessoa sem caixa pública (outro domínio) não abre aba', async () => {
    await pessoaItem.setValue({ ...P, email: { ...P.email, caixaUrl: null } })
    const abrir = vi.spyOn(fakeBrowser.tabs, 'create')
    await aoClicarMenu(clique('botai-abrir-caixa'), ABA)
    expect(abrir).not.toHaveBeenCalled()
  })

  describe('"Preencher com › <favorito>"', () => {
    const FAVORITA = montarPessoa(sfc32(10, 11, 12, 13), '2026-10-01')
    const FAVORITO: Favorito = {
      id: 'f-1',
      apelido: 'admin do staging',
      pessoa: FAVORITA,
      guardadoEm: '2026-10-09T12:00:00.000Z',
    }
    beforeEach(() => favoritosItem.setValue([FAVORITO]))

    it('torna o favorito a pessoa ativa e preenche a aba com ele, pelo mesmo fluxo do Preencher', async () => {
      await aoClicarMenu(clique('botai-preencher-com:f-1'), ABA)
      expect(await pessoaItem.getValue()).toEqual(FAVORITA)
      expect(chamada(0)).toEqual({
        target: { tabId: 7, allFrames: true },
        files: ['/content-scripts/preencher.js'],
      })
      expect(chamada(1).target).toEqual({ tabId: 7, allFrames: true })
      expect(chamada(1).args?.[0]).toEqual(FAVORITA)
    })

    it('não mexe na lista de favoritos', async () => {
      await aoClicarMenu(clique('botai-preencher-com:f-1'), ABA)
      expect(await favoritosItem.getValue()).toEqual([FAVORITO])
    })

    it('favorito que já saiu (menu velho) não troca a ativa nem preenche', async () => {
      await aoClicarMenu(clique('botai-preencher-com:f-9'), ABA)
      expect(await pessoaItem.getValue()).toEqual(P)
      expect(executar).not.toHaveBeenCalled()
    })
  })

  it('"Abrir caixa de entrada" sem pessoa gera uma antes', async () => {
    await pessoaItem.setValue(null)
    const abrir = vi.spyOn(fakeBrowser.tabs, 'create')
    await aoClicarMenu(clique('botai-abrir-caixa'), undefined)
    const gerada = await pessoaItem.getValue()
    expect(abrir).toHaveBeenCalledWith({ url: gerada?.email.caixaUrl })
  })
})

describe('aoReceberMensagem', () => {
  it('preencher responde por sendResponse e devolve true literal', async () => {
    const responder = vi.fn()
    expect(
      aoReceberMensagem({ tipo: 'preencher', tabId: 7 }, {}, responder),
    ).toBe(true)
    await vi.waitFor(() =>
      expect(responder).toHaveBeenCalledWith({
        ok: true,
        resumo: expect.objectContaining({ x: 0, y: 0, k: 0 }),
      }),
    )
  })

  it('mostrar responde com o que __botai.mostrar devolveu', async () => {
    executar.mockResolvedValue([
      { documentId: 'doc-1', frameId: 2, result: true },
    ])
    const responder = vi.fn()
    expect(
      aoReceberMensagem(
        { tipo: 'mostrar', tabId: 7, documentId: 'doc-1', idx: 4 },
        {},
        responder,
      ),
    ).toBe(true)
    await vi.waitFor(() => expect(responder).toHaveBeenCalledWith(true))
  })

  it('inserir só é aceito no build e2e', async () => {
    const responder = vi.fn()
    const inserir: Mensagem = {
      tipo: 'inserir',
      tabId: 7,
      frameId: 0,
      kind: 'cpf',
    }
    expect(aoReceberMensagem(inserir, {}, responder)).toBeUndefined()
    expect(executar).not.toHaveBeenCalled()
    vi.stubEnv('MODE', 'e2e')
    expect(aoReceberMensagem(inserir, {}, responder)).toBe(true)
    await vi.waitFor(() => expect(responder).toHaveBeenCalledTimes(1))
    expect(chamada(1).args).toEqual([P, 'cpf', null])
  })

  it('mensagem desconhecida não segura o canal', () => {
    expect(
      aoReceberMensagem({ tipo: 'outra' } as unknown as Mensagem, {}, vi.fn()),
    ).toBeUndefined()
  })

  it('erro inesperado é registrado e ainda responde, para o popup não ficar esperando', async () => {
    executar.mockRejectedValue(new Error('No tab with id: 7.'))
    const registrar = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const responder = vi.fn()
    aoReceberMensagem({ tipo: 'preencher', tabId: 7 }, {}, responder)
    await vi.waitFor(() => expect(responder).toHaveBeenCalledWith(undefined))
    expect(registrar).toHaveBeenCalled()
  })
})

describe('recriarMenus', () => {
  it('recria os menus com o CPF da pessoa guardada no título', async () => {
    await recriarMenus()
    expect(criar).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'botai-inserir:cpf',
        title: `CPF · ${P.cpf}`,
      }),
    )
  })

  it('recria o "Preencher com" com os favoritos guardados', async () => {
    await favoritosItem.setValue([
      {
        id: 'f-1',
        apelido: 'admin do staging',
        pessoa: P,
        guardadoEm: '2026-10-09T12:00:00.000Z',
      },
    ])
    await recriarMenus()
    expect(criar).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'botai-preencher-com' }),
    )
    expect(criar).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'botai-preencher-com:f-1',
        parentId: 'botai-preencher-com',
      }),
    )
  })

  it('duas recriações seguidas não se intercalam (senão o Chrome recusaria ids repetidos)', async () => {
    const ordem: string[] = []
    Object.assign(fakeBrowser.contextMenus, {
      removeAll: vi.fn(async () => {
        ordem.push('removeAll')
        await new Promise((resolver) => setTimeout(resolver, 5))
      }),
      create: vi.fn(({ id }: { id: string }) => {
        if (id === 'botai-abrir-caixa') ordem.push('ultimo')
      }),
    })
    await Promise.all([recriarMenus(), recriarMenus()])
    expect(ordem).toEqual(['removeAll', 'ultimo', 'removeAll', 'ultimo'])
  })
})
