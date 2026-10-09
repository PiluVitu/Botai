import { expect, test, type Page } from '@playwright/test'
import type { AxeResults, RunOptions } from 'axe-core'
import { LOJA_UI } from '../components/lojas-ui'
import { CAPTURAS } from '../lib/capturas'
import { ANCORAS_DA_LANDING } from '../lib/conteudo'
import { COMANDO_DO_EXEMPLO } from '../lib/exemplo'
import { ESTADO_SEM_URL, NOME_DO_NAVEGADOR } from '../lib/extensao'
import { lerUrlsDasLojas } from '../lib/lojas'
import { botoesDasLojas } from '../lib/modelo'
import { PORTAS } from '../lib/portas'

// O esperado sai do mesmo lojas.json que a página lê no build.
const botoes = botoesDasLojas(lerUrlsDasLojas())

// Os elementos do topo, do main e do rodapé que passam da coluna (a do main). O vazamento para o
// gutter não aumenta o scrollWidth, então cada caixa é conferida. A tabela de atalhos rola dentro
// da moldura dela (região focável), e o que está lá dentro fica de fora da conta.
async function vazadosDaColuna(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const coluna = (
      document.querySelector('main') as HTMLElement
    ).getBoundingClientRect()
    return [...document.querySelectorAll('header *, main *, footer *')]
      .filter((elemento) => !elemento.closest('[role="region"][tabindex]'))
      .filter((elemento) => {
        const caixa = elemento.getBoundingClientRect()
        return (
          caixa.width > 1 &&
          (caixa.right > coluna.right + 0.5 || caixa.left < coluna.left - 0.5)
        )
      })
      .map(
        (elemento) =>
          `${elemento.tagName} ${(elemento.textContent ?? '').slice(0, 40)}`,
      )
  })
}

async function violacoesDoAxe(page: Page): Promise<string[]> {
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
  return page.evaluate(async () => {
    const { axe } = window as unknown as {
      axe: { run: (alvo: Document, opcoes: RunOptions) => Promise<AxeResults> }
    }
    const { violations } = await axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    })
    return violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
      )
  })
}

test.describe('/', () => {
  test('as seções do design, na ordem, sem erro de hidratação', async ({
    page,
  }) => {
    const erros: string[] = []
    page.on('console', (mensagem) => {
      if (
        mensagem.type() === 'error' &&
        /hydrat|#418|#423|#425/i.test(mensagem.text())
      )
        erros.push(mensagem.text())
    })
    const resposta = await page.goto('/')
    expect(resposta?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Botaí: Dados de teste brasileiros em todo lugar que o seu teste roda.',
    )
    await expect(page.getByRole('heading', { level: 2 })).toHaveText([
      'Um motor, oito portas.',
      'Mesma semente, mesma pessoa.',
      'Uma pessoa onde tudo bate.',
      'Cada um entra pela sua porta.',
      'O que foi testado, e o que ainda não.',
      'Bota aí no navegador.',
      'Fictício, mas com cuidado.',
      'Botaí no seu teste.',
    ])
    await page.waitForLoadState('networkidle')
    expect(erros).toEqual([])
  })

  test('lojas seguem o lojas.json: link na publicada, o estado em texto na que falta', async ({
    page,
  }) => {
    await page.goto('/')
    const lista = page
      .locator('#extensao')
      .getByRole('list', { name: 'Instalar pela loja' })
    for (const { loja, url } of botoes) {
      const rotulo = LOJA_UI[loja].rotulo
      if (url) {
        const links = page.getByRole('link', { name: rotulo, exact: true })
        await expect(links).toHaveCount(1)
        await expect(lista.getByRole('link', { name: rotulo })).toHaveAttribute(
          'href',
          url,
        )
        await expect(links).toHaveAttribute('target', '_blank')
      } else {
        await expect(
          lista.getByRole('listitem').filter({
            hasText: `${NOME_DO_NAVEGADOR[loja]} ${ESTADO_SEM_URL[loja]}`,
          }),
        ).toHaveCount(1)
        await expect(page.getByRole('link', { name: rotulo })).toHaveCount(0)
      }
    }
    await expect(lista.getByRole('button')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /em breve/i })).toHaveCount(0)
    if (!botoes.some(({ loja }) => loja === 'edge'))
      await expect(page.getByText('Microsoft Edge Add-ons')).toHaveCount(0)
    await expect(page.locator('a[href="#"]')).toHaveCount(0)
  })

  test('as âncoras do cabeçalho levam às seções', async ({ page }) => {
    await page.goto('/')
    const secoes = page.getByRole('navigation', { name: 'Seções' })
    for (const { id, rotulo } of ANCORAS_DA_LANDING) {
      await secoes.getByRole('link', { name: rotulo, exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`#${id}$`))
      await expect(page.locator(`#${id} h2`)).toBeInViewport()
    }
    // A âncora da Extensão traz a captura (lazy) para a tela. O `next start` prende a chave do
    // /_next/image cujo pedido foi abortado (⚠️ do site/CLAUDE.md): espera a captura antes de fechar.
    await expect
      .poll(() =>
        page
          .locator('#extensao img:visible')
          .evaluate((img) => (img as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0)
  })

  // O html leva `motion-safe:scroll-smooth` e o data-scroll-behavior que faz o Next desligar a
  // rolagem suave na troca de rota (só as âncoras rolam devagar).
  test('rolagem suave só sem "reduzir movimento"', async ({ page }) => {
    await page.goto('/')
    const rolagem = () =>
      page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      )
    await expect(page.locator('html')).toHaveAttribute(
      'data-scroll-behavior',
      'smooth',
    )
    expect(await rolagem()).toBe('smooth')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    expect(await rolagem()).toBe('auto')
  })

  test('copiar: o comando do hero e o de uma porta vão para a área de transferência', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')
    const area = () => page.evaluate(() => navigator.clipboard.readText())

    const hero = page.getByRole('button', {
      name: `Copiar comando: ${COMANDO_DO_EXEMPLO}`,
    })
    await hero.click()
    expect(await area()).toBe(COMANDO_DO_EXEMPLO)
    await expect(hero.locator('svg[data-icon="check"]')).toBeVisible()
    await expect(hero.locator('xpath=..').getByRole('status')).toHaveText(
      'Copiado',
    )

    const cli = PORTAS.find((porta) => porta.id === 'cli')!
    await page
      .getByRole('button', { name: `Copiar comando da porta ${cli.nome}` })
      .click()
    expect(await area()).toBe(cli.comando.linhas.join('\n'))
  })

  test('o suporte do rodapé leva [Botaí] no assunto', async ({ page }) => {
    await page.goto('/')
    const suporte = page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Suporte' })
    expect(
      new URL((await suporte.getAttribute('href')) as string).searchParams.get(
        'subject',
      ),
    ).toBe('[Botaí] Suporte')
  })

  // Só o href: clicar sairia para outro host (e o docs.botai é outro projeto da Vercel).
  test('o Docs do cabeçalho e o do rodapé levam à documentação, na mesma aba', async ({
    page,
  }) => {
    await page.goto('/')
    for (const regiao of [
      page.getByRole('banner'),
      page.getByRole('contentinfo'),
    ]) {
      const docs = regiao.getByRole('link', { name: 'Docs', exact: true })
      await expect(docs).toBeVisible()
      await expect(docs).toHaveAttribute(
        'href',
        'https://docs.botai.pilutech.com.br',
      )
      await expect(docs).not.toHaveAttribute('target')
    }
  })

  // Numa coluna de 190 px, selo de mais de 16 caracteres («Sem teste · via HTTP») quebrava em duas linhas dentro da pílula.
  test('a 1440 px, seis integrações por linha, como no design, e cada selo cabe numa linha', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    const secao = page.getByRole('region', {
      name: 'O que foi testado, e o que ainda não.',
    })
    const topos = await secao
      .locator('li')
      .evaluateAll((itens) =>
        itens.map((li) => Math.round(li.getBoundingClientRect().top)),
      )
    expect(topos.filter((topo) => topo === topos[0])).toHaveLength(6)
    const selos = secao.locator('li > span')
    await expect(selos).toHaveCount(13)
    const alturas = await selos.evaluateAll((spans) =>
      spans.map((s) => ({
        texto: s.textContent,
        linhas: Math.round(
          s.getBoundingClientRect().height /
            parseFloat(getComputedStyle(s).lineHeight),
        ),
      })),
    )
    expect(alturas.filter((s) => s.linhas > 1)).toEqual([])
  })

  // Sem piscar: a classe tem de vir do script inline do next-themes, antes de qualquer JS do React.
  // Com os bundles bloqueados nada hidrata, e a leitura é uma só (toHaveClass repetiria por 5 s e
  // aceitaria uma classe posta depois da primeira pintura). O CSS também mora em /_next/static/chunks/
  // no build do Next 16: só o .js é bloqueado.
  test('tema: o escuro do sistema já vem do HTML, antes do JS do React', async ({
    page,
  }) => {
    await page.route(/\/_next\/static\/chunks\/.+\.js(\?.*)?$/, (rota) =>
      rota.abort(),
    )
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    expect(await page.locator('html').getAttribute('class')).toMatch(/\bdark\b/)
    const extensao = page.locator('#extensao')
    await expect(
      extensao.locator(`img[alt="${CAPTURAS[0].variantes.escuro.alt}"]`),
    ).toBeVisible()
    await expect(
      extensao.locator(`img[alt="${CAPTURAS[0].variantes.claro.alt}"]`),
    ).toBeHidden()
  })

  test('tema: alterna, lembra a escolha e troca o ícone', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    const botao = page.getByRole('button', { name: 'Alternar tema' })
    await expect(botao.locator('svg[data-icon="sun"]')).toBeVisible()
    await expect(botao.locator('svg[data-icon="moon"]')).toBeHidden()
    await botao.click()
    await expect(page.locator('html')).toHaveClass(/\blight\b/)
    await expect(botao.locator('svg[data-icon="moon"]')).toBeVisible()
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/\blight\b/)
  })

  // Review Focus 2: a escolha manda, não o prefers-color-scheme, e a variante escondida não sai pela rede.
  test('a captura segue o tema ativo e só a variante dele é baixada', async ({
    page,
  }) => {
    const pedidas: string[] = []
    page.on('request', (pedido) => {
      const url = decodeURIComponent(pedido.url())
      if (url.includes('/capturas/')) pedidas.push(url)
    })
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    // A captura é lazy e fica na seção Extensão: só sai pela rede perto da tela.
    const escuro = page.getByRole('img', {
      name: CAPTURAS[0].variantes.escuro.alt,
    })
    await escuro.scrollIntoViewIfNeeded()
    await expect
      .poll(() =>
        escuro.evaluate((img) => (img as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0)
    expect(
      pedidas.some((u) => u.includes('01-pagina-preenchida-escuro.png')),
    ).toBe(true)
    expect(pedidas.filter((u) => u.includes('-claro.png'))).toEqual([])
    await page.getByRole('button', { name: 'Alternar tema' }).click()
    const claro = page.getByRole('img', {
      name: CAPTURAS[0].variantes.claro.alt,
    })
    await claro.scrollIntoViewIfNeeded()
    await expect(claro).toBeVisible()
    await expect
      .poll(() =>
        pedidas.some((u) => u.includes('02-pagina-preenchida-claro.png')),
      )
      .toBe(true)
  })

  test.describe('atalho de quem visita, no formulário do hero', () => {
    const CASOS = [
      [
        'MacIntel',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
        '⌥⇧P',
        'macOS',
      ],
      [
        'Linux x86_64',
        'Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0',
        'Alt+Shift+P',
        'Firefox no Linux',
      ],
      [
        'Win32',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
        'Ctrl+Shift+Y',
        'Windows',
      ],
    ] as const

    for (const [plataforma, userAgent, tecla, sistema] of CASOS) {
      test(`${sistema}: ${tecla}`, async ({ page }) => {
        await page.addInitScript(
          ({ plataforma, userAgent }) => {
            Object.defineProperty(Navigator.prototype, 'platform', {
              get: () => plataforma,
            })
            Object.defineProperty(Navigator.prototype, 'userAgent', {
              get: () => userAgent,
            })
            Object.defineProperty(Navigator.prototype, 'userAgentData', {
              get: () => undefined,
            })
          },
          { plataforma, userAgent },
        )
        await page.goto('/')
        await expect(
          page.locator('section[aria-labelledby="hero-titulo"] kbd'),
        ).toHaveText(tecla)
      })
    }

    test('sem JavaScript, o HTML do servidor já traz um atalho válido', async ({
      browser,
    }) => {
      const contexto = await browser.newContext({ javaScriptEnabled: false })
      const page = await contexto.newPage()
      // Sem JS o Chromium baixa já as imagens lazy, e o `next start` (Next 16.3.8) prende para sempre a
      // chave do /_next/image cujo 1º pedido foi abortado (um teste anterior que fecha a página no meio).
      // O que se mede aqui é o HTML: esperar o `load` deixaria o teste refém daquela imagem.
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await expect(
        page.locator('section[aria-labelledby="hero-titulo"] kbd'),
      ).toHaveText('Ctrl+Shift+Y')
      await contexto.close()
    })
  })

  test.describe('menu de seções, abaixo de 900 px', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('abre, leva à seção e fecha; Escape e clique fora também fecham', async ({
      page,
    }) => {
      await page.goto('/')
      const banner = page.getByRole('banner')
      await expect(
        banner.getByRole('navigation', { name: 'Seções' }),
      ).toBeHidden()
      const botao = banner.getByRole('button', { name: 'Abrir menu' })
      await expect(botao).toHaveAttribute('aria-expanded', 'false')

      await botao.click()
      await expect(botao).toHaveAttribute('aria-expanded', 'true')
      const painel = page.locator(
        `#${await botao.getAttribute('aria-controls')}`,
      )
      await expect(painel).toBeVisible()
      await expect(painel.getByRole('link')).toHaveText(
        ANCORAS_DA_LANDING.map(({ rotulo }) => rotulo),
      )
      await painel.getByRole('link', { name: 'Para quem' }).click()
      await expect(page).toHaveURL(/#para-quem$/)
      await expect(page.locator('#para-quem h2')).toBeInViewport()
      await expect(botao).toHaveAttribute('aria-expanded', 'false')
      await expect(painel).toBeHidden()

      await botao.click()
      await page.keyboard.press('Escape')
      await expect(botao).toHaveAttribute('aria-expanded', 'false')
      await expect(botao).toBeFocused()

      // O painel cobre o hero logo abaixo do cabeçalho: o clique fora vai no gutter, no pé da tela.
      await botao.click()
      await expect(painel).toBeVisible()
      await page.mouse.click(4, 830)
      await expect(botao).toHaveAttribute('aria-expanded', 'false')
    })

    test('aberto, passa no axe e cabe na coluna a 320 px', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 })
      await page.goto('/')
      await page.getByRole('button', { name: 'Abrir menu' }).click()
      await expect(
        page.getByRole('banner').getByRole('navigation', { name: 'Seções' }),
      ).toBeVisible()
      expect(await vazadosDaColuna(page)).toEqual([])
      expect(await violacoesDoAxe(page)).toEqual([])
    })
  })

  // Review Focus 3.
  test.describe('a 320 px', () => {
    test.use({ viewport: { width: 320, height: 800 } })

    test('sem rolagem horizontal', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const largura = await page.evaluate(() => ({
        rolavel: document.documentElement.scrollWidth,
        visivel: document.documentElement.clientWidth,
      }))
      expect(largura.rolavel).toBeLessThanOrEqual(largura.visivel)
    })

    // Um item que vaza para dentro do gutter não aumenta o scrollWidth: confere cada um contra a lista.
    test('nenhuma loja passa da borda da lista', async ({ page }) => {
      await page.goto('/')
      const listas = page.getByRole('list', { name: 'Instalar pela loja' })
      await expect(listas).toHaveCount(1)
      const vazados = await listas.evaluateAll((elementos) =>
        elementos.flatMap((lista) => {
          const borda = lista.getBoundingClientRect().right
          return [...lista.querySelectorAll(':scope > li > *')]
            .filter(
              (botao) => botao.getBoundingClientRect().right > borda + 0.5,
            )
            .map((botao) => botao.textContent ?? '')
        }),
      )
      expect(vazados).toEqual([])
    })

    // Cabeçalho (marca, Docs só com ícone, GitHub, tema e menu), hero (comando e as duas janelas),
    // portas, extensão e rodapé: os comandos quebram por palavra em vez de vazar.
    test('nada do cabeçalho, das seções e do rodapé passa da coluna', async ({
      page,
    }) => {
      await page.goto('/')
      for (const alvo of [
        page.getByRole('banner'),
        page.locator('section[aria-labelledby="hero-titulo"] pre'),
        page.locator('#portas h2'),
        page.locator('#extensao h2'),
        page.getByRole('contentinfo').getByRole('link', { name: 'Docs' }),
      ])
        await expect(alvo.first()).toBeAttached()
      await expect(
        page.getByRole('banner').getByRole('link', { name: 'Docs' }),
      ).toBeVisible()
      expect(await vazadosDaColuna(page)).toEqual([])
    })
  })
})
