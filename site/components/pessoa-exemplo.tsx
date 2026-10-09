import { cn } from '@piluvitu/ui/cn'
import type { ReactNode } from 'react'
import { PESSOA_DO_EXEMPLO, SEMENTE_DO_EXEMPLO } from '@/lib/exemplo'
import { DESTAQUES, type Partes, REGRAS } from '@/lib/regras'
import { CARTAO } from './cartao'
import { Secao } from './secao'

function Destaque({ children }: { children: ReactNode }) {
  return <strong className="text-warn font-bold">{children}</strong>
}

function ComDestaque({
  partes: [antes, destaque, depois],
}: {
  partes: Partes
}) {
  return (
    <>
      {antes}
      <Destaque>{destaque}</Destaque>
      {depois}
    </>
  )
}

const { nome, nascimento, endereco, rg, pis, email, empresa, cartao } =
  PESSOA_DO_EXEMPLO

type Campo = { rotulo: string; valor: ReactNode; estilo: string }

const MONO = 'font-mono text-[15px]'
const TEXTO = 'text-sm leading-[1.45]'

const CAMPOS: Campo[] = [
  { rotulo: 'CEP', valor: endereco.cep, estilo: MONO },
  {
    rotulo: 'Endereço',
    valor: (
      <>
        {`${endereco.logradouro}, ${endereco.numero}, ${endereco.complemento} · ${endereco.bairro} · ${endereco.cidade}, `}
        <Destaque>{endereco.uf}</Destaque>
      </>
    ),
    estilo: TEXTO,
  },
  {
    rotulo: 'CPF',
    valor: <ComDestaque partes={DESTAQUES.cpf} />,
    estilo: MONO,
  },
  {
    rotulo: 'Celular',
    valor: <ComDestaque partes={DESTAQUES.ddd} />,
    estilo: MONO,
  },
  {
    rotulo: 'Título de eleitor',
    valor: <ComDestaque partes={DESTAQUES.titulo} />,
    estilo: MONO,
  },
  { rotulo: 'RG · PIS', valor: `${rg.numero} · ${pis}`, estilo: MONO },
  {
    rotulo: 'E-mail',
    valor: email.endereco,
    estilo: 'text-sm [overflow-wrap:anywhere]',
  },
  {
    rotulo: 'Empresa',
    valor: (
      <>
        {`${empresa.razaoSocial} · ${empresa.nomeFantasia} · `}
        <span className="font-mono">{empresa.cnpj}</span>
      </>
    ),
    estilo: TEXTO,
  },
  {
    rotulo: 'Cartão de teste Stripe',
    valor: `${cartao.numeroFormatado} · ${cartao.validade}`,
    estilo: MONO,
  },
]

export function PessoaExemplo() {
  return (
    <Secao
      tituloId="pessoa-titulo"
      numero={3}
      rotulo="A pessoa"
      titulo="Uma pessoa onde tudo bate."
      tituloClassName="max-w-[640px] text-balance"
      apoio="A UF do endereço amarra o CPF, o DDD e o título. Todos os documentos passam no dígito verificador."
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] gap-4">
        <div
          className={cn(
            CARTAO,
            'flex min-w-0 flex-col gap-[22px] p-[clamp(20px,3vw,32px)]',
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-extrabold tracking-[-0.02em]">
                {nome.completo}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {`${nascimento.br} · ${nascimento.idade} anos`}
              </p>
            </div>
            <span className="border-accent-line bg-accent-soft text-primary rounded-full border px-2.5 py-[5px] font-mono text-xs">
              {`semente ${SEMENTE_DO_EXEMPLO}`}
            </span>
          </div>
          <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-x-6 gap-y-[18px]">
            {CAMPOS.map(({ rotulo, valor, estilo }) => (
              <div key={rotulo} className="min-w-0">
                <dt className="text-muted-foreground font-mono text-[11px] tracking-[0.12em] uppercase">
                  {rotulo}
                </dt>
                <dd className={cn('mt-1', estilo)}>{valor}</dd>
              </div>
            ))}
          </dl>
        </div>
        <ul className="flex flex-col gap-3">
          {REGRAS.map(({ chip, titulo, texto }) => (
            <li
              key={titulo}
              className="border-border flex items-start gap-4 rounded-lg border px-5 py-[18px]"
            >
              <span className="border-warn/50 text-warn min-w-16 flex-none rounded-[8px] border px-2 py-[5px] text-center font-mono text-[13px] font-bold">
                {chip}
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-bold">{titulo}</p>
                <p className="text-muted-foreground mt-1 text-sm leading-[1.5] text-pretty">
                  {texto}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Secao>
  )
}
