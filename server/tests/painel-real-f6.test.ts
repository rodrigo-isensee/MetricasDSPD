import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao';
import { METRICA_IDS, MOTIVOS_BLOQUEIO, MOTIVO_ALVOS_NAO_CARREGADOS, MOTIVO_ESCALA_NAO_PROJETADA, MOTIVO_FLUXOS_PROC_NAO_CARREGADOS, origemDaMetrica, type MetricaId } from '@metricas-dspd/contratos';
import { gerarBaseMock } from '@metricas-dspd/mock';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { ServicoMetricas } from '../src/modulos/metricas/index.js';
import { colunasDe, configBM, limitesDosTimes, montarBaseBM, type RefBM } from '../src/modulos/metricas/mapa.js';
import type { LinhaBloqueio, LinhaCard, LinhaChamado, LinhaColunaReal, LinhaEtapa, LinhaTransicao } from '../src/modulos/metricas/repositorio.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg, type Chamada, type Respondedor } from './duble-pg.js';

// F6 do plano 052 (E2.69) e pedido 060 (P2 e P3): a API lê só a base real; o mapa de origem do contrato é um portão (métrica fora dele responde
// "sem dado real" sem ler nada); tipo da coluna resolvido na leitura (A4); O1 contra o limite da coluna (H-12); O3 com nota de SLE não
// definido (H-24); filtro de equipe pela tabela de times.
const AGORA = new Date('2026-10-10T15:00:00Z');
const seed = gerarBaseMock({ escala: 0.25 });
const REAL = montarEsquemas('r_');
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

/** Chamado da base real do Acelerato (E2.115): incidente aberto em setembro, com agente, prioridade P3; só o que a regra de leitura exige. */
const chamado = (id: string, extra: Partial<LinhaChamado> = {}): LinhaChamado => ({
  chamado_id: id, natureza: 'incidente', equipe: 'SSSC TOTVS', organizacao: 'Org', tipo: 'Incidente', categoria_sistema: 'Protheus', excluido: false,
  status: 'Encerrado', impacto: null, urgencia: null, prioridade: 'P3', prioridade_ajustada_manualmente: false, justificativa_informada: false,
  aberto_em: new Date('2026-09-20T12:00:00Z'), primeiro_atendimento_em: null, restaurado_em: null, data_finalizado: null, status_sla_r: null,
  status_sla_pa: null, motivo_escalacao: null, motivo_pendencia_atual: null, previsao_retorno: null, motivo_encerramento: null,
  avaliacao_problema: null, excecao_sla_registro_posterior: false, incidente_critico_coordenado: false, nivel_resolucao: null,
  com_agente: true, reincidente_90d: 'nao', escala_p: true, ...extra,
});


/** Alvos de prioridade do PROC (`ref_alvo_prioridade`, D3): P1 e o primeiro atendimento do P2 em tempo corrido, o resto em tempo útil. */
const ALVOS = [
  ['P1', '0.25', 'corrido', '4', 'corrido', 'min', 'h'], ['P2', '0.5', 'corrido', '8', 'util', 'min', 'h'], ['P3', '2', 'util', '17.6', 'util', 'h', 'dia'],
  ['P4', '4', 'util', '44', 'util', 'h', 'dia'], ['P5', '8.8', 'util', '88', 'util', 'dia', 'dia'],
].map(([prioridade, pa, upa, r, ur, epa, er]) => ({ prioridade, prazo_pa_horas: pa, unidade_pa: upa, prazo_r_horas: r, unidade_r: ur, exibir_pa: epa, exibir_r: er }));

type OpcoesReal = { sle?: boolean; cards?: LinhaCard[]; chamados?: LinhaChamado[]; bloqueios?: LinhaBloqueio[]; coleta?: string; semAlvos?: boolean; fluxosProc?: string[]; etapas?: LinhaEtapa[]; entregues?: boolean | string[] };
/** Banco falso: o que é do schema `r_` é a base real mínima; qualquer leitura fora dele cairia no seed do mock (schemas sem prefixo), e os testes provam que não cai. */
function banco(o: OpcoesReal = {}): Respondedor {
  const doSeed = bancoDoMock(seed);
  const cards = o.cards ?? [card('A', 'Bug interno'), card('B', 'Trabalho de produto', { granularidade: 'story' })];
  return (c: Chamada) => {
    const x = c.texto;
    if (!x.includes('r_dspd')) return doSeed(c);
    if (x.includes('FROM r_dspd_ac.dim_chamado')) return o.chamados ?? [];
    if (x.includes('FROM r_dspd_ac.fato_etapa_chamado')) return o.etapas ?? [];
    if (x.includes('FROM r_dspd_ac.ref_dominio') && x.includes("'fluxo_proc'")) return (o.fluxosProc ?? []).map((codigo) => ({ codigo }));
    if (x.includes('FROM r_dspd_ac.ref_alvo_prioridade')) return o.semAlvos === true ? [] : ALVOS;
    if (x.includes('FROM r_dspd_bm.dim_card')) return cards;
    if (x.includes('vw_transicao_canonica')) return cards.flatMap((k) => [tr(k.card_id, null, '1', '2026-09-01T12:00:00Z'), tr(k.card_id, '1', '2', '2026-09-02T12:00:00Z'), tr(k.card_id, '2', '3', '2026-09-03T12:00:00Z'), ...(o.entregues === true ? [tr(k.card_id, '3', '4', '2026-09-08T12:00:00Z')] : Array.isArray(o.entregues) && o.entregues.includes(k.card_id) ? [tr(k.card_id, '3', '4', '2026-09-20T12:00:00Z')] : [])]);
    if (x.includes('FROM r_dspd_bm.ref_coluna c')) return COLUNAS;
    if (x.includes('FROM r_dspd_bm.ref_coluna')) return VERSOES;
    if (x.includes('FROM r_dspd_bm.ref_time')) return [{ nome: 'Time A' }];
    if (x.includes('FROM r_dspd_bm.fato_bloqueio')) return o.bloqueios ?? [];
    if (x.includes('.ctl_coleta')) return [{ coleta_id: '9', finalizado_em: new Date(o.coleta ?? '2026-10-09T12:00:00Z') }];
    if (x.includes('FROM r_dspd_core.ref_versao_criterio v')) return [];
    if (x.includes('FROM r_dspd_core.ref_versao_criterio')) return [{ versao_id: '1' }];
    if (x.includes('ref_sle')) return o.sle === true ? [{ classe: 'Média', valor: '5', desde: '2026-01-01' }] : [];
    return [];
  };
}
const leituras = (chamadas: Chamada[], tabela: RegExp): number => chamadas.filter((c) => tabela.test(c.texto)).length;
const NA_REAL = /FROM r_dspd_bm\.dim_card/;
const NO_SEED = /FROM dspd_bm\.dim_card/;
const AC_REAL = /FROM r_dspd_ac\.dim_chamado/;
const AC_SEED = /FROM dspd_ac\.dim_chamado/;

async function montar(o: OpcoesReal = {}, extra: { linhas?: string[] } = {}) {
  const d = criarDublePg(banco(o));
  const app = await buildApp({
    db: d.pool, S: REAL, agora: () => AGORA, nivelLog: extra.linhas ? 'warn' : 'silent',
    ...(extra.linhas ? { destinoLog: { write: (m: string) => { extra.linhas!.push(m); } } } : {}),
  });
  return { app, d };
}

describe('pedido 105 (E7.64): T11 com dado real pelo dim_card', () => {
  const demandas = (n: number, extra: Partial<LinhaCard> = {}): LinhaCard[] =>
    Array.from({ length: n }, (_, i) => card(`D${i}`, 'Melhoria', { criado_em: new Date(`2026-08-${String((i % 27) + 1).padStart(2, '0')}T12:00:00Z`), ...extra }));
  type R = { base: { n: number }; anos: { ano: number; meses: { mes: number; entradas: number | null }[] }[]; mediaMensal: number | null };
  const t11 = async (cards: LinhaCard[]) => {
    const { app, d } = await montar({ cards });
    const r = await app.inject('/api/v1/metricas/T11');
    expect(r.statusCode).toBe(200);
    return { r, j: r.json() as R, d };
  };

  it('T11 está no mapa real, lê só a base real e passa no schema', async () => {
    expect(origemDaMetrica('T11')).toBe('real');
    const { r, j, d } = await t11(demandas(20));
    expect(r.headers['x-estado-dado']).toBeUndefined();
    expect(SCHEMAS_RESULTADO.T11.safeParse(j).success).toBe(true);
    expect(leituras(d.chamadas, NO_SEED)).toBe(0);
    expect(j.anos.find((a) => a.ano === 2026)?.meses.find((m) => m.mes === 8)?.entradas).toBe(20);
  });

  it('fronteira 19 e 20: com 19 demandas não publica (vazio, n = 19); com 20 publica', async () => {
    const com19 = (await t11(demandas(19))).j;
    expect(com19.anos).toEqual([]);
    expect(com19.mediaMensal).toBeNull();
    expect(com19.base.n).toBe(19);
    expect((await t11(demandas(20))).j.base.n).toBe(20);
  });

  it('a regra de chegada é a do T4 e do O7: Bug interno, frente, projeto e subtarefa e excluído ficam fora; arquivado entra', async () => {
    const cards = [
      ...demandas(18),
      card('ARQ', 'Melhoria', { arquivado_em: new Date('2026-09-05T12:00:00Z') }),
      card('EXC', 'Melhoria', { excluido_em: new Date('2026-09-05T12:00:00Z') }),
      card('NOVA', 'Defeito em produção'),
      card('BUG', 'Bug interno'),
      card('FRE', 'Melhoria', { granularidade: 'frente' }),
      card('PRJ', 'Melhoria', { granularidade: 'projeto' }),
      card('SUB', 'Melhoria', { eh_subtarefa: true }),
    ];
    // 18 + ARQ + NOVA = 20; o EXC (excluído, não entregue) não conta, como no O7 e no T4.
    const { j } = await t11(cards);
    expect(j.base.n).toBe(20);
    const semExcluido = (await t11(cards.filter((c) => c.card_id !== 'ARQ'))).j;
    expect(semExcluido.base.n).toBe(19);
  });
});

describe('pedido 060 (P2 e P3): a API lê só a base real e o mapa de origem é um portão', () => {
  it('métrica real lê só a base real; métrica fora do mapa responde "sem dado real" sem ler base nenhuma', async () => {
    const real = await montar();
    const r = await real.app.inject('/api/v1/metricas/O1');
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-data-referencia']).toBe('2026-10-09');
    expect(leituras(real.d.chamadas, NA_REAL)).toBe(1);
    expect(leituras(real.d.chamadas, NO_SEED)).toBe(0);

    const fora = await montar();
    const m = await fora.app.inject('/api/v1/metricas/O14');
    expect(m.statusCode).toBe(200);
    expect(m.headers['x-estado-dado']).toBe('sem-dado-real');
    expect(m.json()).toEqual({ estado: 'sem-dado-real', metrica: 'O14', motivo: 'aguardando campo no quadro' });
    expect(fora.d.chamadas).toHaveLength(0);
  });

  it('as origens do mapa decidem: as reais calculam na base real; as demais respondem sem dado real, sem nenhuma leitura de seed', async () => {
    const { app, d } = await montar({ sle: true });
    for (const id of ['O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O8', 'O9', 'O10', 'O11', 'O13', 'O19', 'O21', 'O25', 'T10', 'BLOQUEADOS', 'EI_FL1', 'S1'] as MetricaId[]) {
      const r = await app.inject(`/api/v1/metricas/${id}`);
      expect(r.statusCode, id).toBe(200);
      expect(r.headers['x-estado-dado'], id).toBeUndefined();
      expect(SCHEMAS_RESULTADO[id].safeParse(r.json()).success, id).toBe(true);
    }
    expect(leituras(d.chamadas, NO_SEED)).toBe(0);
    const antes = d.chamadas.length;
    for (const id of ['T12', 'O14', 'O26', 'T3', 'E1', 'VISAO_GERAL'] as MetricaId[]) {
      expect(origemDaMetrica(id), id).toBe('sem-dado');
      const r = await app.inject(`/api/v1/metricas/${id}`);
      expect(r.statusCode, id).toBe(200);
      expect(r.json(), id).toMatchObject({ estado: 'sem-dado-real', metrica: id });
    }
    expect(d.chamadas.length).toBe(antes);
    expect(leituras(d.chamadas, NO_SEED)).toBe(0);
  }, 60_000);

  it('a VISAO_GERAL responde "sem dado real" com o motivo, nunca o 503 de referência ausente, mesmo sem alvos de prioridade', async () => {
    const { app } = await montar({ chamados: [] });
    const r = await app.inject('/api/v1/metricas/VISAO_GERAL');
    expect(r.statusCode).toBe(200);
    expect(r.json()).toEqual({ estado: 'sem-dado-real', metrica: 'VISAO_GERAL', motivo: 'fonte real ainda não definida' });
  });

  it('T-S1: toda métrica fora do mapa real responde 200 sem número e sem simulavel; a real não tem estado nem simulavel', async () => {
    const { app } = await montar({ sle: true });
    for (const id of METRICA_IDS.filter((m) => origemDaMetrica(m) !== 'real')) {
      const r = await app.inject(`/api/v1/metricas/${id}`);
      expect(r.statusCode, id).toBe(200);
      const corpo = r.json();
      expect(Object.keys(corpo).sort(), id).toEqual(['estado', 'metrica', 'motivo']);
    }
    for (const id of ['O3', 'O4'] as MetricaId[]) {
      const corpo = (await app.inject(`/api/v1/metricas/${id}`)).json();
      expect(corpo, id).not.toHaveProperty('estado');
      expect(corpo, id).not.toHaveProperty('simulavel');
    }
  }, 60_000);

  it('o estado "sem dado real" leva cache e ETag como as demais, a data pedida vale e data futura segue 400 (nada é lido)', async () => {
    const { app, d } = await montar();
    const r = await app.inject('/api/v1/metricas/T3?dataReferencia=2026-10-01');
    expect(r.statusCode).toBe(200);
    expect(r.headers['cache-control']).toBe('private, max-age=60');
    expect(r.headers['x-data-referencia']).toBe('2026-10-01');
    expect(r.headers['x-versao-criterio']).toBe('0');
    const etag = String(r.headers.etag);
    expect((await app.inject({ url: '/api/v1/metricas/T3?dataReferencia=2026-10-01', headers: { 'if-none-match': etag } })).statusCode).toBe(304);
    expect((await app.inject('/api/v1/metricas/T3?dataReferencia=2026-10-11')).statusCode).toBe(400);
    expect(d.chamadas).toHaveLength(0);
  });

  it('toda métrica fora do mapa real tem motivo e nenhuma carrega número (ids do contrato inteiros)', async () => {
    const { app, d } = await montar();
    const fora = METRICA_IDS.filter((id) => origemDaMetrica(id) !== 'real');
    expect(fora.length).toBeGreaterThan(0);
    for (const id of fora) {
      const r = await app.inject(`/api/v1/metricas/${id}`);
      expect(r.statusCode, id).toBe(200);
      const j = r.json() as { estado: string; motivo: string };
      expect(Object.keys(j).sort(), id).toEqual(['estado', 'metrica', 'motivo']);
      expect(j.motivo.length, id).toBeGreaterThan(0);
    }
    expect(d.chamadas).toHaveLength(0);
  }, 60_000);

  it('sustentação (E2.115): S1 (D4), S2, S3, S4, S8, S9, S10 e S12 leem só a base real do Acelerato; EI_SUST (pedido 105, E7.243) é real; S5, S6, S7 e S11 são reais, mas sem os fluxos do PROC carregados respondem sem dado real com o motivo; nunca o seed', async () => {
    const { app, d } = await montar({ chamados: [chamado('1', { reincidente_90d: 'sim' }), chamado('2'), chamado('3', { reincidente_90d: 'sem_resposta' })] });
    for (const id of ['S1', 'S2', 'S3', 'S4', 'S8', 'S9', 'S10', 'S12'] as MetricaId[]) {
      expect(origemDaMetrica(id), id).toBe('real');
      const r = await app.inject(`/api/v1/metricas/${id}`);
      expect(r.statusCode, id).toBe(200);
      expect(SCHEMAS_RESULTADO[id].safeParse(r.json()).success, id).toBe(true);
    }
    expect(leituras(d.chamadas, AC_REAL)).toBe(1);
    expect(leituras(d.chamadas, AC_SEED)).toBe(0);
    expect(leituras(d.chamadas, NO_SEED)).toBe(0);
    expect(leituras(d.chamadas, NA_REAL)).toBe(0); // sustentação não lê o BusinessMap (domínios separados)
    for (const id of ['S5', 'S6', 'S7', 'S11'] as MetricaId[]) {
      expect(origemDaMetrica(id), id).toBe('real');
      const r = await app.inject(`/api/v1/metricas/${id}`);
      expect(r.statusCode, id).toBe(200);
      expect(r.json(), id).toEqual({ estado: 'sem-dado-real', metrica: id, motivo: MOTIVO_FLUXOS_PROC_NAO_CARREGADOS });
    }
    for (const id of ['EI_SUST'] as MetricaId[]) {
      expect(origemDaMetrica(id), id).toBe('real');
      const r = await app.inject(`/api/v1/metricas/${id}`);
      expect(r.statusCode, id).toBe(200);
      expect(r.json(), id).not.toHaveProperty('estado');
      expect(SCHEMAS_RESULTADO[id].safeParse(r.json()).success, id).toBe(true);
    }
    expect(leituras(d.chamadas, AC_SEED)).toBe(0);
    expect(leituras(d.chamadas, AC_REAL)).toBe(1);
  }, 60_000);

  it('S8 na base real usa o campo dos 90 dias da coleta (nunca o mock): cobertura e reabertura vêm dos chamados reais', async () => {
    const { app } = await montar({ chamados: [chamado('1', { reincidente_90d: 'sim' }), chamado('2'), chamado('3', { reincidente_90d: 'sem_resposta' })] });
    const r = (await app.inject('/api/v1/metricas/S8')).json() as { campoDisponivel: boolean; cobertura: { n: number; total: number } };
    expect(r.campoDisponivel).toBe(true);
    expect(r.cobertura).toEqual({ n: 2, total: 3 }); // o sem_resposta sai (066)
  });

  it('S8 na base real sem nenhum chamado com o campo projetado sai "sem campo", nunca 0%', async () => {
    const { app } = await montar({ chamados: [chamado('1', { reincidente_90d: null }), chamado('2', { reincidente_90d: null })] });
    const r = (await app.inject('/api/v1/metricas/S8')).json() as { campoDisponivel: boolean };
    expect(r.campoDisponivel).toBe(false);
  });

  it('o aquecimento carrega a base real uma vez, não toca métrica fora do mapa e depois nenhuma métrica volta ao banco', async () => {
    const d = criarDublePg(banco({ sle: true }));
    const app = await buildApp({ db: d.pool, S: REAL, agora: () => AGORA, nivelLog: 'silent', aquecer: true });
    await app.ready();
    const aposSubir = d.chamadas.length;
    expect(leituras(d.chamadas, NO_SEED) + leituras(d.chamadas, AC_SEED)).toBe(0);
    for (const id of METRICA_IDS.filter((m) => origemDaMetrica(m) === 'real' && m !== 'PV1')) expect((await app.inject(`/api/v1/metricas/${id}`)).statusCode, id).toBe(200);
    expect(d.chamadas.length).toBe(aposSubir);
    expect(leituras(d.chamadas, NA_REAL)).toBe(1);
  }, 60_000);

  it('modo mock explícito (só testes e homologação): lê S como seed, sem o portão do mapa, com as colunas e a lista de equipes antigas, e marca o selo no cabeçalho', async () => {
    const d = criarDublePg(bancoDoMock(seed));
    const app = await buildApp({ modoMock: true, db: d.pool, agora: () => AGORA, nivelLog: 'silent' });
    const r = await app.inject('/api/v1/metricas/O1');
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-dados-ficticios']).toBe('1');
    const fora = await app.inject('/api/v1/metricas/O14');
    expect(fora.statusCode).toBe(200);
    expect(fora.json()).not.toHaveProperty('estado');
    expect(d.chamadas.some((c) => c.texto.includes('ref_time'))).toBe(false);
  });

  it('sem o modo mock a resposta não leva o selo de dados fictícios', async () => {
    const { app } = await montar();
    expect((await app.inject('/api/v1/metricas/O1')).headers['x-dados-ficticios']).toBeUndefined();
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
    const app = await buildApp({ db: d.pool, S: REAL, agora: () => AGORA, nivelLog: 'silent' });
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
    const s = new ServicoMetricas({ db: d.pool, S: REAL });
    const r = await s.calcular('O1', { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }, {}, AGORA);
    expect((r.resultado as { hoje: { total: number } }).hoje.total).toBe(0);
  });
});

describe('F6: O3 e a nota de SLE não definido (H-24)', () => {
  it('sem SLE na base real, o O3 sai com os percentis e a nota; com SLE, sem nota; no modo mock nunca', async () => {
    const sem = await montar();
    const a = (await sem.app.inject('/api/v1/metricas/O3')).json() as { notas?: string[] };
    expect(a.notas).toEqual(['sle-nao-definido']);
    const com = await montar({ sle: true });
    expect((await com.app.inject('/api/v1/metricas/O3')).json()).not.toHaveProperty('notas');
    const base = criarDublePg(bancoDoMock(seed));
    const unica = await buildApp({ modoMock: true, db: base.pool, agora: () => AGORA, nivelLog: 'silent' });
    expect((await unica.inject('/api/v1/metricas/O3')).json()).not.toHaveProperty('notas');
  });
});

describe('F6: filtro de equipe pela tabela de times (só filtro)', () => {
  it('base real lista os times ativos; o modo mock mantém a lista antiga', async () => {
    const { app } = await montar();
    const r = (await app.inject('/api/v1/filtros/businessmap')).json() as { equipes: { id: string; nome: string }[]; tipos: { id: string }[] };
    expect(r.equipes).toEqual([{ id: 'time-a', nome: 'Time A' }]);
    expect(r.tipos.map((x) => x.id)).toContain('trabalho-produto');
    const base = criarDublePg(bancoDoMock(seed));
    const unica = await buildApp({ modoMock: true, db: base.pool, agora: () => AGORA, nivelLog: 'silent' });
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

// Pedido 075, lote 6b (K-204): BLOQUEADOS, O1, O2, O5 e O19 com dado real de `fato_bloqueio` (antes, pedido 065: sem dado real, null com nota).
describe('pedido 075 6b: bloqueios com dado real na base real', () => {
  afterEach(() => { vi.doUnmock('@metricas-dspd/contratos'); vi.resetModules(); });
  const mock = async () => buildApp({ modoMock: true, db: criarDublePg(bancoDoMock(seed)).pool, agora: () => AGORA, nivelLog: 'silent' });
  const NOTA = 'bloqueio-sem-dado-real';
  const PESSOA_BASE = /respons[aá]vel|usu[aá]rio|pessoa|autor|owner|assignee|agente|e-?mail|ranking|bloquead[oa]s?[ _-]?por|blocked[ _-]?by|coment[aá]rio|comment|observa[cç]|observation|user[ _-]?id|motivo[ _-]?texto/i; // K-267: + "bloqueado por", "comentário" e "observação" (075, T2/T3); A2: + `user_id`/`userId` (T2) e `motivo_texto` (T3); 'equipe' fica de fora: `equipesConsideradas` é eco do filtro, não pessoa
  // A1: "quem" só como palavra inteira (início, depois de separador, ou `Quem` após minúscula em camelCase); nunca dentro de "esquema". Sem flag `i`, para distinguir a maiúscula do camelCase.
  const QUEM = /(?:^|[^A-Za-z])[Qq]uem(?![a-z])|(?<=[a-z])Quem(?![a-z])/;
  const PESSOA = { test: (k: string): boolean => PESSOA_BASE.test(k) || QUEM.test(k) };
  const bloq = (id: string, motivo: string, inicio: string, fim: string | null, horas: string | null): LinhaBloqueio =>
    ({ card_id: id, motivo, coluna_em_que_bloqueou: '3', fornecedor: null, inicio: new Date(inicio), fim: fim === null ? null : new Date(fim), duracao_horas_uteis: horas });
  const BLOQUEIOS = [
    bloq('A', MOTIVOS_BLOQUEIO[0], '2026-09-10T12:00:00Z', '2026-09-12T12:00:00Z', '16'),
    bloq('B', 'não classificado', '2026-09-20T12:00:00Z', null, null),
  ];
  const real = (o: OpcoesReal = {}) => montar({ ...o, cards: o.cards ?? [card('A', 'Bug interno'), card('B', 'Trabalho de produto')], bloqueios: o.bloqueios ?? BLOQUEIOS });
  /** Todas as chaves de um corpo JSON, em qualquer profundidade (CA-075-11: nenhuma de pessoa). */
  const chaves = (v: unknown): string[] =>
    Array.isArray(v) ? v.flatMap(chaves) : v !== null && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => [k, ...chaves(x)]) : [];

  it('S1: BLOQUEADOS responde com dado real (sem o estado), com o bloqueio aberto, e lê só a base real', async () => {
    const { app, d } = await real();
    const r = await app.inject('/api/v1/metricas/BLOQUEADOS');
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-estado-dado']).toBeUndefined();
    const j = r.json() as { estado?: string; itens: { cardId: string; motivo: string }[] };
    expect(j.estado).toBeUndefined();
    expect(j.itens.map((i) => [i.cardId, i.motivo])).toEqual([['B', 'não classificado']]);
    expect(SCHEMAS_RESULTADO.BLOQUEADOS.safeParse(j).success).toBe(true);
    expect(leituras(d.chamadas, /FROM r_dspd_bm\.fato_bloqueio/)).toBe(1);
    expect(leituras(d.chamadas, NO_SEED)).toBe(0);
  });

  it('S2: O1 real traz bloqueados numérico, sem a nota; a série só traz bloqueio a partir da data da versão de critério (antes, null)', async () => {
    const { app } = await real();
    const r = (await app.inject('/api/v1/metricas/O1')).json() as { notas?: string[]; hoje: { bloqueados: unknown }; serie: { data: string; bloqueados: unknown }[]; porTipoColuna: { bloqueados: unknown }[] };
    expect(r.notas ?? []).not.toContain(NOTA);
    expect(typeof r.hoje.bloqueados).toBe('number');
    for (const l of r.porTipoColuna) expect(typeof l.bloqueados).toBe('number');
    expect(SCHEMAS_RESULTADO.O1.safeParse(r).success).toBe(true);
    // Corte do 6a: a coleta é de 2026-10-09, antes de 2026-11-01; todo ponto da série é lacuna (nunca 0).
    expect(r.serie.length).toBeGreaterThan(0);
    for (const l of r.serie) expect(l.bloqueados, l.data).toBeNull();
  });

  it('S2b: com a coleta depois da data de critério, os pontos de 2026-11-01 em diante trazem número e os anteriores seguem null', async () => {
    const { app } = await real({ coleta: '2026-11-20T12:00:00Z' });
    const r = (await app.inject('/api/v1/metricas/O1')).json() as { serie: { data: string; bloqueados: unknown }[] };
    expect(r.serie.some((l) => l.data >= '2026-11-01')).toBe(true);
    expect(r.serie.some((l) => l.data < '2026-11-01')).toBe(true);
    for (const l of r.serie) {
      if (l.data < '2026-11-01') expect(l.bloqueados, l.data).toBeNull();
      else expect(typeof l.bloqueados, l.data).toBe('number');
    }
  });

  it('S3: O2 real sem a nota; os itens trazem o motivo do bloqueio aberto do card', async () => {
    const { app } = await real();
    const r = (await app.inject('/api/v1/metricas/O2')).json() as { notas?: string[]; itens: { cardId: string; bloqueioMotivo: unknown }[] };
    expect(r.notas ?? []).not.toContain(NOTA);
    expect(r.itens.find((i) => i.cardId === 'B')?.bloqueioMotivo).toBe('não classificado');
    expect(r.itens.find((i) => i.cardId === 'A')?.bloqueioMotivo).toBeNull(); // o bloqueio do A já fechou
    expect(SCHEMAS_RESULTADO.O2.safeParse(r).success).toBe(true);
  });

  it('S4: O5 real calcula (sem o estado) e, com menos de 20 itens por tipo, sai sem percentil (biblioteca)', async () => {
    const { app, d } = await real();
    const r = await app.inject('/api/v1/metricas/O5');
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-estado-dado']).toBeUndefined();
    const j = r.json() as { estado?: string; tipos: { n: number; estatistica: { status: string } }[] };
    expect(j.estado).toBeUndefined();
    expect(Array.isArray(j.tipos)).toBe(true);
    for (const t of j.tipos) {
      expect(t.n, 'poucos itens').toBeLessThan(20);
      expect(t.estatistica.status).toBe('insuficiente');
    }
    expect(SCHEMAS_RESULTADO.O5.safeParse(j).success).toBe(true);
    expect(leituras(d.chamadas, NO_SEED)).toBe(0);
  });

  it('S5: O19 real devolve os 12 motivos, "não classificado" por último; abaixo de 20 bloqueios por motivo sem percentil e sem percentual', async () => {
    const { app } = await real();
    const r = await app.inject('/api/v1/metricas/O19');
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-estado-dado']).toBeUndefined();
    const j = r.json() as { motivos: { motivo: string; bloqueios: number; pctDoTotal: { status: string }; duracao: { status: string } }[]; abertosForaDaSoma: number };
    expect(j.motivos.map((m) => m.motivo)).toEqual([...MOTIVOS_BLOQUEIO, 'não classificado']);
    expect(j.motivos.find((m) => m.motivo === MOTIVOS_BLOQUEIO[0])?.bloqueios).toBe(1);
    expect(j.abertosForaDaSoma).toBe(1);
    for (const m of j.motivos) {
      expect(m.bloqueios).toBeLessThan(20);
      expect(m.pctDoTotal.status, m.motivo).toBe('insuficiente');
      expect(m.duracao.status, m.motivo).toBe('insuficiente');
    }
    expect(SCHEMAS_RESULTADO.O19.safeParse(j).success).toBe(true);
  });

  it('S6: CA-075-11, nenhuma chave de pessoa nas respostas de BLOQUEADOS, O1, O2, O5 e O19 (o que a exportação leva)', async () => {
    const { app } = await real();
    for (const id of ['BLOQUEADOS', 'O1', 'O2', 'O5', 'O19']) {
      const r = await app.inject(`/api/v1/metricas/${id}`);
      expect(r.statusCode, id).toBe(200);
      expect(chaves(r.json()).filter((k) => PESSOA.test(k)), id).toEqual([]);
    }
  });

  it('S6b: K-267, a regex de pessoa pega cada termo novo numa resposta simulada e deixa passar as chaves reais', () => {
    const termos = ['bloqueadoPor', 'bloqueado_por', 'bloqueado por', 'bloqueadaPor', 'blockedBy', 'blocked_by', 'quem', 'quemBloqueou', 'comentario', 'comentário', 'comment', 'observacao', 'observação', 'observacoes', 'user_id', 'userId', 'user-id', 'user id', 'motivo_texto', 'motivoTexto', 'motivo-texto', 'bloqueadoQuem'];
    for (const t of termos) {
      const simulada = { itens: [{ cardId: 'B', motivo: 'x', aninhado: { [t]: 'Fulano' } }] };
      expect(chaves(simulada).filter((k) => PESSOA.test(k)), t).toEqual([t]);
    }
    // A1: "quem" dentro de outra palavra não é pego
    for (const t of ['esquema', 'esquemaVersao', 'requemado']) expect(PESSOA.test(t), t).toBe(false);
    // o que já era pego continua pego
    for (const t of ['responsavel', 'usuarioKey', 'assignee', 'email', 'ranking']) expect(PESSOA.test(t), t).toBe(true);
    // chaves legítimas de hoje não são pegas
    for (const t of ['bloqueados', 'bloqueadoHaDiasUteis', 'bloqueioMotivo', 'motivo', 'cardId']) expect(PESSOA.test(t), t).toBe(false);
  });

  it('S7: T12 segue "sem dado real" com o motivo genérico; T10 (pedido 105, E7.77) é real: total dos bloqueios encerrados de fornecedor, sem nome nem pessoa', async () => {
    const { app } = await real({ bloqueios: [...BLOQUEIOS, bloq('A', 'Aguardando fornecedor', '2026-09-14T12:00:00Z', '2026-09-15T12:00:00Z', '8'), bloq('A', 'Dependência Externa', '2026-09-14T12:00:00Z', '2026-09-15T12:00:00Z', '8'), bloq('A', 'Aguardando publicação GMUD', '2026-09-14T12:00:00Z', '2026-09-15T12:00:00Z', '8')] });
    const t12 = await app.inject('/api/v1/metricas/T12');
    expect(t12.statusCode).toBe(200);
    expect(t12.headers['x-estado-dado']).toBe('sem-dado-real');
    expect(t12.json()).toMatchObject({ estado: 'sem-dado-real', metrica: 'T12', motivo: 'fonte real ainda não definida' });
    const r = await app.inject('/api/v1/metricas/T10');
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-estado-dado']).toBeUndefined();
    const j = r.json() as { fornecedores: unknown[]; esperaFornecedores: { bloqueios: number; diasUteis: number; duracao: { status: string; n: number } }; motivoSemFornecedores: string };
    expect(SCHEMAS_RESULTADO.T10.safeParse(j).success).toBe(true);
    expect(j.fornecedores).toEqual([]);
    // Motivos 14 e 11 (8 h cada) entram; o de outro motivo (o A de 16 h, o GMUD) e o aberto ficam fora.
    expect(j.esperaFornecedores.bloqueios).toBe(2);
    expect(j.esperaFornecedores.duracao).toMatchObject({ status: 'insuficiente', n: 2 });
    expect(j.motivoSemFornecedores).toBeTruthy();
    expect(chaves(j).filter((k) => PESSOA.test(k))).toEqual([]);
  });

  it('S8: modo mock (seed com bloqueios) segue calculando BLOQUEADOS e O1 com bloqueados > 0 na série, sem a nota', async () => {
    const app = await mock();
    const b = (await app.inject('/api/v1/metricas/BLOQUEADOS')).json() as { itens: unknown[]; estado?: string };
    expect(b.estado).toBeUndefined();
    expect(Array.isArray(b.itens)).toBe(true);
    const o1 = (await app.inject('/api/v1/metricas/O1')).json() as { notas?: string[]; hoje: { bloqueados: number }; serie: { bloqueados: number }[] };
    expect(o1.notas).toBeUndefined();
    expect(typeof o1.hoje.bloqueados).toBe('number');
    expect(o1.serie.some((l) => l.bloqueados > 0)).toBe(true);
  });

  it('S9: a nota bloqueio-sem-dado-real não existe mais; a base real não a emite e o O2 e o O5 passam sem mudança', async () => {
    const { semParteDeBloqueio } = await import('../src/modulos/metricas/parte-sem-dado.js');
    const fora = { a: 1 };
    for (const id of ['O2', 'O3', 'O5'] as MetricaId[]) expect(semParteDeBloqueio(id, fora), id).toBe(fora);
    const { app } = await real({ sle: true });
    for (const id of ['O1', 'O2', 'O3', 'O5', 'O19', 'BLOQUEADOS']) expect(JSON.stringify((await app.inject(`/api/v1/metricas/${id}`)).json()), id).not.toContain(NOTA);
  });

  it('S9b: CA-12, só pelo interruptor: desligado (reversão) o O1 sai com a parte de bloqueio nula, sem nota; o O2 sem nota; ligado, nenhuma nula no hoje', async () => {
    vi.resetModules();
    vi.doMock('@metricas-dspd/contratos', async (orig) => ({ ...(await orig<Record<string, unknown>>()), BLOQUEIOS_COM_DADO_REAL: false }));
    const { buildApp: buildDesligado } = await import('../src/app.js');
    const app = await buildDesligado({ db: criarDublePg(banco({ sle: true, bloqueios: BLOQUEIOS })).pool, S: REAL, agora: () => AGORA, nivelLog: 'silent' });
    const o1 = (await app.inject('/api/v1/metricas/O1')).json() as { notas?: string[]; hoje: { bloqueados: number | null }; serie: { bloqueados: number | null }[] };
    expect(o1.notas ?? []).not.toContain(NOTA);
    expect(o1.hoje.bloqueados).toBeNull();
    expect(o1.serie.every((l) => l.bloqueados === null)).toBe(true);
    expect(JSON.stringify((await app.inject('/api/v1/metricas/O2')).json())).not.toContain(NOTA);
    const { semParteDeBloqueio } = await import('../src/modulos/metricas/parte-sem-dado.js');
    expect(semParteDeBloqueio('O5', { a: 1 })).toEqual({ a: 1 });
  });

  it('S10: a versão de critério dos bloqueios marca O1, O2, O5, O19 e BLOQUEADOS quando a data (2026-11-01) cruza o período', async () => {
    const { marcacoesNoPeriodo } = await import('@metricas-dspd/metricas');
    for (const id of ['O1', 'O2', 'O5', 'O19', 'BLOQUEADOS'] as MetricaId[]) {
      const m = marcacoesNoPeriodo(id, { inicio: '2026-10-01', fim: '2026-11-10' }, []);
      expect(m.map((x) => x.id), id).toContain('criterio-2026-11-01-bloqueio-com-dado-real');
    }
    expect(marcacoesNoPeriodo('O3', { inicio: '2026-10-01', fim: '2026-11-10' }, []).map((x) => x.id)).not.toContain('criterio-2026-11-01-bloqueio-com-dado-real');
  });
});

// Pedido 069, L9-a (K-220): S3 e S2 sem zero falso enquanto `prioridade_ajustada_manualmente` não vem da fonte (ADR 0026).
describe('pedido 069 L9-a: S3 e S2 sem zero falso na base real', () => {
  const NOTA_S3 = 'ajuste-prioridade-sem-dado-real';
  const NOTA_S2 = 'excecao-sla-sem-fonte';
  const mock = async () => buildApp({ modoMock: true, db: criarDublePg(bancoDoMock(seed)).pool, agora: () => AGORA, nivelLog: 'silent' });
  afterEach(() => { vi.doUnmock('@metricas-dspd/contratos'); vi.resetModules(); });

  it('L1b (reversão do interruptor, pedido 105): com AJUSTE_PRIORIDADE_COM_FONTE falso o S3 real volta a publicar ajustesManuais nulo com a nota; S3 em outra métrica não muda', async () => {
    vi.resetModules();
    vi.doMock('@metricas-dspd/contratos', async (orig) => ({ ...(await orig<Record<string, unknown>>()), AJUSTE_PRIORIDADE_COM_FONTE: false }));
    const { buildApp: buildDesligado } = await import('../src/app.js');
    const app = await buildDesligado({ db: criarDublePg(banco({ chamados: [chamado('1', { prioridade_ajustada_manualmente: true })] })).pool, S: REAL, agora: () => AGORA, nivelLog: 'silent' });
    const s3 = (await app.inject('/api/v1/metricas/S3')).json() as { notas?: string[]; meses: { ajustesManuais: number | null }[] };
    expect(s3.notas).toContain(NOTA_S3);
    expect(s3.meses.every((m) => m.ajustesManuais === null)).toBe(true);
    const s4 = (await app.inject('/api/v1/metricas/S4')).json() as { notas?: string[] };
    expect(s4.notas ?? []).not.toContain(NOTA_S3);
  }, 60_000);

  it('D2: as notas de S5 e S7 não se repetem quando o resultado já as traz', async () => {
    const { comNotaS5SemRisco, comNotaAjusteNaoIgualVazio } = await import('../src/modulos/metricas/parte-sem-dado.js');
    const uma = comNotaS5SemRisco('S5', { motivos: [] }) as { notas: string[] };
    expect(uma.notas).toEqual(['s5-risco-sla-sem-fonte']);
    expect((comNotaS5SemRisco('S5', uma) as { notas: string[] }).notas).toEqual(['s5-risco-sla-sem-fonte']);
    const sete = comNotaAjusteNaoIgualVazio('S7', uma) as { notas: string[] };
    expect(sete.notas).toEqual(['s5-risco-sla-sem-fonte', 's7-nao-igual-vazio']);
    expect((comNotaAjusteNaoIgualVazio('S7', sete) as { notas: string[] }).notas).toEqual(sete.notas);
    const outro = { motivos: [] };
    expect(comNotaS5SemRisco('S6', outro)).toBe(outro);
    expect(comNotaAjusteNaoIgualVazio('S6', outro)).toBe(outro);
    expect((comNotaAjusteNaoIgualVazio('S3', { meses: [] }) as { notas: string[] }).notas).toEqual(['s7-nao-igual-vazio']);
    const semDado = { notas: ['ajuste-prioridade-sem-dado-real'] };
    expect(comNotaAjusteNaoIgualVazio('S3', semDado)).toBe(semDado);
  });

  it('L1 (pedido 105, D2): com o campo na fonte, o S3 real publica o número de ajustes manuais, sem a nota de sem dado real, e valida no contrato', async () => {
    const { app } = await montar({ chamados: [chamado('1', { prioridade_ajustada_manualmente: true }), chamado('2')] });
    const r = (await app.inject('/api/v1/metricas/S3')).json() as { notas?: string[]; meses: { ajustesManuais: number | null; total: number }[] };
    expect(r.notas ?? []).not.toContain(NOTA_S3);
    expect(r.notas).toEqual(['s7-nao-igual-vazio']);
    expect(r.meses.length).toBeGreaterThan(0);
    for (const m of r.meses) expect(typeof m.ajustesManuais).toBe('number');
    expect(r.meses.reduce((a, m) => a + (m.ajustesManuais ?? 0), 0)).toBe(1);
    expect(r.meses.some((m) => m.total > 0)).toBe(true);
    expect(SCHEMAS_RESULTADO.S3.safeParse(r).success).toBe(true);
  }, 60_000);

  it('D2 (pedido 105): S5, S6 e S7 reais com os fluxos do PROC carregados: fora do fluxo contado, Outro separado de Não informado, notas e contrato', async () => {
    const PROC = ['SSVO - INCIDENTE'];
    const fechados = Array.from({ length: 24 }, (_, i) => chamado(`F${i}`, {
      fluxo: i < 21 ? 'SSVO - INCIDENTE' : 'SSSC - INCIDENTE', status: 'Concluído', data_finalizado: new Date('2026-09-25T12:00:00Z'), nivel_resolucao: 'N2',
      motivo_escalacao: i % 3 === 0 ? 'Múltiplos sistemas ou dependências' : i % 3 === 1 ? 'valor novo' : null,
      motivo_encerramento: i % 3 === 0 ? 'Contorno Aplicado' : i % 3 === 1 ? 'Não é Problema' : null,
      prioridade_ajustada_manualmente: i % 4 === 0,
    }));
    const { app } = await montar({ chamados: fechados, fluxosProc: PROC });
    const get = async (id: string) => (await app.inject(`/api/v1/metricas/${id}`)).json() as Record<string, unknown> & { motivos: { motivo: string; n: number }[] };
    const s5 = await get('S5');
    expect(SCHEMAS_RESULTADO.S5.safeParse(s5).success).toBe(true);
    expect(s5.foraDoFluxo).toBe(3);
    expect(s5.notas).toEqual(['s5-risco-sla-sem-fonte']);
    expect(s5.motivos.find((m) => m.motivo === 'Outro')?.n).toBe(7);
    expect(s5.motivos.find((m) => m.motivo === 'Risco de estouro de SLA')?.n).toBe(0);
    expect(s5.naoInformado).toBe(7);
    const s6 = await get('S6');
    expect(SCHEMAS_RESULTADO.S6.safeParse(s6).success).toBe(true);
    expect(s6.foraDoFluxo).toBe(3);
    expect(s6.motivos.find((m) => m.motivo === 'Contorno aplicado')?.n).toBe(7);
    expect(s6.motivos.find((m) => m.motivo === 'Outro')?.n).toBe(7);
    expect(s6.naoInformado).toBe(7);
    const s7 = await get('S7');
    expect(SCHEMAS_RESULTADO.S7.safeParse(s7).success).toBe(true);
    expect(s7.foraDoFluxo).toBe(3);
    expect(s7.notas).toEqual(['s7-nao-igual-vazio']);
    expect((s7.ajusteDePrioridade as { totais: { total: number; ocorrencias: number } }).totais).toEqual({ total: 21, ocorrencias: 6 });
  }, 60_000);

  it('D6a (pedido 105, Decisão 18b do 099): S11 real pelo fluxo do chamado: campo nativo no PROC, etapa Causa Raiz fora dele, sem fluxo contado, conversão insuficiente abaixo de 20 avaliações', async () => {
    const PROC = ['SSVO - INCIDENTE'];
    const fim = new Date('2026-09-25T12:00:00Z');
    // 22 do PROC (P1 a P3; o P3 entra pelo "Contorno Aplicado" real), 8 de fluxo antigo e 3 sem fluxo; todos no escopo do S11.
    const proc = Array.from({ length: 22 }, (_, i) => chamado(`P${i}`, {
      fluxo: 'SSVO - INCIDENTE', status: 'Concluído', data_finalizado: fim, prioridade: i < 8 ? 'P1' : i < 16 ? 'P2' : 'P3',
      motivo_encerramento: i < 16 ? null : 'Contorno Aplicado', avaliacao_problema: i % 2 === 0 ? 'Aberto' : null,
    }));
    const antigos = Array.from({ length: 8 }, (_, i) => chamado(`A${i}`, {
      fluxo: 'SSSC - INCIDENTE', status: 'Concluído', data_finalizado: fim, prioridade: 'P1', avaliacao_problema: 'Aberto',
    }));
    const semFluxo = Array.from({ length: 3 }, (_, i) => chamado(`N${i}`, {
      fluxo: null, status: 'Concluído', data_finalizado: fim, prioridade: 'P1', avaliacao_problema: 'Aberto',
    }));
    const ms = fim.getTime();
    // Os antigos A0 a A2 passaram pela Causa Raiz (nome da origem, fora da lista da biblioteca); o campo nativo deles não conta.
    const etapas: LinhaEtapa[] = [0, 1, 2].map((i) => ({ chamado_id: `A${i}`, etapa: 'Causa Raiz', entrada: ms - 3_600_000, saida: ms, motivo_pendencia: null }));
    const { app } = await montar({ chamados: [...proc, ...antigos, ...semFluxo], fluxosProc: PROC, etapas });
    const r = await app.inject('/api/v1/metricas/S11');
    expect(r.statusCode).toBe(200);
    const s11 = r.json() as { campoDisponivel: boolean; semFluxo: number; escopo: { k: number; n: number; status: string }; conversao: { status: string; k: number; n: number }; motivoConversao: string | null; foraDaConversao: number; porGrupo: { grupo: string; taxa: { k: number; n: number } }[] };
    expect(SCHEMAS_RESULTADO.S11.safeParse(s11).success).toBe(true);
    expect(s11.campoDisponivel).toBe(true);
    expect(s11.semFluxo).toBe(3);
    expect(s11.escopo).toMatchObject({ status: 'ok', k: 11 + 3, n: 30 });
    expect(s11.porGrupo.find((g) => g.grupo === 'Contorno')!.taxa).toMatchObject({ k: 3, n: 6 });
    // E7.101: 11 avaliações "Aberto" nos 22 do PROC (as dos antigos e sem fluxo não entram): abaixo de 20, não publica; os 3 antigos avaliados pela etapa vão a foraDaConversao.
    expect(s11.conversao).toMatchObject({ status: 'insuficiente', k: 11, n: 11 });
    expect(s11.motivoConversao).toBeNull();
    expect(s11.foraDaConversao).toBe(3);
  }, 60_000);

  it('E7.101: conversão do S11 pelo campo Avaliação de Problema: "Aberto" sobre as avaliações, "Não aplicável" só no denominador (fronteira 20)', async () => {
    const fim = new Date('2026-09-25T12:00:00Z');
    const mk = (n: number, aberto: number) => Array.from({ length: n }, (_, i) => chamado(`P${i}`, {
      fluxo: 'SSVO - INCIDENTE', status: 'Concluído', data_finalizado: fim, prioridade: 'P1',
      avaliacao_problema: i < aberto ? 'Aberto' : 'Não aplicável e com justificativa',
    }));
    const com20 = await montar({ chamados: mk(20, 5), fluxosProc: ['SSVO - INCIDENTE'] });
    const r20 = (await com20.app.inject('/api/v1/metricas/S11')).json() as { conversao: { status: string; k: number; n: number; pct?: number } };
    expect(SCHEMAS_RESULTADO.S11.safeParse(r20).success).toBe(true);
    expect(r20.conversao).toMatchObject({ status: 'ok', k: 5, n: 20, pct: 25 });
    const com19 = await montar({ chamados: mk(19, 5), fluxosProc: ['SSVO - INCIDENTE'] });
    const r19 = (await com19.app.inject('/api/v1/metricas/S11')).json() as { conversao: { status: string } };
    expect(r19.conversao.status).toBe('insuficiente');
  }, 60_000);

  it('L2: S2 real traz a nota e o resto do resultado fica igual', async () => {
    const { app } = await montar({ chamados: [chamado('1'), chamado('2')] });
    const r = (await app.inject('/api/v1/metricas/S2')).json() as { notas: string[]; prioridades: unknown[] };
    expect(r.notas).toEqual([NOTA_S2]);
    expect(r.prioridades.length).toBeGreaterThan(0);
    expect(SCHEMAS_RESULTADO.S2.safeParse(r).success).toBe(true);
  }, 60_000);

  it('D4 (Q-099-5b = A): S1 real traz a nota do primeiro atendimento, usa o primeiro comentário e valida no contrato', async () => {
    const aberto = new Date('2026-09-20T12:00:00Z');
    const { app } = await montar({ chamados: [chamado('1', { primeiro_atendimento_em: new Date('2026-09-20T12:30:00Z'), restaurado_em: new Date('2026-09-21T12:00:00Z'), data_finalizado: new Date('2026-09-21T12:00:00Z'), status: 'Concluído', aberto_em: aberto }), chamado('2')] });
    const r = await app.inject('/api/v1/metricas/S1');
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-estado-dado']).toBeUndefined();
    const corpo = r.json() as { notas: string[]; prioridades: { prioridade: string; primeiroAtendimento: { n: number }; restauracao: { n: number } }[] };
    expect(corpo.notas).toEqual(['primeiro-atendimento-inclui-automatica']);
    expect(corpo).not.toHaveProperty('estado');
    // Um chamado fechado de P3 com primeiro comentário entra no n do primeiro atendimento; o aberto (sem comentário) não.
    const p3 = corpo.prioridades.find((x) => x.prioridade === 'P3')!;
    expect(p3.primeiroAtendimento.n).toBe(1);
    expect(p3.restauracao.n).toBe(1);
    expect(SCHEMAS_RESULTADO.S1.safeParse(r.json()).success).toBe(true);
  }, 60_000);

  it('E7.238 (S1 B do dono): S1 real mede só a escala P1 a P5 e conta as outras escalas e os sem prazo; sem a escala projetada responde sem dado real com o motivo', async () => {
    const fechado = (id: string, extra: Partial<LinhaChamado> = {}) => chamado(id, { status: 'Concluído', data_finalizado: new Date('2026-09-25T12:00:00Z'), primeiro_atendimento_em: new Date('2026-09-20T13:00:00Z'), restaurado_em: new Date('2026-09-25T12:00:00Z'), ...extra });
    const { app } = await montar({ chamados: [fechado('1'), fechado('2'), fechado('3', { escala_p: false }), fechado('4', { escala_p: false }), fechado('5', { prioridade: null, escala_p: null })] });
    const r = (await app.inject('/api/v1/metricas/S1')).json() as { base: { n: number }; foraDaMatriz: { outrasEscalas: number; semPrazo: number } };
    expect(r.base.n).toBe(2);
    expect(r.foraDaMatriz).toEqual({ outrasEscalas: 2, semPrazo: 1 });
    expect(SCHEMAS_RESULTADO.S1.safeParse(r).success).toBe(true);
    const pendente = await montar({ chamados: [fechado('1', { escala_p: null })] });
    const p = await pendente.app.inject('/api/v1/metricas/S1');
    expect(p.statusCode).toBe(200);
    expect(p.json()).toEqual({ estado: 'sem-dado-real', metrica: 'S1', motivo: MOTIVO_ESCALA_NAO_PROJETADA });
  }, 60_000);

  it('L18 (E3.298): S1 real sem os alvos carregados responde 200 "sem dado real" com o motivo (nenhum prazo é presumido); o modo mock não traz nota', async () => {
    const { app } = await montar({ chamados: [chamado('1')], semAlvos: true });
    const r = await app.inject('/api/v1/metricas/S1');
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-estado-dado']).toBe('sem-dado-real');
    expect(r.json()).toEqual({ estado: 'sem-dado-real', metrica: 'S1', motivo: MOTIVO_ALVOS_NAO_CARREGADOS });
    const m = (await (await mock()).inject('/api/v1/metricas/S1')).json() as { notas?: string[] };
    expect(m.notas).toBeUndefined();
  }, 60_000);

  it('D9: S12 real traz o volume, exceção de SLA null (nunca 0%) com a nota própria, e valida no contrato', async () => {
    const { app } = await montar({ chamados: [chamado('1'), chamado('2')] });
    const r = (await app.inject('/api/v1/metricas/S12')).json() as { notas: string[]; excecaoSla: unknown; campoDisponivel: boolean; meses: { total: number }[] };
    expect(r.excecaoSla).toBeNull();
    expect(r.notas).toEqual(['excecao-sla-s12-sem-fonte']);
    expect(r.campoDisponivel).toBe(false);
    expect(r.meses.some((m) => m.total > 0)).toBe(true);
    expect(SCHEMAS_RESULTADO.S12.safeParse(r).success).toBe(true);
  }, 60_000);

  it('D9: modo mock mantém a taxa de exceção de SLA do S12 e não traz nota; a função pura não repete a nota nem toca outra métrica', async () => {
    const m = (await (await mock()).inject('/api/v1/metricas/S12')).json() as { notas?: string[]; excecaoSla: { status: string } | null };
    expect(m.notas).toBeUndefined();
    expect(m.excecaoSla).not.toBeNull();
    const { comNotaS12SemFonte } = await import('../src/modulos/metricas/parte-sem-dado.js');
    const nula = { meses: [], excecaoSla: null, notas: ['excecao-sla-s12-sem-fonte'] };
    expect(comNotaS12SemFonte('S12', nula)).toEqual(nula);
    const viva = { excecaoSla: { status: 'ok' } };
    expect(comNotaS12SemFonte('S12', viva)).toBe(viva);
    expect(comNotaS12SemFonte('S3', { excecaoSla: null })).toEqual({ excecaoSla: null });
  }, 60_000);

  it('L3: modo mock mantém o número do S3 e não traz nota; S4 real não ganha nota', async () => {
    const m = (await (await mock()).inject('/api/v1/metricas/S3')).json() as { notas?: string[]; meses: { ajustesManuais: unknown }[] };
    expect(m.notas).toBeUndefined();
    for (const x of m.meses) expect(typeof x.ajustesManuais).toBe('number');
    const s2 = (await (await mock()).inject('/api/v1/metricas/S2')).json() as { notas?: string[] };
    expect(s2.notas).toBeUndefined();
    const { app } = await montar({ chamados: [chamado('1')] });
    expect(JSON.stringify((await app.inject('/api/v1/metricas/S4')).json())).not.toContain(NOTA_S3);
  }, 60_000);

  it('L4: a função pura só troca ajustesManuais e anexa a nota, sem repetir nem apagar outra', async () => {
    const { semParteDeAjusteDePrioridade, comNotaExcecaoSlaSemFonte } = await import('../src/modulos/metricas/parte-sem-dado.js');
    const a = semParteDeAjusteDePrioridade('S3', { meses: [{ mes: '2026-09', total: 7, ajustesManuais: 0 }], janela: { total: 7 } }) as { meses: Record<string, unknown>[]; janela: unknown; notas: string[] };
    expect(a.meses).toEqual([{ mes: '2026-09', total: 7, ajustesManuais: null }]);
    expect(a.janela).toEqual({ total: 7 });
    expect(a.notas).toEqual([NOTA_S3]);
    expect((semParteDeAjusteDePrioridade('S3', a) as { notas: string[] }).notas).toEqual([NOTA_S3]);
    expect((comNotaExcecaoSlaSemFonte('S2', { prioridades: [] }) as { notas: string[] }).notas).toEqual([NOTA_S2]);
    // Pedido 077, L6a: a tendência de SLA traz a mesma nota e o resto do resultado fica igual; sem repetir.
    const t = comNotaExcecaoSlaSemFonte('TENDENCIA_SUST', { meses: [{ mes: '2026-09', volume: 3 }] }) as { meses: unknown[]; notas: string[] };
    expect(t.notas).toEqual([NOTA_S2]);
    expect(t.meses).toEqual([{ mes: '2026-09', volume: 3 }]);
    expect((comNotaExcecaoSlaSemFonte('TENDENCIA_SUST', t) as { notas: string[] }).notas).toEqual([NOTA_S2]);
    const fora = { a: 1 };
    expect(semParteDeAjusteDePrioridade('S4', fora)).toBe(fora);
    expect(semParteDeAjusteDePrioridade('TENDENCIA_FLUXO', fora)).toBe(fora);
  });
});

// Pedido 105 (E7.100): T1, T2, T4, T6, O6 e O24 separam pela prioridade nativa do BusinessMap (a coluna `severidade` já projetada de `dim_card`), na base real.
describe('pedido 105 (E7.100): classe pela prioridade nativa na base real', () => {
  const GRUPOS: [string | null, number][] = [['Crítica', 19], ['Alta', 20], ['Média', 20], ['Baixa', 19], [null, 7], ['Urgente', 2]];
  const cards = GRUPOS.flatMap(([sev, n], g) => Array.from({ length: n }, (_, i) => card(`P${g}-${i}`, 'Trabalho de produto', { severidade: sev })));
  const porNivel = (j: { classes: { classe: string; n: number; estatistica?: { status: string } }[] }) => Object.fromEntries(j.classes.map((c) => [c.classe, c]));

  it('T1, T2, T6 e O6: fronteira 19 e 20 por nível; sem prioridade (nula e fora dos quatro níveis) fora e contada, nunca Média', async () => {
    const { app, d } = await montar({ cards, entregues: true, sle: true });
    for (const id of ['T1', 'T2', 'T6', 'O6'] as const) {
      const r = await app.inject(`/api/v1/metricas/${id}`);
      expect(r.statusCode, id).toBe(200);
      const j = r.json() as { classes: { classe: string; n: number; estatistica?: { status: string } }[]; semPrioridade: { n: number; total: number }; base: { n: number } };
      expect(SCHEMAS_RESULTADO[id].safeParse(j).success, id).toBe(true);
      const c = porNivel(j);
      expect([c.Crítica!.n, c.Alta!.n, c.Média!.n, c.Baixa!.n], id).toEqual([19, 20, 20, 19]);
      expect(j.semPrioridade, id).toEqual({ n: 9, total: 87 });
      expect(j.base.n, id).toBe(78);
      if (id !== 'T2' && id !== 'T6') {
        expect([c.Crítica!, c.Alta!, c.Média!, c.Baixa!].map((x) => x.estatistica!.status), id).toEqual(['insuficiente', 'ok', 'ok', 'insuficiente']);
      }
    }
    expect(leituras(d.chamadas, NO_SEED)).toBe(0);
  }, 60_000);

  it('T2 lê o SLE do nível (Média publicado, 20 entregas: publica); os outros níveis seguem sem SLE', async () => {
    const { app } = await montar({ cards, entregues: true, sle: true });
    const j = (await app.inject('/api/v1/metricas/T2')).json() as { classes: { classe: string; sle: { diasUteis: number } | null }[] };
    expect(porNivel(j as never).Média).toMatchObject({ sle: { diasUteis: 5 } });
    expect(porNivel(j as never).Alta).toMatchObject({ sle: null });
    expect(porNivel(j as never).Crítica).toMatchObject({ sle: null });
  }, 60_000);

  it('T4: uma linha por nível, sem total agregado, com a prioridade nula contada à parte', async () => {
    const { app } = await montar({ cards, entregues: true });
    const j = (await app.inject('/api/v1/metricas/T4')).json() as { classes: { classe: string; n: number }[]; semPrioridade: { n: number; total: number } } & Record<string, unknown>;
    expect(j.classes.map((c) => c.classe)).toEqual(['Crítica', 'Alta', 'Média', 'Baixa']);
    expect(j.semPrioridade.n).toBeGreaterThan(0);
    expect(j.semPrioridade.total).toBeGreaterThanOrEqual(j.semPrioridade.n);
    expect(Object.keys(j).sort()).toEqual(['base', 'classes', 'criterios', 'semPrioridade']);
  }, 60_000);

  it('O24: só a fila da prioridade Média; a nula fica fora e contada', async () => {
    const { app } = await montar({ cards });
    const j = (await app.inject('/api/v1/metricas/O24')).json() as { base: { n: number; unidade: string }; semPrioridade: { n: number; total: number } };
    expect(j.base.unidade).toBe('inícios da prioridade Média');
    expect(j.base.n).toBe(20);
    expect(j.semPrioridade.n).toBe(9);
    expect(j.semPrioridade.total).toBeGreaterThanOrEqual(9 + 20);
  }, 60_000);
});

// Pedido 105 (E7.68, D-T9 "T9 A"): o T9 é real. Frente adicionada = criada depois do início do projeto (derivada na leitura; a coluna
// `adicionado_apos_inicio_pai` nunca é gravada e vem false); projeto sem início fica fora, contado; avanço pelas frentes filhas.
describe('pedido 105 (E7.68): T9 com dado real', () => {
  const projeto = (id: string, extra: Partial<LinhaCard> = {}) => card(id, 'Melhoria', { granularidade: 'projeto', ...extra });
  const frente = (id: string, pai: string, criado: string, extra: Partial<LinhaCard> = {}) =>
    card(id, 'Melhoria', { granularidade: 'frente', card_pai: pai, criado_em: new Date(criado), ...extra });

  it('o T9 está no mapa real e a resposta traz o escopo pela regra do criado_em, sem ler o seed', async () => {
    expect(origemDaMetrica('T9')).toBe('real');
    const { app, d } = await montar({
      cards: [
        projeto('P1'), // iniciado em 2026-09-03
        frente('F1', 'P1', '2026-09-01T12:00:00Z', { concluido_em: new Date('2026-09-20T12:00:00Z') }), // criada antes: original (mesmo ligada depois)
        frente('F2', 'P1', '2026-09-10T12:00:00Z'), // criada depois: adicionada
        projeto('P2', { iniciado_em: null, comprometido_em: null }), // sem início: fora, contado
        frente('F3', 'P2', '2026-09-05T12:00:00Z'),
      ],
      entregues: ['F1'],
    });
    const r = await app.inject('/api/v1/metricas/T9');
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-estado-dado']).toBeUndefined();
    expect(SCHEMAS_RESULTADO.T9.safeParse(r.json()).success).toBe(true);
    const j = r.json();
    expect(j.projetos).toHaveLength(1);
    expect(j.projetos[0]).toMatchObject({ projetoId: 'P1', totalFrentes: 2, originais: 1, adicionadas: 1, concluidas: 1, avancoPct: 50, crescimentoEscopoPct: 100 });
    expect(j.projetosSemInicio).toBe(1);
    expect(j.projetosComEscopoCrescido).toBe(1);
    expect(r.headers['x-versao-criterio']).not.toBe('0');
    expect(leituras(d.chamadas, NO_SEED)).toBe(0);
  });

  it('sem nenhum projeto com frente a base é vazia e nunca inventa adicionadas', async () => {
    const { app } = await montar({ cards: [card('A', 'Bug interno')] });
    const j = (await app.inject('/api/v1/metricas/T9')).json();
    expect(j.projetos).toEqual([]);
    expect(j.projetosSemInicio).toBe(0);
  });
});
