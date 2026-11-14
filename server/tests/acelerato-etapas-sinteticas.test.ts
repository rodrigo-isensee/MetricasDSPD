import { acelerato } from '@metricas-dspd/metricas';
import { CALENDARIO_PADRAO, MS_HORA, horasUteisEntre, instanteDeIso } from '@metricas-dspd/metricas/core';
import { describe, expect, it } from 'vitest';
import { entradaPorHorasUteis, intervalosDasEtapas } from '../src/modulos/acelerato/etapas-sinteticas.js';

const fim = instanteDeIso('2026-09-18T15:30:00-03:00', CALENDARIO_PADRAO); // sexta-feira
const PRECISAO = 1 / 3_600_000 + 1e-9; // 1 ms em horas

describe('entradaPorHorasUteis: a função de horas úteis da biblioteca devolve o total pedido', () => {
  it.each([0.25, 1, 3.5, 8, 17, 40, 200, 2000])('%s h úteis', (horas) => {
    const entrada = entradaPorHorasUteis(fim, horas, CALENDARIO_PADRAO);
    expect(entrada).not.toBeNull();
    const obtido = horasUteisEntre(entrada!, fim, CALENDARIO_PADRAO);
    expect(obtido).toBeGreaterThanOrEqual(horas);
    expect(obtido - horas).toBeLessThanOrEqual(PRECISAO);
  });
  it('atravessa fim de semana (o relógio de calendário é maior que o útil)', () => {
    const segunda = instanteDeIso('2026-09-21T09:00:00-03:00', CALENDARIO_PADRAO);
    const entrada = entradaPorHorasUteis(segunda, 4, CALENDARIO_PADRAO)!;
    expect(segunda - entrada).toBeGreaterThan(4 * MS_HORA);
  });
  it('zero, negativo e não finito não têm intervalo; total acima do teto de busca também não', () => {
    expect(entradaPorHorasUteis(fim, 0, CALENDARIO_PADRAO)).toBeNull();
    expect(entradaPorHorasUteis(fim, -1, CALENDARIO_PADRAO)).toBeNull();
    expect(entradaPorHorasUteis(fim, Number.NaN, CALENDARIO_PADRAO)).toBeNull();
    expect(entradaPorHorasUteis(fim, 1e9, CALENDARIO_PADRAO)).toBeNull();
  });
});

describe('CT-47: intervalosDasEtapas (D-7)', () => {
  const dataFinalizado = new Date(fim);
  it('um intervalo por nome de etapa, terminando em data_finalizado, com as horas do total da ferramenta; total zero e nulo não geram linha', () => {
    const { intervalos, semIntervalo } = intervalosDasEtapas(dataFinalizado, [
      { descricao: 'Pendente', tempo_sla_segundos: 7200, quantidade_vezes: 3 },
      { descricao: 'Pendente', tempo_sla_segundos: 3600, quantidade_vezes: 1 },
      { descricao: 'Aguardando Atribuição', tempo_sla_segundos: 900, quantidade_vezes: 1 },
      { descricao: 'Em Atendimento N1', tempo_sla_segundos: 0, quantidade_vezes: 0 },
      { descricao: 'Novo', tempo_sla_segundos: null, quantidade_vezes: 1 },
      { descricao: null, tempo_sla_segundos: 50, quantidade_vezes: 1 },
    ], CALENDARIO_PADRAO);
    expect(semIntervalo).toBe(0);
    expect(intervalos.map((i) => [i.etapa, i.horas])).toEqual([['Aguardando atribuição', 0.25], ['Pendente', 3]]);
    for (const i of intervalos) {
      expect(i.saida).toBe(dataFinalizado);
      expect(horasUteisEntre(i.entrada.getTime(), i.saida.getTime(), CALENDARIO_PADRAO) - i.horas).toBeLessThanOrEqual(PRECISAO);
    }
  });
  it('total que não cabe na busca é contado, não imputado', () => {
    const r = intervalosDasEtapas(dataFinalizado, [{ descricao: 'Pendente', tempo_sla_segundos: 1e15, quantidade_vezes: 1 }], CALENDARIO_PADRAO);
    expect(r).toEqual({ intervalos: [], semIntervalo: 1 });
  });
});

describe('K-308 (ADR 0027, item 7.8): montagem com o dia útil de 8 h 48 da Sustentação', () => {
  const SUST = acelerato.CALENDARIO_SUSTENTACAO_PADRAO;
  const quarta1830 = new Date(instanteDeIso('2026-09-16T18:30:00-03:00', SUST));
  const quarta1500 = new Date(instanteDeIso('2026-09-16T15:00:00-03:00', SUST));
  const pendente16h = [{ descricao: 'Pendente', tempo_sla_segundos: 16 * 3600, quantidade_vezes: 1 }];

  it('paridade montagem = medição: horasUteisEntre da biblioteca devolve o total da ferramenta', () => {
    const { intervalos } = intervalosDasEtapas(quarta1500, [
      ...pendente16h,
      { descricao: 'Aguardando Atribuição', tempo_sla_segundos: 5 * 3600, quantidade_vezes: 1 },
    ], SUST);
    expect(intervalos.map((i) => [i.etapa, i.horas])).toEqual([['Aguardando atribuição', 5], ['Pendente', 16]]);
    for (const i of intervalos) {
      const medido = horasUteisEntre(i.entrada.getTime(), i.saida.getTime(), SUST);
      expect(medido).toBeGreaterThanOrEqual(i.horas);
      expect(medido - i.horas).toBeLessThanOrEqual(PRECISAO);
    }
  });
  it('chamado finalizado numa quarta às 18:30 com 12 min em "Aguardando atribuição" dá 0,2 h', () => {
    const { intervalos } = intervalosDasEtapas(quarta1830, [{ descricao: 'Aguardando Atribuição', tempo_sla_segundos: 720, quantidade_vezes: 1 }], SUST);
    expect(intervalos).toHaveLength(1);
    const i = intervalos[0]!;
    expect(i.horas).toBeCloseTo(0.2, 10);
    expect(horasUteisEntre(i.entrada.getTime(), i.saida.getTime(), SUST)).toBeCloseTo(0.2, 6);
  });
  it('16 h em "Pendente" finalizado quarta 15:00 dá 16 h medidas em 8 h 48 (e não 17,6 h)', () => {
    const i = intervalosDasEtapas(quarta1500, pendente16h, SUST).intervalos[0]!;
    expect(horasUteisEntre(i.entrada.getTime(), i.saida.getTime(), SUST)).toBeCloseTo(16, 6);
  });
  it('o mesmo total montado em 8 h e em 8 h 48 dá instantes de entrada diferentes (o calendário é o que decide)', () => {
    const em8 = intervalosDasEtapas(quarta1500, pendente16h, CALENDARIO_PADRAO).intervalos[0]!;
    const em848 = intervalosDasEtapas(quarta1500, pendente16h, SUST).intervalos[0]!;
    expect(em848.entrada.getTime()).not.toBe(em8.entrada.getTime());
    expect(horasUteisEntre(em8.entrada.getTime(), em8.saida.getTime(), SUST)).toBeGreaterThan(16.5); // montado em 8 h e medido em 8 h 48 inflava
  });
  it('as funções não aceitam chamada sem calendário (tipo)', () => {
    const tipos = (): void => {
      // @ts-expect-error o calendário é parâmetro obrigatório
      intervalosDasEtapas(quarta1500, []);
      // @ts-expect-error o calendário é parâmetro obrigatório
      entradaPorHorasUteis(1, 1);
    };
    expect(typeof tipos).toBe('function'); // a prova é o tsc: sem os dois @ts-expect-error o typecheck falha
  });
});
