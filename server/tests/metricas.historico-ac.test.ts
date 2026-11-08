import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { ServicoMetricas } from '../src/modulos/metricas/index.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg } from './duble-pg.js';

const AGORA = new Date('2026-10-10T15:00:00Z');
const doMock = bancoDoMock(gerarBaseMock({ escala: 0.1 }));
const FLUXO = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' as const } };
type Meses = { meses: { janelaIncompleta?: unknown }[] };
type Marca = { versao: string; finalizadoEm: Date | null };
type Carga = { historicoDesde?: string; inicio: string | null };

// Pedido 077, L3b (P-077-6 = a): o Acelerato não tem início de histórico; a carga lê tudo, então nenhum ponto sai janela incompleta por isso.
const montar = (inicioCargaBM?: string) => {
  const d = criarDublePg((c) => (c.texto.includes("'carga_inicial'") ? (inicioCargaBM ? [{ parametros: { inicio_carga: inicioCargaBM } }] : []) : doMock(c)));
  return new ServicoMetricas({ modoMock: true, db: d.pool, S: montarEsquemas('') });
};
const carregarAC = (s: ServicoMetricas, m: Marca) => (s as unknown as { carregarAC(m: Marca): Promise<Carga> }).carregarAC(m);
const incompletos = (r: unknown): boolean => (r as Meses).meses.some((m) => m.janelaIncompleta !== undefined);

describe('historicoDesde do Acelerato (L3b)', () => {
  it('fica ausente com e sem coleta com sucesso, mesmo com chamados na base', async () => {
    const s = montar('2099-01-01');
    for (const finalizadoEm of [new Date('2026-10-10T10:00:00Z'), null]) {
      const c = await carregarAC(s, { versao: 'x', finalizadoEm });
      expect(c.inicio).not.toBeNull();
      expect(Object.keys(c)).not.toContain('historicoDesde');
    }
  });

  it('o início do BusinessMap nunca marca a TENDENCIA_SUST, e sem ele a TENDENCIA_FLUXO não marca nada com o Acelerato carregado', async () => {
    const sust = await montar('2099-01-01').calcular('TENDENCIA_SUST', { equipe: [], prioridade: [], periodo: { tipo: '12s' } } as never, {}, AGORA);
    const fluxo = await montar().calcular('TENDENCIA_FLUXO', FLUXO as never, {}, AGORA);
    expect(incompletos(sust.resultado)).toBe(false);
    expect(incompletos(fluxo.resultado)).toBe(false);
    expect(JSON.stringify(fluxo.resultado)).not.toContain('historicoDesde');
  });
});
