export const RAIZ_WORKER: RegExp
export const RAIZ_PROCESSO: RegExp
export interface Caminho {
  chunks: string[]
  soma: number
}
export interface ResultadoF9 {
  avisos: string[]
  falhaInicial: boolean
  somaTodos: number
  worker: Caminho | null
  processo: Caminho | null
  max: number
  caminho: 'worker' | 'processo' | 'soma'
}
export function fecho(
  raiz: string,
  conhecidos: Set<string>,
  lerCodigo: (f: string) => string,
): string[]
export function calcularF9(entrada: {
  linhas: { f: string; tipo: string; gz: number }[]
  iniciais: Set<string>
  lerCodigo: (f: string) => string
}): ResultadoF9
