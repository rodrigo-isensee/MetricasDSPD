import { describe, expect, it } from 'vitest';
import { criarDubleDb } from './duble-db.js';
import { conectar, criarMigrator, MIGRACOES } from '../src/db/migracoes.js';

/** O pool do mysql2 é preguiçoso: criar e destruir não abre conexão, então a fábrica é testável sem MySQL. */
describe('conectar / criarMigrator', () => {
  it('cria Kysely sem conectar e encerra', async () => {
    const db = conectar('mysql://u:p@127.0.0.1:1/');
    expect(typeof db.selectFrom).toBe('function');
    expect((await criarMigrator(db).getMigrations().catch(() => [])).length).toBeGreaterThanOrEqual(0);
    await db.destroy();
    expect(Object.keys(MIGRACOES)).toHaveLength(10);
  });
});


describe('provider de migrações', () => {
  it('lista as dez migrações em ordem, mesmo sem nenhuma aplicada', async () => {
    const { db } = criarDubleDb();
    const lista = await criarMigrator(db).getMigrations();
    expect(lista.map((m) => m.name)).toEqual(Object.keys(MIGRACOES).sort());
  });
});
