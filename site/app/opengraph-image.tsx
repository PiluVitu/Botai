import { imagemOgDaHome } from '@/lib/imagem-og'

export { contentType, size } from '@/lib/imagem-og'
export const alt =
  'Botaí: dados de teste brasileiros em todo lugar que o seu teste roda'

export default function Image() {
  return imagemOgDaHome()
}
