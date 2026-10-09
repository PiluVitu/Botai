export type Numero = { valor: string; texto: string; fonte: string }

export const NUMEROS: Numero[] = [
  {
    valor: '43/43',
    texto: 'campos iguais em 15 saídas, com a mesma semente e o mesmo dia',
    fonte:
      'semente verificador-1, hoje 2026-10-05: biblioteca no Node, no Bun e no Deno, CLI, servidor, imagem, binário, install.sh, npx e fixture do Playwright',
  },
  {
    valor: '~2 s',
    texto: 'para 100 mil pessoas pela CLI, sem repetir CPF, e-mail nem CNPJ',
    fonte:
      'CLI, 100 000 pessoas em 1,8 a 2,1 s; 100 000 CPFs, e-mails e CNPJs distintos no lote',
  },
  {
    valor: '1.454',
    texto: 'testes automatizados passando',
    fonte:
      'core Jest 877, extensão Vitest 465 e E2E 26, fixture do Playwright Jest 17 e E2E 69',
  },
  {
    valor: '12',
    texto: 'arquivos dourados iguais da 0.2.0 à 0.4.1',
    fonte:
      'packages/core/dourado/v1, gravados pelo motor 0.2.0 e conferidos na 0.4.1',
  },
  {
    valor: '0,8 ms',
    texto: 'mediana para o motor preencher 21 campos, sem a 2ª passada',
    fonte:
      'motor no navegador, 21 campos: mediana 0,8 ms e p95 1,7 ms; com a 2ª passada, cerca de 1 s',
  },
  {
    valor: '0',
    texto: 'dependências de runtime no core',
    fonte: 'packages/core/package.json sem dependencies (npm view do 0.4.1)',
  },
]

export const LEGENDA_DOS_NUMEROS =
  'medido em 08/10/2026, num Mac arm64 com Node 22 · código aberto, licença MIT'
