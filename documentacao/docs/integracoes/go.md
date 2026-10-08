---
title: Go
description: Receitas para usar o Botaí em Go pelo servidor HTTP, com net/http, ou pela CLI, com os/exec. Nenhuma das duas foi testada em Go.
sidebar_position: 6
---

:::caution[Não testado]

Ninguém rodou Go contra o Botaí. O que foi provado: o servidor HTTP com um cliente [Python](./python.md) só da biblioteca padrão, e a CLI e o servidor devolvendo o mesmo envelope JSON. As receitas abaixo usam só a biblioteca padrão do Go.

:::

Em Go, a pessoa chega como JSON: pelo servidor HTTP ou pela saída da CLI. Os dois caminhos devolvem o mesmo envelope, `{formato, motor, semente, hoje, pessoa}`.

## O envelope {#envelope}

Declare só os campos que o teste usa. Os nomes estão em [A pessoa](../conceitos/a-pessoa.md):

```go
type Envelope struct {
	Formato int    `json:"formato"`
	Motor   string `json:"motor"`
	Semente string `json:"semente"`
	Hoje    string `json:"hoje"`
	Pessoa  struct {
		Nome struct {
			Completo string `json:"completo"`
		} `json:"nome"`
		CPF   string `json:"cpf"`
		Email struct {
			Endereco string `json:"endereco"`
		} `json:"email"`
	} `json:"pessoa"`
}
```

## Pelo servidor HTTP {#http}

Com o servidor no ar (veja [Subir o servidor](../servidor/botai-serve.md) ou a [imagem Docker](../docker/imagem.md)):

```go title="main.go"
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// type Envelope struct { ... }, como acima

func main() {
	r, err := http.Get("http://127.0.0.1:8790/pessoa?semente=cadastro-1&hoje=2026-10-05")
	if err != nil {
		log.Fatal(err)
	}
	defer r.Body.Close()
	if r.StatusCode != http.StatusOK {
		var e struct {
			Erro string `json:"erro"`
		}
		json.NewDecoder(r.Body).Decode(&e)
		log.Fatalf("%d: %s", r.StatusCode, e.Erro)
	}
	var env Envelope
	if err := json.NewDecoder(r.Body).Decode(&env); err != nil {
		log.Fatal(err)
	}
	fmt.Println(env.Pessoa.Nome.Completo, env.Pessoa.CPF)
}
```

Um pedido errado recebe 400, 404 ou 405 com `{"erro": "..."}` (veja [API HTTP](../servidor/api-http.md#erros)). Para um lote, use `/pessoas` com `n` de 1 a 10 000.

## Pela CLI {#cli}

:::note[Documentado]

A chamada ao `npx` vem do README do core. Ninguém a rodou em Go.

:::

```go
saida, err := exec.Command("npx", "--yes", "@pilutech/botai-core@0.4.1", "pessoa",
	"--semente", "cadastro-1", "--hoje", "2026-10-05").Output()
if err != nil {
	log.Fatal(err)
}
var env Envelope
if err := json.Unmarshal(saida, &env); err != nil {
	log.Fatal(err)
}
```

Fixe a versão no `npx`. Com o [binário](../binarios/install-sh.md) instalado, troque `"npx", "--yes", "@pilutech/botai-core@0.4.1"` por `"botai"`. A CLI sai com 2 em erro de uso, sempre com o stdout vazio (veja [Códigos de saída](../cli/codigos-de-saida.md)).
