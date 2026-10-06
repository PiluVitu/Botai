import * as raiz from './index'

test('a raiz expõe exatamente a API do contrato', () => {
  expect(Object.keys(raiz).sort()).toEqual([
    'DOMINIO_EMAIL_PADRAO',
    'ErroDeOpcao',
    'FORMATO',
    'LIMITE_DO_LOTE',
    'MOTOR',
    'gerarEnvelopeDaPessoa',
    'gerarEnvelopeDasPessoas',
    'gerarPessoa',
    'gerarPessoas',
    'hojeEmSaoPaulo',
    'rngDeSemente',
    'sementeAleatoria',
  ])
  expect(raiz.DOMINIO_EMAIL_PADRAO).toBe('tuamaeaquelaursa.com')
})
