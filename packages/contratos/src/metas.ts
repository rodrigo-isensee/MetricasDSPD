/**
 * Valores de meta do briefing usados só para DESENHAR a linha de referência no gráfico.
 * O status (dentro/fora) vem sempre do DTO; nada é decidido na interface. Fonte única para a biblioteca e a UI.
 */
export const META_ADERENCIA_SLE_PCT = 85
export const META_RAZAO_MIN = 0.9
export const META_RAZAO_MAX = 1.0
export const META_DESVIO_ALOCACAO_PP = 10
/** O6: razão P85 ÷ P50 do cycle time exibida como "< 2,5" (briefing, catálogo O6). */
export const META_PREVISIBILIDADE_MAX = 2.5
/** S8: taxa de reabertura exibida como "< 5%" (briefing, catálogo S8). */
export const META_REABERTURA_MAX_PCT = 5
