/** Grupo de uma expressão regular que o chamador já sabe que casou (evita `!` em cada uso). */
export const grupo = (m: RegExpExecArray, i: number): string => m[i] as string

/** Elemento de um índice que o chamador já sabe que existe. */
export const em = <T>(lista: readonly T[], i: number): T => lista[i] as T
