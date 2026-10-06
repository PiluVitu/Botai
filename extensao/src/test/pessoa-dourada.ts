import { gerarPessoa } from '@pilutech/botai-core/pessoa'
import { sfc32 } from '@pilutech/botai-core/prng'

export const PESSOA_DOURADA = gerarPessoa(sfc32(1, 2, 3, 4), '2026-10-01')
