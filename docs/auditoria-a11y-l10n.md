# Auditoria de acessibilidade e localização do Botaí

Auditoria do Botaí contra a skill `padroes-produto-pilutech` (decisão do Paulo em 12/11/2026): acessibilidade no nível WCAG 2.2 AA, localização em pt-BR, inglês e espanhol, e `llms.txt` nos sites. Este documento só registra o que foi achado. Nada foi corrigido: as correções viram PRs pequenos, na ordem que o Pilutech Maestro combinar.

- **Quando:** 12 e 13/11/2026.
- **O quê:** a `main` em `78a51db`, a mesma que está em produção no site e na documentação, com o `@pilutech/botai-core` 0.5.0.
- **Superfícies:** a extensão (popup, aviso na página, contornos dos campos, atalho e menus), o site (`/`, `/privacidade`, `/termos` e a 404), a documentação (as 81 páginas do sitemap e a 404) com o `llms.txt` dos dois sites, a localização do produto inteiro (extensão, site, documentação, lojas e CLI) e os pacotes (CLI `botai`, `botai serve`, biblioteca, motor `/navegador` e o plugin do Playwright).

## Como foi medido

Cada superfície teve um auditor e, menos os pacotes, um verificador independente. O verificador tentou refutar cada achado crítico, alto ou médio medindo de novo por outro caminho (outro navegador, outro método, outro estado), ajustou severidade e esforço pelas definições abaixo, contestou o que não se sustentava no "já cumpre" e procurou o que tinha ficado de fora. Nenhum achado foi refutado. Cinco severidades mudaram (três altas viraram médias e duas médias viraram altas), outras 25 medições, lugares e correções foram completados, e 2 itens saíram de "não verificado" para "já cumpre". Os verificadores trouxeram 15 achados novos, e 1 (EXT-22) entrou na consolidação.

- **Contraste:** razão do WCAG calculada pela cor computada contra o fundo composto dos ancestrais (com transparência e `oklab`), nos dois temas. Ícones, anéis de foco e estados passageiros, pelos pixels de capturas em 2x e 3x. O axe sozinho não basta: deu zero violações com um texto a 4,39:1 (EXT-06).
- **Alvos:** o retângulo (`getBoundingClientRect`) de todo elemento interativo a 1280 e 320 px (o popup a 380), com a exceção de espaçamento do critério 2.5.8 medida por círculos de 24 px.
- **Foco:** Tab e Shift+Tab em todas as paradas, o indicador comparado pixel a pixel com e sem foco, a cobertura por `elementFromPoint` em 9 pontos e o modo de cores forçadas (`forced-colors: active`).
- **Movimento:** `prefers-reduced-motion: reduce` emulado, com a rolagem amostrada quadro a quadro.
- **Zoom e fonte:** viewport equivalente a 200% e 400%, o tamanho de fonte padrão do Chrome em 16, 24 e 32 px (pelas preferências do perfil, como a pessoa ajusta) e o espaçamento de texto do critério 1.4.12.
- **axe-core 4.14.0**, com as tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` e `best-practice`.
- **Localização:** extrator de textos pela API do TypeScript, `Intl` do Node 26 (ICU 78.3), pseudolocalização com palavras 35% maiores e o navegador aberto em `--lang=en` e `--lang=es`.
- **Produção:** só GET (`llms.txt`, `llms-full.txt`, `robots.txt`, `sitemap.xml` e o HTML servido). Nenhum formulário enviado, nenhuma cota gasta.
- **Navegadores:** o Chromium 1248 do Playwright 1.64.1 e, depois que a pasta `~/Library/Caches/ms-playwright` sumiu da máquina no meio da auditoria, o Google Chrome 157 instalado. Nenhum leitor de tela real (VoiceOver, NVDA): ver "O que não foi verificado".

Os nomes de script e de arquivo de saída citados nas medições (`foco.mjs`, `popup.json` e outros) são da auditoria e ficaram fora do repositório. Para medir de novo depois de corrigir, o caminho é o teste que cada PR de correção traz.

## Severidade e esforço

- **Crítica:** impede alguém de usar (teclado preso, controle essencial sem nome, conteúdo que some para o leitor de tela, nada funciona sem mouse).
- **Alta:** falha clara de um critério WCAG 2.2 AA, medida (contraste de texto abaixo de 4,5:1, ou de texto grande, ícone que informa ou borda de controle abaixo de 3:1, foco invisível, alvo menor que 24×24, animação que não respeita reduzir movimento, informação só por cor), ou regra obrigatória da skill totalmente ausente (por exemplo, produto só em pt-BR).
- **Média:** dentro do mínimo do WCAG, mas fora do padrão PiluTech (alvo entre 24 e 43 px, texto fixo no código onde a skill pede catálogo, data ou número montado à mão), ou falha parcial.
- **Baixa:** melhoria, risco latente ou inconsistência sem impacto medido.

Esforço: **P** até 1 h, **M** até meio dia, **G** de 1 a 3 dias, **GG** mais de 3 dias.

## Resumo

91 achados, nenhum crítico: 26 altos, 30 médios e 35 baixos. Os repetidos entre superfícies contam uma vez só, no achado principal.

| Superfície                            |   Alta |  Média |  Baixa |  Total |
| ------------------------------------- | -----: | -----: | -----: | -----: |
| Extensão                              |      7 |      9 |      9 |     25 |
| Site                                  |      2 |      6 |      8 |     16 |
| Documentação e llms.txt               |      9 |      6 |      8 |     23 |
| Localização (produto inteiro)         |      5 |      6 |      6 |     17 |
| Pacotes (core e plugin do Playwright) |      3 |      3 |      4 |     10 |
| **Total**                             | **26** | **30** | **35** | **91** |

Os pontos que mais pesam:

- **Localização é o grosso do trabalho.** O produto inteiro só existe em pt-BR: a extensão não tem `_locales` nem catálogo (LOC-01), o site não tem `/en/` e `/es/` (LOC-02), a documentação tem cerca de 35,7 mil palavras de prosa só em pt-BR (LOC-03), as fichas das lojas também (LOC-04), e a CLI, o servidor e o plugin respondem em pt-BR em qualquer idioma (PAC-01).
- **Extensão:** depois de Preencher, o resultado não é anunciado e o foco cai no `body` (EXT-01). O aviso na página some em 4 s, só pausa com o mouse e fica a 26 Tabs de distância (EXT-02). Os contornos dos campos ficam abaixo de 3:1 em página clara (PAC-03), quatro textos do tema claro ficam abaixo de 4,5:1 (EXT-06) e alguns estados aparecem só pela cor (EXT-07).
- **Site:** o foco dos botões primários não aparece, porque o anel tem 1 px e a cor do próprio botão (SITE-01), e a 404 é a padrão do Next, em inglês (SITE-V01).
- **Documentação:** o realce de código fica abaixo de 4,5:1 (DOC-01), os links no meio do texto se distinguem só pela cor (DOC-02), o foco fica embaixo da navbar fixa (DOC-03) e o menu mobile não cuida do foco (DOC-04).
- **Testes:** a documentação e a extensão não têm nenhum teste automatizado de acessibilidade (DOC-07 e EXT-22), e o do site cobre só parte do que a skill pede (SITE-08).
- **`llms.txt`:** os dois sites cumprem. Na documentação falta citar o `llms-full.txt` no `robots.txt` e no sitemap e conferir os links externos (DOC-20). Os links para en e es chegam com a localização.
- **Já cumpre** (lista completa no fim): nenhum achado crítico, axe sem violação séria na maior parte dos estados, contraste de texto do tema escuro na extensão e no site, ordem de foco sem armadilha nas três interfaces, nomes acessíveis, `lang="pt-BR"`, zoom de 200% e 400% no site, atalho da extensão configurável e documentado, e a data dos dados com fuso explícito.

## Ordem sugerida dos PRs

Proposta para combinar com o Pilutech Maestro. Cada PR é pequeno, segue o TDD do repositório (o teste que reproduz a falha vem antes da correção) e informa a linha "A11y/l10n". Texto público novo (a 404 do site, as traduções, as fichas das lojas, a política de privacidade e o `PRODUTO.md`) precisa do OK do Paulo antes do merge.

**Fase 1: travas e falhas altas de acessibilidade**

1. **Testes de acessibilidade de base** (EXT-22, SITE-08, DOC-07): axe com `wcag22aa`, teclado, cores forçadas e ariaSnapshot na extensão, no site e na documentação. As falhas conhecidas entram como exceção com o id deste relatório, e cada correção tira a sua. Assim nenhum PR piora o que já foi medido. Um PR por superfície, M cada.
2. **Aviso na página** (EXT-02, EXT-03, EXT-15, EXT-V02, LOC-05): pausa com o foco dentro, sem fechar sozinho quando há ação, Esc, foco visível no "não reconhecidos", `lang` no aviso e erros que dizem como resolver. M.
3. **Contornos do motor** (PAC-03, PAC-04): cores com pelo menos 3:1 em fundo claro e escuro, e o piscar respeitando reduzir movimento. Muda o `@pilutech/botai-core` (a extensão e o plugin do Playwright o usam pelo workspace) e o texto da documentação que descreve as cores. P a M.
4. **Popup: foco e anúncios** (EXT-01, EXT-04, EXT-11, EXT-14, EXT-18, EXT-V01): foco no `h1` da tela nova, nada encoberto pela barra de filtros, foco que não cai no `body`, Desfazer com pausa e mensagem na página de erro do navegador. M.
5. **Popup: contraste e cor** (EXT-05, EXT-06, EXT-07, EXT-V03, EXT-V06): os quatro textos do tema claro, estado com ícone ou forma além da cor, e foco e estado no alto contraste. M.
6. **Site: foco e 404** (SITE-01, SITE-02, SITE-12, SITE-V01): anel de 2 px com folga nos botões primários, `outline-hidden` no lugar de `outline-none`, e uma 404 em pt-BR com `main` e link de volta. P a M. O anel de 1 px vem do `Button` do `@piluvitu/ui`: o site corrige aqui, e a mesma troca no design system fica para o monorepo `PiluVitu-Dev`.
7. **Documentação: contraste e cor** (DOC-01, DOC-02, DOC-05, DOC-09, DOC-10): realce de código, links sublinhados, Fechar do menu mobile, item ativo com forma, e os botões dos blocos de código. M.
8. **Documentação: foco, movimento e estado** (DOC-03, DOC-06, DOC-19, DOC-V01, DOC-V04): `scroll-padding-top` da altura da navbar, "Voltar para o topo" sem animação com reduzir movimento, estilo de foco próprio, `aria-expanded` e `aria-pressed`. M.
9. **Documentação: menu mobile** (DOC-04): o foco fica no painel enquanto ele está aberto, Esc fecha e o foco volta ao botão. M.

**Fase 2: médias e baixas de acessibilidade**

10. **Alvos de 44 px**, um PR por superfície: extensão (EXT-09, EXT-10; G, revendo a densidade do popup com o desenho aprovado), site (SITE-03, SITE-04, SITE-10; M) e documentação (DOC-12; M).
11. **Texto que cresce com a fonte do navegador**, um PR por superfície: extensão (EXT-12, EXT-19, LOC-09, LOC-V03; M), site (SITE-05, SITE-06, LOC-V02; M) e documentação (DOC-13; P).
12. **O resto, por superfície:** extensão (EXT-16, EXT-17, EXT-21, EXT-V04, EXT-V05), site (SITE-11, SITE-13, SITE-14, SITE-15, SITE-V02), documentação (DOC-08, DOC-11, DOC-14, DOC-15, DOC-16, DOC-17, DOC-18, DOC-20, DOC-V03), o "Powered by" nos três (LOC-11) e a CLI e o motor (PAC-05, PAC-06, PAC-07, PAC-10). P a M cada. O SITE-09 (borda dos controles a 1,27:1) é decisão do design system.

**Fase 3: localização** (na ordem proposta pelo auditor de localização)

13. **Extensão, infraestrutura sem mudança visível** (LOC-01, LOC-06, LOC-07, LOC-12, LOC-14, PAC-02): catálogo pt-BR com chaves estáveis, `t()` com `Intl.PluralRules` e `Intl.NumberFormat`, `_locales/pt_BR` com `default_locale` e o nome e a descrição por `__MSG_`, teste que falha se faltar chave, `recusado` como dado e não como sufixo de texto, e os E2E com o idioma fixo. G.
14. **Extensão em inglês**, com `_locales/en` e um E2E de fumaça com o navegador em inglês. M.
15. **Extensão em espanhol**, do mesmo jeito. M.
16. **Troca manual de idioma no popup** (LOC-13), com a política de privacidade e a vigência no mesmo PR. M.
17. **Lojas em en e es** (LOC-04, LOC-08, LOC-15): fichas, capturas sem texto embutido ou uma por idioma, e o link da AMO sem `/pt-BR/`. M, mais as imagens (M).
18. **Site, infraestrutura** (LOC-02 e o resto do LOC-06): rotas `/`, `/en/` e `/es/`, `hreflang`, `og:locale`, sitemap com alternates, seletor de idioma, catálogo e `Intl` em números e datas. G.
19. **Landing em inglês**. M.
20. **Landing em espanhol**. M.
21. **Privacidade e termos em en e es**, com o OK do Paulo no texto jurídico. G.
22. **`llms.txt` com links para `/en/` e `/es/`** nos dois sites (o resto do DOC-20). P.
23. **Documentação, infraestrutura de i18n** (LOC-03): configuração, tema, barra e rodapé, com teste de paridade de páginas por idioma. M.
24. **Documentação em inglês**. GG.
25. **Documentação em espanhol**. GG.
26. **CLI, servidor e plugin** (PAC-01, PAC-08, PAC-09): catálogo, idioma do sistema e o classificador reconhecendo rótulos em espanhol. G.
27. **`PRODUTO.md` e READMEs** (LOC-16), depois que o resto existir nos três idiomas.

Ordem de grandeza: a Fase 1 leva cerca de uma semana, a Fase 2 outra, e a Fase 3 algumas semanas, quase tudo na tradução da documentação.

## Extensão

Popup (telas 1a a 1e, com favoritos e cartão), aviso na página (1f), contornos dos campos, atalho e menus. Medido no popup real (o build e2e no Chromium, a 380×600, preenchendo uma página de cadastro de teste) e nas 125 stories, cada uma nos dois temas.

| ID      | Achado                                                                                                     | Severidade | Esforço |
| ------- | ---------------------------------------------------------------------------------------------------------- | ---------- | ------- |
| EXT-01  | Resultado do Preencher e troca de tela não são anunciados, e o foco cai no body                            | alta       | M       |
| EXT-02  | Aviso na página some em 4 s e só pausa com o mouse em cima                                                 | alta       | M       |
| EXT-03  | Botão "2 não reconhecidos" do aviso sem indicador de foco                                                  | alta       | P       |
| EXT-04  | Foco fica escondido atrás da barra fixa de filtros (Shift+Tab no 1b)                                       | alta       | P       |
| EXT-06  | Contraste de texto abaixo de 4,5:1 no tema claro em 4 lugares                                              | alta       | P       |
| EXT-07  | Estado e ação mostrados só pela cor (chips escolhidos, pílula do host, "2 não reconhecidos")               | alta       | M       |
| EXT-22  | A extensão não tem teste automatizado de acessibilidade (axe, teclado, ariaSnapshot)                       | alta       | M       |
| EXT-05  | Foco invisível em alto contraste (forced colors) em 48 das 52 paradas do 1b                                | média      | P       |
| EXT-09  | Alvos menores que 24 px (crédito, rodapé, Renomear, Guardar esta, links e botões do aviso)                 | média      | M       |
| EXT-10  | Quase nenhum controle do popup chega a 44 px                                                               | média      | G       |
| EXT-11  | Foco vai para o body depois de salvar ou cancelar o apelido e depois do Desfazer                           | média      | P       |
| EXT-12  | Texto em px fixo não acompanha o tamanho de fonte do navegador                                             | média      | M       |
| EXT-14  | Aviso "saiu dos favoritos" com Desfazer some em 5 s e não pausa                                            | média      | P       |
| EXT-V01 | Preencher numa página de erro do navegador não faz nada e não diz nada                                     | média      | P       |
| EXT-V02 | Os avisos de erro na página dizem o que houve, mas não como resolver                                       | média      | P       |
| EXT-V03 | Em alto contraste, o estado escolhido dos chips de filtro e do provedor some, e a bolinha da pílula também | média      | M       |
| EXT-15  | Região role=status do aviso já nasce com o texto (risco de não ser anunciada)                              | baixa      | P       |
| EXT-16  | "copiado" anuncia de novo o rótulo quando volta, sem ação da pessoa (24 regiões vivas)                     | baixa      | P       |
| EXT-17  | Estrela troca rótulo e estado juntos, e a barra de filtros não tem nome de grupo                           | baixa      | P       |
| EXT-18  | Sem h1 enquanto o apelido é editado                                                                        | baixa      | P       |
| EXT-19  | Largura fixa de 380 px rola na horizontal acima de 200%                                                    | baixa      | P       |
| EXT-21  | Nomes com símbolos (⌥⇧P, →) e abertura de aba nova sem aviso no nome                                       | baixa      | P       |
| EXT-V04 | Host comprido fica cortado na pílula, e o host inteiro só aparece no title, com o mouse                    | baixa      | P       |
| EXT-V05 | As iniciais do avatar são lidas antes do nome                                                              | baixa      | P       |
| EXT-V06 | "abrir caixa →" no meio da frase só se distingue do texto pela cor                                         | baixa      | P       |

Repetidos, tratados no achado principal: EXT-08 → PAC-03, EXT-13 → LOC-05, EXT-20 → PAC-04.

### EXT-01 · Resultado do Preencher e troca de tela não são anunciados, e o foco cai no body

- **Severidade:** alta · **Esforço:** M
- **Critério:** WCAG 4.1.3 Mensagens de status (AA) e 2.4.3 Ordem do foco (A). Skill: "Erros … são anunciados" e "anúncios polite só quando a pessoa age".
- **Onde:** extensao/src/entrypoints/popup/App.tsx:244-250: o &lt;div key={estado.tela…}> remonta a tela inteira. Os botões que somem ao serem usados são "Gerar pessoa" (primeiro-uso.tsx:37-44), "Preencher esta página" (pessoa-pronta.tsx:181-194) e "Ver os dados" (nenhum-campo.tsx:77-84, resultado-preenchimento.tsx:145-152, pagina-proibida.tsx:107-114). "Tentar de novo" (nenhum-campo.tsx:68-76) e "Nova pessoa" mudam a tela sem anunciar nada. Popup real, 380 px, nos dois temas.
- **Medição:** No popup real, pus o foco no botão e apertei Enter. 600 ms depois li o document.activeElement, e um MutationObserver registrou as mudanças dentro de \[aria-live], \[role=status] e \[role=alert]. Enter em "Preencher esta página": o h1 vira "21 de 23 campos preenchidos", o foco vai para o BODY, o h1 não está em região viva e não houve nenhuma mudança anunciada. O mesmo acontece em "Gerar pessoa", em "Ver os dados" (2 vezes) e no Preencher que cai no 1d ("Nenhum campo reconhecido nesta página"): foco no BODY e nenhum anúncio. Em "Tentar de novo" o foco fica no botão e nada é anunciado, então a pessoa não sabe se a tentativa aconteceu. Em "Nova pessoa" o h1 muda de nome sem anúncio.
- **Como corrigir:** Ao trocar de tela, mover o foco para o h1 da tela nova: h1 com tabIndex={-1} e ref, focado num useEffect quando estado.tela muda, para o leitor ler "21 de 23 campos preenchidos" ou "O Chrome não deixa…". Outra saída é uma região role="status" fixa no PopupShell, sempre montada e vazia, que recebe o texto de cada ação: o resultado do preenchimento, "Nova pessoa: &lt;nome>" e o resultado do "Tentar de novo". Testes: Vitest no App.test.tsx (o h1 com foco depois do Preencher) e um E2E com o mesmo roteiro.
- **Verificação:** confirmado pelo verificador independente.
  - Verificador: No Chrome 157, o foco foi para o BODY depois do Enter em Gerar pessoa, em Preencher (h1 '21 de 23 campos preenchidos', nenhuma região viva na tela 1c pela árvore de acessibilidade do CDP) e em Ver os dados. Em Nova pessoa o foco fica no botão (:focus-visible) e o h1 troca de 'Larissa Conceição Mendes' para 'Caio Ferreira Moreira' sem nenhuma região viva (v4.json '01-novapessoa-dom').

### EXT-02 · Aviso na página some em 4 s e só pausa com o mouse em cima

- **Severidade:** alta · **Esforço:** M
- **Critério:** WCAG 2.2.1 Ajustável por tempo (A), com efeito em 2.1.1 Teclado (A). Skill: "Conteúdo que troca sozinho (toast) tem pausa".
- **Onde:** extensao/src/entrypoints/preencher.content/aviso.css:103-111: barra de 4 s que só pausa em .botai-toast:hover. aviso.css:131-135: com reduzir movimento a barra vira steps(1) e o aviso some igual. aviso-dom.ts:109-110: o animationend chama onFechar. aviso.ts:11-22: o host é anexado no fim do &lt;html> do site. Vale em página clara e escura.
- **Medição:** Popup real preenchendo http://teste.local/cadastro. (a) Com o foco no Fechar do aviso, o aviso sumiu antes de 5 s (avisoComFocoDentroApos5s = 0). (b) Com o mouse em cima ele pausou e continuava lá depois de 5 s; tirando o mouse, sumiu em 4,5 s. (c) Pelo teclado, a página leva 26 Tabs até o aviso, que é o último filho do &lt;html>: impossível em 4 s. (d) Com prefers-reduced-motion: reduce a barra continua sendo botai-tempo, steps(1), 4 s, e o aviso some do mesmo jeito. Quem usa teclado não alcança o "2 não reconhecidos" (que leva ao campo) nem o Fechar. Depois do atalho, o popup reaberto volta ao 1b, então não há outro caminho para o "Mostrar na página".
- **Como corrigir:** Pausar também com o foco dentro: `.botai-toast:focus-within .botai-barra { animation-play-state: paused }`. Quando o aviso tem a linha 2 com ação (não reconhecidos), não fechar sozinho: fechar no Fechar, no Esc ou na primeira interação com a página, como os contornos já fazem. Manter os 4 s só no aviso sem ação. Esc fecha o aviso. Testes: aviso-dom.test.ts (sem barra quando há ação) e um E2E (com o foco dentro, o aviso continua na tela).
- **Verificação:** confirmado pelo verificador independente.
  - Também em: o aviso de erro (role=alert: 'Nenhum campo nesta página' e os textos de avisoFalhaInserir, criados em background/acoes.ts:102-110 e 118-134) usa a mesma barra de 4 s e some do mesmo jeito. E preencher.content/api.ts:78 (aoSair: () => contornos.limpar()) apaga os contornos junto com o aviso.
  - Verificador: Remedido por outro caminho: Chrome 157 estável com a extensão carregada pelo CDP Extensions.loadUnpacked, e um MutationObserver no &lt;html> marcando a entrada e a saída do host botai-aviso. Sem mouse, o aviso saiu em 4045 ms. Com o foco no Fechar (:focus-within verdadeiro, animação botai-tempo em 'running'), saiu em 4007 ms. Com o mouse em cima, continuava lá aos 6 s e saiu 3895 ms depois de o mouse sair. Com reduce, saiu em 4025 ms (barra em steps(1), 4s). Há 25 elementos tabuláveis antes do host, então o aviso é a 26ª parada do Tab. Novo: os 23 contornos (21 sólidos e 2 tracejados) somem junto com o aviso: eram 23 em 1 s e 0 depois da saída. Ou seja, a pista 'contorno tracejado' que o aviso cita também dura só 4 s. O aviso de erro role=alert ('Nenhum campo nesta página') saiu em 4024 ms.

### EXT-03 · Botão "2 não reconhecidos" do aviso sem indicador de foco

- **Severidade:** alta · **Esforço:** P
- **Critério:** WCAG 2.4.7 Foco visível (AA).
- **Onde:** extensao/src/entrypoints/preencher.content/aviso.css:90-94: o `.botai-warn { all: unset; … }` apaga o outline do navegador. O botão é criado em aviso-dom.ts:73-76. Vale em página clara e escura e também em alto contraste.
- **Medição:** No aviso real, Tab do Fechar para o "2 não reconhecidos": nenhum indicador nos dois temas. Comparado ao estado sem foco, não aparece outline nem box-shadow e não mudam fundo, borda ou sublinhado. Nas stories do aviso, no Chrome 157, o resultado é o mesmo com e sem forced-colors. Para comparar: o Fechar mostra o anel automático do navegador, rgb(0, 95, 204), com 5,98:1 no claro.
- **Como corrigir:** Somar no aviso.css `.botai-warn:focus-visible { outline: 2px solid var(--botai-warn); outline-offset: 2px; border-radius: 4px; text-decoration: underline; }`. O `all: unset` continua valendo para o resto. Teste: um E2E que foca o botão pelo teclado e confere outline-style diferente de none.
- **Verificação:** confirmado pelo verificador independente.
  - Verificador: Comparei por pixels o recorte do .botai-warn com o foco vindo do teclado (:focus-visible verdadeiro) e o recorte sem foco: 0 de 3380 pixels diferentes no claro, no escuro e com e sem forced colors (as 4 combinações). Para comparar, o Fechar muda 168 de 900 pixels no claro e 260 de 900 no escuro. Imagens em saida/warn-\*-foco.png e warn-\*-semfoco.png.

### EXT-04 · Foco fica escondido atrás da barra fixa de filtros (Shift+Tab no 1b)

- **Severidade:** alta · **Esforço:** P
- **Critério:** WCAG 2.4.11 Foco não encoberto (mínimo) (AA).
- **Onde:** extensao/src/components/filtro-chips.tsx:13: barra `sticky top-0 z-10` dentro do &lt;main className="… overflow-y-auto"> de popup-shell.tsx:31. Afeta os botões Copiar do 1b em 380×600; o layout é o mesmo nos dois temas.
- **Medição:** Percorri o 1b de trás para a frente com Shift+Tab. Em cada parada usei elementFromPoint no centro e em 4 pontos internos (30% e 70%) do elemento com foco. Em 5 paradas nenhum dos 5 pontos ficou visível, todas cobertas por div.bg-background.sticky.top-0.z-10, a barra "Tudo/Pessoais/…": Copiar CNPJ (topo em 52 px), Copiar Bairro (83), Copiar Complemento (47), Copiar E-mail (47) e Copiar Nome (86). Indo para trás, o Chrome rola o foco até a borda de cima da área de rolagem, e é ali que a barra fica (2 linhas de chips, uns 80 px). Com Tab para a frente, a 100% e a 200%, nenhuma parada ficou coberta.
- **Como corrigir:** Pôr `scroll-padding-top` no main com a altura da barra, medida por ResizeObserver porque ela quebra em 1 ou 2 linhas, ou `scroll-margin-top` equivalente nas linhas copiáveis. Teste: um E2E que percorre o 1b com Shift+Tab e confere elementFromPoint no centro do foco.
- **Verificação:** confirmado pelo verificador independente.
  - Verificador: v3.json '04-shift-tab'. As 5 paradas (Copiar CNPJ, Bairro, Complemento, E-mail e Nome) ficam com o retângulo inteiro dentro do retângulo da barra fixa (y de 47 a 126) e com 0 de 9 pontos visíveis por elementFromPoint. Em 50 paradas para a frente, nenhuma ficou escondida.

### EXT-06 · Contraste de texto abaixo de 4,5:1 no tema claro em 4 lugares

- **Severidade:** alta · **Esforço:** P
- **Critério:** WCAG 1.4.3 Contraste mínimo (AA).
- **Onde:** Todos no tema claro: (1) "Caixa pública." em pessoa-pronta.tsx:73, text-warn sobre bg-warn/\[0.08] no grupo E-mail do 1b. (2) Chip de cenário escolhido do tipo erro ("recusado", "erro de processamento" e afins), cartao-das-proximas.tsx:79-81 com selo-do-cenario.tsx:19, text-destructive sobre bg-muted. (3) "copiado" em linha-copiavel.tsx:20 e 25-27, text-ok sobre bg-ok/10. (4) O atalho ⌥⇧P no botão Preencher com o mouse em cima, pessoa-pronta.tsx:190: branco sobre bg-primary-foreground/\[0.14] por cima do hover:bg-primary/90 do Button. No tema escuro nenhum par ficou abaixo de 6,27:1.
- **Medição:** Razão WCAG da cor computada do texto contra o fundo composto pelos ancestrais, com alfa. (1) #986206 sobre #efede8: 4,40:1, 12 px, peso 600. (2) #dd1313 sobre #edf1f8: 4,44:1, 11 px, peso 600; o axe dá 4,43. (3) #1b7957 sobre #e1eceb: 4,45:1, 11 px, peso 600; o axe dá 4,43. (4) #ffffff sobre #3d809c: 4,43:1, 10,5 px, peso 500, só com o mouse em cima (o axe dá 4,4); sem hover dá 5,37:1. Medido no popup real e nas 206 combinações de story e tema.
- **Como corrigir:** Mexer só no tema claro: (1) fundo bg-warn/\[0.05], ou o "Caixa pública." em text-foreground com o ícone âmbar. (2) Chip escolhido de erro sobre bg-card ou transparente, ou token --destructive mais escuro só no claro (0 84% 42%). (3) bg-ok/\[0.06], ou "copiado" em text-foreground. (4) kbd com bg-black/20, ou tirar o hover:bg-primary/90 do botão lg. Teste: axe (color-contrast) num E2E sobre as stories do 1b no claro.
- **Verificação:** confirmado pelo verificador independente.
  - Verificador: pelos tokens-fonte, sem navegador (tokens.mjs → saida/tokens.txt): 4,405, 4,438, 4,442 e 4,406 (kbd no hover). Pela minha varredura no Chrome 157 (v4.json), com o fundo composto e o parse de oklab: Caixa pública. 4,39, recusado 4,44, copiado 4,44 e ⌥⇧P no hover 4,41. No escuro o menor par foi 6,27. Ressalva: o axe 4.14 deu 0 violações no 1b claro do popup real mesmo com a 'Caixa pública.' a 4,39:1.

### EXT-07 · Estado e ação mostrados só pela cor (chips escolhidos, pílula do host, "2 não reconhecidos")

- **Severidade:** alta · **Esforço:** M
- **Critério:** WCAG 1.4.1 Uso de cor (A). Skill: "Nada depende só de cor: estado também tem forma, ícone ou texto".
- **Onde:** (a) Chip de filtro escolhido: filtro-chips.tsx:24-27, popup 1b. (b) Chip de cenário escolhido: cartao-das-proximas.tsx:79-81. (c) Bolinha ok/warn da pílula: pilula-host.tsx:24-30, no cabeçalho de todas as telas; no 1b depois de um preenchimento com X = 0, ela é a única pista. (d) "2 não reconhecidos" no aviso: aviso.css:90-98, uma ação sem sublinhado.
- **Medição:** Razão WCAG entre o estado escolhido e o não escolhido. (a) Claro: texto #055b80 contra #495769 = 1,01:1, fundo #def1fb contra #f7f9fc = 1,10:1, borda 1,01:1, os dois com peso 500. Escuro: 1,26, 1,21 e 1,29. (b) Claro: texto 1,37:1 e fundo 1,13:1. Escuro: 1,38 e 1,07. Só o peso muda, de 500 para 600. (c) Bolinha de 6×6 px verde #1b7957 contra âmbar #986206, mesmo formato. O span não tem texto e o title da pílula é só o host, então o estado warn (preenchimento com 0 campos) também não chega ao leitor de tela. (d) Âmbar contra o cinza do texto ao lado: 1,43:1 no claro e 1,56:1 no escuro; o sublinhado só aparece no hover. Nos chips o aria-pressed já informa o leitor de tela: a falha é visual.
- **Como corrigir:** (a) e (b): no chip escolhido, ícone de check ou fundo cheio (bg-primary text-primary-foreground, como no provedor, que dá 7,07:1 contra o fundo). (c) Ícone com formato por estado, como o cadeado já faz (check, triângulo), mais texto sr-only: "página preenchida", "nenhum campo reconhecido", "página bloqueada". (d) Sublinhado sempre no .botai-warn. Testes: Vitest dos componentes (ícone presente no escolhido) e stories novas.
- **Verificação:** confirmado pelo verificador independente.
  - Verificador: (b) é falha parcial. Além da cor, o peso muda de 500 para 600 e a borda ganha a cor do tipo. Estilo computado do escolhido: 'rgb(27,121,87)|rgb(237,241,248)|borda ok/45|600'; do solto: 'rgb(73,87,105)|transparente|rgb(215,223,234)|500'. É uma pista fraca a 11 px. (c) remedido: preenchi /interno (0 de 3 campos) e cliquei em 'Ver os dados'. No 1b, a bolinha fica rgb(152,98,6), a pílula tem só title='teste.local' e nenhum aria-label, e nenhum texto do main fala do estado. Razões calculadas pelos tokens-fonte (styles.css do @piluvitu/ui), sem navegador: chip, texto 1,013 no claro e 1,258 no escuro, fundo 1,100 e 1,209, borda 1,011 e 1,291; bolinha ok × warn 1,042 no claro e 1,134 no escuro; aviso, '2 não reconhecidos' × texto ao lado 1,433 e 1,563.

### EXT-22 · A extensão não tem teste automatizado de acessibilidade (axe, teclado, ariaSnapshot)

- **Severidade:** alta · **Esforço:** M
- **Critério:** Skill, Web e Extensão de navegador: "@axe-core/playwright nas páginas principais (zero violações sérias/críticas), teste de teclado (Tab/Enter/Espaço/Esc/setas) e ariaSnapshot nos componentes ricos".
- **Onde:** extensao/src/\*\*/\*.e2e.ts (9 arquivos) e as stories do popup. Nenhum usa axe-core nem keyboard.press, e nenhum tem toMatchAriaSnapshot. A única conferência de acessibilidade é o reduzir movimento em popup.e2e.ts:82-87. O site já roda axe em app/seo.e2e.ts e app/pagina.e2e.ts.
- **Medição:** Busca no código por axe, AxeBuilder, keyboard.press, toMatchAriaSnapshot, reducedMotion e forcedColors nos E2E da extensão: só as duas linhas de reducedMotion do popup.e2e.ts. É o mesmo caso do DOC-07 (regra da skill ausente), e por isso tem a mesma severidade.
- **Como corrigir:** Um E2E com o axe-core que o site já usa, com as tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa e best-practice, sobre o popup real (1a a 1e, nos dois temas) e sobre o aviso na página, dentro do shadow DOM. Junto, um teste de teclado do fluxo principal (Tab até Gerar pessoa, Enter, Preencher, foco no h1 da tela nova), um contexto com forcedColors: "active" e o ariaSnapshot da tela 1b. Cada correção desta lista tira daqui a sua exceção.
- **Origem:** acrescentado na consolidação, por busca no código; nenhum auditor tinha registrado.

### EXT-05 · Foco invisível em alto contraste (forced colors) em 48 das 52 paradas do 1b

- **Severidade:** média · **Esforço:** P
- **Critério:** WCAG 2.4.7 Foco visível (AA), no modo de cores forçadas.
- **Onde:** As 10 classes que usam focus-visible:outline-none e marcam o foco com um anel de box-shadow: rodape.tsx:4, credito-pilutech.tsx:11, filtro-chips.tsx:21, linha-copiavel.tsx:41, faixa-favoritos.tsx:16, cabecalho-pessoa.tsx:35, cartao-das-proximas.tsx:15, favorito-removido.tsx:19, pessoa-pronta.tsx:78 e resultado-preenchimento.tsx:81. Afeta o modo de cores forçadas (Contraste do Windows).
- **Medição:** Na story popup-1b-·-pessoa-pronta--claro, no Chrome 157 com emulateMedia({ forcedColors: 'active' }), percorri o 1b inteiro com Tab. Só os 4 Button do @piluvitu/ui, que usam outline-hidden, mostram outline sólido de 2 px. As outras 48 paradas ficam sem indicador: estrela (2), Guardar esta (1), chips de filtro (7), Copiar (24), abrir caixa (1), provedor e cenário (11), alterar (1) e crédito (1). Nesse modo o navegador apaga o box-shadow do anel, e o outline já está em none. Sem forced-colors, as mesmas paradas têm anel de 1 px com pelo menos 6,38:1.
- **Como corrigir:** Trocar focus-visible:outline-none por focus-visible:outline-hidden nas 10 classes. No Tailwind 4 o outline-hidden deixa um outline transparente que o modo de alto contraste pinta. Teste: um E2E com emulateMedia({ forcedColors: 'active' }) que confere outline-style diferente de none no foco.
- **Verificação:** confirmado pelo verificador independente.
  - Severidade ajustada pelo verificador de alta para media: Remedi no popup real, no Chrome 157 estável, por diferença de pixels entre o recorte com foco e sem foco (com forcedColors 'active'). Resultado: 47 de 51 paradas sem nenhum pixel diferente; só os 4 Button do @piluvitu/ui mostram indicador. Sem forced colors, as 51 paradas têm indicador. O WCAG 2.4.7 pede 'um modo de operação' com o foco visível, e o modo padrão cumpre. O alto contraste é um ajuste do usuário que o AA estrito não cobre. Então é falha de uma regra da skill ('foco visível em tudo') num modo específico, e pela régua isso é média, não falha clara de critério AA. O impacto para quem usa o Contraste do Windows é grande, e o conserto é P: vale manter na frente da fila.

### EXT-09 · Alvos menores que 24 px (crédito, rodapé, Renomear, Guardar esta, links e botões do aviso)

- **Severidade:** média · **Esforço:** M
- **Critério:** WCAG 2.5.8 Tamanho do alvo (mínimo) (AA) e a regra da skill de alvo de pelo menos 44 px.
- **Onde:** Popup: "Powered by PiluTech" (credito-pilutech.tsx:7-18, em todas as telas), "alterar" e "definir atalho" (rodape.tsx:3-4, 20-22 e 30-36), "Renomear favorito" (cabecalho-pessoa.tsx:183-194, size-\[22px]), "Guardar esta" (faixa-favoritos.tsx:80-92) e "abrir caixa →" (pessoa-pronta.tsx:75-81). Aviso: Fechar (aviso.css:66-79) e "2 não reconhecidos" (aviso.css:90-94).
- **Medição:** getBoundingClientRect de todo interativo, no popup real e nas stories, nos dois temas. Medidas: crédito 145×14, alterar 46,2×14, definir atalho 92,4×14, Renomear 22×22, Guardar esta 113,5×23,5, abrir caixa → 71,1×18, Fechar do aviso 20×20 e "2 não reconhecidos" 119,2×15,4. Ressalva: todos passam na exceção de espaçamento do 2.5.8 (um círculo de 24 px no centro não toca outro alvo). O vizinho mais perto fica entre 23,8 px (Guardar esta) e 169 px. O "abrir caixa →" ainda cai na exceção de texto corrido, e a regra target-size do axe também passa. A severidade alta vem da régua desta auditoria (abaixo de 24 px é alta); pelo WCAG estrito, eles cumprem o mínimo.
- **Como corrigir:** Aumentar a área clicável sem mudar o desenho: min-h-6 ou padding vertical para chegar a 24 px. Para o padrão de 44 px, um pseudo-elemento ::after posicionado que estende a área. Casos: Renomear size-6 no mínimo; Guardar esta com py-\[6px]; Fechar do aviso com padding de 6 px (24) ou 10 px (32) e ::after até 44; "2 não reconhecidos" com padding vertical. Teste: um E2E que mede o getBoundingClientRect dos controles do popup e do aviso.
- **Verificação:** confirmado pelo verificador independente.
  - Severidade ajustada pelo verificador de alta para media: Medi a exceção de espaçamento do 2.5.8 no popup real: um círculo de 24 px centrado em cada alvo pequeno, contra o retângulo visível de todos os outros alvos (recortado pela rolagem do main) e contra o círculo dos outros alvos pequenos. Folgas: Guardar esta 11,8 px, alterar 11,5, Powered by PiluTech 118,6, Renomear favorito 85,4 e abrir caixa → 145,6 (este também cai na exceção de texto corrido). No aviso, o Fechar (20×20, centro em 961,720) e o '2 não reconhecidos' (723–842 × 738–754) ficam a mais de 100 px um do outro. Todos cumprem o mínimo do WCAG, então o caso é 'dentro do mínimo do WCAG mas fora do padrão PiluTech', que é média. Dá para juntar com o EXT-10, que tem o mesmo conserto.

### EXT-10 · Quase nenhum controle do popup chega a 44 px

- **Severidade:** média · **Esforço:** G
- **Critério:** Skill: alvo de pelo menos 44×44. O mínimo de 24 px do WCAG está atendido.
- **Onde:** Chips de filtro (filtro-chips.tsx:21, 25 px de altura); chips de cenário (cartao-das-proximas.tsx:78, 25); Desfazer (favorito-removido.tsx:19, 26); Copiar (linha-copiavel.tsx:41) e mira do 1c (resultado-preenchimento.tsx:81), 28×28; Stripe e Pagar.me (cartao-das-proximas.tsx:53, 30); Button sm do @piluvitu/ui, campo do apelido e Salvar (32); chips de favorito e "Nova pessoa com …" (34); estrela (36×36); "Preencher esta página" e "Gerar pessoa" (40). Vale para todas as telas.
- **Medição:** Dos 61 alvos distintos medidos no popup real e nas stories, só o "Nova pessoa com …" chega a 44 px de altura, e só quando o texto quebra em duas linhas (322×44). Todo o resto fica entre 25 e 40 px de altura.
- **Como corrigir:** Rever a densidade do popup junto com o desenho aprovado. Opções: ações principais em h-11; nas linhas copiáveis, a área do botão Copiar estendida por ::after (a linha já tem 38 px); chips com min-h-11 ou área estendida por pseudo-elemento, sem aumentar o desenho.
- **Verificação:** confirmado pelo verificador independente.

### EXT-11 · Foco vai para o body depois de salvar ou cancelar o apelido e depois do Desfazer

- **Severidade:** média · **Esforço:** P
- **Critério:** WCAG 2.4.3 Ordem do foco (A). A falha é parcial porque o próximo Tab segue do lugar certo.
- **Onde:** cabecalho-pessoa.tsx:117-156: o form desmonta no Enter e no Esc. favorito-removido.tsx:16-22 com pessoa-pronta.tsx:141-144: o Desfazer some ao ser usado. Popup 1b.
- **Medição:** No popup real, o document.activeElement vira BODY depois de Esc no campo do apelido, depois de Enter (salvar) e depois de Enter no Desfazer. O próximo Tab vai para "Renomear favorito" ou para o chip do favorito, porque o Chrome guarda o ponto de partida da navegação. Mesmo assim, o leitor de tela perde o lugar e nada é anunciado.
- **Como corrigir:** Devolver o foco à estrela (BotaoEstrela com ref) ao salvar, ao cancelar e no Desfazer, ou ao Renomear quando a pessoa ativa é favorita. Teste: Vitest no pessoa-pronta.test.tsx com toHaveFocus depois de Esc, Enter e Desfazer.
- **Verificação:** confirmado pelo verificador independente.
  - Verificador: Remedido no Chrome 157: depois do Esc no apelido, o foco fica no BODY e o Tab seguinte vai para 'Renomear favorito'. Depois de salvar com Enter, BODY. Depois do Enter no Desfazer, BODY. Somar: quando o Desfazer some sozinho com o foco nele, o foco também cai no BODY (medido: sumiu em 5024 ms e o foco ficou no BODY).

### EXT-12 · Texto em px fixo não acompanha o tamanho de fonte do navegador

- **Severidade:** média · **Esforço:** M
- **Critério:** Skill: "Texto aumenta até 200% sem cortar…; layout aguenta zoom do navegador". O WCAG 1.4.4 é atendido pelo zoom, então a falha é parcial.
- **Onde:** extensao/src/components/tipografia.ts:2-12: OVERLINE 10,5 px, META\_MONO 11, BOTAO\_SM 13, CORPO 13 e H1\_ESTADO 17. Mais 44 usos de text-\[Npx] em 16 componentes (pilula-host, rodape, linha-copiavel, filtro-chips e outros). Medido no popup 1b.
- **Medição:** Com um perfil do Chromium com default\_font\_size 32 (200%), só 32 dos 105 elementos de texto do 1b dobraram: 12→24 px em 29, 14→28 em 2 e 16→32 no h1. Os outros 73 ficaram iguais (9,5; 10,5; 11; 11,5; 12,5 e 13 px). Já com zoom de 200%, simulado numa viewport de 380×300 CSS (o limite de 800×600 px da janela do popup), nada foi cortado e não houve rolagem horizontal.
- **Como corrigir:** Trocar os px por rem no tipografia.ts e nos text-\[Npx] (10,5 px vira 0,65625rem, e assim por diante); o body já usa 1rem. Conferir o layout com a fonte do navegador em 32 px. O aviso na página continua em px de propósito, porque lá o rem do site vazaria.
- **Verificação:** confirmado pelo verificador independente.

### EXT-14 · Aviso "saiu dos favoritos" com Desfazer some em 5 s e não pausa

- **Severidade:** média · **Esforço:** P
- **Critério:** WCAG 2.2.1 Ajustável por tempo (A), falha parcial porque o favorito pode ser guardado de novo pela estrela. Skill: toast tem pausa.
- **Onde:** use-desfazer.ts:3-10: setTimeout fixo de 5000 ms. favorito-removido.tsx:9-25: sem pausa no hover nem no foco.
- **Medição:** Pelo código, o temporizador não considera hover nem foco. No popup real, o Desfazer aparece logo depois da estrela (é o próximo Tab, alvo de 73×26 px) e, usado pelo teclado, deixa o foco no body (ver EXT-11). Não cronometrei a saída no popup real.
- **Como corrigir:** Pausar o temporizador enquanto o mouse ou o foco estiverem no aviso (onMouseEnter e onFocus param; ao sair, retoma) e nunca fechar com o foco dentro. Teste: Vitest com fake timers.
- **Verificação:** confirmado pelo verificador independente.
  - Verificador: Cronometrado no popup real (Chrome 157). Com o foco no Desfazer pelo teclado, e o foco ficando nele o tempo todo, o aviso sumiu em 5024 ms e o foco foi para o BODY. Com o mouse parado em cima do Desfazer, sumiu em 5069 ms. Não há pausa nem com foco nem com mouse.

### EXT-V01 · Preencher numa página de erro do navegador não faz nada e não diz nada

- **Severidade:** média · **Esforço:** P
- **Critério:** Skill: 'Erros dizem o que houve e como corrigir… e são anunciados'. WCAG 4.1.3 Mensagens de status: nenhuma mensagem existe para ser anunciada.
- **Onde:** extensao/src/entrypoints/popup/App.tsx:152-157: o `if (resposta) setEstado(...)` ignora a resposta undefined. extensao/src/entrypoints/background/ouvintes.ts, aoReceberMensagem: no erro, chama responder(undefined). extensao/src/lib/paginas.ts:17-21: RECUSAS\_DO\_NAVEGADOR não cobre 'Frame with ID 0 is showing error page'. background/acoes.ts:112-114 relança o erro. Afeta o popup 1b com a aba numa página de erro do Chrome (servidor local fora do ar, sem rede, DNS), nos dois temas. Pelo atalho (aoComando → preencherPagina) o caminho é o mesmo e nenhum aviso aparece; isso vem da leitura do código.
- **Medição:** No Chrome 157, abri a aba em http://teste.local/caiu com route.abort('connectionrefused'). A aba mostra a página de erro do Chrome, e o chrome.tabs continua dando a URL http. O popup abre no 1b com 'Preencher esta página' habilitado. Enter no botão: depois de 2,5 s o h1 continua com o nome da pessoa, um MutationObserver no body registrou 0 mutações e nenhuma região viva mudou. O executeScript na mesma aba falha com 'Frame with ID 0 is showing error page', texto que não casa com nenhum padrão de RECUSAS\_DO\_NAVEGADOR. Por isso preencherPagina relança, o ouvinte responde undefined e o App ignora.
- **Como corrigir:** Tratar a resposta undefined (ou um { ok: false, motivo: 'erro' }) com uma tela de erro no padrão do 1e, por exemplo 'A página não carregou. Recarregue a aba e tente de novo', com foco no h1 ou role=alert. Somar /showing error page/ às recusas com um motivo próprio, não 'proibida'. Testes: Vitest do App com enviar resolvendo undefined e um E2E com route.abort.
- **Origem:** achado do verificador, que não estava na auditoria; medido por ele.

### EXT-V02 · Os avisos de erro na página dizem o que houve, mas não como resolver

- **Severidade:** média · **Esforço:** P
- **Critério:** Skill: 'Erros dizem o que houve e como corrigir, perto do campo, e são anunciados'.
- **Onde:** extensao/src/lib/textos.ts:13-23: AVISO\_SEM\_CAMPOS ('Nenhum campo nesta página') e avisoFalhaInserir ('Não deu para inserir aqui: nenhum campo em foco | iframe de outro domínio | o campo recusou o valor'). Usados em background/acoes.ts:102-110 e 118-134 e mostrados no aviso role=alert (preencher.content/aviso-dom.ts:90). Aparecem na página pelo atalho, pelo menu Inserir e pelo Preencher do menu. O tempo de 4 s fica no EXT-02.
- **Medição:** Preenchi pelo popup a página http://teste.local/sobre, que não tem formulário. Apareceu um aviso role=alert com o texto exato 'Nenhum campo nesta página', que saiu do DOM 4024 ms depois de entrar. O popup mostra o 1d com a explicação, mas pelo atalho só existe o aviso. Os 4 textos de erro do aviso (textos.ts) não trazem nenhuma ação. Para comparar: o 1d e o 1e do popup dizem 'Abra o formulário numa aba comum e tente de novo' e '… ative … e tente de novo'.
- **Como corrigir:** Completar cada texto com a saída. Exemplos: 'Nenhum campo nesta página. Abra o formulário e aperte o atalho de novo'; 'Nenhum campo em foco: clique no campo e use Botaí › Inserir'; 'Iframe de outro domínio: copie o dado pelo popup'; 'O campo recusou o valor: copie pelo popup e cole'. O aviso role=alert não deve fechar sozinho. Testes: textos.test.ts e aviso-dom.test.ts.
- **Origem:** achado do verificador, que não estava na auditoria; medido por ele.

### EXT-V03 · Em alto contraste, o estado escolhido dos chips de filtro e do provedor some, e a bolinha da pílula também

- **Severidade:** média · **Esforço:** M
- **Critério:** Skill: 'Nada depende só de cor: estado também tem forma, ícone ou texto'. No modo de cores forçadas o sistema troca as cores e o estado escolhido não tem outra pista. O WCAG 1.4.1 nesse modo não é exigido pelo AA estrito, por isso média.
- **Onde:** filtro-chips.tsx:22-24: o escolhido usa bg-accent-soft, text-primary e border-accent-line. cartao-das-proximas.tsx:54-56: provedor com bg-primary. cartao-das-proximas.tsx:79-81: cenário com bg-muted e peso. pilula-host.tsx:22-27: a bolinha é só background. Afeta o popup 1b no modo de cores forçadas (Contraste do Windows), tema claro.
- **Medição:** Chrome 157 com emulateMedia({ forcedColors: 'active' }) no popup real. Recortei o mesmo chip 'Tudo' escolhido e depois solto (clicando em 'Pessoais'): 0 de 1537 pixels diferentes. Sem forced colors, o mesmo teste dá 1064 de 1537 (controle). 'Stripe' escolhido e solto (clicando em 'Pagar.me'): 1 de 5406 pixels. Estilos computados em forced colors: filtro escolhido rgb(0,0,0)|rgba(255,255,255,0.13)|borda rgb(0,0,0)|500, solto rgb(0,0,0)|transparente|rgb(0,0,0)|500. Provedor escolhido com fundo rgb(255,255,255), solto transparente, sobre o Canvas branco. No cenário só muda o peso (600 contra 500). A bolinha da pílula vira rgb(255,255,255) sobre o fundo branco. O fundo cheio do provedor, que o 'já cumpre' usa como forma, some.
- **Como corrigir:** Dar forma ao estado escolhido: ícone de check no chip escolhido (o mesmo conserto do EXT-07) ou variantes forced-colors do Tailwind 4 nos chips e no provedor, como `aria-pressed:forced-colors:bg-[Highlight] aria-pressed:forced-colors:text-[HighlightText]`. Trocar a bolinha por um ícone com formato por estado, como o cadeado já faz. Teste: E2E com emulateMedia({ forcedColors: 'active' }) comparando o recorte do chip escolhido e do solto.
- **Origem:** achado do verificador, que não estava na auditoria; medido por ele.

### EXT-15 · Região role=status do aviso já nasce com o texto (risco de não ser anunciada)

- **Severidade:** baixa · **Esforço:** P
- **Critério:** WCAG 4.1.3 Mensagens de status (risco, não confirmado).
- **Onde:** aviso-dom.ts:90 com aviso.ts:16-22.
- **Medição:** O host botai-aviso e o .botai-toast\[role=status] são criados e preenchidos no mesmo onMount, como último filho do &lt;html>. Muitos leitores só anunciam uma região viva que já existia antes de o texto mudar. Além disso, quando o preenchimento vem do popup, o foco está em outro documento. Não verifiquei com leitor de tela.
- **Como corrigir:** Criar a região vazia e preencher o texto no quadro seguinte (requestAnimationFrame). Confirmar com VoiceOver e NVDA.
- **Verificação:** confirmado pelo verificador independente.

### EXT-16 · "copiado" anuncia de novo o rótulo quando volta, sem ação da pessoa (24 regiões vivas)

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Skill: anúncios polite só quando a pessoa age.
- **Onde:** linha-copiavel.tsx:23-31: aria-live="polite" no rótulo, que troca entre "CPF" e "copiado".
- **Medição:** Enter em "Copiar CPF": a região viva muda para "copiado". 1,6 s depois ela volta para "CPF", um segundo anúncio sem ação da pessoa. O 1b tem 24 elementos com aria-live.
- **Como corrigir:** Uma única região status no PessoaPronta que recebe "CPF copiado" e depois é esvaziada (sem reescrever o rótulo). Tirar o aria-live das 24 linhas.
- **Verificação:** confirmado pelo verificador independente.

### EXT-17 · Estrela troca rótulo e estado juntos, e a barra de filtros não tem nome de grupo

- **Severidade:** baixa · **Esforço:** P
- **Critério:** WCAG 4.1.2 e 1.3.1 (melhoria; o axe não aponta violação).
- **Onde:** cabecalho-pessoa.tsx:69-80: o aria-label alterna entre "Guardar nos favoritos" e "Tirar dos favoritos" junto com o aria-pressed. filtro-chips.tsx:13: sem role=group nem rótulo.
- **Medição:** Lido no código, e o axe dá 0 violações. Com rótulo e estado mudando juntos, o leitor ouve "Tirar dos favoritos, botão de alternância, pressionado", e o rótulo diz uma coisa enquanto o estado diz outra. Os 7 chips de filtro não têm nome de grupo.
- **Como corrigir:** Estrela com rótulo fixo ("Favorito") mudando só o aria-pressed, ou rótulo mudando sem aria-pressed. Pôr role="group" e aria-label="Filtrar dados" na barra.
- **Verificação:** confirmado pelo verificador independente.

### EXT-18 · Sem h1 enquanto o apelido é editado

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Boa prática do axe page-has-heading-one.
- **Onde:** cabecalho-pessoa.tsx:174-176: o CampoApelido substitui o bloco que tem o h1.
- **Medição:** axe no popup real no estado "editando apelido", claro e escuro: page-has-heading-one (moderate).
- **Como corrigir:** Manter o h1 com o nome durante a edição, visível ou sr-only.
- **Verificação:** confirmado pelo verificador independente.

### EXT-19 · Largura fixa de 380 px rola na horizontal acima de 200%

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Skill: zoom, que passa a 200%. O WCAG 1.4.10 não se aplica à janela do popup.
- **Onde:** extensao/src/styles.css:58-61: `html, body { width: 380px }`.
- **Medição:** A 200% (viewport de 380×300) não há rolagem horizontal. A 250% a janela tem 320 px CSS (800 px divididos por 2,5): docScrollW 380 contra docClientW 320, ou seja, 60 px de rolagem horizontal.
- **Como corrigir:** width: min(380px, 100vw) e conferir o layout com 320 px.
- **Verificação:** confirmado pelo verificador independente.

### EXT-21 · Nomes com símbolos (⌥⇧P, →) e abertura de aba nova sem aviso no nome

- **Severidade:** baixa · **Esforço:** P
- **Critério:** WCAG 2.4.4 e 3.2 (melhoria; não verificado com leitor de tela).
- **Onde:** kbd do atalho em pessoa-pronta.tsx:189-193 e rodape.tsx:25-27; "abrir caixa →" em pessoa-pronta.tsx:80; "Caixa de entrada" em pessoa-pronta.tsx:205-217 e resultado-preenchimento.tsx:141-144, que abre aba nova com o ícone de link externo em aria-hidden.
- **Medição:** Nomes acessíveis medidos: "Preencher esta página⌥⇧P" (o kbd entra no nome do botão) e "abrir caixa →". Como os símbolos são lidos depende do leitor de tela, e isso não foi verificado.
- **Como corrigir:** kbd com aria-label legível ("Option Shift P") ou texto sr-only. Seta dentro de um span aria-hidden. "(abre em nova aba)" em sr-only nos botões que abrem aba, como o crédito já faz.
- **Verificação:** confirmado pelo verificador independente.

### EXT-V04 · Host comprido fica cortado na pílula, e o host inteiro só aparece no title, com o mouse

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Skill: texto sem cortar. WCAG 2.1.1 e 1.4.13: a informação só aparece no hover (melhoria).
- **Onde:** pilula-host.tsx:15-29: title={host} num div que não é focável, com o texto em span truncate. Cabeçalho do popup-shell.tsx:21-30, em todas as telas, a 380 px.
- **Medição:** No popup real, troquei o texto da pílula por 'homologacao-do-cliente.empresa.com.br' (37 caracteres). O span mostra 152 dos 233 px do texto (scrollWidth maior que clientWidth), com reticências. A pílula não é focável (sem tabindex e sem filho focável), então o title só abre com o mouse. O leitor de tela lê o texto inteiro, que está no DOM.
- **Como corrigir:** Deixar o host quebrar em até duas linhas no cabeçalho, ou mostrar o host inteiro no corpo do 1b e do 1c. Outra saída é um tooltip próprio que também abre no foco. Teste: uma story com host longo dentro do PopupShell.
- **Origem:** achado do verificador, que não estava na auditoria; medido por ele.

### EXT-V05 · As iniciais do avatar são lidas antes do nome

- **Severidade:** baixa · **Esforço:** P
- **Critério:** WCAG 1.3.1 (texto decorativo exposto ao leitor de tela; melhoria).
- **Onde:** cabecalho-pessoa.tsx:169-173: Avatar e AvatarFallback sem aria-hidden. Popup 1b.
- **Medição:** Na árvore de acessibilidade do Chrome 157 (CDP Accessibility.getFullAXTree), o 1b tem um StaticText 'AS' antes do h1 com o nome. Os chips de favorito já escondem as iniciais com aria-hidden (faixa-favoritos.tsx:65-66); o avatar do cabeçalho não.
- **Como corrigir:** Pôr aria-hidden="true" no Avatar do cabeçalho, com teste no cabecalho-pessoa.test.tsx.
- **Origem:** achado do verificador, que não estava na auditoria; medido por ele.

### EXT-V06 · "abrir caixa →" no meio da frase só se distingue do texto pela cor

- **Severidade:** baixa · **Esforço:** P
- **Critério:** WCAG 1.4.1 Uso de cor, pela técnica G183 e pela falha F73 para link dentro de texto. A seta → é uma pista extra, mas fraca, por isso baixa.
- **Onde:** pessoa-pronta.tsx:72-81: um botão text-primary dentro da frase do aviso de caixa pública, com sublinhado só no hover. Popup 1b, grupo E-mail, nos dois temas.
- **Medição:** Pelos tokens: primary #055b80 contra o texto em volta (foreground #0f141f) dá 2,47:1 no claro, e #3abff8 contra #e7ecf3 dá 1,77:1 no escuro. Os dois ficam abaixo de 3:1, e fora do hover não há sublinhado (só a classe hover:underline). O nome acessível medido é 'abrir caixa →'.
- **Como corrigir:** Sublinhado sempre (underline underline-offset-\[3px]), e não só no hover.
- **Origem:** achado do verificador, que não estava na auditoria; medido por ele.

## Site

As rotas `/`, `/privacidade` e `/termos` e a 404, no build de produção local (`next build` e `next start`), nos dois temas, a 1280, 768, 640, 375 e 320 px.

| ID       | Achado                                                                                                                                                         | Severidade | Esforço |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- |
| SITE-01  | O foco dos botões primários não aparece: o anel tem 1 px e a mesma cor do fundo do botão                                                                       | alta       | P       |
| SITE-V01 | A página 404 do site é a padrão do Next: toda em inglês dentro de lang="pt-BR", sem main e sem link de volta                                                   | alta       | P       |
| SITE-02  | No modo de contraste forçado (temas de contraste do Windows), o foco some em 27 das 34 paradas de Tab da landing, 9 de 18 na /privacidade e 9 de 15 na /termos | média      | P       |
| SITE-03  | Alvos de 28 a 36 px, abaixo dos 44 px da PiluTech                                                                                                              | média      | M       |
| SITE-04  | Quatro links com 19,5 a 20 px de altura passam no WCAG só pela exceção de espaçamento                                                                          | média      | P       |
| SITE-05  | O texto da landing em px não cresce com a fonte do navegador; com a fonte maior, textos se sobrepõem e o botão de menu sai da tela                             | média      | M       |
| SITE-06  | /privacidade e /termos rolam para os lados a 320–375 px quando o texto cresce                                                                                  | média      | P       |
| SITE-08  | Os testes de acessibilidade do site cobrem só parte do que a skill pede                                                                                        | média      | M       |
| SITE-09  | Bordas dos controles com contraste de 1,27:1 no claro e 1,46:1 no escuro                                                                                       | baixa      | P       |
| SITE-10  | Links no meio do texto com 21 px de altura nas páginas de texto                                                                                                | baixa      | P       |
| SITE-11  | Links que abrem nova aba sem avisar                                                                                                                            | baixa      | P       |
| SITE-12  | Nas páginas de texto, o foco usa o anel padrão do navegador, e não o do site                                                                                   | baixa      | P       |
| SITE-13  | Não há link para pular para o conteúdo                                                                                                                         | baixa      | P       |
| SITE-14  | O menu de seções fica aberto quando o foco sai dele, e Escape no conteúdo puxa o foco de volta ao topo                                                         | baixa      | P       |
| SITE-15  | Quando o copiar falha, nada avisa                                                                                                                              | baixa      | P       |
| SITE-V02 | O botão de tema não diz qual tema está ativo: o nome é 'Alternar tema' nos dois temas, sem aria-pressed, e o ícone de estado é aria-hidden                     | baixa      | P       |

Repetidos, tratados no achado principal: SITE-07 → LOC-11.

### SITE-01 · O foco dos botões primários não aparece: o anel tem 1 px e a mesma cor do fundo do botão

- **Severidade:** alta · **Esforço:** P
- **Critério:** WCAG 2.4.7 (Foco visível) e 1.4.11 (Contraste não textual): o indicador de foco precisa de 3:1 contra a cor ao lado. Regra da skill: foco visível em tudo que é interativo.
- **Onde:** components/cabecalho.tsx:43-51 (Docs); components/hero.tsx:38-43 e components/chamada-final.tsx:32-37 (os dois Ler a documentação); components/botoes-loja.tsx:22-33 (Chrome Web Store e Firefox Add-ons). Na variante outline o anel também tem 1 px: hero.tsx:44-55 (Instalar a extensão) e chamada-final.tsx:38-48 (Código no GitHub). A origem é o Button do @piluvitu/ui 0.1.0 (node\_modules/@piluvitu/ui/dist/button.js, com 'focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring'). Rota /, temas claro e escuro, 1280 e 320 px.
- **Medição:** Percorri a página com Tab e li o box-shadow computado. No tema claro é 'rgb(5, 91, 128) 0 0 0 1px', igual ao bg-primary #055b80: 1,00:1 entre o anel e o preenchimento. No escuro é 'rgb(58, 191, 248) 0 0 0 1px', igual ao #3abff8. O verificador confirmou de novo no Chrome 157 estável, com DPR 2, comparando pixel a pixel o recorte com e sem foco (foco.mjs). Nos 5 botões preenchidos (Docs, os 2 'Ler a documentação', 'Chrome Web Store' e 'Firefox Add-ons'), a faixa que muda tem de 0,85 a 0,95 px CSS de espessura. De 92% a 98% dos pixels dela ficam abaixo de 1,5:1 contra o preenchimento 3 px para dentro, ou seja, o botão só cresce cerca de 1 px. Esses pixels chegam a 6,89:1 (claro) e 9,42:1 (escuro) contra o fundo da página que estava ali. Por isso a falha é de visibilidade, e não de contraste com a página: o foco não se distingue do próprio botão, e os recortes com e sem foco ficam iguais a olho. Nos controles com ring-2, a faixa medida tem de 1,56 a 1,97 px e se funde de 0% a 12%. Na variante outline ('Instalar a extensão' e 'Código no GitHub'), o anel de 1 px não se funde (0%) e fica visível.
- **Como corrigir:** No site, somar 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background' ao className desses Button: BOTAO\_DO\_HERO em hero.tsx, BOTAO em chamada-final.tsx, o Docs do cabecalho.tsx e o Button de botoes-loja.tsx. O cn do @piluvitu/ui usa tailwind-merge, então o ring-2 vence o ring-1. Com o offset, uma faixa da cor do fundo separa o anel do preenchimento, e o anel contrasta 7,07:1 no claro e 9,36:1 no escuro. Levar a mesma troca ao Button do @piluvitu/ui no monorepo, que é usado por todos os produtos. Criar um teste E2E que foca cada botão e compara o recorte com e sem foco.
- **Verificação:** confirmado pelo verificador independente.
  - O verificador refez a medição: Deixar a medição à prova da objeção de que o anel tem 7:1 contra a página. A espessura e a fusão com o preenchimento, medidas por outro método e em outro navegador, mostram por que o foco é invisível na prática.

### SITE-V01 · A página 404 do site é a padrão do Next: toda em inglês dentro de lang="pt-BR", sem main e sem link de volta

- **Severidade:** alta · **Esforço:** P
- **Critério:** WCAG 3.1.1 (Idioma da página, nível A): todo o conteúdo e o title estão em inglês, e o idioma declarado é pt-BR. Também as best-practices do axe landmark-one-main e region. Pela skill: pt-BR como idioma de origem e nenhum texto fora do catálogo. Além disso, a página não oferece caminho de volta, só o Voltar do navegador.
- **Onde:** Qualquer rota inexistente do botai.pilutech.com.br (por exemplo /qualquer-coisa e /nao-existe), que responde HTTP 404 nos dois temas, a 1280 e a 320 px. Não existe site/app/not-found.tsx, então o Next usa o \_not-found padrão, dentro do app/layout.tsx:28-29 (html lang="pt-BR").
- **Medição:** O curl -s -o /dev/null -w '%{http\_code}' http://localhost:3020/nao-existe deu 404. No Chrome 157 (n404.mjs), nos dois temas: lang=pt-BR; title '404: This page could not be found.'; texto '404 This page could not be found.'; 0 elementos focáveis; main=false; links=\[]. O ariaSnapshot é 'heading "404" \[level=1]', 'heading "This page could not be found." \[level=2]' e 'alert'. O leitor de tela lê a frase em inglês com a voz de pt-BR. O axe-core 4.14.0, com wcag2a a wcag22aa e best-practice, deu 2 violações nos dois temas: landmark-one-main (moderate) e region (moderate, 2 nós). O contraste passa: #000 sobre #fff e #fff sobre #000, pelo CSS embutido do Next.
- **Como corrigir:** Criar site/app/not-found.tsx em pt-BR com o Topo (link 'Botaí' para /) e o Rodape. O conteúdo vai num &lt;main> com h1 'Página não encontrada', uma frase curta e links para / e para a documentação, e a metadata ganha o title 'Página não encontrada | Botaí'. O texto segue o catálogo quando a localização en/es entrar, e por ser texto público precisa do OK do Paulo. E2E: page.goto('/nao-existe') e conferir status 404, html lang pt-BR, o h1 em pt-BR, o link para '/' e o axe sem violações.
- **Origem:** achado do verificador, que não estava na auditoria; medido por ele.
  - Também registrado como LOC-V01 (localização, severidade alta): Faltam site/app/not-found.tsx e global-error.tsx. O build é site/.next/server/app/\_not-found.html, com status 404, servido em qualquer rota inexistente de botai.pilutech.com.br, em todas as larguras e nos dois temas. O \_global-error.html (500) também é afetado.

### SITE-02 · No modo de contraste forçado (temas de contraste do Windows), o foco some em 27 das 34 paradas de Tab da landing, 9 de 18 na /privacidade e 9 de 15 na /termos

- **Severidade:** média · **Esforço:** P
- **Critério:** Regra da skill: foco visível em tudo que é interativo, aqui no modo de cores forçadas (temas de contraste do Windows). O WCAG 2.4.7 é cumprido no modo padrão, e o WCAG 2.2 AA não exige suporte a forced-colors.
- **Onde:** Os 11 usos de 'outline-none' com 'focus-visible:ring-2': components/cabecalho.tsx:21 (marca), :36 (4 âncoras) e :55 (GitHub); menu-secoes.tsx:45 (botão) e :64 (links do painel); botao-tema.tsx:30 (nas três rotas); botao-copiar.tsx:52 (9 botões); para-quem.tsx:72 (link do convite); cuidados.tsx:41 (2 links); tabela-atalhos.tsx:19 (região focável); rodape.tsx:17 (constante FOCO: Powered by e os 7 links, nas três rotas).
- **Medição:** Abri o contexto do Playwright com forcedColors: 'active', percorri as rotas com Tab e comparei os pixels do recorte de cada elemento com e sem foco. Nesses 27 alvos nenhum pixel mudou (no GitHub mudaram 32 px, com razão máxima de 1,01). A causa está no CSS compilado em .next/static/chunks/\*.css: '.outline-none{outline-style:none}', e o anel é um box-shadow, que o forced-colors remove. Os Button do @piluvitu/ui usam 'outline-hidden', que o Tailwind 4 compila com '@media (forced-colors:active){outline:2px solid #0000; outline-offset:2px}'. Esses continuam visíveis: mudam de 597 a 1229 px, com razão de 11,31:1. Os links do corpo das páginas de texto, com o outline auto do navegador, também aparecem.
- **Como corrigir:** Trocar 'outline-none' por 'outline-hidden' nos 11 lugares (8 arquivos); fora do forced-colors nada muda. Outra saída é somar 'forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-\[Highlight]'. Cobrir no E2E com um contexto forcedColors: 'active'.
- **Verificação:** confirmado pelo verificador independente.
  - Severidade ajustada pelo verificador de alta para media: A medição se confirma por outro caminho: no Chrome 157 estável, com forcedColors 'active', o box-shadow computado vira 'none' em todos os elementos, e os mesmos 27/34, 9/18 e 9/15 alvos ficam sem nenhum pixel mudado nos dois temas. Mas não é uma 'falha clara de critério WCAG 2.2 AA'. O 2.4.7 pede 'um modo de operação' em que o foco apareça, e no modo padrão ele aparece em todas as paradas (anel de 2 px, de 7,07 a 9,36:1, medido). O WCAG 2.2 não exige suporte a cores forçadas. Pela definição, é falha parcial da regra da skill ('foco visível em tudo que é interativo'), num ajuste da pessoa: média. É a mais urgente das médias, porque o esforço é P e afeta quem usa tema de contraste do Windows e teclado.
  - O verificador trocou o critério: Alinhar o critério à severidade ajustada. A falha só aparece num modo de exibição que o WCAG não cobre.

### SITE-03 · Alvos de 28 a 36 px, abaixo dos 44 px da PiluTech

- **Severidade:** média · **Esforço:** M
- **Critério:** Regra da skill: alvo de toque e clique de 44×44. O WCAG 2.5.8 (24×24) é cumprido.
- **Onde:** Cabeçalho: marca 84,5×28; âncoras Portas, Mesma pessoa, Para quem e Extensão 66,8–113,6×35,5 (a partir de 900 px); Docs 86,2×36 (36×36 abaixo de 380 px); GitHub, Alternar tema e Abrir menu 36×36. Hero: copiar 36×36. Portas: os 7 botões de copiar 32×32. Rodapé, nas três rotas: Docs 35,1×32, GitHub 47,8×32, @pilutech/botai-core 156×31,5, @pilutech/botai-playwright 202,8×31,5, Suporte 54,1×32, Termos de uso 95,6×32, Política de privacidade 150,6×32 e Powered by PiluTech 136,8×28. Em /privacidade e /termos: Alternar tema 36×36. Os tamanhos são iguais a 1280 e a 320 px.
- **Medição:** Medi com getBoundingClientRect cada link, botão e elemento com tabindex, a 1280 e a 320 px, também com o menu aberto. O menor lado de todos esses alvos ficou entre 28 e 36 px.
- **Como corrigir:** Onde falta espaço, criar uma área de toque invisível de 44 px sem mudar o desenho. Nos botões de 36 px, 'relative after:absolute after:-inset-1': 36 + 8 = 44, e o gap entre eles é de 8 px, então as áreas se encostam sem se sobrepor e a fileira continua cabendo nos 288 px úteis a 320. Nos botões de copiar de 32 px, 'after:-inset-1.5'. Nos links do rodapé e nas âncoras do cabeçalho, 'inline-flex min-h-11 items-center'. Na marca, 'min-h-11'.
- **Verificação:** confirmado pelo verificador independente.

### SITE-04 · Quatro links com 19,5 a 20 px de altura passam no WCAG só pela exceção de espaçamento

- **Severidade:** média · **Esforço:** P
- **Critério:** WCAG 2.5.8 (24×24), cumprido só pela exceção de espaçamento, e a regra da skill de 44×44. Pela regra do pedido (menor que 24 px é alta), seriam alta. Ficam como média porque o 2.5.8 passa: o círculo de 24 px no centro de cada link não cruza nenhum outro alvo, e o target-size do axe com wcag22aa não acusou.
- **Onde:** components/para-quem.tsx:70-76 (convite 'docs.botai.pilutech.com.br', 221,8×19,5); components/cuidados.tsx:38-45 ('Política de privacidade' 169,6×20 e 'Termos de uso' 114,6×20, na seção 07); components/topo.tsx:14-17 (link 'Botaí' de voltar, 63×20, em /privacidade e /termos). Os tamanhos são iguais a 1280 e a 320 px.
- **Medição:** Medi com getBoundingClientRect; a altura ficou entre 19,5 e 20 px. Conferi a exceção calculando a distância do centro de cada link até todos os outros alvos: nenhum fica a menos de 12 px (o raio do círculo de 24 px).
- **Como corrigir:** Pôr 'inline-flex min-h-11 items-center' nos três componentes. Com padding simétrico, o texto não muda de lugar.
- **Verificação:** confirmado pelo verificador independente.

### SITE-05 · O texto da landing em px não cresce com a fonte do navegador; com a fonte maior, textos se sobrepõem e o botão de menu sai da tela

- **Severidade:** média · **Esforço:** M
- **Critério:** Regra da skill: o texto aumenta até 200% sem cortar nem sobrepor, e o layout aguenta Dynamic Type e zoom do navegador. O WCAG 1.4.4 é cumprido pelo zoom de página: com zoom de 200% e 400%, nada vaza (medido).
- **Onde:** 44 usos de 'text-\[Npx]' em 15 componentes: text-\[13px]×12, text-\[11px]×9, text-\[15px]×9, text-\[17px]×4, text-\[12.5px]×3, text-\[19px]×2, text-\[14.5px]×2, text-\[11.5px]×2 e text-\[13.5px]×1. Também os 4 'text-\[clamp(px,vw,px)]' dos títulos: o h1 e o parágrafo do hero (hero.tsx), o TITULO\_DE\_SECAO (secao.tsx) e os números (numeros.tsx). Os sintomas aparecem no cabeçalho das janelas do hero (janela-exemplo.tsx) e na fileira de botões do cabeçalho (cabecalho.tsx:41).
- **Medição:** Usei o CDP Page.setFontSizes, que equivale ao 'Tamanho da fonte' do Chrome. Com 32 px, a fonte raiz foi a 32 px, mas cerca de 280 dos \~520 elementos medidos ficaram com o mesmo tamanho: 13px×135, 12.5px×41, 15px×30, 11.5px×24, 11px×22, 17px×15 e 14.5px×14. Com 24 px (o 'Muito grande' do Chrome) a 320 px: '\~/pilulabs/botai' sobrepõe 'terminal' em 42×23 px, e 'localhost:3000/cadastro' sobrepõe a tecla '⌥⇧P' em 20×14 px e é cortado pela figure. A 375 px ainda sobra uma sobreposição de 6×14 px. Com 32 px a 320 px, o botão 'Abrir menu' vai até x=352 numa tela de 320 e fica cortado pelo overflow-x-clip da moldura. Três frases das regras da pessoa saem da coluna e também são cortadas.
- **Como corrigir:** Trocar px por rem: text-\[13px] vira text-\[0.8125rem], e clamp(38px,6vw,76px) vira clamp(2.375rem,6vw,4.75rem); o mesmo nos outros. No JanelaExemplo, pôr 'flex-wrap' no cabeçalho e 'min-w-0 \[overflow-wrap:anywhere]' no título. No cabeçalho, pôr 'flex-wrap' ou 'min-w-0' na fileira de botões. Criar um E2E com Page.setFontSizes de 24 px a 320 que confere sobreposição e caixas fora da coluna.
- **Verificação:** confirmado pelo verificador independente.
  - Verificador: o verificador reproduziu com o ajuste real do Chrome, gravando webkit.webprefs.default\_font\_size no Preferences de um perfil do Chrome 157, em vez do CDP Page.setFontSizes (fonte.mjs, saída em out/fonte.txt da pasta site-verif). Com 24 px a 320: raiz=24px, e 13px×110, 15×31, 12.5×24, 11.5×24, 11×23 e 17×15 continuam iguais; 'sobrepostos: "\~/pilulabs/botai" x "terminal" (42x23) | "localhost:3000/cadastro" x "⌥⇧P" (20x14)'. Com 32 px a 320: 'controles fora: Abrir menu right=352', e frases de 'Regras da pessoa' cortadas sem rolagem possível ('O celular usa o DDD daquele \[217..327] em div.min-h-screen.overflow-x-clip (clip, 0..320)'). A 375 com 32 px: 'Derivado do nome, com caixa \[217..394]' cortado.

### SITE-06 · /privacidade e /termos rolam para os lados a 320–375 px quando o texto cresce

- **Severidade:** média · **Esforço:** P
- **Critério:** Regra da skill: texto a 200% sem cortar, e layout que aguenta o zoom. O WCAG 1.4.12 (Espaçamento de texto, sem perda de conteúdo) e o 1.4.10 (Refluxo, que isenta tabela de dados) ficam cumpridos no sentido estrito, porque dá para rolar.
- **Onde:** app/privacidade/page.tsx:249 (tabela de Permissões, fora de um contêiner rolável); o h1 do Documento (components/documento.tsx); 'code' e links longos no corpo (https://pilutech.com.br, help@pilutech.com.br, tuamaeaquelaursa.com); o h2 'Limite de responsabilidade' em /termos.
- **Medição:** Medi o scrollWidth do documento. Com a fonte padrão de 24 px, a 320 px: /privacidade 470 (tabela até 470, h1 até 335, 'https://pilutech.com.br' até 374) e /termos 341 (o h2). A 375 px, /privacidade 470. Com 32 px a 375 px: /privacidade 627 e /termos 455. Com o espaçamento do 1.4.12 a 320 px: /privacidade 370, por causa da tabela. Com a fonte de 16 px e com o zoom de página, as três rotas ficam em 320.
- **Como corrigir:** Envolver a tabela num 'div role="region" tabIndex={0} aria-labelledby=&lt;id do h2> className="overflow-x-auto outline-hidden focus-visible:ring-2"', igual à TabelaAtalhos (o conversor do llms-full trata o div como contêiner). Pôr 'prose-code:\[overflow-wrap:anywhere] prose-a:\[overflow-wrap:anywhere]' no corpo e '\[overflow-wrap:anywhere] hyphens-auto' no h1 e nos h2.
- **Verificação:** confirmado pelo verificador independente.
  - Verificador: com o ajuste real do Chrome (Preferences default\_font\_size, fonte.mjs da pasta site-verif), a 24 px e 320, /privacidade 'scrollWidth=470/320' ('Navegadores \[333..470]', 'https://pilutech.com.br \[84..374]') e /termos '341/320' ('Limite de responsabilidade \[36..341]'); a 32 px e 320, /privacidade '627/320' e /termos '455/320', com o link help@pilutech.com.br em right=392. Com o espaçamento do 1.4.12 a 320, /privacidade 'scrollWidth=370/320', igual ao do auditor.

### SITE-08 · Os testes de acessibilidade do site cobrem só parte do que a skill pede

- **Severidade:** média · **Esforço:** M
- **Critério:** Regra da skill para web: axe nas páginas principais, teste de teclado (Tab, Enter, Espaço, Esc e setas) e ariaSnapshot nos componentes ricos.
- **Onde:** app/seo.e2e.ts:162-184 e app/pagina.e2e.ts:40-52 (são dois blocos do axe, o segundo com o menu aberto em :424; os dois só com wcag2a, wcag2aa, wcag21a e wcag21aa, e com filtro serious/critical); app/pagina.e2e.ts:413 e :469 (os únicos keyboard.press, os dois Escape do menu).
- **Medição:** O seo.e2e.ts roda o axe só com as tags 'wcag2a, wcag2aa, wcag21a, wcag21aa' e filtra as violações 'serious' e 'critical'. Ficam de fora o wcag22aa, onde está o target-size, e o best-practice. O teclado se resume a 2 keyboard.press('Escape') (pagina.e2e.ts:413 e :469). Não há percurso de Tab nem conferência de foco visível, por isso os achados 01 e 02 passaram. O grep -rn ariaSnapshot em site/app, site/components e site/lib não achou nada.
- **Como corrigir:** Somar 'wcag22a', 'wcag22aa' e 'best-practice' ao runOnly; hoje isso dá 0 violação (medido). Criar um E2E que percorre as três rotas com Tab e confere a ordem, a ausência de armadilha e a diferença de pixels de pelo menos 3:1 em cada foco, também com forcedColors: 'active'. Usar toMatchAriaSnapshot no cabeçalho com o menu aberto, no rodapé e na tabela de atalhos.
- **Verificação:** confirmado pelo verificador independente.
  - O verificador corrigiu o lugar: O auditor citou só o seo.e2e.ts. O grep do verificador achou o mesmo recorte de tags e o mesmo filtro também no pagina.e2e.ts, e as duas mudanças precisam ser feitas nos dois arquivos.

### SITE-09 · Bordas dos controles com contraste de 1,27:1 no claro e 1,46:1 no escuro

- **Severidade:** baixa · **Esforço:** P
- **Critério:** WCAG 1.4.11. Aqui não é exigido, porque o ícone ou o texto já identifica o controle (ícones de 15,48 a 17,46:1). O risco é a pessoa não ver a área clicável.
- **Onde:** GitHub (cabecalho.tsx:55), Alternar tema (botao-tema.tsx:30), Abrir menu (menu-secoes.tsx:45), os 8 botões de copiar (botao-copiar.tsx:52), e Instalar a extensão e Código no GitHub (variante outline do Button). Tokens --input e --border do @piluvitu/ui.
- **Medição:** Calculei a razão com as cores computadas e compostas. Claro: borda #d7dfea sobre #f7f9fc dá 1,27:1 (sobre #ffffff, 1,34:1). Escuro: #1c3140 sobre #090b11 dá 1,46:1 (sobre #0f141f, 1,37:1).
- **Como corrigir:** É decisão do design system: um token --input com pelo menos 3:1 no @piluvitu/ui, ou manter como está e registrar a escolha. A área de 44 px do achado 03 já ajuda a pessoa a achar onde clicar.
- **Verificação:** confirmado pelo verificador independente.

### SITE-10 · Links no meio do texto com 21 px de altura nas páginas de texto

- **Severidade:** baixa · **Esforço:** P
- **Critério:** O WCAG 2.5.8 isenta alvos em linha. A skill pede 44 px e não trata desse caso; fica separado dos achados 03 e 04, como o pedido orientou.
- **Onde:** /privacidade: help@pilutech.com.br (2 vezes), termos de uso, política de privacidade da Vercel, política de privacidade da Zoho, abertos, ANPD e histórico do código-fonte. /termos: política de privacidade (2 vezes), licença MIT, histórico do código-fonte e help@pilutech.com.br.
- **Medição:** No alvos.mjs, todos têm display inline e 21 px de altura (49 px quando quebram em duas linhas a 320), e todos são sublinhados (text-decoration underline).
- **Como corrigir:** Manter: padding vertical num link de texto empurra as linhas. Se quiser aproximar dos 44 px, usar 'prose-a:py-1' ou um entrelinha maior. Registrar essa exceção no padrão da PiluTech.
- **Verificação:** confirmado pelo verificador independente.

### SITE-11 · Links que abrem nova aba sem avisar

- **Severidade:** baixa · **Esforço:** P
- **Critério:** WCAG 3.2.5 (AAA), técnica G201; é boa prática.
- **Onde:** components/botoes-loja.tsx:30 (Chrome Web Store e Firefox Add-ons); app/privacidade/page.tsx:313, 328, 364, 399 e 420; app/termos/page.tsx:67 e 213.
- **Medição:** O estrutura.mjs achou target=\_blank em 2 links da landing, 5 da /privacidade e 2 da /termos. O nome acessível de todos é só o texto, sem nenhum 'nova aba'.
- **Como corrigir:** Somar '&lt;span className="sr-only"> (abre em nova aba)&lt;/span>' e um ícone aria-hidden, ou tirar o target. Atenção a dois efeitos: o texto sr-only entra no llms-full.txt (o conversor lê sr-only), e o pagina.e2e.ts:106 trava o target=\_blank dos links das lojas.
- **Verificação:** confirmado pelo verificador independente.

### SITE-12 · Nas páginas de texto, o foco usa o anel padrão do navegador, e não o do site

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Consistência. O WCAG 2.4.7 é cumprido.
- **Onde:** components/topo.tsx:14-17 (link 'Botaí') e os links do corpo de /privacidade e /termos.
- **Medição:** O outline computado é 'auto 1px', o anel do Chromium. Ele é visível: a diferença de pixels chega a razões máximas de 5,67 a 12,84:1. Os outros controles do site usam um anel primary de 2 px.
- **Como corrigir:** Usar a constante FOCO do rodapé no link do Topo. No Documento, somar 'prose-a:rounded-sm prose-a:outline-hidden prose-a:focus-visible:ring-2 prose-a:focus-visible:ring-ring'.
- **Verificação:** confirmado pelo verificador independente.

### SITE-13 · Não há link para pular para o conteúdo

- **Severidade:** baixa · **Esforço:** P
- **Critério:** O WCAG 2.4.1 é cumprido pelos landmarks (header, nav, main e footer). Isto é uma melhoria.
- **Onde:** components/cabecalho.tsx (landing) e components/topo.tsx (páginas de texto).
- **Medição:** A 1280 px há 8 paradas de Tab antes do primeiro controle do main: marca, 4 âncoras, Docs, GitHub e tema. A 320 px são 5. A primeira parada, a marca, já leva a #topo (o main): Enter na marca seguido de Tab foi parar em 'Ler a documentação'.
- **Como corrigir:** Pôr um link 'Pular para o conteúdo' ('sr-only focus:not-sr-only') antes do cabeçalho, apontando para #topo. Ou aceitar como está.
- **Verificação:** confirmado pelo verificador independente.

### SITE-14 · O menu de seções fica aberto quando o foco sai dele, e Escape no conteúdo puxa o foco de volta ao topo

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Padrão disclosure do WAI-ARIA e a regra da skill sobre ordem de foco. O WCAG 2.4.11 é cumprido: nada fica encoberto (medido).
- **Onde:** components/menu-secoes.tsx:18-35 (efeito do Escape e do clique fora) e :38-47 (o botão, com aria-label fixo 'Abrir menu').
- **Medição:** A 320 e a 768 px: Enter abre o menu, e Tab 1 a 4 percorre os links do painel. O Tab 5 vai para 'Ler a documentação' com o painel ainda aberto (painel=true), mas sem encobrir nada (coberto=não). Com o foco em 'Instalar a extensão', Escape fechou o menu e levou o foco ao 'Abrir menu', lá em y=20. Com o menu aberto, o rótulo continua 'Abrir menu' com aria-expanded=true, enquanto o ícone vira X.
- **Como corrigir:** Fechar o menu no focusout quando o relatedTarget sai da raiz. Tratar o Escape só quando o foco está dentro da raiz. Usar um rótulo fixo, como 'Menu de seções', junto com o aria-expanded.
- **Verificação:** confirmado pelo verificador independente.

### SITE-15 · Quando o copiar falha, nada avisa

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Regra da skill: o erro diz o que houve e como corrigir, perto do campo, e é anunciado.
- **Onde:** components/botao-copiar.tsx:34-41 (o catch volta sem fazer nada).
- **Medição:** Com o navigator.clipboard.writeText rejeitando (NotAllowedError), Enter em 'Copiar comando' deixou o ícone em copy e o role=status vazio. Com a permissão concedida, o ícone vira check e o status diz 'Copiado'. Ficou como baixa porque, em HTTPS e depois de um clique, o writeText costuma funcionar: é um risco latente.
- **Como corrigir:** No catch, pôr no status 'Não deu para copiar. Selecione o comando e use Ctrl+C.' e mostrar um ícone de aviso por 1,6 s.
- **Verificação:** confirmado pelo verificador independente.

### SITE-V02 · O botão de tema não diz qual tema está ativo: o nome é 'Alternar tema' nos dois temas, sem aria-pressed, e o ícone de estado é aria-hidden

- **Severidade:** baixa · **Esforço:** P
- **Critério:** WCAG 4.1.2 (Nome, função e valor), como boa prática para botão de alternância: o estado que o ícone mostra (lua no claro, sol no escuro) não chega ao leitor de tela. Também a regra da skill de nome acessível. O critério não falha de forma clara, porque o rótulo descreve uma ação.
- **Onde:** components/botao-tema.tsx:26-34, nas três rotas (no cabeçalho da landing e no Topo de /privacidade e /termos), nos dois temas.
- **Medição:** No Chrome 157 (n404.mjs), com o ariaSnapshot do botão e os atributos lidos: no claro, '- button "Alternar tema"', aria-pressed=null e o ícone visível 'moon aria-hidden=true'; no escuro, '- button "Alternar tema"', aria-pressed=null e o ícone visível 'sun aria-hidden=true'. Quem usa leitor de tela, inclusive com baixa visão, não sabe qual tema está ativo nem para qual o botão vai trocar.
- **Como corrigir:** Trocar o rótulo pelo efeito depois de montar, já que o resolvedTheme é indefinido no servidor: 'Usar tema escuro' ou 'Usar tema claro'. Outra saída é um rótulo fixo 'Tema escuro' com aria-pressed={resolvedTheme === 'dark'}. Cobrir no botao-tema.test.tsx e atualizar o seletor getByRole('button', { name: 'Alternar tema' }) nos E2E.
- **Origem:** achado do verificador, que não estava na auditoria; medido por ele.

## Documentação e llms.txt

As 81 páginas do sitemap e a 404, no build local servido por `docusaurus serve`, nos dois temas, a 1280 e a 320 px. E o `llms.txt` e o `llms-full.txt` dos dois sites, em produção, só por GET.

| ID      | Achado                                                                                                                                                                  | Severidade | Esforço |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- |
| DOC-01  | Realce de código (Prism) abaixo de 4,5:1: 6 cores do themes.github no claro e o comentário do dracula no escuro                                                         | alta       | P       |
| DOC-02  | Links no meio do texto se distinguem só pela cor, sem sublinhado                                                                                                        | alta       | P       |
| DOC-03  | Foco fica inteiro embaixo da navbar fixa (depois do link de pular, com Shift+Tab e nos botões dos blocos de código a 320 px)                                            | alta       | P       |
| DOC-04  | Menu mobile não se comporta como painel: o foco vai para trás dele, Esc não fecha e, ao fechar, o foco se perde                                                         | alta       | M       |
| DOC-05  | Botão Fechar do menu mobile: ícone a 2,90:1 no tema claro e alvo de 21×21 px                                                                                            | alta       | P       |
| DOC-06  | "Voltar para o topo" anima a rolagem mesmo com reduzir movimento                                                                                                        | alta       | P       |
| DOC-07  | A documentação não tem teste automatizado de acessibilidade (axe, teclado, ariaSnapshot)                                                                                | alta       | M       |
| DOC-10  | Botões Copiar e "Alternar quebra de linha" ficam invisíveis em repouso e a 2,14:1 no tema claro quando o mouse está sobre o bloco                                       | alta       | P       |
| DOC-V01 | Botões de alternância sem estado programático: "Nesta página" sem aria-expanded e "Alternar quebra de linha" sem aria-pressed, com o estado ligado mostrado só pela cor | alta       | P       |
| DOC-08  | Nome acessível em inglês, "(opens in new tab)", nos links externos da navbar e do rodapé                                                                                | média      | P       |
| DOC-09  | Seção ativa do sumário e página atual na barra lateral indicadas só por cor                                                                                             | média      | P       |
| DOC-11  | Tabelas largas rolam na horizontal sem foco próprio (scrollable-region-focusable)                                                                                       | média      | M       |
| DOC-12  | Alvos entre 24 e 43 px (abaixo do padrão PiluTech de 44)                                                                                                                | média      | M       |
| DOC-13  | Texto a 200% numa tela de 320 px gera rolagem horizontal de 79 a 92 px (rodapé e paginação)                                                                             | média      | P       |
| DOC-14  | O título da página 404 não diz que a página não existe                                                                                                                  | média      | P       |
| DOC-15  | No tema escuro, as variáveis --ifm-\* padrão do Infima vencem os tokens --botai-\* (fundo e texto secundário)                                                           | baixa      | P       |
| DOC-16  | O link da marca é lido como "Botaí Botaí" (alt do logo repete o título)                                                                                                 | baixa      | P       |
| DOC-17  | Emoji no nome dos cards das páginas de índice gerado                                                                                                                    | baixa      | P       |
| DOC-18  | Tabela com cabeçalho vazio em /navegador/esm-com-bundler                                                                                                                | baixa      | P       |
| DOC-19  | O foco visível depende do anel padrão do navegador (não há estilo :focus-visible próprio)                                                                               | baixa      | P       |
| DOC-20  | llms da documentação: o robots e o sitemap não citam o llms-full.txt, os links externos não são conferidos, e en/es dependem da localização                             | baixa      | P       |
| DOC-V03 | A confirmação "Copiado" vem só da troca do aria-label do botão por cerca de 1 s, sem região viva                                                                        | baixa      | P       |
| DOC-V04 | "Voltar para o topo" fica invisível no modo de cores forçadas (Alto contraste do Windows)                                                                               | baixa      | P       |

Repetidos, tratados no achado principal: DOC-V02 → LOC-11.

### DOC-01 · Realce de código (Prism) abaixo de 4,5:1: 6 cores do themes.github no claro e o comentário do dracula no escuro

- **Severidade:** alta · **Esforço:** P
- **Critério:** WCAG 1.4.3 Contraste (Mínimo), AA: texto normal ≥ 4,5:1 (código a 14,72 px, peso 400)
- **Onde:** documentacao/docusaurus.config.mjs:80-82 (prism.theme = themes.github, darkTheme = themes.dracula). Afeta todo bloco de código: 62 das 82 páginas no claro e 9 no escuro, a 1280 e a 320 px. Exemplos: flags de bash (parameter.variable, 623 nós em 47 páginas, como /cli/pessoas), propriedades JSON (291 nós, /cli/pessoa), números (377), strings (843), funções e métodos (\~540), chaves YAML (/docker/docker-compose, /docker/github-actions), comentários (/cli/pessoas, /cli/receitas-de-banco, /conceitos/envelope-e-esquema, /integracoes/go…) e imports Java (/integracoes/java, /integracoes/selenium).
- **Medição:** axe color-contrast (serious): claro com 3024 nós em 62 páginas, iguais a 1280 e a 320 px; escuro com 13 nós em 9 páginas. Cores sobre o fundo do bloco #f6f8fa no claro: #36acaa (number, boolean, constant, property, variable, parameter.variable) 2,58:1; #00a4db (key.atrule, attr-name) 2,69:1; #999988 (comment) 2,71:1; #d73a49 (function, method) 4,30:1; #e3116c (string, attr-value) 4,32:1; namespace #393a34 com opacity .7 4,49:1. Escuro, sobre #282a36: só o comment #6272a4 falha, com 3,03:1; os demais tokens do dracula ficam entre 5,90 e 13,36:1. A varredura própria (contraste-1280.txt) bate com o axe token a token. Também medi os 17 temas do prism-react-renderer: nenhum tema claro passa inteiro (vsLight fica em attr-name 4,00; oneLight tem mínimo 2,47).
- **Como corrigir:** Em docusaurus.config.mjs, derivar os dois temas e trocar só as cores que falham: {...themes.github, styles: themes.github.styles.map(...)}. Trocas calculadas: #36acaa→#0f7674 (5,11:1), #00a4db→#0a6f9e (5,22:1), #999988→#6a6a5c (5,15:1), #d73a49→#c62b3a (5,18:1), #e3116c→#c4105e (5,51:1) e opacity do namespace .7→1 (10,79:1). No dracula, comment #6272a4→#8a96c2 (4,90:1). Acrescentar em docusaurus.config.test.mjs um teste que reprova qualquer style.color (com a opacity aplicada) abaixo de 4,5:1 contra plain.backgroundColor, nos dois temas.
- **Verificação:** confirmado pelo verificador independente.

### DOC-02 · Links no meio do texto se distinguem só pela cor, sem sublinhado

- **Severidade:** alta · **Esforço:** P
- **Critério:** WCAG 1.4.1 Uso de cor, A (pela técnica G183, um link sem sublinhado precisa de 3:1 contra o texto em volta e de pista no foco/hover). Regra da skill: "nada depende só de cor".
- **Onde:** Links em parágrafos e listas do conteúdo (.theme-doc-markdown) em 66 das 82 páginas, nos dois temas e nas duas larguras. Exemplos: /faq, /cli/visao-geral, /comecar/instalacao e /biblioteca/gerar-pessoa. O Infima usa --ifm-link-decoration: none, e src/css/custom.css não define sublinhado.
- **Medição:** axe link-in-text-block (serious): 303 nós em 66 páginas a 1280 e 300 nós a 320, nos dois temas. Claro: link #055b80 contra o texto #0f141f, 2,46:1. Escuro: #3abff8 contra #e7ecf3, 1,77:1. O sublinhado só aparece no hover. O contraste do link contra o fundo passa (7,07:1 no claro, 8,18:1 no escuro); o que falha é a diferença em relação ao texto.
- **Como corrigir:** Em src/css/custom.css: .theme-doc-markdown a:not(.hash-link):not(.card) { text-decoration: underline; text-underline-offset: .15em }. Medido injetando esse CSS: link-in-text-block caiu de 24 para 0 nós em /cli/pessoa, /faq e /comecar/escolha-sua-porta (escuro).
- **Verificação:** confirmado pelo verificador independente.

### DOC-03 · Foco fica inteiro embaixo da navbar fixa (depois do link de pular, com Shift+Tab e nos botões dos blocos de código a 320 px)

- **Severidade:** alta · **Esforço:** P
- **Critério:** WCAG 2.4.11 Foco não encoberto (Mínimo), AA
- **Onde:** Navbar com position: sticky e 60 px de altura (.navbar--fixed-top); o html não tem scroll-padding-top (valor computado 'auto'). Cabe em src/css/custom.css. Casos medidos: (a) depois de Enter em "Pular para o conteúdo principal", o Tab seguinte cai na trilha ("Página Inicial", y=16, h=31) e no item seguinte, os dois inteiros sob a navbar, em /cli/pessoa, /referencia/campos-reconhecidos e /faq, a 1280 e a 320; (b) Shift+Tab a 1280: 10 focos encobertos em /faq (por exemplo "Reproduzir uma falha" y=38 e os botões Copiar/Alternar quebra de linha y=0) e 1 em /cli/pessoa; (c) Tab a 320 em /cli/pessoa: 4 focos (Copiar e Alternar quebra de linha em y=8); Shift+Tab a 320: 10 em /faq, 7 em /cli/pessoa e 5 em /referencia/campos-reconhecidos ("Nesta página" em y=0).
- **Medição:** Para cada foco, elementFromPoint em 9 pontos do elemento: 0 de 9 visíveis, com a navbar por cima. Contagem por página e modo em encoberto.txt.
- **Como corrigir:** Em src/css/custom.css: html { scroll-padding-top: calc(var(--ifm-navbar-height) + 0.5rem); }. Medido injetando esse CSS: 0 focos encobertos nas 18 combinações (3 páginas × 2 larguras × Tab, Shift+Tab e pular+Tab).
- **Verificação:** confirmado pelo verificador independente.

### DOC-04 · Menu mobile não se comporta como painel: o foco vai para trás dele, Esc não fecha e, ao fechar, o foco se perde

- **Severidade:** alta · **Esforço:** M
- **Critério:** WCAG 2.4.11 Foco não encoberto (AA) e 2.4.3 Ordem do foco (A). Regra da skill: Esc fecha, e nada prende o foco nem o deixa escapar para trás do painel enquanto ele está aberto.
- **Onde:** A 320 px, o botão "Alternar painel de navegação" abre o painel lateral do tema classic (NavbarMobileSidebar; não há swizzle em documentacao/src). Medido em /cli/pessoa nos dois modos de movimento.
- **Medição:** (1) Ao abrir com Enter, aria-expanded passa de false para true, mas o foco fica no botão do menu; o 1º Tab vai para o link "Botaí" da navbar, atrás do painel (0/9 pontos visíveis). (2) Depois do último item ("FAQ", no passo 40), o Tab segue para o conteúdo de trás com o menu aberto: "Página Inicial", "CLI", "Nesta página", o bloco de código e "Alternar quebra de linha", todos 0/9 visíveis, cobertos pelo painel. (3) Escape não fecha ("aberto? true" depois do Esc). (4) Fechar pelo botão Fechar deixa o foco no body. (5) O main não fica inert nem aria-hidden, e o painel não tem role=dialog nem aria-modal.
- **Como corrigir:** Fazer um swizzle --wrap do NavbarMobileSidebar ou um client module: ao abrir, focar o primeiro item do painel; enquanto ele estiver aberto, pôr inert em main, no rodapé e no resto da navbar; Esc fecha; ao fechar (Esc ou botão), devolver o foco ao botão do menu. Cobrir com um E2E de teclado a 320 px.
- **Verificação:** confirmado pelo verificador independente.

### DOC-05 · Botão Fechar do menu mobile: ícone a 2,90:1 no tema claro e alvo de 21×21 px

- **Severidade:** alta · **Esforço:** P
- **Critério:** WCAG 1.4.11 Contraste não textual, AA (ícone que identifica o controle ≥ 3:1). Alvo: o 2.5.8 só passa pela exceção de espaçamento; o padrão PiluTech é 44.
- **Onde:** A 320 px, com o menu aberto, o .navbar-sidebar\_\_close ("Fechar painel de navegação"), tema claro. O ícone usa --ifm-color-emphasis-600 do Infima.
- **Medição:** Pixels (screenshot 2x): ícone #8d949e sobre #f7f9fc, 2,90:1 no claro; no escuro, #ccd0d5 sobre #090b11, 12,69:1. Caixa de 21×21 px; o alvo mais próximo ("← Voltar para o menu principal") está a 30 px do centro, então o 2.5.8 passa pela exceção de espaçamento.
- **Como corrigir:** Em src/css/custom.css: padding no .navbar-sidebar\_\_close até 44×44 e a cor do traço do ícone trocada para var(--ifm-color-emphasis-800) (#444950 sobre #f7f9fc dá 8,6:1, calculado).
- **Verificação:** confirmado pelo verificador independente.

### DOC-06 · "Voltar para o topo" anima a rolagem mesmo com reduzir movimento

- **Severidade:** alta · **Esforço:** P
- **Critério:** Regra da skill §1 Movimento (respeitar reduzir movimento, transições instantâneas). No WCAG equivale ao 2.3.3, que é AAA; entra como alta pela rubrica desta auditoria.
- **Onde:** Botão "Voltar para o topo" do tema (BackToTopButton). O useSmoothScrollTo do build (build/assets/js/main.\*.js) chama window.scrollTo({top, behavior: "smooth"}) sem consultar prefers-reduced-motion. Medido em /referencia/campos-reconhecidos a 1280.
- **Medição:** O caminho de código não é o window.scrollTo({behavior:'smooth'}). No useSmoothScrollTo (theme-common 3.10.2, lib/utils/scrollUtils.js:186-204), o scroll nativo suave só é usado quando o html tem scroll-behavior: smooth. Aqui o valor computado é 'auto', então o botão roda o smoothScrollPolyfill: um laço de requestAnimationFrame que, a cada frame, multiplica por 0,85 a distância que falta (linhas 160-175). Medido no Chrome 157, com prefers-reduced-motion: reduce (matchMedia true), em /referencia/campos-reconhecidos a 1280, amostrando o scrollY a cada frame: 5571, 4735, 4024, 3420, 2907, 2470, 2099…; a razão entre frames seguidos fica sempre em 0,85, são 45 frames com mudança e o scrollY só chega a 0 depois de 750 ms. Como a animação é JS, nenhuma preferência do navegador ou do SO consegue amortecê-la. Isso resolve o item 'Reduzir movimento ligado no SO' do nao\_verificado.
- **Como corrigir:** Fazer o swizzle --eject do BackToTopButton (@docusaurus/theme-classic). No onClick: if (prefersReducedMotion()) window.scrollTo(0, 0); else startScroll(0). O prefersReducedMotion vem de @docusaurus/theme-common. Não adianta trocar behavior 'smooth' por 'auto' num client module, porque o polyfill chama window.scrollTo(0, y) com número a cada frame. Também não adianta pôr html { scroll-behavior: smooth } só em @media (prefers-reduced-motion: no-preference): pela leitura de scrollUtils.js:194-200, com reduce o hook volta para o polyfill. Acrescentar um E2E com reducedMotion: 'reduce' que confere scrollY = 0 no frame seguinte ao clique.
- **Verificação:** confirmado pelo verificador independente.
  - O verificador refez a medição: A medição original atribuiu a animação ao scroll nativo, e esse diagnóstico leva a uma correção que não funciona (ver o ajuste do como\_corrigir). Medi de novo quadro a quadro e li o código do tema.
  - O verificador trocou a correção: Testei a correção proposta pelo auditor: um init script que troca behavior 'smooth' por 'auto' em window.scrollTo. A animação continuou igual, com os mesmos 45 frames, a razão de 0,85 por frame e 752 ms (t7-topo.txt, linha 'com o patch proposto').

### DOC-07 · A documentação não tem teste automatizado de acessibilidade (axe, teclado, ariaSnapshot)

- **Severidade:** alta · **Esforço:** M
- **Critério:** Regra da skill §1 Web, "Testes": @axe-core/playwright nas páginas principais (zero violações sérias ou críticas), teste de teclado e ariaSnapshot nos componentes ricos. A regra está totalmente ausente neste workspace.
- **Onde:** documentacao/package.json (o script test só roda node --test). Não há .e2e.ts nem axe em documentacao/ (git ls-files não acha nada), e o job documentacao do ci.yml só roda node --test e o build.
- **Medição:** git ls-files documentacao | grep -iE 'e2e|playwright|axe' só lista páginas de conteúdo (docs/playwright/\*.md), nenhum teste. Nenhum dos achados DOC-01 a DOC-06 tem trava contra regressão.
- **Como corrigir:** Criar um E2E do Playwright para o build servido, reaproveitando as versões que o site já usa (@playwright/test 1.64.1, axe-core 4.14.0 / @axe-core/playwright, respeitando minimumReleaseAge e trustPolicy): axe com wcag2a/aa, 21a/aa e 22aa em /, /cli, /cli/pessoa, /referencia/campos-reconhecidos, /faq e na 404, nos 2 temas e a 1280/320; teclado (pular, foco não encoberto, Esc no menu mobile); ariaSnapshot da navbar. Pôr num job do CI e na tabela de testes do documentacao/CLAUDE.md. Os scripts desta auditoria servem de base.
- **Verificação:** confirmado pelo verificador independente.

### DOC-10 · Botões Copiar e "Alternar quebra de linha" ficam invisíveis em repouso e a 2,14:1 no tema claro quando o mouse está sobre o bloco

- **Severidade:** alta · **Esforço:** P
- **Critério:** WCAG 1.4.11 Contraste não textual, AA (falha parcial: com foco por teclado e com hover no próprio botão, passa)
- **Onde:** Grupo de botões dos blocos de código (.buttonGroup\_\* do tema: opacity 0 em repouso, .4 com hover no bloco, 1 com hover ou foco no botão). Todas as páginas com código; medido em /cli/pessoa.
- **Medição:** copiar.mjs. Repouso: opacidade 0, 1,00:1 (invisível; em tela de toque, só aparece depois de tocar o bloco). Mouse sobre o bloco: opacidade 0,4, ícone #aaacab sobre #f6f8fa = 2,14:1 no claro e #7b7c81 sobre #282a36 = 3,44:1 no escuro. Mouse sobre o botão ou foco por teclado: opacidade 1, 10,79:1 e 13,36:1. O ícone de "copiado" (#00d600 no CSS) daria cerca de 1,86:1 sobre #f6f8fa: valor calculado das cores do CSS, não renderizado.
- **Como corrigir:** Em src/css/custom.css: .theme-code-block:hover \[class\*='buttonGroup'] button { opacity: 1 } e @media (hover: none) { \[class\*='buttonGroup'] button { opacity: 1 } }. Trocar o verde do sucesso por uma cor ≥ 3:1 (ex.: #1a7f37, 4,77:1 calculado sobre #f6f8fa). Se o seletor por classe com hash parecer frágil, fazer swizzle do CodeBlock/Buttons.
- **Verificação:** confirmado pelo verificador independente.
  - Severidade ajustada pelo verificador de media para alta: Renderizei o estado 'copiado' com a área de transferência simulada e o mouse sobre o botão. O ícone de sucesso, que é a única pista visual de que a cópia deu certo, mede #00d600 sobre #f6f8fa = 1,86:1 no tema claro, nos pixels de uma captura 3x. Pela rubrica, um ícone que informa abaixo de 3:1 é falha clara do 1.4.11, então alta. A opacidade .4 sozinha seria só falha parcial.
  - Verificador: repouso 1,00, mouse no bloco #abacab 2,14:1, mouse no botão 10,79:1; escuro: 3,42:1 e 13,36:1), o estado de sucesso renderizado. Ícone de 'copiado' com opacity 1: pixel #00d600 sobre #f6f8fa = 1,86:1 no claro e 7,20:1 no escuro sobre #282a36. O estado dura cerca de 1 s: o aria-label fica 'Copiado' de 5 ms a \~1030 ms e depois volta para 'Copiar código para a área de transferência'.

### DOC-V01 · Botões de alternância sem estado programático: "Nesta página" sem aria-expanded e "Alternar quebra de linha" sem aria-pressed, com o estado ligado mostrado só pela cor

- **Severidade:** alta · **Esforço:** P
- **Critério:** WCAG 4.1.2 Nome, função, valor (A): o estado expandido ou pressionado não é exposto. WCAG 1.4.1 Uso de cor (A) para o estado ligado da quebra de linha. Regra da skill: estado também tem forma, ícone ou texto.
- **Onde:** "Nesta página": TOCCollapsible/CollapseButton do tema classic (node\_modules @docusaurus/theme-classic 3.10.2 lib/theme/TOCCollapsible/CollapseButton/index.js:11-27), sem swizzle em documentacao/src. Está em 69 páginas do build e é o único acesso ao sumário abaixo de 997 px. Medido em /cli/pessoa a 320, claro e escuro. "Alternar quebra de linha": CodeBlock/Buttons/WordWrapButton (lib/theme/CodeBlock/Buttons/WordWrapButton/index.js:27-35 e styles.module.css: .wordWrapButtonEnabled só troca a color). Aparece em todo bloco de código que rola, com o mouse sobre o bloco ou com o foco. Medido em /cli/pessoa a 1280, claro e escuro.
- **Medição:** "Nesta página": aria-expanded=null antes e depois do clique que abre o sumário, e o ariaSnapshot dá '- button "Nesta página"' sem \[expanded]. A seta gira, então a pista visual existe, mas o leitor de tela não recebe o estado. "Alternar quebra de linha": aria-pressed=null com a quebra desligada e ligada (o code passou para white-space: pre-wrap), e o ariaSnapshot do grupo é igual nos dois estados. A única pista visual é a cor do ícone: #393a34 → #055b80 no claro (1,54:1 entre os estados) e #f8f8f2 → #3abff8 no escuro (1,97:1), sem mudança de forma, peso ou fundo. Classifiquei como alta porque o 4.1.2 falha de forma clara no controle de abrir e fechar que dá o único acesso ao sumário no celular.
- **Como corrigir:** Fazer o swizzle --wrap do TOCCollapsible/CollapseButton: export default (props) => &lt;CollapseButton {...props} aria-expanded={!props.collapsed} />. O componente original espalha as props no &lt;button>. Fazer o swizzle --eject do CodeBlock/Buttons/WordWrapButton com aria-pressed={wordWrap.isEnabled} e uma pista que não seja só cor quando ligado (fundo ou borda em var(--ifm-color-primary), ou outro ícone). Travar no E2E do DOC-07 com o ariaSnapshot (\[expanded=true] e \[pressed=true]).
- **Origem:** achado do verificador, que não estava na auditoria; medido por ele.

### DOC-08 · Nome acessível em inglês, "(opens in new tab)", nos links externos da navbar e do rodapé

- **Severidade:** média · **Esforço:** P
- **Critério:** Regra da skill §2 (nenhum texto de interface fora do idioma da página). WCAG 3.1.2 Idioma das partes (AA): o leitor de tela lê o trecho em inglês com a voz pt-BR.
- **Onde:** Ícone de link externo (IconExternalLink, svg com aria-label) nos links "Site", "GitHub" e "npm" da navbar (documentacao/docusaurus.config.mjs:53-68) e em "Política de privacidade" no rodapé (:71-77), nas 82 páginas. O pt-BR do @docusaurus/theme-translations 3.10.2 deixa a chave 'theme.IconExternalLink.ariaLabel' sem tradução, e não existe documentacao/i18n/.
- **Medição:** ariaSnapshot da navbar e do rodapé: link "Site(opens in new tab)", "GitHub(opens in new tab)", "npm(opens in new tab)" e "Política de privacidade(opens in new tab)". O locales/pt-BR/theme-common.json da 3.10.2 traz 'theme.IconExternalLink.ariaLabel' => '(opens in new tab)'. Todos os outros textos do tema saem em pt-BR (ver ja\_cumpre).
- **Como corrigir:** Criar documentacao/i18n/pt-BR/code.json com {"theme.IconExternalLink.ariaLabel": {"message": "(abre em nova aba)"}}, à mão ou via docusaurus write-translations --locale pt-BR guardando só essa chave. Acrescentar em docusaurus.config.test.mjs um teste que confere a chave.
- **Verificação:** confirmado pelo verificador independente.

### DOC-09 · Seção ativa do sumário e página atual na barra lateral indicadas só por cor

- **Severidade:** média · **Esforço:** P
- **Critério:** WCAG 1.4.1 Uso de cor, A. É um indicador suplementar (a trilha e o h1 também mostram a página), por isso falha parcial. Regra da skill: "estado também tem forma, ícone ou texto".
- **Onde:** Sumário desktop (.table-of-contents\_\_link--active) e barra lateral (página atual com aria-current=page e categoria-mãe ativa), em todas as páginas de doc, nos dois temas.
- **Medição:** Estilos computados: no sumário, ativo #055b80 e inativo #495769 dão 1,01:1 entre si no claro; no escuro, #3abff8 e #ffffff dão 2,10:1. O peso é o mesmo (400), não há sublinhado nem borda, e o item ativo não tem aria-current. Barra lateral: página atual #055b80 contra os links #606770, 1,30:1, mais um fundo rgba(0,0,0,.05) (#eaecef sobre #f7f9fc, cerca de 1,1:1); a categoria-mãe ativa só muda a cor.
- **Como corrigir:** Em src/css/custom.css: .table-of-contents\_\_link--active { font-weight: 700; box-shadow: inset 2px 0 0 currentColor; padding-left: .5rem } e .menu\_\_link--active\[aria-current='page'] { font-weight: 700; box-shadow: inset 3px 0 0 var(--ifm-color-primary) }.
- **Verificação:** confirmado pelo verificador independente.

### DOC-11 · Tabelas largas rolam na horizontal sem foco próprio (scrollable-region-focusable)

- **Severidade:** média · **Esforço:** M
- **Critério:** WCAG 2.1.1 Teclado, A. Falha parcial: o Chromium torna rolagens focáveis sozinho; outros navegadores não foram verificados.
- **Onde:** Tabelas Markdown, com display: block e overflow-x: auto do Infima. A 320, 65 tabelas em 41 das 81 páginas do sitemap rolam na horizontal (scrollWidth > clientWidth), e nenhuma tem tabindex no HTML. O axe acusa 48 delas em 32 páginas, porque não conta as que têm algum link ou elemento focável dentro. A 1280: /conceitos/dados-por-tras e /referencia/colunas.
- **Medição:** axe scrollable-region-focusable (serious): 2 nós em 2 páginas a 1280 e 48 nós em 32 páginas a 320, nos dois temas. No Chromium 1248 o Tab chegou na tabela de /cli/pessoa a 320 (passo 9: table "OpçãoO que faz…"), porque o Chrome foca rolagens sozinho. No Safari/WebKit as colunas fora da tela ficariam sem acesso por teclado (não verificado, ver nao\_verificado).
- **Como corrigir:** Plugin rehype em docs.rehypePlugins que envolve cada &lt;table> num &lt;div class="tabela-rolavel" role="region" tabindex="0" aria-label="Tabela: &lt;texto do 1º th>"> com overflow-x: auto, e a tabela volta a display: table. Testar com o axe do DOC-07.
- **Verificação:** confirmado pelo verificador independente.
  - O verificador corrigiu o lugar: Contei de novo por outro método, o scrollWidth de todas as tabelas. A correção (região focável com nome) precisa cobrir as 65 tabelas, não só as 48 do axe. No Chrome 157 o Tab chegou à tabela de /cli/pessoa no passo 10 (tabIndex -1, foco de rolagem do próprio Chrome), e duas setas para a direita a rolaram 22 px. Isso confirma a falha parcial: ela depende do navegador.

### DOC-12 · Alvos entre 24 e 43 px (abaixo do padrão PiluTech de 44)

- **Severidade:** média · **Esforço:** M
- **Critério:** Regra da skill (alvo ≥ 44×44). WCAG 2.5.8 Tamanho do alvo (Mínimo), AA: passa. Tudo tem ≥ 24 px, menos os links de 21 px do sumário e do rodapé, que passam pela exceção de espaçamento.
- **Onde:** Medido em /, /cli, /cli/pessoa, /referencia/campos-reconhecidos, /faq e na 404, a 1280 e a 320. Altura × largura: botão de tema 32×32; menu (hambúrguer) 30×30; links da navbar com 34 px de altura e marca com 32; links da barra lateral (e do menu mobile) com 32 px de altura e setas das categorias 44×32; trilha com 31 px (início 38×31); Copiar 33×33 e Alternar quebra de linha 34×34; âncoras "Link direto para…" 37×40 a 1280 e 30×30 a 320; botão "Nesta página" com 34 px de altura; links do sumário desktop e do rodapé com 21 px de altura. O Fechar do menu mobile (21×21) está no DOC-05.
- **Medição:** getBoundingClientRect (alvos.txt). Sumário desktop: n=32, altura mínima 21,1, 21 alvos &lt; 24, todos dentro da exceção de espaçamento (círculo de 24 px sem tocar outro alvo). Rodapé: altura 21, 12 &lt; 24, todos dentro da exceção. Links inline no texto ficam isentos pela exceção "inline".
- **Como corrigir:** Em src/css/custom.css: min-height: 44px e padding vertical nos .menu\_\_link, .menu\_\_caret, .navbar\_\_link, .breadcrumbs\_\_link, .table-of-contents\_\_link, .footer\_\_link-item e no \[class\*='tocCollapsibleButton']; 44×44 no botão de tema, no hambúrguer e no grupo de botões do código; padding na .hash-link. Medir de novo com o script de alvos (ou com o E2E do DOC-07).
- **Verificação:** confirmado pelo verificador independente.

### DOC-13 · Texto a 200% numa tela de 320 px gera rolagem horizontal de 79 a 92 px (rodapé e paginação)

- **Severidade:** média · **Esforço:** P
- **Critério:** Regra da skill: "Texto aumenta até 200% sem cortar nem sobrepor; layout aguenta Dynamic Type / zoom". Pelo WCAG passa: o 1.4.4 a 1280 e o 1.4.10 a 320 com texto normal estão ok.
- **Onde:** Rodapé (.footer\_\_link-item com width: max-content, do Infima) e paginação Anterior/Próxima (grade de 2 colunas sem minmax(0, 1fr)), em todas as páginas.
- **Medição:** Com html{font-size:200%} a 320×640: a página rola na horizontal +79 px em / e /faq e +92 px em /cli, /cli/pessoa, /referencia/campos-reconhecidos e /servidor/api-http. Culpados: a.footer\_\_link-item "Política de privacidade" com 367 px dentro de um pai de 256 px (width:max-content), e a.pagination-nav\_\_link indo até right=412.
- **Como corrigir:** Em src/css/custom.css: .footer\_\_link-item { width: auto; max-width: 100% } e .pagination-nav { grid-template-columns: minmax(0,1fr) minmax(0,1fr) } com .pagination-nav\_\_label { overflow-wrap: anywhere }. Medido: só a correção da paginação baixa /cli, /cli/pessoa etc. de +92 para +79; o +79 que sobra é o width:max-content do rodapé.
- **Verificação:** confirmado pelo verificador independente.

### DOC-14 · O título da página 404 não diz que a página não existe

- **Severidade:** média · **Esforço:** P
- **Critério:** WCAG 2.4.2 Página com título, A (falha parcial: só a 404)
- **Onde:** build/404.html, servido em qualquer rota inexistente (/pagina-que-nao-existe responde 404). &lt;title> = "Botaí — documentação", enquanto o h1 diz "Página não encontrada".
- **Medição:** page.title() depois da hidratação dá "Botaí — documentação"; build/404.html tem &lt;title data-rh="true">Botaí — documentação&lt;/title>. A tradução pt-BR 'theme.NotFound.title' ("Página não encontrada") existe, mas não chega ao título.
- **Como corrigir:** Fazer swizzle --wrap do NotFound/Content (ou da página NotFound) com &lt;PageMetadata title={translate({id:'theme.NotFound.title'})}/> e acrescentar no conferir-build.mjs uma verificação de que o 404.html tem "Página não encontrada" no &lt;title>.
- **Verificação:** confirmado pelo verificador independente.

### DOC-15 · No tema escuro, as variáveis --ifm-\* padrão do Infima vencem os tokens --botai-\* (fundo e texto secundário)

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Inconsistência de tema; o documentacao/CLAUDE.md diz que "as variáveis --ifm-\* do Infima saem deles". Sem falha de contraste medida.
- **Onde:** src/css/custom.css:4-79: o mapeamento --ifm-\* fica só em :root (especificidade 0,1,0), e o html\[data-theme=dark] do Infima (0,1,1) redefine --ifm-background-color, --ifm-color-content-secondary e outras.
- **Medição:** Varredura de contraste no escuro: o conteúdo fica sobre #1b1b1d (padrão do Infima), não sobre --botai-fundo (#090b11, que só a navbar usa); o sumário inativo sai #ffffff em vez de --botai-texto-suave. Os contrastes resultantes passam (texto 14,49:1, sumário 17,20:1). O custom.test.mjs confere o texto do CSS, não a cascata, e por isso não pega o problema.
- **Como corrigir:** Repetir o bloco de mapeamento --ifm-\* também sob html\[data-theme='dark'] (ou declarar o mapeamento com :root, html\[data-theme='dark']). Depois, medir de novo o contraste do escuro, porque os números de ja\_cumpre mudam.
- **Verificação:** confirmado pelo verificador independente.

### DOC-16 · O link da marca é lido como "Botaí Botaí" (alt do logo repete o título)

- **Severidade:** baixa · **Esforço:** P
- **Critério:** axe image-redundant-alt (best-practice, minor); WCAG 1.1.1 / H2
- **Onde:** Navbar (e menu mobile), nas 82 páginas: logo: { alt: 'Botaí' } em documentacao/docusaurus.config.mjs:52, ao lado do título "Botaí". O docusaurus.config.test.mjs:72 trava o alt 'Botaí'.
- **Medição:** axe: 82 nós em 82 páginas por combinação. ariaSnapshot: link "Botaí Botaí".
- **Como corrigir:** Deixar o alt do logo vazio (decorativo), já que o título dá o nome, e ajustar a asserção em docusaurus.config.test.mjs:72.
- **Verificação:** confirmado pelo verificador independente.

### DOC-17 · Emoji no nome dos cards das páginas de índice gerado

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Melhoria (leitor de tela anuncia o nome do emoji antes do título)
- **Onde:** Páginas geradas das 12 pastas (/cli, /biblioteca, /docker…): os cards do DocCard do tema têm h2 "📄️ &lt;título>".
- **Medição:** ariaSnapshot de /cli: link "📄️ Visão geral O comando botai no terminal…" e heading "📄️ Visão geral" \[level=2]. Os cards aparecem em 12 páginas (varredura de contraste).
- **Como corrigir:** Fazer swizzle --eject do DocCard e pôr o emoji num &lt;span aria-hidden="true">, ou trocar por um ícone SVG decorativo.
- **Verificação:** confirmado pelo verificador independente.

### DOC-18 · Tabela com cabeçalho vazio em /navegador/esm-com-bundler

- **Severidade:** baixa · **Esforço:** P
- **Critério:** axe empty-table-header (best-practice, minor); WCAG 1.3.1
- **Onde:** documentacao/docs/navegador/esm-com-bundler.md:39 (a primeira célula do cabeçalho da tabela "IIFE ou ESM" está vazia)
- **Medição:** axe: 1 nó, nas 4 combinações de tema e largura.
- **Como corrigir:** Escrever um rótulo na primeira célula (ex.: "Aspecto").
- **Verificação:** confirmado pelo verificador independente.

### DOC-19 · O foco visível depende do anel padrão do navegador (não há estilo :focus-visible próprio)

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Risco latente para o 2.4.7 (AA) e para a regra da skill (foco visível em tudo). No Chrome, passa.
- **Onde:** src/css/custom.css e o CSS do build não têm nenhuma regra de outline: todo foco usa o 'outline: auto' do navegador.
- **Medição:** No Chromium/Chrome: outline auto 1px rgb(0, 95, 204) no claro e rgb(153, 200, 255) no escuro, em todos os 70 focos medidos. A mudança de pixels dá contraste máximo de 5,67:1 no claro e de 9,88 a 11,3:1 no escuro. Safari e Firefox não foram medidos.
- **Como corrigir:** Em src/css/custom.css: :focus-visible { outline: 2px solid var(--ifm-color-primary); outline-offset: 2px } (≥ 6:1 nos dois temas, pelas cores medidas da primária), e incluir no E2E do DOC-07.
- **Verificação:** confirmado pelo verificador independente.

### DOC-20 · llms da documentação: o robots e o sitemap não citam o llms-full.txt, os links externos não são conferidos, e en/es dependem da localização

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Regra da skill §3. O que é obrigatório é cumprido (ver ja\_cumpre); aqui só há inconsistência entre os dois sites e risco latente.
- **Onde:** documentacao/static/robots.txt (só a linha '# llms.txt'); o sitemap da documentação acrescenta só o /llms.txt (sitemapComLlms em plugins/llms-txt.mjs); scripts/conferir-build.mjs confere só os links de docs.botai.pilutech.com.br. O site cita os dois arquivos no robots e no sitemap.
- **Medição:** GET em produção: docs robots.txt com "Sitemap: …/sitemap.xml" e "# llms.txt: …/llms.txt", sem llms-full; docs sitemap.xml com 82 &lt;loc>, "com llms: \['https://docs.botai.pilutech.com.br/llms.txt']". O site cita llms.txt e llms-full.txt nos dois. Nenhum dos llms.txt tem links en/es, porque as versões en/es dos sites ainda não existem; quando existirem, a skill pede esses links.
- **Como corrigir:** Acrescentar "# llms-full.txt: …" no static/robots.txt e o /llms-full.txt no createSitemapItems (com os testes de docusaurus.config.test.mjs e conferir-build.mjs). Conferir os links externos do llms.txt num teste de rede separado (como o seo.e2e.ts do site faz). Quando a documentação ganhar /en/ e /es/, gerar o llms.txt com os links desses idiomas.
- **Verificação:** confirmado pelo verificador independente.

### DOC-V03 · A confirmação "Copiado" vem só da troca do aria-label do botão por cerca de 1 s, sem região viva

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Risco para o WCAG 4.1.3 Mensagens de status (AA). Regra da skill: anúncio polite quando a pessoa age.
- **Onde:** CodeBlock/Buttons/CopyButton do tema (lib/theme/CodeBlock/Buttons/CopyButton/index.js: ariaLabel(isCopied) e setTimeout de 1000 ms), em todo bloco de código (62 páginas)
- **Medição:** Com a área de transferência simulada (o headless rejeita a escrita), Enter no botão: aria-label 'Copiado' de 5 ms a \~1030 ms e depois volta para 'Copiar código para a área de transferência'. Nenhum elemento \[aria-live], \[role=status] ou \[role=alert] na página. Não ouvi em leitor de tela: o anúncio depende de cada leitor falar a troca de nome do elemento focado, e no Safari o clique de mouse não foca o botão.
- **Como corrigir:** Fazer o swizzle --wrap/--eject do CopyButton com um &lt;span className="sr-only" aria-live="polite"> que recebe "Código copiado" quando a cópia dá certo e é limpo depois de alguns segundos. Cobrir no E2E do DOC-07.
- **Origem:** achado do verificador, que não estava na auditoria; medido por ele.

### DOC-V04 · "Voltar para o topo" fica invisível no modo de cores forçadas (Alto contraste do Windows)

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Melhoria: forced-colors / Alto contraste. O modo é do agente de usuário, então não é falha AA medida; está ligado ao espírito do 1.4.11.
- **Onde:** BackToTopButton do tema: .backToTopButton::after desenha a seta com mask + background-color, e o botão é clean-btn, sem borda. Visível em toda página longa depois de rolar para cima; medido em /referencia/campos-reconhecidos a 1280, tema claro.
- **Medição:** Captura 2x do botão com forcedColors 'none': ícone #757678 sobre #ebedf0 = 3,88:1. Com forcedColors 'active' (matchMedia true): a captura sai uniforme (#ffffff, nenhum pixel diferente, 1:1), e o botão some por completo, ícone e fundo. Para comparar: a seta das categorias e o botão de tema continuam visíveis (21:1) no mesmo modo.
- **Como corrigir:** Em src/css/custom.css: @media (forced-colors: active) { .theme-back-to-top-button { border: 1px solid ButtonText } .theme-back-to-top-button::after { background-color: ButtonText } }
- **Origem:** achado do verificador, que não estava na auditoria; medido por ele.

## Localização (produto inteiro)

A seção 2 da skill sobre o produto inteiro: extensão, site, documentação, lojas e, como apontamento, CLI e servidor. Fica fora do catálogo o que não se traduz por natureza: os dados gerados (nome, CPF, CNPJ, RG, PIS/NIS, título, CEP, endereço, celular, nascimento, e-mail e cartão, todos no formato brasileiro), as siglas de documento, o contrato técnico (flags da CLI, chaves do JSON e da API HTTP, códigos de saída, ids do menu e chaves de storage), os nomes de produto e marca e o atalho exibido, que vem do navegador.

Esforço por bloco, segundo o auditor: extensão G (cerca de 132 textos distintos em 21 arquivos, mais 2 do manifesto e 30 do core) e M por idioma; lojas M, mais M para as imagens; site G de infraestrutura (cerca de 213 textos da landing e 206 trechos das páginas legais), M por idioma na landing e G nas páginas legais; documentação M de configuração e GG por idioma (35.677 palavras de prosa); CLI, servidor e plugin G.

| ID      | Achado                                                                                                                                           | Severidade | Esforço |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------- |
| LOC-01  | Extensão só em pt-BR: sem \_locales, sem default\_locale, sem catálogo nem detecção de idioma                                                    | alta       | G       |
| LOC-02  | Site só em pt-BR: sem rotas /en e /es, sem hreflang, og:locale e lang fixos, sem seletor de idioma                                               | alta       | G       |
| LOC-03  | Documentação só em pt-BR: i18n do Docusaurus com um locale só; 69 páginas, cerca de 35,7 mil palavras de prosa                                   | alta       | GG      |
| LOC-04  | Fichas das quatro lojas só em pt-BR, e a Chrome Web Store só aceita ficha por idioma com \_locales no pacote                                     | alta       | M       |
| LOC-05  | O aviso injetado na página não declara idioma e herda o lang do site (texto pt-BR lido como inglês)                                              | alta       | P       |
| LOC-06  | Números e datas montados à mão no site e no popup, sem Intl (inclusive a VIGENCIA como 'texto pronto')                                           | média      | M       |
| LOC-07  | Plurais feitos à mão (`=== 1 ?`) em vez de Intl.PluralRules                                                                                      | média      | P       |
| LOC-08  | Texto dentro de imagem: capturas das lojas e do site com título e subtítulo em pt-BR, e o tile da Chrome com frase                               | média      | M       |
| LOC-09  | Botão 'Caixa de entrada' do popup não comporta texto 35% maior                                                                                   | média      | P       |
| LOC-11  | 'Powered by PiluTech' em inglês sem lang="en" no popup, no site e na documentação                                                                | média      | P       |
| LOC-V02 | Com palavras 35% maiores, a tabela de permissões de /privacidade gera rolagem horizontal a 320 e a 360 px, e os títulos longos estouram a 320 px | média      | P       |
| LOC-12  | Lógica que depende do texto pt-BR: recusados contados pelo sufixo ' (recusou o valor)'                                                           | baixa      | P       |
| LOC-13  | A troca manual de idioma esbarra na política de privacidade (só 3 chaves de storage) e no popup sem Ajustes                                      | baixa      | M       |
| LOC-14  | Testes amarrados ao texto pt-BR e ao idioma da máquina                                                                                           | baixa      | M       |
| LOC-15  | Link da Firefox Add-ons fixo em /pt-BR/ para todos os idiomas                                                                                    | baixa      | P       |
| LOC-16  | PRODUTO.md e READMEs só em pt-BR                                                                                                                 | baixa      | P       |
| LOC-V03 | Coluna de rótulos de 92 px no popup não comporta palavra única 35% maior                                                                         | baixa      | P       |

Repetidos, tratados no achado principal: LOC-10 → PAC-01, LOC-V01 → SITE-V01.

### LOC-01 · Extensão só em pt-BR: sem \_locales, sem default\_locale, sem catálogo nem detecção de idioma

- **Severidade:** alta · **Esforço:** G
- **Critério:** Skill §2: três idiomas (pt-BR, en, es), idioma do navegador com troca manual, nenhum texto de interface fixo no código; extensão com \_locales/pt\_BR, en, es e default\_locale pt\_BR. Regra obrigatória totalmente ausente.
- **Onde:** extensao/wxt.config.ts:46-48 e :74 (name/description/commands.description fixos); extensao/src/entrypoints/popup/index.html:2 (&lt;html lang="pt-BR"> fixo); textos fixos por arquivo (ocorrências): src/lib/grupos.ts 37, src/lib/menus.ts 30 (títulos do menu de contexto, :22-44 e :75-114), src/components/pagina-proibida.tsx 21, nenhum-campo.tsx 12, src/lib/textos.ts 11 (aviso e resultado), primeiro-uso.tsx 10, cabecalho-pessoa.tsx 9, resultado-preenchimento.tsx 8, faixa-favoritos.tsx 6, pessoa-pronta.tsx 6, cartao-das-proximas.tsx 5, src/lib/estado-popup.ts 4, cartao-atual.tsx 3, linha-copiavel.tsx 3, favorito-removido.tsx 2, rodape.tsx 2, preencher.content/aviso-dom.ts 2 ("Fechar", " · contorno tracejado"), src/lib/paginas.ts 2, credito-pilutech.tsx 1, popup-shell.tsx 1, src/lib/resultado.ts 1; e mais 30 textos do core exibidos no popup (packages/core/src/cartao.ts: 15 `rotulo` + 15 `descricao` dos cenários do cartão). Todas as telas (1a–1e), o aviso na página e o menu de contexto, nos dois temas.
- **Medição:** 1) A busca por `_locales` em extensao/ não achou nada. O grep de `i18n|__MSG_|getUILanguage|navigator.language|default_locale` em extensao/src e no wxt.config.ts também deu zero. 2) Nos manifestos construídos (.output/chrome-mv3, firefox-mv3, opera-mv3), `default_locale` é None, a description é 'Gerador de dados fake para formulários (CPF, CNPJ, CEP)' e commands.description é 'Preencher esta página'. 3) O extrator AST achou 176 ocorrências e 139 textos distintos de interface fixos em 21 arquivos de produção. A lista inteira está em extensao-ui.json. 4) No Chromium do Playwright, `chrome.i18n.getUILanguage()` devolve 'en-US', mas o popup segue com `document.documentElement.lang` 'pt-BR' e tudo em português.
- **Como corrigir:** 1) Criar `src/textos/pt-BR.ts`, `en.ts` e `es.ts`, com chaves estáveis por tela (ex.: `popup.primeiroUso.titulo`, `menu.inserir.cpf`, `aviso.preenchidos`, `cartao.stripe.recusado.rotulo`), e uma função `t(chave, vars)` com Intl.PluralRules e Intl.NumberFormat. 2) Os rótulos e as descrições dos cenários do cartão viram chaves pelo `id` do cenário: a extensão não exibe mais o texto pt-BR do core. 3) Resolver o idioma pela preferência guardada; sem ela, por `browser.i18n.getUILanguage()` reduzido a pt/en/es, e pt-BR quando não for nenhum dos três. 4) O `chrome.i18n.getMessage` não troca de idioma em tempo de execução. Por isso o catálogo TS atende popup, aviso e menus (o background monta os títulos e recria os menus quando o idioma muda). O `_locales/{pt_BR,en,es}/messages.json` fica só para o manifesto (`__MSG_nome__`, `__MSG_descricao__`, `__MSG_preencher__`, default\_title) e para a ficha da loja, com `default_locale: 'pt_BR'` no wxt.config.ts. 5) `document.documentElement.lang` passa a seguir o idioma escolhido. 6) Teste Vitest que falha se uma chave existir num idioma e faltar em outro, comparando também o `_locales`.
- **Verificação:** confirmado pelo verificador independente.
  - Verificador: Remedi a extensão por três outros caminhos. (1) Lancei o Chromium 1248 com --lang=es e locale es. chrome.i18n.getUILanguage() e navigator.language devolveram 'es', e o popup continuou com &lt;html lang="pt-BR"> e o texto todo em português ('DADOS DE TESTE', 'FAVORITOS', 'Guardar esta'). (2) Li o manifest.json dos 4 builds (chrome-mv3, firefox-mv3, opera-mv3 e chrome-mv3-e2e): default\_locale é None nos quatro, a description é fixa em pt-BR, commands.description é 'Preencher esta página' e action.default\_title é 'Botaí'. (3) Contei os textos por regex, outro método. Deu 103 ocorrências em 22 arquivos; o regex não pega palavra solta, mas a ordem de grandeza bate com a do extrator AST. Correção na contagem: os 139 textos distintos incluem 7 siglas (CPF, RG, CEP, UF, CNPJ, CVV, PIS/NIS; 15 ocorrências) que o próprio auditor classifica como 'não se traduz'. Sem elas ficam 161 ocorrências e 132 textos distintos.

### LOC-02 · Site só em pt-BR: sem rotas /en e /es, sem hreflang, og:locale e lang fixos, sem seletor de idioma

- **Severidade:** alta · **Esforço:** G
- **Critério:** Skill §2: sites com rotas por idioma (/, /en/, /es/) com hreflang e lang certos; catálogo por idioma com chaves estáveis; nenhum texto de interface fixo no código. Regra obrigatória totalmente ausente.
- **Onde:** site/app/layout.tsx:29 (lang="pt-BR" fixo); site/lib/seo.ts:85 (openGraph.locale 'pt\_BR' fixo) e :82 (alternates só canonical); site/app/manifest.ts:10 (lang fixo); site/lib/json-ld.ts:49 e :62 (inLanguage 'pt-BR'); site/app/sitemap.ts (sem alternates). Textos: \~213 ocorrências na landing (118 em lib/\*.ts: conteudo, portas, personas, numeros, regras, capturas, extensao, integracoes; 95 no JSX de componentes: cabecalho, rodape, hero, chamada-final, cuidados, extensao, mesma-semente, pessoa-pronta/exemplo, formulario-exemplo, tabela-atalhos…), 206 trechos nas páginas legais (app/privacidade/page.tsx 134, app/termos/page.tsx 73), 17 de metadados (lib/seo.ts), 18 do llms (lib/llms.ts), 7 das imagens OG. Rotas /, /privacidade, /termos, em todas as larguras.
- **Medição:** 1) No build de produção (site/.next), as três páginas têm hreflang=0, rel="alternate"=0, og:locale=pt\_BR e &lt;html lang="pt-BR">. 2) Nenhuma rota en/es: `ls .next/server/app | grep -E '^(en|es)'` dá 0. 3) O sitemap tem 5 URLs, sem alternates. 4) Tamanho do conteúdo, contado no llms-full.txt construído: home 1.552 palavras, privacidade 2.289, termos 1.166 (5.062 no total). 5) O extrator AST achou 581 literais. A classificação deu: landing 213 (30 arquivos), páginas legais 206 (2 arquivos), técnico ou nome 79, erro de build (só dev) 27, llms 18, metadados 17, código 10, OG 7.
- **Como corrigir:** 1) Mover as páginas para um segmento de idioma (ex.: `app/[idioma]/…`, com generateStaticParams para pt-BR, en e es), deixando o pt-BR em `/` por rewrite e en/es em /en e /es. As rotas estáticas do `scripts/conferir-rotas-estaticas.mjs` mudam junto. 2) Criar `site/textos/{pt-BR,en,es}.ts` com chaves estáveis. Os textos que já moram em lib/\*.ts migram primeiro; o JSX dos componentes e das páginas legais passa a ler do catálogo. 3) `metadataDaPagina` recebe o idioma e devolve: - `alternates.languages` = {'pt-BR': '/…', en: '/en/…', es: '/es/…', 'x-default': '/…'}; - `openGraph.locale` (pt\_BR, en\_US, es\_ES) e `alternateLocale`; - `inLanguage` no JSON-LD. O `<html lang>` vem do segmento. 4) Sitemap com `alternates.languages` em cada URL. 5) Seletor de idioma no cabeçalho e no rodapé, com links para a mesma página nos outros idiomas e o `lang` de cada opção. O idioma do navegador entra por uma sugestão ou um redirecionamento só no primeiro acesso a `/` (Accept-Language + cookie da escolha manual, nunca para robôs), a decidir com o Paulo. 6) Imagens OG geradas por idioma. 7) Teste de paridade de chaves e E2E com hreflang e lang por rota. 8) As páginas legais em en/es levam a cláusula de que a versão pt-BR prevalece, com OK do Paulo.
- **Verificação:** confirmado pelo verificador independente.

### LOC-03 · Documentação só em pt-BR: i18n do Docusaurus com um locale só; 69 páginas, cerca de 35,7 mil palavras de prosa

- **Severidade:** alta · **Esforço:** GG
- **Critério:** Skill §2: todo produto nos três idiomas; sites com rotas por idioma e hreflang. Regra obrigatória totalmente ausente.
- **Onde:** documentacao/docusaurus.config.mjs:23 (`i18n: { defaultLocale: 'pt-BR', locales: ['pt-BR'] }`); title/tagline (:8-10), navbar (:52-71), rodapé (:73-79) e os 12 `_category_.json` de documentacao/docs; 69 páginas .md em documentacao/docs; documentacao/docusaurus.config.test.mjs:18 trava o i18n só pt-BR; plugins/llms-txt.mjs e scripts/exemplos.mjs:23 (lê só documentacao/docs).
- **Medição:** 1) Contagem nos 69 .md de docs/: 44.924 palavras, sendo 35.677 de prosa e 9.247 dentro de 465 blocos de código. Há 12 categorias. 2) O build (documentacao/build/index.html) tem &lt;html lang="pt-BR">, hreflang só 'pt-BR' e 'x-default', og:locale pt\_BR e nenhuma pasta build/en ou build/es. 3) O tema traz as traduções prontas: @docusaurus/theme-translations 3.10.2 tem pt-BR (151 chaves) e es (151 chaves), e o en é a base do próprio tema.
- **Como corrigir:** 1) `i18n: { defaultLocale: 'pt-BR', locales: ['pt-BR', 'en', 'es'], localeConfigs: { en: { htmlLang: 'en' }, es: { htmlLang: 'es' } } }`. O Docusaurus gera /en/ e /es/ com hreflang sozinho. 2) `docusaurus write-translations --locale en` e `--locale es` geram i18n/&lt;locale>/code.json, o current.json com as 12 categorias e o navbar/footer; traduzir esses arquivos. 3) Traduzir as páginas em i18n/&lt;locale>/docusaurus-plugin-content-docs/current/, como texto de produto e não tradução literal. Flags, JSON e saídas da CLI ficam como estão. 4) Atualizar o docusaurus.config.test.mjs. 5) Teste novo que falha se uma página de docs/ não existir em cada locale. 6) `scripts/exemplos.mjs` também roda os blocos `bash testar` das cópias. 7) Conferir que o plugin llms-txt gera um llms.txt por locale (hoje ele lê só a versão carregada) e que o llms.txt pt-BR linka os de en/es. 8) O build da Vercel fica cerca de 3 vezes mais longo.
- **Verificação:** confirmado pelo verificador independente.

### LOC-04 · Fichas das quatro lojas só em pt-BR, e a Chrome Web Store só aceita ficha por idioma com \_locales no pacote

- **Severidade:** alta · **Esforço:** M
- **Critério:** Skill §2: lojas com ficha nos três idiomas quando a loja permitir; extensão com ficha nos três idiomas.
- **Onde:** extensao/loja/textos.md (título '(pt-BR)'; Resumo, Descrição e Nome são os campos públicos); extensao/loja/README.md (o que vai em cada loja); Chrome Web Store, Firefox Add-ons, Edge Add-ons e Opera Add-ons.
- **Medição:** 1) textos.md tem uma única versão, pt-BR. Tamanho dos campos públicos: Resumo com 24 palavras e 138 caracteres; Descrição com 296 palavras e 1.760 caracteres. Na Chrome, o resumo é o `description` do manifesto (55 caracteres). 2) A doc da Chrome Web Store (developer.chrome.com/docs/webstore/cws-dashboard-listing) diz: 'If you have localized your extension, you will be able to provide a description, screenshots, and promotional video in the locales your extension supports', 'Each locale corresponds to one of the \_locales/LOCALE\_CODE directories included in the extension' e 'The small tile and Marquee promo tile cannot be localized'. 3) A Extension Workshop da Mozilla diz que a AMO deixa localizar quase todo o texto da ficha, mas 'you can only load one set of screenshots, although you can localize their descriptions'.
- **Como corrigir:** 1) Depois do LOC-01 (`_locales` en e es no pacote), escrever `loja/textos.en.md` e `loja/textos.es.md`, só com os campos públicos: Nome, Resumo e Descrição (o resumo da Chrome e do Edge sai do `__MSG_descricao__`). Justificativas, Propósito único e Dados são campos de revisão e ficam em pt-BR. 2) Estender o `loja/textos.test.ts`: limites de caracteres por idioma (o `description` do manifesto tem no máximo 132), mesmas seções nos três arquivos e a grafia 'Botaí'. 3) Na AMO, adicionar as traduções da ficha no painel. Na Chrome e no Edge, preencher a ficha de cada locale do pacote. Conferir o Opera. 4) Como é texto público, passa pelo OK do Paulo.
- **Verificação:** confirmado pelo verificador independente.
  - Verificador: Acrescentar o Edge, que estava em 'não verificado'. A doc 'Publish a Microsoft Edge extension' (learn.microsoft.com, atualizada em 2026-09-02) diz o seguinte. 1) O Partner Center descobre os idiomas da ficha pelo \_locales e só quando o manifesto usa \_\_MSG\_ em name e em description e tem default\_locale. Trecho: 'This happens when the manifest file uses hardcoded strings instead of localized message references... Partner Center uses these message references to identify available languages. If these message references are missing, the language will be skipped'. 2) Cada idioma do pacote exige Description (de 250 a 10.000 caracteres) e Extension logo. 3) Small tile, large tile e screenshots são 'one per language'. No Edge esses itens são localizáveis, ao contrário do small tile da Chrome Web Store. 4) Short description e Extension name saem do manifesto e não se editam no painel. Opera: a página de publishing guidelines não fala de localização da ficha, então continua não verificado.

### LOC-05 · O aviso injetado na página não declara idioma e herda o lang do site (texto pt-BR lido como inglês)

- **Severidade:** alta · **Esforço:** P
- **Critério:** WCAG 2.2 3.1.2 Idioma das partes (AA). Skill §1, web: 'idioma trocado em trechos com lang'. Depois da localização, o idioma do aviso (o da extensão) nunca vai coincidir sempre com o da página.
- **Onde:** extensao/src/entrypoints/preencher.content/aviso-dom.ts:88-121 (construirAviso: nenhum `lang` no toast nem no host `botai-aviso`) e aviso.ts (createShadowRootUi). Estado: aviso 1f, depois de 'Preencher esta página', em qualquer site cujo &lt;html lang> não seja pt.
- **Medição:** Numa página &lt;html lang="en"> servida por route (Chromium 1248 + build chrome-mv3-e2e), o aviso mostrou o título '2 de 3 campos preenchidos' e a linha '1 não reconhecido · contorno tracejado'. Subindo do toast pela shadow root até o documento, o lang efetivo é 'en' e o host não tem lang. O bundle do content script não tem nenhuma ocorrência de 'lang'.
- **Como corrigir:** Em construirAviso, `aviso.setAttribute('lang', idiomaDaExtensao)`: hoje 'pt-BR'; depois do LOC-01, o idioma resolvido pelo catálogo, passado pelo background junto com o título. Teste Vitest em aviso-dom.test.ts que confere o atributo, e uma asserção no preencher.e2e.ts com página lang="en".
- **Verificação:** confirmado pelo verificador independente.
  - Também registrado como EXT-13 (extensão, severidade média): aviso-dom.ts:84-90: construirAviso não define lang. aviso.ts:11-22: o host é anexado no &lt;html> do site.

### LOC-06 · Números e datas montados à mão no site e no popup, sem Intl (inclusive a VIGENCIA como 'texto pronto')

- **Severidade:** média · **Esforço:** M
- **Critério:** Skill §2: datas, números, moeda e unidades sempre pelo formatador (Intl.DateTimeFormat, Intl.NumberFormat), nunca montados à mão; fuso explícito quando importa.
- **Onde:** site/lib/numeros.ts:11 ('\~2 s'), :14 ('100 000 pessoas em 1,8 a 2,1 s'), :17 ('1.454'), :29 ('0,8 ms'), :32 ('p95 1,7 ms'), :42 (LEGENDA 'medido em 08/10/2026') e :8 ('hoje 2026-10-05'); site/app/privacidade/page.tsx:17 e site/app/termos/page.tsx:20 (VIGENCIA {iso, texto} em duplicidade); site/lib/portas.ts:152 ('40 KB'); zero à esquerda por padStart: site/components/secao.tsx:18, site/lib/capturas.ts:90, site/lib/portas.ts:167, extensao/src/components/pessoa-pronta.tsx:61 e resultado-preenchimento.tsx:121; idade '{idade} anos' em extensao/src/components/cabecalho-pessoa.tsx:201 e site/components/pessoa-exemplo.tsx:107.
- **Medição:** 1) Uso de Intl ou toLocale\* no fonte de produção: extensão 0; site 1 (só `toLocaleLowerCase('pt-BR')` em lib/imagem-og.tsx). 2) O que o Intl (Node 26, ICU 78.3) produz nos três idiomas: - 1454: pt-BR '1.454', en '1,454', es '1454' (o espanhol não agrupa 4 dígitos); - 0,8 ms: pt-BR '0,8 ms', en '0.8 ms', es '0,8 ms'; - formatRange(1,8; 2,1) s: pt-BR '1,8–2,1 s', en '1.8–2.1 sec'; - 2026-10-08 curto: pt-BR '08/10/2026', en '10/8/26', es '8/10/26'. 3) A VIGENCIA: com `timeZone: 'America/Sao_Paulo'` sobre new Date('2026-11-12') sai '11 de novembro de 2026'. Esse é o motivo registrado no site/CLAUDE.md, e ele é real. Mas com `timeZone: 'UTC'` sobre o ISO, ou America/Fortaleza ao meio-dia, sai pt-BR '12 de novembro de 2026', en 'November 12, 2026' e es '12 de noviembre de 2026'. Ou seja, dá para formatar a partir do `iso` sem o deslocamento de dia.
- **Como corrigir:** 1) Guardar os números de lib/numeros.ts como valores (ex.: {valor: 1454}, {valor: 0.8, unidade: 'millisecond'}, {de: 1.8, ate: 2.1, unidade: 'second'}) e formatar com Intl.NumberFormat(idioma, {style: 'unit', …}). Usar formatRange no intervalo. O '\~2' vira texto do catálogo com o número interpolado formatado. 2) A VIGENCIA passa a ser só `{ iso }`. O texto sai de `new Intl.DateTimeFormat(idioma, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(iso))`, uma fonte só. Atualizar o page.test.tsx e o privacidade.e2e.ts, que hoje comparam '12 de novembro de 2026', e corrigir a frase do site/CLAUDE.md. 3) LEGENDA\_DOS\_NUMEROS e 'hoje 2026-10-05' com data ISO formatada por idioma. 4) Zero à esquerda com Intl.NumberFormat(idioma, { minimumIntegerDigits: 2 }). 5) A idade com o catálogo e o plural (ver LOC-07).
- **Verificação:** confirmado pelo verificador independente.
  - Verificador: site/lib/numeros.ts:14 escreve '100 000 pessoas' com espaço como separador de milhar, e o mesmo arquivo usa ponto em '1.454' (:17). Rodei Intl.NumberFormat no Node 26 (ICU 78.3): 100000 dá pt-BR '100.000', en '100,000' e es '100.000'. Remedi a VIGENCIA: new Date('2026-11-12') sai '11 de novembro de 2026' em America/Sao\_Paulo e America/Fortaleza, e '12 de novembro de 2026', 'November 12, 2026' e '12 de noviembre de 2026' com timeZone 'UTC'. Isso confirma que dá para gerar o texto a partir do iso, com uma fonte só.

### LOC-07 · Plurais feitos à mão (`=== 1 ?`) em vez de Intl.PluralRules

- **Severidade:** média · **Esforço:** P
- **Critério:** Skill §2: plural e gênero pelo Intl.PluralRules; nenhum texto montado no código.
- **Onde:** Só extensao/src/lib/textos.ts:2-5 (tituloPreenchimento), :8 (linhaNaoReconhecidos) e :26 (encontreiCampos) escolhem plural em tempo de execução, por `=== 1 ?`. Os outros lugares citados interpolam constante: cabecalho-pessoa.tsx:72 e faixa-favoritos.tsx:96 (LIMITE\_FAVORITOS = 3, em lib/favoritos.ts:3), site/components/formulario-exemplo.tsx:58 (CAMPOS.length fixo), mesma-semente.tsx:127 (o literal '12') e as idades em cabecalho-pessoa.tsx:201 e pessoa-exemplo.tsx:107 (de 18 a 65 anos, padrão de packages/core/src/nascimento.ts:69-70). Esses são texto montado no código e já estão no LOC-01 e no LOC-02, não plural do Intl.PluralRules.
- **Medição:** 1) A busca por `PluralRules` dá 0 no fonte. Os plurais saem de ternário com `=== 1`. 2) O Intl.PluralRules mostra a armadilha da troca: o cardinal de 0 é 'one' em pt-BR e 'other' em en e es; o de 1 é 'one' nos três; o de 2 é 'other' nos três. Trocar o ternário pelo PluralRules sem cuidado faria o pt-BR mostrar '0 de 0 campo preenchido'.
- **Como corrigir:** No catálogo, mensagens com formas por categoria, mais o caso exato '=0' quando o texto pt-BR atual usa o plural para zero. Exemplo: `aviso.preenchidos: { '=0': '{x} de {y} campos preenchidos', one: '{x} de 1 campo preenchido', other: '{x} de {y} campos preenchidos' }`, escolhido por `new Intl.PluralRules(idioma).select(y)`. Testes Vitest com 0, 1 e 2 nos três idiomas. Entra no PR de infraestrutura da extensão e no do site.
- **Verificação:** confirmado pelo verificador independente.
  - O verificador corrigiu o lugar: O achado se sustenta, mas a lista de lugares inflava o problema de plural com interpolação de constantes. No catálogo esses textos podem ficar como mensagem fixa, sem PluralRules.

### LOC-08 · Texto dentro de imagem: capturas das lojas e do site com título e subtítulo em pt-BR, e o tile da Chrome com frase

- **Severidade:** média · **Esforço:** M
- **Critério:** Skill §2: nada de texto dentro de imagem.
- **Onde:** extensao/loja/capturas.captura.ts:92-111 (TEXTOS das cenas de destaque) e extensao/loja/quadros.ts:91-113 (htmlDestaque com h1 e subtítulo), que vão para 8 das 10 capturas em 1280x800 e 640x400 (03 a 10) e para as 2 da Opera; extensao/loja/quadros.ts:72 (tile 440x280 'Bota dados de teste no formulário'); as 10 capturas mostram o popup em pt-BR; site/public/capturas/\*.png, exibidas na landing por site/lib/capturas.ts e components/extensao.tsx; imagens OG geradas com texto: app/opengraph-image.tsx:5, app/privacidade/opengraph-image.tsx:4-10, app/termos/opengraph-image.tsx:4-10 e lib/imagem-og.tsx:134 e :209 (6 imagens: 3 rotas, og e twitter).
- **Medição:** 1) Abri imagens/capturas/640x400/03-pessoa-de-teste-escuro.png e 05-resultado-escuro.png: o título ('Uma pessoa de teste coerente e pronta para copiar', 'Mostra o que preencheu e o que ficou de fora') e o subtítulo estão gravados na imagem. 2) chrome-tile-440x280.png tem gravado 'Bota dados de teste no formulário'. 3) O build da home (.next/server/app/index.html) referencia capturas/01, 02, 03, 05, 07, 08, 09 e 10. 4) Pela doc da Chrome, o small tile não é localizável. Pela da Mozilla, a AMO aceita um único conjunto de capturas.
- **Como corrigir:** 1) Tirar o h1 e o subtítulo das cenas de destaque e do tile: no tile, só ícone e nome. A frase vai para o texto da ficha (por idioma) e, no site, para o HTML ao lado da imagem (lib/capturas.ts já tem `titulo` e `texto`). 2) Parametrizar o gerador (pecas.ts e capturas.captura.ts) por idioma, gerando `imagens/<idioma>/capturas/…` com o popup no idioma. O site /en e o /es usam a sua. Na AMO, usar a captura sem legenda. 3) As OG continuam geradas em tempo de build a partir do catálogo, uma por idioma (texto vindo do catálogo, não fixo no componente).
- **Verificação:** confirmado pelo verificador independente.

### LOC-09 · Botão 'Caixa de entrada' do popup não comporta texto 35% maior

- **Severidade:** média · **Esforço:** P
- **Critério:** Skill §2: textos com espaço para crescer \~35% sem cortar.
- **Onde:** extensao/src/components/pessoa-pronta.tsx:195-218 (grid grid-cols-2 com 'Nova pessoa' e 'Caixa de entrada' mais o ícone externo), estado 1b, todos os filtros, popup de 380 px, tema claro.
- **Medição:** 1) Pseudolocalização: cada texto de interface alongado em 35% no popup real (Chromium 1248, build chrome-mv3-e2e, aba-alvo teste.local). 2) Em 1b (Tudo, Cartão e Documentos), o botão 'Caixa de entrada' tem conteúdo de 174 px numa caixa de 168 px, e a linha de botões fica com 353 px em 348. 3) Sem problema: 1a, resultado (1c/1d) e o aviso na página (300 px de largura; cresceu de 87 para 103 px de altura, quebrando linha sem cortar).
- **Como corrigir:** Deixar o rótulo quebrar dentro do botão (`whitespace-normal text-center leading-tight` e `h-auto min-h-…`) ou trocar o grid por `flex flex-wrap` com `min-w-0`, para empilhar quando não couber. Uma story com texto pseudolocalizado (+35%) ao lado da story do 1b, e uma asserção Playwright de que `scrollWidth <= clientWidth` nos botões do 1b.
- **Verificação:** confirmado pelo verificador independente.
  - Verificador: Confirmado por outro método: medi os retângulos dos filhos do botão, sem usar scrollWidth, com o sufixo de +35% colado à palavra. No 1b, o botão 'Caixa de entrada' vai de x=194 a x=364. O ícone da esquerda ficou em 188 a 200 e o externo em 360 a 370, ou seja, os dois ícones saem pelos lados (scrollWidth 175 > clientWidth 168). Com tradução realista o problema some (0 problemas): es ('Nueva persona', 'Bandeja de entrada', 'Rellenar esta página') e en ('New person', 'Inbox', 'Fill this page'). Medi também três estados que o auditor deixou de fora, todos com +35%: favoritos 3/3 com o aviso 'Os 3 lugares estão ocupados', renomear favorito e 'Nenhum formulário nesta página'. O único problema que se repete é este botão. O 1e (página proibida) não deu para medir. A aba about:blank não abriu o estado e, no meio da verificação, a pasta \~/Library/Caches/ms-playwright sumiu da máquina (sem instalação rodando). capturas em fav-cheio-35.png, renomear-35.png e nenhum-35.png na mesma pasta.

### LOC-11 · 'Powered by PiluTech' em inglês sem lang="en" no popup, no site e na documentação

- **Severidade:** média · **Esforço:** P
- **Critério:** WCAG 2.2 3.1.2 Idioma das partes (AA) e skill §1 ('idioma trocado em trechos com lang'). Pode cair na exceção de nome próprio se o Paulo tratar a frase como assinatura de marca.
- **Onde:** Popup da extensão (extensao/src/components/credito-pilutech.tsx:10), rodapé do site (site/components/rodape.tsx:85) e rodapé da documentação (copyright em documentacao/docusaurus.config.mjs:78). extensao/src/components/credito-pilutech.tsx:10 e :13; site/components/rodape.tsx:85 (nas 3 rotas); documentacao/docusaurus.config.mjs:78 (rodapé de todas as páginas). Nas imagens OG (lib/imagem-og.tsx:134 e :209) não se aplica.
- **Medição:** O build do site tem só um atributo lang na home (lang="pt-BR"); o &lt;a> do rodapé é '&lt;a href="https://pilutech.com.br" …>Powered by PiluTech', sem lang. O build da documentação tem só lang="pt-BR". Na extensão, nem o credito-pilutech.tsx nem a página têm lang en. Não testei com leitor de tela.
- **Como corrigir:** Na extensão, o &lt;a> de extensao/src/components/credito-pilutech.tsx:10 tem aria-label="Powered by PiluTech (abre pilutech.com.br)", que mistura inglês e português num atributo só. O aria-label substitui o conteúdo e não aceita lang em parte dele, então pôr &lt;span lang="en"> no texto visível não adianta. Tirar o aria-label e montar o nome pelo conteúdo: `<span lang="en">Powered by PiluTech</span><span className="sr-only"> (abre pilutech.com.br)</span>`, com o trecho pt-BR vindo do catálogo. No site (rodape.tsx:85) e na documentação (copyright em docusaurus.config.mjs:78), basta o span com lang="en".
- **Verificação:** confirmado pelo verificador independente.
  - O verificador trocou a correção: O como corrigir do auditor não funciona na extensão por causa do aria-label que mistura idiomas.
  - Também registrado como SITE-07 (site, severidade média): components/rodape.tsx:85 (rodapé das três rotas) e app/privacidade/page.tsx:225 ('&lt;strong>Powered by PiluTech&lt;/strong>').
  - Também registrado como DOC-V02 (documentação, severidade baixa): documentacao/docusaurus.config.mjs:78 (footer.copyright), nas 82 páginas e nos dois temas. O docusaurus.config.test.mjs:86-90 trava a string exata.
  - Severidade unificada em média, a do SITE-07 depois da verificação: a regra da skill pede lang no trecho em outro idioma; pelo WCAG 3.1.2 a falha não é clara, porque "Powered by" pode contar como vernáculo.

### LOC-V02 · Com palavras 35% maiores, a tabela de permissões de /privacidade gera rolagem horizontal a 320 e a 360 px, e os títulos longos estouram a 320 px

- **Severidade:** média · **Esforço:** P
- **Critério:** Skill §2: textos com espaço para crescer \~35% sem cortar. Também toca o WCAG 1.4.10 Refluxo, mas esse fica com o agente de acessibilidade do site.
- **Onde:** site/app/privacidade/page.tsx:249-266: &lt;table> de 3 colunas (Permissão, Para quê, Navegadores), sem contêiner com overflow-x (os ancestrais div, article e main estão com overflow-x: visible). Também o h1 'Política de privacidade do Botaí' (/privacidade) e o h2 'Limite de responsabilidade' (/termos). Medido a 320 e a 360 px; a 390, 768 e 1280 px não houve problema novo.
- **Medição:** Usei a pseudolocalização por palavra (cada palavra cresce 35% e os espaços ficam), no Chrome sem servidor, sobre o build site/.next servido por page.route, medindo a largura do documento e os retângulos de texto (Range). - /privacidade a 320 px: documento de 320 para 390 px, com rolagem horizontal da página; a tabela foi de 289 para 366 px num pai de 272 px. Th 'Navegadores…' termina em x=390 e td 'Todos…' em x=324. O h1 tem 276 px de conteúdo numa caixa de 272. - /privacidade a 360 px: documento de 360 para 390 px; a tabela foi de 312 para 366 px num pai de 312, e em pt-BR ela cabia. - /termos a 320 px: o h2 'Limite de responsabilidade' tem 284 px de conteúdo numa caixa de 272 px. O método do auditor acrescenta o trecho extra como palavra separada por espaço, que quebra linha; por isso ele deu 'novos 0'. Com tradução realista (es 'privacidad' e 'responsabilidad', en 'Browsers') as palavras ficam do mesmo tamanho ou menores.
- **Como corrigir:** Envolver a &lt;table> do Documento num contêiner com overflow-x-auto, focável e com nome (role="region", aria-label vindo do catálogo e tabIndex=0), ou empilhar as células abaixo de sm. Nos títulos do `prose`, usar \[overflow-wrap:anywhere] ou hyphens-auto (o lang certo por idioma já existe). Teste E2E a 320 e a 360 px conferindo documentElement.scrollWidth &lt;= clientWidth em /privacidade e /termos.
- **Origem:** achado do verificador, que não estava na auditoria; medido por ele.

### LOC-12 · Lógica que depende do texto pt-BR: recusados contados pelo sufixo ' (recusou o valor)'

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Skill §2: chaves estáveis; nenhum texto de interface fixo no código. Risco latente: com o texto traduzido, a contagem depende de o background e o popup usarem a mesma string no mesmo idioma.
- **Onde:** extensao/src/lib/resultado.ts:27 (SUFIXO\_RECUSADO), :47 (anexado ao rótulo) e :73 (contado por `endsWith`); usado por src/lib/estado-popup.ts para decidir entre 1c e 1d.
- **Medição:** Leitura do código: o sufixo pt-BR entra no `rotulo` em somarFrames e é contado com `linha.rotulo.endsWith(SUFIXO_RECUSADO)`. Não há campo booleano.
- **Como corrigir:** Adicionar `recusado: boolean` em LinhaCampo, contar por ele, e montar o sufixo na exibição pelo catálogo (`t('resultado.recusou')`). Ajustar resultado.test.ts e acoes.test.ts. Entra no PR de infraestrutura da extensão.
- **Verificação:** confirmado pelo verificador independente.

### LOC-13 · A troca manual de idioma esbarra na política de privacidade (só 3 chaves de storage) e no popup sem Ajustes

- **Severidade:** baixa · **Esforço:** M
- **Critério:** Skill §2: idioma do sistema ou navegador com troca manual nos Ajustes.
- **Onde:** site/app/privacidade/page.tsx (política, 'O que fica guardado'); extensao/loja/textos.test.ts (trava 'só as três chaves de storage da política', conforme o site/CLAUDE.md); extensao/loja/textos.md ('Justificativa: storage'); popup sem página de opções (extensao/CLAUDE.md: créditos 'na página de opções, quando existir').
- **Medição:** Leitura: o site/CLAUDE.md registra que o textos.test.ts e o page.test.tsx travam 'só as três chaves de storage' (botai\_pessoa, botai\_favoritos, botai\_cartao). Guardar a preferência de idioma exige uma quarta chave. O `chrome.i18n.getMessage` não troca de idioma em tempo de execução. Hoje não existe tela de Ajustes.
- **Como corrigir:** 1) No PR da troca manual: chave `local:botai_idioma` (valores 'auto', 'pt-BR', 'en', 'es'). 2) Seletor no rodapé do popup ou numa página de opções (`options_ui`), com o nome de cada idioma no próprio idioma, por Intl.DisplayNames: 'português (Brasil)', 'English', 'español' (medido). 3) No mesmo PR: a política de privacidade (o que fica guardado, linha do storage), a VIGENCIA, a justificativa de storage no textos.md e o texto da AMO, e os testes que travam as chaves.
- **Verificação:** confirmado pelo verificador independente.

### LOC-14 · Testes amarrados ao texto pt-BR e ao idioma da máquina

- **Severidade:** baixa · **Esforço:** M
- **Critério:** Skill §2: teste que falha se faltar chave. Risco para a migração: com o idioma vindo do navegador, os E2E passam a depender do idioma da máquina do CI.
- **Onde:** 62 dos 83 arquivos de teste, story, E2E e captura da extensão (753 linhas citam texto de interface), por exemplo src/entrypoints/popup/popup.e2e.ts:29-55; src/test/extensao.fixture.ts:45-52 (launchPersistentContext sem --lang).
- **Medição:** 1) Contagem por script: 62 de 83 arquivos e 753 linhas com algum fragmento do catálogo extraído. 2) No Chromium do Playwright desta máquina, `chrome.i18n.getUILanguage()` devolveu 'en-US'. Com detecção por idioma do navegador, os E2E atuais veriam a interface em inglês.
- **Como corrigir:** 1) Fixar o idioma na fixture (`args: ['--lang=pt-BR']` e `locale: 'pt-BR'`) e no setup do Vitest (mock de `browser.i18n.getUILanguage` em pt-BR). 2) Manter as asserções em pt-BR. 3) Acrescentar um E2E de fumaça por idioma (en e es) que abre o popup e confere o título e o `lang`. 4) Teste de paridade de chaves (LOC-01).
- **Verificação:** confirmado pelo verificador independente.

### LOC-15 · Link da Firefox Add-ons fixo em /pt-BR/ para todos os idiomas

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Skill §2: não supor que todo usuário é do Brasil; links das lojas por idioma.
- **Onde:** site/lojas.json:3 (firefoxUrl 'https://addons.mozilla.org/pt-BR/firefox/addon/bota%C3%AD/'), usado pelos botões da loja e pelo llms.txt do site.
- **Medição:** O llms.txt construído lista '\[Firefox Add-ons](https://addons.mozilla.org/pt-BR/firefox/addon/bota%C3%AD/)'. A URL do Chrome não leva idioma.
- **Como corrigir:** Guardar a URL da AMO sem o segmento de idioma e montar o caminho por rota (/pt-BR/, /en-US/, /es-ES/), ou usar a URL sem idioma. Conferir no PR como a AMO resolve a URL sem idioma.
- **Verificação:** confirmado pelo verificador independente.

### LOC-16 · PRODUTO.md e READMEs só em pt-BR

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Skill §2: produto nos três idiomas; texto público (PRODUTO.md) com OK do Paulo.
- **Onde:** PRODUTO.md (puxado pelo PiluVitu/pilutech-sites para pilutech.com.br/apps/botai); README.md da raiz; extensao/README.md.
- **Medição:** Os arquivos existem só em pt-BR; não há PRODUTO.en.md nem PRODUTO.es.md. Não conferi se o pilutech-sites já tem rotas en/es (outro repositório).
- **Como corrigir:** Quando o catálogo da PiluTech tiver /en e /es, criar PRODUTO.en.md e PRODUTO.es.md, no formato que o pilutech-sites combinar, com OK do Paulo. O README pode ganhar um parágrafo curto em en e es apontando para a documentação.
- **Verificação:** confirmado pelo verificador independente.

### LOC-V03 · Coluna de rótulos de 92 px no popup não comporta palavra única 35% maior

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Skill §2: espaço para crescer \~35% sem cortar.
- **Onde:** extensao/src/components/linha-copiavel.tsx:19 (grid-cols-\[92px\_minmax(0,1fr)\_28px], rótulo em text-xs, sem quebra dentro da palavra). Estado 1b, todos os filtros, popup de 380 px.
- **Medição:** 1) Com +35% colado à palavra no Chromium 1248 e o build chrome-mv3-e2e, 'Complemento…' foi de x=16 a x=124 numa caixa que termina em 108: 16 px dentro do gap de 10 px e da coluna do valor. 'Nascimento…' passou 1 px. 2) A largura real das palavras, na fonte do popup (Plus Jakarta Sans do build, 400 a 12 px, medida no Chrome headless): pt-BR 'Complemento' 84 px, 'Nome impresso' 90 px (quebra no espaço); en 'Neighborhood' 84 px, 'Complement' 76 px; es 'Complemento' 84 px, 'Vencimiento' 72 px e 'Contraseña' 67 px. As traduções previstas cabem nos 92 px, então é risco latente.
- **Como corrigir:** Usar \[overflow-wrap:anywhere] ou hyphens-auto no span do rótulo (com o lang do idioma do catálogo), ou trocar 92px por minmax(92px,auto). Story com rótulos pseudolocalizados ao lado da do 1b.
- **Origem:** achado do verificador, que não estava na auditoria; medido por ele.

## Pacotes (core e plugin do Playwright)

`@pilutech/botai-core` 0.5.0 (CLI `botai`, `botai serve`, biblioteca, motor `/navegador` e `navegador.iife.js`) e `@pilutech/botai-playwright`, medidos no `dist` local, igual ao da `main`. Esta superfície não teve verificador. O `llms.txt` não se aplica: pacote, CLI e servidor local não são site.

| ID     | Achado                                                                                                                       | Severidade | Esforço |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- |
| PAC-01 | CLI, servidor, biblioteca e plugin só em pt-BR, sem catálogo de textos e sem detectar o idioma                               | alta       | G       |
| PAC-02 | Rótulos e descrições dos cenários de cartão, mostrados na tela da extensão, ficam fixos em pt-BR no core                     | alta       | M       |
| PAC-03 | Contornos do motor ficam abaixo de 3:1 em fundo claro                                                                        | alta       | P       |
| PAC-04 | O piscar do destacar() ignora 'reduzir movimento'                                                                            | média      | P       |
| PAC-05 | 'opção desconhecida' e 'argumento inesperado' dizem o que houve, mas não como corrigir                                       | média      | P       |
| PAC-08 | Classificador de campos não reconhece rótulos em espanhol (pt-BR e inglês, sim)                                              | média      | M       |
| PAC-06 | O código de saída 1 tem dois sentidos, o 'serve --help' não lista códigos e um erro de listen fora da lista vira stack trace | baixa      | P       |
| PAC-07 | Linhas da ajuda passam de 80 colunas e desalinham quando o terminal quebra                                                   | baixa      | P       |
| PAC-09 | Números nas mensagens saem sem formatação                                                                                    | baixa      | P       |
| PAC-10 | O motor dispara focus/focusin sintéticos enquanto o foco real está em outro elemento                                         | baixa      | P       |

### PAC-01 · CLI, servidor, biblioteca e plugin só em pt-BR, sem catálogo de textos e sem detectar o idioma

- **Severidade:** alta · **Esforço:** G
- **Critério:** Skill padroes-produto-pilutech §2: o produto sai em pt-BR, en e es; o idioma vem do sistema, com pt-BR como padrão; nenhum texto de interface fica fixo no código e tudo sai de um catálogo por idioma; um teste falha quando uma chave existe num idioma e falta em outro.
- **Onde:** packages/core/src/cli/ajuda.ts:56-141 (7 ajudas, 141 linhas); src/bin/serve.ts:15-27 (AJUDA\_SERVE), :97-139 (erros do listen), :126 ('ouvindo em … (Ctrl+C encerra)'); src/cli/executar.ts:117-298 (erros de uso, 'botai: semente S, hoje H', 'erro interno'); src/cli/argumentos.ts:26-71; src/opcoes.ts:30-70; src/plano.ts:99-166; src/semente.ts:11-27; src/cartao.ts:183-297; src/gerar.ts:100-130; src/servidor/consulta.ts:64-137 e rotas.ts:65-84 (o texto do campo 'erro' do HTTP); packages/playwright/src/semente.ts:271, fixture.ts:55, preencher.ts:178-197; README.md e description/keywords do package.json dos dois pacotes. Vale em todos os terminais e locales.
- **Medição:** textos.sh (grep fora dos testes) achou 70 pontos que lançam erro com texto fixo. Por arquivo: executar.ts 10, cartao.ts 9, consulta.ts 9, serve.ts 7, argumentos.ts 5, plano.ts 5, semente.ts 5, opcoes.ts 4, playwright/preencher.ts 4, nascimento.ts 3, gerar.ts 2, mais 1 em cada um dos outros. Somam-se 141 linhas de ajuda, 6 mensagens do HTTP e 0 leituras de LANG, LC\_\*, Accept-Language ou navigator.language (o único Intl do pacote é o hoje.ts). Testei com o idioma do sistema trocado. Com LANG=en\_US.UTF-8 LC\_ALL=en\_US.UTF-8, 'botai pessoa --uf XX' respondeu 'botai: --uf: uf desconhecida "XX" (use uma das 27 siglas, ex.: SP)' (exit 2). Com LANG=es\_ES.UTF-8, 'botai xpto' respondeu 'botai: comando desconhecido "xpto" (veja botai --help)'. Pelo HTTP, curl -H 'Accept-Language: en-US' em /pessoa?uf=XX devolveu {"erro":"uf: uf desconhecida \\"XX\\" …"} \[HTTP 400]. Há ainda uma mistura: prng.ts:34 lança em inglês ('int: maxExclusive must be a positive integer').
- **Como corrigir:** 1) Criar packages/core/src/textos/{pt-BR,en,es}.ts com chaves estáveis (ex.: 'uso.opcaoDesconhecida', 'opcao.ufDesconhecida') e funções de interpolação, usando Intl.PluralRules onde houver contagem. Ao lado, um textos.test.ts que reprova chave ou placeholder faltando em algum idioma. 2) Escolher o idioma em cada ponta. CLI: LC\_ALL > LC\_MESSAGES > LANG (pt\* vira pt-BR, en\* vira en, es\* vira es, o resto cai em pt-BR), mais uma variável BOTAI\_IDIOMA para a troca manual. Servidor: Accept-Language, respondendo com Content-Language e Vary: Accept-Language. Biblioteca: ErroDeOpcao, ErroDoPlano e ErroDeConsulta ganham um 'codigo' estável e os parâmetros, para o consumidor (a extensão) traduzir; a mensagem padrão continua pt-BR. Plugin: opção botaiIdioma ou o LANG do processo. 3) Fixar BOTAI\_IDIOMA=pt-BR nos testes que comparam mensagens (botai.test.ts, serve.test.ts, consulta) e no executor dos blocos 'bash testar' da documentacao/ (docs/referencia/mensagens-de-erro.md copia as mensagens). 4) O que fica fora do catálogo, porque é contrato: comandos (pessoa, pessoas, cpf, validar, serve), flags (--semente, --hoje…), parâmetros da consulta (dominioEmail…), rotas (/pessoa, /saude), as chaves do envelope e da pessoa, as colunas do CSV e do SQL (COLUNAS), a chave 'erro' do JSON, os ids de cenário, os códigos de saída, o separador ' › ' da semente do plugin, as annotations botai-semente e botai-hoje, o anexo botai-pessoa.json e os dados gerados (CPF, máscaras, a data dd/mm/aaaa dos campos). 5) Paulo precisa decidir sobre o 'válido'/'inválido' que o validar escreve no stdout: é canal de dado e algum script pode compará-lo. A sugestão é mantê-lo fixo e documentar que o resultado está no código de saída. Também podem ficar sem tradução as asserções internas que a pessoa não vê: dom.ts:171, prng.ts:34, senha.ts:27, nascimento.ts:74, endereco.ts:347, celular.ts:13, gerar.ts:100. 6) README en/es: o npm não tem ficha por idioma, então o caminho seria README.en.md e README.es.md linkados no topo. Isso é texto público, pede o OK do Paulo e soma uns M ao esforço.
- **Verificação:** esta superfície não teve verificador; vale a medição do auditor.
  - Também registrado como LOC-10 (localização, severidade alta): packages/core/src/cli/ajuda.ts (--help) e mensagens de erro no stderr de packages/core/src/cli/\*.ts; mensagens do servidor em packages/core/src/servidor/\*.ts; erros do plugin em packages/playwright/src/preencher.ts:59, :70, :73, :78 e fixture.ts:55.

### PAC-02 · Rótulos e descrições dos cenários de cartão, mostrados na tela da extensão, ficam fixos em pt-BR no core

- **Severidade:** alta · **Esforço:** M
- **Critério:** Skill §2: catálogo por idioma; na extensão, \_locales/pt\_BR, en e es. O texto que a extensão mostra mora no core, então a localização da extensão depende de mudar o core. Pelo lado da acessibilidade, a skill §1 pede nome acessível claro.
- **Onde:** packages/core/src/cartao.ts:27-140 (CATALOGO\_DE\_CARTOES: 15 cenários, cada um com um 'rotulo' e uma 'descricao' em pt-BR). Quem consome: extensao/src/components/selo-do-cenario.tsx:39 ({rotulo}), cartao-atual.tsx:24 ({cenario.descricao} + a frase fixa 'Número de teste documentado da …'), cartao-das-proximas.tsx:72 (title={cenario.descricao}) e as ajudas da CLI (cli/ajuda.ts:46-54). Aparece no popup da extensão, nos dois temas.
- **Medição:** O grep de 'rotulo: ' em cartao.ts trouxe 15 rótulos, entre eles 'exige 3DS', 'saldo insuficiente', 'CVC incorreto', 'pendente → aprova', 'pendente → recusa' e 'pendente → cancela'. O de 'descricao:' trouxe 15 descrições, como 'Aprova a cobrança.' e 'Recusa por saldo insuficiente (insufficient\_funds).'. O grep na extensão mostra que ela renderiza essas strings sem passar por \_locales. Três rótulos levam a seta U+2192 dentro do texto do selo, que vira o nome acessível. Não medi como cada leitor de tela fala a seta.
- **Como corrigir:** Manter o 'id' como está, porque é contrato (--cenario recusado-saldo, ?cenario=). Tirar 'rotulo' e 'descricao' do catálogo de dados e passá-los para textos por idioma: ou o core exporta textosDoCartao(idioma), ou a extensão monta as chaves cartao\_&lt;provedor>\_&lt;id>\_rotulo e \_descricao nos \_locales, com um teste que confere que todo id do CATALOGO\_DE\_CARTOES tem chave nos três idiomas. A seta vira texto ('pendente, depois aprova'), ou fica com aria-hidden e o nome vem por extenso. Isto precisa entrar antes ou junto do PR de localização da extensão.
- **Verificação:** esta superfície não teve verificador; vale a medição do auditor.

### PAC-03 · Contornos do motor ficam abaixo de 3:1 em fundo claro

- **Severidade:** alta · **Esforço:** P
- **Critério:** WCAG 2.2 1.4.11 Contraste não textual: objeto gráfico necessário para entender o estado (campo preenchido × não reconhecido) precisa de ≥ 3:1 contra a cor ao lado.
- **Onde:** packages/core/src/navegador/contornos.ts:18-21 (OUTLINE: preenchido '2px solid #38bdf8', não reconhecido '2px dashed #f5b82e'). A extensão pinta esses contornos nos campos de páginas de terceiros pelo criarContornos (extensao/src/entrypoints/preencher.content/api.ts:32 e :51). Acontece em página clara, em qualquer largura.
- **Medição:** contornos.mjs, com a luminância relativa do WCAG. #38bdf8: 2,14:1 sobre #ffffff, 1,95:1 sobre #f3f4f6, 2,05:1 sobre #f9fafb, 1,97:1 sobre #eff6ff; passa só no escuro (9,80:1 sobre #000000, 8,74:1 sobre #121212). #f5b82e: 1,78:1 sobre #ffffff, 1,62:1 sobre #f3f4f6, 1,71:1 sobre #f9fafb, 1,64:1 sobre #eff6ff; no escuro, 11,78:1 e 10,51:1. Os dois falham nos 4 fundos claros. O contorno está a 1px do campo (outline-offset), então a cor ao lado é o fundo da página.
- **Como corrigir:** Trocar por cores que passam nos dois temas, mantendo sólido × tracejado: #0284c7 (4,10:1 sobre o branco, 3,72:1 sobre #f3f4f6, 5,13:1 sobre o preto, 4,57:1 sobre #121212) e #b45309 (5,02, 4,56, 4,18 e 3,73), todas medidas com o mesmo script. A outra saída é um contorno em dois tons (a cor da marca mais um anel de contraste). Acrescentar no contornos.test.ts um teste que calcula a razão contra #fff e #000 e exige ≥ 3. Atualizar junto o documentacao/docs/extensao/preencher-a-pagina.md:71 ('contorno ciano … âmbar tracejado'). O #38bdf8 também é cor da marca no site (site/components/marca.tsx); a troca vale só para o contorno.
- **Verificação:** esta superfície não teve verificador; vale a medição do auditor.
  - Também registrado como EXT-08 (extensão, severidade alta): packages/core/src/navegador/contornos.ts:18-21: o OUTLINE é '2px solid #38bdf8' no campo preenchido e '2px dashed #f5b82e' no não reconhecido. É o motor do core, o mesmo do @pilutech/botai-playwright. A decisão de manter essas cores está em extensao/CLAUDE.md, seção "Aviso na página (1f)". Afeta páginas claras.

### PAC-04 · O piscar do destacar() ignora 'reduzir movimento'

- **Severidade:** média · **Esforço:** P
- **Critério:** Skill §1, Movimento: respeitar 'reduzir movimento', com transições instantâneas. Dentro do mínimo do WCAG: 2.3.1 (≤ 3 piscadas/s) e 2.2.2 (dura menos de 5 s) passam.
- **Onde:** packages/core/src/navegador/contornos.ts:23-30 (PISCA, PISCA\_MS = 200) e :84-101 (destacar). Quem chama é extensao/src/entrypoints/preencher.content/api.ts:46-52 (mostrar), no 'ir para o não reconhecido' do aviso. Acontece com prefers-reduced-motion: reduce.
- **Medição:** Linha do tempo do destacar() em contornos.mjs: 0 ms aceso, 200 ms apagado, 400 ms aceso, 600 ms apagado, 800 ms aceso, 1000 ms fixo. São 2,5 piscadas/s durante 1 s. O grep de matchMedia ou prefers-reduced em core/src/navegador veio vazio. O aviso da própria extensão já respeita a preferência (extensao/src/entrypoints/preencher.content/aviso.css:126-131); o piscar, não. Uma nota para quem audita a extensão (fora desta superfície): o mostrar() só rola a página e pisca, sem mover o foco para o campo (api.ts:46-52).
- **Como corrigir:** No destacar(), ler globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches. Quando for true, pintar o contorno 'nao-reconhecido' fixo (de preferência com outline-width de 3px) e não agendar o piscar. Testar no contornos.test.ts com matchMedia simulado e no e2e da extensão com emulateMedia({ reducedMotion: 'reduce' }), que o popup.e2e.ts já usa.
- **Verificação:** esta superfície não teve verificador; vale a medição do auditor.
  - Também registrado como EXT-20 (extensão, severidade baixa): packages/core/src/navegador/contornos.ts:22-30: PISCA, com PISCA\_MS = 200.

### PAC-05 · 'opção desconhecida' e 'argumento inesperado' dizem o que houve, mas não como corrigir

- **Severidade:** média · **Esforço:** P
- **Critério:** Skill §1: erros dizem o que houve e como corrigir. A falha é parcial: as outras mensagens da própria CLI trazem o caminho.
- **Onde:** packages/core/src/cli/argumentos.ts:26 e :38 ('opção desconhecida: …'); src/cli/executar.ts:117 ('argumento inesperado: …') e :298 ('erro interno: …', sem próximo passo); e a repetição '-n: n precisa…' que nasce em executar.ts:294 com opcoes.ts:70.
- **Medição:** cli-erros.sh rodou 28 erros de uso: 25 trazem o valor aceito, o formato, um exemplo ou o uso; 3 não trazem. Com outras rodadas: 'botai pessoa --formato csv' dá 'botai: opção desconhecida: --formato' (exit 2), embora --formato exista no 'botai pessoas'. 'botai cpf --hoje 2026-01-01' dá 'opção desconhecida: --hoje'. 'botai pessoa --semnte 1' dá 'opção desconhecida: --semnte', sem sugerir --semente. 'botai pessoa extra' dá 'argumento inesperado: extra'. Para comparar: 'comando desconhecido "xpto" (veja botai --help)', o serve com '(uso: botai serve \[--porta 8790] \[--host 127.0.0.1])' e 'uf desconhecida "XX" (use uma das 27 siglas, ex.: SP)'. Mensagem redundante: 'botai: -n: n precisa ser um inteiro de 0 a 100000, recebido 100001'.
- **Como corrigir:** 1) Acrescentar '(veja botai &lt;comando> --help)' em 'opção desconhecida' e em 'argumento inesperado'. 2) Quando a opção existir em outro comando, dizer onde ela vale ('--formato só vale em botai pessoas'), como já faz o '--uf não vale para cnpj'. 3) Sugerir a opção mais próxima quando a distância de edição for ≤ 2 ('você quis dizer --semente?'). 4) No 'erro interno', dizer como relatar (link de issues do repositório, com o comando usado). 5) Tirar a repetição '-n: n'. Atualizar no mesmo PR as tabelas de documentacao/docs/referencia/mensagens-de-erro.md e os testes do botai.test.ts.
- **Verificação:** esta superfície não teve verificador; vale a medição do auditor.

### PAC-08 · Classificador de campos não reconhece rótulos em espanhol (pt-BR e inglês, sim)

- **Severidade:** média · **Esforço:** M
- **Critério:** Skill §2: o produto sai em pt-BR, en e es. O motor já trata en; es fica de fora (falha parcial).
- **Onde:** packages/core/src/campos.ts (as regras regex são 'pt-BR/en', como diz o packages/core/CLAUDE.md:60); src/campos-formatar.ts:119-120 (opções de sexo 'Feminino', 'Mulher', 'Female', 'F', sem 'Femenino'). É o motor que a extensão e o plugin usam para preencher.
- **Medição:** rotulos.mjs passou 14 campos com name neutro (f0…f13) e sem autocomplete. pt-BR: 14/14. en: 14/14. es: 6/14; não reconheceu 'Nombre completo', 'Correo electrónico', 'Teléfono móvil', 'Fecha de nacimiento', 'Dirección', 'Barrio', 'Ciudad' nem 'Fecha de vencimiento'. Com o autocomplete certo, o campo é reconhecido em qualquer idioma, porque o token de autocomplete pesa 1 no classificador.
- **Como corrigir:** Acrescentar ao campos.ts as regras em espanhol ao lado das em/pt: nombre, apellido(s), correo, teléfono/celular/móvil, fecha de nacimiento, dirección/calle, barrio/colonia, ciudad, contraseña, tarjeta, vencimiento/caducidad, código postal. Acrescentar 'Femenino' às opções de sexo e espelhar no campos.test.ts os casos em inglês que já existem. Se o Paulo decidir que o motor só atende formulário brasileiro, registrar isso no CLAUDE.md do core.
- **Verificação:** esta superfície não teve verificador; vale a medição do auditor.

### PAC-06 · O código de saída 1 tem dois sentidos, o 'serve --help' não lista códigos e um erro de listen fora da lista vira stack trace

- **Severidade:** baixa · **Esforço:** P
- **Critério:** O briefing pede códigos de saída documentados; a skill §1 pede que o erro diga o que houve e como corrigir.
- **Onde:** packages/core/src/cli/ajuda.ts:78 ('1 valor inválido (validar)'); src/bin/serve.ts:97-100 (EADDRINUSE sai com 1), :17-27 (a AJUDA\_SERVE não fala de código de saída) e :115 (throw causa: rejeição não tratada).
- **Medição:** Com um serve já ouvindo na 57961, 'botai serve --porta 57961' saiu com 1 e escreveu 'botai: a porta 57961 já está em uso em 127.0.0.1; escolha outra com --porta'. O --help geral diz que 1 é 'valor inválido (validar)'. Só a doc cobre esse caso (documentacao/docs/cli/codigos-de-saida.md:34); a ajuda do comando não. Não reproduzi o stack trace; ele está no código e descrito no packages/core/CLAUDE.md:167 ('escapa como rejeição não tratada (sai com 1 e o stack trace do Node)').
- **Como corrigir:** Na AJUDA\_SERVE, escrever 'Códigos de saída: 0 encerrado (Ctrl+C/SIGTERM), 1 porta em uso, 2 erro de uso'. No --help geral, escrever '1 valor inválido (validar) ou porta em uso (serve)'. No executarServe, um caso geral que escreva 'botai: não deu para ouvir em &lt;host>:&lt;porta> (&lt;código>)' e saia com 3 (erro interno), em vez do stack trace. Teste no serve.test.ts simulando um código fora da lista.
- **Verificação:** esta superfície não teve verificador; vale a medição do auditor.

### PAC-07 · Linhas da ajuda passam de 80 colunas e desalinham quando o terminal quebra

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Skill §1: o texto aumenta até 200% sem cortar nem sobrepor. Skill §2: o texto tem espaço para crescer \~35% (en/es).
- **Onde:** packages/core/src/cli/ajuda.ts:59-68 (Uso), :78 (códigos de saída), :89 (--dominio-email), :110 (--tabela), :115 ('Colunas: …', 410 colunas); src/bin/serve.ts:23 (--host).
- **Medição:** largura.mjs, contando pontos de código: 'botai --help' tem 4 linhas acima de 80 (máximo 84); 'pessoa --help', 1 (85); 'pessoas --help', 2 (91 e 410); 'serve --help', 1 (84). 'cartao --help' tem 0 (máximo 79), porque passa pelo emLinhas com LARGURA = 80. Num terminal de 80 colunas, ou com zoom numa janela fixa, a continuação da linha volta para a coluna 0 e sai da coluna das descrições. Não tem desenho de caixa nem seta (U+2500–257F e U+2190–21FF ausentes).
- **Como corrigir:** Passar a lista de Colunas e as descrições longas pelo emLinhas (ajuda.ts:10-21), com recuo; quando for TTY, usar process.stdout.columns, com 80 como padrão. Teste no botai.test.ts: toda linha de toda ajuda ≤ 80 colunas, nos três idiomas quando houver catálogo.
- **Verificação:** esta superfície não teve verificador; vale a medição do auditor.

### PAC-09 · Números nas mensagens saem sem formatação

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Skill §2: datas, números, moeda e unidades sempre pelo formatador (Intl.NumberFormat).
- **Onde:** packages/core/src/opcoes.ts:70 ('de 0 a 100000'), src/servidor/consulta.ts:99-111 ('de 1 a 10000', '(${soma})'), src/gerar.ts:132, src/bin/serve.ts:76 ('de 0 a 65535').
- **Medição:** 'botai pessoas -n 100001' escreveu 'botai: -n: n precisa ser um inteiro de 0 a 100000, recebido 100001'. O HTTP /pessoas?n=20000 devolveu 'n inválido: 20000 (um inteiro de 1 a 10000)'. Não há Intl.NumberFormat no pacote (o único Intl é o hoje.ts). Fica uma ressalva: parte desses números é valor que a pessoa digita de volta na flag, e ali '100.000' atrapalharia.
- **Como corrigir:** No catálogo do PAC-01, usar Intl.NumberFormat(idioma) nos números em prosa ('a soma dos cenários (12.000) passa do limite de 10.000 pessoas'). Manter só dígitos onde o número é um valor para digitar ('use -n de 0 a 100000') e registrar a regra no CLAUDE.md do core.
- **Verificação:** esta superfície não teve verificador; vale a medição do auditor.

### PAC-10 · O motor dispara focus/focusin sintéticos enquanto o foco real está em outro elemento

- **Severidade:** baixa · **Esforço:** P
- **Critério:** Risco latente para foco e leitor de tela (WCAG 2.4.3 Ordem do foco; skill §1, nada prende o foco). Não há falha medida.
- **Onde:** packages/core/src/navegador/dom.ts:175-186 (escrever).
- **Medição:** motor.mjs (Chromium 1248, IIFE do dist): com o foco no botão #antes, os 4 focusin do preenchimento chegaram com document.activeElement = 'antes'. Todos os eventos vieram com isTrusted=false (focus:nome\* focusin:nome\* input:nome\* …). Um componente que reage a focusin (combobox, datepicker, focus trap de modal, aria-activedescendant) recebe um foco 'fantasma' num campo, enquanto o foco real e o do leitor de tela ficam no botão. Não medi com uma biblioteca real de componentes.
- **Como corrigir:** Documentar o comportamento no README do core e do plugin e na documentação ('o motor dispara focus/blur sintéticos sem mover o foco'). Acrescentar ao preencher.e2e.ts do plugin um caso com um combobox ARIA de referência, para provar que nenhum popup fica aberto e que o aria-expanded volta a false.
- **Verificação:** esta superfície não teve verificador; vale a medição do auditor.

## O que já cumpre

Conferido pelos auditores e, onde está dito, contestado em parte pelo verificador. A linha "Padrões: skill `padroes-produto-pilutech`" já está no `CLAUDE.md` da raiz (linha 15), que o Claude Code carrega em todos os workspaces.

### Extensão

- **axe sem violação na maior parte dos estados:** axe-core 4.14.0, tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa e best-practice. No popup real, 0 violações em 1a, 1b (sem favoritos, filtro Cartão, ativa favorita, favorito removido), 1c, 1d sem formulário, 1d não reconhecido, 1e, 1b com pílula warn e 1b com cadeado, nos dois temas. As exceções são as dos achados 06 e 18. No estado de edição do apelido, uma leitura de contraste do axe deu 3,04 e 3,69 em rodadas diferentes, durante a transição de cor ao trocar de tema; nas stories do mesmo estado o valor é 4,73:1, então tratei como artefato. Nas 206 combinações de story e tema saíram 7 violações, todas de color-contrast e já no achado 06. No aviso, axe dentro do shadow DOM (fromShadowDom): 0 violações, com button-name e target-size passando.
  - Ressalva do verificador: O zero do axe não prova que o contraste passa. No popup real do Chrome 157, o axe 4.14 deu 0 violações no 1b claro, e a 'Caixa pública.' mede 4,39:1 (#986206 sobre #efede8, pelo fundo composto com oklab). O axe deixa fundos com color-mix como incompletos. A prova de contraste tem que vir da medição própria.
- **Contraste de texto no tema escuro e no resto do claro:** Cor computada contra o fundo composto. No escuro, o menor par foi 6,51:1 no popup real e 6,27:1 nas stories; o aviso escuro ficou em pelo menos 6,96:1. No claro, fora os 4 lugares do achado 06, todos os pares ficaram em pelo menos 4,73:1.
- **Ícones e indicadores com pelo menos 3:1, e ícones decorativos escondidos:** Todos os svgs medidos têm aria-hidden="true": 524 no popup real e 1838 nas stories. Menor razão de ícone: 3,45:1. Borda do campo do apelido: 7,07:1 no claro e 9,36:1 no escuro. Bolinha da pílula: 5,08 e 4,87:1 no claro, 10,24 e 11,62:1 no escuro. Segmentos do 1c: 5,08:1 e 10,24:1.
- **Foco visível no modo normal:** Medi 408 paradas de Tab em 9 estados, nos temas claro e escuro, e nenhuma ficou sem indicador. O anel de 1 px tem de 6,38 a 7,46:1 no claro e pelo menos 8,32:1 no escuro. O Fechar do aviso usa o anel do navegador. O "2 não reconhecidos" do aviso é a exceção (achado 03).
- **Ordem de foco, teclado e nada que prenda o foco:** Em todas as telas, a ordem do Tab segue a ordem visual, de cima para baixo e da esquerda para a direita. Shift+Tab percorre ao contrário. Depois do último controle o foco passa pelo body e volta ao primeiro. Enter funciona em Gerar pessoa, Preencher, Ver os dados, Tentar de novo, Nova pessoa e Copiar. Espaço no chip "Cartão" deixa aria-pressed=true. Esc no apelido cancela a edição sem fechar o popup (preventDefault no código). Abrir a edição foca o campo e seleciona o texto. Não há widget composto que precisasse de setas.
- **Nomes acessíveis:** button-name do axe passa. Todo botão só de ícone tem aria-label: Copiar &lt;rótulo>, "Mostrar na página: &lt;campo>", Renomear favorito, a estrela (Guardar, Tirar e "Limite de 3 favoritos"), Fechar do aviso e o crédito "Powered by PiluTech (abre pilutech.com.br)". O campo do apelido tem label ligado por htmlFor/useId. As iniciais dos chips são aria-hidden. A estrela no limite usa aria-disabled e continua focável.
- **Semântica e idioma do popup:** popup.html com lang="pt-BR" e title "Botaí". Landmarks header, main e footer. Um h1 por tela, h2 nos grupos e em Favoritos, h3 no bloco do cartão. No 1c, os segmentos têm role=img com aria-label igual ao título. A região role=status do favorito removido já existe vazia antes do aviso. O aviso de falha usa role=alert.
- **Reduzir movimento:** Com reduce, nenhum elemento do 1b tem animation-name diferente de none. O aviso fica sem animação de entrada e a barra dele passa a steps(1). Nada pisca mais de 3 vezes por segundo: o pisco medido é de 2,5 por segundo.
- **Zoom de 200% e espaçamento de texto (1.4.12):** Viewport de 380×300, equivalente a 200% no limite de 800×600 px da janela do popup: sem rolagem horizontal, nenhum texto cortado por overflow ou reticências, nenhuma parada de Tab coberta. Com line-height 1,5, letter-spacing 0,12em, word-spacing 0,16em e 2em entre parágrafos, nada foi cortado nem sobreposto. O "Caixa de entrada" passa 2 px da caixa e o "Complemento" usa 7 dos 10 px de folga.
- **Mensagens de erro dizem o que houve e como resolver:** Pelo código e pelas stories: o 1d e o 1e explicam o problema e a saída ("Abra o formulário numa aba comum e tente de novo", "Em chrome://extensions … ative 'Permitir acesso a URLs de arquivo'", "botão direito › Botaí › Inserir"), com texto próprio para Chrome, Edge, Opera e Firefox. O axe deu 0 violações e o contraste passou nos dois temas.
  - Ressalva do verificador: Vale para o 1d e o 1e do popup, mas não para dois outros casos. Os avisos de erro na página (role=alert) não dizem como resolver e somem em 4024 ms (EXT-V02). Numa página de erro do navegador, o Preencher não faz nada e não mostra mensagem (EXT-V01, 0 mutações em 2,5 s).
- **Atalho declarado, configurável e documentado:** commands.getAll() devolve botai-preencher, "Preencher esta página", com ⌥⇧P no Mac. Está declarado em wxt.config.ts e pode ser trocado em chrome://extensions/shortcuts; o rodapé do popup tem "alterar" e "definir atalho", que abrem essa página (no Firefox, openShortcutSettings). Está documentado em extensao/README.md:44, em documentacao/docs/extensao/preencher-a-pagina.md (seção Atalhos, com tabela por sistema) e em instalar.md:24-25.
- **Cartão e resultado não dependem só de cor:** O selo e os chips de cenário têm ícone por tipo (círculo com check, círculo com x, relógio). O provedor escolhido tem fundo cheio: 7,07:1 contra o fundo no claro e 9,36:1 no escuro. No 1c, campo preenchido é segmento cheio e campo faltando é segmento tracejado.
  - Ressalva do verificador: No modo de cores forçadas, o fundo cheio do provedor some: entre Stripe escolhido e solto muda 1 de 5406 pixels (EXT-V03). E o estado escolhido do chip de cenário depende da cor mais uma troca de peso de 500 para 600 (EXT-07b). Os ícones por tipo de cenário cumprem.

### Site

- **axe sem nenhuma violação, inclusive o target-size do WCAG 2.2, nas três rotas:** O axe.mjs rodou o axe-core 4.14.0 com runOnly nas tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22a, wcag22aa e best-practice, sem filtrar por impacto. Foram 14 execuções: as três rotas nos dois temas, a 1280 e a 320 px, mais o menu aberto nos dois temas. Todas deram violations=0. O único resultado 'incomplete' foi o color-contrast de uma linha do terminal (sobreposição parcial) e do hero sob o painel do menu, e medi esses textos à parte: passam.
- **Contraste de todo texto visível nos dois temas (inclusive muted, primary, ok, warn, selos, code, kbd, prose e painel do menu):** O contraste.mjs calculou a razão a partir da cor computada, com a opacidade e o fundo composto de todos os ancestrais. Foram 386 textos em /, 169 em /privacidade e 69 em /termos, a 1280, a 320 e com o menu aberto: nenhum ficou abaixo de 4,5:1. O menor no claro foi o warn #986206 sobre #f7f9fc, com 4,87:1 ('MA'); depois vêm o ok #1b7957 sobre #f7f9fc (5,08) e o muted #495769 sobre #f7f9fc (6,98). No escuro, o menor foi o muted #94a0b3 sobre #0f141f, com 6,96:1. No prose, #404040 sobre #f7f9fc dá 9,83 e #d4d4d4 sobre #090b11 dá 13,27. Nenhum texto fica sobre imagem ou gradiente (0 elementos com background-image).
- **Ícones que informam com pelo menos 3:1, e ícones decorativos escondidos:** O menor ícone com significado mede 5,08:1 no claro (o check do 'ok', #1b7957) e 6,96:1 no escuro (o plug do 'Sem teste'). Todos os SVG do Font Awesome e a Marca têm aria-hidden=true. A Marca, a 2,03:1 sobre o fundo claro, é logotipo e decorativa, dentro de um link que já tem nome; está fora do critério.
- **Anel de foco de 2 px com contraste de sobra onde ele é usado:** O ring-2 primary contrasta 7,07:1 com o fundo claro e 7,46:1 com o card; no escuro, 9,36:1 e 8,76:1. Na diferença de pixels, cada foco desses tem de 206 a 3327 pixels com razão de pelo menos 3:1 (foco.mjs, nos dois temas, a 1280 e a 320 px).
- **Ordem de foco igual à visual, sem armadilha, e nada encoberto:** O foco.mjs percorreu as 12 combinações de rota, tema e largura: 34, 31, 18 e 15 paradas. O Tab chega ao fim e sai da página, sem prender. A ordem segue o DOM, que segue a leitura: cabeçalho, conteúdo e as colunas do rodapé. O elementFromPoint no centro de cada elemento focado nunca achou outro elemento por cima.
- **Teclado no menu de seções e nas âncoras:** O menu.mjs testou a 320 e a 768 px. Enter abre o menu, Tab entra no painel, e Escape fecha e devolve o foco ao botão. Enter numa âncora do painel leva o ponto de partida do Tab à seção: o Tab seguinte cai no primeiro elemento focável depois dela. A 1280 px, Enter em 'Portas' e Tab levaram a 'Copiar comando da porta CLI'.
- **Reduzir movimento:** O movimento.mjs comparou as duas preferências. Com reduce: scroll-behavior auto; nenhuma animação CSS ativa; o painel do menu com animation 'none 0s'; o ícone do copiar com animation none; as transições do PRESSIONAR em 'all 0s'; e 0 View Transitions na troca de tema. Com no-preference: smooth, botai-entrar 0.2s e 1 View Transition. Nada pisca e nada troca sozinho.
- **Zoom de 200% e 400% e refluxo a 320 px:** O layout.mjs mediu 640×400 (1280 com zoom de 200%) e 320×200 (zoom de 400%) nas três rotas: scrollWidth igual à viewport, nenhum texto fora dela, nenhum cortado e nenhum sobreposto. A 320×800 o resultado foi o mesmo.
- **Espaçamento de texto (WCAG 1.4.12) sem perda de conteúdo:** Injetei line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em e 2em de margem depois dos parágrafos. A 1280 px, as três rotas não perderam nada. A 320 px, / e /termos também não. Em /privacidade a página passa a rolar para os lados, por causa da tabela (achado 06).
- **Idioma, títulos de página e de seção, e landmarks:** O estrutura.mjs e o ariaSnapshot (out/aria\_\*.yml) mostram html lang=pt-BR e títulos de página distintos. Cada rota tem um h1 só e nenhum nível pulado: h2 e h3 na landing, h2 e h3 na política. Na landing há header, nav 'Seções', main, footer e as navs 'Projeto' e 'Legal'. Nas páginas de texto há nav 'Topo', main e footer. Não há id duplicado nem elemento focável dentro de aria-hidden.
- **Imagens com alt útil:** As 6 capturas (claro e escuro de 3 cenas) têm alt descritivo, com mais de 40 caracteres, e dizem o tema. Os SVG são aria-hidden. As janelas do hero ficam em figure com uma legenda só para leitor de tela.
- **Nomes acessíveis: todos presentes, sem duplicados ambíguos e sem nomes vagos:** Todos os 34, 18 e 15 controles têm nome. Nenhum nome leva a dois destinos diferentes, e nenhum é vago no estilo 'saiba mais' ou 'clique aqui'. O nome contém o texto visível (WCAG 2.5.3) em todos os controles. O link 'abertos', na /privacidade, ganha sentido pela frase em volta (WCAG 2.4.4).
- **Nada depende só de cor:** Nos selos das integrações, cada estado tem ícone e texto próprios (circle-check com 'Testado', plug com 'Sem teste'). Os destaques da pessoa têm peso 700, contra 400 no texto em volta, além da cor (medido no copiar.mjs). Os links do corpo das páginas de texto são sublinhados.
- **Mensagem de status só quando a pessoa age:** O copiar tem um role=status só para leitor de tela, que fica vazio no carregamento e diz 'Copiado' depois do clique (copiar.mjs). Nada mais troca sozinho na página.
- **Tabela de atalhos acessível:** Tem caption e th com scope. A região é focável e rola quando o texto cresce: com a fonte de 32 px a 320, o scrollWidth vai a 328 numa largura de 286 (medido com o Chrome 157). Com 16 px não há rolagem: 286 de 286 a 320 e 572 de 572 a 1280.
- **Contraste dos estados de hover e pressionado:** Contraste no hover, nos dois temas e nas três rotas: o hover.mjs passou o mouse em 108 links e botões com texto, a 1280 px. Fora dos botões preenchidos, a menor razão foi 6,98:1 (muted #495769 sobre #f7f9fc, nas âncoras do cabeçalho). Nos botões preenchidos, o fundo computado no hover vem em oklab (bg-primary/90), e por isso o hover2.mjs mediu pelos pixels: 5,94:1 (#ffffff sobre #1d6b8c) no claro e 7,70:1 (#090b10 sobre #35ade1) no escuro. Na variante outline: 15,48:1 e 13,63:1. O estado pressionado (PRESSIONAR) só muda a escala (active:scale-\[0.97]) e não muda cor. (medido pelo verificador)
- **Menu aberto encobrindo o foco em outras larguras e posições de rolagem:** WCAG 2.4.11 (Foco não encoberto) com o menu de seções aberto pelo teclado: o menu.mjs abriu o menu com Enter, deu Tab por 8 paradas e testou 9 pontos de cada elemento focado com elementFromPoint. Rodou com as fontes de 16, 24 e 32 px pelo ajuste real do Chrome, em 320×800, 320×200 (zoom de 400%), 640×400 (zoom de 200%) e 880×600, sempre com o painel aberto. O resultado foi 'cobertos=0/9' em todos os casos. Como o painel é absolute e não fixed, ele rola junto com a página. (medido pelo verificador)

### Documentação e llms.txt

- **Contraste de todo o texto fora do realce de código, nos dois temas (WCAG 1.4.3):** Varredura de todo elemento com texto nas 82 rotas, a 1280 (contraste-1280.txt) e a 320 (contraste-320.txt), com as cores computadas e composição de alfa. Mínimos no claro e no escuro: texto do conteúdo 17,46 e 14,49; títulos 17,46 e 14,49; links 7,07 e 8,18; barra lateral 5,42 e 12,62; página atual na barra 6,32 e 7,13; sumário 6,87 e 12,75; navbar 17,46 e 16,57; trilha 6,32 e 7,13; paginação 6,98 e 8,18; rodapé 5,72 e 8,76; código inline 17,17 e 10,74; tabelas (th, td, listras) 16,31 e 8,62; cards do índice 9,07 e 15,70; admonitions note, tip, info, caution e danger (título, texto, link e code) de 8,93 a 13,21 e de 6,23 a 13,21; texto simples do Prism 10,79 e 13,36; menu mobile 5,42 e 14,44; botão "Nesta página" 15,61 e 12,62.
- **Contraste dos ícones e controles (WCAG 1.4.11), exceto o Fechar do menu mobile no claro (DOC-05) e o Copiar com opacidade .4 (DOC-10):** Pixels de screenshot 2x (icones.txt), claro e escuro: botão de tema 17,46 e 16,57; ícone de link externo 17,46 e 16,57; seta da categoria 3,96 e 5,12; ícone de início da trilha 17,46 e 14,49; ícones dos 5 admonitions de 9,13 a 13,21; Copiar com opacidade 1 10,79 e 13,36; voltar ao topo 3,88 e 3,63; hambúrguer 17,46 e 16,57; Fechar no escuro 12,69.
  - Ressalva do verificador: A lista de exceções está incompleta. O ícone de 'copiado', que é a única pista visual de sucesso da cópia, renderiza a 1,86:1 no tema claro: #00d600 sobre #f6f8fa, medido nos pixels com opacity 1 e o mouse sobre o botão (t10-copiado.txt). Ele está abaixo de 3:1 e precisa entrar como exceção, junto com a severidade alta proposta para o DOC-10. O estado ligado do 'Alternar quebra de linha' também se distingue do desligado só pela cor, com 1,54:1 no claro e 1,97:1 no escuro entre os estados. Isso é 1.4.1, não 1.4.11, e foi para o DOC-V01. Os demais números de ícones do item batem com a minha medição: Fechar a 2,90 e 12,69; seta da categoria a 3,96; voltar ao topo a 3,88; Copiar com opacity 1 a 10,79 e 13,36.
- **Sem violação do axe fora das regras listadas nos achados (nomes de botões e links, ARIA, landmarks, idioma, títulos e regiões):** axe-core 4.14.0 com wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa e best-practice nas 82 rotas, nos 2 temas e a 1280/320 (328 execuções, axe.json). Só apareceram color-contrast, link-in-text-block, scrollable-region-focusable, image-redundant-alt e empty-table-header.
- **Foco visível em todo elemento interativo, ordem de Tab coerente e nenhuma armadilha de teclado:** Tab em /cli/pessoa (claro e escuro a 1280, claro a 320) e na 404 (teclado.txt). Ordem: pular → navbar → barra lateral → trilha → conteúdo (blocos pre focáveis, Copiar, âncoras) → sumário → rodapé, e na 404 o ciclo volta ao início. Todos os focos com :focus-visible e anel do navegador (5,67:1 no claro, até 11,3:1 no escuro). O foco nunca ficou preso; o menu mobile tem o problema contrário (DOC-04).
- **Link "Pular para o conteúdo principal" existe e funciona:** menu.mjs: é o 1º Tab, aparece em 16,16 com 266×42 px e contraste de pixel de 19,16:1. Enter leva o Tab seguinte a "Página Inicial" no main. Aqui vale só o funcionamento; o foco que cai embaixo da navbar está no DOC-03.
- **Nomes acessíveis e textos do tema em pt-BR (tirando o "(opens in new tab)" do DOC-08):** textos.mjs e ariaSnapshot: "Pular para o conteúdo principal", "Navegação principal", "Alternar painel de navegação" (com aria-expanded false/true), "Fechar painel de navegação", "← Voltar para o menu principal", "Mudar entre modo claro e escuro (modo claro está ativo)", "Expandir/Recolher a categoria 'X'", "Painel lateral de documentos", "Trilha", "Página Inicial", "Nesta página", "Páginas de documento" ("Anterior"/"Próxima"), "Copiar código para a área de transferência", "Alternar quebra de linha", "Link direto para &lt;título>", "Voltar para o topo" e a 404 inteira em pt-BR.
- **Reduzir movimento respeitado no menu mobile, nas categorias da barra lateral e nas transições do Infima:** Com prefers-reduced-motion: reduce emulado: o painel do menu abre com transition 0s e transform 0 desde o 1º frame (sem a preferência, desliza de -265 px em 200 ms); a categoria expande com 0,001 s (sem a preferência, 0,241 s); a seta não tem duração; o Infima zera --ifm-transition-fast/slow; o CSS não usa scroll-behavior: smooth. A exceção é o voltar ao topo (DOC-06).
- **Reflow, zoom e espaçamento de texto (WCAG 1.4.4, 1.4.10 e 1.4.12):** layout.mjs, contando rolagem horizontal da página, texto além da borda fora de contêiner rolável, texto cortado por overflow hidden e sobreposição na navbar. As 82 páginas a 320×640 ficaram sem nada disso, e o mesmo vale para 7 páginas representativas (/, /cli, /cli/pessoa, /referencia/campos-reconhecidos, /faq, /servidor/api-http e 404) a 640×450 (zoom 200%) e 320×225 (zoom 400%), com texto a 200% a 1280 e com o espaçamento do 1.4.12 a 1280 e a 320. A exceção é texto 200% junto com 320 px (DOC-13).
- **Estrutura semântica: lang, título por página, um h1 e landmarks:** textos.mjs: &lt;html lang="pt-BR"> e títulos "&lt;página> | Botaí — documentação" (a 404 fica no DOC-14). As páginas têm um h1 e depois só h2/h3, e o axe não acusou heading-order, page-has-heading-one nem landmark-\*. Os landmarks têm nome em pt-BR.
- **Alvos grandes onde importa e nenhum alvo abaixo de 24 px fora da exceção de espaçamento do 2.5.8:** alvos.txt: paginação com 75 a 95 px de altura, cards do índice com 135 px e links do menu mobile com 249×32. Todos os alvos &lt; 24 px (sumário e rodapé com 21 px, Fechar 21×21) passam pela exceção de espaçamento; os links no meio do texto são isentos (inline).
- **Blocos de código roláveis são alcançáveis pelo teclado:** Cada &lt;pre> recebe foco por Tab (teclado.txt: "main pre 'botai pessoa…' fv"), e o axe não acusou scrollable-region-focusable em pre.
- **llms.txt e llms-full.txt dos dois sites, no formato do llmstxt.org e servidos em produção:** Só GET (pasta producao/): https://botai.pilutech.com.br/llms.txt (4186 B), /llms-full.txt (31030 B), https://docs.botai.pilutech.com.br/llms.txt (17636 B) e /llms-full.txt (386125 B) responderam 200 text/plain; charset=utf-8. Formato: '# Nome', '> resumo', parágrafo e seções '- \[Título](url): descrição', em pt-BR, sem dado privado e só com help@pilutech.com.br. O robots dos dois cita o llms.txt, e o sitemap dos dois o inclui (o do site também inclui o llms-full.txt). Os dois são gerados no build com os dados das páginas (documentacao/plugins/llms-txt.mjs e site/lib/llms.ts) e têm testes (llms-conteudo.test.mjs e conferir-build.mjs na documentação; lib/llms.test.ts e seo.e2e.ts no site, com 'todo link do llms.txt e do llms-full.txt responde'). O llms.txt e o llms-full.txt da documentação em produção são idênticos byte a byte aos do build local (diff -q).
- **404 responde 404 e é navegável:** fetch em /pagina-que-nao-existe no docusaurus serve dá status 404; h1 "Página não encontrada" com texto em pt-BR; o Tab passa por pular, navbar e rodapé.

### Localização (produto inteiro)

- **Fuso explícito na data de referência dos dados: o core calcula o 'hoje' com Intl.DateTimeFormat e timeZone 'America/Sao\_Paulo', nunca pelo fuso da máquina:** Leitura de packages/core/src/hoje.ts: `new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', … }).formatToParts`. A extensão o usa em `__botai.preencher(pessoa, hojeEmSaoPaulo())`, conforme o extensao/CLAUDE.md.
- **O popup cabe texto 35% maior na maior parte dos estados: 1a, 1b (filtros Tudo, Cartão e Documentos), resultado (1c/1d com mira e não reconhecidos) e o aviso na página, sem corte nem estouro horizontal. A exceção é o botão do LOC-09:** pseudo-popup.mjs no Chromium 1248 com o build chrome-mv3-e2e: 61, 34, 19, 9 e 12 textos alongados, 0 problemas fora do botão 'Caixa de entrada'. A página fica em 380 px em todos os estados. Capturas em scratchpad/auditoria/localizacao/pseudo/\*-depois.png.
  - Ressalva do verificador: É parcial. Com +35% colado à palavra, o rótulo 'Complemento' passa 16 px da coluna fixa de 92 px e entra na coluna do valor (LOC-V03, baixa). As traduções en e es previstas cabem (até 84 px). Confirmei os estados favoritos 3/3, renomear favorito e 'Nenhum formulário': fora isso e o botão do LOC-09, nada estoura.
- **O site cabe texto 35% maior em todas as larguras: nenhum transbordo novo em /, /privacidade e /termos a 320, 390, 768 e 1280 px:** pseudo-site.mjs sobre o build de produção existente (site/.next), servido por page.route: 243, 180 e 96 textos alongados por rota; a página ficou na largura da janela; 'novos 0' nas 12 combinações. A 320 px, /privacidade já tinha antes um bloco de 289 px numa caixa de 272 px. Isso não vem da localização: fica para o agente de acessibilidade do site.
  - Ressalva do verificador: Não se sustenta a 320 e a 360 px. O método do auditor acrescenta o trecho extra como palavra separada por espaço, então nunca testa palavra mais longa. Com cada palavra 35% maior (Chrome, mesmo build, sem servidor), /privacidade ganha rolagem horizontal da página: documento de 320 para 390 px a 320, e de 360 para 390 px a 360, porque a &lt;table> de permissões não tem contêiner com overflow. O h1 de /privacidade (+4 px) e o h2 'Limite de responsabilidade' de /termos (+12 px) estouram a 320 px. Ver LOC-V02. A 390, 768 e 1280 px a afirmação vale.
- **O idioma atual está declarado certo onde existe: &lt;html lang="pt-BR"> no site e na documentação, og:locale pt\_BR, lang do manifesto web, inLanguage do JSON-LD e &lt;html lang="pt-BR"> no popup:** grep no build: site/.next/server/app/{index,privacidade}.html → `<html lang="pt-BR" …>` e `og:locale" content="pt_BR"`; documentacao/build/index.html → `<html lang="pt-BR" dir="ltr" …>`; site/app/manifest.ts:10; site/lib/json-ld.ts:49 e :62; extensao/src/entrypoints/popup/index.html:2.
  - Ressalva do verificador: Vale nas três rotas, mas não na 404 do site. O \_not-found.html (status 404, servido em toda rota inexistente) declara &lt;html lang="pt-BR"> com todo o conteúdo em inglês ('404: This page could not be found.'), e o \_global-error.html sai sem lang. Ver LOC-V01.
- **A documentação já tem a base de i18n do Docusaurus: defaultLocale pt-BR, hreflang pt-BR e x-default emitidos, e o tema traduzido (pt-BR com 151 chaves; es com 151 chaves já no pacote; en é a base):** documentacao/docusaurus.config.mjs:23; `grep -o 'hreflang="[^"]*"' build/index.html` → pt-BR e x-default; contagem em node\_modules/.pnpm/@docusaurus+theme-translations@3.10.2/.../locales/{pt-BR,es}/\*.json → 151 chaves, sem '\_\_\_' sem tradução; 'Nesta página', 'Próxima' e 'Anterior' em pt-BR no build.
- **Data de vigência com valor legível por máquina: &lt;time dateTime="2026-11-12"> nas páginas de texto:** site/components/documento.tsx:36 `<time dateTime={vigencia.iso}>`; testado em site/app/privacidade/page.test.tsx:22 e privacidade.e2e.ts:12.
- **Os exemplos visuais da landing (formulário de cadastro, pessoa de exemplo, terminal) são HTML e não imagem, então se traduzem pelo catálogo:** Leitura de site/components/formulario-exemplo.tsx, pessoa-exemplo.tsx e terminal-exemplo.tsx: rótulos em JSX ou lib, sem &lt;img> com texto.
- **O que não se traduz por natureza está separado da interface: os dados gerados (formato brasileiro), o contrato técnico (flags, JSON, ids `botai-*`, chaves de storage) e os nomes de produto e marca. Os textos para revisores das lojas já estão em inglês:** Leitura de src/lib/grupos.ts (rótulo × valor da pessoa), src/lib/menus.ts (MENU e PREFIXO\_\* técnicos separados dos títulos), extensao/loja/notas-revisores.md e extensao/SOURCE-CODE-REVIEW.md (em inglês).
- **Boa parte dos textos da extensão e do site já está fora do JSX, o que adianta a migração para o catálogo (ainda não cumpre a regra: são módulos só pt-BR):** Contagem do extrator: na extensão, 83 das 176 ocorrências estão em src/lib (textos.ts, grupos.ts, menus.ts, estado-popup.ts, paginas.ts, resultado.ts); no site, 118 de cerca de 213 da landing estão em lib/\*.ts.

### Pacotes (core e plugin do Playwright)

- **A CLI não usa cor: nenhuma informação depende de cor, e NO\_COLOR, FORCE\_COLOR e TERM=dumb são respeitados por construção:** busca-cor.sh não achou \\x1b, \\u001b, \\033 nem \\e\[, nem NO\_COLOR, FORCE\_COLOR, isTTY, chalk, picocolors, kleur ou ansi- em core/src, core/dist, playwright/src e playwright/dist. ajudas.sh: o sha do 'botai --help' é igual nas três situações (a64d07eb… no padrão, com NO\_COLOR=1 TERM=dumb e com FORCE\_COLOR=1).
- **Dados vão para o stdout e mensagens para o stderr; num erro de uso o stdout fica vazio. A ajuda pedida vai para o stdout com exit 0, e sem argumentos ela vai para o stderr com exit 2:** cli-erros.sh: nos 28 erros de uso só saiu stderr. ajudas.sh: as 7 ajudas saíram com exit 0 e 0 bytes no stderr. 'botai' sem argumentos: a ajuda no stderr, exit 2.
- **25 dos 28 erros de uso dizem o que houve e o caminho: o valor aceito, o formato, um exemplo ou o uso. O HTTP devolve status certo (400, 404, 405 com Allow: GET) e lista o que aceita:** Saída do cli-erros.sh: 'uf desconhecida "XX" (use uma das 27 siglas, ex.: SP)', 'hoje precisa ser uma data AAAA-MM-DD que existe', '--formato desconhecido "xml" (use json, ndjson, csv, sql)', '--porta inválida: abc (de 0 a 65535; 0 escolhe uma livre)'. Saída do serve.sh: 404 'rota desconhecida: /xpto (rotas: /pessoa, /pessoas, /saude)', 400 'parâmetro desconhecido: foo (aceitos: …)', 405 'método POST não aceito: use GET'.
- **Os códigos de saída estão documentados e batem com o medido nos casos comuns: 0 ok, 1 inválido (validar), 2 erro de uso:** --help geral (ajuda.ts:78) e documentacao/docs/cli/codigos-de-saida.md. Medido: 'validar cpf 52998224725' sai com 0, 'válido'; 'validar cpf 11111111111' sai com 1, 'inválido'; os 28 erros de uso saem com 2.
- **A ajuda é lida em ordem: texto linear com recuo, sem desenho de caixa nem setas:** Nas 7 ajudas, os únicos caracteres fora do ASCII são letras acentuadas (í, á, ã, ó, é, õ, ç, ú, ê, â); a regex /\[─-╿←-⇿]/ deu false. O catálogo do 'cartao --help' sai em pares de linhas: id e número, depois a descrição.
- **A CLI e o servidor não têm animação nem spinner: não há movimento para 'reduzir movimento' controlar. O serve escreve uma linha só:** Não há sequência ANSI de cursor (busca-cor.sh). O stderr do serve tem uma linha só: 'botai serve: ouvindo em http://127.0.0.1:57961 (Ctrl+C encerra)'.
- **O motor não rouba o foco da página:** motor.mjs: activeElement era 'antes' antes, durante cada focusin e depois. Há testes que já travam isso: core/src/navegador/dom.test.ts:363-395 (focus e blur nunca chamados, activeElement = body), preencher.test.ts:198 e playwright/src/preencher.e2e.ts:133 (activeElement = BODY).
- **O motor não mexe em aria-\* nem em outro atributo da página. No plugin e no preencherNaPagina ele usa SEM\_CONTORNOS, sem escrever estilo:** motor.mjs, numa página sem tratadores: o MutationObserver (atributos, filhos e texto, subtree) contou 0 mutações durante o preenchimento. O grep do motor só achou leituras de aria-hidden, aria-labelledby e aria-label (dom.ts:44, 101, 124).
- **A validação acessível da própria página continua funcionando: input, change e focusout saem com bubbles e composed, e o blur também é disparado:** motor.mjs, numa página com validação no blur: o aria-invalid passou de 'true' para 'false' em nome, email e cpf, e a página pôs 'false' no cel. A ordem dos eventos está travada no dom.test.ts:363-395.
- **O motor respeita a árvore de acessibilidade: não preenche campo dentro de aria-hidden="true" e classifica pelo nome acessível (label, aria-labelledby, aria-label):** motor.mjs: o campo #h, dentro de aria-hidden, ficou vazio, e o #obs, sem rótulo conhecido, caiu em naoReconhecidos. Na leitura do dom.ts:42-49 e 96-108, o sobAriaHidden atravessa as shadow roots.
- **Os contornos não dependem só da cor: o preenchido é sólido e o não reconhecido é tracejado. O aviso da extensão diz 'contorno tracejado':** contornos.mjs: '2px solid #38bdf8' contra '2px dashed #f5b82e'. Grep: extensao/src/entrypoints/preencher.content/aviso-dom.ts:80 escreve ' · contorno tracejado'.
- **O piscar do destacar() fica dentro dos limites de flash e de duração do WCAG (2.3.1 e 2.2.2):** contornos.mjs: 2,5 piscadas/s (ciclo de 400 ms), menos que 3, durante 1 s, menos que os 5 s do 2.2.2.
- **A data de referência sai do Intl.DateTimeFormat com fuso explícito (America/Sao\_Paulo), sem conta feita à mão:** Leitura de packages/core/src/hoje.ts:1-16 (formatToParts com timeZone fixo); o plugin usa o mesmo hojeEmSaoPaulo (fixture.ts:80).
- **O contrato técnico já está separado do texto humano, e é ele que não se traduz: comandos, flags, parâmetros em camelCase, rotas, chaves do envelope e da pessoa, colunas, a chave 'erro', ids de cenário e códigos de saída:** Leitura de executar.ts:58-108 (definições de opção), consulta.ts:38-48, rotas.ts:18-27, plano.ts (COLUNAS) e cartao.ts (id separado de rotulo e descricao). A saída /saude ({ok, formato, motor}) e o envelope não têm texto humano.

## O que não foi verificado

O que ficou de fora e por quê. Entra no PR de correção correspondente ou numa conferência manual.

### Extensão

- **Leitor de tela real (VoiceOver, NVDA): anúncio do aviso role=status, pronúncia de ⌥⇧P e de →, leitura dos chips:** Não há leitor de tela automatizável nesta sessão. Os achados 15 e 21 ficam como risco medido pelo DOM.
- **Popup na janela real, aberto pelo ícone: zoom próprio da extensão, Esc fechando, limite de 800×600:** O Playwright abre popup.html como aba (pela costura ?aba= do build e2e). O zoom de 200% e 250% foi simulado pela viewport.
- **Menu de contexto nativo (Shift+F10 ou tecla Menu, Inserir › CPF e os outros itens):** O Playwright não aciona menu nativo. Os títulos ficam no menus.ts e nos testes Vitest dos handlers.
- **Trocar o atalho de fato em chrome://extensions/shortcuts e no about:addons:** Página chrome:// não é automatizável pelo Playwright. Conferi pelo código, por commands.getAll() e pela documentação.
- **Firefox, Edge e Opera:** O Playwright só carrega a extensão no Chromium. Contraste, foco e alvos foram medidos nos componentes, que são os mesmos nos quatro navegadores.
- **Estado 1e "Falta liberar o acesso a arquivos" no popup real:** A extensão carregada por --load-extension já tinha acesso a file://, então o popup abriu no 1b. Conferi pelas stories de arquivo-sem-acesso do Chrome, Edge, Opera e Firefox: 0 violações e contraste ok.
- **Alto contraste (forced colors) no popup real:** O diretório \~/Library/Caches/ms-playwright, com o Chromium 1248, deixou de existir no meio da auditoria. Não fui eu que apaguei e não reinstalei, pela regra de não instalar. Medi nas stories com o Chrome 157 estável, sem carregar a extensão (achados 03 e 05).
  - Depois: o verificador mediu no popup real, no Chrome 157 (EXT-05 e EXT-V03).
- **Zoom só de texto do Firefox e fonte mínima:** Só o Chromium foi medido. O teste de fonte do navegador usou default\_font\_size 32 no Chromium (achado 12).
- **Tempo exato de saída do aviso "saiu dos favoritos" no popup real:** Lido no código (use-desfazer.ts, 5000 ms). Medi só que o Desfazer aparece e que o foco se perde depois dele.
  - Depois: o verificador cronometrou no popup real: some em 5024 ms com o foco no Desfazer e em 5069 ms com o mouse em cima (EXT-14).
- **Leitor de PDF, iframe de outro domínio e painel lateral:** O Playwright não alcança o leitor de PDF nem o frame de outro domínio (ficam no checklist manual). A extensão não tem painel lateral.

### Site

- **Leitores de tela reais (VoiceOver, NVDA, TalkBack): leitura do 'Powered by', das teclas '⌥⇧P' e do JSON do terminal:** Não dá para rodar leitor de tela neste ambiente. Conferi só a árvore de acessibilidade (ariaSnapshot) e os atributos.
- **Tema de contraste real do Windows:** Medi só a emulação forced-colors do Chromium no Playwright. O Windows real não está disponível.
- **Firefox, Safari e WebKit:** Tudo rodou no Chromium. No fim da auditoria, a pasta \~/Library/Caches/ms-playwright sumiu, apagada por algo fora deste agente. Por isso a última medição (a rolagem da tabela de atalhos) usou o Chrome 157 instalado, via channel 'chrome'. Não instalei navegador nenhum.
- **Aumento de texto no celular (tamanho do texto do Chrome no Android, Dynamic Type no iOS) e o zoom só de texto do Firefox:** Emulei com o CDP Page.setFontSizes, que equivale ao tamanho de fonte padrão do Chrome para desktop. Não testei em aparelho.
- **Produção na Vercel, com os scripts de Analytics e Speed Insights:** Auditei só o build local, sem VERCEL\_ENV=production. Não acessei a produção, para não sondá-la.
- **Toque e voz (WCAG 2.5.1, 2.5.2 e comando de voz):** Não há gestos complexos nem arrastar, e os controles são link e button nativos. Não testei em tela de toque.

### Documentação e llms.txt

- **Safari/WebKit e Firefox (anel de foco, tabelas roláveis focáveis, rolagem suave):** O cache \~/Library/Caches/ms-playwright (Chromium 1248, WebKit e o headless shell) sumiu durante a auditoria, e não fui eu que apaguei. Não reinstalei, porque a regra é não instalar dependência. Daí em diante só o Google Chrome 157 instalado (canal 'chrome' do Playwright) estava disponível. O impacto real do DOC-11 e do DOC-19 no Safari ficou sem medir.
- **Leitor de tela real (VoiceOver, NVDA, TalkBack):** A auditoria foi automatizada (axe, ariaSnapshot e nomes acessíveis computados). A pronúncia do "(opens in new tab)" e dos emojis nos cards não foi ouvida.
- **Reduzir movimento ligado no sistema operacional:** Só usei a emulação do media query pelo Playwright (reducedMotion: 'reduce'). O código do voltar ao topo não consulta a preferência, mas não testei se o Chrome com o ajuste do macOS amortece a rolagem por conta própria.
  - Depois: o verificador mostrou que a rolagem é animada por JavaScript e ignora a preferência, do navegador ou do sistema (DOC-06).
- **Modo de alto contraste / forced-colors:** Fora do pedido e não emulado. A seta das categorias (background-image) e o voltar ao topo (mask com background-color) podem sumir nesse modo, mas não medi.
  - Depois: o verificador emulou o modo e achou o DOC-V04.
- **Toque em celular real:** Os botões Copiar e Alternar quebra de linha ficam com opacidade 0 até haver hover; num aparelho de toque isso só foi deduzido do CSS (@media hover), não testado.
- **Contraste em hover (links da barra lateral, borda da paginação) e do ícone de "copiado":** Não renderizei esses estados. O ícone de copiado (#00d600) foi só calculado a partir do CSS (cerca de 1,86:1 sobre #f6f8fa) e está registrado como cálculo no DOC-10.
  - Depois: o verificador mediu o ícone de "copiado": 1,86:1 no tema claro (DOC-10). Os hovers da barra lateral e da paginação continuam sem medição.
- **Páginas da documentação em produção:** O axe e as demais medições rodaram no build local do commit 78a51db (o da main). De produção, só o llms.txt e o llms-full.txt foram comparados, byte a byte idênticos. Os scripts do Vercel Analytics e do Speed Insights só entram no build de produção e não foram carregados.
- **Localização da documentação (en/es, catálogo de textos, datas e números):** Fica fora desta superfície (acessibilidade da documentação e llms.txt). Registro só que a documentação está apenas em pt-BR (docusaurus.config.mjs:23, i18n: { locales: \['pt-BR'] }). Por isso o llms.txt dos dois sites ainda não tem links en/es (DOC-20).
- **Correções que dependem de swizzle (DOC-04, DOC-06, DOC-14, DOC-17):** Só o CSS do DOC-02, do DOC-03 e da paginação no DOC-13 foi injetado e medido. As soluções com swizzle ou client module são propostas e não foram testadas.

### Localização (produto inteiro)

- **Se as fichas do Edge Add-ons e da Opera Add-ons por idioma dependem do `_locales` do pacote, como na Chrome Web Store:** Conferi só a doc da Chrome Web Store e a da AMO (Extension Workshop). Não abri o Partner Center nem a doc da Opera.
  - Depois: o verificador conferiu o Edge na documentação da Microsoft: o idioma da ficha sai do `_locales` (LOC-04). A Opera continua sem confirmação.
- **Tamanho real das traduções en/es no popup e no site:** Ainda não existe tradução. Medi com pseudolocalização genérica de +35% (a regra da skill), não com os textos finais.
- **Popup no Firefox, no Edge e no Opera com texto alongado:** A pseudolocalização rodou só no Chromium do Playwright com o build chrome-mv3-e2e. Os outros navegadores exigiriam carregar a extensão de outro jeito.
- **Estados 1e (página proibida), favoritos lotados (3/3), renomear favorito, 'saiu dos favoritos · Desfazer' e 'Nenhum formulário' com +35%:** Medi 1a, 1b (três filtros), resultado e o aviso. Os demais pedem preparar o estado (URL proibida, três favoritos, página sem campos) e ficaram fora do tempo da auditoria.
  - Depois: o verificador mediu os favoritos 3/3, o renomear e o "Nenhum formulário" (LOC-09). O 1e continua sem medição.
- **Menu de contexto com títulos 35% maiores:** É interface nativa do navegador e não dá para medir pelo DOM. O navegador trunca sozinho.
- **Pseudolocalização da documentação:** Não rodei. O tema do Docusaurus é responsivo, e o custo da documentação está no volume de texto (LOC-03), não no layout.
- **Comportamento do plugin llms-txt da documentação e do teste dos blocos `bash testar` com vários locales:** Exigiria mudar o docusaurus.config.mjs e buildar com locales, o que esta auditoria não pode fazer. Pela leitura, o scripts/exemplos.mjs:23 lê só documentacao/docs.
- **Como o leitor de tela pronuncia o aviso pt-BR numa página em inglês:** Medi só o idioma efetivo pelo DOM ('en'). Não testei com VoiceOver nem NVDA.
- **Se a AMO aceita a URL da ficha sem o segmento /pt-BR/ e escolhe o idioma pelo navegador:** Não fiz requisição à AMO. Fica para conferir no PR do LOC-15.
- **Se o pilutech-sites (que consome o PRODUTO.md) já tem rotas en/es:** Fica em outro repositório, fora desta superfície.
- **Detalhe das mensagens humanas da CLI, do servidor e do plugin (contagem por arquivo, Accept-Language no servidor):** Por divisão da tarefa, isso fica com o agente de pacotes. Aqui conferi só o --help e um erro de uso, ambos em pt-BR e sem respeitar o LANG.

### Pacotes (core e plugin do Playwright)

- **Como o leitor de tela (VoiceOver, NVDA) fala a ajuda, as mensagens, a seta '→' dos rótulos de cenário e os atalhos '⌥⇧P' que o core monta (atalhos.ts:22-35):** Não há leitor de tela automatizável nesta sessão. Medi só os caracteres: a ajuda não tem setas nem desenho de caixa. Quem mostra os rótulos e os atalhos é a extensão e o site, que têm outros auditores.
- **Terminal com zoom real de 200% ou Dynamic Type:** No lugar, medi a largura das linhas (PAC-07). Não abri um emulador de terminal com fonte aumentada.
- **Mensagens acentuadas no console do Windows (cmd ou PowerShell com code page legado):** Não há máquina Windows. A CLI escreve UTF-8 ('opção', 'válido') e não foi testada lá.
- **Binários Bun e a imagem Docker ghcr.io/piluvitu/botai:** Os textos são os mesmos do código, mas só rodei a CLI pelo dist no Node 22. Não rodei binário nem container.
- **Erro de listen fora da lista no botai serve (stack trace do Node):** Não reproduzi. O comportamento vem do código (serve.ts:115) e do packages/core/CLAUDE.md:167.
- **Validação acessível com bibliotecas reais (React Hook Form, Formik, Angular, Vue) e combobox ou datepicker reagindo ao focus sintético:** Medi só com uma página própria (validação nativa no blur e aria-invalid) e li o e2e do plugin (preencher.e2e.ts, 'emailTocado'). Não montei uma matriz por biblioteca.
- **Contraste dos contornos sobre o fundo real de cada formulário de terceiros:** Medi contra 6 fundos típicos (branco, cinzas claros, azul-50, preto, #121212), não contra páginas reais.
- **Erro 'o Botaí não achou o elemento do locator' do plugin (playwright/src/preencher.ts:189):** Não reproduzi: com locator sem alvo, o elementHandle() do Playwright tende a estourar o próprio timeout antes. Só li o código.
- **llms.txt, alvos de 44 px, foco visível, zoom de layout e axe:** Não se aplicam: os pacotes não têm tela nem são site. O que eles desenham na página (os contornos) está medido no PAC-03 e no PAC-04. O llms.txt que lista os pacotes do npm é do site (outra superfície).
