---
title: Limites
description: Tudo o que o Botaí não faz, num lugar só, dos dados aos formatos, ao servidor, ao preenchimento, à extensão e ao fixture do Playwright.
sidebar_position: 14
---

Esta página junta os limites conhecidos da versão 0.4.1 do core, da 0.1.0 do fixture e da 1.0.0 da extensão. Cada porta repete os seus na própria seção.

## Dados {#dados}

- **Há só 34 CEPs.** Com a UF fixa, 24 das 27 UFs têm um CEP só, e o lote inteiro recebe o mesmo endereço ([Os dados por trás](./conceitos/dados-por-tras.md#ceps)).
- **Os nomes repetem**: cerca de 8,6 a 8,7 mil distintos num lote de 10 000. A unicidade vale só para e-mail, CPF e CNPJ, e só dentro do mesmo lote.
- **Uma UF ou todas.** A distribuição por UF segue a lista de CEPs (SP aparece em cerca de 18%). Não dá para pedir um lote com algumas UFs.
- **O RG é sempre SSP/SP**, em qualquer UF, e não gera dígito X por padrão.
- **Cartão**: só os dois de teste da Stripe. Não há Elo, Amex nem Hipercard.
- **Faixas fixas**: a idade vai de 18 a 65; o celular é sempre móvel (não há telefone fixo); a senha tem 12 caracteres (o subpath `/senha` aceita de 12 a 16).
- **4 opções na raiz**: semente, hoje, UF e domínio do e-mail. Sexo, idade e cidade exigem montar a pessoa à mão pelos subpaths.
- **DDD**: o `gerarCelular` só confere o formato do DDD; não há lista de DDDs existentes.
- **CNPJ alfanumérico** (vigente desde julho de 2026): não é gerado, e o `validarCNPJ` o recusa.

## CLI e formatos {#cli}

- **O SQL traz só INSERTs**, sem `CREATE TABLE`: crie a tabela antes ([Receitas de banco](./cli/receitas-de-banco.md)).
- **O `--formato json` monta o lote inteiro em memória**: cerca de 1,5 GB com 100 000 pessoas. Para lote grande, use ndjson, csv ou sql (medido em 2026-10-08, macOS arm64, Node 22.22.3).
- **O `validar` não cobre** celular, CEP nem e-mail. Não há gerador avulso de nome, e-mail, senha, endereço ou cartão.
- **A mesma semente em tipos diferentes** dá números que começam com os mesmos dígitos. Para valores independentes, não reuse uma semente entre `cpf`, `cnpj`, `rg`, `pis` e `titulo`:

  ```bash testar
  for tipo in cpf cnpj rg pis titulo; do
    echo "$tipo: $(botai "$tipo" --semente 7)"
  done
  ```

  ```text
  cpf: 46431371267
  cnpj: 46431371000129
  rg: 464313715
  pis: 14643137122
  titulo: 464313710167
  ```

- **O `--uf` não vale** em `cnpj`, `rg` e `pis` (saída 2):

  ```bash testar=2
  botai cnpj --uf SP
  ```

  ```text
  botai: --uf não vale para cnpj
  ```

- **O `--dialeto` diferencia maiúsculas**, ao contrário do `--uf`:

  ```bash testar=2
  botai pessoas -n 2 --formato sql --dialeto MySQL
  ```

  ```text
  botai: dialeto desconhecido "MySQL" (use postgres, mysql, sqlite)
  ```

- **Postgres e SQLite saem iguais byte a byte**; só o MySQL muda (crases e escape de barra invertida):

  ```bash testar
  cmp <(botai pessoas -n 100 --semente carga --hoje 2026-10-05 --formato sql --dialeto postgres) \
    <(botai pessoas -n 100 --semente carga --hoje 2026-10-05 --formato sql --dialeto sqlite) \
    && echo "postgres e sqlite: iguais"
  ```

  ```text
  postgres e sqlite: iguais
  ```

:::note[Documentado]

A importação no MySQL não foi feita num banco real. O texto do `--dialeto mysql` confere com o dourado. A importação no Postgres 16 e no SQLite foi provada.

:::

## Servidor e imagem {#servidor}

- **Sem CORS, TLS nem autenticação.** Um front-end de outra origem que faça `fetch` recebe "Failed to fetch". O servidor é para testes, scripts e back-end.
- **`n` de 1 a 10 000** por requisição.
- **Sem streaming.** O servidor monta o corpo inteiro em memória, e uma requisição grande trava as outras: o `/saude` levou 184 ms durante um `n=10000`, contra 0,1 ms sozinho (medido em 2026-10-08, macOS arm64, Node 22.22.3).
- **Só GET.** HEAD e OPTIONS dão 405: um health check que use HEAD marca o serviço como fora do ar.
- **Parâmetros desconhecidos**: o `/saude` os ignora; o `/pessoa` e o `/pessoas` dão 400.
- **Só IPv4 por padrão.** Um cliente que tente apenas `::1` falha.
- **Imagem**: não há tag de minor (`:0.4`).
- **`install.sh`**: depende de o release do core estar marcado como Latest e não serve no Windows (lá, baixe o `.exe`).

## Preenchimento {#preenchimento}

Vale para a extensão, o fixture e o motor, salvo onde a linha diz.

- **Tipos de campo que ficam de fora**: checkbox, radio, file, range, color, hidden, select múltiplo e combobox sem `<select>` nativo. O "aceito os termos" fica desmarcado.
- **`contenteditable`**: fica vazio no fixture e no motor; na extensão, só o Inserir (modo B) escreve nele.
- **Campos que só habilitam depois da busca de CEP** ficam vazios. A 2ª passada só regrava o que o Botaí já tinha escrito.
- **O motor sobrescreve** o que já foi digitado. Não há modo "só os vazios".
- **Recusados**: o que não cabe no `maxlength` (o Botaí não trunca) e um `<select>` sem a opção da pessoa vão para `recusados`.
- **Não reconhecidos**: campo que o classificador não conhece vai para `naoReconhecidos`, sem chute. Exemplos: "Idade", "Observações", "Código de indicação". "Telefone" recebe o celular; "Telefone fixo" é vetado de propósito. Um campo de rua sem campo de número na página recebe "rua, número".
- **Shadow root fechada**: a extensão preenche; o fixture e o `navegador.iife.js` não. Só a API ESM de baixo nível chega nela, com adaptador.
- **Iframes**:
  - a extensão soma os da mesma origem e deixa de fora os de outro domínio (Stripe Elements, Pagar.me), por causa do `activeTab`;
  - o fixture percorre todos os frames;
  - o `navegador.iife.js` vê um documento por chamada. O `iframesDeFora` conta só os de outra origem: `0` não quer dizer "preenchi tudo".
- **A 2ª passada custa cerca de 1 s** por chamada que escreve algo.
- **jsdom**: sem o shim de layout, o motor quebra com `TypeError: el.checkVisibility is not a function`. Com o shim, todo campo parece visível ([jsdom](./navegador/jsdom.md)).

:::note[Documentado]

O motor roda no mundo MAIN da página: um site que troca protótipos nativos pode interferir. Ninguém provocou esse caso.

:::

## Extensão {#extensao}

- **Sem opções**: não há semente, UF nem domínio de e-mail.
- **O `activeTab` cai quando a aba navega**: cada etapa de um fluxo precisa de um novo gesto (atalho, popup ou menu).
- **Páginas proibidas** (`chrome://`, `about:`, lojas de extensão, leitor de PDF, `file:` sem permissão): a extensão não preenche, e o atalho não faz nada.
- **O E2E funcional existe só no Chromium.** Firefox, Edge e Opera reais dependem de checklists manuais.
- **O atalho sugerido só vale na primeira instalação.** Se outro app tomou a tecla, o popup mostra "definir atalho".
- **O contraste dos contornos é baixo por decisão** (2,1:1 no ciano e 1,8:1 no âmbar): quem leva a informação é o aviso na página.
- **Lojas**: só a Chrome Web Store (que também serve ao Edge) e a Firefox Add-ons estão no ar. O Opera está em revisão. Safari e Firefox para Android estão fora.

## Fixture do Playwright {#playwright}

- **Locator com mais de um elemento** quebra com `strict mode violation`: aponte para o contêiner ou passe a Page. Um Locator sem elemento fica esperando até o timeout do teste, sem erro próprio do Botaí.
- **Relógio parado**: com `page.clock.install({ time })` seguido de `page.clock.pauseAt(…)`, a Promise do `botai.preencher` não resolve: a 2ª passada, de cerca de 1 s, fica esperando o relógio. Só `page.clock.install()` não atrapalha. Use `{ segundaPassada: false }` ou avance o relógio com `page.clock.runFor(1500)` ([Relógio e 2ª passada](./playwright/relogio-e-segunda-passada.md)).
- **Anotações e anexo** só aparecem em testes que pedem o fixture `botai`.
- **Uma cópia só** do `@playwright/test` no projeto. O E2E exige os navegadores da versão exata do Playwright (`playwright install`).
- **O 0.1.0 depende do core 0.4.0** exato: a pessoa é a mesma da 0.4.1, e o anexo diz `motor 0.4.0`.

## Ambiente {#ambiente}

O pacote do core não declara `engines`. Foram testados o Node 22 e o 24 (a imagem roda o 24.21.0).

:::note[Documentado]

Segundo o README do core e o `install.sh`, sem rodar: não há binário para Alpine nem para outro Linux com musl (use a imagem ou o npm). Os binários não têm assinatura de desenvolvedor identificado: o macOS tem só a assinatura ad-hoc, e no Windows o SmartScreen avisa antes de rodar.

:::
