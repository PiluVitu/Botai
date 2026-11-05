import { fileURLToPath } from 'node:url'
import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: {
          moduleResolution: 'bundler',
          allowJs: true,
          // O TypeScript 6 não infere mais o rootDir, e os .js do @piluvitu/ui moram no node_modules/.pnpm da raiz.
          rootDir: fileURLToPath(new URL('..', import.meta.url)),
        },
      },
    ],
  },
  // O @piluvitu/ui vem do npm só como ESM: sem transformá-lo, todo teste que renderiza um componente dele quebra.
  transformIgnorePatterns: ['/node_modules/(?!\\.pnpm/|@piluvitu/ui/)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@pilutech/botai-core/(.*)$': '<rootDir>/../packages/core/src/$1',
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  modulePathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/storybook-static/'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/storybook-static/',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

export default config
