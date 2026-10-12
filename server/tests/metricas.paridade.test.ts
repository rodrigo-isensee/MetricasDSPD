import { METRICA_IDS, fonteDaMetrica, type MetricaId } from '@metricas-dspd/contratos';
import { acelerato, businessmap, calcularMetrica, CALENDARIO_PADRAO, pesquisa, type ContextosMetricas } from '@metricas-dspd/metricas';
import { gerarBaseMock, gerarExtensoesMock, gerarPesquisaMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { ServicoMetricas } from '../src/modulos/metricas/index.js';
import { fontePesquisaMock } from '../src/plataforma/db/pesquisa-mock.js';
import { bancoDoMock, CORTE_DATA, mockComoNoBanco } from './base-duble.js';
import { criarDublePg } from './duble-pg.js';

const AGORA = new Date('2026-10-10T15:00:00Z');
const CORTE = `${CORTE_DATA}T23:59:59-03:00`;
const FLUXO = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' as const } };
const SUST = { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } };
/** Filtros de cada fonte: a Visão geral e a pesquisa (PV1) não têm filtros. */
const FILTROS_POR_FONTE = { businessmap: FLUXO, acelerato: SUST, ambos: {}, pesquisa: {} } as const;
const base = gerarBaseMock();

/** Paridade: a métrica sobre o mock em memória (como o banco o representa) = a métrica sobre as linhas que o seed gravou. */
describe('paridade mock x projeções (sem Postgres: linhas do seed num banco falso)', () => {
  const memoria = mockComoNoBanco(base);
  const ctx: ContextosMetricas = {
    bm: businessmap.criarContextoBM(memoria.bm, CORTE, CALENDARIO_PADRAO),
    ac: acelerato.criarContextoAC(memoria.ac, CORTE, CALENDARIO_PADRAO),
    ext: gerarExtensoesMock(base),
    pesq: pesquisa.criarContextoPesquisa(gerarPesquisaMock(base.config), CORTE_DATA),
  };
  const d = criarDublePg(bancoDoMock(base));
  const servico = new ServicoMetricas({ db: d.pool, extensoes: () => gerarExtensoesMock(base), pesquisa: fontePesquisaMock });
  const filtrosDe = (id: MetricaId) => FILTROS_POR_FONTE[fonteDaMetrica(id)];

  it.each(METRICA_IDS)('%s: resultado idêntico', async (id) => {
    const esperado = calcularMetrica(id, filtrosDe(id) as never, ctx);
    const r = await servico.calcular(id, filtrosDe(id), { dataReferencia: CORTE_DATA }, AGORA);
    expect(r.resultado).toEqual(esperado);
  }, 60_000);
});
