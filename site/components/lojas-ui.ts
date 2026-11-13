import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faChrome,
  faEdge,
  faFirefoxBrowser,
  faOpera,
} from '@fortawesome/free-brands-svg-icons'
import { ROTULO_DA_LOJA } from '@/lib/extensao'
import type { Loja } from '@/lib/pilulabs'

export const LOJA_UI: Record<Loja, { rotulo: string; icone: IconDefinition }> =
  {
    chrome: { rotulo: ROTULO_DA_LOJA.chrome, icone: faChrome },
    firefox: { rotulo: ROTULO_DA_LOJA.firefox, icone: faFirefoxBrowser },
    edge: { rotulo: ROTULO_DA_LOJA.edge, icone: faEdge },
    opera: { rotulo: ROTULO_DA_LOJA.opera, icone: faOpera },
  }
