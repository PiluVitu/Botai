import { useEffect, useState } from 'react'

export function useDesfazer<T>(ms = 5000) {
  const [pendente, setPendente] = useState<{ valor: T } | null>(null)

  useEffect(() => {
    if (pendente === null) return
    const temporizador = setTimeout(() => setPendente(null), ms)
    return () => clearTimeout(temporizador)
  }, [pendente, ms])

  return {
    valor: pendente?.valor ?? null,
    mostrar: (valor: T) => setPendente({ valor }),
    limpar: () => setPendente(null),
  }
}
