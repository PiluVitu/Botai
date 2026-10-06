export interface IdentidadeDoTeste {
  projeto: string
  titulos: readonly string[]
}

export function sementeDoTeste({
  projeto,
  titulos,
}: IdentidadeDoTeste): string {
  const [arquivo, ...resto] = titulos
  const partes =
    arquivo === undefined ? [] : [arquivo.replaceAll('\\', '/'), ...resto]
  return (projeto ? [projeto, ...partes] : partes).join(' › ')
}

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/

export function conferirHoje(hoje: string): string {
  if (!DATA_ISO.test(hoje))
    throw new Error(`botaiHoje: esperado AAAA-MM-DD, recebido "${hoje}"`)
  return hoje
}
