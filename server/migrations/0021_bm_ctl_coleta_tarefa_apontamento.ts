import { migracao } from '../src/plataforma/db/executar.js';
import { lista, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 059 (K-193, ADR 0025 item 3), A1: a coleta do worklog tem fonte e marca d'água próprias em `ctl_coleta` (tarefa `apontamento`).
 * Não reaproveita `coleta_incremental`: a marca d'água, a retomada da carga inicial e as execuções interrompidas dos cards leem essa
 * tarefa, e as do worklog não podem se misturar com elas. Só amplia a lista fechada do CHECK; nenhuma linha existente muda.
 */
const ANTES = ['coleta_incremental', 'varredura', 'webhook', 'projecao', 'reconciliacao'] as const;

export const ddl = (S: Esquemas): Ddl => ({
  up: [
    `ALTER TABLE ${S.bm}.ctl_coleta DROP CONSTRAINT ctl_coleta_tarefa_check`,
    `ALTER TABLE ${S.bm}.ctl_coleta ADD CONSTRAINT ctl_coleta_tarefa_check CHECK (tarefa IN (${lista([...ANTES, 'apontamento'])}))`,
  ],
  down: [
    `ALTER TABLE ${S.bm}.ctl_coleta DROP CONSTRAINT ctl_coleta_tarefa_check`,
    `ALTER TABLE ${S.bm}.ctl_coleta ADD CONSTRAINT ctl_coleta_tarefa_check CHECK (tarefa IN (${lista(ANTES)}))`,
  ],
});
export const { up, down } = migracao(ddl);
