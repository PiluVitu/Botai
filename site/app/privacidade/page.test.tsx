import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import PrivacidadePage from './page'

const BOTAI = join(__dirname, '..', '..', '..', 'extensao')
const ler = (arquivo: string) => readFileSync(join(BOTAI, arquivo), 'utf8')

describe('/privacidade', () => {
  beforeEach(() => {
    render(<PrivacidadePage />)
  })

  it('o título e a data de vigência', () => {
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Política de privacidade do Botaí',
    )
    // A data muda com o texto: é a do Vercel Web Analytics no site (a 1.2.0, da preferência
    // do cartão de teste, e a 1.1.0, dos favoritos, são de 2026-10-09).
    const data = screen.getByText('11 de outubro de 2026')
    expect(data.tagName).toBe('TIME')
    expect(data).toHaveAttribute('dateTime', '2026-10-11')
  })

  it('as seções da política, na ordem', () => {
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent),
    ).toEqual([
      'Quem é o responsável',
      'O que o Botaí acessa, e quando',
      'O que fica guardado',
      'O que é enviado',
      'Sites que ele abre, só quando você clica',
      'Dados fictícios e pessoas reais',
      'Permissões',
      'Como apagar os dados',
      'Este site e a documentação',
      'Quando você escreve para o suporte',
      'Cada dado, para quê e por quanto tempo',
      'Segurança',
      'Seus direitos',
      'Crianças e adolescentes',
      'Mudanças nesta política',
    ])
  })

  it('cada dado com finalidade, base legal, compartilhamento e prazo', () => {
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent),
    ).toEqual([
      'A pessoa fictícia ativa',
      'As pessoas favoritas e os apelidos',
      'A preferência do cartão de teste',
      'Os campos e o endereço da aba',
      'A escolha de tema claro ou escuro',
      'Os registros de acesso ao site e à documentação',
      'As estatísticas de visita do site e da documentação',
      'O que você manda ao suporte por e-mail',
    ])
    const listas = document.querySelectorAll('dl')
    expect(listas).toHaveLength(8)
    for (const lista of listas)
      expect(
        [...lista.querySelectorAll('dt')].map((dt) => dt.textContent),
      ).toEqual(['Para quê', 'Base legal', 'Com quem', 'Por quanto tempo'])
    expect(listas[5]).toHaveTextContent('art. 7º, IX')
    expect(listas[5]).toHaveTextContent('Vercel')
    expect(listas[6]).toHaveTextContent('art. 7º, IX')
    expect(listas[6]).toHaveTextContent('Vercel Web Analytics')
    expect(listas[6]).toHaveTextContent('Vercel Speed Insights')
    expect(listas[6]).toHaveTextContent('24 horas')
    expect(listas[7]).toHaveTextContent('art. 7º, II')
    expect(listas[7]).toHaveTextContent('Gmail')
  })

  // Desde 2026-10-11 o site e a documentação (só eles) medem as visitas com o Vercel Web
  // Analytics e o Vercel Speed Insights, sem cookie. A extensão continua sem: "O que é enviado" é dela.
  it('o site e a documentação medem as visitas com o Vercel Web Analytics, sem cookie; a extensão segue sem', () => {
    expect(document.body).not.toHaveTextContent(
      /site (botai\.pilutech\.com\.br )?não usa cookies,? (nem )?analytics/i,
    )
    expect(document.body).toHaveTextContent(
      'Este site e a documentação não usam cookies e medem as visitas com o Vercel Web Analytics',
    )
    expect(document.body).toHaveTextContent(
      'O site botai.pilutech.com.br e a documentação, em docs.botai.pilutech.com.br, não usam cookies nem anúncios',
    )
    expect(document.body).toHaveTextContent(
      'descartado em 24 horas, e os relatórios só mostram números somados',
    )
    expect(document.body).toHaveTextContent(
      'O Vercel Speed Insights mede a velocidade de cada carregamento',
    )
    expect(document.body).toHaveTextContent(
      'Também não usa analytics, cookies nem anúncios',
    )
  })

  // Contrato da 1.1.0: storage.local com local:botai_pessoa (a ativa) e local:botai_favoritos (até 3).
  // A 1.2.0 soma local:botai_cartao, a preferência do cartão de teste das próximas pessoas.
  it('"O que fica guardado": a pessoa ativa, até 3 favoritas com apelido e a preferência do cartão, só no navegador', () => {
    const paragrafo = screen.getByRole('heading', {
      level: 2,
      name: 'O que fica guardado',
    }).nextElementSibling
    for (const trecho of [
      'Só a pessoa de teste ativa',
      'até 3 pessoas favoritas que você guardar',
      'com o apelido que você der',
      'a preferência do cartão de teste das próximas pessoas',
      'o provedor (Stripe ou Pagar.me) e o cenário (aprovado, recusado, pendente…)',
      'que não é dado pessoal',
      'no armazenamento local da extensão no seu navegador (storage.local).',
      'Nada disso é sincronizado entre dispositivos nem enviado.',
    ])
      expect(paragrafo).toHaveTextContent(trecho)
    const storage = screen.getByRole('row', { name: /^storage\b/ })
    expect(storage).toHaveTextContent(
      'a pessoa fictícia ativa e até 3 favoritas, com os apelidos',
    )
    expect(storage).toHaveTextContent(
      'o cartão de teste escolhido para as próximas pessoas',
    )
    expect(document.body).toHaveTextContent(
      'até 3 favoritas que você escolher e o cartão de teste das próximas pessoas.',
    )
  })

  // A escolha vale só para as pessoas novas: a ativa e as favoritas ficam com o cartão delas.
  it('a preferência do cartão não é dado pessoal, fica até outra escolha e não muda as pessoas guardadas', () => {
    const cartao = document.querySelectorAll('dl')[2]
    expect(cartao).toHaveTextContent(
      'Não se aplica: é uma opção da extensão, não um dado pessoal',
    )
    expect(cartao).toHaveTextContent(
      'Até você escolher outro cartão no popup ou remover a extensão. A pessoa ativa e as favoritas mantêm o cartão com que foram geradas.',
    )
    const apagar = screen.getByRole('heading', {
      level: 2,
      name: 'Como apagar os dados',
    }).nextElementSibling
    expect(apagar).toHaveTextContent(
      'Escolher outro cartão no popup troca a preferência do cartão.',
    )
    expect(apagar).toHaveTextContent(
      'com a pessoa ativa, os favoritos e a preferência do cartão.',
    )
  })

  // "Nova pessoa" troca só a ativa e nunca apaga um favorito.
  it('os favoritos ficam até você tirá-los, e "Nova pessoa" não os apaga', () => {
    const [ativa, favoritas] = document.querySelectorAll('dl')
    expect(ativa).toHaveTextContent(
      'Até você clicar em “Nova pessoa”, escolher uma favorita ou remover a extensão.',
    )
    expect(favoritas).toHaveTextContent(
      'Até você tirar a pessoa dos favoritos ou remover a extensão. “Nova pessoa” não apaga favoritos.',
    )
    const apagar = screen.getByRole('heading', {
      level: 2,
      name: 'Como apagar os dados',
    }).nextElementSibling
    expect(apagar).toHaveTextContent(
      '“Nova pessoa”, no popup ou no menu, troca a pessoa ativa por outra, mas não apaga os favoritos.',
    )
    expect(apagar).toHaveTextContent(
      'A estrela, no popup, tira uma pessoa dos favoritos.',
    )
    expect(document.body).toHaveTextContent(
      'A pessoa fictícia ativa e as favoritas, com os apelidos, ficam no perfil do seu navegador',
    )
  })

  it('os direitos do art. 18, o prazo e a ANPD', () => {
    expect(document.body).toHaveTextContent('em até 15 dias')
    expect(document.body).toHaveTextContent('art. 18')
    expect(
      screen.getByRole('link', {
        name: 'Autoridade Nacional de Proteção de Dados (ANPD)',
      }),
    ).toHaveAttribute('href', 'https://www.gov.br/anpd/pt-br')
  })

  // A tabela é a lista justificada em loja/textos.md, que o manifesto.e2e.ts do Botaí amarra ao manifesto.
  it('as permissões da tabela são as justificadas nos textos das lojas', () => {
    const justificadas = [
      ...ler('loja/textos.md').matchAll(/^## Justificativa: (.+)$/gm),
    ].map((m) => m[1])
    const linhas = screen.getAllByRole('row').slice(1)
    expect(
      linhas.map((linha) => linha.querySelector('th')?.textContent),
    ).toEqual(justificadas)
    expect(linhas.at(-1)).toHaveTextContent('Só no Firefox')
  })

  // O menu real (criarMenus) tem também "Nova pessoa" e "Abrir caixa de entrada",
  // e este abre um site de terceiro: a permissão precisa dizer isso. A lista não é
  // exata: a 1.1.0 soma o "Preencher com" (os favoritos), e todo título literal do
  // menus.ts precisa aparecer na linha.
  it('a linha do contextMenus cita cada item do menu do botão direito', () => {
    const itens = [
      ...ler('src/lib/menus.ts').matchAll(/title: '([^']+)'/g),
    ].map((m) => m[1])
    expect(itens).toEqual(
      expect.arrayContaining([
        'Preencher esta página',
        'Inserir',
        'Nova pessoa',
        'Abrir caixa de entrada',
      ]),
    )
    const linha = screen.getByRole('row', { name: /^contextMenus\b/ })
    for (const item of itens) expect(linha).toHaveTextContent(item)
    expect(linha).toHaveTextContent('“Preencher com” (um dos favoritos)')
    expect(linha).toHaveTextContent('site de terceiro')
  })

  // O script injetado fica na página: guarda o registro dos campos e o último
  // resultado (api.ts, para o "Mostrar" do popup) e regrava 1 s depois
  // (segunda-passada.ts). Nada disso é gravado em disco nem enviado.
  it('o que a extensão lê da página fica na memória dela até recarregar', () => {
    const campos = document.querySelectorAll('dl')[3]
    expect(campos).toHaveTextContent(
      'Na memória da página, até ela ser recarregada, trocada por outra ou fechada. Nada é gravado nem enviado.',
    )
    const scripting = screen.getByRole('row', { name: /^scripting\b/ })
    expect(scripting).not.toHaveTextContent('só nesse momento')
    expect(scripting).toHaveTextContent(
      'fica na página até ela ser recarregada, trocada por outra ou fechada',
    )
  })

  it('"Dados fictícios e pessoas reais" cita os documentos, o celular e o endereço', () => {
    const paragrafo = screen.getByRole('heading', {
      level: 2,
      name: 'Dados fictícios e pessoas reais',
    }).nextElementSibling
    for (const dado of [
      'CPF',
      'CNPJ',
      'RG',
      'PIS/NIS',
      'título de eleitor',
      'celular',
      'endereço',
    ])
      expect(paragrafo).toHaveTextContent(dado)
  })

  it('"no Firefox o pacote declara que não coleta dados" é o que o wxt.config.ts diz', () => {
    expect(ler('wxt.config.ts')).toContain(
      "data_collection_permissions: { required: ['none'] }",
    )
    expect(document.body).toHaveTextContent(
      'No Firefox, o próprio pacote declara que não coleta dados.',
    )
  })

  // Review Focus 1: o texto vale antes e depois das lojas, e ele lê a URL da aba ativa.
  // Com as pessoas favoritas, os favoritos que ele não lê são os do navegador.
  it('não afirma o que o código não sustenta', () => {
    expect(document.body).not.toHaveTextContent(
      /dispon[ií]vel|publicad[oa] nas lojas|Na Firefox Add-ons/i,
    )
    expect(document.body).toHaveTextContent(
      'não lê o histórico, outras abas, os favoritos do navegador nem cookies',
    )
  })

  it('contato, termos e histórico', () => {
    for (const link of screen.getAllByRole('link', {
      name: 'pilutechinformatica@gmail.com',
    }))
      expect(link).toHaveAttribute(
        'href',
        'mailto:pilutechinformatica@gmail.com?subject=%5BBota%C3%AD%5D%20Privacidade',
      )
    expect(screen.getByRole('link', { name: 'termos de uso' })).toHaveAttribute(
      'href',
      '/termos',
    )
    expect(
      screen.getByRole('link', { name: 'histórico do código-fonte do site' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/PiluVitu/Botai/commits/main/site/app/privacidade/page.tsx',
    )
  })

  it('o voltar leva à landing', () => {
    expect(screen.getByRole('link', { name: 'Botaí' })).toHaveAttribute(
      'href',
      '/',
    )
  })
})
