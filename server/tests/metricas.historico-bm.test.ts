import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { ServicoMetricas } from '../src/modulos/metricas/index.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg } from './duble-pg.js';

const AGORA = new Date('2026-10-10T15:00:00Z');
const base = gerarBaseMock({ escala: 0.1 });
const doMock = bancoDoMock(base);
const SUST = { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } };
type Meses = { meses: { janelaIncompleta?: unknown }[] };

// Pedido 077, L3a: a leitura da carga inicial é isolada pelo texto da consulta; o resto do banco é o do mock. A consulta real roda em metricas.historico-bm.pg.test.ts.
const montar = (parametros: unknown[], log?: (c: Record<string, unknown>, m: string) => void) => {
  const d = criarDublePg((c) => (c.texto.includes("'carga_inicial'") ? parametros.map((p) => ({ parametros: p })) : doMock(c)));
  return new ServicoMetricas({ modoMock: true, db: d.pool, S: montarEsquemas(''), ...(log ? { log } : {}) });
};
const incompletos = (r: unknown): boolean => (r as Meses).meses.some((m) => m.janelaIncompleta !== undefined);

describe('historicoDesde do BusinessMap no contexto (L3a)', () => {
  it('menor inicio_carga válido vai só à TENDENCIA_FLUXO; o inválido é ignorado com aviso sem conteúdo', async () => {
    const avisos: string[] = [];
    const s = montar([{ inicio_carga: '2099-05-04' }, { inicio_carga: '2099-01-01' }, { inicio_carga: 'ontem-segredo' }, {}], (c, m) => { avisos.push(JSON.stringify(c) + m); });
    const fluxo = await s.calcular('TENDENCIA_FLUXO', { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } } as never, {}, AGORA);
    const sust = await s.calcular('TENDENCIA_SUST', SUST as never, {}, AGORA);
    expect(incompletos(fluxo.resultado)).toBe(true);
    expect(JSON.stringify(fluxo.resultado)).toContain('"historicoDesde":"2099-01-01"');
    expect(incompletos(sust.resultado)).toBe(false);
    expect(avisos).toHaveLength(1);
    expect(avisos[0]).toContain('"cargasIgnoradas":2');
    expect(avisos[0]).not.toContain('segredo');
  });

  it('sem carga inicial válida: nada marcado e sem aviso; só inválida sem log injetado também segue', async () => {
    expect(incompletos((await montar([]).calcular('TENDENCIA_FLUXO', { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } } as never, {}, AGORA)).resultado)).toBe(false);
    expect(incompletos((await montar([{ inicio_carga: 1 }]).calcular('TENDENCIA_FLUXO', { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } } as never, {}, AGORA)).resultado)).toBe(false);
  });
});
