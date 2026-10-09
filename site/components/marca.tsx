import { cn } from '@piluvitu/ui/cn'

type MarcaProps = { tamanho: number; className?: string }

const BLOCOS = [
  { x: 3, y: 8.5, width: 4.5, height: 4.5, rx: 0.9 },
  { x: 8.5, y: 8.5, width: 4.5, height: 4.5, rx: 0.9 },
  { x: 8.5, y: 3, width: 4.5, height: 4.5, rx: 0.9 },
  { x: 4.6, y: 3, width: 1.3, height: 4.5, rx: 0.3 },
]

export function Marca({ tamanho, className }: MarcaProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={tamanho}
      height={tamanho}
      aria-hidden
      className={cn('shrink-0', className)}
    >
      <rect width="16" height="16" rx="3.5" fill="#38bdf8" />
      {BLOCOS.map((bloco) => (
        <rect key={`${bloco.x}-${bloco.y}`} {...bloco} fill="#0a0f1a" />
      ))}
    </svg>
  )
}
