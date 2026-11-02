import type { Esquemas } from '../../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../../plataforma/db/pool.js';
import { calcularRaizes, type NoCard } from './hierarquia.js';
import { COLUNAS_REGISTRO, DEFINICAO_REGISTRO, type LinhaClassificada } from './registro.js';

// Pedido 059 (K-193), A1 e A3: SQL do apontamento. Tudo parametrizado (o único texto montado a partir de constante é a lista de colunas
// de `COLUNAS_REGISTRO`, que nunca vem de entrada externa). Lotes por `jsonb_to_recordset`; `ON CONFLICT` sempre com alvo explícito e
// `DO NOTHING`; o "upsert" das projeções é UPDATE do que mudou mais INSERT do que falta (o projeto proíbe `DO UPDATE`).

export type LinhaComPessoa = LinhaClassificada & { pessoa_ref: number | null; type_id: string | null };
export interface CardDoEscopo { card_id: string; type_id: string | null }
export interface AtivoDaJanela { logged_time_id: string; card_id: string; parent_card_id: string | null }

const V = (c: string): string => (c === 'registro_sha256' ? "decode(v.registro_sha256, 'hex')" : `v.${c}`);
const SQL_COLUNAS = COLUNAS_REGISTRO.join(', ');
const SQL_VALORES = COLUNAS_REGISTRO.map(V).join(', ');

/**
 * Cards do escopo da aba (Q-A1): os de `dim_card` (todos os estados), menos os de workflow "fora de todo cálculo" (H-7, pela
 * referência vigente), com o `type_id` da última versão do card na staging (só em memória: entra na classificação). Ordem estável.
 */
export async function escopoDoWorklog(db: Consultavel, S: Esquemas): Promise<CardDoEscopo[]> {
  const r = await db.query<CardDoEscopo>(
    `SELECT c.card_id, s.type_id FROM ${S.bm}.dim_card c
     LEFT JOIN LATERAL (SELECT payload ->> 'type_id' AS type_id, payload ->> 'workflow_id' AS workflow_id
                          FROM ${S.bm}.stg_card WHERE id_origem = c.card_id ORDER BY stg_sk DESC LIMIT 1) s ON true
     WHERE c.card_id ~ '^[1-9][0-9]{0,11}$'
       AND NOT EXISTS (SELECT 1 FROM ${S.bm}.ref_time_workflow w
                        WHERE w.workflow_id = s.workflow_id AND w.vigente_ate IS NULL AND w.motivo_fora = 'fora_de_todo_calculo')
     ORDER BY length(c.card_id), c.card_id`);
  return r.rows;
}

/** `pessoa_ref` de cada `user_id` já resolvido em `dim_responsavel` (id do BusinessMap -> chave opaca). */
export async function pessoasResolvidas(db: Consultavel, S: Esquemas, userIds: readonly string[]): Promise<Map<string, number>> {
  const r = await db.query<{ responsavel_id: string; pessoa_ref: string }>(
    `SELECT responsavel_id, pessoa_ref FROM ${S.bm}.dim_responsavel WHERE responsavel_id = ANY($1::text[]) AND pessoa_ref IS NOT NULL`, [userIds]);
  return new Map(r.rows.map((l) => [l.responsavel_id, Number(l.pessoa_ref)]));
}

/** Versões novas na staging (append-only; a mesma versão relida não duplica). Devolve quantas linhas entraram. */
export async function gravarStgApontamento(db: Consultavel, S: Esquemas, linhas: readonly LinhaClassificada[], coletaId: number, agora: Date): Promise<number> {
  const r = await db.query(
    `INSERT INTO ${S.bm}.stg_apontamento (${SQL_COLUNAS}, coletado_em, coleta_id)
     SELECT ${SQL_VALORES}, $2::timestamptz, $3::bigint FROM jsonb_to_recordset($1::jsonb) AS v(${DEFINICAO_REGISTRO})
     ON CONFLICT ON CONSTRAINT uq_stg_apontamento DO NOTHING RETURNING logged_time_id`,
    [JSON.stringify(linhas), agora, coletaId]);
  return r.rows.length;
}

/**
 * Estado atual de cada apontamento lido (`fato_apontamento`), na mesma transação da staging: UPDATE do que mudou (hash novo, pessoa
 * nova ou tipo do card novo) e INSERT do que falta. `pessoa_ref` nunca é apagada por uma leitura sem pessoa (COALESCE), nem `type_id` por uma leitura sem tipo; `versoes` conta as versões da staging;
 * o bit 8 de `flags_qualidade` (sem-iniciativa, gravado por `atualizarHierarquia`) é preservado, e o 16 (valor-atipico) também, mas está reservado:
 * nada o grava, pois a soma diária é calculada na leitura. A máscara 24 é a soma dos dois bits. Devolve `[atualizados, inseridos]`.
 */
export async function projetarFatoApontamento(
  db: Consultavel, S: Esquemas, linhas: readonly LinhaComPessoa[], coletaId: number, agora: Date,
): Promise<[number, number]> {
  const def = `${DEFINICAO_REGISTRO}, pessoa_ref bigint, type_id text`;
  const versoes = `(SELECT count(*) FROM ${S.bm}.stg_apontamento s WHERE s.logged_time_id = v.logged_time_id)::smallint`;
  const valores = [JSON.stringify(linhas), agora, coletaId];
  const atualizados = await db.query(
    `UPDATE ${S.bm}.fato_apontamento AS f SET
       card_id = v.card_id, parent_card_id = v.parent_card_id, subtask_id = v.subtask_id, lane_id = v.lane_id, column_id = v.column_id,
       category_id = v.category_id, data_apontamento = v.data_apontamento, segundos = v.segundos, registrado_em = v.registrado_em,
       subgrupo_codigo = v.subgrupo_codigo, flags_qualidade = v.flags_qualidade | (f.flags_qualidade & 24), qtd_palavras = v.qtd_palavras,
       versao_dicionario = v.versao_dicionario, registro_sha256 = decode(v.registro_sha256, 'hex'),
       pessoa_ref = COALESCE(v.pessoa_ref, f.pessoa_ref), type_id = COALESCE(v.type_id, f.type_id), versoes = ${versoes}, atualizado_em = $2::timestamptz, atualizado_por_coleta_id = $3::bigint
     FROM jsonb_to_recordset($1::jsonb) AS v(${def})
     WHERE f.logged_time_id = v.logged_time_id
       AND (f.registro_sha256 IS DISTINCT FROM decode(v.registro_sha256, 'hex') OR (v.pessoa_ref IS NOT NULL AND f.pessoa_ref IS DISTINCT FROM v.pessoa_ref)
         OR (v.type_id IS NOT NULL AND f.type_id IS DISTINCT FROM v.type_id))`,
    valores);
  const inseridos = await db.query(
    `INSERT INTO ${S.bm}.fato_apontamento (${SQL_COLUNAS}, pessoa_ref, type_id, versoes, atualizado_em, atualizado_por_coleta_id)
     SELECT ${SQL_VALORES}, v.pessoa_ref, v.type_id, ${versoes}, $2::timestamptz, $3::bigint FROM jsonb_to_recordset($1::jsonb) AS v(${def})
     ON CONFLICT ON CONSTRAINT fato_apontamento_pkey DO NOTHING`,
    valores);
  return [atualizados.rowCount ?? 0, inseridos.rowCount ?? 0];
}

/** Apontamentos já marcados como excluídos entre os `ids` (candidatos a `reaparecido` se voltaram a aparecer). */
export async function excluidosEntre(db: Consultavel, S: Esquemas, ids: readonly string[]): Promise<AtivoDaJanela[]> {
  const r = await db.query<AtivoDaJanela>(
    `SELECT logged_time_id, card_id, parent_card_id FROM ${S.bm}.fato_apontamento WHERE logged_time_id = ANY($1::text[]) AND excluido_em IS NOT NULL`, [ids]);
  return r.rows;
}

/** Apontamentos ativos (`excluido_em` nulo) com data na janela, de cards do escopo ou filhos deles (subtarefas). */
export async function ativosDaJanela(db: Consultavel, S: Esquemas, desde: string, cards: readonly string[]): Promise<AtivoDaJanela[]> {
  const r = await db.query<AtivoDaJanela>(
    `SELECT logged_time_id, card_id, parent_card_id FROM ${S.bm}.fato_apontamento
     WHERE excluido_em IS NULL AND data_apontamento >= $1::date AND (card_id = ANY($2::text[]) OR parent_card_id = ANY($2::text[]))`, [desde, cards]);
  return r.rows;
}

export type TipoEvento = 'excluido_detectado' | 'reaparecido';

/**
 * Eventos da varredura de presença, com chave natural `(logged_time_id, tipo, chave_ocorrencia)` (A1 do review): `chave` é a data civil da
 * detecção (America/Sao_Paulo), então a sobreposição e a reexecução no mesmo dia não duplicam. Marca ou desmarca `excluido_em` só dos
 * apontamentos cujo evento ENTROU (fato e eventos nunca divergem). Devolve os ids que mudaram de estado. Nada é apagado.
 */
export async function registrarEventos(
  db: Consultavel, S: Esquemas, tipo: TipoEvento, itens: readonly AtivoDaJanela[], chave: string, coletaId: number, agora: Date,
): Promise<string[]> {
  if (itens.length === 0) return [];
  const novos = await db.query<{ logged_time_id: string }>(
    `INSERT INTO ${S.bm}.evt_apontamento (logged_time_id, card_id, tipo, origem, chave_ocorrencia, ocorrido_em, detectado_em, coleta_id)
     SELECT e.id, e.card, $3::text, 'varredura', $4::text, NULL, $5::timestamptz, $6::bigint FROM unnest($1::text[], $2::text[]) AS e(id, card)
     ON CONFLICT ON CONSTRAINT uq_evt_apontamento DO NOTHING RETURNING logged_time_id`,
    [itens.map((i) => i.logged_time_id), itens.map((i) => i.card_id), tipo, chave, agora, coletaId]);
  const ids = novos.rows.map((l) => l.logged_time_id);
  if (tipo === 'excluido_detectado') {
    await db.query(`UPDATE ${S.bm}.fato_apontamento SET excluido_em = $2::timestamptz WHERE logged_time_id = ANY($1::text[]) AND excluido_em IS NULL`, [ids, agora]);
  } else {
    await db.query(`UPDATE ${S.bm}.fato_apontamento SET excluido_em = NULL WHERE logged_time_id = ANY($1::text[]) AND excluido_em IS NOT NULL`, [ids]);
  }
  return ids;
}

/**
 * Refaz `dim_card_raiz` a partir de `dim_card.card_pai` e grava `iniciativa_card_id` e o bit `sem-iniciativa` (8) de cada apontamento, tudo
 * na mesma transação do chamador (A6 do review: o fato e a raiz nunca divergem). Sem DELETE: atualiza o que mudou e insere o que falta.
 * `sem-iniciativa` (C-9): a raiz não é um card de iniciativa, ou o card do apontamento (ou o pai dele) não está em `dim_card`.
 */
export async function atualizarHierarquia(db: Consultavel, S: Esquemas, coletaId: number, agora: Date): Promise<number> {
  const cards = await db.query<{ card_id: string; card_pai: string | null; granularidade: string | null }>(
    `SELECT card_id, card_pai, granularidade FROM ${S.bm}.dim_card WHERE card_id ~ '^[1-9][0-9]{0,11}$'`);
  const nos: NoCard[] = cards.rows.map((c) => ({ id: c.card_id, pai: c.card_pai, iniciativa: c.granularidade === 'projeto' }));
  const raizes = JSON.stringify(calcularRaizes(nos));
  const def = 'card_id text, raiz_card_id text, profundidade smallint, raiz_eh_iniciativa boolean, raiz_fora_do_escopo boolean';
  await db.query(
    `UPDATE ${S.bm}.dim_card_raiz AS r SET raiz_card_id = v.raiz_card_id, profundidade = v.profundidade, raiz_eh_iniciativa = v.raiz_eh_iniciativa,
       raiz_fora_do_escopo = v.raiz_fora_do_escopo, coletado_em = $2::timestamptz, atualizado_por_coleta_id = $3::bigint
     FROM jsonb_to_recordset($1::jsonb) AS v(${def})
     WHERE r.card_id = v.card_id AND (r.raiz_card_id, r.profundidade, r.raiz_eh_iniciativa, r.raiz_fora_do_escopo)
       IS DISTINCT FROM (v.raiz_card_id, v.profundidade, v.raiz_eh_iniciativa, v.raiz_fora_do_escopo)`, [raizes, agora, coletaId]);
  await db.query(
    `INSERT INTO ${S.bm}.dim_card_raiz (card_id, raiz_card_id, profundidade, raiz_eh_iniciativa, raiz_fora_do_escopo, coletado_em, atualizado_por_coleta_id)
     SELECT v.card_id, v.raiz_card_id, v.profundidade, v.raiz_eh_iniciativa, v.raiz_fora_do_escopo, $2::timestamptz, $3::bigint
     FROM jsonb_to_recordset($1::jsonb) AS v(${def}) ON CONFLICT ON CONSTRAINT dim_card_raiz_pkey DO NOTHING`, [raizes, agora, coletaId]);
  const fato = await db.query(
    `UPDATE ${S.bm}.fato_apontamento AS f SET iniciativa_card_id = n.raiz, flags_qualidade = (f.flags_qualidade & 23) | n.bit
     FROM (SELECT a.logged_time_id, COALESCE(rc.raiz_card_id, rp.raiz_card_id) AS raiz,
                  CASE WHEN COALESCE(rc.raiz_eh_iniciativa, rp.raiz_eh_iniciativa) IS TRUE THEN 0 ELSE 8 END AS bit
             FROM ${S.bm}.fato_apontamento a
             LEFT JOIN ${S.bm}.dim_card_raiz rc ON rc.card_id = a.card_id
             LEFT JOIN ${S.bm}.dim_card_raiz rp ON rp.card_id = a.parent_card_id) n
     WHERE f.logged_time_id = n.logged_time_id AND (f.iniciativa_card_id IS DISTINCT FROM n.raiz OR (f.flags_qualidade & 8) <> n.bit)`);
  return fato.rowCount ?? 0;
}
