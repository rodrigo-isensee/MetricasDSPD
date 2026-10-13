import type pg from 'pg';
import type { Esquemas } from '../../src/plataforma/db/esquemas.js';

/**
 * Ids que o banco deu às versões de critério gravadas pelo seed (id do mock -> `versao_id`). O seed grava a referência
 * completa (`ref_*`, critérios); aqui só se lê o mapa, pela coluna `referencia` (`mock:<id>`).
 */
export async function idsDosCriterios(db: pg.Pool, E: Esquemas): Promise<Map<string, string>> {
  const r = await db.query<{ versao_id: string; referencia: string }>(`SELECT versao_id, referencia FROM ${E.core}.ref_versao_criterio`);
  return new Map(r.rows.map((x) => [x.referencia.replace(/^mock:/, ''), String(x.versao_id)]));
}
