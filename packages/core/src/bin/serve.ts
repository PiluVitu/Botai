import {
  type ArgumentosLidos,
  type DefinicaoDeOpcoes,
  ErroDeUso,
  lerArgumentos,
} from '../cli/argumentos'
import {
  HOST_PADRAO,
  iniciarServidor,
  type OpcoesDoServidor,
  PORTA_PADRAO,
  type ServidorNoAr,
} from '../servidor/index'

export const USO_DO_SERVE = 'botai serve [--porta 8790] [--host 127.0.0.1]'

export const AJUDA_SERVE = `botai serve: servidor HTTP local, GET /pessoa, /pessoas, /saude.

Uso: ${USO_DO_SERVE}

Opções:
  --porta P   porta (padrão 8790; 0 escolhe uma livre)
  --host H    endereço (padrão 127.0.0.1, só esta máquina; 0.0.0.0 abre para a rede)

Parâmetros das rotas: os das flags da CLI em camelCase
(semente, hoje, uf, dominioEmail, n, formato, dialeto, tabela, campos).
`

export class ErroDoServe extends Error {
  readonly codigo: 1 | 2

  constructor(mensagem: string, codigo: 1 | 2) {
    super(mensagem)
    this.name = 'ErroDoServe'
    this.codigo = codigo
  }
}

const OPCOES_DO_SERVE = {
  porta: { tipo: 'texto' },
  host: { tipo: 'texto' },
  help: { tipo: 'booleano', curta: 'h' },
} as const satisfies DefinicaoDeOpcoes

function lerArgumentosDoServe(args: readonly string[]): ArgumentosLidos {
  try {
    return lerArgumentos(args, OPCOES_DO_SERVE)
  } catch (erro) {
    if (erro instanceof ErroDeUso)
      throw new ErroDoServe(`${erro.message} (uso: ${USO_DO_SERVE})`, 2)
    throw erro
  }
}

export function lerOpcoesDoServe(
  args: readonly string[],
): Required<OpcoesDoServidor> {
  const { opcoes, posicionais } = lerArgumentosDoServe(args)
  if (posicionais.length > 0)
    throw new ErroDoServe(
      `argumento inesperado: ${posicionais[0]} (uso: ${USO_DO_SERVE})`,
      2,
    )
  const porta = opcoes.porta as string | undefined
  const host = opcoes.host as string | undefined
  for (const [nome, valor] of [
    ['porta', porta],
    ['host', host],
  ] as const)
    if (valor === '') throw new ErroDoServe(`--${nome} precisa de um valor`, 2)
  if (
    porta !== undefined &&
    (!/^\d{1,5}$/.test(porta) || Number(porta) > 65_535)
  )
    throw new ErroDoServe(
      `--porta inválida: ${porta} (de 0 a 65535; 0 escolhe uma livre)`,
      2,
    )
  return {
    porta: porta === undefined ? PORTA_PADRAO : Number(porta),
    host: host ?? HOST_PADRAO,
  }
}

export async function subirServe(
  args: readonly string[],
  escrever: (linha: string) => void = (linha) =>
    process.stderr.write(`${linha}\n`),
): Promise<ServidorNoAr> {
  const opcoes = lerOpcoesDoServe(args)
  let noAr: ServidorNoAr
  try {
    noAr = await iniciarServidor(opcoes)
  } catch (causa) {
    const codigo = (causa as NodeJS.ErrnoException).code
    if (codigo === 'EADDRINUSE')
      throw new ErroDoServe(
        `a porta ${opcoes.porta} já está em uso em ${opcoes.host}; escolha outra com --porta`,
        1,
      )
    if (
      codigo === 'EADDRNOTAVAIL' ||
      codigo === 'ENOTFOUND' ||
      codigo === 'EINVAL'
    )
      throw new ErroDoServe(
        `--host inválido: ${opcoes.host} (use um endereço desta máquina, como 127.0.0.1 ou 0.0.0.0)`,
        2,
      )
    if (codigo === 'EACCES')
      throw new ErroDoServe(
        `sem permissão para a porta ${opcoes.porta} em ${opcoes.host} (abaixo de 1024 costuma exigir root); escolha outra com --porta`,
        2,
      )
    throw causa
  }
  // Na imagem o Node é o PID 1 e não tem tratador padrão de SIGTERM: sem este, o docker stop mata com 137.
  const parar = () => {
    noAr.encerrar().then(
      () => process.exit(0),
      () => process.exit(1),
    )
  }
  process.once('SIGINT', parar)
  process.once('SIGTERM', parar)
  escrever(`botai serve: ouvindo em ${noAr.url} (Ctrl+C encerra)`)
  return noAr
}

export async function executarServe(args: readonly string[]): Promise<void> {
  try {
    if (lerArgumentosDoServe(args).opcoes.help) {
      process.stdout.write(AJUDA_SERVE)
      return
    }
    await subirServe(args)
  } catch (erro) {
    if (!(erro instanceof ErroDoServe)) throw erro
    process.stderr.write(`botai: ${erro.message}\n`)
    process.exitCode = erro.codigo
  }
}
