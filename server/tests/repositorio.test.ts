import { describe, expect, it } from 'vitest';
import { lerEventos, lerVersoes } from '../src/coletas/repositorio.js';
import { estadoColeta, historicoColetas } from '../src/coletas/servico.js';
import { criarDubleDb } from './duble-db.js';

const coleta = (id: string, status: string, erro: string | null = null) => ({
  coleta_id: id, iniciado_em: new Date('2026-10-08T09:00:00Z'), finalizado_em: new Date('2026-10-08T09:01:00Z'),
  status, erro_resumo: erro,
});
const responder = (c: { sql: string }): unknown[] => {
  if (c.sql.includes('ctl_coleta_contagem'))
    return [
      { coleta_id: '1', entidade: 'card', lidos: '10', inseridos: '4', ja_existentes: '6' },
      { coleta_id: '1', entidade: 'card', lidos: '5', inseridos: '1', ja_existentes: '4' },
    ];
  if (c.sql.includes('ctl_coleta')) return [coleta('1', 'sucesso'), coleta('2', 'falha', 'tempo-esgotado: x'), coleta('3', 'parcial')];
  return [];
};

describe('lerEventos', () => {
  it('consulta só o schema da fonte e agrega contagens por coleta', async () => {
    const { db, chamadas } = criarDubleDb(responder);
    const ev = await lerEventos(db, 'businessmap');
    expect(chamadas.every((c) => c.sql.includes('dspd_bm.') && !c.sql.includes('dspd_ac'))).toBe(true);
    expect(ev.map((e) => e.id)).toEqual(['bm-1', 'bm-2', 'bm-3']);
    expect(ev[0]!.contagens).toMatchObject({ lidos: 15, novos: 5, atualizados: 10 });
    expect(ev[1]).toMatchObject({ resultado: 'falha', tipoErro: 'tempo-esgotado', contagens: null });
    expect(ev[2]!.contagens).toMatchObject({ lidos: 0 });
  });

  it('acelerato usa dspd_ac e prefixo ac', async () => {
    const { db, chamadas } = criarDubleDb(responder);
    expect((await lerEventos(db, 'acelerato'))[0]!.id).toBe('ac-1');
    expect(chamadas[0]!.sql).toContain('dspd_ac.ctl_coleta');
  });
});

describe('lerVersoes', () => {
  it('agrupa métricas por versão e ignora ids desconhecidos ou nulos', async () => {
    const d = new Date('2026-09-01T12:00:00Z');
    const { db, chamadas } = criarDubleDb(() => [
      { versao_id: '1', vigente_desde: d, descricao: 'a', metrica_id: 'O2' },
      { versao_id: '1', vigente_desde: d, descricao: 'a', metrica_id: 'O3' },
      { versao_id: '1', vigente_desde: d, descricao: 'a', metrica_id: 'XX' },
      { versao_id: '2', vigente_desde: d, descricao: 'b', metrica_id: null },
    ]);
    const v = await lerVersoes(db, 'businessmap');
    expect(chamadas[0]!.parametros).toEqual(['businessmap']);
    expect(v).toHaveLength(2);
    expect(v[0]).toMatchObject({ id: '1', data: '2026-09-01' });
    expect(v[0]!.afeta).toHaveLength(2);
    expect(v[1]!.afeta).toEqual([]);
  });
});

describe('servico', () => {
  it('estado de uma fonte sem coletas', async () => {
    const { db } = criarDubleDb();
    expect((await estadoColeta(db, 'acelerato', new Date('2026-10-09T21:00:00Z'))).selo).toBe('sem-coleta');
  });
  it('estado reflete falha mais recente', async () => {
    const { db } = criarDubleDb((c) => (c.sql.includes('ctl_coleta_contagem') ? [] : c.sql.includes('ctl_coleta') ? [coleta('2', 'falha', 'tempo-esgotado: x')] : []));
    expect((await estadoColeta(db, 'businessmap', new Date('2026-10-08T21:00:00Z'))).selo).toBe('falha');
  });
  it('histórico paginado', async () => {
    const { db } = criarDubleDb(responder);
    expect((await historicoColetas(db, 'businessmap', 1)).total).toBe(3);
  });
});
