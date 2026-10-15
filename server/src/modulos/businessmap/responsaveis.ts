import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';

export type EntradaResponsaveis = {
  cardId: string;
  /** Saída de `extrairResponsaveis`: `null` = o card não trouxe o campo (nada é sobrescrito). */
  responsaveis: string[] | null;
  stgCardSk: string | number;
  vigenteDe: Date;
  coletaId: number;
  agora: Date;
};

const COLUNAS_VERSAO = `titulo, tipo, classe_servico, granularidade, equipe, quadro_id, coluna_atual_id, sistema, area_solicitante, fornecedor,
  objetivo_estrategico, card_pai, eh_subtarefa, data_acordada, responsabilidade_atraso, origem_demanda, fase_deteccao, severidade, causa_raiz,
  origem_bug, adicionado_apos_inicio_pai, motivo_descarte, tamanho_declarado`;

/**
 * ADR 0020, 4b: os responsáveis vão da memória do coletor direto para `dim_card.responsaveis` e `dim_card_versao.responsaveis`
 * (colunas de `COLUNAS_PESSOA`, que a API não lê), na mesma execução, sem passar por nenhuma `stg_`.
 * - `dim_card` (projeção): UPDATE só se o valor mudou.
 * - `dim_card_versao` (append-only, SCD2): quando a versão vigente tem outro conjunto, entra uma versão nova, cópia da vigente com o
 *   conjunto novo; nunca se altera versão existente (histórico preservado). Sem versão vigente, nada é inventado: a projeção que
 *   cria a versão já leva `responsaveis` do mesmo `extrairResponsaveis`.
 * - `null` não sobrescreve nada (reconstruir a projeção a partir da staging preserva o valor já gravado).
 */
export async function gravarResponsaveis(
  db: Consultavel, e: EntradaResponsaveis, S: Esquemas = esquemasDoAmbiente(),
): Promise<{ dimCard: boolean; versao: boolean }> {
  if (e.responsaveis === null) return { dimCard: false, versao: false };
  const card = await db.query(
    `UPDATE ${S.bm}.dim_card SET responsaveis = $2::text[], coletado_em = $3, atualizado_por_coleta_id = $4
     WHERE card_id = $1 AND responsaveis IS DISTINCT FROM $2::text[]`,
    [e.cardId, e.responsaveis, e.agora, e.coletaId]);
  const versao = await db.query(
    `INSERT INTO ${S.bm}.dim_card_versao (card_id, vigente_de, stg_card_sk, ${COLUNAS_VERSAO}, responsaveis, coletado_em, coleta_id)
     SELECT v.card_id, $2, $3, ${COLUNAS_VERSAO.replace(/(\w+)/g, 'v.$1')}, $4::text[], $5, $6
     FROM ${S.bm}.dim_card_versao v
     WHERE v.card_id = $1 AND v.responsaveis IS DISTINCT FROM $4::text[]
       AND v.vigente_de = (SELECT max(vigente_de) FROM ${S.bm}.dim_card_versao WHERE card_id = $1)
     ON CONFLICT ON CONSTRAINT uq_dim_card_versao DO NOTHING RETURNING card_versao_sk`,
    [e.cardId, e.vigenteDe, e.stgCardSk, e.responsaveis, e.agora, e.coletaId]);
  return { dimCard: (card.rowCount ?? 0) > 0, versao: versao.rows.length > 0 };
}
