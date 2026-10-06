import { expect, test } from '../../index.js'

test('falha na primeira tentativa e passa na segunda', ({
  botai,
}, testInfo) => {
  testInfo.annotations.push({
    type: 'pessoa-da-tentativa',
    description: JSON.stringify(botai.pessoa),
  })
  expect(testInfo.retry).toBeGreaterThan(0)
})

test.describe(() => {
  test.use({ botaiHoje: '05/10/2026' })

  test('botaiHoje fora do formato falha com mensagem clara', ({ botai }) => {
    expect(botai.pessoa).toBeDefined()
  })
})
