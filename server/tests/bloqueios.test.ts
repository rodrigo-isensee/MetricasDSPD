import { describe, expect, it } from 'vitest';
import { derivarBloqueios, type VersaoBloqueio } from '../src/modulos/businessmap/bloqueios.js';

const v = (t: string, isBlocked: unknown, blockReasonId?: unknown, extra: object = {}): VersaoBloqueio =>
  ({ cardId: 'C1', coletadoEm: t, isBlocked, blockReasonId, columnId: 7, ...extra });
const T1 = '2026-11-01T10:00:00.000Z', T2 = '2026-11-02T10:00:00.000Z', T3 = '2026-11-03T10:00:00.000Z', T4 = '2026-11-04T10:00:00.000Z';

describe('derivarBloqueios (via A)', () => {
  it('abre e fecha no coletado_em da versão que viu a mudança', () => {
    const { eventos } = derivarBloqueios([v(T1, false), v(T2, true, 5), v(T3, false)]);
    expect(eventos.map((e) => [e.tipo, e.ocorridoEm, e.motivoCodigo])).toEqual([['inicio', T2, '5'], ['fim', T3, null]]);
    expect(eventos[1]!.idOrigem).toBe(eventos[0]!.idOrigem);
  });
  it('reabre com outro id_origem', () => {
    const { eventos } = derivarBloqueios([v(T1, true, 1), v(T2, false), v(T3, true, 1), v(T4, false)]);
    expect(eventos).toHaveLength(4);
    expect(eventos[2]!.idOrigem).not.toBe(eventos[0]!.idOrigem);
  });
  it('troca de motivo bloqueado não gera evento e vale o motivo do início', () => {
    const { eventos } = derivarBloqueios([v(T1, true, 1), v(T2, true, 2), v(T3, false)]);
    expect(eventos.map((e) => e.tipo)).toEqual(['inicio', 'fim']);
    expect(eventos[0]!.motivoCodigo).toBe('1');
  });
  it('primeira versão já bloqueada abre na coleta', () => {
    expect(derivarBloqueios([v(T1, true, 3)]).eventos[0]).toMatchObject({ tipo: 'inicio', ocorridoEm: T1 });
  });
  it('versões repetidas não geram evento e a derivação é determinística', () => {
    const vs = [v(T1, false), v(T2, true, 4), v(T3, true, 4)];
    expect(derivarBloqueios(vs).eventos).toHaveLength(1);
    expect(derivarBloqueios(vs)).toEqual(derivarBloqueios(vs));
  });
  it.each([[12, '12'], ['0034', '0034'], [null, null], [undefined, null], ['abc', null], ['12345678901', null], [1.5, null], [{ id: 1 }, null]])(
    'CA-075-2: reason_id %j vira %j', (entrada, esperado) => {
      const r = derivarBloqueios([v(T1, true, entrada)]);
      expect(r.eventos[0]!.motivoCodigo).toBe(esperado);
      expect(r.notas).toEqual(esperado === null ? ['motivo_codigo_invalido'] : []);
    });
  it('CA-075-1: label, comment e user_id marcadores não chegam à saída', () => {
    const r = derivarBloqueios([v(T1, true, 'LABEL_X', { label: 'LABEL_X', comment: 'COMMENT_X', user_id: 'USER_X' } as object)]);
    const s = JSON.stringify(r);
    for (const m of ['LABEL_X', 'COMMENT_X', 'USER_X']) expect(s).not.toContain(m);
  });
  it('coluna do evento aceita texto, número ou ausência, e is_blocked aceita 1', () => {
    const r = derivarBloqueios([
      v(T1, 1, 1, { columnId: 'abc' }), v(T2, false, undefined, { columnId: undefined }),
      v(T3, true, 1, { columnId: 9 }), v(T4, 0, undefined, { columnId: { x: 1 } }),
    ]);
    expect(r.eventos.map((e) => e.colunaId)).toEqual(['abc', null, '9', null]);
  });
});
