# Chrome Web Store: Botaí

> Última atualização: 2026-11-17.
>
> Índice da ficha na Chrome Web Store. Os textos colados no painel moram em `loja/textos.md` (fonte única, travada por `loja/textos.test.ts`, que confere este arquivo também); aqui ficam o mapa de cada campo do painel para a sua seção, as imagens, as versões e o histórico de revisão. Mudou o manifest (permissão, host, content script)? Atualize o `loja/textos.md` e este arquivo no mesmo PR. Este arquivo não vai no zip da Chrome (o WXT só empacota o `.output/chrome-mv3`).

## Ficha (aba "Store listing")

| Campo do painel | Fonte |
| --- | --- |
| Nome | textos.md › Nome |
| Resumo | o `description` do manifest (`wxt.config.ts`); não há campo próprio |
| Descrição | textos.md › Descrição |
| Categoria | textos.md › Categoria |
| Idioma | português (Brasil) |
| Site, suporte e publicador | textos.md › Endereços |

## Imagens

| Peça | Tamanho | Arquivo |
| --- | --- | --- |
| Ícone da loja | 128×128 | `loja/imagens/icone-128.png` |
| Capturas de tela | 1280×800 | `loja/imagens/capturas/1280x800/` (regerar com `make capturas-botai` quando a UI mudar) |
| Bloco promocional pequeno | 440×280 | `loja/imagens/chrome-tile-440x280.png` |

## Práticas de privacidade (aba "Privacy")

| Campo do painel | Fonte |
| --- | --- |
| Propósito único | textos.md › Propósito único |
| Código remoto | textos.md › Código remoto |
| Uso de dados e certificações | textos.md › Dados |
| Política de privacidade | https://botai.pilutech.com.br/privacidade |

| Permissão | Tipo | Justificativa |
| --- | --- | --- |
| `activeTab` | permissions | textos.md › Justificativa: activeTab |
| `scripting` | permissions | textos.md › Justificativa: scripting |
| `contextMenus` | permissions | textos.md › Justificativa: contextMenus |
| `storage` | permissions | textos.md › Justificativa: storage |

- `host_permissions`, `optional_permissions` e `content_scripts`: nenhum no pacote da loja. O host `http://teste.local/*` só existe no build e2e, que não é publicado (`manifesto.e2e.ts` trava isso).
- O atalho (`commands`) não é permissão e não tem campo no painel. A `menus` só existe no pacote do Firefox.

## Publicação

O envio sai do `botai-release.yml` (job `lojas`, environment `lojas-botai`, com aprovação do dono); o passo a passo está no `extensao/CLAUDE.md`, "Publicação". Nada vai para a loja sem o dono.

## Versões

| Versão | Tag (data) | O que mudou para quem usa |
| --- | --- | --- |
| 1.2.0 | `botai-v1.2.0` (2026-10-09) | Cartão de teste das próximas pessoas: Stripe ou Pagar.me, com cenário |
| 1.1.0 | `botai-v1.1.0` (2026-10-09) | Favoritos (até 3, com apelido) e o menu "Preencher com" |
| 1.0.0 | `botai-v1.0.0` (2026-10-02) | Primeira versão pública |

Na `main`, ainda sem versão:

- "Nova pessoa" pelo botão direito confirma na página, com o primeiro nome da pessoa nova.
- O aviso na página aparece por cima de uma janela modal do site, e o "Fechar" funciona nela.
- O popup abre já no tema escuro do sistema, sem piscar claro.
- Descrição da loja sem nomes de framework e biblioteca.

## Histórico de revisão

- Recusas da loja: nenhuma registrada.
- 2026-11-17: revisão do código contra a skill `chrome-extensions` e os guias do `modern-web-guidance` (permissões, service worker, mensagens, menus, aviso, tema). Os achados médios e os baixos rápidos entraram no PR desta data; os de acessibilidade ficam na auditoria (`docs/auditoria-a11y-l10n.md`).
