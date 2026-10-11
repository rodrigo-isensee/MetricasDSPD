import { migracao } from '../src/plataforma/db/executar.js';
import { DT, ENUM, IDENT, drop, indice, tabelaPlana, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/** Outbox transacional (ADR 0014, data-model §5): operacional, sem gatilho de imutabilidade; lida por polling. */
export const ddl = (S: Esquemas): Ddl => {
  const s = S.core;
  return {
    up: [
      tabelaPlana(s, 'outbox', `${IDENT('evento_sk')} PRIMARY KEY,
  evento_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ${ENUM('fonte', ['businessmap', 'acelerato'])},
  tipo varchar(64) NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','processando','processado','falha')),
  tentativas smallint NOT NULL DEFAULT 0 CHECK (tentativas >= 0),
  ${DT('criado_em')} DEFAULT now(), ${DT('disponivel_em')} DEFAULT now(),
  ${DT('reservado_ate', true)}, ${DT('processado_em', true)},
  ultimo_erro varchar(500) NULL,
  CONSTRAINT uq_outbox_evento_id UNIQUE (evento_id)`),
      indice(s, 'ix_outbox_fila', 'outbox', 'fonte, disponivel_em, evento_sk', "status IN ('pendente','processando')"),
      indice(s, 'ix_outbox_retencao', 'outbox', 'processado_em', "status = 'processado'"),
    ],
    down: drop(`${s}.outbox`),
  };
};
export const { up, down } = migracao(ddl);
