import type { FieldKind } from '@pilutech/botai-core/campos'
import { browser, type Browser } from 'wxt/browser'
import {
  favoritosItem,
  gerarPessoaNova,
  obterOuGerarPessoa,
  pessoaItem,
  usarFavorito,
} from '../../lib/armazenamento'
import type { Mensagem } from '../../lib/mensagens'
import {
  criarMenus,
  MENU,
  PREFIXO_INSERIR,
  PREFIXO_PREENCHER_COM,
} from '../../lib/menus'
import { inserirNoCampo, mostrarCampo, preencherPagina } from './acoes'

export const COMANDO_PREENCHER = 'botai-preencher'

// Os tipos do @wxt-dev/browser não têm o targetElementId, que só o Firefox manda.
type CliqueNoMenu = Browser.contextMenus.OnClickData & {
  targetElementId?: number
}

let filaDosMenus: Promise<void> = Promise.resolve()

export function recriarMenus(): Promise<void> {
  const vez = filaDosMenus.then(async () =>
    criarMenus(await pessoaItem.getValue(), await favoritosItem.getValue()),
  )
  filaDosMenus = vez.catch(() => undefined)
  return vez
}

export async function aoComando(
  comando: string,
  aba?: Browser.tabs.Tab,
): Promise<void> {
  if (comando === COMANDO_PREENCHER && aba?.id !== undefined)
    await preencherPagina(aba.id)
}

export async function aoClicarMenu(
  info: Browser.contextMenus.OnClickData,
  aba?: Browser.tabs.Tab,
): Promise<void> {
  const id = String(info.menuItemId)
  if (id === MENU.novaPessoa) {
    await gerarPessoaNova()
    return
  }
  if (id === MENU.abrirCaixa) {
    const pessoa = await obterOuGerarPessoa()
    if (pessoa.email.caixaUrl)
      await browser.tabs.create({ url: pessoa.email.caixaUrl })
    return
  }
  if (id.startsWith(PREFIXO_PREENCHER_COM)) {
    const favorita = await usarFavorito(id.slice(PREFIXO_PREENCHER_COM.length))
    if (favorita && aba?.id !== undefined) await preencherPagina(aba.id)
    return
  }
  if (aba?.id === undefined) return
  if (id === MENU.preencher) await preencherPagina(aba.id)
  else if (id.startsWith(PREFIXO_INSERIR)) {
    await inserirNoCampo(
      aba.id,
      info.frameId ?? 0,
      id.slice(PREFIXO_INSERIR.length) as FieldKind,
      (info as CliqueNoMenu).targetElementId ?? null,
    )
  }
}

function executar(mensagem: Mensagem): Promise<unknown> | undefined {
  switch (mensagem?.tipo) {
    case 'preencher':
      return preencherPagina(mensagem.tabId)
    case 'mostrar':
      return mostrarCampo(mensagem.tabId, mensagem.documentId, mensagem.idx)
    case 'inserir':
      return import.meta.env.MODE === 'e2e'
        ? inserirNoCampo(
            mensagem.tabId,
            mensagem.frameId,
            mensagem.kind,
            mensagem.alvoId ?? null,
          )
        : undefined
    default:
      return undefined
  }
}

// `return true` literal + sendResponse, nunca Promise: o Chrome só aceita Promise no onMessage a partir do 148.
export function aoReceberMensagem(
  mensagem: Mensagem,
  _remetente: Browser.runtime.MessageSender,
  responder: (resposta?: unknown) => void,
): true | undefined {
  const tarefa = executar(mensagem)
  if (!tarefa) return undefined
  tarefa.then(responder, (erro: unknown) => {
    console.error(erro)
    responder(undefined)
  })
  return true
}
