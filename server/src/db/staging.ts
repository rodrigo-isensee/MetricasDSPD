import { sql, type Kysely } from 'kysely';

const ER_DUP_ENTRY = 1062;
export type ResultadoStaging = 'inserido' | 'ja_existente';

export const ehDuplicata = (e: unknown): boolean =>
  typeof e === 'object' && e !== null && (e as { errno?: number }).errno === ER_DUP_ENTRY;

/**
 * Grava uma versão de stg_card (ADR 0004/0005): dedup contra a ÚLTIMA versão; INSERT normal;
 * só o erro 1062 vira "já existente" após reler (cadeia linear por UNIQUE); sem INSERT IGNORE/upsert.
 */
export type EntradaStgCard = {
  idOrigem: string; payload: unknown; sha256: Buffer; coletaId: number; agora: Date;
  quadroId: string; arquivado: boolean; excluidoDetectado: boolean;
};

export async function gravarStgCard(db: Kysely<unknown>, e: EntradaStgCard): Promise<ResultadoStaging> {
  const { idOrigem, payload, sha256, coletaId, agora } = e;
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const r = await sql<{ stg_sk: string; payload_sha256: Buffer }>`
      SELECT stg_sk, payload_sha256 FROM dspd_bm.stg_card
      WHERE id_origem = ${idOrigem} ORDER BY stg_sk DESC LIMIT 1`.execute(db);
    const ultima = r.rows[0];
    if (ultima && Buffer.compare(ultima.payload_sha256, sha256) === 0) return 'ja_existente';
    try {
      await sql`INSERT INTO dspd_bm.stg_card
        (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id)
        VALUES (${idOrigem}, ${ultima ? ultima.stg_sk : 0}, ${sha256}, ${JSON.stringify(payload)}, ${e.quadroId}, ${e.arquivado ? 1 : 0}, ${e.excluidoDetectado ? 1 : 0}, ${agora}, ${coletaId})`.execute(db);
      return 'inserido';
    } catch (e) {
      if (!ehDuplicata(e)) throw e;
      // outro coletor gravou sobre a mesma anterior: relê e reavalia
    }
  }
  throw new Error('conflito persistente na cadeia de stg_card');
}
