import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as core from '@pilutech/botai-core'
import { ATALHOS } from '@pilutech/botai-core/atalhos'
import {
  NOME_DO_GLOBAL,
  SEGUNDA_PASSADA_MS,
  type ApiDoNavegador,
} from '@pilutech/botai-core/navegador'
import {
  HOST_PADRAO,
  PORTA_PADRAO,
  responder,
} from '@pilutech/botai-core/servidor'
import { executar } from '../../packages/core/src/cli/executar'
import {
  garantirCssEscape,
  simularLayout,
} from '../../packages/core/src/navegador/layout-teste'
import {
  IMAGEM_DO_SERVIDOR,
  PACOTE_DO_CORE,
  PACOTE_DO_PLAYWRIGHT,
  REPOSITORIO,
} from './conteudo'
import {
  HOJE_DO_EXEMPLO,
  PESSOA_DO_EXEMPLO,
  SEMENTE_DO_EXEMPLO,
} from './exemplo'
import { ESTADO_SEM_URL } from './extensao'
import { lerUrlsDasLojas } from './lojas'
import { botoesDasLojas } from './modelo'
import { NOTA_DAS_PORTAS, PORTAS, type IdDaPorta } from './portas'

const RAIZ = join(__dirname, '..', '..')
const ler = (...caminho: string[]) =>
  readFileSync(join(RAIZ, ...caminho), 'utf8')

function porta(id: IdDaPorta) {
  const achada = PORTAS.find((p) => p.id === id)
  if (!achada) throw new Error(`porta inexistente: ${id}`)
  return achada
}

describe('as oito portas', () => {
  it('na ordem do design, numeradas de 01 a 08', () => {
    expect(PORTAS.map((p) => [p.numero, p.nome])).toEqual([
      ['01', 'Extensão'],
      ['02', 'CLI'],
      ['03', 'HTTP'],
      ['04', 'Docker'],
      ['05', 'Binários'],
      ['06', 'Biblioteca'],
      ['07', 'Playwright'],
      ['08', 'Motor'],
    ])
  })

  // A extensão sorteia com crypto, e o motor recebe a pessoa pronta: os dois ficam fora do diagrama.
  it('só as portas que aceitam semente entram no "mesma semente, mesma pessoa"', () => {
    expect(PORTAS.filter((p) => p.semente).map((p) => p.id)).toEqual([
      'cli',
      'http',
      'docker',
      'binarios',
      'biblioteca',
      'playwright',
    ])
  })

  it('a extensão mostra os atalhos de ATALHOS, com o Firefox no Linux, e não se copia', () => {
    const { comando } = porta('extensao')
    expect(ATALHOS.chrome.windows).toBe(ATALHOS.chrome.linux)
    expect(ATALHOS.firefox.mac).toBe(ATALHOS.chrome.mac)
    expect(comando).toEqual({
      linhas: [
        `${ATALHOS.chrome.mac} no Mac · ${ATALHOS.chrome.windows} no Windows e no Linux · ${ATALHOS.firefox.linux} no Firefox para Linux`,
      ],
      copiavel: false,
    })
    expect(comando.linhas[0]).toBe(
      '⌥⇧P no Mac · Ctrl+Shift+Y no Windows e no Linux · Alt+Shift+P no Firefox para Linux',
    )
  })

  it('os pisos de versão da extensão são os do wxt.config.ts', () => {
    const wxt = ler('extensao', 'wxt.config.ts')
    const chromium = /minimum_chrome_version: '(\d+)'/.exec(wxt)?.[1]
    const firefox = /strict_min_version: '(\d+)\.0'/.exec(wxt)?.[1]
    expect(porta('extensao').onde).toBe(
      `Chrome ${chromium}+ e Edge pela Chrome Web Store, Firefox ${firefox}+ pela Firefox Add-ons. Opera ${ESTADO_SEM_URL.opera}.`,
    )
  })

  // Publicou o Opera no lojas.json? A porta 01 deixa de dizer "em revisão" no mesmo PR.
  it('o estado do Opera é o de ESTADO_SEM_URL, e só enquanto o lojas.json não tem a URL', () => {
    const opera =
      botoesDasLojas(lerUrlsDasLojas()).find((b) => b.loja === 'opera')?.url ??
      null
    expect(
      porta('extensao').onde.includes(`Opera ${ESTADO_SEM_URL.opera}`),
    ).toBe(opera === null)
  })

  // O install.sh recusa Windows e musl.
  it('os binários mandam o Windows baixar o .exe', () => {
    expect(porta('binarios').onde).toBe(
      'macOS, Linux e Windows, x64 e arm64. No Windows, baixe o .exe do release.',
    )
  })

  // Texto honesto: o motor foi provado no Playwright cru e no CDP puro; o resto não tem teste.
  it('"testado" só aparece no motor', () => {
    const comTestado = PORTAS.filter((p) =>
      /testad/i.test(`${p.linha} ${p.onde}`),
    ).map((p) => p.id)
    expect(comTestado).toEqual(['motor'])
    expect(porta('motor').onde).toBe(
      'Qualquer ferramenta que execute JS na página. Testado com Playwright e CDP.',
    )
  })

  it('todas as outras portas se copiam', () => {
    expect(PORTAS.filter((p) => !p.comando.copiavel).map((p) => p.id)).toEqual([
      'extensao',
    ])
  })

  it('a nota de formatos não diz que o MySQL foi importado', () => {
    expect(NOTA_DAS_PORTAS).toBe(
      'Saída em JSON, NDJSON, CSV e SQL para Postgres, MySQL e SQLite. Importação provada no Postgres 16 e no SQLite.',
    )
  })
})

// Cada porta mostra um comando de verdade: o teste confere contra o código que ele chama.
describe('comando inventado não passa', () => {
  it('a CLI fixa a versão do core e o hoje', () => {
    expect(porta('cli').comando.linhas).toEqual([
      `npx -y ${PACOTE_DO_CORE}@${core.MOTOR} pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql | psql "$DATABASE_URL"`,
    ])
  })

  // O argv que o terminal passaria: sem o `npx -y`, sem o pacote e sem o `| psql`.
  // Sem o -y, o npx de cache frio pergunta pelo stdout, que vai para o psql: a pergunta some e vira SQL.
  it('o comando da CLI roda e sai com o SQL de 1000 pessoas', () => {
    const [linha] = porta('cli').comando.linhas
    const [npx, sim, pacote, ...resto] = linha.split(' ')
    expect([npx, sim, pacote]).toEqual([
      'npx',
      '-y',
      `${PACOTE_DO_CORE}@${core.MOTOR}`,
    ])
    const argv = resto.slice(0, resto.indexOf('|'))
    let dados = ''
    const codigo = executar(argv, {
      dados: (texto) => {
        dados += texto
      },
      mensagem: () => {},
    })
    expect(codigo).toBe(0)
    expect(dados).toMatch(/^-- botai: formato 2, /)
    expect(dados.match(/^INSERT /gm)).toHaveLength(1000)
  })

  // Subiu a versão do core? A imagem da landing sobe no mesmo PR.
  it('a imagem do servidor é a da versão do core, na porta em que a imagem escuta', () => {
    const { version } = JSON.parse(ler('packages', 'core', 'package.json')) as {
      version: string
    }
    expect(IMAGEM_DO_SERVIDOR).toBe(`ghcr.io/piluvitu/botai:${version}`)
    expect(porta('docker').comando.linhas).toEqual([
      `docker run --rm -p 8790:8790 ${IMAGEM_DO_SERVIDOR}`,
    ])
    expect(ler('packages', 'core', 'Dockerfile')).toContain(
      'CMD ["serve", "--host", "0.0.0.0", "--porta", "8790"]',
    )
  })

  it('a biblioteca importa da raiz do core uma função que existe', () => {
    const [importacao, chamada] = porta('biblioteca').comando.linhas
    const lido = /^import \{ (\w+) \} from '(.+)'$/.exec(importacao)
    expect(lido?.[2]).toBe(PACOTE_DO_CORE)
    const funcao = lido?.[1] as keyof typeof core
    expect(typeof core[funcao]).toBe('function')
    expect(chamada).toBe(`${funcao}({ semente: 42, hoje: '2026-10-05' })`)
  })

  it('o plugin exporta o test com a fixture botai, que tem o preencher', () => {
    expect(porta('playwright').comando.linhas).toEqual([
      'await botai.preencher(page)',
    ])
    expect(PACOTE_DO_PLAYWRIGHT).toBe('@pilutech/botai-playwright')
    expect(ler('packages', 'playwright', 'src', 'index.ts')).toMatch(
      /export \{[^}]*\btest,[^}]*\} from '\.\/fixture\.js'/,
    )
    const fixture = ler('packages', 'playwright', 'src', 'fixture.ts')
    expect(fixture).toMatch(/^\s+botai: async \(/m)
    expect(fixture).toMatch(/^\s+preencher\(\n\s+alvo: Page \| Locator,/m)
  })

  // O mesmo `responder` que o `botai serve`, a imagem e o binário usam, sem abrir porta.
  it('o curl da porta HTTP pede ao servidor a pessoa do exemplo', () => {
    const [linha] = porta('http').comando.linhas
    const endereco = /^curl '(http:\/\/[^']+)'$/.exec(linha)?.[1]
    const { hostname, port, pathname, search } = new URL(endereco as string)
    expect([hostname, Number(port)]).toEqual([HOST_PADRAO, PORTA_PADRAO])
    const resposta = responder('GET', `${pathname}${search}`)
    expect(resposta.status).toBe(200)
    const envelope = JSON.parse(resposta.corpo) as Record<string, unknown>
    expect(envelope).toMatchObject({
      semente: String(SEMENTE_DO_EXEMPLO),
      hoje: HOJE_DO_EXEMPLO,
    })
    expect(envelope.pessoa).toEqual(PESSOA_DO_EXEMPLO)
  })

  // O release do core é o "Latest" do repo e leva o install.sh como asset: o `latest/download` chega nele.
  it('o install.sh dos binários é o asset que o release do core publica', () => {
    expect(porta('binarios').comando.linhas).toEqual([
      `curl -fsSL ${REPOSITORIO}/releases/latest/download/install.sh | sh`,
    ])
    const workflow = ler('.github', 'workflows', 'core-distribuicao.yml')
    expect(workflow).toMatch(
      /^\s+arquivos=\([^)\n]* packages\/core\/scripts\/install\.sh\)$/m,
    )
    expect(workflow).toMatch(/^\s+--latest$/m)
    expect(workflow).toContain('gh release edit "$GITHUB_REF_NAME" --latest')
    expect(ler('packages', 'core', 'scripts', 'install.sh')).toContain(
      `RELEASES=\${BOTAI_RELEASES:-${REPOSITORIO}/releases}`,
    )
  })

  describe('o motor', () => {
    let desfazerLayout: () => void

    beforeEach(() => {
      garantirCssEscape()
      desfazerLayout = simularLayout()
    })

    afterEach(() => {
      jest.useRealTimers()
      desfazerLayout()
      document.body.innerHTML = ''
      Reflect.deleteProperty(window, NOME_DO_GLOBAL)
    })

    // O `navegador.iife.js` é o build do iife.ts: tudo o que ele faz é pendurar a API no global.
    it('a linha chama o preencher que o IIFE pendura na página, e ele preenche', async () => {
      const [linha] = porta('motor').comando.linhas
      const lido =
        /^window\.(\w+)\.preencher\(document, pessoa, hoje, \{ segundaPassada: (true|false) \}\)$/.exec(
          linha,
        )
      expect(lido?.[1]).toBe(NOME_DO_GLOBAL)
      expect(
        ler('packages', 'core', 'scripts', 'construir-iife.mjs'),
      ).toContain('src/navegador/iife.ts')
      await import('../../packages/core/src/navegador/iife')
      const api = (window as unknown as Record<string, ApiDoNavegador>)[
        NOME_DO_GLOBAL
      ]
      document.body.innerHTML =
        '<form><label>Nome completo <input name="nome"></label><label>CPF <input name="cpf"></label></form>'
      jest.useFakeTimers()
      const promessa = api.preencher(
        document,
        PESSOA_DO_EXEMPLO,
        HOJE_DO_EXEMPLO,
        {
          segundaPassada: lido?.[2] === 'true',
        },
      )
      await jest.advanceTimersByTimeAsync(SEGUNDA_PASSADA_MS)
      const resultado = await promessa
      expect(resultado.preenchidos.map((l) => l.rotulo)).toEqual([
        'Nome completo',
        'CPF',
      ])
      const valor = (nome: string) =>
        (document.querySelector(`[name="${nome}"]`) as HTMLInputElement).value
      expect(valor('nome')).toBe(PESSOA_DO_EXEMPLO.nome.completo)
      expect(valor('cpf')).toBe(PESSOA_DO_EXEMPLO.cpf)
    })
  })
})
