---
title: docker compose
description: O servidor do Botaí como um serviço do docker compose, ao lado da sua aplicação e dos testes que o chamam.
sidebar_position: 3
---

:::note[Documentado]

O bloco abaixo vem do README do core. Ninguém o rodou num docker compose na auditoria de 2026-10-08. O que foi provado: a imagem sobe com `docker run`, fica `healthy` em 1 a 2 s e responde no `/saude`.

:::

```yaml title="compose.yaml"
services:
  botai:
    image: ghcr.io/piluvitu/botai:0.5.0
    ports: ['8790:8790']
```

Com o serviço no ar, a sua máquina chama o servidor em `http://127.0.0.1:8790`, como em [API HTTP](../servidor/api-http.md). Fixe a versão exata da imagem (veja [Tags](./imagem.md#tags)).

Para outra porta, mude a de fora no `ports` (`'9000:8790'`) e deixe a de dentro em 8790: o HEALTHCHECK olha a 8790 (veja [Outra porta](./imagem.md#outra-porta)).

## Chamar de outro serviço {#outro-servico}

:::caution[Não testado]

Ninguém rodou esta receita. O que foi provado: dentro do contêiner, o servidor escuta em `0.0.0.0:8790`, e a imagem tem um HEALTHCHECK que faz GET no `/saude`.

:::

Num serviço do mesmo compose, o nome do serviço vira o host: os testes chamam `http://botai:8790`. O `ports` só é preciso para chamar da sua máquina. Para os testes esperarem o Botaí ficar `healthy`:

```yaml title="compose.yaml"
services:
  botai:
    image: ghcr.io/piluvitu/botai:0.5.0
  testes:
    build: .
    depends_on:
      botai:
        condition: service_healthy
```
