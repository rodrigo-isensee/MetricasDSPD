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

/** Colunas copiadas para a versão nova; o teste `responsaveis.test.ts` confere contra o esquema (snapshot). */
export const COLUNAS_VERSAO = [
  'titulo', 'tipo', 'classe_servico', 'granularidade', 'equipe', 'quadro_id', 'coluna_atual_id', 'sistema', 'area_solicitante', 'fornecedor',
  'objetivo_estrategico', 'card_pai', 'eh_subtarefa', 'data_acordada', 'responsabilidade_atraso', 'origem_demanda', 'fase_deteccao',
  'severidade', 'causa_raiz', 'origem_bug', 'adicionado_apos_inicio_pai', 'motivo_descarte', 'tamanho_declarado',
] as const;
const LISTA = COLUNAS_VERSAO.join(', ');
const LISTA_V = COLUNAS_VERSAO.map((c) => `v.${c}`).join(', ');

/**
 * ADR 0020, 4b: os responsáveis vão da memória do coletor direto para `dim_card.responsaveis` e `dim_card_versao.responsaveis`
 * (colunas de `COLUNAS_PESSOA`, que a API não lê), na mesma execução, sem passar por nenhuma `stg_`.
 * - `dim_card` (projeção): UPDATE só se o valor mudou.
 * - `dim_card_versao` (append-only, SCD2): quando a versão vigente tem outro conjunto, entra uma versão nova, cópia da vigente com o
 *   conjunto novo; nunca se altera versão existente (histórico preservado). Sem versão vigente, nada é inventado: a projeção que
 *   cria a versão já leva `responsaveis` do mesmo `extrairResponsaveis`.
 * - `vigenteDe` igual ou anterior ao da versão vigente (com conjunto diferente): nada é gravado, nem na projeção, para que projeção e
 *   histórico não divirjam e o SCD2 não saia de ordem; o chamador deve tratar como dado fora de ordem.
 * - `null` não sobrescreve nada (reconstruir a projeção a partir da staging preserva o valor já gravado).
 */
export async function gravarResponsaveis(
  db: Consultavel, e: EntradaResponsaveis, S: Esquemas = esquemasDoAmbiente(),
): Promise<{ dimCard: boolean; versao: boolean }> {
  if (e.responsaveis === null) return { dimCard: false, versao: false };
  const vigente = await db.query<{ vigente_de: Date; responsaveis: string[] | null }>(
    `SELECT vigente_de, responsaveis FROM ${S.bm}.dim_card_versao WHERE card_id = $1 ORDER BY vigente_de DESC LIMIT 1`, [e.cardId]);
  const atual = vigente.rows[0];
  const mesmoConjunto = atual !== undefined && (atual.responsaveis ?? []).join('\u0000') === e.responsaveis.join('\u0000');
  if (atual !== undefined && !mesmoConjunto && e.vigenteDe.getTime() <= new Date(atual.vigente_de).getTime()) return { dimCard: false, versao: false };
  const card = await db.query(
    `UPDATE ${S.bm}.dim_card SET responsaveis = $2::text[], coletado_em = $3, atualizado_por_coleta_id = $4
     WHERE card_id = $1 AND responsaveis IS DISTINCT FROM $2::text[]`,
    [e.cardId, e.responsaveis, e.agora, e.coletaId]);
  const versao = await db.query(
    `INSERT INTO ${S.bm}.dim_card_versao (card_id, vigente_de, stg_card_sk, ${LISTA}, responsaveis, coletado_em, coleta_id)
     SELECT v.card_id, $2, $3, ${LISTA_V}, $4::text[], $5, $6
     FROM ${S.bm}.dim_card_versao v
     WHERE v.card_id = $1 AND $2::timestamptz > v.vigente_de AND v.responsaveis IS DISTINCT FROM $4::text[]
       AND v.vigente_de = (SELECT max(vigente_de) FROM ${S.bm}.dim_card_versao WHERE card_id = $1)
     ON CONFLICT ON CONSTRAINT uq_dim_card_versao DO NOTHING RETURNING card_versao_sk`,
    [e.cardId, e.vigenteDe, e.stgCardSk, e.responsaveis, e.agora, e.coletaId]);
  return { dimCard: (card.rowCount ?? 0) > 0, versao: versao.rows.length > 0 };
}
