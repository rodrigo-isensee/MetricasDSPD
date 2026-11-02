import { describe, expect, it } from 'vitest';
import { indiceTipoDaColuna, resolverTipoDasTransicoes, type VersaoTipoColuna } from '../src/modulos/businessmap/index.js';

// A4 da E2.67 (U-1 e U-2): tipo da coluna destino resolvido no dia civil da transição, pela regra única de vigência.
const v = (coluna: string, tipo: string | null, de: string, motivo: string | null): VersaoTipoColuna => ({ quadro_id: 'Q', coluna_id: coluna, tipo_coluna: tipo, vigente_de: de, motivo });
const ms = (iso: string): number => Date.parse(iso);

describe('indiceTipoDaColuna', () => {
  it('processo vale da data em diante; correção vale para todo o período; antes da primeira versão vale a primeira', () => {
    const tipoNoDia = indiceTipoDaColuna([
      v('1', 'fila', '2026-01-01', 'carga_inicial'), v('1', 'execucao', '2026-06-01', 'processo'),
      v('2', 'fila', '2026-01-01', 'carga_inicial'), v('2', 'execucao', '2026-06-01', 'correcao'),
    ]);
    expect(tipoNoDia('Q', '1', ms('2026-03-01T12:00:00Z'))).toBe('fila');
    expect(tipoNoDia('Q', '1', ms('2026-07-01T12:00:00Z'))).toBe('execucao');
    expect(tipoNoDia('Q', '2', ms('2026-03-01T12:00:00Z'))).toBe('execucao');
    expect(tipoNoDia('Q', '1', ms('2025-01-01T12:00:00Z'))).toBe('fila');
    // o mesmo dia, de novo (memo), e o dia civil é o de São Paulo (02:00Z de 1/6 ainda é 31/5)
    expect(tipoNoDia('Q', '1', ms('2026-07-01T20:00:00Z'))).toBe('execucao');
    expect(tipoNoDia('Q', '1', ms('2026-06-01T02:00:00Z'))).toBe('fila');
  });

  it('coluna sem versão ou versão sem tipo conhecido fica sem tipo', () => {
    const tipoNoDia = indiceTipoDaColuna([v('3', null, '2026-01-01', 'carga_inicial'), v('4', 'outro', '2026-01-01', 'carga_inicial')]);
    expect(tipoNoDia('Q', '9', ms('2026-03-01T12:00:00Z'))).toBeNull();
    expect(tipoNoDia('Q', '3', ms('2026-03-01T12:00:00Z'))).toBeNull();
    expect(tipoNoDia('Q', '4', ms('2026-03-01T12:00:00Z'))).toBeNull();
  });
});

describe('resolverTipoDasTransicoes', () => {
  const versoes = [v('1', 'fila', '2026-01-01', 'carga_inicial')];
  const base = { coluna_destino_id: '1', ocorrido_em: ms('2026-03-01T12:00:00Z'), tipo_coluna: null };

  it('troca o tipo do fato pelo resolvido e descarta a transição sem tipo; o quadro vem do card quando a transição não o traz', () => {
    const r = resolverTipoDasTransicoes([
      { ...base, card_id: 'a', quadro_id: 'Q' },
      { ...base, card_id: 'b', quadro_id: null },
      { ...base, card_id: 'c', quadro_id: null },
      { ...base, card_id: 'd', quadro_id: 'Q', coluna_destino_id: '7', tipo_coluna: 'fila' },
    ], versoes, new Map([['b', 'Q']]));
    expect(r.map((x) => [x.card_id, x.tipo_coluna])).toEqual([['a', 'fila'], ['b', 'fila']]);
  });

  it('correção posterior dá tipo a coluna que o fato gravou sem tipo, sem tocar o fato', () => {
    const fato = [{ ...base, card_id: 'a', quadro_id: 'Q', tipo_coluna: null }];
    const r = resolverTipoDasTransicoes(fato, [v('1', null, '2026-01-01', 'carga_inicial'), v('1', 'execucao', '2026-02-01', 'correcao')], new Map());
    expect(r[0]!.tipo_coluna).toBe('execucao');
    expect(fato[0]!.tipo_coluna).toBeNull();
  });
});
