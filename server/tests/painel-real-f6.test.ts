import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao';
import { METRICA_IDS, origemDaMetrica, type MetricaId } from '@metricas-dspd/contratos';
import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { ServicoMetricas } from '../src/modulos/metricas/index.js';
import { colunasDe, configBM, limitesDosTimes, montarBaseBM, type RefBM } from '../src/modulos/metricas/mapa.js';
import type { LinhaCard, LinhaColunaReal, LinhaTransicao } from '../src/modulos/metricas/repositorio.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg, type Chamada, type Respondedor } from './duble-pg.js';

// F6 do plano 052 (E2.69): o servidor escolhe a base por métrica (origem do contrato), nunca as duas na mesma; tipo da coluna resolvido
// na leitura (A4); O1 contra o limite da coluna (H-12); O3 com nota de SLE não definido (H-24); filtro de equipe pela tabela de times.
const AGORA = new Date('2026-10-10T15:00:00Z');
const seed = gerarBaseMock({ escala: 0.25 });
const REAL = montarEsquemas('r_');
const SEED = montarEsquemas();
const t = (iso: string): number => Date.parse(iso);

const card = (id: string, tipo: string | null, extra: Partial<LinhaCard> = {}): LinhaCard => ({
  card_id: id, tipo, classe_servico: null, sistema: null, area_solicitante: null, fornecedor: null, objetivo_estrategico: null, card_pai: null,
  criado_em: new Date('2026-09-01T12:00:00Z'), comprometido_em: new Date('2026-09-02T12:00:00Z'), iniciado_em: new Date('2026-09-03T12:00:00Z'),
  concluido_em: null, arquivado_em: null, motivo_descarte: null, tamanho_declarado: null, titulo: 'Card de teste', granularidade: 'story',
  equipe: 'Time A', quadro_id: '35', coluna_atual_id: '3', excluido_em: null, eh_subtarefa: false, data_acordada: null,
  responsabilidade_atraso: null, origem_demanda: null, fase_deteccao: null, severidade: null, origem_bug: null, adicionado_apos_inicio_pai: false,
  ...extra,
});
const col = (id: string, nome: string, tipo: string, papel: string, ordem: number, limite: number, equipe: string | null = 'Time A'): LinhaColunaReal =>
  ({ quadro_id: '35', coluna_id: id, nome, tipo_coluna: tipo, papel, ordem, limite_wip: limite, equipe });
const COLUNAS = [
  col('1', 'Backlog', 'fila', 'backlog', 1, 0), col('2', 'Pronto', 'fila', 'compromisso', 2, 0),
  col('3', 'Em desenvolvimento', 'execucao', 'trabalho', 3, 3), col('4', 'Entregue', 'execucao', 'entrega', 4, 0),
];
const VERSOES = COLUNAS.map((c) => ({ quadro_id: '35', coluna_id: c.coluna_id, tipo_coluna: c.tipo_coluna, vigente_de: '2020-01-01', vigente_ate: null, motivo: 'carga_inicial' }));
/** Transições como o fato as gravou: o `tipo_coluna` do fato fica nulo (auditoria) e o tipo vem da versão da coluna. */
const tr = (id: string, de: string | null, para: string, iso: string): LinhaTransicao =>
  ({ card_id: id, quadro_id: '35', coluna_origem_id: de, coluna_destino_id: para, tipo_coluna: null, direcao: 'avanco', ocorrido_em: t(iso) });

type OpcoesReal = { sle?: boolean; cards?: LinhaCard[] };
/** Banco falso de duas bases: o que é do schema `r_` é a base real mínima; o resto é o seed do mock (schemas sem prefixo). */
function banco(o: OpcoesReal = {}): Respondedor {
  const doSeed = bancoDoMock(seed);
  const cards = o.cards ?? [card('A', 'Bug interno'), card('B', 'Trabalho de produto', { granularidade: 'story' })];
  return (c: Chamada) => {
    const x = c.texto;
    if (!x.includes('r_dspd')) return doSeed(c);
    if (x.includes('FROM r_dspd_bm.dim_card')) return cards;
    if (x.includes('vw_transicao_canonica')) return cards.flatMap((k) => [tr(k.card_id, null, '1', '2026-09-01T12:00:00Z'), tr(k.card_id, '1', '2', '2026-09-02T12:00:00Z'), tr(k.card_id, '2', '3', '2026-09-03T12:00:00Z')]);
    if (x.includes('FROM r_dspd_bm.ref_coluna c')) return COLUNAS;
    if (x.includes('FROM r_dspd_bm.ref_coluna')) return VERSOES;
    if (x.includes('FROM r_dspd_bm.ref_time')) return [{ nome: 'Time A' }];
    if (x.includes('.ctl_coleta')) return [{ coleta_id: '9', finalizado_em: new Date('2026-10-09T12:00:00Z') }];
    if (x.includes('FROM r_dspd_core.ref_versao_criterio v')) return [];
    if (x.includes('FROM r_dspd_core.ref_versao_criterio')) return [{ versao_id: '1' }];
    if (x.includes('ref_sle')) return o.sle === true ? [{ classe: 'Padrão', valor: '5', desde: '2026-01-01' }] : [];
    return [];
  };
}
const leituras = (chamadas: Chamada[], tabela: RegExp): number => chamadas.filter((c) => tabela.test(c.texto)).length;
const NA_REAL = /FROM r_dspd_bm\.dim_card/;
const NO_SEED = /FROM dspd_bm\.dim_card/;

async function montar(o: OpcoesReal = {}, extra: { linhas?: string[] } = {}) {
  const d = criarDublePg(banco(o));
  const app = await buildApp({
    db: d.pool, S: REAL, SMock: SEED, agora: () => AGORA, nivelLog: extra.linhas ? 'warn' : 'silent',
    ...(extra.linhas ? { destinoLog: { write: (m: string) => { extra.linhas!.push(m); } } } : {}),
  });
  return { app, d };
}

describe('F6: cada métrica vem inteira de uma base (origem do contrato)', () => {
  it('métrica real lê só a base real; métrica fictícia lê só a base do seed; nunca as duas', async () => {
    const real = await montar();
    const r = await real.app.inject('/api/v1/metricas/O1');
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-data-referencia']).toBe('2026-10-09');
    expect(leituras(real.d.chamadas, NA_REAL)).toBe(1);
    expect(leituras(real.d.chamadas, NO_SEED)).toBe(0);

    const mock = await montar();
    const m = await mock.app.inject('/api/v1/metricas/O8');
    expect(m.statusCode).toBe(200);
    expect(leituras(mock.d.chamadas, NO_SEED)).toBe(1);
    expect(leituras(mock.d.chamadas, NA_REAL)).toBe(0);
  });

  it('as origens do mapa decidem: O1 a O13 (e EI_FL1) reais; O8, O12, O14 a O18, FL2, FL3 e Sustentação no seed', async () => {
    const { app, d } = await montar({ sle: true });
    for (const id of ['O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O9', 'O10', 'O11', 'O13', 'EI_FL1'] as MetricaId[]) {
      const r = await app.inject(`/api/v1/metricas/${id}`);
      expect(r.statusCode, id).toBe(200);
      expect(SCHEMAS_RESULTADO[id].safeParse(r.json()).success, id).toBe(true);
    }
    expect(leituras(d.chamadas, NO_SEED)).toBe(0);
    for (const id of ['O8', 'O12', 'O14', 'O19', 'T1', 'E1', 'S1', 'VISAO_GERAL'] as MetricaId[]) {
      expect(origemDaMetrica(id), id).toBe('mock');
      expect((await app.inject(`/api/v1/metricas/${id}`)).statusCode, id).toBe(200);
    }
    expect(leituras(d.chamadas, NO_SEED)).toBe(1);
  }, 60_000);

  it('o aquecimento carrega a base de cada origem uma vez e depois nenhuma métrica volta ao banco', async () => {
    const d = criarDublePg(banco({ sle: true }));
    const app = await buildApp({ db: d.pool, S: REAL, SMock: SEED, agora: () => AGORA, nivelLog: 'silent', aquecer: true });
    await app.ready();
    const aposSubir = d.chamadas.length;
    for (const id of METRICA_IDS.filter((m) => origemDaMetrica(m) === 'real')) expect((await app.inject(`/api/v1/metricas/${id}`)).statusCode, id).toBe(200);
    expect(d.chamadas.length).toBe(aposSubir);
    expect(leituras(d.chamadas, NA_REAL)).toBe(1);
  }, 60_000);

  it('sem base do seed (base única) a regra de sempre: lê S e usa as colunas e a lista de equipes antigas', async () => {
    const d = criarDublePg(bancoDoMock(seed));
    const app = await buildApp({ db: d.pool, agora: () => AGORA, nivelLog: 'silent' });
    expect((await app.inject('/api/v1/metricas/O1')).statusCode).toBe(200);
    expect(d.chamadas.some((c) => c.texto.includes('ref_time'))).toBe(false);
  });
});

describe('F6: tipo do card, tipo da coluna na leitura e O1 pelo limite da coluna', () => {
  it('a coluna sem tipo no fato ganha o tipo da versão vigente e o card entra no WIP; O1 mostra o limite da coluna e o do time', async () => {
    const { app } = await montar();
    const r = (await app.inject('/api/v1/metricas/O1?equipe=time-a')).json() as { hoje: { total: number; limite: number }; porColuna: { coluna: string; itens: number; limite: number | null }[] };
    expect(r.hoje).toMatchObject({ total: 2, limite: 3 });
    expect(r.porColuna).toEqual([{ coluna: 'Em desenvolvimento', tipoColuna: 'execucao', itens: 2, bloqueados: 0, limite: 3 }]);
  });

  it('sem coluna com limite (0), o O1 mostra o WIP sem limite', async () => {
    const d = criarDublePg((c) => (/FROM r_dspd_bm\.ref_coluna c/.test(c.texto) ? COLUNAS.map((k) => ({ ...k, limite_wip: 0 })) : banco()(c)));
    const app = await buildApp({ db: d.pool, S: REAL, SMock: SEED, agora: () => AGORA, nivelLog: 'silent' });
    const r = (await app.inject('/api/v1/metricas/O1?equipe=time-a')).json() as { hoje: { limite: number; acimaDoLimite: number }; statusMeta: string; porColuna: { limite: number | null }[] };
    expect(r.hoje).toMatchObject({ limite: 0, acimaDoLimite: 0 });
    expect(r.statusMeta).toBe('sem-referencia');
    expect(r.porColuna[0]!.limite).toBeNull();
  });

  it('card com tipo fora de TIPOS_CARD fica fora do contexto e o log leva só a contagem', async () => {
    const linhas: string[] = [];
    // a transição do card sem quadro usa o quadro dele (nenhum), sem erro
    const { app } = await montar({ cards: [card('A', 'Bug interno'), card('S', 'Sprint'), card('N', null), card('Z', 'Melhoria', { quadro_id: null })] }, { linhas });
    const r = (await app.inject('/api/v1/metricas/O1?equipe=time-a')).json() as { hoje: { total: number } };
    expect(r.hoje.total).toBe(1); // o card sem quadro não casa coluna nenhuma (sem papel conhecido, não se infere)
    const aviso = linhas.map((l) => JSON.parse(l) as Record<string, unknown>).find((l) => l.cardsForaDoContrato !== undefined);
    expect(aviso).toMatchObject({ cardsForaDoContrato: 2 });
    expect(JSON.stringify(aviso)).not.toContain('Sprint');
  });

  it('o serviço sozinho (sem log) também deixa o card fora, sem erro', async () => {
    const d = criarDublePg(banco({ cards: [card('S', 'Sprint')] }));
    const s = new ServicoMetricas({ db: d.pool, S: REAL, SMock: SEED });
    const r = await s.calcular('O1', { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }, {}, AGORA);
    expect((r.resultado as { hoje: { total: number } }).hoje.total).toBe(0);
  });
});

describe('F6: O3 e a nota de SLE não definido (H-24)', () => {
  it('sem SLE na base real, o O3 sai com os percentis e a nota; com SLE, sem nota; na origem fictícia nunca', async () => {
    const sem = await montar();
    const a = (await sem.app.inject('/api/v1/metricas/O3')).json() as { notas?: string[] };
    expect(a.notas).toEqual(['sle-nao-definido']);
    const com = await montar({ sle: true });
    expect((await com.app.inject('/api/v1/metricas/O3')).json()).not.toHaveProperty('notas');
    const base = criarDublePg(bancoDoMock(seed));
    const unica = await buildApp({ db: base.pool, agora: () => AGORA, nivelLog: 'silent' });
    expect((await unica.inject('/api/v1/metricas/O3')).json()).not.toHaveProperty('notas');
  });
});

describe('F6: filtro de equipe pela tabela de times (só filtro)', () => {
  it('base real lista os times ativos; base única mantém a lista antiga', async () => {
    const { app } = await montar();
    const r = (await app.inject('/api/v1/filtros/businessmap')).json() as { equipes: { id: string; nome: string }[]; tipos: { id: string }[] };
    expect(r.equipes).toEqual([{ id: 'time-a', nome: 'Time A' }]);
    expect(r.tipos.map((x) => x.id)).toContain('trabalho-produto');
    const base = criarDublePg(bancoDoMock(seed));
    const unica = await buildApp({ db: base.pool, agora: () => AGORA, nivelLog: 'silent' });
    const u = (await unica.inject('/api/v1/filtros/businessmap')).json() as { equipes: { id: string }[] };
    expect(u.equipes.length).toBe(seed.bm.config.equipes.length);
  });
});

describe('F6: mapa da base real', () => {
  const ref: RefBM = { equipes: ['Time A'], sistemas: [], limitesWip: [{ equipe: 'Time A', limite: 99 }], limiteFrentes: null, sle: [], alocacao: [], objetivos: [], areasInternas: [], fichas: [], criterios: [] };

  it('colunasDe: na base real limite 0 vira sem limite e a coluna leva o time; fora dela, nada muda', () => {
    const ls = [col('3', 'Dev', 'execucao', 'trabalho', 3, 0), col('4', 'Teste', 'execucao', 'trabalho', 4, 2, null), { ...col('5', 'Fim', 'execucao', 'entrega', 5, 0), equipe: undefined }];
    const real = colunasDe(ls as LinhaColunaReal[], true);
    expect(real.map((c) => [c.limite_wip, c.equipe])).toEqual([[null, 'Time A'], [2, undefined], [null, undefined]]);
    expect(colunasDe(ls as LinhaColunaReal[]).map((c) => [c.limite_wip, c.equipe])).toEqual([[0, undefined], [2, undefined], [0, undefined]]);
  });

  it('limitesDosTimes soma só os limites positivos das colunas de trabalho e homologação de cada time', () => {
    const c = (equipe: string | undefined, papel: string, limite: number | null) => ({ quadro_id: 'q', coluna: 'x', tipo_coluna: 'fila' as const, papel: papel as 'trabalho', ordem: 1, limite_wip: limite, ...(equipe === undefined ? {} : { equipe }) });
    expect(limitesDosTimes([c('A', 'trabalho', 2), c('A', 'homologacao', 3), c('A', 'backlog', 9), c('A', 'trabalho', null), c('A', 'trabalho', 0), c(undefined, 'trabalho', 4), c('B', 'trabalho', 1)])).toEqual({ A: 5, B: 1 });
  });

  it('configBM só usa as colunas e marca limite por coluna na base real', () => {
    expect(configBM(ref).limite_wip_fluxo).toEqual({ 'Time A': 99 });
    expect(configBM(ref).limite_wip_por_coluna).toBeUndefined();
    const cfg = configBM(ref, colunasDe([col('3', 'Dev', 'execucao', 'trabalho', 3, 4)], true));
    expect(cfg).toMatchObject({ limite_wip_fluxo: { 'Time A': 4 }, limite_wip_por_coluna: true });
  });

  it('montarBaseBM descarta tipo fora do contrato e conta, sem exigir o aviso', () => {
    const base = { cards: [card('A', 'Melhoria'), card('B', 'Sprint'), card('C', null)], transicoes: [], bloqueios: [], colunas: COLUNAS, ref };
    let n = 0;
    expect(montarBaseBM(base, { aoDescartarTipo: (q) => { n = q; } }).cards.map((c) => c.card_id)).toEqual(['A']);
    expect(n).toBe(2);
    expect(montarBaseBM(base).cards).toHaveLength(1);
    n = 0;
    montarBaseBM({ ...base, cards: [card('A', 'Melhoria')] }, { aoDescartarTipo: (q) => { n = q; } });
    expect(n).toBe(0);
  });
});
