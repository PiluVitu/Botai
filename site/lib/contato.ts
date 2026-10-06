// Cópia de @piluvitu/tools/contato (monorepo PiluVitu-Dev), que a landing da PiluTech usa: mude os dois.
export const EMAIL_DA_PILUTECH = 'pilutechinformatica@gmail.com'

export function mailtoDaPilutech(projeto: string, assunto: string): string {
  return `mailto:${EMAIL_DA_PILUTECH}?subject=${encodeURIComponent(`[${projeto}] ${assunto}`)}`
}
