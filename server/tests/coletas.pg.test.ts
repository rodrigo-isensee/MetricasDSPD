import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { estadoColeta, historicoColetas } from '../src/modulos/operacao/servico.js';
import { poolDe, S, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

d('estado de coleta contra PostgreSQL 17', () => {
  let db: pg.Pool;
  beforeAll(async () => {
    db = poolDe();
    await db.query(`INSERT INTO ${S.bm}.ctl_coleta (tarefa, iniciado_em, finalizado_em, status, versao_coletor, erro_resumo) VALUES
      ('coleta_incremental', '2026-10-08 09:00:00+00', '2026-10-08 09:01:00+00', 'sucesso', 'sha', NULL),
      ('coleta_incremental', '2026-10-09 09:00:00+00', '2026-10-09 09:01:00+00', 'falha', 'sha', 'tempo-esgotado: x')`);
    await db.query(`INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
      VALUES ('2026-10-01', 'businessmap', 'critério', 'teste', 'PR-1', now())`);
  });
  afterAll(async () => { await db.end(); });

  it('BM separado do AC: falha no BM, AC sem coleta (versões de critério lidas do core)', async () => {
    const agora = new Date('2026-10-09T21:00:00Z');
    const bm = await estadoColeta(db, 'businessmap', agora, S);
    expect(bm.selo).toBe('falha');
    expect((await estadoColeta(db, 'acelerato', agora, S)).selo).toBe('sem-coleta');
    expect((await historicoColetas(db, 'businessmap', 1, S)).total).toBeGreaterThanOrEqual(2);
  });
});
