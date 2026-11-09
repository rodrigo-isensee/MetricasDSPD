import { DATA_BLOQUEIO_COM_DADO_REAL, VERSOES_DA_BIBLIOTECA, VERSAO_CRITERIO_BLOQUEIO_COM_DADO_REAL, marcacoesNoPeriodo } from '@metricas-dspd/metricas';
import { describe, expect, it } from 'vitest';
import { comCorteDaSerieO1 } from '../src/modulos/metricas/parte-sem-dado.js';

const O1 = { hoje: { total: 1 }, serie: [{ data: '2026-11-01', wip: 2, bloqueados: 1 }, { data: '2026-11-02', wip: 3, bloqueados: 0 }, { data: '2026-11-03', wip: 4, bloqueados: 2 }] };

describe('075 lote 6a: corte da série do O1 e versão de critério', () => {
  it('ligado: antes da data a série fica null (nunca zero) e da data em diante segue numérica; o resto não muda', () => {
    const r = comCorteDaSerieO1('O1', O1, true, '2026-11-02') as typeof O1;
    expect(r.serie).toEqual([{ data: '2026-11-01', wip: 2, bloqueados: null }, { data: '2026-11-02', wip: 3, bloqueados: 0 }, { data: '2026-11-03', wip: 4, bloqueados: 2 }]);
    expect(r.hoje).toBe(O1.hoje);
  });
  it('desligado, ou outra métrica: a resposta é a mesma', () => {
    expect(comCorteDaSerieO1('O1', O1, false, '2026-11-02')).toBe(O1);
    expect(comCorteDaSerieO1('O2', O1, true, '2026-11-02')).toBe(O1);
  });
  it('com a data pendente (futura) ligar o corte anula toda a série atual e nada cruza o período', () => {
    const r = comCorteDaSerieO1('O1', O1, true) as typeof O1;
    expect(r.serie.every((p) => p.bloqueados === null)).toBe(true);
    expect(marcacoesNoPeriodo('O1', { inicio: '2026-10-01', fim: '2026-12-31' }, []).map((m) => m.id)).not.toContain(VERSAO_CRITERIO_BLOQUEIO_COM_DADO_REAL.id);
  });
  it('a versão está na lista da biblioteca, com id da data, afeta as cinco e a descrição começa por histórico parcial', () => {
    expect(VERSOES_DA_BIBLIOTECA).toContain(VERSAO_CRITERIO_BLOQUEIO_COM_DADO_REAL);
    expect(VERSAO_CRITERIO_BLOQUEIO_COM_DADO_REAL.id).toBe(`criterio-${DATA_BLOQUEIO_COM_DADO_REAL}-bloqueio-com-dado-real`);
    expect(VERSAO_CRITERIO_BLOQUEIO_COM_DADO_REAL.afeta).toEqual(['O1', 'O2', 'O5', 'O19', 'BLOQUEADOS']);
    expect(VERSAO_CRITERIO_BLOQUEIO_COM_DADO_REAL.descricao.startsWith('histórico parcial de bloqueios')).toBe(true);
    expect(VERSAO_CRITERIO_BLOQUEIO_COM_DADO_REAL.descricao).toContain('instante da coleta');
  });
});
