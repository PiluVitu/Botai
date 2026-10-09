---
title: Python
description: Pessoas do Botaí em Python pelo servidor HTTP, só com a biblioteca padrão (urllib e json), e as receitas de lote e de CLI em subprocess.
sidebar_position: 5
---

Em Python, o caminho provado é o HTTP: suba o servidor do Botaí e leia o envelope com o `urllib` da biblioteca padrão, sem pacote nenhum.

## Subir o servidor {#servidor}

Escolha uma das portas:

```bash
npx -y @pilutech/botai-core@0.5.0 serve
```

```bash
docker run --rm -p 8790:8790 ghcr.io/piluvitu/botai:0.5.0
```

Ou o binário, com `botai serve`. As opções estão em [Subir o servidor](../servidor/botai-serve.md).

## Uma pessoa {#uma-pessoa}

```python title="cliente.py"
import json, urllib.request
with urllib.request.urlopen('http://127.0.0.1:8790/pessoa?semente=cadastro-1&hoje=2026-10-05') as r:
    envelope = json.load(r)
print(envelope['pessoa']['cpf'])
```

```text
426.419.258-77
```

O envelope é o mesmo da CLI: `formato`, `motor`, `semente`, `hoje` e `pessoa`. Os campos da pessoa estão em [A pessoa](../conceitos/a-pessoa.md), e as rotas, em [API HTTP](../servidor/api-http.md).

Para conferir do terminal, a mesma semente e o mesmo dia dão o mesmo CPF:

```bash testar
curl -fsS 'http://127.0.0.1:8790/pessoa?semente=cadastro-1&hoje=2026-10-05' | grep '"cpf"'
```

```text
    "cpf": "426.419.258-77",
```

Fixe a semente e o `hoje` nos testes: sem `hoje`, a mesma semente gera outra pessoa no dia seguinte (veja [Semente e hoje](../conceitos/semente-e-hoje.md)).

## Um lote {#lote}

:::caution[Não testado]

A auditoria provou o `urllib` com o `/pessoa`. Com o `/pessoas` em ndjson, ninguém rodou esta receita; o que foi provado é a resposta: um envelope por linha, com `n` de 1 a 10 000.

:::

```python
import json, urllib.request

url = 'http://127.0.0.1:8790/pessoas?n=100&semente=testes&hoje=2026-10-05&formato=ndjson'
with urllib.request.urlopen(url) as r:
    pessoas = [json.loads(linha)['pessoa'] for linha in r]
```

Dentro de um lote, e-mail, CPF e CNPJ não se repetem (veja [Lote e unicidade](../conceitos/lote-e-unicidade.md)).

## Erros {#erros}

:::caution[Não testado]

Ninguém rodou esta receita. O que foi provado: um pedido errado recebe 400, 404 ou 405 com o corpo `{"erro": "..."}`.

:::

O `urllib` lança `HTTPError` em status 400 ou mais. O corpo do erro diz qual parâmetro está errado:

```python
import json, urllib.error, urllib.request

try:
    urllib.request.urlopen('http://127.0.0.1:8790/pessoas?n=10001')
except urllib.error.HTTPError as e:
    print(e.code, json.load(e)['erro'])
```

As mensagens estão em [Mensagens de erro](../referencia/mensagens-de-erro.md#servidor-rotas).

## Pela CLI, em subprocess {#subprocess}

:::caution[Não testado]

Esta receita vem do README do core, e ninguém a rodou. O que foi provado: o `npx` com a versão exata gera o mesmo que o build local, e o ndjson traz um envelope por linha.

:::

```python
import json, subprocess

saida = subprocess.run(
    ["npx", "--yes", "@pilutech/botai-core@0.5.0", "pessoas", "-n", "10",
     "--semente", "testes", "--hoje", "2026-10-05", "--formato", "ndjson"],
    capture_output=True, text=True, check=True,
).stdout
pessoas = [json.loads(linha)["pessoa"] for linha in saida.splitlines()]
```

Com o binário instalado, troque `"npx", "--yes", "@pilutech/botai-core@0.5.0"` por `"botai"`. Os códigos de saída da CLI estão em [Códigos de saída](../cli/codigos-de-saida.md).

## Selenium em Python {#selenium}

Para preencher um formulário com o Selenium, a pessoa vem do servidor ou da CLI e o motor vai como texto para a página. Veja [Selenium](./selenium.md).
