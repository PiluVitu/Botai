import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: 'filho.teste.ts',
  retries: 1,
  workers: 1,
  outputDir: '../../../test-results/filho',
  projects: [{ name: 'filho' }],
})
