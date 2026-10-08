---
title: Selenium
description: Receita para preencher formulários no Selenium (Python, Java e outras linguagens) com o navegador.iife.js e uma pessoa do servidor ou da CLI. Não testada.
sidebar_position: 2
---

:::caution[Não testado]

Ninguém rodou esta receita com o Selenium: o safaridriver exigiu ligar "Allow remote automation", o que não foi feito, e não havia chromedriver nem geckodriver na máquina. O que foi provado em volta: o motor preencheu um cadastro realista com 21 preenchidos, 2 não reconhecidos e 0 recusados no Playwright cru (Chromium, Firefox, WebKit, Chrome e Edge) e pelo CDP puro; a pessoa vem igual da CLI, do binário e do servidor; e o cliente Python só com `urllib` lê o servidor.

:::

## O caminho

O Selenium fala com o navegador pelo WebDriver, em qualquer linguagem (Java, Python, C#, Ruby, JS). A receita tem três passos:

1. **a pessoa**, como JSON: do servidor (`GET /pessoa`), da CLI ou do binário (`botai pessoa`);
2. **o motor**, como texto: `driver.execute_script(<texto do navegador.iife.js>)`;
3. **a chamada**: `execute_async_script`, com o callback do WebDriver, para esperar a 2ª passada.

## A pessoa

Com o servidor no ar (`botai serve`, a imagem ou o binário), a pessoa sai por HTTP, em qualquer linguagem:

```bash testar
curl -fsS 'http://127.0.0.1:8790/pessoa?semente=cadastro&hoje=2026-10-08'
```

Sem servidor, a CLI imprime o mesmo envelope: `botai pessoa --semente cadastro --hoje 2026-10-08`. Use `envelope["pessoa"]` e `envelope["hoje"]`. Veja [API HTTP](../servidor/api-http.md) e [Uma pessoa](../cli/pessoa.md).

## O arquivo do motor

O `navegador.iife.js` vem no pacote `@pilutech/botai-core` do npm. Num projeto com `node_modules`, ele está em `node_modules/@pilutech/botai-core/dist/navegador.iife.js`. Num projeto sem `node_modules`, baixe o pacote uma vez com o npm e guarde o arquivo junto dos testes:

```bash
npm pack @pilutech/botai-core@0.4.1
tar -xzf pilutech-botai-core-0.4.1.tgz package/dist/navegador.iife.js
mv package/dist/navegador.iife.js navegador.iife.js
```

Troque o arquivo quando subir a versão do Botaí.

## Python

```python
import json
import urllib.request
from pathlib import Path

from selenium import webdriver

TEXTO_DO_IIFE = Path("navegador.iife.js").read_text(encoding="utf-8")

with urllib.request.urlopen(
    "http://127.0.0.1:8790/pessoa?semente=cadastro&hoje=2026-10-08"
) as r:
    envelope = json.load(r)

driver = webdriver.Chrome()
try:
    driver.get("http://localhost:3000/cadastro")
    driver.execute_script(TEXTO_DO_IIFE)
    resultado = driver.execute_async_script(
        """
        const [pessoa, hoje, pronto] = arguments;
        window.__botaiNavegador
          .preencher(document, pessoa, hoje, { segundaPassada: true })
          .then(pronto);
        """,
        envelope["pessoa"],
        envelope["hoje"],
    )
    print(len(resultado["preenchidos"]), resultado["naoReconhecidos"])
finally:
    driver.quit()
```

O `execute_async_script` passa o callback como último argumento; o motor o chama quando a Promise resolve, depois da 2ª passada (cerca de 1 s).

## Java

Em Java, dá para passar o envelope como texto e fazer o `JSON.parse` na página, sem biblioteca de JSON no teste:

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.chrome.ChromeDriver;

public class PreencherCadastro {
  public static void main(String[] args) throws Exception {
    String motor = Files.readString(Path.of("navegador.iife.js"));
    String envelope = HttpClient.newHttpClient()
        .send(
            HttpRequest.newBuilder(
                    URI.create("http://127.0.0.1:8790/pessoa?semente=cadastro&hoje=2026-10-08"))
                .build(),
            HttpResponse.BodyHandlers.ofString())
        .body();

    ChromeDriver driver = new ChromeDriver();
    try {
      driver.get("http://localhost:3000/cadastro");
      JavascriptExecutor js = driver;
      js.executeScript(motor);
      Object resultado = js.executeAsyncScript("""
          const envelope = JSON.parse(arguments[0]);
          const pronto = arguments[arguments.length - 1];
          window.__botaiNavegador
            .preencher(document, envelope.pessoa, envelope.hoje, { segundaPassada: true })
            .then(pronto);
          """, envelope);
      System.out.println(resultado);
    } finally {
      driver.quit();
    }
  }
}
```

## O resultado

O objeto que volta é `{ preenchidos, naoReconhecidos, recusados, contentType, iframesDeFora }`, e cada linha das listas é `{ idx, rotulo, seletor }`. Um teste de regressão pode exigir `naoReconhecidos` vazio: ele avisa quando aparece um campo novo sem rótulo reconhecível. Veja [a API](../navegador/iife.md#api).

## Iframes

Uma chamada vê um documento só. Para um formulário dentro de um iframe, troque o driver para o frame (`driver.switch_to.frame`), injete o motor ali e chame de novo. Veja [Iframes e janelas](../navegador/iframes-e-janelas.md).
