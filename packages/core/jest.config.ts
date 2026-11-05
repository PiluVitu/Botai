import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { moduleResolution: 'bundler' } }],
  },
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/scripts/**/*.test.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
}

export default config
