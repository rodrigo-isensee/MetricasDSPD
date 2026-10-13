import { migracao } from '../src/plataforma/db/executar.js';
import type { Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

// S7 (FA-003): indicador derivado "a justificativa do ajuste de prioridade foi preenchida". Só o booleano; o texto livre
// continua fora do analítico (data-model §9). Aditiva e independente das demais migrações (só depende de 0008/0009).
// `ADD COLUMN ... NOT NULL DEFAULT false` não reescreve a tabela (PostgreSQL 11+); linhas antigas ficam `false`.
const TABELAS = ['dim_chamado', 'dim_chamado_versao'] as const;
export const ddl = (S: Esquemas): Ddl => ({
  up: TABELAS.map((t) => `ALTER TABLE ${S.ac}.${t} ADD COLUMN IF NOT EXISTS justificativa_informada boolean NOT NULL DEFAULT false`),
  down: TABELAS.map((t) => `ALTER TABLE ${S.ac}.${t} DROP COLUMN IF EXISTS justificativa_informada`),
});
export const { up, down } = migracao(ddl);
