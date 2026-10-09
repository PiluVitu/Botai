/* eslint-disable @next/next/no-img-element -- ImageResponse (Satori) só suporta <img> */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { Marca } from '@/components/marca'
import { NOME, PACOTE_DO_CORE, POSICIONAMENTO } from './conteudo'
import { SEMENTE_DO_EXEMPLO } from './exemplo'
import { PORTAS } from './portas'
import { SITE_DE_PRODUCAO } from './site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const COR = {
  fundo: '#090b11',
  cartao: '#0f141f',
  borda: '#1c3140',
  primaria: '#3abff8',
  texto: '#e7ecf3',
  apagado: '#94a0b3',
}

export const COMANDO_DO_OG = `npx ${PACOTE_DO_CORE} pessoa --semente ${SEMENTE_DO_EXEMPLO}`
export const PE_DO_OG = PORTAS.map((p) =>
  p.nome.toLocaleLowerCase('pt-BR'),
).join(' · ')

const SANS = 'Plus Jakarta Sans'
const MONO = 'JetBrains Mono'

function lerFonte(pacote: string, arquivo: string): Promise<Buffer> {
  return readFile(
    join(
      process.cwd(),
      'node_modules',
      '@fontsource',
      pacote,
      'files',
      arquivo,
    ),
  )
}

export async function imagemOgDaHome(): Promise<ImageResponse> {
  const [sans, mono] = await Promise.all([
    lerFonte('plus-jakarta-sans', 'plus-jakarta-sans-latin-800-normal.woff'),
    lerFonte('jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'),
  ])
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        background: COR.fundo,
        color: COR.texto,
        fontFamily: SANS,
        fontWeight: 800,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Marca tamanho={56} />
          <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1.4 }}>
            {NOME}
          </span>
        </div>
        <span
          style={{
            fontFamily: MONO,
            fontWeight: 400,
            fontSize: 20,
            color: COR.primaria,
          }}
        >
          {new URL(SITE_DE_PRODUCAO).host}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div
          style={{
            display: 'flex',
            maxWidth: 1000,
            fontSize: 68,
            lineHeight: 1.03,
            fontWeight: 800,
            letterSpacing: -2.72,
          }}
        >
          {POSICIONAMENTO}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: 14,
            padding: '14px 22px',
            background: COR.cartao,
            border: `2px solid ${COR.borda}`,
            borderRadius: 18,
            fontFamily: MONO,
            fontWeight: 400,
            fontSize: 24,
          }}
        >
          <span style={{ color: COR.primaria }}>$</span>
          <span>{COMANDO_DO_OG}</span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          paddingTop: 24,
          borderTop: `2px solid ${COR.borda}`,
          color: COR.apagado,
          fontFamily: MONO,
          fontWeight: 400,
        }}
      >
        <span style={{ fontSize: 18, letterSpacing: 0.36 }}>{PE_DO_OG}</span>
        <span style={{ fontSize: 17, flexShrink: 0 }}>Powered by PiluTech</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: SANS, data: sans, weight: 800, style: 'normal' },
        { name: MONO, data: mono, weight: 400, style: 'normal' },
      ],
    },
  )
}

export type DadosDaImagemOg = {
  rotulo: string
  titulo: string
  subtitulo: string
}

export async function imagemOg({
  rotulo,
  titulo,
  subtitulo,
}: DadosDaImagemOg): Promise<ImageResponse> {
  const icone = await readFile(join(process.cwd(), 'app', 'icon.png'), 'base64')
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: '#0b1220',
      }}
    >
      <div style={{ display: 'flex', fontSize: 30, color: '#38bdf8' }}>
        {rotulo}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
        <img
          src={`data:image/png;base64,${icone}`}
          width={168}
          height={168}
          alt=""
          style={{ borderRadius: 36 }}
        />
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: titulo.length > 14 ? 72 : 92,
              fontWeight: 700,
              color: '#f8fafc',
              letterSpacing: -2,
            }}
          >
            {titulo}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 38,
              color: '#94a3b8',
              lineHeight: 1.3,
            }}
          >
            {subtitulo}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', fontSize: 28, color: '#64748b' }}>
        PiluLabs · Powered by PiluTech
      </div>
    </div>,
    { ...size },
  )
}
