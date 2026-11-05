import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  ErroCalendario, METRICAS_CALENDARIO, analisarCalendario, lerCalendario, referenciaDaVersaoCalendario, sincronizarCalendario,
} from '../src/modulos/referencia/calendario.js';
import type { PoolLike } from '../src/plataforma/db/pool.js';
import { poolDe, S, url } from './pg/ctx.js';

// Pedido 069, E5/L7-a: `ref:sync-calendario` contra o PostgreSQL com o papel `dspd_ref`. Tudo numa transação desfeita no fim (as tabelas de
// referência são append-only e não aceitam DELETE): o COMMIT e o BEGIN do sincronizador ficam por conta da transação externa do teste.
const d = describe.skipIf(!url);
const AGORA = new Date('2031-02-10T12:00:00Z');
const D1 = '2031-02-10';
const D2 = '2031-02-11';

const texto = (feriadosBm: [string, string][], feriadosAc: [string, string][] = feriadosBm, offset = -180): string => JSON.stringify({
  versao: 1, regra: 'teste', versao_criterio: { descricao: 'Calendário de teste', motivo: 'Teste do ref:sync-calendario' },
  calendarios: [
    { nome: 'teste-bm', dominio: 'businessmap', offset_minutos: offset, feriados: feriadosBm.map(([data, descricao]) => ({ data, escopo: 'nacional', descricao })) },
    { nome: 'teste-ac', dominio: 'acelerato', offset_minutos: -180, feriados: feriadosAc.map(([data, descricao]) => ({ data, escopo: 'estadual', descricao })) },
  ],
  aplicacoes: [
    { dominio: 'businessmap', classe: 'fluxo', calendario: 'teste-bm' }, { dominio: 'businessmap', classe: 'apontamento', calendario: 'teste-bm' },
    { dominio: 'acelerato', classe: 'sustentacao', calendario: 'teste-ac' },
  ],
});

async function comoRef(ref: pg.Pool, fn: (pool: PoolLike, c: pg.PoolClient) => Promise<void>): Promise<void> {
  const c = await ref.connect();
  const livre = (t: string): boolean => ['BEGIN', 'COMMIT', 'ROLLBACK'].includes(t);
  const pool: PoolLike = {
    query: (t, v) => c.query(t, v),
    connect: () => Promise.resolve({ query: (t: string, v?: unknown[]) => (livre(t) ? Promise.resolve({ rows: [], rowCount: 0 }) : c.query(t, v)), release: () => undefined }),
    end: () => Promise.resolve(),
  };
  try {
    await c.query('BEGIN');
    await fn(pool, c);
  } finally {
    await c.query('ROLLBACK');
    c.release();
  }
}

d('ref:sync-calendario contra PostgreSQL (papel dspd_ref)', () => {
  let ref: pg.Pool;
  beforeAll(() => { ref = poolDe('dspd_ref'); });
  afterAll(async () => { await ref.end(); });

  const n = async (c: pg.PoolClient, tabela: string, onde = 'true'): Promise<number> =>
    Number((await c.query(`SELECT count(*) AS n FROM ${S.core}.${tabela} WHERE ${onde}`)).rows[0].n);
  const totais = async (c: pg.PoolClient): Promise<number[]> =>
    [await n(c, 'ref_calendario'), await n(c, 'ref_calendario_aplicacao'), await n(c, 'ref_feriado'), await n(c, 'ref_versao_criterio'), await n(c, 'ref_versao_criterio_metrica')];

  it('arquivo real: grava os dois calendários, 26 feriados em cada, as três aplicações e uma versão por domínio com as métricas; repetir não muda nada', async () => {
    await comoRef(ref, async (pool, c) => {
      const lido = lerCalendario();
      const antes = await totais(c);
      const r = await sincronizarCalendario(pool, S, lido, D1, AGORA);
      expect(r.dominios.map((x) => [x.dominio, x.calendariosNovos, x.feriadosNovos, x.aplicacoesAbertas, x.versaoRegistrada])).toEqual([
        ['businessmap', 1, 26, 2, true], ['acelerato', 1, 26, 1, true],
      ]);
      const depois = await totais(c);
      expect(depois.map((v, i) => v - antes[i]!)).toEqual([2, 3, 52, 2, METRICAS_CALENDARIO.businessmap.length + METRICAS_CALENDARIO.acelerato.length]);
      for (const dom of ['businessmap', 'acelerato'] as const) {
        const v = await c.query(`SELECT vigente_desde FROM ${S.core}.ref_versao_criterio WHERE dominio = $1 AND referencia = $2`, [dom, referenciaDaVersaoCalendario(dom, lido.sha256)]);
        expect(v.rows).toEqual([{ vigente_desde: D1 }]);
      }
      const apl = await c.query(`SELECT a.dominio, a.classe, k.nome, a.vigente_ate FROM ${S.core}.ref_calendario_aplicacao a JOIN ${S.core}.ref_calendario k USING (calendario_id)
        WHERE k.nome IN ('dspd-businessmap', 'dspd-acelerato') ORDER BY a.dominio, a.classe`);
      expect(apl.rows).toEqual([
        { dominio: 'acelerato', classe: 'sustentacao', nome: 'dspd-acelerato', vigente_ate: null },
        { dominio: 'businessmap', classe: 'apontamento', nome: 'dspd-businessmap', vigente_ate: null },
        { dominio: 'businessmap', classe: 'fluxo', nome: 'dspd-businessmap', vigente_ate: null },
      ]);
      for (const dia of [D1, D2]) {
        expect((await sincronizarCalendario(pool, S, lido, dia, AGORA)).dominios.every((x) => !x.versaoRegistrada && x.feriadosNovos === 0)).toBe(true);
      }
      expect(await totais(c)).toEqual(depois);
    });
  });

  it('segunda carga com feriado novo: só insere o novo e cria versão nova; o antigo mantém a versão em que entrou', async () => {
    await comoRef(ref, async (pool, c) => {
      const a = analisarCalendario(texto([['2031-03-03', 'Um']]));
      await sincronizarCalendario(pool, S, a, D1, AGORA);
      const b = analisarCalendario(texto([['2031-03-03', 'Um'], ['2031-04-21', 'Dois']], [['2031-03-03', 'Um']]));
      const r = await sincronizarCalendario(pool, S, b, D2, AGORA);
      expect(r.dominios.map((x) => [x.dominio, x.feriadosNovos, x.aplicacoesAbertas, x.versaoRegistrada])).toEqual([['businessmap', 1, 0, true], ['acelerato', 0, 0, false]]);
      const f = await c.query(
        `SELECT f.data::text AS data, v.referencia FROM ${S.core}.ref_feriado f JOIN ${S.core}.ref_calendario k USING (calendario_id)
         JOIN ${S.core}.ref_versao_criterio v ON v.versao_id = f.incluido_por_versao_id WHERE k.nome = 'teste-bm' ORDER BY f.data`);
      expect(f.rows).toEqual([
        { data: '2031-03-03', referencia: referenciaDaVersaoCalendario('businessmap', a.sha256) },
        { data: '2031-04-21', referencia: referenciaDaVersaoCalendario('businessmap', b.sha256) },
      ]);
      expect(await n(c, 'ref_calendario_aplicacao', `vigente_ate IS NOT NULL AND calendario_id IN (SELECT calendario_id FROM ${S.core}.ref_calendario WHERE nome LIKE 'teste-%')`)).toBe(0);
    });
  });

  it('arquivo inválido ou offset divergente recusa tudo sem gravar nada', async () => {
    await comoRef(ref, async (pool, c) => {
      const antes = await totais(c);
      for (const t of [
        texto([['2031-02-30', 'Data inexistente']]),
        texto([['2031-03-03', 'Um']]).replace('"nacional"', '"regional"'),
        texto([['2031-03-03', 'Um']]).replace('"sustentacao"', '"turno"'),
      ]) {
        expect(() => analisarCalendario(t)).toThrow(ErroCalendario);
      }
      expect(await totais(c)).toEqual(antes);
      await sincronizarCalendario(pool, S, analisarCalendario(texto([['2031-03-03', 'Um']])), D1, AGORA);
      const gravado = await totais(c);
      await expect(sincronizarCalendario(pool, S, analisarCalendario(texto([['2031-03-03', 'Um'], ['2031-04-21', 'Dois']], undefined, -120)), D2, AGORA)).rejects.toBeInstanceOf(ErroCalendario);
      expect(await totais(c)).toEqual(gravado);
    });
  });

  it('feriado gravado nunca muda: outra descrição no arquivo não sobrescreve, e o papel não tem UPDATE nem DELETE em ref_feriado', async () => {
    await comoRef(ref, async (pool, c) => {
      await sincronizarCalendario(pool, S, analisarCalendario(texto([['2031-03-03', 'Original']])), D1, AGORA);
      const r = await sincronizarCalendario(pool, S, analisarCalendario(texto([['2031-03-03', 'Trocada']])), D2, AGORA);
      expect(r.feriadosDivergentes).toBe(1);
      const f = await c.query(`SELECT descricao FROM ${S.core}.ref_feriado f JOIN ${S.core}.ref_calendario k USING (calendario_id) WHERE k.nome = 'teste-bm'`);
      expect(f.rows).toEqual([{ descricao: 'Original' }]);
    });
    for (const sql of [`UPDATE ${S.core}.ref_feriado SET descricao = 'x'`, `DELETE FROM ${S.core}.ref_feriado`]) {
      await expect(ref.query(sql), sql).rejects.toMatchObject({ code: '42501' });
    }
  });
});
