import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { URL_DA_DOCUMENTACAO } from './conteudo'
import { CONVITE, PERSONAS, trechos } from './personas'

const MENUS = readFileSync(
  join(__dirname, '..', '..', 'extensao', 'src', 'lib', 'menus.ts'),
  'utf8',
)
const textoDe = (titulo: string) =>
  PERSONAS.find((p) => p.titulo === titulo)?.itens.join(' ') ?? ''

describe('para quem', () => {
  it('as 5 personas do design, com as etiquetas', () => {
    expect(PERSONAS.map((p) => [p.titulo, p.etiquetas])).toEqual([
      ['QA manual', ['extensão']],
      ['Dev frontend', ['extensão', 'biblioteca']],
      ['QA de automação', ['playwright', 'motor']],
      ['Backend semeando banco', ['cli', 'sql', 'csv']],
      ['CI', ['npx com versão fixa', 'imagem', 'binário']],
    ])
  })

  // react-number-format só está documentado; maska foi verificada no laboratório.
  it('as máscaras citadas são as verificadas', () => {
    expect(textoDe('Dev frontend')).toContain(
      'Funciona com React, Vue e máscaras (imask, jQuery Mask e maska).',
    )
    expect(PERSONAS.flatMap((p) => p.itens).join(' ')).not.toMatch(
      /react-number-format/,
    )
  })

  it('a caixa de entrada é a pública', () => {
    expect(textoDe('QA manual')).toContain(
      '“Abrir caixa de entrada” abre a caixa pública, onde chega o e-mail de confirmação.',
    )
    expect(MENUS).toContain("title: 'Abrir caixa de entrada'")
  })

  // "CPF, e-mail, CEP e mais 20 tipos" = os 23 itens do Inserir da extensão.
  it('o Inserir tem CPF, e-mail, CEP e mais 20 tipos', () => {
    expect(textoDe('QA manual')).toContain(
      '`Botão direito › Botaí › Inserir` põe CPF, e-mail, CEP e mais 20 tipos num campo só.',
    )
    const itens = MENUS.slice(
      MENUS.indexOf('export const ITENS_INSERIR'),
      MENUS.indexOf('type Propriedades'),
    ).match(/\{ kind: '/g)
    expect(itens).toHaveLength(23)
    for (const rotulo of ['CPF', 'E-mail', 'CEP'])
      expect(MENUS).toContain(`rotulo: '${rotulo}'`)
  })

  // O trecho entre crases vira <code> na página; a crase nunca aparece.
  it('trechos separa o código do texto', () => {
    expect(
      trechos('`Botão direito › Botaí › Inserir` põe CPF num campo só.'),
    ).toEqual([
      { texto: 'Botão direito › Botaí › Inserir', codigo: true },
      { texto: ' põe CPF num campo só.', codigo: false },
    ])
    expect(trechos('O seed de banco num passo do workflow.')).toEqual([
      { texto: 'O seed de banco num passo do workflow.', codigo: false },
    ])
    expect(trechos('a `b` c `d`')).toEqual([
      { texto: 'a ', codigo: false },
      { texto: 'b', codigo: true },
      { texto: ' c ', codigo: false },
      { texto: 'd', codigo: true },
    ])
  })

  it('toda crase das personas fecha', () => {
    for (const item of PERSONAS.flatMap((p) => p.itens))
      expect(item.split('`').length % 2).toBe(1)
  })

  it('o convite leva à documentação', () => {
    expect(CONVITE).toEqual({
      titulo: 'Não sabe por onde começar?',
      texto:
        'A documentação tem um guia por porta e as integrações por linguagem.',
      href: URL_DA_DOCUMENTACAO,
      rotulo: 'docs.botai.pilutech.com.br',
    })
  })
})
