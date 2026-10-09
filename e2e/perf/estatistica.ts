// Estatística mínima para as medições de performance (p95 com método "nearest rank").
export interface Resumo {
  n: number;
  min: number;
  mediana: number;
  p95: number;
  max: number;
  primeira: number;
  amostras: number[];
}

export function percentil(ordenado: number[], p: number): number {
  if (ordenado.length === 0) return Number.NaN;
  const posicao = Math.max(1, Math.ceil((p / 100) * ordenado.length));
  return ordenado[posicao - 1] as number;
}

/** `primeira` = primeira medição (a frio), que também entra na amostra (ADR 0003, condições de medição). */
export function resumir(amostras: number[]): Resumo {
  const ordenado = [...amostras].sort((a, b) => a - b);
  return {
    n: amostras.length,
    min: ordenado[0] ?? Number.NaN,
    mediana: percentil(ordenado, 50),
    p95: percentil(ordenado, 95),
    max: ordenado[ordenado.length - 1] ?? Number.NaN,
    primeira: amostras[0] ?? Number.NaN,
    amostras,
  };
}
