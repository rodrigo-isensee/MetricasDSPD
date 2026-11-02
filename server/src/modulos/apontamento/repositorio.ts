import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';

// Pedido 059 (K-193), rota da aba Apontamento. Só leitura, com o papel `dspd_api_apontamento` (GRANT por coluna, `COLUNAS_API_APONTAMENTO`): nenhuma
// consulta usa `SELECT *`, `logged_time_id`, `responsavel_id`, comentário ou tabela `stg_`/`evt_`. Nome de schema vem de `Esquemas` (nunca da
// requisição) e todo valor da requisição vai por parâmetro. Só o esquema do BusinessMap (a aba nunca lê o Acelerato).

export interface LinhaBruta {
  data: string;
  segundos: number;
  subgrupo: string;
  /** Máscara de `flags_qualidade` (bits 1, 2, 4 da classificação; 8 `sem-iniciativa` da projeção). */
  flags: number;
  emSubtarefa: boolean;
  /** `pessoa_ref` (int8 como texto); `null` depois da eliminação a pedido ou sem de-para. */
  pessoaRef: string | null;
  projetoId: string | null;
  projetoTitulo: string | null;
  foraDoEscopo: boolean;
  /** Rótulo de `dim_card.tipo` do card (ou do pai); `null` fora dos tipos de item. */
  tipo: string | null;
}
type Row = { data: string; segundos: number; subgrupo: string; flags: number; em_subtarefa: boolean; pessoa_ref: string | null; projeto_id: string | null; projeto_titulo: string | null; fora: boolean; tipo: string | null };

/** Apontamentos ativos (`excluido_em` nulo) com data em `[de, ate]`, com as dimensões resolvidas. Ordem estável (a ordem final é da biblioteca). */
export async function lerLinhas(db: Consultavel, S: Esquemas, de: string, ate: string): Promise<LinhaBruta[]> {
  const r = await db.query<Row>(
    `SELECT f.data_apontamento AS data, f.segundos, f.subgrupo_codigo AS subgrupo, f.flags_qualidade AS flags, f.subtask_id IS NOT NULL AS em_subtarefa,
            f.pessoa_ref, f.iniciativa_card_id AS projeto_id, pr.titulo AS projeto_titulo,
            COALESCE(rc.raiz_fora_do_escopo, rp.raiz_fora_do_escopo, true) AS fora, COALESCE(c.tipo, p.tipo) AS tipo
     FROM ${S.bm}.fato_apontamento f
     LEFT JOIN ${S.bm}.dim_card_raiz rc ON rc.card_id = f.card_id
     LEFT JOIN ${S.bm}.dim_card_raiz rp ON rp.card_id = f.parent_card_id
     LEFT JOIN ${S.bm}.dim_card pr ON pr.card_id = f.iniciativa_card_id
     LEFT JOIN ${S.bm}.dim_card c ON c.card_id = f.card_id
     LEFT JOIN ${S.bm}.dim_card p ON p.card_id = f.parent_card_id
     WHERE f.excluido_em IS NULL AND f.data_apontamento BETWEEN $1::date AND $2::date
     ORDER BY f.data_apontamento, f.pessoa_ref NULLS FIRST, f.card_id, f.segundos`,
    [de, ate]);
  return r.rows.map((l) => ({
    data: l.data, segundos: l.segundos, subgrupo: l.subgrupo, flags: l.flags, emSubtarefa: l.em_subtarefa, pessoaRef: l.pessoa_ref,
    projetoId: l.projeto_id, projetoTitulo: l.projeto_titulo, foraDoEscopo: l.fora, tipo: l.tipo,
  }));
}

/** Primeiro e último dia com apontamento ativo (limites do período personalizado); `null` sem apontamento algum. */
export async function lerHistorico(db: Consultavel, S: Esquemas): Promise<{ inicio: string; fim: string } | null> {
  const r = await db.query<{ inicio: string | null; fim: string | null }>(
    `SELECT min(data_apontamento) AS inicio, max(data_apontamento) AS fim FROM ${S.bm}.fato_apontamento WHERE excluido_em IS NULL`);
  const l = r.rows[0];
  return l?.inicio == null || l.fim == null ? null : { inicio: l.inicio, fim: l.fim };
}

/** Nome real, só das pessoas pedidas (`pessoa_ref`). Só é chamada com `APONTAMENTO_NOMES` ligado: desligado, a coluna do nome nem é selecionada. */
export async function lerNomes(db: Consultavel, S: Esquemas, refs: readonly string[]): Promise<Map<string, string>> {
  if (refs.length === 0) return new Map();
  const r = await db.query<{ pessoa_ref: string; responsavel_nome: string }>(
    `SELECT pessoa_ref, responsavel_nome FROM ${S.bm}.dim_responsavel WHERE pessoa_ref = ANY($1::bigint[])`, [refs]);
  return new Map(r.rows.map((l) => [l.pessoa_ref, l.responsavel_nome]));
}

/** Rótulo de cada subgrupo do dicionário vigente (os dois residuais, `execucao-tecnica` e `nao-classificado`, são do código). */
export async function lerRotulosSubgrupo(db: Consultavel, S: Esquemas): Promise<Map<string, string>> {
  const r = await db.query<{ codigo: string; rotulo: string }>(`SELECT codigo, rotulo FROM ${S.bm}.ref_apontamento_subgrupo`);
  return new Map(r.rows.map((l) => [l.codigo, l.rotulo]));
}

/** Calendário da aba (classe `apontamento` do domínio BusinessMap, vigente): feriados e deslocamento. `null` = sem carga na referência. */
export async function lerCalendario(db: Consultavel, S: Esquemas): Promise<{ feriados: string[]; offsetMinutos: number } | null> {
  const a = await db.query<{ calendario_id: string; offset_minutos: number }>(
    `SELECT a.calendario_id, c.offset_minutos FROM ${S.core}.ref_calendario_aplicacao a
     JOIN ${S.core}.ref_calendario c ON c.calendario_id = a.calendario_id
     WHERE a.dominio = 'businessmap' AND a.classe = 'apontamento' AND a.vigente_ate IS NULL`);
  const cal = a.rows[0];
  if (cal === undefined) return null;
  const f = await db.query<{ data: string }>(`SELECT data FROM ${S.core}.ref_feriado WHERE calendario_id = $1::smallint ORDER BY data`, [cal.calendario_id]);
  return { feriados: f.rows.map((x) => x.data), offsetMinutos: cal.offset_minutos };
}

export interface ColetaLida { id: string; status: 'sucesso' | 'parcial' | 'falha'; iniciadoEm: Date; finalizadoEm: Date }
type RowColeta = { coleta_id: string; status: ColetaLida['status']; iniciado_em: Date; finalizado_em: Date };

/** Última coleta do worklog (`tarefa = 'apontamento'`) que terminou, e a última bem-sucedida: o mínimo de `ctl_coleta` para o frescor. */
export async function lerUltimasColetas(db: Consultavel, S: Esquemas): Promise<{ ultima: ColetaLida | null; ultimaOk: ColetaLida | null }> {
  const sql = (extra: string): string =>
    `SELECT coleta_id, status, iniciado_em, finalizado_em FROM ${S.bm}.ctl_coleta
     WHERE tarefa = 'apontamento' AND status <> 'em_andamento' AND finalizado_em IS NOT NULL${extra}
     ORDER BY finalizado_em DESC, coleta_id DESC LIMIT 1`;
  const lida = (x: RowColeta | undefined): ColetaLida | null =>
    x === undefined ? null : { id: String(x.coleta_id), status: x.status, iniciadoEm: x.iniciado_em, finalizadoEm: x.finalizado_em };
  const ultima = await db.query<RowColeta>(sql(''));
  const ok = await db.query<RowColeta>(sql(` AND status = 'sucesso'`));
  return { ultima: lida(ultima.rows[0]), ultimaOk: lida(ok.rows[0]) };
}

/** Versões de critério (T2.6) do dicionário de subgrupo, do calendário de feriados e dos limiares dos achados (BusinessMap), em ordem de data. */
export async function lerCriterios(db: Consultavel, S: Esquemas): Promise<{ id: string; data: string; descricao: string }[]> {
  const r = await db.query<{ versao_id: string; vigente_desde: string; descricao: string }>(
    `SELECT v.versao_id, v.vigente_desde, v.descricao FROM ${S.core}.ref_versao_criterio v
     WHERE v.dominio = 'businessmap' AND (
       EXISTS (SELECT 1 FROM ${S.bm}.ref_apontamento_subgrupo s WHERE s.incluido_por_versao_id = v.versao_id)
       OR EXISTS (SELECT 1 FROM ${S.bm}.ref_apontamento_termo t WHERE t.incluido_por_versao_id = v.versao_id)
       OR EXISTS (SELECT 1 FROM ${S.bm}.ref_apontamento_regra_tipo g WHERE g.incluido_por_versao_id = v.versao_id)
       OR EXISTS (SELECT 1 FROM ${S.core}.ref_feriado h WHERE h.incluido_por_versao_id = v.versao_id)
       OR EXISTS (SELECT 1 FROM ${S.core}.ref_versao_criterio_metrica m WHERE m.versao_id = v.versao_id AND m.metrica_id = 'apontamento-achados'))
     ORDER BY v.vigente_desde, v.versao_id`);
  return r.rows.map((l) => ({ id: String(l.versao_id), data: l.vigente_desde, descricao: l.descricao }));
}
