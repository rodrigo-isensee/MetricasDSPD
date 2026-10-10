import { sql, type Kysely } from 'kysely';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { conectar, criarMigrator } from '../src/db/migracoes.js';
import { estadoColeta, historicoColetas } from '../src/coletas/servico.js';

/** Requer MySQL 8.4 descartável em MYSQL_TEST_URL (DESTRUTIVO). Sem a variável, pulado. */
const url = process.env.MYSQL_TEST_URL;
const d = describe.skipIf(!url);

d('estado de coleta contra MySQL 8', () => {
  let db: Kysely<unknown>;
  const limpar = async (): Promise<void> => {
    for (const s of ['dspd_bm', 'dspd_ac', 'dspd_core']) await sql.raw(`DROP DATABASE IF EXISTS ${s}`).execute(db);
  };
  beforeAll(async () => {
    db = conectar(url!);
    await limpar();
    expect((await criarMigrator(db).migrateToLatest()).error).toBeUndefined();
    await sql`INSERT INTO dspd_bm.ctl_coleta (tarefa, iniciado_em, finalizado_em, status, versao_coletor, erro_resumo) VALUES
      ('coleta_incremental', '2026-10-08 09:00:00', '2026-10-08 09:01:00', 'sucesso', 'sha', NULL),
      ('coleta_incremental', '2026-10-09 09:00:00', '2026-10-09 09:01:00', 'falha', 'sha', 'tempo-esgotado: x')`.execute(db);
  });
  afterAll(async () => { await limpar(); await db.destroy(); });

  it('BM separado do AC: falha no BM, AC sem coleta', async () => {
    const agora = new Date('2026-10-09T21:00:00Z');
    expect((await estadoColeta(db, 'businessmap', agora)).selo).toBe('falha');
    expect((await estadoColeta(db, 'acelerato', agora)).selo).toBe('sem-coleta');
    expect((await historicoColetas(db, 'businessmap', 1)).total).toBe(2);
  });
});
