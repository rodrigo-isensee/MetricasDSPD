import type { Io } from './gerador.ts'

/** E/S em memória (testes e simulações): mesmo contrato do `Io` real, sem tocar o disco. */
export function criarIoMemoria(
  inicial: Record<string, string> = {},
): Io & { arquivos: Map<string, string> } {
  const arquivos = new Map(Object.entries(inicial))
  return {
    arquivos,
    ler: (c) => arquivos.get(c),
    escrever: (c, t) => {
      arquivos.set(c, t)
    },
    listar: (pasta) => [...arquivos.keys()].filter((c) => c.startsWith(`${pasta}/`)).sort(),
    existe: (c) => arquivos.has(c) || [...arquivos.keys()].some((a) => a.startsWith(`${c}/`)),
  }
}
