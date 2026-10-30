import { describe, expect, it } from 'vitest';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import {
  agregadosDoPainel, dentroDaTolerancia, esquemaDash, reconciliar, resumir, type Agregados,
} from '../src/modulos/acelerato/reconciliacao.js';
import { criarDublePg } from './duble-pg.js';

describe('CT-66: tolerância de 1% (1,00% passa, 1,01% falha)', () => {
  it.each([
    [10_000, 10_100, true], [10_100, 10_000, true], [10_000, 10_101, true], [10_101, 10_000, false], [10_200, 10_000, false],
    [100, 100, true], [0, 0, true], [1, 0, false], [0, 1, false],
  ])('painel %s x dash %s -> %s', (p, d, ok) => { expect(dentroDaTolerancia(p, d)).toBe(ok); });
});

describe('reconciliar (D-6; §3.3)', () => {
  const dash: Agregados = { '2026-07': { criados: 500 }, '2026-09': { criados: 1000, fechados: 900, sla_r_dentro: 15, sla_r_fora: 400 }, '2026-10': { criados: 1000, fechados: 5 } };
  const painel: Agregados = { '2026-07': { criados: 900 }, '2026-09': { criados: 1010, fechados: 880, sla_r_dentro: 15, sla_r_fora: 400, sla_pa_dentro: 200 }, '2026-10': { criados: 1000, fechados: 5 } };
  const linhas = reconciliar(painel, dash);
  const de = (mes: string, indicador: string) => linhas.find((l) => l.mes === mes && l.indicador === indicador)!;
  it('CT-61: mês até 2026-08 não é comparado (histórico do dash vem da tabela antiga)', () => {
    expect(de('2026-07', 'criados')).toMatchObject({ situacao: 'nao-comparavel', motivo: 'mes-anterior-a-2026-09' });
  });
  it('confere dentro de 1% e diverge fora dele', () => {
    expect(de('2026-09', 'criados')).toMatchObject({ painel: 1010, dash: 1000, situacao: 'confere' });
    expect(de('2026-09', 'fechados')).toMatchObject({ situacao: 'diverge' });
    expect(de('2026-10', 'criados').situacao).toBe('confere');
  });
  it('CT-62: abaixo de 20 de um dos lados ou sem número de um lado vira não comparável, nunca diferença', () => {
    expect(de('2026-09', 'sla_r_dentro')).toMatchObject({ situacao: 'nao-comparavel', motivo: 'abaixo-de-20' });
    expect(de('2026-10', 'fechados')).toMatchObject({ situacao: 'nao-comparavel', motivo: 'abaixo-de-20' });
    expect(de('2026-09', 'sla_pa_dentro')).toMatchObject({ dash: null, situacao: 'nao-comparavel', motivo: 'sem-numero' });
    expect(de('2026-09', 'sla_r_fora').situacao).toBe('confere');
  });
  it('resume por situação e não inventa indicador sem número nenhum', () => {
    expect(resumir(linhas)).toEqual({ confere: 3, diverge: 1, naoComparavel: 4 });
    expect(linhas.some((l) => l.painel === null && l.dash === null)).toBe(false);
  });
});

describe('entrada do dono: só agregados', () => {
  it('aceita contagens por mês e recusa chave de mês inválida, indicador desconhecido, valor negativo ou texto (nenhum dado de pessoa entra)', () => {
    expect(esquemaDash.safeParse({ '2026-09': { criados: 10 } }).success).toBe(true);
    expect(esquemaDash.safeParse({ setembro: { criados: 10 } }).success).toBe(false);
    expect(esquemaDash.safeParse({ '2026-13': { criados: 10 } }).success).toBe(false);
    expect(esquemaDash.safeParse({ '2026-09': { agente: 10 } }).success).toBe(false);
    expect(esquemaDash.safeParse({ '2026-09': { criados: -1 } }).success).toBe(false);
    expect(esquemaDash.safeParse({ '2026-09': { criados: 'dez' } }).success).toBe(false);
  });
});

describe('agregadosDoPainel', () => {
  const l = (aberto: string | null, fechado: string | null, o: { agente?: boolean; pa?: string | null; r?: string | null } = {}) => ({
    aberto_em: aberto === null ? null : new Date(aberto), data_finalizado: fechado === null ? null : new Date(fechado), com_agente: o.agente ?? true,
    status_sla_pa: o.pa ?? null, status_sla_r: o.r ?? null,
  });
  it('conta por mês civil de Brasília (virada de mês às 03:00 UTC), com SLA sem os chamados sem agente (D-9)', async () => {
    const d = criarDublePg(() => [
      l('2026-10-01T02:59:59Z', '2026-10-01T03:00:00Z', { pa: 'NO_PRAZO', r: 'REALIZADO_NO_PRAZO' }), // criado em setembro, fechado em outubro
      l('2026-09-10T12:00:00Z', '2026-09-11T12:00:00Z', { pa: 'APOS_VENCIMENTO', r: 'REALIZADO_APOS_VENCIMENTO' }),
      l('2026-09-10T12:00:00Z', '2026-09-12T12:00:00Z', { agente: false, pa: 'NO_PRAZO', r: 'REALIZADO_NO_PRAZO' }),
      l('2026-09-15T12:00:00Z', null),
      l(null, '2026-09-20T12:00:00Z', { r: 'DENTRO_DO_PRAZO' }),
    ]);
    const r = await agregadosDoPainel(d.pool, montarEsquemas(''));
    expect(r).toEqual({
      '2026-09': { criados: 4, fechados: 3, sla_pa_fora: 1, sla_r_fora: 1 },
      '2026-10': { fechados: 1, sla_pa_dentro: 1, sla_r_dentro: 1 },
    });
  });
  it('uma consulta só de leitura sobre dim_chamado, com a população da D-8 e sem coluna de pessoa nem agregação no banco', async () => {
    const d = criarDublePg(() => []);
    expect(await agregadosDoPainel(d.pool, montarEsquemas(''))).toEqual({});
    expect(d.chamadas).toHaveLength(1);
    const sql = d.chamadas[0]!.texto;
    expect(sql).toContain('NOT excluido AND NOT fora_do_recorte');
    expect(sql).not.toContain('prioridade'); // chamado fora da escala P conta na reconciliação (D-8, D-12)
    expect(sql).not.toMatch(/INSERT|UPDATE|DELETE|agente_key|\*|GROUP BY/);
  });
});
