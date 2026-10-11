import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';

export type ResultadoStaging = 'inserido' | 'ja_existente';

/**
 * Grava uma versão de stg_card (ADR 0014, data-model §3.1): dedup contra a ÚLTIMA versão; INSERT com
 * `ON CONFLICT ON CONSTRAINT uq_stg_card DO NOTHING RETURNING stg_sk` (alvo explícito, sem DO UPDATE).
 * Zero linhas devolvidas = outro coletor gravou sobre a mesma anterior: relê e reavalia (até 5 vezes).
 * Como ON CONFLICT não gera erro, a transação do chamador não é abortada. Exige READ COMMITTED (padrão),
 * para que a releitura enxergue o que a outra transação confirmou.
 */
export type EntradaStgCard = {
  idOrigem: string; payload: unknown; sha256: Buffer; coletaId: number; agora: Date;
  quadroId: string; arquivado: boolean; excluidoDetectado: boolean;
};

export async function gravarStgCard(
  db: Consultavel, entrada: EntradaStgCard, S: Esquemas = esquemasDoAmbiente(),
): Promise<ResultadoStaging> {
  const { idOrigem, payload, sha256, coletaId, agora, quadroId, arquivado, excluidoDetectado } = entrada;
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const r = await db.query<{ stg_sk: string; payload_sha256: Buffer }>(
      `SELECT stg_sk, payload_sha256 FROM ${S.bm}.stg_card WHERE id_origem = $1 ORDER BY stg_sk DESC LIMIT 1`, [idOrigem]);
    const ultima = r.rows[0];
    if (ultima && Buffer.compare(ultima.payload_sha256, sha256) === 0) return 'ja_existente';
    const ins = await db.query<{ stg_sk: string }>(
      `INSERT INTO ${S.bm}.stg_card
         (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9)
       ON CONFLICT ON CONSTRAINT uq_stg_card DO NOTHING RETURNING stg_sk`,
      [idOrigem, ultima ? ultima.stg_sk : null, sha256, JSON.stringify(payload), quadroId, arquivado, excluidoDetectado, agora, coletaId]);
    if (ins.rows.length > 0) return 'inserido';
  }
  throw new Error('conflito persistente na cadeia de stg_card');
}
