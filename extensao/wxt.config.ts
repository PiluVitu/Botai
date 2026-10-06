import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'wxt'
import { TECLAS_DO_MANIFESTO } from '@pilutech/botai-core/atalhos'

const raizDoRepo = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  srcDir: 'src',
  imports: false,
  // Sem isto, o -b firefox gera MV2.
  manifestVersion: 3,
  targetBrowsers: ['chrome', 'firefox', 'opera'],
  webExt: { disabled: true },
  dev: { server: { port: 3018 }, reloadCommand: false },
  zip: {
    name: 'botai',
    sourcesRoot: raizDoRepo,
    // Arquivo oculto só entra citado pelo nome (.npmrc).
    includeSources: [
      'package.json',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
      '.npmrc',
      'scripts/check-tailwind-source.mjs',
      'extensao/**',
      'packages/core/**',
      // Sai junto com o overrides do pnpm-workspace.yaml (passo C4 do plano da fase 0).
      'vendor/piluvitu-ui-0.1.0.tgz',
    ],
    // Com sourcesRoot na raiz, a exclusão automática do outDir do WXT não pega estas pastas.
    excludeSources: [
      'extensao/.output/**',
      'extensao/.wxt/**',
      'packages/core/dist/**',
      'packages/core/dist-bin/**',
      'packages/core/pacote/**',
      '**/storybook-static/**',
      '**/test-results/**',
      '**/playwright-report/**',
    ],
  },
  manifest: ({ browser, mode }) => {
    const firefox = browser === 'firefox'
    return {
      name: 'Botaí',
      short_name: 'Botaí',
      description: 'Gerador de dados fake para formulários (CPF, CNPJ, CEP)',
      homepage_url: 'https://botai.pilutech.com.br',
      ...(firefox
        ? {
            browser_specific_settings: {
              gecko: {
                id: 'botai@pilutech.com.br',
                strict_min_version: '153.0',
                data_collection_permissions: { required: ['none'] },
              },
            },
          }
        : { minimum_chrome_version: '123' }),
      permissions: [
        'activeTab',
        'scripting',
        'contextMenus',
        'storage',
        // Libera o menus.getTargetElement no content script do Firefox (o Inserir no campo clicado).
        ...(firefox ? ['menus'] : []),
      ],
      commands: {
        'botai-preencher': {
          suggested_key: firefox
            ? TECLAS_DO_MANIFESTO.firefox
            : TECLAS_DO_MANIFESTO.chromium,
          description: 'Preencher esta página',
        },
      },
      ...(mode === 'e2e' && { host_permissions: ['http://teste.local/*'] }),
    }
  },
  vite: ({ browser }) => ({
    plugins: [react(), tailwindcss()],
    // A loja do Opera recusa código próprio minificado.
    ...(browser === 'opera' && { build: { minify: false } }),
  }),
})
