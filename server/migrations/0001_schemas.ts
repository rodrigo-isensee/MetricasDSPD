import type { Kysely } from 'kysely';
import { executar, type Ddl } from './_util.js';

export const ddl: Ddl = {
  up: ['dspd_bm', 'dspd_ac', 'dspd_core'].map(
    (s) => `CREATE DATABASE IF NOT EXISTS ${s} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
  ),
  // dspd_core fica: abriga a tabela do Migrator (criada antes de 0001). down de 0001 só remove bancos vazios (as demais migrações já foram revertidas); nunca DROP ... CASCADE.
  down: ['dspd_ac', 'dspd_bm'].map((s) => `DROP DATABASE IF EXISTS ${s}`),
};
export const up = (db: Kysely<unknown>) => executar(db, ddl.up);
export const down = (db: Kysely<unknown>) => executar(db, ddl.down);
