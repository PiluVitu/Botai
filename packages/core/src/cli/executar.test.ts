import { validarCPF } from '../cpf'
import type { EnvelopeDaPessoa, EnvelopeDasPessoas } from '../envelope'
import { gerarEnvelopeDaPessoa } from '../envelope'
import { gerarPessoa, gerarPessoas } from '../gerar'
import { MOTOR } from '../versao'
import { executar, SAIDA } from './executar'

const HOJE = '2026-10-05'

function rodar(...argv: string[]) {
  let stdout = ''
  let stderr = ''
  const codigo = executar(argv, {
    dados: (t) => {
      stdout += t
    },
    mensagem: (t) => {
      stderr += t
    },
  })
  return { codigo, stdout, stderr }
}

describe('botai pessoa', () => {
  test('envelope em JSON, igual ao da biblioteca, e nada no stderr', () => {
    const r = rodar('pessoa', '--semente', '42', '--hoje', HOJE)
    expect(r).toEqual({
      codigo: 0,
      stdout: `${JSON.stringify(gerarEnvelopeDaPessoa({ semente: 42, hoje: HOJE }), null, 2)}\n`,
      stderr: '',
    })
  })

  test('--semente -5 e --semente=-5 são a semente "-5"', () => {
    for (const argv of [
      ['pessoa', '--semente', '-5', '--hoje', HOJE],
      ['pessoa', '--semente=-5', '--hoje', HOJE],
    ]) {
      const r = rodar(...argv)
      expect(r.codigo).toBe(0)
      expect((JSON.parse(r.stdout) as EnvelopeDaPessoa).semente).toBe('-5')
    }
  })

  test('--uf e --dominio-email chegam à pessoa', () => {
    const r = rodar(
      'pessoa',
      '--semente',
      'botai',
      '--hoje',
      HOJE,
      '--uf',
      'pi',
      '--dominio-email',
      'example.com',
    )
    expect((JSON.parse(r.stdout) as EnvelopeDaPessoa).pessoa).toEqual(
      gerarPessoa({
        semente: 'botai',
        hoje: HOJE,
        uf: 'PI',
        dominioEmail: 'example.com',
      }),
    )
  })

  test('sem semente e sem hoje, o envelope traz os dois', () => {
    const e = JSON.parse(rodar('pessoa').stdout) as EnvelopeDaPessoa
    expect(e.semente).toMatch(/^[0-9a-f]{16}$/)
    expect(gerarPessoa({ semente: e.semente, hoje: e.hoje })).toEqual(e.pessoa)
  })
})

describe('botai pessoas', () => {
  const LOTE = ['pessoas', '-n', '3', '--semente', 'lote', '--hoje', HOJE]

  test('json (padrão): envelope do lote', () => {
    const e = JSON.parse(rodar(...LOTE).stdout) as EnvelopeDasPessoas
    expect(e).toEqual({
      formato: 1,
      motor: MOTOR,
      semente: 'lote',
      hoje: HOJE,
      pessoas: gerarPessoas(3, { semente: 'lote', hoje: HOJE }),
    })
  })

  test('ndjson: um envelope por linha, cada um com a semente exata da pessoa', () => {
    const linhas = rodar(...LOTE, '--formato', 'ndjson')
      .stdout.trimEnd()
      .split('\n')
      .map((l) => JSON.parse(l) as EnvelopeDaPessoa)
    expect(linhas.map((l) => l.semente)).toEqual(['lote/0', 'lote/1', 'lote/2'])
    for (const l of linhas)
      expect(gerarPessoa({ semente: l.semente, hoje: l.hoje })).toEqual(
        l.pessoa,
      )
  })

  test('csv: cabeçalho e linhas com CRLF; --campos escolhe e ordena', () => {
    const r = rodar(...LOTE, '--formato', 'csv', '--campos', 'cpf, nome')
    const pessoas = gerarPessoas(3, { semente: 'lote', hoje: HOJE })
    expect(r.stdout).toBe(
      `cpf,nome\r\n${pessoas.map((p) => `${p.cpf},${p.nome.completo}\r\n`).join('')}`,
    )
    expect(r.stderr).toBe('')
  })

  test('csv sem --semente avisa a semente no stderr, não no stdout', () => {
    const r = rodar(
      'pessoas',
      '-n',
      '1',
      '--formato',
      'csv',
      '--campos',
      'nome',
    )
    expect(r.stderr).toMatch(
      /^botai: semente [0-9a-f]{16}, hoje \d{4}-\d{2}-\d{2}\n$/,
    )
    expect(r.stdout.startsWith('nome\r\n')).toBe(true)
  })

  test('sql: comentário com formato, motor, semente e hoje, e um INSERT por pessoa', () => {
    const r = rodar(...LOTE, '--formato', 'sql', '--campos', 'nome')
    const linhas = r.stdout.trimEnd().split('\n')
    expect(linhas[0]).toBe(
      `-- botai: formato 1, motor ${MOTOR}, semente lote, hoje ${HOJE}`,
    )
    expect(linhas.slice(1)).toHaveLength(3)
    expect(linhas[1]).toMatch(
      /^INSERT INTO "pessoas" \("nome"\) VALUES \('.+'\);$/,
    )
  })

  test('sql com --dialeto mysql e --tabela esquema.tabela', () => {
    const r = rodar(
      ...LOTE,
      '--formato',
      'sql',
      '--dialeto',
      'mysql',
      '--tabela',
      'app.clientes',
      '--campos',
      'cpf',
    )
    expect(r.stdout.split('\n')[1]).toMatch(
      /^INSERT INTO `app`\.`clientes` \(`cpf`\) VALUES \('[\d.-]+'\);$/,
    )
  })

  test('-n 0 em csv dá só o cabeçalho', () => {
    expect(
      rodar(
        'pessoas',
        '-n',
        '0',
        '--semente',
        'x',
        '--formato',
        'csv',
        '--campos',
        'nome',
      ).stdout,
    ).toBe('nome\r\n')
  })
})

describe('avulsos', () => {
  test.each([
    [['cpf'], '37188580375'],
    [['cpf', '--formatado'], '371.885.803-75'],
    [['cpf', '--formatado', '--uf', 'SP'], '371.885.808-80'],
    [['cnpj', '--formatado'], '37.188.580/0001-00'],
    [['rg'], '371885802'],
    [['pis', '--formatado'], '137.18858.03-6'],
    [['titulo', '--formatado'], '3718 8580 0191'],
    [['titulo', '--formatado', '--uf', 'PI'], '3718 8580 1597'],
    [['celular', '--formatado', '--uf', 'PI'], '(86) 96580-3241'],
    [['celular'], '62965803241'],
    [['cep', '--uf', 'PI'], '64000020'],
  ])('%j com --semente avulso', (argv, esperado) => {
    expect(rodar(...argv, '--semente', 'avulso')).toEqual({
      codigo: 0,
      stdout: `${esperado}\n`,
      stderr: '',
    })
  })

  test('sem semente, sorteia um CPF válido', () => {
    expect(validarCPF(rodar('cpf').stdout.trim())).toBe(true)
  })
})

describe('validar', () => {
  test.each([
    ['cpf', '647.692.234-39', 'válido', SAIDA.ok],
    ['cpf', '647.692.234-30', 'inválido', SAIDA.invalido],
    ['cnpj', '35.728.569/0001-52', 'válido', SAIDA.ok],
    ['rg', '25.547.934-7', 'válido', SAIDA.ok],
    ['pis', '161.51127.87-1', 'válido', SAIDA.ok],
    ['titulo', '6080 6730 1600', 'válido', SAIDA.ok],
    ['cartao', '4242424242424242', 'válido', SAIDA.ok],
    ['cartao', '4242424242424241', 'inválido', SAIDA.invalido],
  ])('%s %s → %s', (tipo, valor, texto, codigo) => {
    expect(rodar('validar', tipo, valor)).toEqual({
      codigo,
      stdout: `${texto}\n`,
      stderr: '',
    })
  })
})

describe('ajuda e versão', () => {
  test('--help no stdout com saída 0', () => {
    const r = rodar('--help')
    expect(r.codigo).toBe(0)
    expect(r.stdout).toContain('Uso:')
    expect(r.stderr).toBe('')
  })

  test.each([
    [['pessoa', '--help'], '--dominio-email'],
    [['pessoas', '-h'], 'Colunas: nome, prenome'],
    [['cpf', '--help'], '--formatado'],
    [['validar', '--help'], 'Tipos: cpf'],
  ])('%j', (argv, trecho) => {
    const r = rodar(...argv)
    expect(r.codigo).toBe(0)
    expect(r.stdout).toContain(trecho)
  })

  test('--versao e --version imprimem MOTOR', () => {
    expect(rodar('--versao').stdout).toBe(`${MOTOR}\n`)
    expect(rodar('--version').stdout).toBe(`${MOTOR}\n`)
  })

  test('sem comando: ajuda no stderr e saída 2', () => {
    const r = rodar()
    expect(r.codigo).toBe(SAIDA.uso)
    expect(r.stdout).toBe('')
    expect(r.stderr).toContain('Uso:')
  })
})

describe('erros de uso: saída 2, mensagem no stderr e nada no stdout', () => {
  test.each([
    [['foo'], 'comando desconhecido "foo"'],
    [['pessoa', 'extra'], 'argumento inesperado: extra'],
    [['pessoa', '--formatado'], 'opção desconhecida: --formatado'],
    [['pessoa', '--semente'], '--semente precisa de um valor'],
    [['pessoa', '--semente', ''], '--semente: semente vazia'],
    [['pessoa', '--semente', 'a', '--semente', 'b'], 'opção repetida'],
    [['pessoa', '--uf', 'XX'], '--uf: uf desconhecida "XX"'],
    [['pessoa', '--hoje', '2026-02-30'], '--hoje: hoje precisa ser uma data'],
    [['pessoa', '--dominio-email', 'localhost'], '--dominio-email: domínio'],
    [['pessoas'], '-n é obrigatório'],
    [['pessoas', '-n', 'x'], '-n precisa ser um inteiro'],
    [['pessoas', '-n', '100001', '--formato', 'csv'], '-n: n precisa ser'],
    [['pessoas', '-n', '100001', '--formato', 'sql'], '-n: n precisa ser'],
    [['pessoas', '-n', '1', '--formato', 'xml'], '--formato desconhecido'],
    [['pessoas', '-n', '1', '--dialeto', 'mysql'], '--dialeto só vale'],
    [['pessoas', '-n', '1', '--tabela', 't'], '--tabela só vale'],
    [['pessoas', '-n', '1', '--campos', 'nome'], '--campos só vale'],
    [
      ['pessoas', '-n', '1', '--formato', 'sql', '--dialeto', 'oracle'],
      'dialeto desconhecido',
    ],
    [
      ['pessoas', '-n', '1', '--formato', 'sql', '--tabela', 'x;drop table y'],
      'tabela inválida',
    ],
    [
      ['pessoas', '-n', '1', '--formato', 'csv', '--campos', 'nome,nome'],
      'repetida',
    ],
    [
      ['pessoas', '-n', '1', '--formato', 'csv', '--campos', 'nome,xyz'],
      'desconhecida "xyz"',
    ],
    [
      [
        'pessoas',
        '-n',
        '1',
        '--formato',
        'csv',
        '--dominio-email',
        'localhost',
      ],
      '--dominio-email: domínio',
    ],
    [
      [
        'pessoas',
        '-n',
        '1',
        '--formato',
        'sql',
        '--dominio-email',
        'localhost',
      ],
      '--dominio-email: domínio',
    ],
    [
      [
        'pessoas',
        '-n',
        '0',
        '--formato',
        'csv',
        '--dominio-email',
        'localhost',
      ],
      '--dominio-email: domínio',
    ],
    [['cnpj', '--uf', 'SP'], '--uf não vale para cnpj'],
    [['validar', 'cpf'], 'uso: botai validar <tipo> <valor>'],
    [['validar', 'xyz', '1'], 'tipo desconhecido "xyz"'],
  ])('%j', (argv, trecho) => {
    const r = rodar(...argv)
    expect(r.codigo).toBe(SAIDA.uso)
    expect(r.stdout).toBe('')
    expect(r.stderr).toMatch(/^botai: /)
    expect(r.stderr).toContain(trecho)
  })
})

test('erro inesperado vira saída 3 com a mensagem no stderr', () => {
  let stderr = ''
  const codigo = executar(['--versao'], {
    dados: () => {
      throw new Error('disco cheio')
    },
    mensagem: (t) => {
      stderr += t
    },
  })
  expect(codigo).toBe(SAIDA.interno)
  expect(stderr).toBe('botai: erro interno: disco cheio\n')
})
