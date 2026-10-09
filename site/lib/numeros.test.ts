import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { MOTOR } from '@pilutech/botai-core'
import { LEGENDA_DOS_NUMEROS, NUMEROS } from './numeros'

const CORE = join(__dirname, '..', '..', 'packages', 'core')

describe('a faixa de números', () => {
  // Os textos são os da coluna "Usar" da spec: cada ajuste é um fato do relatório de 2026-10-08.
  it('os 6 pares valor e texto, na ordem do design', () => {
    expect(NUMEROS.map(({ valor, texto }) => [valor, texto])).toEqual([
      [
        '43/43',
        'campos iguais em 15 saídas, com a mesma semente e o mesmo dia',
      ],
      [
        '~2 s',
        'para 100 mil pessoas pela CLI, sem repetir CPF, e-mail nem CNPJ',
      ],
      ['1.454', 'testes automatizados passando'],
      ['12', 'arquivos dourados iguais da 0.2.0 à 0.4.1'],
      ['0,8 ms', 'mediana para o motor preencher 21 campos, sem a 2ª passada'],
      ['0', 'dependências de runtime no core'],
    ])
  })

  it('cada número diz de onde veio', () => {
    for (const numero of NUMEROS)
      expect(numero.fonte.length).toBeGreaterThan(20)
  })

  it('a legenda tem a data e a máquina da medição', () => {
    expect(LEGENDA_DOS_NUMEROS).toBe(
      'medido em 08/10/2026, num Mac arm64 com Node 22 · código aberto, licença MIT',
    )
  })

  // Os dourados foram conferidos até a 0.4.1. Subiu o core? Confira de novo antes de mudar o texto.
  it('"da 0.2.0 à 0.4.1" vale para a versão atual do core', () => {
    expect(MOTOR).toBe('0.4.1')
  })

  it('são 12 dourados, fora o índice', () => {
    const arquivos = readdirSync(join(CORE, 'dourado', 'v1')).filter(
      (arquivo) => arquivo !== 'indice.json',
    )
    expect(arquivos).toHaveLength(12)
  })

  it('o core não tem dependência de runtime', () => {
    const pacote = JSON.parse(
      readFileSync(join(CORE, 'package.json'), 'utf8'),
    ) as Record<string, unknown>
    expect(pacote.dependencies ?? {}).toEqual({})
  })
})
