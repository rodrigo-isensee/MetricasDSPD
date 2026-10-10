import type { Dominio, EventoColeta, VersaoCriterio } from '@metricas-dspd/contratos';
import { METRICA_IDS } from '@metricas-dspd/contratos';
import { sql, type Kysely } from 'kysely';
import { eventoDeLinhas, type LinhaColeta, type LinhaContagem } from './eventos.js';

/** Schemas fixos por fonte (lista fechada; nada vem da requisição). BM e AC nunca na mesma consulta. */
const FONTE = {
  businessmap: { schema: 'dspd_bm', prefixo: 'bm' },
  acelerato: { schema: 'dspd_ac', prefixo: 'ac' },
} as const;
const METRICAS = new Set<string>(METRICA_IDS);

type RowColeta = { coleta_id: string; iniciado_em: Date; finalizado_em: Date; status: LinhaColeta['status']; erro_resumo: string | null };
type RowContagem = { coleta_id: string; entidade: string; lidos: string; inseridos: string; ja_existentes: string };
type RowVersao = { versao_id: string; vigente_desde: Date; descricao: string; metrica_id: string | null };

/** Todos os eventos da fonte (histórico nunca é apagado). Só leitura. */
export async function lerEventos(db: Kysely<unknown>, dominio: Dominio): Promise<EventoColeta[]> {
  const { schema, prefixo } = FONTE[dominio];
  const s = sql.raw(schema);
  const coletas = await sql<RowColeta>`
    SELECT coleta_id, iniciado_em, finalizado_em, status, erro_resumo FROM ${s}.ctl_coleta
    WHERE tarefa = 'coleta_incremental' AND status <> 'em_andamento' AND finalizado_em IS NOT NULL
    ORDER BY iniciado_em DESC, coleta_id DESC`.execute(db);
  const contagens = await sql<RowContagem>`
    SELECT n.coleta_id, n.entidade, n.lidos, n.inseridos, n.ja_existentes FROM ${s}.ctl_coleta_contagem n
    JOIN ${s}.ctl_coleta c ON c.coleta_id = n.coleta_id
    WHERE c.tarefa = 'coleta_incremental' AND c.status <> 'em_andamento'`.execute(db);
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
export async function lerVersoes(db: Kysely<unknown>, dominio: Dominio): Promise<VersaoCriterio[]> {
  const r = await sql<RowVersao>`
    SELECT v.versao_id, v.vigente_desde, v.descricao, m.metrica_id FROM dspd_core.ref_versao_criterio v
    LEFT JOIN dspd_core.ref_versao_criterio_metrica m ON m.versao_id = v.versao_id
    WHERE v.dominio = ${dominio} ORDER BY v.vigente_desde, v.versao_id`.execute(db);
  const mapa = new Map<string, VersaoCriterio>();
  for (const x of r.rows) {
    const id = String(x.versao_id);
    const v = mapa.get(id) ?? { id, data: x.vigente_desde.toISOString().slice(0, 10), descricao: x.descricao, afeta: [] };
    if (x.metrica_id !== null && METRICAS.has(x.metrica_id)) v.afeta.push(x.metrica_id as VersaoCriterio['afeta'][number]);
    mapa.set(id, v);
  }
  return [...mapa.values()];
}
