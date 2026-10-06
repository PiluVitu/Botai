import * as raiz from './index'

test('a raiz expõe exatamente a API do contrato', () => {
  expect(Object.keys(raiz).sort()).toEqual([
    'ErroDeOpcao',
    'LIMITE_DO_LOTE',
    'hojeEmSaoPaulo',
    'rngDeSemente',
    'sementeAleatoria',
  ])
})
