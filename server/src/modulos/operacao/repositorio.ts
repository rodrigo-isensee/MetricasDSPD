import type { Dominio, EventoColeta, VersaoCriterio } from '@metricas-dspd/contratos';
import { METRICA_IDS } from '@metricas-dspd/contratos';
import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { eventoDeLinhas, type LinhaColeta, type LinhaContagem } from './eventos.js';

/** Schema fixo por fonte (lista fechada; nada vem da requisição). BM e AC nunca na mesma consulta. */
const FONTE = {
  businessmap: { chave: 'bm', prefixo: 'bm' },
  acelerato: { chave: 'ac', prefixo: 'ac' },
} as const;
const METRICAS = new Set<string>(METRICA_IDS);

type RowColeta = { coleta_id: string; iniciado_em: Date; finalizado_em: Date; status: LinhaColeta['status']; erro_resumo: string | null };
type RowContagem = { coleta_id: string; entidade: string; lidos: string | number; inseridos: string | number; ja_existentes: string | number };
type RowVersao = { versao_id: string; vigente_desde: string; descricao: string; metrica_id: string | null };

/** Todos os eventos da fonte (histórico nunca é apagado). Só leitura. */
export async function lerEventos(db: Consultavel, dominio: Dominio, S: Esquemas = esquemasDoAmbiente()): Promise<EventoColeta[]> {
  const { chave, prefixo } = FONTE[dominio];
  const s = S[chave];
  const coletas = await db.query<RowColeta>(
    `SELECT coleta_id, iniciado_em, finalizado_em, status, erro_resumo FROM ${s}.ctl_coleta
     WHERE tarefa = 'coleta_incremental' AND status <> 'em_andamento' AND finalizado_em IS NOT NULL
     ORDER BY iniciado_em DESC, coleta_id DESC`);
  const contagens = await db.query<RowContagem>(
    `SELECT n.coleta_id, n.entidade, n.lidos, n.inseridos, n.ja_existentes FROM ${s}.ctl_coleta_contagem n
     JOIN ${s}.ctl_coleta c ON c.coleta_id = n.coleta_id
     WHERE c.tarefa = 'coleta_incremental' AND c.status <> 'em_andamento'`);
  const porColeta = new Map<string, LinhaContagem[]>();
  for (const r of contagens.rows) {
    const l = porColeta.get(String(r.coleta_id)) ?? [];
    l.push({ coletaId: r.coleta_id, entidade: r.entidade, lidos: r.lidos, inseridos: r.inseridos, jaExistentes: r.ja_existentes });
    porColeta.set(String(r.coleta_id), l);
  }
  return coletas.rows.map((r) =>
    eventoDeLinhas(
      prefixo,
      { coletaId: r.coleta_id, iniciadoEm: r.iniciado_em, finalizadoEm: r.finalizado_em, status: r.status, erroResumo: r.erro_resumo },
      porColeta.get(String(r.coleta_id)) ?? [],
    ),
  );
}

/** Versões de critério (T2.6) da fonte, de `dspd_core`. */
export async function lerVersoes(db: Consultavel, dominio: Dominio, S: Esquemas = esquemasDoAmbiente()): Promise<VersaoCriterio[]> {
  const r = await db.query<RowVersao>(
    `SELECT v.versao_id, v.vigente_desde, v.descricao, m.metrica_id FROM ${S.core}.ref_versao_criterio v
     LEFT JOIN ${S.core}.ref_versao_criterio_metrica m ON m.versao_id = v.versao_id
     WHERE v.dominio = $1 ORDER BY v.vigente_desde, v.versao_id`, [dominio]);
  const mapa = new Map<string, VersaoCriterio>();
  for (const x of r.rows) {
    const id = String(x.versao_id);
    const v = mapa.get(id) ?? { id, data: x.vigente_desde, descricao: x.descricao, afeta: [] };
    if (x.metrica_id !== null && METRICAS.has(x.metrica_id)) v.afeta.push(x.metrica_id as VersaoCriterio['afeta'][number]);
    mapa.set(id, v);
  }
  return [...mapa.values()];
}

/** Instante em que a última coleta incremental bem-sucedida da fonte terminou (`null` = nunca). */
export async function lerFimUltimaColetaOk(db: Consultavel, dominio: Dominio, S: Esquemas = esquemasDoAmbiente()): Promise<Date | null> {
  const r = await db.query<{ finalizado_em: Date }>(
    `SELECT finalizado_em FROM ${S[FONTE[dominio].chave]}.ctl_coleta
     WHERE tarefa = 'coleta_incremental' AND status = 'sucesso' AND finalizado_em IS NOT NULL
     ORDER BY finalizado_em DESC, coleta_id DESC LIMIT 1`);
  return r.rows[0]?.finalizado_em ?? null;
}

const TAREFAS_DE_CARGA = ['coleta_incremental', 'varredura', 'projecao'];

/**
 * Marca d'água da carga de UMA fonte: a última coleta bem-sucedida que gravou projeções (incremental, varredura ou
 * projeção/seed). `coletaId` identifica a versão de carga (invalida o cache); `finalizadoEm` é a data de referência (S-a).
 */
export async function lerMarcaDagua(db: Consultavel, dominio: Dominio, S: Esquemas = esquemasDoAmbiente()): Promise<{ coletaId: string; finalizadoEm: Date } | null> {
  const r = await db.query<{ coleta_id: string; finalizado_em: Date }>(
    `SELECT coleta_id, finalizado_em FROM ${S[FONTE[dominio].chave]}.ctl_coleta
     WHERE tarefa = ANY($1) AND status = 'sucesso' AND finalizado_em IS NOT NULL
     ORDER BY finalizado_em DESC, coleta_id DESC LIMIT 1`, [TAREFAS_DE_CARGA]);
  const x = r.rows[0];
  return x === undefined ? null : { coletaId: String(x.coleta_id), finalizadoEm: x.finalizado_em };
}
