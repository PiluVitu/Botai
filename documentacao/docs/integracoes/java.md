---
title: Java
description: Receitas para usar o Botaí em Java pelo servidor HTTP, com o HttpClient do JDK, ou pela CLI, com ProcessBuilder. Não testadas em Java.
sidebar_position: 7
---

:::caution[Não testado]

Ninguém rodou Java contra o Botaí. O que foi provado: o servidor HTTP com um cliente [Python](./python.md) só da biblioteca padrão, e a CLI e o servidor devolvendo o mesmo envelope JSON.

:::

Em Java, a pessoa chega como JSON: pelo servidor HTTP ou pela saída da CLI. Os dois caminhos devolvem o mesmo envelope, `{formato, motor, semente, hoje, pessoa}`. O JDK não traz leitor de JSON: leia o envelope com a biblioteca que o seu projeto já usa. Os campos estão em [A pessoa](../conceitos/a-pessoa.md).

## Pelo servidor HTTP {#http}

Com o servidor no ar (veja [Subir o servidor](../servidor/botai-serve.md) ou a [imagem Docker](../docker/imagem.md)), o `java.net.http.HttpClient` basta:

```java title="PessoaDoBotai.java"
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class PessoaDoBotai {
    public static void main(String[] args) throws Exception {
        HttpClient cliente = HttpClient.newHttpClient();
        HttpRequest pedido = HttpRequest.newBuilder(
                URI.create("http://127.0.0.1:8790/pessoa?semente=cadastro-1&hoje=2026-10-05"))
            .GET()
            .build();
        HttpResponse<String> resposta = cliente.send(pedido, HttpResponse.BodyHandlers.ofString());
        if (resposta.statusCode() != 200) {
            // o corpo é {"erro": "..."}, com o parâmetro errado
            throw new IllegalStateException(resposta.statusCode() + ": " + resposta.body());
        }
        String envelope = resposta.body();
        System.out.println(envelope);
    }
}
```

As rotas, os parâmetros e os erros estão em [API HTTP](../servidor/api-http.md). Para um lote, use `/pessoas` com `n` de 1 a 10 000; com `formato=csv` e `campos`, a resposta vem em CSV, sem precisar de leitor de JSON.

## Pela CLI {#cli}

Com o `ProcessBuilder`, a CLI escreve o envelope no stdout e as mensagens no stderr:

```java
Process processo = new ProcessBuilder(
        "npx", "--yes", "@pilutech/botai-core@0.4.1", "pessoa",
        "--semente", "cadastro-1", "--hoje", "2026-10-05")
    .redirectError(ProcessBuilder.Redirect.INHERIT)
    .start();
String envelope = new String(processo.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
int codigo = processo.waitFor();
if (codigo != 0) {
    throw new IllegalStateException("botai saiu com " + codigo);
}
```

Fixe a versão no `npx`. Com o [binário](../binarios/install-sh.md) instalado, troque `"npx", "--yes", "@pilutech/botai-core@0.4.1"` por `"botai"`. Os códigos de saída estão em [Códigos de saída](../cli/codigos-de-saida.md).

## Selenium em Java {#selenium}

Para preencher um formulário com o Selenium, a pessoa vem do servidor ou da CLI e o motor vai como texto para a página. Veja [Selenium](./selenium.md).

## Ruby e PHP {#ruby-e-php}

O caminho é o mesmo: HTTP ou a CLI em subprocess. Também não foi testado.
