import { spawnSync } from 'node:child_process'
import { gerarPessoas } from './gerar'
import { montarPessoa, type Pessoa } from './pessoa'
import {
  cabecalhoCsv,
  COLUNAS,
  ErroDoPlano,
  FORMATOS,
  insertSql,
  lerCampos,
  lerDialeto,
  lerTabela,
  linhaCsv,
  paraCsv,
  paraSql,
  pessoaPlana,
} from './plano'
import { sfc32 } from './prng'

const DOURADA = montarPessoa(sfc32(1, 2, 3, 4), '2026-10-01')
const comNome = (p: Pessoa, completo: string): Pessoa => ({
  ...p,
  nome: { ...p.nome, completo },
})
const semCaixa = (p: Pessoa): Pessoa => ({
  ...p,
  email: { ...p.email, caixaUrl: null },
})

describe('pessoaPlana', () => {
  test('a pessoa dourada achatada, coluna por coluna', () => {
    expect(pessoaPlana(DOURADA)).toEqual({
      nome: 'Vinícius Oliveira Costa',
      prenome: 'Vinícius',
      sobrenomes: 'Oliveira Costa',
      sexo: 'M',
      nascimento: '1993-05-29',
      idade: 33,
      cpf: '647.692.234-39',
      rg: '25.547.934-7',
      rg_orgao_emissor: 'SSP',
      rg_uf: 'SP',
      pis: '161.51127.87-1',
      titulo_eleitor: '6080 6730 1600',
      email: 'vinicius-costa-6607@tuamaeaquelaursa.com',
      email_usuario: 'vinicius-costa-6607',
      email_caixa_url: 'https://tuamaeaquelaursa.com/vinicius-costa-6607',
      senha: 's7YZgw&$iLak',
      celular: '(84) 99114-8037',
      celular_e164: '+5584991148037',
      cep: '59090-000',
      logradouro: 'Avenida Engenheiro Roberto Freire',
      numero: '3360',
      complemento: 'Apto 74',
      bairro: 'Ponta Negra',
      cidade: 'Natal',
      uf: 'RN',
      empresa_razao_social: 'Oliveira & Costa Logística Ltda',
      empresa_nome_fantasia: 'Costa Digital',
      empresa_cnpj: '35.728.569/0001-52',
      cartao_bandeira: 'mastercard',
      cartao_numero: '5555555555554444',
      cartao_titular: 'VINICIUS O COSTA',
      cartao_validade: '08/28',
      cartao_cvv: '430',
    })
  })

  test('as chaves saem na ordem de COLUNAS', () => {
    expect(Object.keys(pessoaPlana(DOURADA))).toEqual([...COLUNAS])
  })

  test('sem caixa pública, email_caixa_url é null', () => {
    expect(pessoaPlana(semCaixa(DOURADA)).email_caixa_url).toBeNull()
  })
})

describe('lerCampos', () => {
  test('aceita espaços e mantém a ordem pedida', () => {
    expect(lerCampos('cpf, nome ,idade')).toEqual(['cpf', 'nome', 'idade'])
  })

  test.each([
    ['', 'vazia'],
    ['nome,', 'vazia'],
    ['nome,nome', 'repetida "nome"'],
    ['nome,Nome', 'desconhecida "Nome"'],
    ['endereco', 'desconhecida "endereco"'],
  ])('recusa %j', (texto, trecho) => {
    expect(() => lerCampos(texto)).toThrow(ErroDoPlano)
    expect(() => lerCampos(texto)).toThrow(trecho)
  })
})

describe('CSV (RFC 4180)', () => {
  test('cabeçalho com os nomes das colunas e CRLF', () => {
    expect(cabecalhoCsv(['nome', 'cpf'])).toBe('nome,cpf\r\n')
    expect(cabecalhoCsv()).toBe(`${COLUNAS.join(',')}\r\n`)
  })

  test('linha da pessoa dourada, todas as colunas', () => {
    expect(linhaCsv(DOURADA)).toBe(
      'Vinícius Oliveira Costa,Vinícius,Oliveira Costa,M,1993-05-29,33,647.692.234-39,25.547.934-7,SSP,SP,161.51127.87-1,6080 6730 1600,vinicius-costa-6607@tuamaeaquelaursa.com,vinicius-costa-6607,https://tuamaeaquelaursa.com/vinicius-costa-6607,s7YZgw&$iLak,(84) 99114-8037,+5584991148037,59090-000,Avenida Engenheiro Roberto Freire,3360,Apto 74,Ponta Negra,Natal,RN,Oliveira & Costa Logística Ltda,Costa Digital,35.728.569/0001-52,mastercard,5555555555554444,VINICIUS O COSTA,08/28,430\r\n',
    )
  })

  test('aspas, vírgula e quebra de linha vão entre aspas, com aspas dobradas', () => {
    expect(linhaCsv(comNome(DOURADA, 'Joana "Ju", da Silva'), ['nome'])).toBe(
      '"Joana ""Ju"", da Silva"\r\n',
    )
    expect(linhaCsv(comNome(DOURADA, 'linha1\nlinha2'), ['nome'])).toBe(
      '"linha1\nlinha2"\r\n',
    )
  })

  test('null vira campo vazio; texto vazio vira ""', () => {
    expect(linhaCsv(semCaixa(DOURADA), ['email_caixa_url', 'idade'])).toBe(
      ',33\r\n',
    )
    expect(linhaCsv(comNome(DOURADA, ''), ['nome'])).toBe('""\r\n')
  })

  test('paraCsv: cabeçalho e uma linha por pessoa', () => {
    const lote = gerarPessoas(3, { semente: 'csv', hoje: '2026-10-05' })
    expect(paraCsv(lote, ['nome', 'cpf']).split('\r\n')).toEqual([
      'nome,cpf',
      ...lote.map((p) => `${p.nome.completo},${p.cpf}`),
      '',
    ])
  })
})

describe('SQL', () => {
  test('postgres (padrão): aspas duplas nos nomes, simples nos textos, número cru', () => {
    expect(
      insertSql(DOURADA, {
        colunas: ['nome', 'idade', 'email_caixa_url', 'senha'],
      }),
    ).toBe(
      `INSERT INTO "pessoas" ("nome", "idade", "email_caixa_url", "senha") VALUES ('Vinícius Oliveira Costa', 33, 'https://tuamaeaquelaursa.com/vinicius-costa-6607', 's7YZgw&$iLak');\n`,
    )
  })

  test('aspas simples são dobradas em todo dialeto', () => {
    for (const dialeto of ['postgres', 'mysql', 'sqlite'] as const)
      expect(
        insertSql(comNome(DOURADA, "Joana D'Arc"), {
          dialeto,
          colunas: ['nome'],
        }),
      ).toContain("VALUES ('Joana D''Arc');")
  })

  test('mysql: crase nos nomes, esquema.tabela e barra invertida escapada', () => {
    expect(
      insertSql(comNome(DOURADA, 'a\\b'), {
        dialeto: 'mysql',
        tabela: 'app.clientes',
        colunas: ['nome'],
      }),
    ).toBe("INSERT INTO `app`.`clientes` (`nome`) VALUES ('a\\\\b');\n")
  })

  test('postgres e sqlite: barra invertida fica como está', () => {
    for (const dialeto of ['postgres', 'sqlite'] as const)
      expect(
        insertSql(comNome(DOURADA, 'a\\b'), { dialeto, colunas: ['nome'] }),
      ).toBe('INSERT INTO "pessoas" ("nome") VALUES (\'a\\b\');\n')
  })

  test('null vira NULL', () => {
    expect(insertSql(semCaixa(DOURADA), { colunas: ['email_caixa_url'] })).toBe(
      'INSERT INTO "pessoas" ("email_caixa_url") VALUES (NULL);\n',
    )
  })

  test('sem colunas, vão todas, na ordem de COLUNAS', () => {
    expect(insertSql(DOURADA)).toContain(
      `(${COLUNAS.map((c) => `"${c}"`).join(', ')})`,
    )
  })

  test('paraSql: um INSERT por pessoa', () => {
    const lote = gerarPessoas(4, { semente: 'sql', hoje: '2026-10-05' })
    expect(paraSql(lote, { dialeto: 'sqlite' }).split('\n')).toHaveLength(5)
  })

  test('o SQL do sqlite roda de verdade e devolve a visão plana', () => {
    const lote = gerarPessoas(3, {
      semente: 'sqlite',
      hoje: '2026-10-05',
      dominioEmail: 'example.com',
    })
    lote[0] = comNome(lote[0], `Joana D'Arc "Ju", a\\b; DROP TABLE x;--`)
    const ddl = `CREATE TABLE "pessoas" (${COLUNAS.map(
      (c) => `"${c}" ${c === 'idade' ? 'INTEGER' : 'TEXT'}`,
    ).join(', ')});`
    const programa = [
      "const { DatabaseSync } = require('node:sqlite')",
      "const entrada = JSON.parse(require('node:fs').readFileSync(0, 'utf8'))",
      "const db = new DatabaseSync(':memory:')",
      'db.exec(entrada.ddl)',
      'db.exec(entrada.sql)',
      "process.stdout.write(JSON.stringify(db.prepare('SELECT * FROM pessoas').all()))",
    ].join('\n')
    const r = spawnSync(process.execPath, ['--no-warnings', '-e', programa], {
      input: JSON.stringify({ ddl, sql: paraSql(lote, { dialeto: 'sqlite' }) }),
      encoding: 'utf8',
    })
    expect(r.stderr).toBe('')
    expect(JSON.parse(r.stdout)).toEqual(lote.map(pessoaPlana))
  })
})

describe('lerTabela e lerDialeto', () => {
  test.each(['pessoas', 'app.pessoas', '_t1', 'P2', 'x'.repeat(63)])(
    'aceita a tabela %j',
    (tabela) => {
      expect(lerTabela(tabela)).toBe(tabela)
    },
  )

  test.each([
    '',
    '1x',
    'x;drop table y',
    'a.b.c',
    'pes soas',
    '"x"',
    'tabela-1',
    'x'.repeat(64),
  ])('recusa a tabela %j', (tabela) => {
    expect(() => lerTabela(tabela)).toThrow(ErroDoPlano)
  })

  test('insertSql também recusa tabela inválida', () => {
    expect(() => insertSql(DOURADA, { tabela: 'x;y' })).toThrow(ErroDoPlano)
  })

  test('formatos e dialetos conhecidos, e recusa do resto', () => {
    expect(FORMATOS).toEqual(['json', 'ndjson', 'csv', 'sql'])
    expect(lerDialeto('mysql')).toBe('mysql')
    expect(() => lerDialeto('oracle')).toThrow('dialeto desconhecido "oracle"')
  })
})
