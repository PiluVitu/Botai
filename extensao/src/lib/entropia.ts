// Cópia do cryptoRandomBytes de @piluvitu/tools/entropy (monorepo): o resto daquele módulo é da roleta do PiluVitu.
export function cryptoRandomBytes(n: number): Uint8Array {
  const bytes = new Uint8Array(n)
  globalThis.crypto.getRandomValues(bytes)
  return bytes
}
