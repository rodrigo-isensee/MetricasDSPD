import { randomBytes } from 'node:crypto';
import { sql, type Kysely } from 'kysely';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { conectar, criarMigrator, MIGRACOES } from '../src/db/migracoes.js';
import { gravarStgCard } from '../src/db/staging.js';

/**
 * Requer MySQL 8.4 descartável em MYSQL_TEST_URL (usuário com DDL). DESTRUTIVO: recria dspd_bm/dspd_ac/dspd_core.
 * Sem a variável (ex.: sem Docker), os testes ficam pulados = pendente de ambiente.
 * Subir: docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=senha mysql:8.4
 */
const url = process.env.MYSQL_TEST_URL;
const d = describe.skipIf(!url);

d('migrações contra MySQL 8', () => {
  let db: Kysely<unknown>;
  const total = Object.keys(MIGRACOES).length;
  const contar = async (schema: string): Promise<number> => {
    const r = await sql<{ n: string }>`SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ${schema}`.execute(db);
    return Number(r.rows[0]!.n);
  };
  const limpar = async (): Promise<void> => {
    for (const s of ['dspd_bm', 'dspd_ac', 'dspd_core']) await sql.raw(`DROP DATABASE IF EXISTS ${s}`).execute(db);
  };

  beforeAll(async () => { db = conectar(url!); await limpar(); });
  afterAll(async () => { await limpar(); await db.destroy(); });

  it('up, down, up (reversível) e reaplicação não faz nada', async () => {
    const m = criarMigrator(db);
    const a = await m.migrateToLatest();
    expect(a.error).toBeUndefined();
    expect(a.results).toHaveLength(total);
    const tabelas = [await contar('dspd_bm'), await contar('dspd_ac'), await contar('dspd_core')];
    expect(tabelas.every((n) => n > 0)).toBe(true);

    for (let i = 0; i < total; i++) expect((await m.migrateDown()).error).toBeUndefined();
    expect(await contar('dspd_bm')).toBe(0);
    expect(await contar('dspd_ac')).toBe(0);

    expect((await m.migrateToLatest()).error).toBeUndefined();
    expect([await contar('dspd_bm'), await contar('dspd_ac'), await contar('dspd_core')]).toEqual(
      [tabelas[0], tabelas[1], tabelas[2]]);
    const de_novo = await m.migrateToLatest();
    expect(de_novo.results ?? []).toHaveLength(0);
  });

  it('tabela de controle do Migrator fica em dspd_core', async () => {
    const r = await sql<{ n: string }>`SELECT COUNT(*) AS n FROM dspd_core.kysely_migration`.execute(db);
    expect(Number(r.rows[0]!.n)).toBe(total);
  });

  it('CHECK de sistema_origem recusa o domínio errado', async () => {
    await expect(sql`INSERT INTO dspd_bm.stg_revision (card_id, revision_id, payload_sha256, payload, sistema_origem, coletado_em, coleta_id)
      VALUES ('x', 'y', ${Buffer.alloc(32)}, '{}', 'acelerato', NOW(3), 1)`.execute(db)).rejects.toBeDefined();
  });

  describe('staging: borda A -> B -> A e concorrência', () => {
    let coleta = 0;
    const h = (s: string): Buffer => Buffer.from(s.padEnd(32, '0').slice(0, 32));
    beforeAll(async () => {
      await sql`INSERT INTO dspd_bm.ctl_coleta (tarefa, iniciado_em, status, versao_coletor)
        VALUES ('coleta_incremental', NOW(3), 'em_andamento', 'teste')`.execute(db);
      coleta = Number((await sql<{ i: string }>`SELECT LAST_INSERT_ID() AS i`.execute(db)).rows[0]!.i);
    });
    const qtd = async (id: string): Promise<number> =>
      Number((await sql<{ n: string }>`SELECT COUNT(*) AS n FROM dspd_bm.stg_card WHERE id_origem = ${id}`.execute(db)).rows[0]!.n);
    const grava = (id: string, v: string) => gravarStgCard(db, id, { v }, h(v), coleta, new Date());

    it('A, B, A gera 3 linhas; recoleta idêntica de A não gera nenhuma', async () => {
      expect(await grava('c1', 'A')).toBe('inserido');
      expect(await grava('c1', 'B')).toBe('inserido');
      expect(await grava('c1', 'A')).toBe('inserido');
      expect(await grava('c1', 'A')).toBe('ja_existente');
      expect(await qtd('c1')).toBe(3);
    });

    it('gravações concorrentes do mesmo conteúdo geram uma só linha (1062 vira já existente)', async () => {
      const r = await Promise.all(Array.from({ length: 8 }, () => grava('c2', 'X')));
      expect(r.filter((x) => x === 'inserido')).toHaveLength(1);
      expect(await qtd('c2')).toBe(1);
    });

    it('cadeia permanece linear sob concorrência de conteúdos diferentes', async () => {
      await Promise.all(Array.from({ length: 6 }, () => grava('c3', randomBytes(4).toString('hex'))));
      const r = await sql<{ n: string }>`SELECT COUNT(DISTINCT anterior_sk) AS n FROM dspd_bm.stg_card WHERE id_origem = 'c3'`.execute(db);
      expect(Number(r.rows[0]!.n)).toBe(await qtd('c3'));
    });

    it('UNIQUE recusa duas versões sobre a mesma anterior', async () => {
      await expect(sql`INSERT INTO dspd_bm.stg_card (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id)
        VALUES ('c4', 0, ${h('P')}, '{}', 'q', 0, 0, NOW(3), ${coleta}), ('c4', 0, ${h('Q')}, '{}', 'q', 0, 0, NOW(3), ${coleta})`.execute(db))
        .rejects.toMatchObject({ errno: 1062 });
    });
  });
});
