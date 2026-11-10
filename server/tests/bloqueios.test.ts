import { describe, expect, it } from 'vitest';
import { derivarBloqueios, type VersaoBloqueio } from '../src/modulos/businessmap/bloqueios.js';

const v = (t: string, isBlocked: unknown, blockReasonId?: unknown, extra: object = {}): VersaoBloqueio =>
  ({ cardId: 'C1', coletadoEm: t, isBlocked, blockReasonId, columnId: 7, ...extra });
const T1 = '2026-11-01T10:00:00.000Z', T2 = '2026-11-02T10:00:00.000Z', T3 = '2026-11-03T10:00:00.000Z', T4 = '2026-11-04T10:00:00.000Z';

const T5 = '2026-11-05T10:00:00.000Z', T6 = '2026-11-06T10:00:00.000Z';
const mapa = new Map([['F1', 'fornecedor']]);
const campo = (valor: unknown) => ({ customFields: [{ field_id: 'F1', valor }] });
const marcos = { entrega: (c: string) => c === '90', descarte: (c: string) => c === '91' };

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
  it.each([[12, '12'], ['0034', '34'], [null, null], [undefined, null], ['abc', null], ['12345678901', null], [1.5, null], [{ id: 1 }, null]])(
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
    expect(r.eventos.map((e) => e.colunaId)).toEqual([null, null, '9', null]);
  });
  it('o fim não grava o motivo da versão que desbloqueia (QA A1)', () => {
    expect(derivarBloqueios([v(T1, true, 5), v(T2, false, 7)]).eventos[1]!.motivoCodigo).toBeNull();
  });
  it('is_blocked ausente ou inválido não fecha nem abre e deixa nota (review A2)', () => {
    const r = derivarBloqueios([v(T1, true, 1), v(T2, undefined), v(T3, 'x'), v(T4, false)]);
    expect(r.eventos.map((e) => [e.tipo, e.ocorridoEm])).toEqual([['inicio', T1], ['fim', T4]]);
    expect(r.notas).toEqual(['is_blocked_invalido', 'is_blocked_invalido']);
    expect(derivarBloqueios([v(T1, undefined)]).eventos).toEqual([]);
  });
  it.each([
    ['arquivado depois da coleta (SEG-A1: nunca depois dela)', { archivedAt: T3 }, {}, T2], ['arquivado entre o início e a coleta', { archivedAt: '2026-11-01T18:00:00.000Z' }, {}, '2026-11-01T18:00:00.000Z'], ['excluído', { excluidoDetectado: true }, {}, T2],
    ['entregue', { columnId: 90 }, marcos, T2], ['descartado', { columnId: 91 }, marcos, T2],
  ])('card %s bloqueado fecha no marco (P-075-5)', (_n, extra, m, fim) => {
    const r = derivarBloqueios([v(T1, true, 1), v(T2, true, 1, extra)], m);
    expect(r.eventos.map((e) => [e.tipo, e.ocorridoEm])).toEqual([['inicio', T1], ['fim', fim]]);
  });
  it('marco anterior ao início observado dá fim = início (P-075-9)', () => {
    const r = derivarBloqueios([v(T2, true, 1), v(T3, true, 1, { archivedAt: T1 })]);
    expect(r.eventos.map((e) => e.ocorridoEm)).toEqual([T2, T2]);
  });
  it('arquivado que volta ativo e bloqueado abre bloqueio novo com a versão que reabriu (TL-A5)', () => {
    const r = derivarBloqueios([v(T1, true, 1), v(T2, true, 1, { archivedAt: T2 }), v(T3, true, 2), v(T4, false)]);
    expect(r.eventos.map((e) => [e.tipo, e.ocorridoEm, e.motivoCodigo])).toEqual([['inicio', T1, '1'], ['fim', T2, null], ['inicio', T3, '2'], ['fim', T4, null]]);
    expect(r.eventos[2]!.idOrigem).not.toBe(r.eventos[0]!.idOrigem);
  });
  it('arquivado e bloqueado com versões seguintes no marco: zero evento novo (TL-A9)', () => {
    const noMarco = { archivedAt: T2 };
    expect(derivarBloqueios([v(T2, true, 1, noMarco), v(T3, true, 1, noMarco), v(T4, true, 1, noMarco), v(T5, true, 1, { columnId: 90 })], marcos).eventos).toEqual([]);
    expect(derivarBloqueios([v(T1, true, 1, { columnId: 90 }), v(T2, true, 1, { columnId: 90 })], marcos).eventos).toEqual([]);
  });
  it('fornecedor do início: presente, ausente e trocado depois (P-075-4)', () => {
    const r = derivarBloqueios([v(T1, true, 1, campo('A')), v(T2, true, 1, campo('B')), v(T3, false, 1, campo('C')),
      v(T4, true, 1), v(T5, false), v(T6, true, 1, campo('D'))], {}, mapa);
    expect(r.eventos.map((e) => e.fornecedorCodigo)).toEqual(['A', null, null, null, 'D']);
  });
  it('archivedAt como Date fecha (2b A1); coletadoEm inválido lança sem eco (2b A2); a nota é só do fornecedor (2b A3)', () => {
    expect(derivarBloqueios([v(T1, true, 1), v(T2, true, 1, { archivedAt: new Date(T1) })]).eventos.map((e) => e.ocorridoEm)).toEqual([T1, T1]);
    expect(() => derivarBloqueios([v('LIXO-X', false)])).toThrow(/^coletadoEm inválido$/);
    const outro = new Map([['F1', 'fornecedor'], ['F2', 'sistema']]);
    expect(derivarBloqueios([v(T1, true, 1, { customFields: [{ field_id: 'F2', valor: '' }] })], {}, outro).notas).not.toContain('campo_fora_do_dominio');
  });
  it('CA-075-12: fornecedor só de custom_fields mapeado, nunca de outro campo', () => {
    const r = derivarBloqueios([v(T1, true, 1, { fornecedor: 'FORA_X', label: 'FORA_Y', customFields: [{ field_id: 'F9', valor: 'FORA_Z' }] })], {}, mapa);
    expect(r.eventos[0]!.fornecedorCodigo).toBeNull();
    expect(derivarBloqueios([v(T1, true, 1, campo(''))], {}, mapa).notas).toContain('campo_fora_do_dominio');
  });
});
