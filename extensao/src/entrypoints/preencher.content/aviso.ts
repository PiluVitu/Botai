import type { ContentScriptContext } from 'wxt/utils/content-script-context'
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root'
import css from './aviso.css?inline'
import { construirAviso, type OpcoesAviso } from './aviso-dom'

const dialogoModalAberto = () =>
  [...document.querySelectorAll('dialog:modal')].at(-1)

export async function montarAviso(
  ctx: ContentScriptContext,
  opcoes: Omit<OpcoesAviso, 'onFechar'> & { aoSair: () => void },
): Promise<void> {
  const { aoSair, ...aviso } = opcoes
  const ui = await createShadowRootUi(ctx, {
    name: 'botai-aviso',
    position: 'inline',
    anchor: () => dialogoModalAberto() ?? document.documentElement,
    css,
    onMount(recipiente) {
      recipiente.append(
        construirAviso(document, { ...aviso, onFechar: () => ui.remove() }),
      )
    },
    onRemove: aoSair,
  })
  ui.shadowHost.setAttribute('popover', 'manual')
  ui.mount()
  ui.shadowHost.showPopover()
}
