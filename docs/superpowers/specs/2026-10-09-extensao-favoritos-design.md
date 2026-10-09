# ESPEC — favoritos na extensão do Botaí (`extensao/`)

> **Implementada em 2026-10-09** (`extensao/`, branch `feat/extensao-favoritos`). Entra junto com o PR do site e da documentação (PiluVitu/Botai#33, `feat/site-docs-favoritos`), que atualiza a política de privacidade. A versão da extensão não muda neste PR: a 1.1.0 sai num passo próprio (ver "Release 1.1.0").

## Objetivo

Quem testa formulários volta sempre às mesmas pessoas: o admin do staging, o comprador PJ, o cliente com CEP do Piauí. Hoje o Botaí guarda uma pessoa só, e "Nova pessoa" a perde. Os favoritos guardam até 3 pessoas com apelido, sem tirar a pessoa ativa do lugar: o atalho, o botão e o menu continuam preenchendo com a ativa, e um clique num favorito o torna a ativa.

## Fonte visual e de comportamento

Aprovada pelo dono numa demo interativa do Claude Design. Cópias em `docs/superpowers/design/2026-10-09-extensao-favoritos/`:

| Arquivo        | O que é                                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Demo.dc.html` | a demo interativa (popup 1b + página de teste + menu do botão direito simulado), com o comportamento exato no `<script data-dc-script>`; **é a referência** |
| `Main.dc.html` | os estados estáticos 2a–2f: ativa favorita, nova pessoa não guardada, guardando com apelido, limite, tirou com desfazer e o menu do botão direito           |

Os `.dc.html` carregam `support.js` por caminho relativo, que ficou só no projeto do Claude Design. Onde a demo e os estados divergem, vale a demo: sem o chip "1 vaga" do 2a, a nota do limite com o texto da demo, o aviso de desfazer sem a barra de tempo do 2e e "Enter salva, Esc cancela" (o 2c dizia "Esc mantém…"). As cores saem dos tokens do `@piluvitu/ui`, nunca dos hex da demo.

## Decisões (contrato com o PR do site; os nomes não mudam)

- **Armazenamento.** `local:botai_pessoa` continua sendo a pessoa **ativa** (a do atalho, do botão e do menu). Chave nova `local:botai_favoritos` (`storage.defineItem`, `fallback: []`, `version: 1`): no máximo 3 `{ id: string, apelido: string, pessoa: Pessoa, guardadoEm: string ISO }`. `LIMITE_FAVORITOS = 3`. Nada em `sync:`. Sem migração: a chave nova começa vazia.
- **Apelido.** Começa com o primeiro nome da pessoa (a primeira palavra do nome completo); é aparado; tem de 1 a 24 caracteres; vazio depois de aparar volta ao primeiro nome.
- **A ativa "é favorita"** quando há um favorito com o mesmo CPF, comparado em dígitos. O CPF é a identidade que a pessoa vê, sai de uma semente de 128 bits (colisão desprezível) e não depende da ordem das chaves do objeto guardado; comparar o objeto inteiro quebraria quando o `Pessoa` do core ganhar um campo.
- **Usar um favorito** (chip do popup ou item do menu) grava a pessoa dele em `local:botai_pessoa`: ele vira a ativa.
- **"Nova pessoa"** troca só a ativa; nunca mexe nos favoritos.
- **Tirar um favorito** (a estrela da ativa favorita): ele some da lista e o popup mostra por 5 s "<apelido> saiu dos favoritos." com "Desfazer", que o devolve na mesma posição. Sem diálogo de confirmação.
- **Limite.** Com 3 favoritos e a ativa fora deles, a estrela fica `aria-disabled` com o rótulo "Limite de 3 favoritos", e aparece a nota "Os 3 lugares estão ocupados. Para guardar <primeiro nome>, abra um favorito e clique na estrela para tirá-lo."
- **Popup 1b** (o 1a, primeiro uso, não muda):
  - estrela ao lado do nome: botão com `aria-pressed` e os rótulos "Guardar nos favoritos" / "Tirar dos favoritos";
  - ativa favorita: o apelido em âmbar acima do nome, com o botão de lápis "Renomear favorito";
  - edição inline: `label` "Apelido do favorito", `maxLength` 24, contador "n/24 · Enter salva, Esc cancela"; Enter salva, Esc cancela. Guardar abre a edição com o primeiro nome;
  - faixa "Favoritos n/3" com os chips (iniciais + apelido, `aria-pressed` no da ativa) e o chip tracejado "Guardar esta" quando cabe;
  - aviso com "Desfazer" em `role="status"`.
- **Menu de contexto.** Submenu "Preencher com" (id `botai-preencher-com`, título exato `'Preencher com'`; itens `botai-preencher-com:<id>` com "<apelido> · <primeiro nome>"), só quando há favorito, nos mesmos contextos do "Preencher esta página" (inclui `'password'` no Firefox). Escolher um item torna o favorito a ativa e preenche a página pelo mesmo fluxo do Preencher, no background. O menu é refeito quando os favoritos mudam (`watch`).
- **Textos das lojas** (`extensao/loja/textos.md`): na Descrição, a linha "• até 3 pessoas favoritas, com apelido, para voltar a elas depois"; a "Justificativa: storage" vira "Guardar no próprio navegador (storage.local) a pessoa de teste ativa e até 3 pessoas favoritas que a pessoa guardar, para reutilizá-las. Nada é sincronizado nem enviado." O `loja/textos.test.ts` passa a exigir exatamente `['local:botai_favoritos', 'local:botai_pessoa']` e nada em `sync:`.
- **Versão** do `package.json` não muda aqui.

## Decisões da implementação (fora do contrato)

- **"Justificativa: contextMenus"** ganhou o item novo ("Preencher com › <apelido>", que só aparece com favoritos): o `loja/textos.test.ts` já exigia que ela citasse todo `title` literal de `menus.ts`. Nenhum outro título de menu mudou.
- **Notas para os revisores** (`loja/notas-revisores.md`, AMO) e o `SOURCE-CODE-REVIEW.md` passam a dizer que o `storage.local` guarda a ativa e até 3 favoritas.
- **Desfazer não tira ninguém em silêncio.** Se, nos 5 s, a mesma pessoa voltou por outro caminho (guardada de novo) ou os 3 lugares foram ocupados, o Desfazer não faz nada. A demo cortava a lista em 3 e perdia o último.
- **O menu é refeito por inteiro** a cada mudança dos favoritos, e não só o submenu: o `contextMenus` não tem posição de inserção, e um "Preencher com" recriado sozinho iria para o fim do menu. As recriações rodam em série, porque duas intercaladas fariam o Chrome recusar ids repetidos.
- **Posição do "Preencher com":** logo depois de "Preencher esta página", antes do primeiro separador (como no 2f).
- **A faixa aparece sempre no 1b**, com "0/3" e só o "Guardar esta" quando não há favorito (a demo faz o mesmo; o texto "Nenhum ainda…" dela nunca aparece).
- **O rodapé continua "preenche sem abrir".** A demo mostra "preenche com a ativa"; mudar o rodapé muda também o 1d, as capturas das lojas e os testes de hoje, e não estava no contrato. Fica para o dono decidir.
- **Esc** na edição do apelido leva `preventDefault`: o Chrome fecha o popup com o Esc que a página não trata.
- **Estrela em SVG próprio:** o pacote só tem o `free-solid` do Font Awesome, sem a estrela vazada; o lápis e o "+" são do Font Awesome.
- **`iniciais`** saiu do `pessoa-pronta.tsx` para o `cabecalho-pessoa.tsx`, que agora desenha o avatar e é importado também pela faixa.

## Fluxos

1. **Guardar:** estrela (ou "Guardar esta") → `guardarFavorito(ativa)` grava no fim da lista com o primeiro nome → a edição abre com o texto selecionado → Enter salva o apelido (`renomearFavorito`), Esc mantém o primeiro nome.
2. **Renomear:** lápis → edição com o apelido atual → Enter / Salvar.
3. **Trocar a ativa:** chip → `usarFavorito(id)` grava a pessoa do favorito em `local:botai_pessoa`; o popup acompanha pelo `watch`, e o chip fica pressionado.
4. **Preencher com um favorito pelo menu:** `Botaí › Preencher com › <apelido> · <primeiro nome>` → `usarFavorito` + `preencherPagina` no background (o aviso na página é o de sempre). Item de um favorito que já saiu não faz nada.
5. **Tirar e desfazer:** estrela da ativa favorita → `tirarFavorito(id)` → aviso por 5 s → "Desfazer" → `devolverFavorito` na mesma posição.
6. **Nova pessoa:** troca a ativa; a estrela volta a "Guardar nos favoritos" (ou ao limite).

## Testes

- **Vitest:** `lib/favoritos.test.ts` (regras puras), `lib/armazenamento.test.ts` (chave, ids, limite, desfazer, renomear, usar, "Nova pessoa" não mexe), `lib/menus.test.ts` (submenu, ordem, títulos, contextos, `'password'` no Firefox), `background/ouvintes.test.ts` ("Preencher com" troca a ativa e preenche; menu velho não faz nada; recriações em série), `background/background.test.ts` (o `watch` refaz o menu), os componentes novos (`cabecalho-pessoa`, `faixa-favoritos`, `favorito-removido`, `use-desfazer`), `pessoa-pronta.test.tsx` e `App.test.tsx` (fluxos com o storage falso) e `loja/textos.test.ts` (as duas chaves e os textos com o `LIMITE_FAVORITOS`).
- **Storybook:** `Popup/1b · Pessoa pronta` ganha AtivaFavorita, NovaPessoaNaoGuardada, GuardandoComApelido, LimiteDeTres e TirouComDesfazer, cada uma no escuro e no claro (as duas de clique chegam ao estado por `play`); e os componentes novos têm stories próprias nos dois temas.
- **Playwright** (extensão desempacotada): `popup/favoritos.e2e.ts` (guardar com apelido, trocar a ativa pelo chip e preencher com a favorita; tirar e desfazer) e `background/menus.e2e.ts` (o submenu nasce, acompanha e some com a lista no storage). O clique no menu nativo fica nos testes dos ouvintes, porque o Playwright não o aciona.

## Release 1.1.0 (passo seguinte, fora deste PR)

1. Com este PR e o #33 na `main`: `make versao-botai V=1.1.0`, merge do PR de versão e `make release-botai` (ver "Publicação" em `extensao/CLAUDE.md`).
2. Antes de enviar às lojas, `make capturas-botai` no Mac: as capturas "pessoa de teste" (03 e 04, e a 01 do Opera) passam a mostrar a faixa de favoritos. O comando também copia as capturas para `site/`, por isso não rodou neste PR.
3. Nos painéis das lojas, colar os textos novos de `loja/textos.md`: Descrição, "Justificativa: storage" e "Justificativa: contextMenus". A aba de privacidade da Chrome e do Edge não muda ("Website content" só); na AMO, a nota do revisor nova.
4. Checklist manual (Chrome e Firefox) com os itens novos do "Preencher com".

## O que muda no site (PR #33)

A política de privacidade (`site/app/privacidade/page.tsx`) passa a dizer que a extensão guarda no `storage.local` a pessoa ativa (`botai_pessoa`) e até 3 favoritas (`botai_favoritos`), e cita o item "Preencher com" do menu; o `page.test.tsx` exige que todo `title` literal de `extensao/src/lib/menus.ts` apareça na política. A landing e a documentação descrevem os favoritos. Os dois PRs entram juntos.
