import type { MigrationBuilder } from 'node-pg-migrate';
import type { Ddl } from './ddl.js';
import { esquemasDoAmbiente, type Esquemas } from './esquemas.js';

/** `up`/`down` do node-pg-migrate a partir de `ddl(S)`: o SQL revisado é o SQL que roda (sem helpers de alto nível). */
export function migracao(ddl: (S: Esquemas) => Ddl): {
  up: (pgm: MigrationBuilder) => void;
  down: (pgm: MigrationBuilder) => void;
} {
  const rodar = (pgm: MigrationBuilder, instrucoes: string[]): void => {
    for (const i of instrucoes) pgm.sql(i);
  };
  return {
    up: (pgm) => rodar(pgm, ddl(esquemasDoAmbiente()).up),
    down: (pgm) => rodar(pgm, ddl(esquemasDoAmbiente()).down),
  };
}
