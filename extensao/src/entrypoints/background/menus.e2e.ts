import type { Worker } from '@playwright/test'
import type { browser } from 'wxt/browser'
import type { Favorito } from '../../lib/favoritos'
import { PESSOA_DOURADA } from '../../test/pessoa-dourada'
import { ATALHO_ESPERADO, expect, test } from '../../test/extensao.fixture'

declare const chrome: typeof browser

const existeNo = (sw: Worker) => (id: string) =>
  sw.evaluate(async (i) => {
    try {
      await chrome.contextMenus.update(i, {})
      return true
    } catch {
      return false
    }
  }, id)

test('o "Preencher com" nasce com o primeiro favorito, acompanha a lista e some quando ela esvazia', async ({
  sw,
}) => {
  const existe = existeNo(sw)
  await expect.poll(() => existe('botai-inserir:cpf')).toBe(true)
  expect(await existe('botai-preencher-com')).toBe(false)

  const favorito: Favorito = {
    id: 'f-1',
    apelido: 'admin do staging',
    pessoa: PESSOA_DOURADA,
    guardadoEm: '2026-10-09T12:00:00.000Z',
  }
  const guardar = (lista: Favorito[]) =>
    sw.evaluate((l) => chrome.storage.local.set({ botai_favoritos: l }), lista)

  await guardar([favorito])
  await expect.poll(() => existe('botai-preencher-com:f-1')).toBe(true)
  expect(await existe('botai-preencher-com')).toBe(true)

  await guardar([{ ...favorito, id: 'f-2' }])
  await expect.poll(() => existe('botai-preencher-com:f-2')).toBe(true)
  expect(await existe('botai-preencher-com:f-1')).toBe(false)

  await guardar([])
  await expect.poll(() => existe('botai-preencher-com')).toBe(false)
  expect(await existe('botai-preencher')).toBe(true)
})

test('a instalação cria o menu completo e registra o atalho', async ({
  sw,
}) => {
  const existe = existeNo(sw)
  // Os menus nascem de forma assíncrona depois da instalação: espera o primeiro aparecer.
  await expect.poll(() => existe('botai-inserir:cpf')).toBe(true)
  for (const id of [
    'botai-preencher',
    'botai-inserir',
    'botai-inserir:tituloEleitor',
    'botai-nova-pessoa',
    'botai-abrir-caixa',
  ]) {
    expect(await existe(id)).toBe(true)
  }
  expect(await existe('nao-existe')).toBe(false)
  const comandos = await sw.evaluate(() => chrome.commands.getAll())
  expect(comandos.find((c) => c.name === 'botai-preencher')).toMatchObject({
    description: 'Preencher esta página',
    shortcut: expect.stringMatching(ATALHO_ESPERADO),
  })
})
