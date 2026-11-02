import { migracao } from '../src/plataforma/db/executar.js';
import { appendOnly, COLETA_FK, drop, DT, ENUM, IDENT, IDN, indice, tabela, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 059 (K-193), A1: eventos do worklog (ADR 0025 item 7; ADR 0020, revisão 4, R4-2b). Append-only (gatilho). Só as colunas da
 * lista fechada: nunca payload, autor, `user_id`, valor antigo ou novo, nem comentário. `tipo` aceita só o que a varredura de presença
 * produz (`excluido_detectado` e `reaparecido`): `excluido_origem` e `transferido` só entram com o histórico liberado (nova migração).
 * Chave natural `UNIQUE (logged_time_id, tipo, chave_ocorrencia)`: na varredura, `chave_ocorrencia` é a data civil da detecção
 * (America/Sao_Paulo), então sobreposição e reexecução no mesmo dia não duplicam (A1 do review de modelagem).
 */
export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  return {
    up: [
      tabela(S, 'businessmap', 'evt_apontamento', `${IDENT('evento_sk')} PRIMARY KEY,
  ${IDN('logged_time_id')}, ${IDN('card_id')},
  ${ENUM('tipo', ['excluido_detectado', 'reaparecido'])},
  ${ENUM('origem', ['varredura', 'historico'])},
  chave_ocorrencia varchar(64) NOT NULL CHECK (chave_ocorrencia ~ '^[0-9A-Za-z:_.-]+$'),
  ${DT('ocorrido_em', true)}, ${DT('detectado_em')}, coleta_id bigint NOT NULL,
  CONSTRAINT uq_evt_apontamento UNIQUE (logged_time_id, tipo, chave_ocorrencia),
  ${COLETA_FK(s, 'evt_apontamento')}`),
      indice(s, 'ix_evt_apontamento_ultimo', 'evt_apontamento', 'logged_time_id, evento_sk DESC'),
      indice(s, 'ix_evt_apontamento_coleta', 'evt_apontamento', 'coleta_id'),
      ...appendOnly(S, s, 'evt_apontamento'),
    ],
    down: drop(`${s}.evt_apontamento`),
  };
};
export const { up, down } = migracao(ddl);
