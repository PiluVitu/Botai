import { hojeEmSaoPaulo } from '@pilutech/botai-core'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Browser } from 'wxt/browser'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { montarPessoa } from '@pilutech/botai-core/pessoa'
import { sfc32 } from '@pilutech/botai-core/prng'
import { cartaoItem, favoritosItem, pessoaItem } from '../../lib/armazenamento'
import { primeiroNome, type Favorito } from '../../lib/favoritos'
import { idadeEm } from '../../lib/hoje'
import type { RespostaPreencher } from '../../lib/mensagens'
import { PESSOA_ANTIGA, PESSOA_DOURADA as P } from '../../test/pessoa-dourada'
import { LINHAS_DO_DESIGN, resumoDe } from '../../test/resumos'
import { App } from './App'

let atalho = 'Ctrl+Shift+Y'
let urlDaAba = 'http://localhost:3000/cadastro'

beforeEach(() => {
  atalho = 'Ctrl+Shift+Y'
  urlDaAba = 'http://localhost:3000/cadastro'
  Object.assign(fakeBrowser.commands, {
    getAll: vi.fn(async () => [
      {
        name: 'botai-preencher',
        shortcut: atalho,
        description: 'Preencher esta página',
      },
    ]),
  })
  vi.spyOn(fakeBrowser.tabs, 'query').mockImplementation(async () => [
    { id: 7, url: urlDaAba } as Browser.tabs.Tab,
  ])
})

afterEach(() => vi.restoreAllMocks())

const botaoPreencher = () =>
  screen.findByRole('button', { name: /Preencher esta página/ })

describe('App do popup', () => {
  it('sem pessoa mostra o 1a, e "Gerar pessoa" leva ao 1b', async () => {
    render(<App />)
    expect(
      await screen.findByRole('heading', {
        name: 'Ainda não há pessoa de teste',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('localhost:3000')).toBeInTheDocument()
    expect(screen.getByText('preenche sem abrir o popup')).toBeInTheDocument()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Gerar pessoa' }))
    const gerada = await vi.waitFor(async () => {
      const pessoa = await pessoaItem.getValue()
      if (!pessoa) throw new Error('ainda sem pessoa')
      return pessoa
    })
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: gerada.nome.completo,
      }),
    ).toBeInTheDocument()
  })

  it('com pessoa mostra o 1b com a idade de hoje e o rodapé com "alterar"', async () => {
    await pessoaItem.setValue(P)
    render(<App />)
    expect(
      await screen.findByRole('heading', { level: 1, name: P.nome.completo }),
    ).toBeInTheDocument()
    const idade = idadeEm(P.nascimento.iso, hojeEmSaoPaulo())
    expect(
      screen.getByText(
        `${idade} anos · ${P.endereco.cidade}, ${P.endereco.uf}`,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('preenche sem abrir')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'alterar' })).toBeInTheDocument()
  })

  it('sem resposta do background (erro inesperado), o Preencher deixa o popup no 1b', async () => {
    const recebidas: unknown[] = []
    fakeBrowser.runtime.onMessage.addListener(
      (mensagem, _remetente, responder) => {
        recebidas.push(mensagem)
        responder(undefined)
        return true
      },
    )
    await pessoaItem.setValue(P)
    render(<App />)
    await userEvent.setup().click(await botaoPreencher())
    await vi.waitFor(() =>
      expect(recebidas).toEqual([{ tipo: 'preencher', tabId: 7 }]),
    )
    expect(
      screen.getByRole('heading', { level: 1, name: P.nome.completo }),
    ).toBeInTheDocument()
  })

  it('página proibida: pílula com o host e Preencher desabilitado', async () => {
    urlDaAba = 'chrome://settings'
    await pessoaItem.setValue(P)
    render(<App />)
    expect(await botaoPreencher()).toBeDisabled()
    expect(screen.getByText('chrome://settings')).toBeInTheDocument()
  })

  it('sem atalho, o rodapé vira "definir atalho", que abre a página de atalhos', async () => {
    atalho = ''
    const abrir = vi.spyOn(fakeBrowser.tabs, 'create')
    await pessoaItem.setValue(P)
    render(<App />)
    expect((await botaoPreencher()).querySelector('kbd')).toBeNull()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'definir atalho' }))
    expect(abrir).toHaveBeenCalledWith({ url: 'chrome://extensions/shortcuts' })
  })

  it('"alterar" abre a página de atalhos', async () => {
    const abrir = vi.spyOn(fakeBrowser.tabs, 'create')
    await pessoaItem.setValue(P)
    render(<App />)
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'alterar' }))
    expect(abrir).toHaveBeenCalledWith({ url: 'chrome://extensions/shortcuts' })
  })

  it('"Caixa de entrada" abre a caixa pública da pessoa', async () => {
    const abrir = vi.spyOn(fakeBrowser.tabs, 'create')
    await pessoaItem.setValue(P)
    render(<App />)
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'Caixa de entrada' }))
    expect(abrir).toHaveBeenCalledWith({ url: P.email.caixaUrl })
  })

  it('"Caixa de entrada" de pessoa sem caixa pública não abre aba', async () => {
    const abrir = vi.spyOn(fakeBrowser.tabs, 'create')
    await pessoaItem.setValue({ ...P, email: { ...P.email, caixaUrl: null } })
    render(<App />)
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'Caixa de entrada' }))
    expect(abrir).not.toHaveBeenCalled()
  })

  it('"Nova pessoa" troca a pessoa guardada', async () => {
    await pessoaItem.setValue(P)
    render(<App />)
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'Nova pessoa' }))
    await vi.waitFor(async () =>
      expect(await pessoaItem.getValue()).not.toEqual(P),
    )
  })

  it('copiar usa a área de transferência', async () => {
    const user = userEvent.setup()
    const escrever = vi.spyOn(navigator.clipboard, 'writeText')
    await pessoaItem.setValue(P)
    render(<App />)
    const pessoais = within(
      await screen.findByRole('region', { name: 'Pessoais' }),
    )
    await user.click(pessoais.getByRole('button', { name: 'Copiar CPF' }))
    expect(escrever).toHaveBeenCalledWith(P.cpf)
  })
})

describe('App do popup: favoritos', () => {
  const outra = (n: number) =>
    montarPessoa(sfc32(n, n + 1, n + 2, n + 3), '2026-10-01')
  const [A, B] = [outra(10), outra(20)]
  const favorito = (id: string, apelido: string, pessoa: typeof P) =>
    ({
      id,
      apelido,
      pessoa,
      guardadoEm: '2026-10-09T12:00:00.000Z',
    }) satisfies Favorito
  const estrela = () =>
    screen.findByRole('button', { name: /favoritos|Limite de 3/ })
  const guardados = () => favoritosItem.getValue()

  it('a estrela guarda a ativa em local:botai_favoritos e o apelido digitado fica acima do nome', async () => {
    await pessoaItem.setValue(P)
    render(<App />)
    const user = userEvent.setup()
    await user.click(await estrela())
    const campo = await screen.findByRole('textbox', {
      name: 'Apelido do favorito',
    })
    expect(campo).toHaveValue(primeiroNome(P))
    await vi.waitFor(async () =>
      expect(await guardados()).toEqual([
        expect.objectContaining({ apelido: primeiroNome(P), pessoa: P }),
      ]),
    )
    await user.clear(campo)
    await user.type(campo, 'admin do staging{Enter}')
    await vi.waitFor(async () =>
      expect((await guardados())[0].apelido).toBe('admin do staging'),
    )
    expect(
      await screen.findByRole('button', { name: 'Tirar dos favoritos' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: 'admin do staging' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(await pessoaItem.getValue()).toEqual(P)
  })

  it('o chip troca a ativa pela pessoa do favorito, sem mexer na lista', async () => {
    const lista = [favorito('f-a', 'comprador PJ', A)]
    await favoritosItem.setValue(lista)
    await pessoaItem.setValue(P)
    render(<App />)
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'comprador PJ' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: A.nome.completo }),
    ).toBeInTheDocument()
    expect(await pessoaItem.getValue()).toEqual(A)
    expect(await guardados()).toEqual(lista)
  })

  it('"Nova pessoa" troca só a ativa: os favoritos ficam', async () => {
    const lista = [favorito('f-p', 'admin do staging', P)]
    await favoritosItem.setValue(lista)
    await pessoaItem.setValue(P)
    render(<App />)
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'Nova pessoa' }))
    await vi.waitFor(async () =>
      expect(await pessoaItem.getValue()).not.toEqual(P),
    )
    expect(await guardados()).toEqual(lista)
    expect(
      await screen.findByRole('button', { name: 'Guardar nos favoritos' }),
    ).toBeInTheDocument()
  })

  it('tirar a ativa e desfazer devolve o favorito na mesma posição, com o apelido', async () => {
    const lista = [
      favorito('f-a', 'comprador PJ', A),
      favorito('f-p', 'admin do staging', P),
      favorito('f-b', 'cliente do PI', B),
    ]
    await favoritosItem.setValue(lista)
    await pessoaItem.setValue(P)
    render(<App />)
    const user = userEvent.setup()
    await user.click(
      await screen.findByRole('button', { name: 'Tirar dos favoritos' }),
    )
    await vi.waitFor(async () =>
      expect((await guardados()).map((f) => f.id)).toEqual(['f-a', 'f-b']),
    )
    expect(await screen.findByRole('status')).toHaveTextContent(
      'admin do staging saiu dos favoritos.',
    )
    await user.click(screen.getByRole('button', { name: 'Desfazer' }))
    await vi.waitFor(async () => expect(await guardados()).toEqual(lista))
    expect(
      await screen.findByRole('button', { name: 'Tirar dos favoritos' }),
    ).toBeInTheDocument()
  })

  it('com 3 favoritos e a ativa de fora, a estrela fica no limite', async () => {
    await favoritosItem.setValue([
      favorito('f-a', 'um', A),
      favorito('f-b', 'dois', B),
      favorito('f-c', 'três', outra(30)),
    ])
    await pessoaItem.setValue(P)
    render(<App />)
    expect(await estrela()).toHaveAccessibleName('Limite de 3 favoritos')
    await userEvent.setup().click(await estrela())
    expect(await guardados()).toHaveLength(3)
    expect(screen.getByText(/Os 3 lugares estão ocupados/)).toBeInTheDocument()
  })
})

describe('App do popup: cartão das próximas pessoas', () => {
  const grupoCartao = async () =>
    within(await screen.findByRole('region', { name: 'Cartão' }))
  const guardada = async () => {
    const pessoa = await pessoaItem.getValue()
    if (!pessoa) throw new Error('sem pessoa')
    return pessoa
  }

  it('escolher Pagar.me e recusado grava em local:botai_cartao, sem mexer na ativa', async () => {
    await pessoaItem.setValue(P)
    render(<App />)
    const cartao = await grupoCartao()
    const user = userEvent.setup()
    await user.click(cartao.getByRole('button', { name: 'Pagar.me' }))
    await vi.waitFor(async () =>
      expect(await cartaoItem.getValue()).toEqual({
        provedor: 'pagarme',
        cenario: 'aprovado',
      }),
    )
    await user.click(
      await cartao.findByRole('button', { name: 'recusado', pressed: false }),
    )
    await vi.waitFor(async () =>
      expect(await cartaoItem.getValue()).toEqual({
        provedor: 'pagarme',
        cenario: 'recusado',
      }),
    )
    expect(
      await cartao.findByRole('button', {
        name: 'Nova pessoa com Pagar.me · recusado',
      }),
    ).toBeInTheDocument()
    expect(await pessoaItem.getValue()).toEqual(P)
    expect(
      cartao.getByText('aprovado', { selector: '[data-tipo]' }),
    ).toBeInTheDocument()
  })

  it('"Nova pessoa com Pagar.me · recusado" gera a ativa com o número do cenário', async () => {
    await cartaoItem.setValue({ provedor: 'pagarme', cenario: 'recusado' })
    await pessoaItem.setValue(P)
    render(<App />)
    const cartao = await grupoCartao()
    await userEvent.setup().click(
      cartao.getByRole('button', {
        name: 'Nova pessoa com Pagar.me · recusado',
      }),
    )
    await vi.waitFor(async () =>
      expect((await guardada()).cartao).toMatchObject({
        numero: '4000000000000028',
        provedor: 'pagarme',
        cenario: 'recusado',
      }),
    )
    const nova = await grupoCartao()
    expect(await nova.findByText('4000 0000 0000 0028')).toBeInTheDocument()
    expect(
      nova.getByText('recusado', { selector: '[data-tipo]' }),
    ).toHaveAttribute('data-tipo', 'erro')
  })

  it('o "Nova pessoa" de sempre também usa a escolha guardada', async () => {
    await cartaoItem.setValue({ provedor: 'stripe', cenario: 'recusado-saldo' })
    await pessoaItem.setValue(P)
    render(<App />)
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'Nova pessoa' }))
    await vi.waitFor(async () =>
      expect((await guardada()).cartao.numero).toBe('4000000000009995'),
    )
  })

  it('a primeira geração, no 1a, usa a escolha guardada', async () => {
    await cartaoItem.setValue({ provedor: 'pagarme', cenario: 'chargeback' })
    render(<App />)
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'Gerar pessoa' }))
    await vi.waitFor(async () =>
      expect((await guardada()).cartao).toMatchObject({
        provedor: 'pagarme',
        cenario: 'chargeback',
      }),
    )
  })

  it('valor inválido guardado (o catálogo mudou) aparece como o padrão', async () => {
    await fakeBrowser.storage.local.set({
      botai_cartao: { provedor: 'pagarme', cenario: 'sumiu' },
    })
    await pessoaItem.setValue(P)
    render(<App />)
    const cartao = await grupoCartao()
    expect(cartao.getByRole('button', { name: 'Stripe' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      cartao.getByRole('button', { name: 'Nova pessoa com Stripe · aprovado' }),
    ).toBeInTheDocument()
  })

  it('pessoa antiga guardada (sem provedor no cartão) abre no 1b como Stripe aprovado', async () => {
    await pessoaItem.setValue(PESSOA_ANTIGA)
    render(<App />)
    const cartao = await grupoCartao()
    expect(
      cartao.getByText('aprovado', { selector: '[data-tipo]' }),
    ).toHaveAttribute('data-tipo', 'ok')
    expect(cartao.getByText('Stripe', { selector: 'span' })).toBeInTheDocument()
  })
})

function simularBackground(resposta: RespostaPreencher | undefined) {
  const recebidas: { tipo: string }[] = []
  fakeBrowser.runtime.onMessage.addListener(
    (mensagem, _remetente, responder) => {
      recebidas.push(mensagem as { tipo: string })
      responder(
        (mensagem as { tipo: string }).tipo === 'preencher' ? resposta : true,
      )
      return true
    },
  )
  return recebidas
}

const cabecalho = () => screen.getByRole('banner')
const temCadeado = () =>
  cabecalho().querySelector('svg[data-icon="lock"]') !== null

describe('App do popup: retorno do Preencher', () => {
  it('com campos preenchidos mostra o 1c com o caminho, a lista e o rodapé "preenche de novo"', async () => {
    simularBackground({ ok: true, resumo: resumoDe(12, LINHAS_DO_DESIGN) })
    await pessoaItem.setValue(P)
    render(<App />)
    await userEvent.setup().click(await botaoPreencher())
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: '12 de 14 campos preenchidos',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(`/cadastro · com ${P.nome.completo}`),
    ).toBeInTheDocument()
    expect(screen.getByText('preenche de novo')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'alterar' })).toBeNull()
    expect(cabecalho().querySelector('.bg-ok')).not.toBeNull()
  })

  it('a mira do 1c pede ao background para mostrar aquele campo, naquele documento', async () => {
    const recebidas = simularBackground({
      ok: true,
      resumo: resumoDe(12, LINHAS_DO_DESIGN),
    })
    await pessoaItem.setValue(P)
    render(<App />)
    const user = userEvent.setup()
    await user.click(await botaoPreencher())
    await user.click(
      await screen.findByRole('button', {
        name: 'Mostrar na página: Código de indicação',
      }),
    )
    await vi.waitFor(() =>
      expect(recebidas).toContainEqual({
        tipo: 'mostrar',
        tabId: 7,
        documentId: 'doc-0',
        idx: 13,
      }),
    )
  })

  it('"Ver os dados" do 1c volta ao 1b, e "Caixa de entrada" abre a caixa da pessoa', async () => {
    simularBackground({ ok: true, resumo: resumoDe(12, LINHAS_DO_DESIGN) })
    const abrir = vi.spyOn(fakeBrowser.tabs, 'create')
    await pessoaItem.setValue(P)
    render(<App />)
    const user = userEvent.setup()
    await user.click(await botaoPreencher())
    await user.click(
      await screen.findByRole('button', { name: 'Caixa de entrada' }),
    )
    expect(abrir).toHaveBeenCalledWith({ url: P.email.caixaUrl })
    await user.click(screen.getByRole('button', { name: 'Ver os dados' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: P.nome.completo }),
    ).toBeInTheDocument()
  })

  it('nenhum campo reconhecido: 1d com pílula warn; "Tentar de novo" preenche outra vez; o warn fica no 1b', async () => {
    const recebidas = simularBackground({
      ok: true,
      resumo: resumoDe(0, LINHAS_DO_DESIGN),
    })
    await pessoaItem.setValue(P)
    render(<App />)
    const user = userEvent.setup()
    await user.click(await botaoPreencher())
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Nenhum campo reconhecido nesta página',
      }),
    ).toBeInTheDocument()
    expect(cabecalho().querySelector('.bg-warn')).not.toBeNull()
    expect(screen.getByText('preenche sem abrir')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'alterar' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    await vi.waitFor(() =>
      expect(recebidas.filter((m) => m.tipo === 'preencher')).toHaveLength(2),
    )
    await user.click(screen.getByRole('button', { name: 'Ver os dados' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: P.nome.completo }),
    ).toBeInTheDocument()
    expect(cabecalho().querySelector('.bg-warn')).not.toBeNull()
  })

  it('página sem formulário (Y = 0): 1d "Nenhum formulário nesta página"', async () => {
    simularBackground({ ok: true, resumo: resumoDe(0) })
    await pessoaItem.setValue(P)
    render(<App />)
    await userEvent.setup().click(await botaoPreencher())
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Nenhum formulário nesta página',
      }),
    ).toBeInTheDocument()
    expect(cabecalho().querySelector('.bg-warn')).not.toBeNull()
  })

  it('Preencher recusado pelo Chrome: 1e sem rodapé; "Ver os dados" leva ao 1b com Preencher desabilitado e cadeado', async () => {
    simularBackground({ ok: false, motivo: 'proibida' })
    await pessoaItem.setValue(P)
    render(<App />)
    const user = userEvent.setup()
    await user.click(await botaoPreencher())
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'O Chrome não deixa extensões mexerem nesta página',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).toBeNull()
    expect(temCadeado()).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Ver os dados' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: P.nome.completo }),
    ).toBeInTheDocument()
    expect(await botaoPreencher()).toBeDisabled()
    expect(temCadeado()).toBe(true)
  })

  it('Preencher em file: sem acesso vira o 1e de arquivo', async () => {
    simularBackground({ ok: false, motivo: 'arquivo-sem-acesso' })
    await pessoaItem.setValue(P)
    render(<App />)
    await userEvent.setup().click(await botaoPreencher())
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Falta liberar o acesso a arquivos',
      }),
    ).toBeInTheDocument()
  })

  it('aberto numa página proibida pela URL, vai direto ao 1e, sem rodapé e com cadeado', async () => {
    urlDaAba = 'chrome://settings'
    await pessoaItem.setValue(P)
    render(<App />)
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'O Chrome não deixa extensões mexerem nesta página',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(P.nome.completo)).toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).toBeNull()
    expect(temCadeado()).toBe(true)
  })

  it('1e sem pessoa: "Gerar pessoa" guarda uma e o cartão passa a mostrar o nome', async () => {
    urlDaAba = 'chrome://settings'
    render(<App />)
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'Gerar pessoa' }))
    const gerada = await vi.waitFor(async () => {
      const pessoa = await pessoaItem.getValue()
      if (!pessoa) throw new Error('ainda sem pessoa')
      return pessoa
    })
    expect(await screen.findByText(gerada.nome.completo)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'O Chrome não deixa extensões mexerem nesta página',
      }),
    ).toBeInTheDocument()
  })

  it('aberto num file: sem acesso liberado, mostra o 1e de arquivo', async () => {
    urlDaAba = 'file:///Users/eu/form.html'
    Object.assign(fakeBrowser.extension, {
      isAllowedFileSchemeAccess: vi.fn(async () => false),
    })
    await pessoaItem.setValue(P)
    render(<App />)
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Falta liberar o acesso a arquivos',
      }),
    ).toBeInTheDocument()
    expect(within(cabecalho()).getByText('arquivo local')).toBeInTheDocument()
  })
})

describe('App do popup: crédito da PiluTech', () => {
  const chegarEm: [string, () => Promise<void>][] = [
    [
      '1a',
      async () => {
        render(<App />)
        await screen.findByRole('heading', {
          name: 'Ainda não há pessoa de teste',
        })
      },
    ],
    [
      '1b',
      async () => {
        await pessoaItem.setValue(P)
        render(<App />)
        await screen.findByRole('heading', {
          level: 1,
          name: P.nome.completo,
        })
      },
    ],
    [
      '1c',
      async () => {
        simularBackground({ ok: true, resumo: resumoDe(12, LINHAS_DO_DESIGN) })
        await pessoaItem.setValue(P)
        render(<App />)
        await userEvent.setup().click(await botaoPreencher())
        await screen.findByRole('heading', {
          level: 1,
          name: '12 de 14 campos preenchidos',
        })
      },
    ],
    [
      '1d',
      async () => {
        simularBackground({ ok: true, resumo: resumoDe(0, LINHAS_DO_DESIGN) })
        await pessoaItem.setValue(P)
        render(<App />)
        await userEvent.setup().click(await botaoPreencher())
        await screen.findByRole('heading', {
          level: 1,
          name: 'Nenhum campo reconhecido nesta página',
        })
      },
    ],
    [
      '1e',
      async () => {
        urlDaAba = 'chrome://settings'
        await pessoaItem.setValue(P)
        render(<App />)
        await screen.findByRole('heading', {
          level: 1,
          name: 'O Chrome não deixa extensões mexerem nesta página',
        })
      },
    ],
  ]

  it.each(chegarEm)(
    'no %s, "Powered by PiluTech" é o último botão do popup e abre pilutech.com.br numa aba nova',
    async (_estado, chegar) => {
      const abrir = vi.spyOn(fakeBrowser.tabs, 'create')
      await chegar()
      const credito = screen.getByRole('button', {
        name: 'Powered by PiluTech (abre pilutech.com.br)',
      })
      expect(screen.getAllByRole('button').at(-1)).toBe(credito)
      await userEvent.setup().click(credito)
      expect(abrir).toHaveBeenCalledWith({ url: 'https://pilutech.com.br' })
    },
  )
})

describe('App do popup: por navegador', () => {
  // O App.test precisa do navigator real (o user-event pendura nele o clipboard):
  // o Edge entra só pela propriedade que o detector lê.
  const comMarcasDoEdge = () =>
    Object.defineProperty(navigator, 'userAgentData', {
      value: { brands: [{ brand: 'Microsoft Edge', version: '141' }] },
      configurable: true,
    })

  afterEach(() => {
    vi.unstubAllEnvs()
    Reflect.deleteProperty(navigator, 'userAgentData')
  })

  it('no Firefox, "alterar" abre a tela de atalhos do próprio Firefox, sem criar aba', async () => {
    vi.stubEnv('FIREFOX', 'true')
    const abrirAtalhos = vi.fn(async () => undefined)
    Object.assign(fakeBrowser.commands, { openShortcutSettings: abrirAtalhos })
    const abrir = vi.spyOn(fakeBrowser.tabs, 'create')
    await pessoaItem.setValue(P)
    render(<App />)
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'alterar' }))
    expect(abrirAtalhos).toHaveBeenCalledTimes(1)
    expect(abrir).not.toHaveBeenCalled()
  })

  it('no Firefox, o 1e fala do Firefox', async () => {
    vi.stubEnv('FIREFOX', 'true')
    urlDaAba = 'about:addons'
    await pessoaItem.setValue(P)
    render(<App />)
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'O Firefox não deixa extensões mexerem nesta página',
      }),
    ).toBeInTheDocument()
  })

  it('no Edge (o zip do Chrome), o 1e fala do Edge', async () => {
    comMarcasDoEdge()
    urlDaAba = 'edge://settings'
    await pessoaItem.setValue(P)
    render(<App />)
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'O Edge não deixa extensões mexerem nesta página',
      }),
    ).toBeInTheDocument()
  })

  it('no Edge, "alterar" abre a página de atalhos do Chromium', async () => {
    comMarcasDoEdge()
    const abrir = vi.spyOn(fakeBrowser.tabs, 'create')
    await pessoaItem.setValue(P)
    render(<App />)
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'alterar' }))
    expect(abrir).toHaveBeenCalledWith({
      url: 'chrome://extensions/shortcuts',
    })
  })
})
