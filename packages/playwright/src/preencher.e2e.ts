import { gerarPessoa, hojeEmSaoPaulo } from '@pilutech/botai-core'
import { expect, test } from '@playwright/test'
import { preencherAlvo } from './preencher.js'
import {
  CADASTRO,
  ENDERECO,
  ORIGEM,
  ORIGEM_DE_FORA,
  REACT,
  scriptDaPaginaReact,
  servir,
} from './teste/paginas.js'

const HOJE = hojeEmSaoPaulo()
const P = gerarPessoa({ semente: 'preencher.e2e', hoje: HOJE })

const SO_CPF =
  '<!doctype html><meta charset="utf-8"><label>CPF <input name="cpf"></label>'
const SO_EMAIL =
  '<!doctype html><meta charset="utf-8"><label>E-mail <input type="email" name="email"></label>'
const SECOES =
  '<!doctype html><meta charset="utf-8"><form id="entrega"><label>CEP <input name="cep"></label><label>Cidade <input name="cidade"></label></form><form id="contato"><label>E-mail <input type="email" name="email"></label><label>CPF <input name="cpf"></label></form>'

interface JanelaComBusca {
  buscas: number
  siteSobrescreveu: boolean
}

test('cadastro realista: 21 preenchidos, 2 não reconhecidos, valores da pessoa e nada pintado', async ({
  context,
  page,
}) => {
  await servir(context, ORIGEM, { '/cadastro': { corpo: CADASTRO } })
  await page.goto(`${ORIGEM}/cadastro`)

  const resultado = await preencherAlvo(page, P, HOJE)

  expect(resultado.preenchidos).toHaveLength(21)
  expect(resultado.recusados).toEqual([])
  expect(resultado.naoReconhecidos).toEqual([
    {
      frame: `${ORIGEM}/cadastro`,
      rotulo: 'Código de indicação',
      seletor: 'input[name="ref_code"]',
    },
    {
      frame: `${ORIGEM}/cadastro`,
      rotulo: 'Como nos conheceu?',
      seletor: 'select#origem',
    },
  ])
  const esperado: Record<string, string> = {
    nome: P.nome.completo,
    nascimento: P.nascimento.br,
    email: P.email.endereco,
    email2: P.email.endereco,
    cpf: P.cpf,
    cel: P.celular.formatado,
    senha: P.senha,
    senha2: P.senha,
    sexo: P.nome.sexo,
    cep: P.endereco.cep,
    logradouro: P.endereco.logradouro,
    numero: P.endereco.numero,
    complemento: P.endereco.complemento,
    bairro: P.endereco.bairro,
    cidade: P.endereco.cidade,
    cc: P.cartao.numeroFormatado,
    ccname: P.cartao.titular,
    mes: P.cartao.mes,
    ano: `20${P.cartao.ano}`,
    cvv: P.cartao.cvv,
    ref_code: '',
    b_7f3e_honeypot: '',
    csrf: 'x',
    q: '',
  }
  for (const [nome, valor] of Object.entries(esperado)) {
    await expect(page.locator(`[name="${nome}"]`)).toHaveValue(valor)
  }
  await expect(
    page.locator('select[name="estado"] option:checked'),
  ).toHaveAttribute('data-uf', P.endereco.uf)
  await expect(page.locator('#origem')).toHaveValue('')
  await expect(page.locator('input[name="termos"]')).not.toBeChecked()
  await expect(page.locator('input[name="nome"]')).toHaveCSS(
    'outline-style',
    'none',
  )
})

test('React controlado, máscara e validação no blur enxergam o valor, sem roubar o foco', async ({
  context,
  page,
}) => {
  await servir(context, ORIGEM, {
    '/react': { corpo: REACT },
    '/react.pagina.js': {
      corpo: await scriptDaPaginaReact(),
      tipo: 'text/javascript',
    },
  })
  await page.goto(`${ORIGEM}/react`)
  await expect(page.locator('input[name="nome"]')).toBeVisible()

  const resultado = await preencherAlvo(page, P, HOJE)

  expect(resultado.preenchidos.map((l) => l.rotulo)).toEqual([
    'Nome completo',
    'E-mail',
    'CPF',
    'CEP',
  ])
  expect(resultado.recusados).toEqual([
    {
      frame: `${ORIGEM}/react`,
      rotulo: 'Celular',
      seletor: 'input[name="celular"]',
    },
  ])
  expect(resultado.naoReconhecidos).toEqual([])
  await expect(page.locator('#estado')).toHaveText(
    JSON.stringify({
      nome: P.nome.completo,
      email: P.email.endereco,
      emailTocado: true,
      cpf: P.cpf,
    }),
  )
  await expect(page.locator('input[name="cpf"]')).toHaveValue(P.cpf)
  await expect(page.locator('input[name="celular"]')).toHaveValue('')
  await expect(page.locator('#cep-validado')).toHaveText('validado')
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe(
    'BODY',
  )
})

test('percorre os frames: iframe da mesma origem e de outra origem', async ({
  context,
  page,
}) => {
  await servir(context, ORIGEM, {
    '/com-quadros': {
      corpo: `<!doctype html><meta charset="utf-8"><label>Nome completo <input name="nome"></label><iframe id="mesma" src="/quadro" style="width:400px;height:120px"></iframe><iframe id="de-fora" src="${ORIGEM_DE_FORA}/quadro" style="width:400px;height:120px"></iframe>`,
    },
    '/quadro': { corpo: SO_CPF },
  })
  await servir(context, ORIGEM_DE_FORA, { '/quadro': { corpo: SO_EMAIL } })
  await page.goto(`${ORIGEM}/com-quadros`)
  await expect(
    page.frameLocator('#mesma').locator('input[name="cpf"]'),
  ).toBeVisible()
  await expect(
    page.frameLocator('#de-fora').locator('input[name="email"]'),
  ).toBeVisible()

  const resultado = await preencherAlvo(page, P, HOJE)

  expect(resultado.preenchidos).toHaveLength(3)
  expect(resultado.preenchidos).toEqual(
    expect.arrayContaining([
      {
        frame: `${ORIGEM}/com-quadros`,
        rotulo: 'Nome completo',
        seletor: 'input[name="nome"]',
      },
      {
        frame: `${ORIGEM}/quadro`,
        rotulo: 'CPF',
        seletor: 'input[name="cpf"]',
      },
      {
        frame: `${ORIGEM_DE_FORA}/quadro`,
        rotulo: 'E-mail',
        seletor: 'input[name="email"]',
      },
    ]),
  )
  await expect(page.locator('input[name="nome"]')).toHaveValue(P.nome.completo)
  await expect(
    page.frameLocator('#mesma').locator('input[name="cpf"]'),
  ).toHaveValue(P.cpf)
  await expect(
    page.frameLocator('#de-fora').locator('input[name="email"]'),
  ).toHaveValue(P.email.endereco)
})

test.describe('alvo Locator', () => {
  test('preenche só dentro do elemento', async ({ context, page }) => {
    await servir(context, ORIGEM, { '/secoes': { corpo: SECOES } })
    await page.goto(`${ORIGEM}/secoes`)

    const resultado = await preencherAlvo(page.locator('#entrega'), P, HOJE)

    expect(resultado.preenchidos.map((l) => l.rotulo)).toEqual([
      'CEP',
      'Cidade',
    ])
    await expect(page.locator('[name="cidade"]')).toHaveValue(P.endereco.cidade)
    await expect(page.locator('[name="email"]')).toHaveValue('')
    await expect(page.locator('[name="cpf"]')).toHaveValue('')
  })

  test('locator de um campo só preenche esse campo', async ({
    context,
    page,
  }) => {
    await servir(context, ORIGEM, { '/secoes': { corpo: SECOES } })
    await page.goto(`${ORIGEM}/secoes`)

    const resultado = await preencherAlvo(page.getByLabel('CPF'), P, HOJE)

    expect(resultado.preenchidos).toEqual([
      {
        frame: `${ORIGEM}/secoes`,
        rotulo: 'CPF',
        seletor: 'input[name="cpf"]',
      },
    ])
    await expect(page.locator('[name="cpf"]')).toHaveValue(P.cpf)
    await expect(page.locator('[name="email"]')).toHaveValue('')
  })

  test('locator dentro de um iframe instala o motor naquele frame', async ({
    context,
    page,
  }) => {
    await servir(context, ORIGEM, {
      '/com-form-no-quadro': {
        corpo:
          '<!doctype html><meta charset="utf-8"><iframe src="/secoes" style="width:600px;height:300px"></iframe>',
      },
      '/secoes': { corpo: SECOES },
    })
    await page.goto(`${ORIGEM}/com-form-no-quadro`)
    const quadro = page.frameLocator('iframe')
    await expect(quadro.locator('#contato')).toBeVisible()

    const resultado = await preencherAlvo(quadro.locator('#contato'), P, HOJE)

    expect(resultado.preenchidos.map((l) => [l.frame, l.rotulo])).toEqual([
      [`${ORIGEM}/secoes`, 'E-mail'],
      [`${ORIGEM}/secoes`, 'CPF'],
    ])
    await expect(quadro.locator('[name="email"]')).toHaveValue(P.email.endereco)
    await expect(quadro.locator('[name="cep"]')).toHaveValue('')
  })
})

test('entra em shadow root aberta; a fechada fica de fora (limite do Playwright)', async ({
  context,
  page,
}) => {
  await servir(context, ORIGEM, {
    '/sombras': {
      corpo: `<!doctype html><meta charset="utf-8"><x-aberto></x-aberto><x-fechado></x-fechado>
<script>
customElements.define('x-aberto', class extends HTMLElement { constructor() { super(); this.attachShadow({ mode: 'open' }).innerHTML = '<label>CPF <input name="cpf"></label>' } })
customElements.define('x-fechado', class extends HTMLElement { constructor() { super(); this.attachShadow({ mode: 'closed' }).innerHTML = '<label>E-mail <input type="email" name="email"></label>' } })
</script>`,
    },
  })
  await page.goto(`${ORIGEM}/sombras`)

  const resultado = await preencherAlvo(page, P, HOJE)

  expect(resultado).toEqual({
    preenchidos: [
      {
        frame: `${ORIGEM}/sombras`,
        rotulo: 'CPF',
        seletor: 'x-aberto › input[name="cpf"]',
      },
    ],
    naoReconhecidos: [],
    recusados: [],
  })
  await expect(page.locator('x-aberto input[name="cpf"]')).toHaveValue(P.cpf)
})

test.describe('segunda passada', () => {
  test('a Promise só resolve depois de desfazer a sobrescrita do site', async ({
    context,
    page,
  }) => {
    await servir(context, ORIGEM, { '/endereco': { corpo: ENDERECO } })
    await page.goto(`${ORIGEM}/endereco`)

    await preencherAlvo(page, P, HOJE)

    expect(
      await page.evaluate(
        () => (window as unknown as JanelaComBusca).siteSobrescreveu,
      ),
    ).toBe(true)
    expect(await page.locator('[name="complemento"]').inputValue()).toBe(
      P.endereco.complemento,
    )
    expect(
      await page.evaluate(() => (window as unknown as JanelaComBusca).buscas),
    ).toBe(1)
  })

  test('segundaPassada: false devolve logo e deixa o valor do site', async ({
    context,
    page,
  }) => {
    await servir(context, ORIGEM, { '/endereco': { corpo: ENDERECO } })
    await page.goto(`${ORIGEM}/endereco`)

    await preencherAlvo(page, P, HOJE, { segundaPassada: false })

    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as JanelaComBusca).siteSobrescreveu,
        ),
      )
      .toBe(true)
    expect(await page.locator('[name="complemento"]').inputValue()).toBe(
      'de 612 a 1510 - lado par',
    )
  })
})

test('passa pela CSP estrita da página', async ({ context, page }) => {
  await servir(context, ORIGEM, {
    '/csp': {
      corpo: SO_CPF,
      cabecalhos: {
        'Content-Security-Policy': "default-src 'none'; script-src 'self'",
      },
    },
  })
  await page.goto(`${ORIGEM}/csp`)

  const resultado = await preencherAlvo(page, P, HOJE)

  expect(resultado.preenchidos).toHaveLength(1)
  await expect(page.locator('[name="cpf"]')).toHaveValue(P.cpf)
})

test('reinstala o motor a cada documento e reaproveita no mesmo documento', async ({
  context,
  page,
}) => {
  await servir(context, ORIGEM, {
    '/a': { corpo: SO_CPF },
    '/b': { corpo: SO_EMAIL },
  })
  await page.goto(`${ORIGEM}/a`)
  expect((await preencherAlvo(page, P, HOJE)).preenchidos).toHaveLength(1)
  const deNovo = await preencherAlvo(page, P, HOJE)
  expect(deNovo.preenchidos.map((l) => l.rotulo)).toEqual(['CPF'])
  expect(
    await page.evaluate(() =>
      Object.keys(window).filter((nome) => nome.startsWith('__botai')),
    ),
  ).toEqual(['__botaiNavegador'])

  await page.goto(`${ORIGEM}/b`)
  const outro = await preencherAlvo(page, P, HOJE)
  expect(outro.preenchidos.map((l) => l.rotulo)).toEqual(['E-mail'])
  await expect(page.locator('[name="email"]')).toHaveValue(P.email.endereco)
})
