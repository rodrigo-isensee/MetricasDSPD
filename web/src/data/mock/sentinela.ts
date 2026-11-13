/**
 * Sentinela em texto do código do mock (ADR 0030, D6, guarda G1): `scripts/sem-mock.mjs` procura esta cadeia no build
 * `api`. Se ela aparecer em qualquer chunk, o mock voltou ao bundle de produção, mesmo que o chunk tenha outro nome.
 * Não troque o valor sem trocar o script.
 */
export const SENTINELA_MOCK = 'METRICAS_DSPD_SENTINELA_MOCK_ADR0030'
