import {
  APRESENTACAO,
  EMAIL_DE_SUPORTE,
  MAILTO,
  NOME,
  npmDe,
  PACOTE_DO_CORE,
  PACOTE_DO_PLAYWRIGHT,
  POSICIONAMENTO,
  REPOSITORIO,
  RESUMO_DO_PROJETO,
  URL_DA_DOCUMENTACAO,
  URL_DA_PILUTECH,
} from './conteudo'
import { ROTULO_DA_LOJA } from './extensao'
import { CONVITE } from './personas'
import { lojasPublicadas, type Loja, type UrlsDasLojas } from './pilulabs'
import { PORTAS } from './portas'
import { DESCRICAO_DA_HOME, PAGINAS_DO_SITE } from './seo'
import { urlAbsoluta } from './site'

export type ItemDoLlms = { titulo: string; url: string; descricao: string }
export type SecaoDoLlms = { titulo: string; itens: ItemDoLlms[] }

const NAVEGADORES_DA_LOJA: Record<Loja, string> = {
  chrome: 'Chrome e Edge',
  firefox: 'Firefox',
  edge: 'Edge',
  opera: 'Opera',
}

export function secoesDoLlms(
  siteUrl: string,
  urls: UrlsDasLojas,
): SecaoDoLlms[] {
  return [
    {
      titulo: 'Páginas',
      itens: PAGINAS_DO_SITE.map(({ caminho, titulo, descricao }) => ({
        titulo,
        url: urlAbsoluta(caminho, siteUrl),
        descricao,
      })),
    },
    {
      titulo: 'Portas',
      itens: PORTAS.map(({ nome, documentacao, linha, onde }) => ({
        titulo: nome,
        url: `${URL_DA_DOCUMENTACAO}${documentacao}`,
        descricao: `${linha} ${onde}`,
      })),
    },
    {
      titulo: 'Instalar a extensão',
      itens: lojasPublicadas(urls).map(({ loja, url }) => ({
        titulo: ROTULO_DA_LOJA[loja],
        url,
        descricao: `A extensão para ${NAVEGADORES_DA_LOJA[loja]}.`,
      })),
    },
    {
      titulo: 'Documentação',
      itens: [
        {
          titulo: CONVITE.rotulo,
          url: URL_DA_DOCUMENTACAO,
          descricao: CONVITE.texto,
        },
        {
          titulo: 'llms.txt da documentação',
          url: `${URL_DA_DOCUMENTACAO}/llms.txt`,
          descricao: 'O índice das páginas da documentação.',
        },
        {
          titulo: 'llms-full.txt da documentação',
          url: `${URL_DA_DOCUMENTACAO}/llms-full.txt`,
          descricao:
            'O conteúdo das páginas da documentação em Markdown, num arquivo só.',
        },
      ],
    },
    {
      titulo: 'Código e pacotes',
      itens: [
        { titulo: 'GitHub', url: REPOSITORIO, descricao: RESUMO_DO_PROJETO },
        {
          titulo: PACOTE_DO_CORE,
          url: npmDe(PACOTE_DO_CORE),
          descricao:
            'A CLI, o servidor HTTP, a biblioteca e o motor no navegador, num pacote só.',
        },
        {
          titulo: PACOTE_DO_PLAYWRIGHT,
          url: npmDe(PACOTE_DO_PLAYWRIGHT),
          descricao:
            'A fixture botai do Playwright, com a pessoa reproduzível pela semente do teste.',
        },
      ],
    },
    {
      titulo: 'Contato',
      itens: [
        {
          titulo: EMAIL_DE_SUPORTE,
          url: MAILTO.suporte,
          descricao: 'Suporte, privacidade e termos de uso.',
        },
        {
          titulo: 'PiluTech',
          url: URL_DA_PILUTECH,
          descricao: `O ${NOME} e este site são da PiluTech.`,
        },
      ],
    },
  ]
}

export function llmsTxt(siteUrl: string, urls: UrlsDasLojas): string {
  const blocos = [
    `# ${NOME}`,
    `> ${DESCRICAO_DA_HOME}`,
    `${POSICIONAMENTO} ${APRESENTACAO}`,
    ...secoesDoLlms(siteUrl, urls)
      .filter(({ itens }) => itens.length > 0)
      .map(({ titulo, itens }) =>
        [
          `## ${titulo}`,
          itens
            .map(
              ({ titulo, url, descricao }) =>
                `- [${titulo}](${url}): ${descricao}`,
            )
            .join('\n'),
        ].join('\n\n'),
      ),
  ]
  return `${blocos.join('\n\n')}\n`
}
