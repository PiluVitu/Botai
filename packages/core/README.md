# @pilutech/botai-core

O motor do [Botaí](https://botai.pilutech.com.br): gera pessoas brasileiras de teste, coerentes e reproduzíveis. O CPF sai da região fiscal da UF do endereço, o DDD do celular é o do CEP, o e-mail vem do nome, a empresa vem dos sobrenomes, e os documentos passam no dígito verificador. A mesma semente e o mesmo `hoje` geram a mesma pessoa na biblioteca, na CLI e na extensão.

- Sem dependência de runtime. ESM com tipos.
- Roda em Node, Bun, Deno e navegador: fora do `bin`, nenhum módulo usa API de Node ou do DOM.
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

Opções: `semente` (número inteiro ou texto de até 256 caracteres), `hoje` (`AAAA-MM-DD`), `uf` (sigla) e `dominioEmail`.

Subpaths: `/pessoa` (`montarPessoa(rng, hoje, opcoes?)`), `/plano` (visão plana, CSV e SQL), `/cpf`, `/cnpj`, `/rg`, `/pis`, `/titulo-eleitor`, `/celular`, `/nascimento`, `/senha`, `/nome`, `/endereco`, `/empresa`, `/cartao`, `/uf`, `/aleatorio`, `/prng`, `/campos`, `/campos-formatar`, `/atalhos` e o esquema `/esquema/envelope-v1.schema.json`.

### Reproduzir uma pessoa

- Fixe a semente **e** o `hoje`. Sem `hoje`, vale a data de hoje em São Paulo, e a idade e a validade do cartão mudam de um dia para o outro.
- Texto vira NFC antes do hash: `São` digitado ou colado de um nome de arquivo do macOS é a mesma semente.
- Fixe a versão do pacote. Mudar a pessoa que uma semente gera é versão major (na série 0.x, a minor).
- No lote, a pessoa `i` (a partir de 0) vem da semente `S/i`. Se ela repetir o e-mail, o CPF ou o CNPJ de uma anterior, é sorteada de novo com `S/i/2`, `S/i/3`… Na saída `ndjson` da CLI, cada linha traz a semente exata.
- As primeiras `k` pessoas de um lote de `n` são o lote de `k`.

### E-mail

O domínio padrão é `tuamaeaquelaursa.com`, uma caixa de entrada **pública**: quem souber o endereço lê. Serve para testar cadastro com confirmação por e-mail, nunca para conta real. Com `dominioEmail: 'example.com'` o domínio muda e `email.caixaUrl` vira `null`.

## CLI

```bash
npx @pilutech/botai-core pessoa --semente 42 --hoje 2026-10-05
npx @pilutech/botai-core pessoas -n 1000 --semente carga --hoje 2026-10-05 --formato sql > pessoas.sql
npx @pilutech/botai-core pessoas -n 50 --formato csv --campos nome,cpf,email > pessoas.csv
npx @pilutech/botai-core cpf --formatado --uf PI
npx @pilutech/botai-core validar cnpj 35.728.569/0001-52
```

Instalado no projeto, o binário se chama `botai`.

| Comando                                                                                                                                      | Saída                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `botai pessoa [--semente S] [--hoje AAAA-MM-DD] [--uf UF] [--dominio-email D]`                                                               | envelope JSON                                                                    |
| `botai pessoas -n N [as mesmas opções] [--formato json\|ndjson\|csv\|sql] [--dialeto postgres\|mysql\|sqlite] [--tabela T] [--campos a,b,c]` | o lote                                                                           |
| `botai cpf\|cnpj\|rg\|pis\|titulo\|celular\|cep [--formatado] [--uf UF] [--semente S]`                                                       | um valor (só dígitos sem `--formatado`; `--uf` só em cpf, titulo, celular e cep) |
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
|                    |                                     | `cartao_cvv`            | `cartao.cvv`           |

Uma tabela que recebe tudo, no Postgres:

```sql
CREATE TABLE pessoas (
  nome text, prenome text, sobrenomes text, sexo text, nascimento date, idade integer,
  cpf text UNIQUE, rg text, rg_orgao_emissor text, rg_uf text, pis text, titulo_eleitor text,
  email text UNIQUE, email_usuario text, email_caixa_url text, senha text,
  celular text, celular_e164 text, cep text, logradouro text, numero text, complemento text,
  bairro text, cidade text, uf text, empresa_razao_social text, empresa_nome_fantasia text,
  empresa_cnpj text UNIQUE, cartao_bandeira text, cartao_numero text, cartao_titular text,
  cartao_validade text, cartao_cvv text
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
    ["npx", "--yes", "@pilutech/botai-core@0.2.0", "pessoas", "-n", "10",
     "--semente", "testes", "--hoje", "2026-10-05", "--formato", "ndjson"],
    capture_output=True, text=True, check=True,
).stdout
pessoas = [json.loads(linha)["pessoa"] for linha in saida.splitlines()]
```

Go: `exec.Command("npx", "--yes", "@pilutech/botai-core@0.2.0", "pessoa", "--semente", "x", "--hoje", "2026-10-05").Output()` e `json.Unmarshal` no envelope.

## Contrato

- `esquema/envelope-v1.schema.json` (JSON Schema 2020-12) descreve o envelope. `formato` muda quando a forma muda; `motor` é a versão do pacote que gerou os dados.
- O repositório guarda arquivos dourados (`packages/core/dourado/v1`): as pessoas esperadas para sementes e datas fixas, conferidas pela biblioteca, pela CLI e pela extensão a cada mudança.

## Licença

MIT © PiluTech
