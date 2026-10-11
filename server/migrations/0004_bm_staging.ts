import { migracao } from '../src/plataforma/db/executar.js';
import {
  COLETA_FK, DT, HASH, ID, IDENT, appendOnly, drop, indice, stgVersionada, tabela, type Ddl,
} from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

const B = 'businessmap' as const;

export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  return {
    up: [
      ...stgVersionada(S, B, 'stg_card', ['id_origem'], [
        ID('quadro_id'), 'arquivado boolean NOT NULL', 'excluido_detectado boolean NOT NULL',
      ]),
      tabela(S, B, 'stg_revision', `${IDENT('revision_sk')} PRIMARY KEY,
  ${ID('card_id')}, ${ID('revision_id')},
  ${HASH}, payload jsonb NOT NULL,
  ${DT('coletado_em')}, coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_revision UNIQUE (card_id, revision_id),
  ${COLETA_FK(s, 'stg_revision')}`),
      indice(s, 'ix_stg_revision_coleta', 'stg_revision', 'coleta_id'),
      indice(s, 'ix_stg_revision_coletado', 'stg_revision', 'coletado_em'),
      ...appendOnly(S, s, 'stg_revision'),
      // stg_vinculo não tem id_origem: o par pai/filho é a chave do item
      ...stgVersionada(S, B, 'stg_vinculo', ['pai_id', 'filho_id']),
      ...stgVersionada(S, B, 'stg_custom_field', ['id_origem']),
      ...stgVersionada(S, B, 'stg_coluna', ['quadro_id', 'id_origem']),
      ...stgVersionada(S, B, 'stg_bloqueio', ['card_id', 'id_origem']),
      // Entrega do webhook: sem coleta (receptor dspd_webhook só insere aqui); reentrega idêntica = mesma linha.
      tabela(S, B, 'stg_webhook_evento', `${IDENT('webhook_sk')} PRIMARY KEY,
  ${HASH}, payload jsonb NOT NULL,
  ${DT('recebido_em')},
  CONSTRAINT uq_stg_webhook_evento UNIQUE (payload_sha256)`),
      indice(s, 'ix_stg_webhook_evento_recebido', 'stg_webhook_evento', 'recebido_em'),
      ...appendOnly(S, s, 'stg_webhook_evento'),
      tabela(S, B, 'stg_webhook_processamento', `${IDENT('proc_sk')} PRIMARY KEY,
  webhook_sk bigint NOT NULL, coleta_id bigint NOT NULL,
  resultado text NOT NULL CHECK (resultado IN ('processado','ignorado','erro')),
  erro varchar(500) NULL, ${DT('coletado_em')},
  CONSTRAINT uq_stg_webhook_processamento UNIQUE (webhook_sk, coleta_id),
  CONSTRAINT fk_stg_webhook_proc_evt FOREIGN KEY (webhook_sk) REFERENCES ${s}.stg_webhook_evento (webhook_sk),
  ${COLETA_FK(s, 'stg_webhook_processamento')}`),
      indice(s, 'ix_stg_webhook_processamento_coleta', 'stg_webhook_processamento', 'coleta_id'),
      ...appendOnly(S, s, 'stg_webhook_processamento'),
      tabela(S, B, 'stg_card_presenca', `${IDENT('presenca_sk')} PRIMARY KEY,
  varredura_id bigint NOT NULL,
  ${ID('id_origem')},
  ${DT('coletado_em')}, coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_card_presenca UNIQUE (varredura_id, id_origem),
  ${COLETA_FK(s, 'stg_card_presenca')}`),
      indice(s, 'ix_stg_card_presenca_coleta', 'stg_card_presenca', 'coleta_id'),
      ...appendOnly(S, s, 'stg_card_presenca'),
    ],
    down: drop(...['stg_card_presenca', 'stg_webhook_processamento', 'stg_webhook_evento', 'stg_bloqueio',
      'stg_coluna', 'stg_custom_field', 'stg_vinculo', 'stg_revision', 'stg_card'].map((t) => `${s}.${t}`)),
  };
};
export const { up, down } = migracao(ddl);
