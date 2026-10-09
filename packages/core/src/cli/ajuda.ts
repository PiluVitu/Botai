import {
  CATALOGO_DE_CARTOES,
  formatarNumeroCartao,
  PROVEDORES,
} from '../cartao'
import { COLUNAS } from '../plano'

const LARGURA = 80

function emLinhas(itens: readonly string[], recuo: number): string[] {
  const linhas: string[] = []
  let atual = ''
  for (const item of itens) {
    const junto = atual === '' ? item : `${atual}, ${item}`
    if (atual !== '' && recuo + junto.length + 1 > LARGURA) {
      linhas.push(`${atual},`)
      atual = item
    } else atual = junto
  }
  return [...linhas, atual]
}

const RECUO_DOS_CENARIOS = 11

const CENARIOS = PROVEDORES.map((provedor) =>
  emLinhas(
    CATALOGO_DE_CARTOES[provedor].map((c) => c.id),
    RECUO_DOS_CENARIOS,
  )
    .map((linha, i) =>
      i === 0
        ? `  ${provedor.padEnd(RECUO_DOS_CENARIOS - 2)}${linha}`
        : `${' '.repeat(RECUO_DOS_CENARIOS)}${linha}`,
    )
    .join('\n'),
).join('\n')

const CARTOES = `Cartões de teste (padrão: stripe, aprovado):
${CENARIOS}`

const FONTE: Record<(typeof PROVEDORES)[number], string> = {
  stripe: 'docs.stripe.com/testing',
  pagarme: 'docs.pagar.me/docs/simulador-de-cartão-de-crédito',
}

const CATALOGO = PROVEDORES.map(
  (provedor) =>
    `${provedor} (${FONTE[provedor]}):\n${CATALOGO_DE_CARTOES[provedor]
      .map(
        (c) =>
          `  ${c.id.padEnd(20)}${c.numeros.map((n) => formatarNumeroCartao(n.numero)).join(' ou ')}\n  ${' '.repeat(20)}${c.descricao}`,
      )
      .join('\n')}`,
).join('\n\n')

export const AJUDA_GERAL = `botai: gera pessoas brasileiras de teste, coerentes e reproduzíveis.

Uso:
  botai pessoa  [--semente S] [--hoje AAAA-MM-DD] [--uf UF] [--dominio-email D]
                [--cartao stripe|pagarme] [--cenario C]
  botai pessoas -n N [--semente S] [--hoje AAAA-MM-DD] [--uf UF] [--dominio-email D]
                [--cartao stripe|pagarme] [--cenarios C:N,C:N]
                [--formato json|ndjson|csv|sql] [--dialeto postgres|mysql|sqlite]
                [--tabela T] [--campos a,b,c]
  botai cpf|cnpj|rg|pis|titulo|celular|cep [--formatado] [--uf UF] [--semente S]
  botai cartao [--cartao stripe|pagarme] [--cenario C] [--formatado] [--semente S]
  botai validar cpf|cnpj|rg|pis|titulo|cartao <valor>
  botai serve [--porta 8790] [--host 127.0.0.1]
  botai --versao

A mesma semente e o mesmo --hoje geram a mesma pessoa em qualquer máquina.
Sem --semente, sorteia uma; sem --hoje, usa a data de hoje em São Paulo.
O cartão e o cenário mudam só o cartão: o resto da pessoa é o mesmo.

${CARTOES}

Saída: dados no stdout, mensagens no stderr.
Códigos de saída: 0 ok, 1 valor inválido (validar), 2 erro de uso, 3 erro interno.

Ajuda de um comando: botai <comando> --help
`

export const AJUDA_PESSOA = `botai pessoa: uma pessoa, em JSON ({ formato, motor, semente, hoje, pessoa }).

Opções:
  --semente S          número ou texto; a mesma semente gera a mesma pessoa
  --hoje AAAA-MM-DD    data de referência da idade e da validade do cartão
  --uf UF              sigla da UF do endereço (CPF, título e DDD seguem a UF)
  --dominio-email D    domínio do e-mail (padrão tuamaeaquelaursa.com, caixa pública)
  --cartao P           provedor do cartão de teste: stripe (padrão) ou pagarme
  --cenario C          cenário do cartão (padrão aprovado); muda só o cartão

${CARTOES}
`

export const AJUDA_PESSOAS = `botai pessoas: um lote de N pessoas sem e-mail, CPF ou CNPJ repetido.

Opções:
  -n N                 quantas pessoas (0 a 100000); sem --cenarios, obrigatório
  --semente S          a pessoa i do lote usa a semente S/i
  --hoje AAAA-MM-DD    data de referência
  --uf UF              sigla da UF de todos os endereços
  --dominio-email D    domínio dos e-mails
  --cartao P           provedor do cartão de teste: stripe (padrão) ou pagarme
  --cenarios C:N,C:N   quantas pessoas em cada cenário, em grupos nesta ordem
                       (ex.: recusado:10,aprovado:2); o -n, se vier, é a soma;
                       sem --cenarios, todas no cenário aprovado
  --formato F          json (padrão), ndjson, csv ou sql
  --dialeto D          postgres (padrão), mysql ou sqlite; só com --formato sql
  --tabela T           tabela do INSERT (padrão pessoas; aceita esquema.tabela); só com sql
  --campos a,b,c       colunas do csv e do sql, nesta ordem

${CARTOES}

Colunas: ${COLUNAS.join(', ')}
`

export const AJUDA_AVULSO = `botai cpf|cnpj|rg|pis|titulo|celular|cep: um documento avulso.

Opções:
  --formatado          com máscara (padrão: só dígitos)
  --uf UF              só para cpf, titulo, celular e cep
  --semente S          reproduz o mesmo valor
`

export const AJUDA_CARTAO = `botai cartao: um número de cartão de teste do provedor e do cenário.

Opções:
  --cartao P           stripe (padrão) ou pagarme
  --cenario C          o cenário do provedor (padrão aprovado)
  --formatado          em grupos de 4 (padrão: só dígitos)
  --semente S          reproduz o mesmo número (o aprovado da stripe tem dois)

${CATALOGO}
`

export const AJUDA_VALIDAR = `botai validar <tipo> <valor>: confere o dígito verificador.

Tipos: cpf, cnpj, rg, pis, titulo, cartao
Escreve "válido" (saída 0) ou "inválido" (saída 1).
`
