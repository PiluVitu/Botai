import { validarCPF } from '@pilutech/botai-core/cpf'
import { montarPessoa } from '@pilutech/botai-core/pessoa'
import { sfc32 } from '@pilutech/botai-core/prng'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { PESSOA_ANTIGA, PESSOA_DOURADA } from '../test/pessoa-dourada'
import {
  cartaoItem,
  devolverFavorito,
  escolherCartao,
  favoritosItem,
  gerarPessoaNova,
  guardarFavorito,
  lerEscolhaDoCartao,
  obterOuGerarPessoa,
  pessoaItem,
  renomearFavorito,
  tirarFavorito,
  usarFavorito,
} from './armazenamento'
import { primeiroNome, type Favorito } from './favoritos'
import { idadeEm } from './hoje'

describe('armazenamento da pessoa', () => {
  // Só o Date é falso: o fakeBrowser.storage trabalha com promises, não com timers.
  beforeEach(() =>
    vi.useFakeTimers({
      toFake: ['Date'],
      now: new Date('2026-10-01T15:00:00Z'),
    }),
  )
  afterEach(() => vi.useRealTimers())

  it('começa vazio', async () => {
    expect(await pessoaItem.getValue()).toBeNull()
  })

  it('guarda a pessoa inteira em local:botai_pessoa, não a semente', async () => {
    await pessoaItem.setValue(PESSOA_DOURADA)
    expect(await fakeBrowser.storage.local.get('botai_pessoa')).toEqual({
      botai_pessoa: PESSOA_DOURADA,
    })
  })

  it('ignora a pessoa guardada na chave provisória local:pessoa', async () => {
    await fakeBrowser.storage.local.set({ pessoa: PESSOA_DOURADA })
    expect(await pessoaItem.getValue()).toBeNull()
  })

  it('obterOuGerarPessoa gera uma pessoa válida, guarda e devolve', async () => {
    const pessoa = await obterOuGerarPessoa()
    expect(validarCPF(pessoa.cpf)).toBe(true)
    expect(await pessoaItem.getValue()).toEqual(pessoa)
  })

  it('obterOuGerarPessoa devolve a guardada sem gerar outra', async () => {
    await pessoaItem.setValue(PESSOA_DOURADA)
    expect(await obterOuGerarPessoa()).toEqual(PESSOA_DOURADA)
  })

  it('gerarPessoaNova troca a pessoa guardada', async () => {
    await pessoaItem.setValue(PESSOA_DOURADA)
    const nova = await gerarPessoaNova()
    expect(nova).not.toEqual(PESSOA_DOURADA)
    expect(await pessoaItem.getValue()).toEqual(nova)
  })

  it('gera com a data de hoje em São Paulo', async () => {
    const pessoa = await gerarPessoaNova()
    expect(pessoa.nascimento.idade).toBe(
      idadeEm(pessoa.nascimento.iso, '2026-10-01'),
    )
    expect(pessoa.nascimento.idade).toBeGreaterThanOrEqual(18)
    expect(pessoa.nascimento.idade).toBeLessThanOrEqual(65)
  })

  it('watch avisa quem escuta quando outra parte da extensão grava', async () => {
    const ouvinte = vi.fn()
    const pararDeOuvir = pessoaItem.watch(ouvinte)
    await pessoaItem.setValue(PESSOA_DOURADA)
    expect(ouvinte).toHaveBeenCalledWith(PESSOA_DOURADA, null)
    pararDeOuvir()
  })
})

describe('armazenamento dos favoritos', () => {
  const outra = (n: number) =>
    montarPessoa(sfc32(n, n + 1, n + 2, n + 3), '2026-10-01')
  const P = PESSOA_DOURADA

  beforeEach(() =>
    vi.useFakeTimers({
      toFake: ['Date'],
      now: new Date('2026-10-09T13:00:00Z'),
    }),
  )
  afterEach(() => vi.useRealTimers())

  const lista = () => favoritosItem.getValue()

  it('começa com a lista vazia', async () => {
    expect(await lista()).toEqual([])
  })

  it('guarda a lista inteira em local:botai_favoritos', async () => {
    const favorito = await guardarFavorito(P)
    expect(await fakeBrowser.storage.local.get('botai_favoritos')).toEqual({
      botai_favoritos: [favorito],
    })
  })

  it('guardar cria o favorito com id único, o primeiro nome de apelido e a data de agora', async () => {
    const um = await guardarFavorito(P)
    const dois = await guardarFavorito(outra(10))
    expect(um).toEqual({
      id: expect.any(String),
      apelido: primeiroNome(P),
      pessoa: P,
      guardadoEm: '2026-10-09T13:00:00.000Z',
    })
    expect(dois?.id).not.toBe(um?.id)
    expect(await lista()).toEqual([um, dois])
  })

  it('guardar a mesma pessoa de novo, ou uma quarta, não grava nada', async () => {
    await guardarFavorito(P)
    expect(await guardarFavorito(structuredClone(P))).toBeNull()
    await guardarFavorito(outra(10))
    await guardarFavorito(outra(20))
    expect(await guardarFavorito(outra(30))).toBeNull()
    expect(await lista()).toHaveLength(3)
  })

  it('guardar não mexe na pessoa ativa', async () => {
    await pessoaItem.setValue(P)
    await guardarFavorito(outra(10))
    expect(await pessoaItem.getValue()).toEqual(P)
  })

  it('tirar e desfazer devolvem o favorito na mesma posição, com o apelido', async () => {
    const [a, b, c] = [outra(10), outra(20), outra(30)]
    await guardarFavorito(a)
    const meio = await guardarFavorito(b)
    await guardarFavorito(c)
    if (!meio) throw new Error('não guardou')
    await renomearFavorito(meio.id, 'comprador PJ')

    const removido = await tirarFavorito(meio.id)
    expect(removido?.posicao).toBe(1)
    expect(removido?.favorito.apelido).toBe('comprador PJ')
    expect((await lista()).map((f) => f.pessoa.cpf)).toEqual([a.cpf, c.cpf])

    if (!removido) throw new Error('não tirou')
    expect(await devolverFavorito(removido)).toBe(true)
    expect((await lista()).map((f) => f.apelido)).toEqual([
      primeiroNome(a),
      'comprador PJ',
      primeiroNome(c),
    ])
  })

  it('tirar um id que não existe devolve null; desfazer duas vezes não duplica', async () => {
    const favorito = await guardarFavorito(P)
    expect(await tirarFavorito('nao-existe')).toBeNull()
    const removido = await tirarFavorito(favorito?.id ?? '')
    if (!removido) throw new Error('não tirou')
    expect(await devolverFavorito(removido)).toBe(true)
    expect(await devolverFavorito(removido)).toBe(false)
    expect(await lista()).toHaveLength(1)
  })

  it('renomear normaliza o apelido e não toca nos outros', async () => {
    const um = await guardarFavorito(P)
    const dois = await guardarFavorito(outra(10))
    if (!um || !dois) throw new Error('não guardou')
    expect(await renomearFavorito(um.id, '  admin do staging  ')).toBe(true)
    expect(await renomearFavorito(dois.id, '   ')).toBe(true)
    expect(await renomearFavorito('nao-existe', 'x')).toBe(false)
    expect((await lista()).map((f) => f.apelido)).toEqual([
      'admin do staging',
      primeiroNome(dois.pessoa),
    ])
  })

  it('usar um favorito grava a pessoa dele como a ativa, e a lista fica igual', async () => {
    const a = outra(10)
    await pessoaItem.setValue(P)
    const favorito = await guardarFavorito(a)
    const antes: Favorito[] = await lista()
    expect(await usarFavorito(favorito?.id ?? '')).toEqual(a)
    expect(await pessoaItem.getValue()).toEqual(a)
    expect(await lista()).toEqual(antes)
  })

  it('usar um favorito que já saiu não troca a ativa', async () => {
    await pessoaItem.setValue(P)
    expect(await usarFavorito('nao-existe')).toBeNull()
    expect(await pessoaItem.getValue()).toEqual(P)
  })

  it('"Nova pessoa" troca só a ativa: os favoritos ficam', async () => {
    await pessoaItem.setValue(P)
    await guardarFavorito(P)
    const antes = await lista()
    await gerarPessoaNova()
    expect(await lista()).toEqual(antes)
  })

  it('watch avisa quem escuta quando os favoritos mudam', async () => {
    const ouvinte = vi.fn()
    const pararDeOuvir = favoritosItem.watch(ouvinte)
    const favorito = await guardarFavorito(P)
    await vi.waitFor(() => expect(ouvinte).toHaveBeenCalledWith([favorito], []))
    pararDeOuvir()
  })
})

describe('armazenamento do cartão das próximas pessoas', () => {
  const PAGARME_RECUSADO = { provedor: 'pagarme', cenario: 'recusado' } as const

  it('sem escolha guardada, vale o aprovado da Stripe', async () => {
    expect(await cartaoItem.getValue()).toEqual({
      provedor: 'stripe',
      cenario: 'aprovado',
    })
    expect(await lerEscolhaDoCartao()).toEqual({
      provedor: 'stripe',
      cenario: 'aprovado',
    })
  })

  it('guarda só o provedor e o cenário em local:botai_cartao, e nada em sync', async () => {
    await escolherCartao(PAGARME_RECUSADO)
    expect(await fakeBrowser.storage.local.get('botai_cartao')).toEqual({
      botai_cartao: PAGARME_RECUSADO,
    })
    expect(await fakeBrowser.storage.sync.get(null)).toEqual({})
    expect(await lerEscolhaDoCartao()).toEqual(PAGARME_RECUSADO)
  })

  it('escolha inválida não é gravada: vira o padrão', async () => {
    await escolherCartao({
      provedor: 'pagarme',
      cenario: 'recusado-cvc',
    } as unknown as Parameters<typeof escolherCartao>[0])
    expect(await fakeBrowser.storage.local.get('botai_cartao')).toEqual({
      botai_cartao: { provedor: 'stripe', cenario: 'aprovado' },
    })
  })

  // O catálogo do core pode perder um cenário numa versão nova: o guardado antes volta ao padrão.
  it('um valor guardado que o catálogo não tem mais é lido como o padrão', async () => {
    await fakeBrowser.storage.local.set({
      botai_cartao: { provedor: 'pagarme', cenario: 'sumiu' },
    })
    expect(await lerEscolhaDoCartao()).toEqual({
      provedor: 'stripe',
      cenario: 'aprovado',
    })
    const pessoa = await gerarPessoaNova()
    expect(pessoa.cartao).toMatchObject({
      provedor: 'stripe',
      cenario: 'aprovado',
    })
  })

  it('"Nova pessoa" gera com o cartão escolhido', async () => {
    await escolherCartao(PAGARME_RECUSADO)
    const pessoa = await gerarPessoaNova()
    expect(pessoa.cartao).toMatchObject({
      numero: '4000000000000028',
      numeroFormatado: '4000 0000 0000 0028',
      bandeira: 'visa',
      provedor: 'pagarme',
      cenario: 'recusado',
    })
    expect(await pessoaItem.getValue()).toEqual(pessoa)
  })

  it('a primeira geração (obterOuGerarPessoa sem pessoa) também usa a escolha', async () => {
    await escolherCartao({ provedor: 'stripe', cenario: 'pendente' })
    const pessoa = await obterOuGerarPessoa()
    expect(pessoa.cartao).toMatchObject({
      numero: '4000002760003184',
      provedor: 'stripe',
      cenario: 'pendente',
    })
  })

  it('escolher não mexe na pessoa ativa: ela fica com o cartão com que foi gerada', async () => {
    await pessoaItem.setValue(PESSOA_DOURADA)
    await escolherCartao(PAGARME_RECUSADO)
    expect(await pessoaItem.getValue()).toEqual(PESSOA_DOURADA)
    expect(await obterOuGerarPessoa()).toEqual(PESSOA_DOURADA)
  })

  it('a favorita guarda a pessoa inteira: volta com o cartão com que foi gerada', async () => {
    await pessoaItem.setValue(PESSOA_DOURADA)
    const favorito = await guardarFavorito(PESSOA_DOURADA)
    await escolherCartao(PAGARME_RECUSADO)
    const nova = await gerarPessoaNova()
    expect(nova.cartao.provedor).toBe('pagarme')
    const devolta = await usarFavorito(favorito?.id ?? '')
    expect(devolta?.cartao).toEqual(PESSOA_DOURADA.cartao)
    expect(devolta?.cartao).toMatchObject({
      provedor: 'stripe',
      cenario: 'aprovado',
    })
    expect((await favoritosItem.getValue())[0].pessoa).toEqual(PESSOA_DOURADA)
  })

  it('a pessoa antiga guardada (sem provedor no cartão) continua sendo lida e usada', async () => {
    await pessoaItem.setValue(PESSOA_ANTIGA)
    await escolherCartao(PAGARME_RECUSADO)
    expect(await obterOuGerarPessoa()).toEqual(PESSOA_ANTIGA)
  })

  it('watch avisa quem escuta quando a escolha muda', async () => {
    const ouvinte = vi.fn()
    const pararDeOuvir = cartaoItem.watch(ouvinte)
    await escolherCartao(PAGARME_RECUSADO)
    await vi.waitFor(() =>
      expect(ouvinte).toHaveBeenCalledWith(PAGARME_RECUSADO, {
        provedor: 'stripe',
        cenario: 'aprovado',
      }),
    )
    pararDeOuvir()
  })
})
