/** PRNG determinístico (mulberry32). Nada de Math.random em `mock/` (garantido por lint). */
export type Prng = () => number

export function mulberry32(semente: number): Prng {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashTexto(texto: string): number {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Gerador derivado por domínio/equipe: mudar o volume de um não altera os dados do outro. */
export function derivar(semente: number, rotulo: string): Prng {
  return mulberry32((semente ^ hashTexto(rotulo)) >>> 0)
}

/** Hash estável de qualquer estrutura JSON (teste de determinismo). */
export function hashJson(valor: unknown): string {
  return hashTexto(JSON.stringify(valor)).toString(16).padStart(8, '0')
}
