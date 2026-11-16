import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import type { ResultadoToque } from './toque.js';

/**
 * Gravação e projeção do primeiro toque do O22 (pedido 105, B7b; ADR 0020 revisão 6, R6-3, R6-4 e R6-6). Só escalares: o instante, se conta como toque, o estado
 * e o motivo em código. Nenhuma função daqui recebe `user_id`, autor, texto ou anexo (o normalizador já os descartou); nenhuma grava valor lido da API além disso.
 */

export const SITUACOES_DO_TOQUE = ['com_toque', 'sem_toque', 'nao_lido', 'autor_pendente', 'leitura_incompleta'] as const;
export type SituacaoDoToque = (typeof SITUACOES_DO_TOQUE)[number];

/**
 * Grava, na transação do chamador, os eventos e a linha de controle de UM card lido (R6-4: "os eventos e a linha de controle de um card são gravados na mesma
 * transação"). Eventos por `unnest` (parâmetros constantes, qualquer tamanho de lista) e `ON CONFLICT ON CONSTRAINT ... DO NOTHING`: reler não duplica nem
 * altera o que já existe (append-only). `leitura_incompleta` chega sem evento algum. Devolve quantos eventos eram novos.
 */
export async function gravarLeitura(db: Consultavel, S: Esquemas, coletaId: number, agora: Date, r: ResultadoToque): Promise<number> {
  let novos = 0;
  if (r.eventos.length > 0) {
    const ins = await db.query(
      `INSERT INTO ${S.bm}.stg_toque_instante (card_id, evento_id, ocorrido_em, conta_como_toque, coletado_em, coleta_id)
       SELECT $1::text, t.evento_id, t.ocorrido_em, t.conta, $5::timestamptz, $6::bigint
         FROM unnest($2::text[], $3::timestamptz[], $4::boolean[]) AS t(evento_id, ocorrido_em, conta)
       ON CONFLICT ON CONSTRAINT uq_stg_toque_instante DO NOTHING`,
      [r.cardId, r.eventos.map((e) => e.eventoId), r.eventos.map((e) => new Date(e.ocorridoEm).toISOString()), r.eventos.map((e) => e.contaComoToque), agora, coletaId]);
    novos = ins.rowCount ?? 0;
  }
  await db.query(
    `INSERT INTO ${S.bm}.ctl_toque_leitura (card_id, coleta_id, revisao_lida, lido_em, estado, motivo)
     VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT ON CONSTRAINT uq_ctl_toque_leitura DO NOTHING`,
    [r.cardId, coletaId, r.revisaoLida, agora, r.estado, r.motivo]);
  return novos;
}

/**
 * Projeção `dim_card.primeiro_toque_em` e `toque_situacao` (R6-6), por card, a partir da staging e do controle; não chama a API, então reconstruir a projeção
 * refaz as duas colunas sem releitura. Regra:
 * - sem linha de controle: `nao_lido`, instante nulo;
 * - `autor_pendente` e `leitura_incompleta`: a mesma situação, instante nulo (nunca "sem toque");
 * - `lido`: o menor `ocorrido_em` com `conta_como_toque` e ESTRITAMENTE depois de `criado_em`; achou, `com_toque`; não achou, `sem_toque`.
 * Escreve só onde o valor muda (`IS DISTINCT FROM`). Devolve quantos cards mudaram.
 */
export async function projetarToque(db: Consultavel, S: Esquemas, cardIds: readonly string[]): Promise<number> {
  if (cardIds.length === 0) return 0;
  const r = await db.query(
    `UPDATE ${S.bm}.dim_card d SET primeiro_toque_em = x.primeiro, toque_situacao = x.situacao
       FROM (
         SELECT c.card_id,
                CASE WHEN l.estado IS NULL THEN 'nao_lido'
                     WHEN l.estado = 'lido' THEN CASE WHEN m.primeiro IS NULL THEN 'sem_toque' ELSE 'com_toque' END
                     ELSE l.estado END AS situacao,
                CASE WHEN l.estado = 'lido' THEN m.primeiro END AS primeiro
           FROM ${S.bm}.dim_card c
           LEFT JOIN LATERAL (SELECT estado FROM ${S.bm}.ctl_toque_leitura WHERE card_id = c.card_id ORDER BY leitura_sk DESC LIMIT 1) l ON true
           LEFT JOIN LATERAL (SELECT min(ocorrido_em) AS primeiro FROM ${S.bm}.stg_toque_instante
                               WHERE card_id = c.card_id AND conta_como_toque AND ocorrido_em > c.criado_em) m ON true
          WHERE c.card_id = ANY($1::text[])
       ) x
      WHERE d.card_id = x.card_id
        AND (d.toque_situacao IS DISTINCT FROM x.situacao OR d.primeiro_toque_em IS DISTINCT FROM x.primeiro)`,
    [[...cardIds]]);
  return r.rowCount ?? 0;
}
