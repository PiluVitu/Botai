import { themes } from 'prism-react-renderer'

/** @type {import('@docusaurus/types').Config} */
export default {
  title: 'Botaí — documentação',
  tagline:
    'Suíte de dados de teste brasileiros: uma pessoa fictícia e coerente, reprodutível pela semente, que preenche formulários.',
  favicon: 'img/botai.svg',
  url: 'https://docs.botai.pilutech.com.br',
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',
  markdown: {
    format: 'detect',
    hooks: { onBrokenMarkdownLinks: 'throw' },
  },

  i18n: { defaultLocale: 'pt-BR', locales: ['pt-BR'] },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: { routeBasePath: '/', sidebarPath: './sidebars.mjs' },
        blog: false,
        pages: false,
        theme: { customCss: './src/css/custom.css' },
        sitemap: {},
      }),
    ],
  ],

  /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Botaí',
      logo: { alt: 'Botaí', src: 'img/botai.svg' },
      items: [
        {
          label: 'Site',
          href: 'https://botai.pilutech.com.br',
          position: 'right',
        },
        {
          label: 'GitHub',
          href: 'https://github.com/PiluVitu/Botai',
          position: 'right',
        },
        {
          label: 'npm',
          href: 'https://www.npmjs.com/package/@pilutech/botai-core',
          position: 'right',
        },
      ],
    },
    footer: {
      copyright: '<a href="https://pilutech.com.br">Powered by PiluTech</a>',
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
      additionalLanguages: ['bash', 'csv', 'java', 'csharp', 'ruby', 'php'],
    },
  },
}
