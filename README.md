# Botaí

Gerador de dados fake para formulários (CPF, CNPJ, CEP), da [PiluTech](https://pilutech.com.br). Gera uma pessoa brasileira de teste coerente (documentos com dígito verificador certo, CEP real com rua e cidade, celular com o DDD do CEP, cartão de teste da Stripe) e preenche o formulário da página.

- **Site:** https://botai.pilutech.com.br
- **Chrome e Edge:** [Chrome Web Store](https://chromewebstore.google.com/detail/bota%C3%AD/mblmjomopainbcdjipkdmioglamdinnc).
- **Firefox:** [Firefox Add-ons](https://addons.mozilla.org/pt-BR/firefox/addon/bota%C3%AD/). Opera: em revisão na loja.
- **Biblioteca:** [`@pilutech/botai-core`](https://www.npmjs.com/package/@pilutech/botai-core), o mesmo motor da extensão, para Node e navegador.
- **Servidor, imagem e binários:** `botai serve`, a imagem `ghcr.io/piluvitu/botai` e binários sem Node ([`packages/core/README.md`](./packages/core/README.md)).
- `@pilutech/botai-playwright`: fixture do Playwright ([README](packages/playwright/README.md)).

## O que tem aqui

| Pasta                  | O quê                                                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `extensao/`            | a extensão para Chrome, Edge, Opera e Firefox (WXT + React 19); instalar e usar: [`extensao/README.md`](./extensao/README.md) |
| `site/`                | a landing em botai.pilutech.com.br (Next 16), com a política de privacidade e os termos de uso                                |
| `packages/core/`       | `@pilutech/botai-core`, publicado no npm: [`packages/core/README.md`](./packages/core/README.md)                              |
| `packages/playwright/` | `@pilutech/botai-playwright`, publicado no npm: [`packages/playwright/README.md`](./packages/playwright/README.md)            |
| `docs/superpowers/`    | specs, planos, design e pesquisa                                                                                              |

## Desenvolvimento

Node 22 e pnpm 11 (`corepack enable` instala a versão de `package.json` > `packageManager`).

```sh
pnpm install
make test           # todos os testes
make build-botai    # extensão para Chrome em extensao/.output/chrome-mv3
make dev-botai-site # landing em http://localhost:3020
```

As regras e os comandos estão no [`CLAUDE.md`](./CLAUDE.md) e no de cada pasta.

## Cuidados

Os dados são fictícios, mas um CPF, um CNPJ ou um celular gerado pode pertencer a alguém de verdade, e a caixa de e-mail gerada é pública. Use só em localhost e em ambientes de teste ([termos de uso](https://botai.pilutech.com.br/termos)).

## Licença

MIT, © PiluTech ([`LICENSE`](./LICENSE)). Powered by [PiluTech](https://pilutech.com.br).
