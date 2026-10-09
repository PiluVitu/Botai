# @pilutech/botai-core

O motor do [Botaí](https://botai.pilutech.com.br): gera pessoas brasileiras de teste, coerentes e reproduzíveis. O CPF sai da região fiscal da UF do endereço, o DDD do celular é o do CEP, o e-mail vem do nome, a empresa vem dos sobrenomes, e os documentos passam no dígito verificador. A mesma semente e o mesmo `hoje` geram a mesma pessoa na biblioteca, na CLI e na extensão.

- Sem dependência de runtime. ESM com tipos.
- Roda em Node, Bun, Deno e navegador: fora do `bin` e do `/servidor` (Node) e do `/navegador` (DOM), nenhum módulo usa API de Node ou do DOM.
- MIT © PiluTech.

## Instalar

```bash
npm i -D @pilutech/botai-core
```

## Biblioteca

```ts
import {
  gerarEnvelopeDaPessoa,
  gerarPessoa,
  gerarPessoas,
} from '@pilutech/botai-core'

const pessoa = gerarPessoa({ semente: 'cadastro-1', hoje: '2026-10-05' })
const lote = gerarPessoas(100, {
  semente: 'carga',
  uf: 'PI',
  dominioEmail: 'example.com',
})
const comSemente = gerarEnvelopeDaPessoa() // { formato, motor, semente, hoje, pessoa }
const recusada = gerarPessoa({
  semente: 'checkout-1',
  cartao: { provedor: 'pagarme', cenario: 'recusado' },
})
const checkout = gerarPessoas(13, {
  semente: 'checkout',
  cartao: {
    provedor: 'stripe',
    cenarios: { recusado: 10, aprovado: 2, pendente: 1 },
  },
})
```

| Raiz                                                                        | O que faz                                                     |
| --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `gerarPessoa(opcoes?)`                                                      | uma pessoa                                                    |
| `gerarPessoas(n, opcoes?)`                                                  | `n` pessoas (até 100 000) sem e-mail, CPF ou CNPJ repetido    |
| `gerarEnvelopeDaPessoa(opcoes?)`, `gerarEnvelopeDasPessoas(n, opcoes?)`     | o mesmo, dentro do envelope com a semente e o `hoje` usados   |
| `rngDeSemente(semente)`                                                     | o gerador (`sfc32`) de uma semente; `42` e `'42'` dão o mesmo |
| `sementeAleatoria()`                                                        | 16 dígitos hexadecimais                                       |
| `hojeEmSaoPaulo(agora?)`                                                    | a data civil de São Paulo (`AAAA-MM-DD`)                      |
| `FORMATO`, `MOTOR`, `DOMINIO_EMAIL_PADRAO`, `LIMITE_DO_LOTE`, `ErroDeOpcao` | constantes e o erro de opção inválida (`erro.opcao` diz qual) |
| `CATALOGO_DE_CARTOES`                                                       | os cartões de teste de cada provedor, por cenário             |

Opções: `semente` (número inteiro ou texto de até 256 caracteres), `hoje` (`AAAA-MM-DD`), `uf` (sigla), `dominioEmail` e `cartao` (`{ provedor, cenario }`; no lote, `{ provedor, cenarios }`).

Subpaths: `/pessoa` (`montarPessoa(rng, hoje, opcoes?)`), `/plano` (visão plana, CSV e SQL), `/servidor` (o servidor HTTP do `botai serve`, só no Node), `/cpf`, `/cnpj`, `/rg`, `/pis`, `/titulo-eleitor`, `/celular`, `/nascimento`, `/senha`, `/nome`, `/endereco`, `/empresa`, `/cartao`, `/uf`, `/aleatorio`, `/prng`, `/campos`, `/campos-formatar`, `/atalhos` e os esquemas `/esquema/envelope-v2.schema.json` (o atual) e `/esquema/envelope-v1.schema.json` (o de antes da 0.5.0).

### Reproduzir uma pessoa

- Fixe a semente **e** o `hoje`. Sem `hoje`, vale a data de hoje em São Paulo, e a idade e a validade do cartão mudam de um dia para o outro.
- Texto vira NFC antes do hash: `São` digitado ou colado de um nome de arquivo do macOS é a mesma semente.
- Fixe a versão do pacote. Mudar a pessoa que uma semente gera é versão major (na série 0.x, a minor).
- No lote, a pessoa `i` (a partir de 0) vem da semente `S/i`. Se ela repetir o e-mail, o CPF ou o CNPJ de uma anterior, é sorteada de novo com `S/i/2`, `S/i/3`… Na saída `ndjson` da CLI, cada linha traz a semente exata.
- As primeiras `k` pessoas de um lote de `n` são o lote de `k`.

### Cartões de teste

O cartão da pessoa usa só números de teste oficiais: os da [Stripe](https://docs.stripe.com/testing) e os do [simulador da Pagar.me](https://docs.pagar.me/docs/simulador-de-cartão-de-crédito). Um número aleatório que passa no Luhn não aprova em sandbox e pode ser o de um cartão real. O padrão é `stripe` + `aprovado` (Visa `4242 4242 4242 4242` ou Mastercard `5555 5555 5555 4444`).

| Provedor  | Cenários                                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stripe`  | `aprovado`, `recusado`, `pendente` (exige 3DS), `recusado-saldo`, `recusado-roubado`, `recusado-perdido`, `recusado-expirado`, `recusado-cvc`, `erro-processamento` |
| `pagarme` | `aprovado`, `recusado`, `pendente` (processa e aprova), `pendente-recusado`, `pendente-cancelado`, `chargeback`                                                     |

- O cenário muda só o cartão: a mesma semente gera a mesma pessoa em qualquer cenário, com a mesma validade e o mesmo CVV. O cartão leva `provedor` e `cenario`.
- No lote, `cenarios: { recusado: 10, aprovado: 2 }` gera as pessoas em grupos, na ordem dada; `n` é a soma (outro `n` é erro). A pessoa `i` continua sendo a da semente `S/i`.
- Provedor ou cenário desconhecido (ou que o provedor não tem) lança `ErroDeOpcao` com a lista dos válidos. O `CATALOGO_DE_CARTOES` (também em `/cartao`) traz o número, o rótulo, a descrição e o tipo (`ok`, `erro`, `espera`) de cada cenário.

### E-mail

O domínio padrão é `tuamaeaquelaursa.com`, uma caixa de entrada **pública**: quem souber o endereço lê. Serve para testar cadastro com confirmação por e-mail, nunca para conta real. Com `dominioEmail: 'example.com'` o domínio muda e `email.caixaUrl` vira `null`.

## CLI

```bash
npx @pilutech/botai-core pessoa --semente 42 --hoje 2026-10-05
npx @pilutech/botai-core pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql > pessoas.sql
npx @pilutech/botai-core pessoas -n 50 --formato csv --campos nome,cpf,email > pessoas.csv
npx @pilutech/botai-core pessoas --cartao pagarme --cenarios recusado:10,aprovado:2,pendente:1 --formato csv
npx @pilutech/botai-core cartao --cartao stripe --cenario recusado-saldo --formatado
npx @pilutech/botai-core cpf --formatado --uf PI
npx @pilutech/botai-core validar cnpj 35.728.569/0001-52
```

Instalado no projeto, o binário se chama `botai`.

| Comando                                                                                                                                      | Saída                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `botai pessoa [--semente S] [--hoje AAAA-MM-DD] [--uf UF] [--dominio-email D] [--cartao P] [--cenario C]`                                    | envelope JSON                                                                    |
| `botai pessoas -n N [as mesmas opções] [--formato json\|ndjson\|csv\|sql] [--dialeto postgres\|mysql\|sqlite] [--tabela T] [--campos a,b,c]` | o lote                                                                           |
| `botai pessoas --cenarios C:N,C:N [--cartao P] [as outras opções]`                                                                           | o lote em grupos por cenário; o `-n`, se vier, tem de ser a soma                 |
| `botai cpf\|cnpj\|rg\|pis\|titulo\|celular\|cep [--formatado] [--uf UF] [--semente S]`                                                       | um valor (só dígitos sem `--formatado`; `--uf` só em cpf, titulo, celular e cep) |
| `botai cartao [--cartao stripe\|pagarme] [--cenario C] [--formatado] [--semente S]`                                                          | um número de cartão de teste                                                     |
| `botai validar cpf\|cnpj\|rg\|pis\|titulo\|cartao <valor>`                                                                                   | `válido` ou `inválido`                                                           |
| `botai --help`, `botai <comando> --help`, `botai --versao`                                                                                   | ajuda e versão                                                                   |

- Dados no stdout, mensagens no stderr. Saída `0` ok, `1` valor inválido no `validar`, `2` erro de uso, `3` erro interno.
- `json`: `{ formato, motor, semente, hoje, pessoas }`. `ndjson`: um `{ formato, motor, semente, hoje, pessoa }` por linha. `csv`: RFC 4180, com cabeçalho, CRLF e nulo como campo vazio. `sql`: uma linha de comentário com formato, motor, semente e hoje, e um `INSERT` por pessoa.
- `--tabela` aceita `tabela` ou `esquema.tabela` (letras, dígitos e `_`).

### Colunas do CSV e do SQL

| Coluna             | Campo da `Pessoa`                   | Coluna                  | Campo da `Pessoa`      |
| ------------------ | ----------------------------------- | ----------------------- | ---------------------- |
| `nome`             | `nome.completo`                     | `celular`               | `celular.formatado`    |
| `prenome`          | `nome.prenome`                      | `celular_e164`          | `celular.e164`         |
| `sobrenomes`       | `nome.sobrenomes` unidos por espaço | `cep`                   | `endereco.cep`         |
| `sexo`             | `nome.sexo`                         | `logradouro`            | `endereco.logradouro`  |
| `nascimento`       | `nascimento.iso`                    | `numero`                | `endereco.numero`      |
| `idade`            | `nascimento.idade` (número)         | `complemento`           | `endereco.complemento` |
| `cpf`              | `cpf`                               | `bairro`                | `endereco.bairro`      |
| `rg`               | `rg.numero`                         | `cidade`                | `endereco.cidade`      |
| `rg_orgao_emissor` | `rg.orgaoEmissor`                   | `uf`                    | `endereco.uf`          |
| `rg_uf`            | `rg.uf`                             | `empresa_razao_social`  | `empresa.razaoSocial`  |
| `pis`              | `pis`                               | `empresa_nome_fantasia` | `empresa.nomeFantasia` |
| `titulo_eleitor`   | `tituloEleitor`                     | `empresa_cnpj`          | `empresa.cnpj`         |
| `email`            | `email.endereco`                    | `cartao_bandeira`       | `cartao.bandeira`      |
| `email_usuario`    | `email.usuario`                     | `cartao_numero`         | `cartao.numero`        |
| `email_caixa_url`  | `email.caixaUrl` (pode ser nulo)    | `cartao_titular`        | `cartao.titular`       |
| `senha`            | `senha`                             | `cartao_validade`       | `cartao.validade`      |
| `cartao_provedor`  | `cartao.provedor`                   | `cartao_cvv`            | `cartao.cvv`           |
| `cartao_cenario`   | `cartao.cenario`                    |                         |                        |

Uma tabela que recebe tudo, no Postgres:

```sql
CREATE TABLE pessoas (
  nome text, prenome text, sobrenomes text, sexo text, nascimento date, idade integer,
  cpf text UNIQUE, rg text, rg_orgao_emissor text, rg_uf text, pis text, titulo_eleitor text,
  email text UNIQUE, email_usuario text, email_caixa_url text, senha text,
  celular text, celular_e164 text, cep text, logradouro text, numero text, complemento text,
  bairro text, cidade text, uf text, empresa_razao_social text, empresa_nome_fantasia text,
  empresa_cnpj text UNIQUE, cartao_bandeira text, cartao_numero text, cartao_titular text,
  cartao_validade text, cartao_cvv text, cartao_provedor text, cartao_cenario text
);
```

```bash
npx @pilutech/botai-core pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql | psql "$DATABASE_URL"
```

### De outras linguagens

Python:

```python
import json, subprocess

saida = subprocess.run(
    ["npx", "--yes", "@pilutech/botai-core@0.5.0", "pessoas", "-n", "10",
     "--semente", "testes", "--hoje", "2026-10-05", "--formato", "ndjson"],
    capture_output=True, text=True, check=True,
).stdout
pessoas = [json.loads(linha)["pessoa"] for linha in saida.splitlines()]
```

Go: `exec.Command("npx", "--yes", "@pilutech/botai-core@0.5.0", "pessoa", "--semente", "x", "--hoje", "2026-10-05").Output()` e `json.Unmarshal` no envelope.

## Servidor HTTP (`botai serve`)

Para qualquer linguagem que fale HTTP. Escuta só em `127.0.0.1` por padrão.

```bash
npx @pilutech/botai-core serve                  # http://127.0.0.1:8790
npx @pilutech/botai-core serve --porta 9000 --host 0.0.0.0
```

| Rota           | Parâmetros (query)                                                                                                                                                                                                                                                                                                               | Resposta                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `GET /pessoa`  | `semente`, `hoje` (`AAAA-MM-DD`), `uf`, `dominioEmail`, `cartao` (`stripe` ou `pagarme`), `cenario`                                                                                                                                                                                                                              | `{ formato, motor, semente, hoje, pessoa }` |
| `GET /pessoas` | os de `/pessoa` menos `cenario` + `cenarios` (`recusado:10,aprovado:2`), `n` (1 a 10 000; sem `cenarios`, obrigatório; com eles, a soma), `formato` (`json`, `ndjson`, `csv`, `sql`), `dialeto` (`postgres`, `mysql`, `sqlite`; só no `sql`), `tabela` (só no `sql`; aceita `esquema.tabela`), `campos` (só no `csv` e no `sql`) | o mesmo texto de `botai pessoas`            |
| `GET /saude`   | nenhum                                                                                                                                                                                                                                                                                                                           | `{ ok: true, formato, motor }`              |

- Os nomes são os das flags da CLI em camelCase, e os valores valem o mesmo que na CLI (`uf` e `dominioEmail` em qualquer caixa; semente de até 256 caracteres). Parâmetro desconhecido, repetido ou vazio, ou valor inválido, dá **400** com `{ "erro": "…" }`, que diz qual parâmetro (e, no desconhecido, lista os aceitos).
- Sem `semente`, o servidor sorteia uma e a devolve no envelope; sem `hoje`, usa o dia de São Paulo, então a mesma semente gera outra pessoa no dia seguinte. Para reproduzir, passe os dois.
- `Content-Type`: `application/json`, `application/x-ndjson`, `text/csv; header=present` ou `application/sql`, todos com `charset=utf-8`.
- `Ctrl+C` ou `SIGTERM` encerram com código 0: o servidor para de aceitar conexões na hora, e uma resposta ainda em entrega (cliente lento) ganha até 2 s para chegar inteira.

```bash
curl 'http://127.0.0.1:8790/pessoa?semente=42&hoje=2026-10-05'
curl 'http://127.0.0.1:8790/pessoas?n=100&semente=seed&hoje=2026-10-05&formato=sql&dialeto=postgres' > seed.sql
```

Em Python, sem pacote nenhum:

```python
import json, urllib.request
with urllib.request.urlopen("http://127.0.0.1:8790/pessoa?semente=42&hoje=2026-10-05") as r:
    pessoa = json.load(r)["pessoa"]
```

## Docker

```bash
docker run --rm -p 8790:8790 ghcr.io/piluvitu/botai:0.5.0          # o servidor
docker run --rm ghcr.io/piluvitu/botai:0.5.0 pessoa --semente 42    # a CLI
```

A imagem roda como usuário sem privilégio, escuta em `0.0.0.0:8790` e tem `HEALTHCHECK` em `/saude`. Para outra porta, mapeie com `-p 9000:8790` em vez de mudar a interna (o `HEALTHCHECK` olha a 8790).

No GitHub Actions, como service:

```yaml
services:
  botai:
    image: ghcr.io/piluvitu/botai:0.5.0
    ports: ['8790:8790']
```

No docker compose:

```yaml
services:
  botai:
    image: ghcr.io/piluvitu/botai:0.5.0
    ports: ['8790:8790']
```

## Binário sem Node

Binários para macOS (arm64 e x64), Linux (x64 e arm64, glibc) e Windows (x64 e arm64) em cada [release `core-v*`](https://github.com/PiluVitu/Botai/releases), com `SHA256SUMS`. Uns 60 a 90 MB cada: levam o runtime do Bun dentro.

```bash
curl -fsSL https://github.com/PiluVitu/Botai/releases/latest/download/install.sh | sh
```

- Detecta o sistema e a arquitetura (num terminal sob Rosetta, instala o arm64), confere o SHA256 e instala em `~/.local/bin/botai`.
- `BOTAI_VERSAO=0.5.0` fixa a versão; `BOTAI_DESTINO=/outra/pasta` muda o destino.
- Alpine e outros Linux com musl não têm binário: use a imagem ou o npm.

Conferir à mão: `shasum -a 256 -c --ignore-missing SHA256SUMS` (macOS) ou `sha256sum -c --ignore-missing SHA256SUMS` (Linux); no Windows, `Get-FileHash .\botai-windows-x64.exe -Algorithm SHA256` (ou o `botai-windows-arm64.exe`) e compare com a linha do `SHA256SUMS`.

### Binário sem assinatura: o aviso do sistema

Os binários não são assinados por um desenvolvedor identificado (só a assinatura ad-hoc no macOS).

- **macOS:** o `curl` (e o `install.sh`) não marca o arquivo com quarentena, e ele roda sem aviso. Baixado pelo navegador, o macOS bloqueia na primeira execução. Libere com `xattr -d com.apple.quarantine ./botai-darwin-arm64` (ou em Ajustes do Sistema › Privacidade e Segurança › "Abrir Mesmo Assim", que fica disponível por cerca de uma hora depois da tentativa: https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unknown-developer-mh40616/mac).
- **Windows:** o SmartScreen mostra "O Windows protegeu o computador" ("Windows protected your PC"): clique em "Mais informações" e em "Executar assim mesmo". Ou, no PowerShell, `Unblock-File .\botai-windows-x64.exe`, que tira a marca de arquivo baixado da internet (https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/unblock-file). Com o Controle Inteligente de Aplicativos ligado, o Windows bloqueia binário sem assinatura de qualquer origem: use o npm ou a imagem.

## Motor de preenchimento no navegador (`/navegador`, desde a 0.4.0)

O mesmo motor da extensão Botaí, para rodar dentro de uma página: acha os campos (inclusive em shadow root aberta), reconhece cada um, escreve pelo setter nativo com `focus`/`input`/`change`/`blur` sintéticos (React controlado e máscaras enxergam o valor) e confere o que ficou.

```ts
import { gerarPessoa, hojeEmSaoPaulo } from '@pilutech/botai-core'
import { preencherNaPagina } from '@pilutech/botai-core/navegador'

const hoje = hojeEmSaoPaulo()
const pessoa = gerarPessoa({ semente: 'cadastro', hoje })
const resultado = await preencherNaPagina(document, pessoa, hoje, {
  segundaPassada: true,
})
// resultado.preenchidos, resultado.naoReconhecidos, resultado.recusados
```

- O alvo pode ser o `document` ou um `Element` (um `<form>`, uma seção, um campo só).
- `segundaPassada: true` espera 1 s e regrava o que o site sobrescreveu (busca de CEP); a Promise só resolve depois.
- Sem bundler, `@pilutech/botai-core/navegador.iife.js` é um script que cria só `globalThis.__botaiNavegador` (`{ preencher }`, a mesma `preencherNaPagina`). Serve para `page.addInitScript({ path })` ou `page.evaluate(<texto do arquivo>)`. No Playwright, use direto o [`@pilutech/botai-playwright`](https://www.npmjs.com/package/@pilutech/botai-playwright).
- Shadow root fechada só entra com um adaptador (`raizSombra`) que o ambiente forneça, como a extensão faz.

## Contrato

- `esquema/envelope-v2.schema.json` (JSON Schema 2020-12) descreve o envelope. `formato` muda quando a forma muda; `motor` é a versão do pacote que gerou os dados.
- Desde a 0.5.0, `formato` é `2`: o cartão ganhou `provedor` e `cenario`, e o esquema 1 recusa campo a mais. O `esquema/envelope-v1.schema.json` continua no pacote para os envelopes de formato 1 (motor 0.2.0 a 0.4.1).
- O repositório guarda arquivos dourados (`packages/core/dourado/v1`): as pessoas esperadas para sementes e datas fixas, conferidas pela biblioteca, pela CLI, pelo servidor, pela imagem, pelos binários e pela extensão a cada mudança.

## Licença

MIT © PiluTech
