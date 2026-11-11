import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { lerCalendarioVigente, METRICA_DICIONARIO_APONTAMENTO, type CalendarioDaReferencia } from '../referencia/index.js';

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
  /** `type_id` do BusinessMap em dígitos (do card ou do pai); é o valor do filtro `tipo`. `null` nas linhas ainda não relidas pela coleta. */
  typeId: string | null;
}
type Row = { data: string; segundos: number; subgrupo: string; flags: number; em_subtarefa: boolean; pessoa_ref: string | null; projeto_id: string | null; projeto_titulo: string | null; fora: boolean; tipo: string | null; type_id: string | null };

/** Apontamentos ativos (`excluido_em` nulo) com data em `[de, ate]`, com as dimensões resolvidas. Ordem estável (a ordem final é da biblioteca). */
export async function lerLinhas(db: Consultavel, S: Esquemas, de: string, ate: string): Promise<LinhaBruta[]> {
  const r = await db.query<Row>(
    `SELECT f.data_apontamento AS data, f.segundos, f.subgrupo_codigo AS subgrupo, f.flags_qualidade AS flags, f.subtask_id IS NOT NULL AS em_subtarefa,
            f.pessoa_ref, f.iniciativa_card_id AS projeto_id, pr.titulo AS projeto_titulo,
            COALESCE(rc.raiz_fora_do_escopo, rp.raiz_fora_do_escopo, true) AS fora, COALESCE(c.tipo, p.tipo) AS tipo, f.type_id
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
    projetoId: l.projeto_id, projetoTitulo: l.projeto_titulo, foraDoEscopo: l.fora, tipo: l.tipo, typeId: l.type_id,
  }));
}

/** Par (`type_id`, categoria) de um apontamento ativo, de qualquer data. */
export interface TipoDoHistorico { typeId: string | null; tipo: string | null }

/**
 * K-272: pares distintos `type_id` x categoria (`dim_card.tipo`, do card ou do pai) em TODO o histórico ativo, sem filtro de data. É daqui que saem o id
 * da categoria e o conjunto de `type_id` que um valor `tipo=` cobre, para não depender da janela pedida. Só dígitos e rótulo de tipo: nada de pessoa.
 */
export async function lerTiposDoHistorico(db: Consultavel, S: Esquemas): Promise<TipoDoHistorico[]> {
  const r = await db.query<{ tipo: string | null; type_id: string | null }>(
    `SELECT DISTINCT COALESCE(c.tipo, p.tipo) AS tipo, h.type_id
     FROM ${S.bm}.fato_apontamento h
     LEFT JOIN ${S.bm}.dim_card c ON c.card_id = h.card_id
     LEFT JOIN ${S.bm}.dim_card p ON p.card_id = h.parent_card_id
     WHERE h.excluido_em IS NULL AND h.type_id IS NOT NULL`);
  return r.rows.map((l) => ({ typeId: l.type_id, tipo: l.tipo }));
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

/**
 * Quem é do time (decisão do dono, 2026-11-02): `pessoa_ref` de quem foi responsável por pelo menos um card do escopo do DSPD a partir de `corte`
 * (12 meses antes de agora). Lê a view `apt_pessoa_time` (definer: o papel da aba não lê `responsavel_id` nem `responsaveis`); só `pessoa_ref` sai.
 */
export async function lerPessoasDoTime(db: Consultavel, S: Esquemas, corte: Date): Promise<Set<string>> {
  const r = await db.query<{ pessoa_ref: string }>(
    `SELECT pessoa_ref FROM ${S.bm}.apt_pessoa_time WHERE vigencia_ate IS NULL OR vigencia_ate >= $1::timestamptz`, [corte.toISOString()]);
  return new Set(r.rows.map((l) => l.pessoa_ref));
}

/**
 * Rótulo de cada subgrupo do dicionário (os dois residuais, `execucao-tecnica` e `nao-classificado`, são do código). Com a troca de rótulo (pedido 089, D3) a
 * tabela guarda a linha fechada e a nova do mesmo `codigo`: vale a mais recente (maior `incluido_por_versao_id`, que é crescente), o mesmo que o vigente
 * enquanto o código existe e ainda rotula o histórico de um código retirado. Não filtra por `vigente_ate`: o papel da aba não tem essa coluna no GRANT.
 */
export async function lerRotulosSubgrupo(db: Consultavel, S: Esquemas): Promise<Map<string, string>> {
  const r = await db.query<{ codigo: string; rotulo: string }>(
    `SELECT DISTINCT ON (codigo) codigo, rotulo FROM ${S.bm}.ref_apontamento_subgrupo ORDER BY codigo, incluido_por_versao_id DESC`);
  return new Map(r.rows.map((l) => [l.codigo, l.rotulo]));
}

/** Calendário da aba (classe `apontamento` do domínio BusinessMap, vigente): feriados e deslocamento. `null` = sem carga na referência. */
export const lerCalendario = (db: Consultavel, S: Esquemas): Promise<CalendarioDaReferencia | null> => lerCalendarioVigente(db, S, 'businessmap', 'apontamento');

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

/**
 * Versões de critério (T2.6) do dicionário de subgrupo, do calendário de feriados e dos limiares dos achados (BusinessMap), em ordem de data. O `id` leva o
 * prefixo da família que a versão alterou (`dicionario-`, `calendario-` ou `achados-`), porque o front só desenha a marca nos gráficos pelo prefixo (pedido 089,
 * correção A): dicionário (subgrupo, termo, regra por tipo ou a métrica `apontamento-dicionario` do critério de `sem-vinculo`; `referencia` não está no GRANT da aba) > calendário (feriado) > achados (limiares).
 */
export async function lerCriterios(db: Consultavel, S: Esquemas): Promise<{ id: string; data: string; descricao: string }[]> {
  const r = await db.query<{ versao_id: string; vigente_desde: string; descricao: string; familia: 'dicionario' | 'calendario' | 'achados' }>(
    `SELECT v.versao_id, v.vigente_desde, v.descricao,
       CASE
         WHEN EXISTS (SELECT 1 FROM ${S.core}.ref_versao_criterio_metrica d WHERE d.versao_id = v.versao_id AND d.metrica_id = '${METRICA_DICIONARIO_APONTAMENTO}')
           OR EXISTS (SELECT 1 FROM ${S.bm}.ref_apontamento_subgrupo s WHERE s.incluido_por_versao_id = v.versao_id)
           OR EXISTS (SELECT 1 FROM ${S.bm}.ref_apontamento_termo t WHERE t.incluido_por_versao_id = v.versao_id)
           OR EXISTS (SELECT 1 FROM ${S.bm}.ref_apontamento_regra_tipo g WHERE g.incluido_por_versao_id = v.versao_id) THEN 'dicionario'
         WHEN EXISTS (SELECT 1 FROM ${S.core}.ref_feriado h WHERE h.incluido_por_versao_id = v.versao_id) THEN 'calendario'
         ELSE 'achados'
       END AS familia
     FROM ${S.core}.ref_versao_criterio v
     WHERE v.dominio = 'businessmap' AND (
       EXISTS (SELECT 1 FROM ${S.bm}.ref_apontamento_subgrupo s WHERE s.incluido_por_versao_id = v.versao_id)
       OR EXISTS (SELECT 1 FROM ${S.bm}.ref_apontamento_termo t WHERE t.incluido_por_versao_id = v.versao_id)
       OR EXISTS (SELECT 1 FROM ${S.bm}.ref_apontamento_regra_tipo g WHERE g.incluido_por_versao_id = v.versao_id)
       OR EXISTS (SELECT 1 FROM ${S.core}.ref_feriado h WHERE h.incluido_por_versao_id = v.versao_id)
       OR EXISTS (SELECT 1 FROM ${S.core}.ref_versao_criterio_metrica m WHERE m.versao_id = v.versao_id AND m.metrica_id = 'apontamento-achados'))
     ORDER BY v.vigente_desde, v.versao_id`);
  return r.rows.map((l) => ({ id: `${l.familia}-${l.versao_id}`, data: l.vigente_desde, descricao: l.descricao }));
}

export interface CardIncompleto {
  cardId: string;
  titulo: string | null;
  projetoId: string | null;
  projetoTitulo: string | null;
  foraDoEscopo: boolean;
}
type RowIncompleto = { card_id: string; titulo: string | null; projeto_id: string | null; projeto_titulo: string | null; fora: boolean };

/**
 * Pedido 063 (K-200): cards do BusinessMap com registro de horas INCOMPLETO (último evento de `ctl_apontamento_cobertura` = `incompleto`) que
 * têm horas ativas no recorte: período `[de, ate]` e, quando pedidos, os filtros de projeto (`iniciativa_card_id`) e de tipo (`type_id`). O filtro de
 * pessoa e os demais não entram (o card é incompleto para todo mundo). Só id, título e projeto do card: nada de pessoa, hora nem contagem de registros.
 * Os filtros chegam por parâmetro (`null` = sem filtro); nunca se monta SQL com valor da requisição.
 */
export async function lerCardsIncompletos(
  db: Consultavel, S: Esquemas, de: string, ate: string, projetos: readonly string[] | undefined, tipos: readonly string[] | undefined,
): Promise<CardIncompleto[]> {
  const r = await db.query<RowIncompleto>(
    `SELECT cb.card_id, k.titulo, x.projeto_id, pr.titulo AS projeto_titulo, x.fora
     FROM (SELECT card_id FROM (SELECT DISTINCT ON (card_id) card_id, estado FROM ${S.bm}.ctl_apontamento_cobertura ORDER BY card_id, cobertura_sk DESC) u
            WHERE estado = 'incompleto') cb
     JOIN LATERAL (
       SELECT f.iniciativa_card_id AS projeto_id, COALESCE(rc.raiz_fora_do_escopo, rp.raiz_fora_do_escopo, true) AS fora
       FROM ${S.bm}.fato_apontamento f
       LEFT JOIN ${S.bm}.dim_card_raiz rc ON rc.card_id = f.card_id
       LEFT JOIN ${S.bm}.dim_card_raiz rp ON rp.card_id = f.parent_card_id
       WHERE f.excluido_em IS NULL AND f.data_apontamento BETWEEN $1::date AND $2::date
         AND (f.card_id = cb.card_id OR f.parent_card_id = cb.card_id)
         AND ($3::text[] IS NULL OR f.iniciativa_card_id = ANY($3::text[]))
         AND ($4::text[] IS NULL OR f.type_id = ANY($4::text[]))
       ORDER BY f.data_apontamento, f.card_id
       LIMIT 1) x ON true
     LEFT JOIN ${S.bm}.dim_card k ON k.card_id = cb.card_id
     LEFT JOIN ${S.bm}.dim_card pr ON pr.card_id = x.projeto_id
     ORDER BY length(cb.card_id), cb.card_id`,
    [de, ate, projetos === undefined || projetos.length === 0 ? null : projetos, tipos === undefined || tipos.length === 0 ? null : tipos]);
  return r.rows.map((l) => ({ cardId: l.card_id, titulo: l.titulo, projetoId: l.projeto_id, projetoTitulo: l.projeto_titulo, foraDoEscopo: l.fora }));
}
