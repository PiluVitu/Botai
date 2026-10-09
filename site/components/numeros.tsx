import { LEGENDA_DOS_NUMEROS, NUMEROS } from '@/lib/numeros'

export function Numeros() {
  return (
    <section aria-label="Números" className="mt-[clamp(56px,8vw,96px)]">
      <ul className="border-border grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] border-y">
        {NUMEROS.map(({ valor, texto }) => (
          <li key={valor} className="flex flex-col gap-2 py-7 pr-5">
            <p className="text-[clamp(30px,3vw,38px)] leading-none font-extrabold tracking-[-0.03em]">
              {valor}
            </p>
            <p className="text-muted-foreground text-sm leading-[1.45] text-pretty">
              {texto}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground mt-3 font-mono text-xs">
        {LEGENDA_DOS_NUMEROS}
      </p>
    </section>
  )
}
