import { migracao } from '../src/plataforma/db/executar.js';
import type { Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Três schemas nativos e a função do gatilho de imutabilidade. `dspd_core` fica no down: abriga a tabela
 * `pgmigrations` (criada antes da 0001 pelo runner). O down só remove schemas vazios; nunca DROP ... CASCADE.
 */
export const ddl = (S: Esquemas): Ddl => ({
  up: [
    `CREATE SCHEMA IF NOT EXISTS ${S.bm}`,
    `CREATE SCHEMA IF NOT EXISTS ${S.ac}`,
    `CREATE SCHEMA IF NOT EXISTS ${S.core}`,
    `CREATE FUNCTION ${S.core}.proibir_alteracao() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN
  RAISE EXCEPTION 'tabela % é append-only: % não é permitido', TG_TABLE_NAME, TG_OP USING ERRCODE = '55000';
END
$f$`,
  ],
  down: [`DROP FUNCTION ${S.core}.proibir_alteracao()`, `DROP SCHEMA ${S.ac}`, `DROP SCHEMA ${S.bm}`],
});
export const { up, down } = migracao(ddl);
