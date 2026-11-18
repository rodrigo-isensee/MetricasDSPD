import { getConfig } from '@testing-library/react'

/**
 * Lê a espera global das buscas assíncronas (findBy/waitFor) da variável que o `test.env` do vite.config.ts
 * define (5 s na estação; maior só no CI, E7.541). Valor vazio, não numérico ou não positivo falha na partida,
 * em vez de virar `NaN` e esgotar toda busca na hora com um erro enganoso (A1 do review do #546).
 */
export function lerEsperaAsync(valor: string | undefined): number {
  const ms = Number(valor)
  if (valor === undefined || valor.trim() === '' || !Number.isFinite(ms) || ms <= 0) {
    throw new Error(
      `METRICAS_DSPD_ESPERA_ASYNC_MS inválida: '${valor ?? ''}' (esperado inteiro positivo em ms)`,
    )
  }
  return ms
}

/** O maior entre a espera explícita do teste e a global: o explícito só alonga, nunca encurta a do CI. */
export function esperaMinima(explicitaMs: number, globalMs: number): number {
  return Math.max(explicitaMs, globalMs)
}

/**
 * Espera explícita de um teste (`{ timeout: limiteEspera(8000) }`). Um `timeout` literal tem precedência sobre o
 * `asyncUtilTimeout` global e escapava do ajuste do CI (E7.548); com o helper ele respeita a espera global.
 */
export function limiteEspera(explicitaMs: number): number {
  return esperaMinima(explicitaMs, getConfig().asyncUtilTimeout)
}
