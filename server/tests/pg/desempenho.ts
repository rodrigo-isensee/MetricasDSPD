/**
 * Medição de desempenho do banco (pedido 009, item 4): `pnpm --filter @metricas-dspd/server exec tsx tests/pg/desempenho.ts`.
 * Gera ~5x o volume do mock (2 anos), mede o p95 das consultas que montam as amostras e o da API com cache, e imprime
 * EXPLAIN (ANALYZE). Usa schemas próprios (PG_TESTE_URL) e os remove ao fim. Não faz parte da suíte.
 */
import { gerarBaseMock } from '@metricas-dspd/mock';
import { buildApp } from '../../src/app.js';
import * as R from '../../src/modulos/metricas/repositorio.js';
import { ServicoMetricas } from '../../src/modulos/metricas/index.js';
import { montarEsquemas, prefixoDeTeste } from '../../src/plataforma/db/esquemas.js';
import { migrar } from '../../src/plataforma/db/migrar.js';
import { semear } from '../../src/plataforma/db/seed.js';
import { criarPool, urlDoPapel } from '../../src/plataforma/db/pool.js';
import { semearReferencia } from './referencia.js';

const url = process.env.PG_TESTE_URL!;
const ESCALA = Number(process.env.DESEMPENHO_ESCALA ?? 5);
const N = Number(process.env.DESEMPENHO_N ?? 20);
const p95 = (xs: number[]): number => [...xs].sort((a, b) => a - b)[Math.ceil(0.95 * xs.length) - 1]!;
const med = async (fn: () => Promise<unknown>, n = N): Promise<number[]> => {
  const t: number[] = [];
  for (let i = 0; i < n; i++) { const a = performance.now(); await fn(); t.push(performance.now() - a); }
  return t;
};
const linha = (nome: string, t: number[]): void => console.log(`${nome.padEnd(34)} p50=${[...t].sort((a, b) => a - b)[Math.floor(t.length / 2)]!.toFixed(0)} ms  p95=${p95(t).toFixed(0)} ms  (n=${t.length})`);

const prefixo = prefixoDeTeste();
const E = montarEsquemas(prefixo);
const mig = criarPool(url, { max: 4, statementTimeoutMs: 600_000 });
await migrar(url, { prefixo });
const base = gerarBaseMock({ escala: ESCALA, mesesHistorico: 24 });
console.log(`volume: ${base.bm.cards.length} cards, ${base.bm.transicoes.length} transições, ${base.bm.bloqueios.length} bloqueios | ${base.ac.chamados.length} chamados, ${base.ac.etapas.length} etapas`);
const t0 = performance.now();
await semear(mig, base, E);
await semearReferencia(mig, E, base);
await mig.query('ANALYZE');
console.log(`seed: ${((performance.now() - t0) / 1000).toFixed(0)} s`);
const api = criarPool(urlDoPapel(url, 'dspd_api', process.env.DSPD_PWD_API ?? 'api_dev'), { max: 4 });
try {
  console.log('\n== consultas que montam as amostras (dspd_api) ==');
  const consultas: [string, () => Promise<unknown>][] = [
    ['dim_card', () => R.lerCards(api, E)], ['fato_transicao', () => R.lerTransicoes(api, E)], ['fato_bloqueio', () => R.lerBloqueios(api, E)],
    ['ref_coluna', () => R.lerColunas(api, E)], ['dim_chamado', () => R.lerChamados(api, E)], ['fato_etapa_chamado', () => R.lerEtapas(api, E)],
  ];
  for (const [n, f] of consultas) linha(n, await med(f, 10));
  const servico0 = new ServicoMetricas({ db: api, S: E });
  const agora = new Date('2026-10-10T15:00:00Z');
  const filtros = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' as const } };
  const sus = { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } };
  const carga = async (): Promise<void> => { const s = new ServicoMetricas({ db: api, S: E }); await s.calcular('O1', filtros, {}, agora); await s.calcular('S2', sus, {}, agora); };
  linha('carga completa (BM + AC) + 1 métrica cada', await med(carga, 5));
  void servico0;

  console.log('\n== API (Fastify inject, banco real) ==');
  const app = await buildApp({ db: api, S: E, agora: () => agora, nivelLog: 'silent' });
  const urls = ['O1', 'O2', 'T1', 'T2', 'T4', 'E1', 'S1', 'S2', 'S5', 'VISAO_GERAL'].map((m) => `/api/v1/metricas/${m}`);
  await Promise.all(urls.map((u) => app.inject(u)));
  const quente: number[] = [];
  for (let i = 0; i < 20; i++) for (const u of urls) { const a = performance.now(); const r = await app.inject(u); quente.push(performance.now() - a); if (r.statusCode !== 200) throw new Error(`${u} ${r.statusCode}`); }
  linha('API com cache (10 métricas x 20)', quente);
  const fria: number[] = [];
  for (const u of urls) { const a = performance.now(); await app.inject(`${u}?periodo=6m`); fria.push(performance.now() - a); }
  linha('API sem cache de resultado (base já carregada)', fria);

  console.log('\n== EXPLAIN (ANALYZE) ==');
  const exp = async (nome: string, sql: string, v: unknown[] = []): Promise<void> => {
    const r = await mig.query<{ 'QUERY PLAN': string }>(`EXPLAIN (ANALYZE, BUFFERS, COSTS OFF, TIMING OFF) ${sql}`, v);
    console.log(`-- ${nome}\n${r.rows.map((x) => x['QUERY PLAN']).join('\n')}\n`);
  };
  await exp('dim_card (carga)', `SELECT card_id, tipo, titulo, criado_em, concluido_em FROM ${E.bm}.dim_card WHERE criado_em IS NOT NULL AND granularidade IS NOT NULL AND tipo IS NOT NULL ORDER BY card_id`);
  await exp('fato_transicao (carga)', `SELECT card_id, coluna_destino_id, ocorrido_em FROM ${E.bm}.fato_transicao WHERE tipo_coluna IS NOT NULL AND direcao IS NOT NULL ORDER BY card_id, ocorrido_em, transicao_sk`);
  await exp('fato_bloqueio (carga)', `SELECT card_id, inicio FROM ${E.bm}.fato_bloqueio WHERE motivo IS NOT NULL ORDER BY card_id, inicio, bloqueio_sk`);
  await exp('dim_chamado (carga)', `SELECT chamado_id, aberto_em FROM ${E.ac}.dim_chamado WHERE aberto_em IS NOT NULL AND equipe IS NOT NULL AND prioridade IS NOT NULL ORDER BY chamado_id`);
  await exp('fato_etapa_chamado (carga)', `SELECT chamado_id, etapa, entrada FROM ${E.ac}.fato_etapa_chamado ORDER BY chamado_id, entrada, etapa`);
  await exp('marca d\'agua BM', `SELECT coleta_id, finalizado_em FROM ${E.bm}.ctl_coleta WHERE tarefa = ANY($1) AND status = 'sucesso' AND finalizado_em IS NOT NULL ORDER BY finalizado_em DESC, coleta_id DESC LIMIT 1`, [['coleta_incremental', 'varredura', 'projecao']]);
  await exp('filtros: início BM (min criado_em)', `SELECT to_char(min(criado_em) AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') FROM ${E.bm}.dim_card`);
  await exp('filtros: início AC (min aberto_em)', `SELECT to_char(min(aberto_em) AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') FROM ${E.ac}.dim_chamado`);
  await exp('filtros: equipes BM', `SELECT DISTINCT equipe FROM ${E.bm}.ref_quadro WHERE vigente_ate IS NULL AND nivel = 'time' AND eh_teste = false ORDER BY equipe`);
  await exp('versão de critério vigente', `SELECT versao_id FROM ${E.core}.ref_versao_criterio WHERE vigente_desde <= '9999-12-31' ORDER BY vigente_desde DESC, versao_id DESC LIMIT 1`);
  await exp('critérios por fonte', `SELECT v.versao_id, v.vigente_desde, v.descricao, m.metrica_id FROM ${E.core}.ref_versao_criterio v LEFT JOIN ${E.core}.ref_versao_criterio_metrica m ON m.versao_id = v.versao_id WHERE v.dominio = 'businessmap' ORDER BY v.vigente_desde, v.versao_id`);
  await exp('estado de coleta (ctl_coleta)', `SELECT coleta_id, iniciado_em, finalizado_em, status, erro_resumo FROM ${E.bm}.ctl_coleta WHERE tarefa = 'coleta_incremental' AND status <> 'em_andamento' AND finalizado_em IS NOT NULL ORDER BY iniciado_em DESC, coleta_id DESC`);
  await exp('outbox (fila do poller)', `SELECT evento_sk FROM ${E.core}.outbox WHERE fonte = 'businessmap' AND status IN ('pendente','processando') AND disponivel_em <= now() ORDER BY disponivel_em, evento_sk LIMIT 50 FOR UPDATE SKIP LOCKED`);
  console.log('== índices novos: o planejador os usa (enable_seqscan = off) ==');
  const c = await mig.connect();
  try {
    await c.query('SET enable_seqscan = off');
    for (const [nome, sql] of [
      ['min(aberto_em) AC', `SELECT min(aberto_em) FROM ${E.ac}.dim_chamado`],
      ['marca d\'agua BM', `SELECT coleta_id, finalizado_em FROM ${E.bm}.ctl_coleta WHERE status = 'sucesso' ORDER BY finalizado_em DESC, coleta_id DESC LIMIT 1`],
      ['coletas incrementais AC', `SELECT coleta_id FROM ${E.ac}.ctl_coleta WHERE tarefa = 'coleta_incremental' ORDER BY iniciado_em DESC, coleta_id DESC`],
    ] as const) {
      const r = await c.query<{ 'QUERY PLAN': string }>(`EXPLAIN (COSTS OFF) ${sql}`);
      console.log(`-- ${nome}: ${r.rows.map((x) => x['QUERY PLAN']).filter((l) => /Index/.test(l)).join(' | ')}`);
    }
  } finally { c.release(); }
} finally {
  await api.end();
  for (const s of [E.bm, E.ac, E.core]) await mig.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
  await mig.end();
}
