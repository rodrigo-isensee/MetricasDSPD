import { migracao } from '../src/plataforma/db/executar.js';
import { appendOnly, COLETA_FK, drop, DT, ENUM, IDENT, IDN, indice, tabela, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 063 (K-200), plano C2 e ADR 0025 (cobertura por card): estado de cobertura do registro de horas por card do BusinessMap. Eventos
 * append-only (gatilho), um por mudança de estado: `incompleto` (a coleta não leu o card inteiro) e `completo` (leu). O estado atual do card é o
 * ÚLTIMO evento (`cobertura_sk` maior). Sem pessoa, sem horas e sem comentário: só `card_id`, o estado e a coleta. `UNIQUE (card_id, estado,
 * coleta_id)` + `ON CONFLICT DO NOTHING` (reexecução não duplica).
 *
 * Sem INSERT aqui (ADR 0014): a cópia dos cards que a carga inicial deixou no teto (`ctl_coleta_falha`, erro `lote_no_teto`) para o estado
 * `incompleto` é feita pelo coletor (`semearCoberturaDeFalhas`), no início de cada execução.
 */
export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  return {
    up: [
      tabela(S, 'businessmap', 'ctl_apontamento_cobertura', `${IDENT('cobertura_sk')} PRIMARY KEY,
  ${IDN('card_id')},
  ${ENUM('estado', ['incompleto', 'completo'])},
  coleta_id bigint NOT NULL, ${DT('detectado_em')},
  CONSTRAINT uq_ctl_apontamento_cobertura UNIQUE (card_id, estado, coleta_id),
  ${COLETA_FK(s, 'ctl_apontamento_cobertura')}`),
      indice(s, 'ix_ctl_apontamento_cobertura_card', 'ctl_apontamento_cobertura', 'card_id, cobertura_sk DESC'),
      indice(s, 'ix_ctl_apontamento_cobertura_coleta', 'ctl_apontamento_cobertura', 'coleta_id'),
      ...appendOnly(S, s, 'ctl_apontamento_cobertura'),
    ],
    down: drop(`${s}.ctl_apontamento_cobertura`),
  };
};
export const { up, down } = migracao(ddl);
