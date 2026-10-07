import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing/vitest-plugin'

// O Vitest 5 copia o define `import.meta.env.*` para o process.env, e o `false` do WXT vira a string "false",
// que é verdadeira: sem isto, todo teste roda no ramo do Firefox.
function semConstantesDeNavegador(): Plugin {
  return {
    name: 'botai:sem-constantes-de-navegador',
    config(configuracao) {
      for (const nome of ['CHROME', 'FIREFOX', 'SAFARI', 'EDGE', 'OPERA'])
        delete configuracao.define?.[`import.meta.env.${nome}`]
    },
  }
}

export default defineConfig({
  plugins: [WxtVitest(), semConstantesDeNavegador()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.test.{ts,tsx}',
      'scripts/**/*.test.ts',
      'loja/**/*.test.ts',
    ],
  },
})
