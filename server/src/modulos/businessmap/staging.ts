import { createHash } from 'node:crypto';
import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { registroCard, registroRevisao, type DominiosCamposCustomizados } from './allow-list.js';

export type ResultadoStaging = 'inserido' | 'ja_existente';

/**
 * Grava uma versão de stg_card (ADR 0014, data-model §3.1): dedup contra a ÚLTIMA versão; INSERT com
 * `ON CONFLICT ON CONSTRAINT uq_stg_card DO NOTHING RETURNING stg_sk` (alvo explícito, sem DO UPDATE).
 * Zero linhas devolvidas = outro coletor gravou sobre a mesma anterior: relê e reavalia (até 5 vezes).
 * Como ON CONFLICT não gera erro, a transação do chamador não é abortada. Exige READ COMMITTED (padrão),
 * para que a releitura enxergue o que a outra transação confirmou.
 */
/**
 * `card` é o objeto da API: a allow-list (ADR 0020, 4a) é aplicada AQUI, antes do INSERT, e o `payload` gravado é só o registro
 * filtrado. O hash de deduplicação é o do registro filtrado (mudança só em campo fora da lista não gera versão nova).
 * Responsáveis NÃO passam por aqui (4b): ver `responsaveis.ts`.
 */
export type EntradaStgCard = {
  idOrigem: string; card: unknown; dominios?: DominiosCamposCustomizados; coletaId: number; agora: Date;
  quadroId: string; arquivado: boolean; excluidoDetectado: boolean;
};

export async function gravarStgCard(
  db: Consultavel, entrada: EntradaStgCard, S: Esquemas = esquemasDoAmbiente(),
): Promise<ResultadoStaging> {
  const { idOrigem, card, dominios, coletaId, agora, quadroId, arquivado, excluidoDetectado } = entrada;
  const payload = JSON.stringify(registroCard(card, dominios));
  const sha256 = createHash('sha256').update(payload).digest();
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
      [idOrigem, ultima ? ultima.stg_sk : null, sha256, payload, quadroId, arquivado, excluidoDetectado, agora, coletaId]);
    if (ins.rows.length > 0) return 'inserido';
  }
  throw new Error('conflito persistente na cadeia de stg_card');
}

export type EntradaStgRevision = {
  cardId: string; revisionId: string; revisao: unknown; /** calculado em memória (`houveTroca`); ausente = não calculado */ trocaResponsavel?: boolean;
  dominios?: DominiosCamposCustomizados; coletaId: number; agora: Date;
};

/**
 * Grava uma revisão em `stg_revision` (ADR 0020, 4c): só o registro da allow-list, sem `user_id`, `owner_user_id`, `co_owner_ids`
 * nem `subtasks`. Append-only; a mesma revisão não duplica (`ON CONFLICT ... DO NOTHING`). Devolve `true` se gravou.
 */
export async function gravarStgRevision(
  db: Consultavel, entrada: EntradaStgRevision, S: Esquemas = esquemasDoAmbiente(),
): Promise<boolean> {
  const payload = JSON.stringify(registroRevisao(entrada.revisao, entrada.trocaResponsavel, entrada.dominios));
  const sha256 = createHash('sha256').update(payload).digest();
  const r = await db.query(
    `INSERT INTO ${S.bm}.stg_revision (card_id, revision_id, payload_sha256, payload, coletado_em, coleta_id)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6)
     ON CONFLICT ON CONSTRAINT uq_stg_revision DO NOTHING RETURNING revision_sk`,
    [entrada.cardId, entrada.revisionId, sha256, payload, entrada.agora, entrada.coletaId]);
  return r.rows.length > 0;
}
