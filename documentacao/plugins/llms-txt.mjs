import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gerarLlms } from './llms-conteudo.mjs'

export default function llmsTxt(context) {
  let versao
  return {
    name: 'botai-llms-txt',
    allContentLoaded({ allContent }) {
      const { loadedVersions = [] } =
        allContent['docusaurus-plugin-content-docs']?.default ?? {}
      versao = loadedVersions.find(({ isLast }) => isLast) ?? loadedVersions[0]
    },
    postBuild({ outDir, siteConfig }) {
      if (!versao)
        throw new Error(
          'llms.txt: o plugin de docs não carregou nenhuma versão',
        )
      const { llms, llmsFull } = gerarLlms({
        siteConfig,
        versao,
        lerFonte: (caminho) =>
          readFileSync(join(context.siteDir, caminho), 'utf8'),
      })
      writeFileSync(join(outDir, 'llms.txt'), llms)
      writeFileSync(join(outDir, 'llms-full.txt'), llmsFull)
    },
  }
}

export async function sitemapComLlms({ defaultCreateSitemapItems, ...params }) {
  const { url, baseUrl } = params.siteConfig
  return [
    ...(await defaultCreateSitemapItems(params)),
    { url: `${url}${baseUrl}llms.txt` },
  ]
}
