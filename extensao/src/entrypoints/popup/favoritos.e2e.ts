import { primeiroNome } from '../../lib/favoritos'
import {
  abrirPopup,
  exigirPessoa,
  expect,
  favoritosGuardados,
  idDaAba,
  ORIGEM,
  pessoaGuardada,
  servir,
  test,
} from '../../test/extensao.fixture'

test('favoritos: guarda com apelido, troca a ativa pelo chip e preenche com a favorita', async ({
  context,
  sw,
  extensionId,
}) => {
  await servir(context, {
    '/form': {
      corpo:
        '<!doctype html><meta charset="utf-8">' +
        '<label>CPF <input name="cpf"></label>' +
        '<label>E-mail <input type="email" name="email"></label>',
    },
  })
  const aba = await context.newPage()
  await aba.goto(`${ORIGEM}/form`)
  const tabId = await idDaAba(sw, `${ORIGEM}/form`)
  const popup = await abrirPopup(context, extensionId, `?aba=${tabId}`)

  await popup.getByRole('button', { name: 'Gerar pessoa' }).click()
  await expect.poll(() => pessoaGuardada(sw)).toBeDefined()
  const favorita = await exigirPessoa(sw)
  await expect(
    popup.getByRole('heading', { level: 1, name: favorita.nome.completo }),
  ).toBeVisible()
  await expect(popup.getByText('0/3', { exact: true })).toBeVisible()

  // Guardar: a estrela abre o apelido com o primeiro nome; Enter salva o digitado.
  await popup.getByRole('button', { name: 'Guardar nos favoritos' }).click()
  const campo = popup.getByRole('textbox', { name: 'Apelido do favorito' })
  await expect(campo).toBeFocused()
  await expect(campo).toHaveValue(primeiroNome(favorita))
  await campo.fill('admin do staging')
  await campo.press('Enter')
  await expect(
    popup.getByRole('button', { name: 'Tirar dos favoritos' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(popup.getByText('1/3', { exact: true })).toBeVisible()
  await expect
    .poll(() => favoritosGuardados(sw))
    .toEqual([
      expect.objectContaining({
        apelido: 'admin do staging',
        pessoa: favorita,
      }),
    ])

  // "Nova pessoa" troca só a ativa; o favorito continua lá.
  await popup.getByRole('button', { name: 'Nova pessoa' }).click()
  await expect(
    popup.getByRole('button', { name: 'Guardar nos favoritos' }),
  ).toBeVisible()
  expect((await exigirPessoa(sw)).cpf).not.toBe(favorita.cpf)
  expect(await favoritosGuardados(sw)).toHaveLength(1)

  // O chip torna a favorita a ativa de novo.
  const chip = popup.getByRole('button', { name: 'admin do staging' })
  await expect(chip).toHaveAttribute('aria-pressed', 'false')
  await chip.click()
  await expect(
    popup.getByRole('heading', { level: 1, name: favorita.nome.completo }),
  ).toBeVisible()
  await expect(chip).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(async () => (await exigirPessoa(sw)).cpf).toBe(favorita.cpf)

  // E o Preencher usa a favorita.
  await popup.getByRole('button', { name: /Preencher esta página/ }).click()
  await expect(aba.locator('input[name="cpf"]')).toHaveValue(favorita.cpf)
  await expect(aba.locator('input[name="email"]')).toHaveValue(
    favorita.email.endereco,
  )
  await expect(aba.locator('botai-aviso .botai-titulo')).toHaveText(
    '2 de 2 campos preenchidos',
  )
})

test('favoritos: tirar mostra o aviso, e o Desfazer devolve o apelido', async ({
  context,
  sw,
  extensionId,
}) => {
  await servir(context, { '/form': { corpo: '<!doctype html><p>vazio' } })
  const aba = await context.newPage()
  await aba.goto(`${ORIGEM}/form`)
  const tabId = await idDaAba(sw, `${ORIGEM}/form`)
  const popup = await abrirPopup(context, extensionId, `?aba=${tabId}`)
  await popup.getByRole('button', { name: 'Gerar pessoa' }).click()
  await popup.getByRole('button', { name: 'Guardar nos favoritos' }).click()
  const campo = popup.getByRole('textbox', { name: 'Apelido do favorito' })
  await campo.fill('comprador PJ')
  await campo.press('Enter')
  await expect
    .poll(async () => (await favoritosGuardados(sw)).map((f) => f.apelido))
    .toEqual(['comprador PJ'])

  await popup.getByRole('button', { name: 'Tirar dos favoritos' }).click()
  await expect(popup.getByRole('status')).toHaveText(
    'comprador PJ saiu dos favoritos.Desfazer',
  )
  await expect.poll(() => favoritosGuardados(sw)).toEqual([])
  await popup.getByRole('button', { name: 'Desfazer' }).click()
  await expect
    .poll(async () => (await favoritosGuardados(sw)).map((f) => f.apelido))
    .toEqual(['comprador PJ'])
  await expect(popup.getByRole('status')).toBeEmpty()
  await expect(popup.getByText('comprador PJ').first()).toBeVisible()
})
