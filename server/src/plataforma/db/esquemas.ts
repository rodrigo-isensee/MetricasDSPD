/**
 * Mapa único dos três schemas (ADR 0014). Todo SQL é qualificado por estes nomes; `search_path` não é usado.
 * O prefixo (`DSPD_SCHEMA_PREFIXO`) é vazio fora dos testes. Identificador nunca vem de entrada do usuário:
 * o prefixo é validado aqui e só depois entra no texto do SQL.
 */
export type Esquemas = { bm: string; ac: string; core: string };

const PREFIXO_VALIDO = /^[a-z][a-z0-9_]{0,30}$/;

export function montarEsquemas(prefixo = ''): Esquemas {
  if (prefixo !== '' && !PREFIXO_VALIDO.test(prefixo)) throw new Error(`DSPD_SCHEMA_PREFIXO inválido: ${prefixo}`);
  return { bm: `${prefixo}dspd_bm`, ac: `${prefixo}dspd_ac`, core: `${prefixo}dspd_core` };
}

/** Nomes sem prefixo (os que aparecem no data-model e nas listas de LGPD). */
export const S_PADRAO: Esquemas = montarEsquemas();

export const esquemasDoAmbiente = (env: NodeJS.ProcessEnv = process.env): Esquemas =>
  montarEsquemas(env.DSPD_SCHEMA_PREFIXO ?? '');

/** Prefixo de uma execução de teste: `t` + 6 caracteres base36 + `_`. */
export const prefixoDeTeste = (aleatorio: () => number = Math.random): string =>
  `t${Math.floor(aleatorio() * 36 ** 6).toString(36).padStart(6, '0')}_`;
