import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      { tsconfig: { moduleResolution: 'node', allowJs: true } },
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
