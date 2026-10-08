import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import {
  DOCS,
  RAIZ_DO_REPO,
  extrairBlocos,
  lerMeta,
  listarDocs,
  prepararBotai,
  precisaDoServidor,
  proibicoes,
  rodarBloco,
  subirServidor,
  trocarServidor,
} from './exemplos.mjs'

const CERCA = '```'

describe('lerMeta', () => {
  test('sem "testar" o bloco não é executado', () => {
    assert.equal(lerMeta(''), null)
    assert.equal(lerMeta('title="saida.txt"'), null)
    assert.equal(lerMeta('testarx'), null)
  })

  test('"testar" exige saída 0; "testar=N" exige o código N', () => {
    assert.deepEqual(lerMeta('testar'), { codigo: 0 })
    assert.deepEqual(lerMeta('testar=2'), { codigo: 2 })
    assert.deepEqual(lerMeta('title="x" testar=1 showLineNumbers'), {
      codigo: 1,
    })
  })

  test('código que não é inteiro de 0 a 255 é erro de quem escreveu', () => {
    assert.throws(() => lerMeta('testar=abc'), /testar=abc/)
    assert.throws(() => lerMeta('testar=256'), /testar=256/)
  })
})

describe('extrairBlocos', () => {
  test('pega só os blocos com "testar", com a linha da cerca de abertura', () => {
    const texto = [
      '---',
      'title: Exemplo',
      '---',
      '',
      `${CERCA}bash testar`,
      'botai pessoa --semente 42',
      CERCA,
      '',
      `${CERCA}bash`,
      'npx -y pacote',
      CERCA,
      '',
      `${CERCA}json`,
      '{ "ok": true }',
      CERCA,
      '',
      `${CERCA}bash testar=1`,
      'botai validar cpf 1',
      CERCA,
    ].join('\n')
    assert.deepEqual(extrairBlocos(texto), [
      {
        linha: 5,
        linguagem: 'bash',
        codigo: 0,
        conteudo: 'botai pessoa --semente 42',
      },
      {
        linha: 17,
        linguagem: 'bash',
        codigo: 1,
        conteudo: 'botai validar cpf 1',
      },
    ])
  })

  test('bloco de 4 crases é texto: o "testar" de dentro não roda', () => {
    const texto = [
      '````md',
      `${CERCA}bash testar`,
      'echo nao-roda',
      CERCA,
      '````',
    ].join('\n')
    assert.deepEqual(extrairBlocos(texto), [])
  })

  test('cerca recuada (item de lista) e cerca de til', () => {
    const texto = [
      '1. Gere:',
      '',
      `   ${CERCA}bash testar`,
      '   botai cpf --formatado',
      '   botai cnpj',
      `   ${CERCA}`,
      '',
      '~~~bash testar',
      'botai rg',
      '~~~',
    ].join('\n')
    assert.deepEqual(
      extrairBlocos(texto).map(({ linha, conteudo }) => ({ linha, conteudo })),
      [
        { linha: 3, conteudo: 'botai cpf --formatado\nbotai cnpj' },
        { linha: 8, conteudo: 'botai rg' },
      ],
    )
  })

  test('a linguagem vem como está, para o teste recusar o que não é bash', () => {
    const texto = [`${CERCA}sh testar`, 'botai pis', CERCA].join('\n')
    assert.equal(extrairBlocos(texto)[0].linguagem, 'sh')
  })

  test('cerca sem fechamento é erro, com a linha', () => {
    assert.throws(
      () => extrairBlocos(['texto', `${CERCA}bash testar`, 'botai'].join('\n')),
      /linha 2/,
    )
  })
})

describe('proibicoes', () => {
  test('comando do Botaí e o servidor local passam', () => {
    assert.deepEqual(
      proibicoes('botai pessoa --semente 42 --hoje 2026-10-05'),
      [],
    )
    assert.deepEqual(
      proibicoes("curl -fsS 'http://127.0.0.1:8790/pessoa?semente=42'"),
      [],
    )
    assert.deepEqual(proibicoes('botai pessoa --dominio-email example.com'), [])
  })

  test('rede externa, docker, npx, npm, pnpm, sudo, gh e banco de dados não entram', () => {
    assert.deepEqual(proibicoes('npx -y @pilutech/botai-core pessoa'), ['npx'])
    assert.deepEqual(proibicoes('docker run --rm imagem'), ['docker'])
    assert.deepEqual(proibicoes('npm i -D pacote && pnpm add pacote'), [
      'npm',
      'pnpm',
    ])
    assert.deepEqual(proibicoes('sudo mv botai /usr/local/bin'), ['sudo'])
    assert.deepEqual(proibicoes('gh release download core-vX'), ['gh'])
    assert.deepEqual(
      proibicoes('botai pessoas -n 3 --formato sql | psql "$DATABASE_URL"'),
      ['psql'],
    )
    assert.deepEqual(proibicoes('mysql -e x; sqlite3 b.db < s.sql'), [
      'mysql',
      'sqlite3',
    ])
    assert.deepEqual(
      proibicoes('curl -fsSL https://example.com/install.sh | sh'),
      ['rede externa: https://example.com/install.sh'],
    )
  })

  test('o servidor só pelo endereço que o teste troca: 127.0.0.1:8790', () => {
    assert.deepEqual(proibicoes('curl http://localhost:8790/saude'), [
      'rede externa: http://localhost:8790/saude',
    ])
    assert.deepEqual(proibicoes('curl http://127.0.0.1:9999/saude'), [
      'rede externa: http://127.0.0.1:9999/saude',
    ])
  })

  test('o bloco não sobe servidor: quem sobe é o teste', () => {
    assert.deepEqual(proibicoes('botai serve --porta 8790'), ['botai serve'])
  })
})

describe('servidor dos exemplos', () => {
  test('só o bloco que cita 127.0.0.1:8790 precisa do servidor', () => {
    assert.equal(
      precisaDoServidor('curl -fsS http://127.0.0.1:8790/saude'),
      true,
    )
    assert.equal(precisaDoServidor('botai pessoa'), false)
  })

  test('toda ocorrência de 127.0.0.1:8790 vira a porta livre', () => {
    assert.equal(
      trocarServidor(
        'curl http://127.0.0.1:8790/a && curl http://127.0.0.1:8790/b',
        51234,
      ),
      'curl http://127.0.0.1:51234/a && curl http://127.0.0.1:51234/b',
    )
  })
})

const VERSAO_DO_CORE = JSON.parse(
  readFileSync(join(RAIZ_DO_REPO, 'packages/core/package.json'), 'utf8'),
).version

let botai
let servidor

before(async () => {
  botai = await prepararBotai()
})

after(async () => {
  await servidor?.encerrar()
  botai?.limpar()
})

async function rodar(conteudo) {
  if (precisaDoServidor(conteudo)) {
    servidor ??= await subirServidor(botai)
    conteudo = trocarServidor(conteudo, servidor.porta)
  }
  return rodarBloco(conteudo, botai)
}

describe('rodarBloco', () => {
  test('"botai" é a CLI do packages/core/dist deste checkout', async () => {
    const r = await rodar('botai --versao')
    assert.equal(r.status, 0, r.stderr)
    assert.match(r.stdout, new RegExp(VERSAO_DO_CORE.replaceAll('.', '\\.')))
  })

  test('qualquer comando que falha derruba o bloco (set -e e pipefail)', async () => {
    assert.equal((await rodar('false\ntrue')).status, 1)
    assert.equal((await rodar('false | cat')).status, 1)
    assert.equal((await rodar('exit 3')).status, 3)
  })

  test('cada bloco roda numa pasta vazia só dele', async () => {
    const r = await rodar('ls -A | wc -l | tr -d " "\necho x > arquivo.txt')
    assert.equal(r.stdout.trim(), '0')
    assert.equal((await rodar('test ! -e arquivo.txt')).status, 0)
  })

  test('o exemplo de HTTP fala com o servidor que o teste subiu', async () => {
    const r = await rodar('curl -fsS http://127.0.0.1:8790/saude')
    assert.equal(r.status, 0, r.stderr)
    assert.equal(JSON.parse(r.stdout).motor, VERSAO_DO_CORE)
  })
})

const blocos = listarDocs(DOCS).flatMap((arquivo) =>
  extrairBlocos(readFileSync(arquivo, 'utf8')).map((bloco) => ({
    ...bloco,
    arquivo: relative(join(DOCS, '..'), arquivo),
  })),
)

describe('blocos "testar" de docs/', () => {
  test('existe pelo menos um (um extrator quebrado não passa calado)', () => {
    assert.ok(blocos.length > 0)
  })

  for (const { arquivo, linha, linguagem, codigo, conteudo } of blocos)
    test(`${arquivo}:${linha}`, async () => {
      assert.equal(linguagem, 'bash', 'bloco "testar" é sempre ```bash')
      assert.deepEqual(proibicoes(conteudo), [], 'proibido em bloco testado')
      const r = await rodar(conteudo)
      assert.equal(
        r.status,
        codigo,
        `saída ${r.status}, esperada ${codigo}\n--- stdout\n${r.stdout}\n--- stderr\n${r.stderr}`,
      )
    })
})
