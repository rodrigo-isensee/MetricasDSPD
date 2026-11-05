import { METRICA_IDS, fonteDaMetrica, type MetricaId } from '@metricas-dspd/contratos';
import { FERIADOS_NACIONAIS } from '@metricas-dspd/metricas/core';
import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { ServicoMetricas, TTL_VERSAO_MS } from '../src/modulos/metricas/index.js';
import { bancoDoMock, CORTE_DATA } from './base-duble.js';
import { criarDublePg, type Respondedor } from './duble-pg.js';

/**
 * Pedido 069, L7-b (K-220, ADR 0027): as métricas leem o calendário vigente da referência (`businessmap/fluxo`, `acelerato/sustentacao`) e,
 * sem linha, usam `CALENDARIO_PADRAO`. Banco falso: a referência de calendário é o que cada teste põe em `feriados`.
 */
const AGORA = new Date('2026-10-10T15:00:00Z');
const base = gerarBaseMock({ escala: 0.25 });
const FLUXO = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' as const } };
const SUST = { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } };
const FILTROS = { businessmap: FLUXO, acelerato: SUST, ambos: {}, pesquisa: {} } as const;
const filtrosDe = (id: MetricaId) => FILTROS[fonteDaMetrica(id)];
const IDS = METRICA_IDS.filter((id) => fonteDaMetrica(id) !== 'pesquisa');

type Feriados = { businessmap?: readonly string[]; acelerato?: readonly string[] };
const ID_CAL = { businessmap: '1', acelerato: '2' } as const;
/** Todos os dias de 2025 e 2026: nenhum dia útil (as horas úteis ficam zeradas). */
const TODOS_OS_DIAS: string[] = Array.from({ length: 730 }, (_, i) => new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10));

function responder(feriados: () => Feriados, opcoes: { versaoCriterio?: string } = {}): Respondedor {
  const interno = bancoDoMock(base, opcoes);
  return (c) => {
    if (c.texto.includes('ref_calendario_aplicacao')) {
      const dominio = c.valores[0] as keyof Feriados;
      return feriados()[dominio] === undefined ? [] : [{ calendario_id: ID_CAL[dominio], offset_minutos: -180 }];
    }
    if (c.texto.includes('FROM dspd_core.ref_feriado WHERE')) {
      const dominio = c.valores[0] === ID_CAL.businessmap ? 'businessmap' : 'acelerato';
      return (feriados()[dominio] ?? []).map((data) => ({ data }));
    }
    return interno(c);
  };
}
const servico = (r: Respondedor) => {
  const d = criarDublePg(r);
  return { d, s: new ServicoMetricas({ modoMock: true, db: d.pool }) };
};
const calc = (s: ServicoMetricas, id: MetricaId) => s.calcular(id, filtrosDe(id), { dataReferencia: CORTE_DATA }, AGORA);
const NACIONAIS = [...FERIADOS_NACIONAIS];

describe('L7-b: métricas leem o calendário da referência', () => {
  it('paridade: com o arquivo inicial (feriados nacionais 2025-2026 nos dois domínios) nenhum número muda', async () => {
    const sem = servico(responder(() => ({})));
    const com = servico(responder(() => ({ businessmap: NACIONAIS, acelerato: NACIONAIS })));
    for (const id of IDS) expect((await calc(com.s, id)).resultado, id).toEqual((await calc(sem.s, id)).resultado);
  }, 120_000);

  it('lê a classe certa de cada domínio: fluxo no BusinessMap, sustentação no Acelerato', async () => {
    const { d, s } = servico(responder(() => ({ businessmap: NACIONAIS, acelerato: NACIONAIS })));
    await calc(s, 'O3');
    await calc(s, 'S4');
    const lidas = d.chamadas.filter((c) => c.texto.includes('ref_calendario_aplicacao')).map((c) => c.valores);
    expect(lidas).toEqual([['businessmap', 'fluxo'], ['acelerato', 'sustentacao']]);
  });

  it('feriado novo no BusinessMap muda o fluxo e não toca a sustentação (nunca se misturam)', async () => {
    const padrao = servico(responder(() => ({})));
    const bm = servico(responder(() => ({ businessmap: TODOS_OS_DIAS })));
    expect((await calc(bm.s, 'O3')).resultado).not.toEqual((await calc(padrao.s, 'O3')).resultado);
    for (const id of ['S1', 'S4', 'S10'] as const) expect((await calc(bm.s, id)).resultado, id).toEqual((await calc(padrao.s, id)).resultado);
  }, 60_000);

  it('feriado novo no Acelerato muda a sustentação e não toca o fluxo', async () => {
    const padrao = servico(responder(() => ({})));
    const ac = servico(responder(() => ({ acelerato: TODOS_OS_DIAS })));
    const mudou = await Promise.all((['S1', 'S4', 'S10'] as const).map(async (id) => JSON.stringify((await calc(ac.s, id)).resultado) !== JSON.stringify((await calc(padrao.s, id)).resultado)));
    expect(mudou).toContain(true);
    for (const id of ['O3', 'T1'] as const) expect((await calc(ac.s, id)).resultado, id).toEqual((await calc(padrao.s, id)).resultado);
  }, 60_000);

  it('sem linha na referência vale o calendário padrão (o mesmo resultado de antes)', async () => {
    const padrao = servico(responder(() => ({})));
    const nacionais = servico(responder(() => ({ businessmap: NACIONAIS })));
    const a = (await calc(padrao.s, 'O3')).resultado;
    expect((await calc(nacionais.s, 'O3')).resultado).toEqual(a);
  });

  it('nova versão de critério invalida a carga e o resultado: o feriado novo vale na releitura', async () => {
    let atual: Feriados = { businessmap: NACIONAIS };
    const opcoes: { versaoCriterio?: string } = { versaoCriterio: '2' };
    const { s } = servico(responder(() => atual, opcoes));
    const antes = await calc(s, 'O3');
    atual = { businessmap: TODOS_OS_DIAS };
    opcoes.versaoCriterio = '3';
    const depois = await s.calcular('O3', FLUXO, { dataReferencia: CORTE_DATA }, new Date(AGORA.getTime() + TTL_VERSAO_MS));
    expect(depois.resultado).not.toEqual(antes.resultado);
  }, 60_000);
});
