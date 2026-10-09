import {
  abrirPopup,
  cartaoGuardado,
  exigirPessoa,
  expect,
  favoritosGuardados,
  idDaAba,
  ORIGEM,
  pessoaGuardada,
  servir,
  test,
} from '../../test/extensao.fixture'

test('cartão: escolher Pagar.me e recusado vale para a próxima pessoa, no popup e no preenchimento', async ({
  context,
  sw,
  extensionId,
}) => {
  await servir(context, {
    '/checkout': {
      corpo:
        '<!doctype html><meta charset="utf-8">' +
        '<label>CPF <input name="cpf"></label>' +
        '<label>Número do cartão <input name="numero" autocomplete="cc-number"></label>',
    },
  })
  const aba = await context.newPage()
  await aba.goto(`${ORIGEM}/checkout`)
  const tabId = await idDaAba(sw, `${ORIGEM}/checkout`)
  const popup = await abrirPopup(context, extensionId, `?aba=${tabId}`)

  // Sem escolha, a primeira pessoa sai com o aprovado da Stripe.
  await popup.getByRole('button', { name: 'Gerar pessoa' }).click()
  await expect.poll(() => pessoaGuardada(sw)).toBeDefined()
  const primeira = await exigirPessoa(sw)
  expect(primeira.cartao).toMatchObject({
    provedor: 'stripe',
    cenario: 'aprovado',
  })
  const grupo = popup.getByRole('region', { name: 'Cartão' })
  await expect(grupo.locator('[data-tipo="ok"]')).toHaveText('aprovado')

  // A primeira vira favorita: ela tem de voltar com o cartão da Stripe.
  await popup.getByRole('button', { name: 'Guardar nos favoritos' }).click()
  const apelido = popup.getByRole('textbox', { name: 'Apelido do favorito' })
  await apelido.fill('compradora Stripe')
  await apelido.press('Enter')
  await expect.poll(() => favoritosGuardados(sw)).toHaveLength(1)

  // Escolher Pagar.me + recusado só grava a preferência: a ativa fica como estava.
  const provedor = grupo.getByRole('group', { name: 'Provedor' })
  const cenario = grupo.getByRole('group', { name: 'Cenário' })
  await provedor.getByRole('button', { name: 'Pagar.me', exact: true }).click()
  await cenario.getByRole('button', { name: 'recusado', exact: true }).click()
  await expect
    .poll(() => cartaoGuardado(sw))
    .toEqual({ provedor: 'pagarme', cenario: 'recusado' })
  await expect(
    cenario.getByRole('button', { name: 'recusado', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  expect((await exigirPessoa(sw)).cpf).toBe(primeira.cpf)

  // A próxima pessoa sai com o número do cenário, e o popup mostra o cenário dela.
  await grupo
    .getByRole('button', { name: 'Nova pessoa com Pagar.me · recusado' })
    .click()
  await expect
    .poll(async () => (await exigirPessoa(sw)).cartao.numero)
    .toBe('4000000000000028')
  const nova = await exigirPessoa(sw)
  expect(nova.cpf).not.toBe(primeira.cpf)
  expect(nova.cartao).toMatchObject({
    provedor: 'pagarme',
    cenario: 'recusado',
  })
  await expect(
    popup.getByRole('heading', { level: 1, name: nova.nome.completo }),
  ).toBeVisible()
  await expect(grupo.getByText('4000 0000 0000 0028')).toBeVisible()
  await expect(grupo.locator('[data-tipo="erro"]')).toHaveText('recusado')

  // E o preenchimento escreve esse número.
  await popup.getByRole('button', { name: /Preencher esta página/ }).click()
  await expect(aba.locator('input[name="numero"]')).toHaveValue(
    '4000 0000 0000 0028',
  )
  await expect(aba.locator('input[name="cpf"]')).toHaveValue(nova.cpf)

  // A favorita continua com o cartão com que foi gerada, e a escolha continua guardada.
  const [favorito] = await favoritosGuardados(sw)
  expect(favorito.pessoa.cartao).toEqual(primeira.cartao)
  const dados = await abrirPopup(context, extensionId, `?aba=${tabId}`)
  await dados.getByRole('button', { name: 'compradora Stripe' }).click()
  await expect.poll(async () => (await exigirPessoa(sw)).cpf).toBe(primeira.cpf)
  const grupoDaFavorita = dados.getByRole('region', { name: 'Cartão' })
  await expect(grupoDaFavorita.locator('[data-tipo="ok"]')).toHaveText(
    'aprovado',
  )
  await expect(
    grupoDaFavorita.getByRole('button', { name: 'Pagar.me', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  expect(await cartaoGuardado(sw)).toEqual({
    provedor: 'pagarme',
    cenario: 'recusado',
  })
})
