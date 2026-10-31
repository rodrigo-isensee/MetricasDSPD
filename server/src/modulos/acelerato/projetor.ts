import type { Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type Consultavel, type PoolLike } from '../../plataforma/db/pool.js';
import { Contadores, type RegistroChamado } from './allow-list.js';
import { registrarContagens, type Contagem } from './controle.js';
import { intervalosDasEtapas } from './etapas-sinteticas.js';
import { normalizarChamado, type EtapaTotal, type Natureza, type NaturezaPorPrefixo, type LinhaProjecao } from './normalizador.js';
import { ultimasDeEtapas } from './staging.js';

/**
 * Projetor do Acelerato, F2 (ADR 0023; data-model §4): do staging (append-only) para `dim_chamado_versao` (uma versão por versão do
 * staging, nada sobrescrito), `dim_chamado` (a vigente) e `fato_etapa_chamado` (intervalos por etapa a partir do total da ferramenta,
 * D-7). É independente da coleta: roda depois dela e pode rodar de novo (só projeta versões do staging ainda sem versão na dimensão).
 * Cada rodada com novidade grava UMA linha `ctl_coleta` de tarefa `projecao`, que é a marca d'água de carga que a API relê. Nada de
 * pessoa: o staging já não tem coluna de pessoa.
 */
export const TAMANHO_LOTE = 500;

type LinhaStaging = { stg_sk: string; id_origem: string; payload: RegistroChamado; ausente_na_extracao: boolean; fora_do_recorte: boolean; coletado_em: Date };

const ATRIBUTOS = [
  'natureza', 'equipe', 'organizacao', 'tipo', 'categoria_sistema', 'categoria_key', 'excluido', 'status', 'etapa', 'prioridade', 'aberto_em',
  'restaurado_em', 'data_finalizado', 'status_sla_r', 'status_sla_pa', 'nivel_resolucao', 'arquivado', 'com_agente', 'reincidente_90d', 'fora_do_recorte',
] as const;
type Atributo = (typeof ATRIBUTOS)[number];
const valorDe = (l: LinhaProjecao, a: Atributo): string | number | boolean | null => {
  const v = l[a];
  return v instanceof Date ? v.toISOString() : v;
};

export type ResultadoProjecao = {
  coletaId: number | null; versoes: number; chamados: number; etapas: number; semIntervalo: number; contagens: Record<string, number>;
};

/** Natureza pelo prefixo da categoria: `ref_dominio` campo `natureza_prefixo` (código = prefixo, rótulo = natureza). Rótulo desconhecido não entra. */
export async function carregarNaturezaPorPrefixo(db: Consultavel, S: Esquemas): Promise<NaturezaPorPrefixo> {
  const r = await db.query<{ codigo: string; rotulo: string }>(
    `SELECT codigo, rotulo FROM ${S.ac}.ref_dominio WHERE campo = 'natureza_prefixo' AND vigente_ate IS NULL ORDER BY ordem, codigo`);
  const m = new Map<string, Natureza>();
  for (const l of r.rows) if (l.rotulo === 'incidente' || l.rotulo === 'requisicao') m.set(l.codigo, l.rotulo);
  return m;
}

async function pendentes(db: Consultavel, S: Esquemas, depoisDe: string): Promise<LinhaStaging[]> {
  const r = await db.query<LinhaStaging>(
    `SELECT s.stg_sk, s.id_origem, s.payload, s.ausente_na_extracao, s.fora_do_recorte, s.coletado_em
       FROM ${S.ac}.stg_chamado s
      WHERE s.stg_sk > $1 AND NOT EXISTS (SELECT 1 FROM ${S.ac}.dim_chamado_versao v WHERE v.stg_chamado_sk = s.stg_sk)
      ORDER BY s.stg_sk LIMIT ${TAMANHO_LOTE}`, [depoisDe]);
  return r.rows.map((l) => ({ ...l, stg_sk: String(l.stg_sk) }));
}

/** Há versão do staging sem versão na dimensão? (decide se a rodada grava o `ctl_coleta` de projeção) */
async function haPendentes(db: Consultavel, S: Esquemas): Promise<boolean> {
  const r = await db.query(`SELECT 1 FROM ${S.ac}.stg_chamado s WHERE NOT EXISTS (SELECT 1 FROM ${S.ac}.dim_chamado_versao v WHERE v.stg_chamado_sk = s.stg_sk) LIMIT 1`);
  return r.rows.length > 0;
}

function inserirLote(S: Esquemas, tabela: string, colunas: readonly string[], linhas: readonly (readonly (string | number | boolean | null)[])[], sufixo = ''): { texto: string; valores: (string | number | boolean | null)[] } {
  const valores: (string | number | boolean | null)[] = [];
  const grupos = linhas.map((l) => `(${l.map((v) => { valores.push(v); return `$${valores.length}`; }).join(', ')})`);
  return { texto: `INSERT INTO ${S.ac}.${tabela} (${colunas.join(', ')}) VALUES ${grupos.join(', ')}${sufixo}`, valores };
}

async function projetarLote(
  db: Consultavel, S: Esquemas, lote: readonly LinhaStaging[], natureza: NaturezaPorPrefixo, coletaId: number, agora: Date, c: Contadores,
): Promise<{ chamados: number; etapas: number; semIntervalo: number }> {
  const ids = [...new Set(lote.map((l) => l.id_origem))];
  const etapasDe = new Map<string, EtapaTotal[]>();
  for (const e of (await ultimasDeEtapas(db, S, ids)).values()) {
    const p = e.payload as { descricao: string | null; tempo_sla_segundos: number | null; quantidade_vezes: number | null };
    const lista = etapasDe.get(e.chamadoId) ?? [];
    lista.push({ descricao: p.descricao, tempo_sla_segundos: p.tempo_sla_segundos, quantidade_vezes: p.quantidade_vezes });
    etapasDe.set(e.chamadoId, lista);
  }
  const linhas = lote.map((l) => ({ stg: l, dim: normalizarChamado(l.id_origem, l.payload, { ausente: l.ausente_na_extracao, fora: l.fora_do_recorte }, etapasDe.get(l.id_origem) ?? [], natureza, c) }));

  const versaoCols = ['chamado_id', 'vigente_de', 'stg_chamado_sk', ...ATRIBUTOS, 'coletado_em', 'coleta_id'];
  const v = inserirLote(S, 'dim_chamado_versao', versaoCols,
    linhas.map(({ stg, dim }) => [stg.id_origem, stg.coletado_em.toISOString(), stg.stg_sk, ...ATRIBUTOS.map((a) => valorDe(dim, a)), agora.toISOString(), coletaId]),
    ' ON CONFLICT ON CONSTRAINT uq_dim_chamado_versao DO NOTHING');
  await db.query(v.texto, v.valores);

  // A vigente é a última versão do staging de cada chamado no lote (ordem por `stg_sk`).
  const vigentes = new Map(linhas.map((x) => [x.stg.id_origem, x.dim]));
  const dimCols = ['chamado_id', ...ATRIBUTOS, 'coletado_em', 'atualizado_por_coleta_id'];
  // `dim_chamado` é projeção (a história fica no staging e em `dim_chamado_versao`): a vigente é refeita por chamado, sem UPSERT.
  await db.query(`DELETE FROM ${S.ac}.dim_chamado WHERE chamado_id = ANY($1::text[])`, [[...vigentes.keys()]]);
  const d = inserirLote(S, 'dim_chamado', dimCols,
    [...vigentes.values()].map((x) => [x.chamado_id, ...ATRIBUTOS.map((a) => valorDe(x, a)), agora.toISOString(), coletaId]));
  await db.query(d.texto, d.valores);

  // Intervalos por etapa: refeitos por chamado (projeção derivada; a história fica no staging e em `dim_chamado_versao`).
  await db.query(`DELETE FROM ${S.ac}.fato_etapa_chamado WHERE chamado_id = ANY($1::text[])`, [[...vigentes.keys()]]);
  const fato: (string | number | boolean | null)[][] = [];
  let semIntervalo = 0;
  for (const x of vigentes.values()) {
    if (x.data_finalizado === null || x.excluido || x.fora_do_recorte) continue;
    const s = intervalosDasEtapas(x.data_finalizado, etapasDe.get(x.chamado_id) ?? []);
    semIntervalo += s.semIntervalo;
    for (const i of s.intervalos) fato.push([x.chamado_id, i.etapa, i.entrada.toISOString(), i.saida.toISOString(), null, agora.toISOString(), coletaId]);
  }
  for (let i = 0; i < fato.length; i += TAMANHO_LOTE) {
    const f = inserirLote(S, 'fato_etapa_chamado', ['chamado_id', 'etapa', 'entrada', 'saida', 'motivo_pendencia', 'coletado_em', 'atualizado_por_coleta_id'], fato.slice(i, i + TAMANHO_LOTE));
    await db.query(f.texto, f.valores);
  }
  return { chamados: vigentes.size, etapas: fato.length, semIntervalo };
}

/**
 * Projeta o que ainda não foi projetado, numa transação. Sem novidade: nada é gravado e `coletaId` é `null`. O corte por `stg_sk` entre
 * lotes só evita reler o lote anterior; quem decide o que falta é o `NOT EXISTS`.
 */
export async function projetarAcelerato(pool: PoolLike, S: Esquemas, agora: () => Date): Promise<ResultadoProjecao> {
  return emTransacao(pool, async (db) => {
    if (!(await haPendentes(db, S))) return { coletaId: null, versoes: 0, chamados: 0, etapas: 0, semIntervalo: 0, contagens: {} };
    const inicio = agora();
    const natureza = await carregarNaturezaPorPrefixo(db, S);
    const ctl = await db.query<{ coleta_id: string }>(
      `INSERT INTO ${S.ac}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('projecao', $1, 'em_andamento', $2) RETURNING coleta_id`, [inicio, VERSAO_PROJETOR]);
    const coletaId = Number(ctl.rows[0]!.coleta_id);
    const c = new Contadores();
    let versoes = 0, chamados = 0, etapas = 0, semIntervalo = 0;
    let cursor = '0';
    for (;;) {
      const lote = await pendentes(db, S, cursor);
      if (lote.length === 0) break;
      const r = await projetarLote(db, S, lote, natureza, coletaId, inicio, c);
      versoes += lote.length; chamados += r.chamados; etapas += r.etapas; semIntervalo += r.semIntervalo;
      cursor = lote[lote.length - 1]!.stg_sk;
    }
    const contagens: Contagem[] = [
      { entidade: 'projecao_versao', lidos: versoes, inseridos: versoes, jaExistentes: 0, falhas: 0 },
      { entidade: 'projecao_chamado', lidos: chamados, inseridos: chamados, jaExistentes: 0, falhas: 0 },
      { entidade: 'projecao_etapa', lidos: etapas, inseridos: etapas, jaExistentes: 0, falhas: 0 },
      ...(semIntervalo > 0 ? [{ entidade: 'projecao_etapa_sem_intervalo', lidos: semIntervalo, inseridos: 0, jaExistentes: 0, falhas: 0 }] : []),
      ...c.entradas().map(([entidade, n]) => ({ entidade: `projecao_${entidade}`, lidos: n, inseridos: 0, jaExistentes: 0, falhas: 0 })),
    ];
    await registrarContagens(db, S, coletaId, contagens);
    await db.query(`UPDATE ${S.ac}.ctl_coleta SET status = 'sucesso', finalizado_em = $2 WHERE coleta_id = $1`, [coletaId, agora()]);
    return { coletaId, versoes, chamados, etapas, semIntervalo, contagens: Object.fromEntries(c.entradas()) };
  });
}

export const VERSAO_PROJETOR = 'acelerato-f2/1';
