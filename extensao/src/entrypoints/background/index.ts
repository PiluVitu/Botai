import { browser } from 'wxt/browser'
import { defineBackground } from 'wxt/utils/define-background'
import { favoritosItem, pessoaItem } from '../../lib/armazenamento'
import { atualizarTitulosMenu } from '../../lib/menus'
import {
  aoClicarMenu,
  aoComando,
  aoReceberMensagem,
  recriarMenus,
} from './ouvintes'

const registrarErro = (erro: unknown) => console.error(erro)

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => void recriarMenus())
  browser.runtime.onStartup.addListener(() => void recriarMenus())
  pessoaItem.watch((pessoa) => void atualizarTitulosMenu(pessoa))
  favoritosItem.watch(() => void recriarMenus())
  browser.commands.onCommand.addListener(
    (comando, aba) => void aoComando(comando, aba).catch(registrarErro),
  )
  browser.contextMenus.onClicked.addListener(
    (info, aba) => void aoClicarMenu(info, aba).catch(registrarErro),
  )
  browser.runtime.onMessage.addListener(aoReceberMensagem)
})
