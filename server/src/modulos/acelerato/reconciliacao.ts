import { z } from 'zod';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';

/**
 * Reconciliação de 1% contra o dash atual (D-6, T5.1; plano 056 §3.3): compara contagens AGREGADAS por mês do painel novo com as que o
 * dono informa do dash. Só números agregados: nenhuma linha, pessoa ou código do dash entra aqui, e a entrada é validada `strict`.
 * Regras da §3.3: contagens e proporções (nunca tempos), só meses depois de 2026-08 (histórico anterior vem da tabela antiga do dash),
 * e só onde os dois publicam (mínimo de 20 itens); o resto sai como "nao-comparavel", nunca como diferença.
 */
export const INDICADORES = ['criados', 'fechados', 'sla_pa_dentro', 'sla_pa_fora', 'sla_r_dentro', 'sla_r_fora'] as const;
export type Indicador = (typeof INDICADORES)[number];
export type Agregados = Record<string, Partial<Record<Indicador, number>>>;

export const MES_MINIMO = '2026-09';
export const MINIMO_ITENS = 20;
/** Tolerância relativa em pontos percentuais (1,00% passa, 1,01% falha). */
export const TOLERANCIA_PCT = 1;

const contagem = z.number().int().min(0).safe();
const esquemaMes = z.strictObject(Object.fromEntries(INDICADORES.map((i) => [i, contagem.optional()])) as Record<Indicador, z.ZodOptional<typeof contagem>>);
/** Entrada do dono: `{ "AAAA-MM": { "criados": n, "fechados": n, ... } }`. Chave ou campo fora da lista é recusado. */
export const esquemaDash = z.record(z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), esquemaMes);

export type Situacao = 'confere' | 'diverge' | 'nao-comparavel';
export type LinhaComparacao = { mes: string; indicador: Indicador; painel: number | null; dash: number | null; situacao: Situacao; motivo?: 'mes-anterior-a-2026-09' | 'abaixo-de-20' | 'sem-numero' };

/** |painel - dash| / dash <= 1% sem ponto flutuante: |a - b| * 100 <= b * TOLERANCIA_PCT. Dash zero só confere com painel zero. */
export const dentroDaTolerancia = (painel: number, dash: number): boolean => Math.abs(painel - dash) * 100 <= dash * TOLERANCIA_PCT;

export function reconciliar(painel: Agregados, dash: Agregados): LinhaComparacao[] {
  const meses = [...new Set([...Object.keys(painel), ...Object.keys(dash)])].sort();
  const saida: LinhaComparacao[] = [];
  for (const mes of meses) {
    for (const indicador of INDICADORES) {
      const p = painel[mes]?.[indicador] ?? null;
      const d = dash[mes]?.[indicador] ?? null;
      if (p === null && d === null) continue;
      const base = { mes, indicador, painel: p, dash: d };
      if (mes < MES_MINIMO) saida.push({ ...base, situacao: 'nao-comparavel', motivo: 'mes-anterior-a-2026-09' });
      else if (p === null || d === null) saida.push({ ...base, situacao: 'nao-comparavel', motivo: 'sem-numero' });
      else if (p < MINIMO_ITENS || d < MINIMO_ITENS) saida.push({ ...base, situacao: 'nao-comparavel', motivo: 'abaixo-de-20' });
      else saida.push({ ...base, situacao: dentroDaTolerancia(p, d) ? 'confere' : 'diverge' });
    }
  }
  return saida;
}

type LinhaPainel = { aberto_em: Date | null; data_finalizado: Date | null; status_sla_pa: string | null; status_sla_r: string | null };
const mesDeBrasilia = (d: Date): string => new Date(d.getTime() - 3 * 3_600_000).toISOString().slice(0, 7);

/**
 * Agregados do painel novo por mês civil de Brasília (fixo -03:00): população da D-8 (`excluido` e `fora_do_recorte` falsos), SLA sem os
 * chamados sem agente (D-9). Consulta própria, escrita à parte do cálculo do painel (a conferência não pode repetir o código que confere);
 * só colunas de data e de veredito, a contagem é feita aqui.
 */
export async function agregadosDoPainel(db: Consultavel, S: Esquemas): Promise<Agregados> {
  const r = await db.query<LinhaPainel & { com_agente: boolean }>(
    `SELECT aberto_em, data_finalizado, com_agente, status_sla_pa, status_sla_r FROM ${S.ac}.dim_chamado WHERE NOT excluido AND NOT fora_do_recorte`);
  const saida: Agregados = {};
  const somar = (mes: string, i: Indicador): void => { const m = (saida[mes] ??= {}); m[i] = (m[i] ?? 0) + 1; };
  for (const l of r.rows) {
    if (l.aberto_em !== null) somar(mesDeBrasilia(l.aberto_em), 'criados');
    if (l.data_finalizado === null) continue;
    const mes = mesDeBrasilia(l.data_finalizado);
    somar(mes, 'fechados');
    if (!l.com_agente) continue;
    if (l.status_sla_pa === 'NO_PRAZO') somar(mes, 'sla_pa_dentro');
    if (l.status_sla_pa === 'APOS_VENCIMENTO') somar(mes, 'sla_pa_fora');
    if (l.status_sla_r === 'REALIZADO_NO_PRAZO') somar(mes, 'sla_r_dentro');
    if (l.status_sla_r === 'REALIZADO_APOS_VENCIMENTO') somar(mes, 'sla_r_fora');
  }
  return saida;
}

/** Resumo para o terminal: só contagens e situação; nenhum dado de pessoa existe aqui. */
export const resumir = (linhas: readonly LinhaComparacao[]): { confere: number; diverge: number; naoComparavel: number } => ({
  confere: linhas.filter((l) => l.situacao === 'confere').length,
  diverge: linhas.filter((l) => l.situacao === 'diverge').length,
  naoComparavel: linhas.filter((l) => l.situacao === 'nao-comparavel').length,
});
