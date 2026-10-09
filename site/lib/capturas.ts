export type Tema = 'escuro' | 'claro'
export type VarianteDaCaptura = { src: string; alt: string }
export type Cena =
  'pagina-preenchida' | 'pessoa-de-teste' | 'resultado' | 'favoritos' | 'cartao'
export type CapturaDaGaleria = {
  numero: string
  cena: Cena
  titulo: string
  texto: string
  variantes: Record<Tema, VarianteDaCaptura>
}

export const LARGURA_DA_CAPTURA = 1280
export const ALTURA_DA_CAPTURA = 800

const CENAS: {
  cena: Cena
  titulo: string
  texto: string
  descricao: string
  arquivos: Record<Tema, string>
}[] = [
  {
    cena: 'pagina-preenchida',
    titulo: 'Página preenchida',
    texto:
      'Um atalho e o formulário inteiro recebe a mesma pessoa de teste: nome, documentos, endereço do CEP, celular e senha.',
    descricao:
      'Formulário de cadastro preenchido pelo Botaí, com o popup mostrando 12 de 14 campos preenchidos',
    arquivos: {
      escuro: '01-pagina-preenchida-escuro.png',
      claro: '02-pagina-preenchida-claro.png',
    },
  },
  {
    cena: 'pessoa-de-teste',
    titulo: 'Pessoa de teste',
    texto:
      'O popup mostra a pessoa inteira, separada por grupo, e cada dado tem o seu botão de copiar.',
    descricao:
      'Popup do Botaí com a pessoa de teste separada por grupo e um botão de copiar em cada dado',
    arquivos: {
      escuro: '03-pessoa-de-teste-escuro.png',
      claro: '04-pessoa-de-teste-claro.png',
    },
  },
  {
    cena: 'resultado',
    titulo: 'Resultado',
    texto:
      'Depois de preencher, o popup mostra quantos campos entraram e leva até os que ficaram de fora.',
    descricao:
      'Popup do Botaí depois de preencher: 12 de 14 campos e os 2 que ficaram de fora',
    arquivos: {
      escuro: '05-resultado-escuro.png',
      claro: '06-resultado-claro.png',
    },
  },
  {
    cena: 'favoritos',
    titulo: 'Favoritos',
    texto:
      'Até 3 pessoas favoritas, cada uma com um apelido, voltam pelo popup ou pelo botão direito.',
    descricao:
      'Popup do Botaí com 3 pessoas favoritas, cada uma com o seu apelido, e a ativa marcada com a estrela',
    arquivos: {
      escuro: '07-favoritos-escuro.png',
      claro: '08-favoritos-claro.png',
    },
  },
  {
    cena: 'cartao',
    titulo: 'Cartão de teste',
    texto:
      'O cartão das próximas pessoas sai da Stripe ou da Pagar.me, no cenário que você escolher.',
    descricao:
      'Popup do Botaí com o cartão de teste da Pagar.me no cenário recusado e a escolha do provedor e do cenário das próximas pessoas',
    arquivos: {
      escuro: '09-cartao-escuro.png',
      claro: '10-cartao-claro.png',
    },
  },
]

function variante(arquivo: string, descricao: string, tema: Tema) {
  return { src: `/capturas/${arquivo}`, alt: `${descricao} (tema ${tema})` }
}

export const CAPTURAS: CapturaDaGaleria[] = CENAS.map((cena, indice) => ({
  numero: String(indice + 1).padStart(2, '0'),
  cena: cena.cena,
  titulo: cena.titulo,
  texto: cena.texto,
  variantes: {
    escuro: variante(cena.arquivos.escuro, cena.descricao, 'escuro'),
    claro: variante(cena.arquivos.claro, cena.descricao, 'claro'),
  },
}))

export function capturaDa(cena: Cena): CapturaDaGaleria {
  return CAPTURAS.find((c) => c.cena === cena)!
}
