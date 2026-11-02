import { CALENDARIO_PADRAO, MS_HORA, horasUteisEntre, instanteDeIso } from '@metricas-dspd/metricas/core';
import { describe, expect, it } from 'vitest';
import { entradaPorHorasUteis, intervalosDasEtapas } from '../src/modulos/acelerato/etapas-sinteticas.js';

const fim = instanteDeIso('2026-09-18T15:30:00-03:00', CALENDARIO_PADRAO); // sexta-feira
const PRECISAO = 1 / 3_600_000 + 1e-9; // 1 ms em horas

describe('entradaPorHorasUteis: a função de horas úteis da biblioteca devolve o total pedido', () => {
  it.each([0.25, 1, 3.5, 8, 17, 40, 200, 2000])('%s h úteis', (horas) => {
    const entrada = entradaPorHorasUteis(fim, horas);
    expect(entrada).not.toBeNull();
    const obtido = horasUteisEntre(entrada!, fim, CALENDARIO_PADRAO);
    expect(obtido).toBeGreaterThanOrEqual(horas);
    expect(obtido - horas).toBeLessThanOrEqual(PRECISAO);
  });
  it('atravessa fim de semana (o relógio de calendário é maior que o útil)', () => {
    const segunda = instanteDeIso('2026-09-21T09:00:00-03:00', CALENDARIO_PADRAO);
    const entrada = entradaPorHorasUteis(segunda, 4)!;
    expect(segunda - entrada).toBeGreaterThan(4 * MS_HORA);
  });
  it('zero, negativo e não finito não têm intervalo; total acima do teto de busca também não', () => {
    expect(entradaPorHorasUteis(fim, 0)).toBeNull();
    expect(entradaPorHorasUteis(fim, -1)).toBeNull();
    expect(entradaPorHorasUteis(fim, Number.NaN)).toBeNull();
    expect(entradaPorHorasUteis(fim, 1e9)).toBeNull();
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
    ]);
    expect(semIntervalo).toBe(0);
    expect(intervalos.map((i) => [i.etapa, i.horas])).toEqual([['Aguardando atribuição', 0.25], ['Pendente', 3]]);
    for (const i of intervalos) {
      expect(i.saida).toBe(dataFinalizado);
      expect(horasUteisEntre(i.entrada.getTime(), i.saida.getTime(), CALENDARIO_PADRAO) - i.horas).toBeLessThanOrEqual(PRECISAO);
    }
  });
  it('total que não cabe na busca é contado, não imputado', () => {
    const r = intervalosDasEtapas(dataFinalizado, [{ descricao: 'Pendente', tempo_sla_segundos: 1e15, quantidade_vezes: 1 }]);
    expect(r).toEqual({ intervalos: [], semIntervalo: 1 });
  });
});
