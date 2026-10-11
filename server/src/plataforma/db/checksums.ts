import { createHash } from 'node:crypto';
import type { Ddl } from './ddl.js';
import { S_PADRAO, type Esquemas } from './esquemas.js';

/** SHA-256 de `ddl(S_PADRAO)` (up + down) de uma migração. Migração já registrada não muda (ADR 0014). */
export const checksumDe = (ddl: (S: Esquemas) => Ddl): string =>
  createHash('sha256').update(JSON.stringify(ddl(S_PADRAO))).digest('hex');
