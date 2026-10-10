import { Kysely, MysqlDialect } from 'kysely';
import { Migrator, type Migration, type MigrationProvider } from 'kysely/migration';
import { createPool } from 'mysql2';
import * as m0001 from '../../migrations/0001_schemas.js';
import * as m0002 from '../../migrations/0002_bm_controle.js';
import * as m0003 from '../../migrations/0003_ac_controle.js';
import * as m0004 from '../../migrations/0004_bm_staging.js';
import * as m0005 from '../../migrations/0005_bm_historico.js';
import * as m0006 from '../../migrations/0006_bm_projecoes.js';
import * as m0007 from '../../migrations/0007_bm_referencia.js';
import * as m0008 from '../../migrations/0008_ac_staging_historico.js';
import * as m0009 from '../../migrations/0009_ac_projecoes_referencia.js';
import * as m0010 from '../../migrations/0010_core_referencia.js';

type Modulo = Migration & { ddl: { up: string[]; down: string[] } };

/** Ordem = nome. Migração aplicada nunca é editada (ADR 0005). */
export const MIGRACOES: Record<string, Modulo> = {
  '0001_schemas': m0001, '0002_bm_controle': m0002, '0003_ac_controle': m0003,
  '0004_bm_staging': m0004, '0005_bm_historico': m0005, '0006_bm_projecoes': m0006,
  '0007_bm_referencia': m0007, '0008_ac_staging_historico': m0008,
  '0009_ac_projecoes_referencia': m0009, '0010_core_referencia': m0010,
};

const provider: MigrationProvider = { getMigrations: () => Promise.resolve(MIGRACOES) };

/** Conexão sem database padrão: todo SQL é qualificado (dspd_bm.x). Timezone UTC. */
export function conectar(url: string): Kysely<unknown> {
  const pool = createPool({ uri: url, timezone: 'Z', supportBigNumbers: true, dateStrings: false, connectionLimit: 10 });
  return new Kysely<unknown>({ dialect: new MysqlDialect({ pool }) });
}

export const criarMigrator = (db: Kysely<unknown>): Migrator =>
  new Migrator({ db, provider, migrationTableSchema: 'dspd_core', migrationTableName: 'kysely_migration',
    migrationLockTableName: 'kysely_migration_lock' });
