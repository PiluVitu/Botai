---
title: GitHub Actions
description: A imagem do Botaí como service container num job do GitHub Actions, e as alternativas com o npx de versão fixa e com o binário no runner.
sidebar_position: 2
---

:::note[Documentado]

O bloco `services:` vem do README do core, e o CI do próprio projeto usa a imagem assim: o job `imagem-publicada` sobe a imagem como service e a confere por `http://127.0.0.1:8790`. A auditoria de 2026-10-08 não reproduziu esse uso num workflow. O que ela provou: a imagem fica `healthy` em 1 a 2 s, responde no `/saude` e gera a mesma pessoa que as outras portas.

:::

## A imagem como service {#service}

```yaml
services:
  botai:
    image: ghcr.io/piluvitu/botai:0.4.1
    ports: ['8790:8790']
```

Num job inteiro, os passos rodam no runner e falam com o service por `127.0.0.1:8790`, como no CI do projeto:

```yaml title=".github/workflows/testes.yml"
jobs:
  testes:
    runs-on: ubuntu-24.04
    services:
      botai:
        image: ghcr.io/piluvitu/botai:0.4.1
        ports: ['8790:8790']
    steps:
      - name: Botaí no ar
        run: curl -fsS http://127.0.0.1:8790/saude
      - name: Uma pessoa para o teste
        run: curl -fsS 'http://127.0.0.1:8790/pessoa?semente=42&hoje=2026-10-05' > pessoa.json
```

Fixe a versão da imagem: `ghcr.io/piluvitu/botai:0.4.1`. Não existe tag de minor (veja [Tags](./imagem.md#tags)). As rotas estão em [API HTTP](../servidor/api-http.md).

## Sem service {#sem-service}

O Botaí entra no job por outras duas portas:

- **`npx` com a versão exata**, num job que tenha Node. O `npx` funciona onde houver Node (provado fora do Actions):

  ```yaml
  - name: Pessoas para o banco
    run: npx -y @pilutech/botai-core@0.4.1 pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql > pessoas.sql
  ```

- **O binário**, num runner sem Node: veja [install.sh](../binarios/install-sh.md) e [Download e verificação](../binarios/download-e-verificacao.md).

Para semear o banco com o SQL, veja [Receitas de banco](../cli/receitas-de-banco.md).

## O fixture do Playwright no CI {#playwright}

Com o fixture `botai`, o relatório do Playwright traz a pessoa de cada teste: as anotações `botai-semente` e `botai-hoje` em todo teste que usa o fixture, e o anexo `botai-pessoa.json` em cada falha inesperada. Veja [Reproduzir uma falha](../playwright/reproduzir-uma-falha.md).
