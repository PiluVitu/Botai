import { COLUNAS } from '../plano'

export const AJUDA_GERAL = `botai: gera pessoas brasileiras de teste, coerentes e reproduzíveis.

Uso:
  botai pessoa  [--semente S] [--hoje AAAA-MM-DD] [--uf UF] [--dominio-email D]
  botai pessoas -n N [--semente S] [--hoje AAAA-MM-DD] [--uf UF] [--dominio-email D]
                [--formato json|ndjson|csv|sql] [--dialeto postgres|mysql|sqlite]
                [--tabela T] [--campos a,b,c]
  botai cpf|cnpj|rg|pis|titulo|celular|cep [--formatado] [--uf UF] [--semente S]
  botai validar cpf|cnpj|rg|pis|titulo|cartao <valor>
  botai serve [--porta 8790] [--host 127.0.0.1]
  botai --versao

A mesma semente e o mesmo --hoje geram a mesma pessoa em qualquer máquina.
Sem --semente, sorteia uma; sem --hoje, usa a data de hoje em São Paulo.

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
`

export const AJUDA_PESSOAS = `botai pessoas: um lote de N pessoas sem e-mail, CPF ou CNPJ repetido.

Opções:
  -n N                 quantas pessoas (0 a 100000), obrigatório
  --semente S          a pessoa i do lote usa a semente S/i
  --hoje AAAA-MM-DD    data de referência
  --uf UF              sigla da UF de todos os endereços
  --dominio-email D    domínio dos e-mails
  --formato F          json (padrão), ndjson, csv ou sql
  --dialeto D          postgres (padrão), mysql ou sqlite; só com --formato sql
  --tabela T           tabela do INSERT (padrão pessoas; aceita esquema.tabela); só com sql
  --campos a,b,c       colunas do csv e do sql, nesta ordem

Colunas: ${COLUNAS.join(', ')}
`

export const AJUDA_AVULSO = `botai cpf|cnpj|rg|pis|titulo|celular|cep: um documento avulso.

Opções:
  --formatado          com máscara (padrão: só dígitos)
  --uf UF              só para cpf, titulo, celular e cep
  --semente S          reproduz o mesmo valor
`

export const AJUDA_VALIDAR = `botai validar <tipo> <valor>: confere o dígito verificador.

Tipos: cpf, cnpj, rg, pis, titulo, cartao
Escreve "válido" (saída 0) ou "inválido" (saída 1).
`
