import { describe, expect, it } from 'vitest';
import type { FaseDeteccao } from '@metricas-dspd/contratos';
import { colunaDoPaiEm, faseDeDeteccao, TIPOS_DE_BUG, type PaiParaFase } from '../src/modulos/businessmap/fase-deteccao.js';

// Pedido 105 (E7.5): regra da coluna do card da demanda na abertura do bug. Ids e instantes inventados; as cinco fases e os papéis estão escritos AQUI.
const MAPA: ReadonlyMap<string, FaseDeteccao> = new Map<string, FaseDeteccao>([
  ['10', 'Desenvolvimento'], ['20', 'Revisão de código'], ['30', 'Teste interno'], ['40', 'Homologação do negócio'], ['50', 'Produção'],
]);
const PAPEIS: Record<string, string> = { '1': 'backlog', '2': 'compromisso', '10': 'trabalho', '99': 'trabalho' };
const papel = (c: string): string | null => PAPEIS[c] ?? null;
const em = (iso: string): Date => new Date(iso);
const T = em('2026-10-10T12:00:00Z');
const BUG: { criadoEm: Date; cardPai: string | null } = { criadoEm: T, cardPai: '7' };
const tr = (origem: string | null, destino: string, iso: string) => ({ origem, destino, em: em(iso) });
const pai = (extra: Partial<PaiParaFase> = {}): PaiParaFase => ({ concluidoEm: null, colunaAtualId: '50', transicoes: [], ...extra });
const fase = (p: PaiParaFase | undefined, bug = BUG) => faseDeDeteccao(bug, p, MAPA, papel);

describe('colunaDoPaiEm: a coluna do pai no instante do bug', () => {
  const historia = [tr(null, '1', '2026-10-01T09:00:00Z'), tr('1', '10', '2026-10-05T09:00:00Z'), tr('10', '20', '2026-10-12T09:00:00Z')];

  it('é o destino da última transição até o instante, mesmo com a lista fora de ordem', () => {
    expect(colunaDoPaiEm(pai({ transicoes: [...historia].reverse() }), T)).toBe('10');
  });

  it('transição exatamente no instante do bug já conta (<=)', () => {
    expect(colunaDoPaiEm(pai({ transicoes: [tr('1', '10', '2026-10-10T12:00:00Z')] }), T)).toBe('10');
    expect(colunaDoPaiEm(pai({ transicoes: [tr('1', '10', '2026-10-10T12:00:00.001Z')] }), T)).toBe('1');
  });

  it('todas as transições depois do bug: a coluna inicial, a origem da primeira (ou o destino dela quando a origem é nula, a primeira entrada do card)', () => {
    expect(colunaDoPaiEm(pai({ transicoes: [tr('1', '10', '2026-10-11T09:00:00Z'), tr('10', '20', '2026-10-12T09:00:00Z')] }), T)).toBe('1');
    expect(colunaDoPaiEm(pai({ transicoes: [tr(null, '1', '2026-10-11T09:00:00Z'), tr('1', '10', '2026-10-12T09:00:00Z')] }), T)).toBe('1');
  });

  it('sem nenhuma transição: a coluna atual; sem ela, nulo', () => {
    expect(colunaDoPaiEm(pai({ colunaAtualId: '20' }), T)).toBe('20');
    expect(colunaDoPaiEm(pai({ colunaAtualId: null }), T)).toBeNull();
  });

  it('duas transições no mesmo instante: vence a de destino maior na ordem neutra, sempre a mesma', () => {
    const a = [tr('1', '10', '2026-10-05T09:00:00Z'), tr('1', '20', '2026-10-05T09:00:00Z')];
    expect(colunaDoPaiEm(pai({ transicoes: a }), T)).toBe(colunaDoPaiEm(pai({ transicoes: [...a].reverse() }), T));
  });
});

describe('faseDeDeteccao', () => {
  it('cada coluna do mapa vira a sua fase', () => {
    for (const [coluna, f] of MAPA) expect(fase(pai({ transicoes: [tr(null, coluna, '2026-10-01T09:00:00Z')] })).fase, coluna).toBe(f);
  });

  it('pai já entregue na criação do bug é Produção, sem olhar a coluna (nem a do mapa nem a sem mapa)', () => {
    expect(fase(pai({ concluidoEm: em('2026-10-09T00:00:00Z'), transicoes: [tr(null, '10', '2026-10-01T09:00:00Z')] }))).toEqual({ fase: 'Produção', nota: null });
    expect(fase(pai({ concluidoEm: T, colunaAtualId: '1' }))).toEqual({ fase: 'Produção', nota: null });
  });

  it('pai concluído só depois do bug conta pela coluna do instante, não por Produção', () => {
    const r = fase(pai({ concluidoEm: em('2026-10-10T12:00:00.001Z'), transicoes: [tr(null, '20', '2026-10-01T09:00:00Z'), tr('20', '50', '2026-10-11T09:00:00Z')] }));
    expect(r).toEqual({ fase: 'Revisão de código', nota: null });
  });

  it('bug sem card pai: sem fase e nota bug_sem_card_pai', () => {
    expect(fase(undefined, { criadoEm: T, cardPai: null })).toEqual({ fase: null, nota: 'bug_sem_card_pai' });
  });

  it('pai fora da base: sem fase e nota bug_pai_fora_da_base (nunca inferida)', () => {
    expect(fase(undefined)).toEqual({ fase: null, nota: 'bug_pai_fora_da_base' });
  });

  it('pai sem nenhuma coluna conhecida: fase_pai_sem_coluna', () => {
    expect(fase(pai({ colunaAtualId: null }))).toEqual({ fase: null, nota: 'fase_pai_sem_coluna' });
  });

  it('P-2: pai em coluna de papel backlog ou compromisso fica sem fase, com a nota própria', () => {
    expect(fase(pai({ transicoes: [tr(null, '1', '2026-10-01T09:00:00Z')] }))).toEqual({ fase: null, nota: 'fase_pai_antes_do_desenvolvimento' });
    expect(fase(pai({ transicoes: [tr(null, '2', '2026-10-01T09:00:00Z')] }))).toEqual({ fase: null, nota: 'fase_pai_antes_do_desenvolvimento' });
  });

  it('coluna sem linha no mapa e de outro papel: fase_sem_mapa; coluna sem papel conhecido também', () => {
    expect(fase(pai({ transicoes: [tr(null, '99', '2026-10-01T09:00:00Z')] }))).toEqual({ fase: null, nota: 'fase_sem_mapa' });
    expect(fase(pai({ transicoes: [tr(null, '12345', '2026-10-01T09:00:00Z')] }))).toEqual({ fase: null, nota: 'fase_sem_mapa' });
  });

  it('mapa com valor fora das cinco fases não vira fase', () => {
    const ruim = new Map([['10', 'Planejamento']]) as unknown as ReadonlyMap<string, FaseDeteccao>;
    expect(faseDeDeteccao(BUG, pai({ transicoes: [tr(null, '10', '2026-10-01T09:00:00Z')] }), ruim, papel)).toEqual({ fase: null, nota: 'fase_sem_mapa' });
  });

  it('o bug é o Bug interno e o Defeito em produção, nada mais', () => {
    expect([...TIPOS_DE_BUG]).toEqual(['Bug interno', 'Defeito em produção']);
  });
});
