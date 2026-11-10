import { gerarBaseMock } from '@metricas-dspd/mock';
import * as lib from '@metricas-dspd/metricas';
import { describe, expect, it, vi } from 'vitest';
import { ServicoMetricas } from '../src/modulos/metricas/index.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg } from './duble-pg.js';

vi.mock('@metricas-dspd/metricas', async (orig) => {
  const m = await orig<typeof import('@metricas-dspd/metricas')>();
  return { ...m, calcularMetrica: vi.fn(m.calcularMetrica) };
});

const AGORA = new Date('2026-10-10T15:00:00Z');
const doMock = bancoDoMock(gerarBaseMock({ escala: 0.1 }));
const FLUXO = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' as const } };
type Meses = { meses: { janelaIncompleta?: unknown }[] };
type Ctx = { bm: { historicoDesde?: string }; ac: { historicoDesde?: string } };
type Marca = { versao: string; finalizadoEm: Date | null };
type Carga = { historicoDesde?: string; inicio: string | null };

// Pedido 077, L3b (P-077-6 = a): o Acelerato não tem início de histórico; a carga lê tudo, então nenhum ponto sai janela incompleta por isso.
const montar = (inicioCargaBM?: string) => {
  const d = criarDublePg((c) => (c.texto.includes("'carga_inicial'") ? (inicioCargaBM ? [{ parametros: { inicio_carga: inicioCargaBM } }] : []) : doMock(c)));
  return new ServicoMetricas({ modoMock: true, db: d.pool, S: montarEsquemas('') });
};
const carregarAC = (s: ServicoMetricas, m: Marca) => (s as unknown as { carregarAC(m: Marca): Promise<Carga> }).carregarAC(m);
const incompletos = (r: unknown): boolean => {
  const { meses } = r as Meses;
  expect(meses.length).toBeGreaterThan(0);
  return meses.some((m) => m.janelaIncompleta !== undefined);
};
const ultimoCtx = (): Ctx => vi.mocked(lib.calcularMetrica).mock.calls.at(-1)?.[2] as unknown as Ctx;

describe('historicoDesde do Acelerato (L3b)', () => {
  it('fica ausente com e sem coleta com sucesso, mesmo com chamados na base', async () => {
    const s = montar('2099-01-01');
    for (const finalizadoEm of [new Date('2026-10-10T10:00:00Z'), null]) {
      const c = await carregarAC(s, { versao: 'x', finalizadoEm });
      expect(c.inicio).not.toBeNull();
      expect(Object.keys(c)).not.toContain('historicoDesde');
    }
  });

  it('com os dois domínios carregados, o início do BusinessMap fica só no contexto do BusinessMap', async () => {
    await montar('2099-01-01').calcular('VISAO_GERAL', { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } } as never, {}, AGORA);
    const ctx = ultimoCtx();
    expect(ctx.bm.historicoDesde).toBe('2099-01-01');
    expect(ctx.ac.historicoDesde).toBeUndefined();
  });

  it('o início do BusinessMap nunca marca a TENDENCIA_SUST', async () => {
    const sust = await montar('2099-01-01').calcular('TENDENCIA_SUST', { equipe: [], prioridade: [], periodo: { tipo: '12s' } } as never, {}, AGORA);
    expect(incompletos(sust.resultado)).toBe(false);
    expect(ultimoCtx().ac.historicoDesde).toBeUndefined();
  });

  it('sem início de histórico, a TENDENCIA_FLUXO não marca nada e o valor não aparece no resultado', async () => {
    const fluxo = await montar().calcular('TENDENCIA_FLUXO', FLUXO as never, {}, AGORA);
    expect(incompletos(fluxo.resultado)).toBe(false);
    expect(JSON.stringify(fluxo.resultado)).not.toContain('historicoDesde');
  });
});
