import { NOME, POSICIONAMENTO } from '@/lib/conteudo'
import { AtalhoLocal } from './atalho-local'

export function Hero() {
  return (
    <section
      aria-labelledby="hero-titulo"
      className="flex flex-col gap-7 pt-[clamp(48px,8vw,96px)]"
    >
      <h1
        id="hero-titulo"
        className="max-w-[980px] text-[clamp(38px,6vw,76px)] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance"
      >
        <span className="sr-only">{NOME}: </span>
        {POSICIONAMENTO}
      </h1>
      <AtalhoLocal />
      <p data-esqueleto className="text-muted-foreground font-mono text-xs">
        Em construção: hero (grupo 1)
      </p>
    </section>
  )
}
