import { migracao } from '../src/plataforma/db/executar.js';
import { lista, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

// Coletor do Acelerato, F1 (ADR 0023; data-model §4): marca de saída do recorte e `CHECK` dos status de SLA no staging.
// Aditiva: `ADD COLUMN ... NOT NULL DEFAULT false` não reescreve a tabela (PostgreSQL 11+); linhas antigas ficam `false`.
// O GRANT do coletor continua o gerado por `gerarGrants` (SELECT e INSERT em `stg_*`; sem UPDATE nem DELETE, que os gatilhos barram também).
// Os quatro valores de status de SLA são os da origem (`acelerato-listas.md` §9); o veredito de dois valores é do normalizador (F2).
const STATUS_SLA = ['REALIZADO_NO_PRAZO', 'REALIZADO_APOS_VENCIMENTO', 'DENTRO_DO_PRAZO', 'VENCIDO'];
const chave = (k: string): string => `(payload->>'${k}')`;
const valido = (k: string): string => `${chave(k)} IS NULL OR ${chave(k)} IN (${lista(STATUS_SLA)})`;

export const ddl = (S: Esquemas): Ddl => ({
  up: [
    `ALTER TABLE ${S.ac}.stg_chamado ADD COLUMN IF NOT EXISTS fora_do_recorte boolean NOT NULL DEFAULT false`,
    `ALTER TABLE ${S.ac}.stg_chamado ADD CONSTRAINT ck_stg_chamado_status_sla CHECK ((${valido('sla_pa_status')}) AND (${valido('sla_r_status')}))`,
  ],
  down: [
    `ALTER TABLE ${S.ac}.stg_chamado DROP CONSTRAINT IF EXISTS ck_stg_chamado_status_sla`,
    `ALTER TABLE ${S.ac}.stg_chamado DROP COLUMN IF EXISTS fora_do_recorte`,
  ],
});
export const { up, down } = migracao(ddl);
