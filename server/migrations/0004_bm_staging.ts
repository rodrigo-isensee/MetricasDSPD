import type { Kysely } from 'kysely';
import { executar, stgVersionada, tabela, drop, COLETA_FK, DT, type Ddl } from './_util.js';

const B = 'businessmap' as const;

export const ddl: Ddl = {
  up: [
    stgVersionada(B, 'stg_card', ['id_origem'], [
      'quadro_id VARCHAR(32) CHARACTER SET ascii NOT NULL',
      'arquivado TINYINT(1) NOT NULL', 'excluido_detectado TINYINT(1) NOT NULL',
    ]),
    tabela(B, 'stg_revision', `revision_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  card_id VARCHAR(32) CHARACTER SET ascii NOT NULL,
  revision_id VARCHAR(32) CHARACTER SET ascii NOT NULL,
  payload_sha256 BINARY(32) NOT NULL, payload JSON NOT NULL,
  ${DT('coletado_em')}, coleta_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (revision_sk),
  UNIQUE KEY uq_stg_revision_chave (card_id, revision_id),
  KEY ix_stg_revision_coleta (coleta_id), KEY ix_stg_revision_coletado (coletado_em),
  ${COLETA_FK('dspd_bm', 'stg_revision')}`),
    // stg_vinculo não tem id_origem: o par pai/filho é a chave do item
    stgVersionada(B, 'stg_vinculo', ['pai_id', 'filho_id']),
    stgVersionada(B, 'stg_custom_field', ['id_origem']),
    stgVersionada(B, 'stg_coluna', ['quadro_id', 'id_origem']),
    stgVersionada(B, 'stg_bloqueio', ['card_id', 'id_origem']),
    // Entrega do webhook: sem coleta (receptor dspd_webhook só insere aqui); reentrega idêntica = mesma linha.
    tabela(B, 'stg_webhook_evento', `webhook_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  payload_sha256 BINARY(32) NOT NULL, payload JSON NOT NULL,
  ${DT('recebido_em')}, coleta_id BIGINT UNSIGNED NULL,
  PRIMARY KEY (webhook_sk),
  UNIQUE KEY uq_stg_webhook_evento_hash (payload_sha256),
  KEY ix_stg_webhook_evento_recebido (recebido_em)`),
    tabela(B, 'stg_webhook_processamento', `proc_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  webhook_sk BIGINT UNSIGNED NOT NULL, coleta_id BIGINT UNSIGNED NOT NULL,
  resultado ENUM('processado','ignorado','erro') NOT NULL,
  erro VARCHAR(500) NULL, ${DT('coletado_em')},
  PRIMARY KEY (proc_sk),
  UNIQUE KEY uq_stg_webhook_proc (webhook_sk, coleta_id),
  KEY ix_stg_webhook_proc_coleta (coleta_id),
  CONSTRAINT fk_stg_webhook_proc_evt FOREIGN KEY (webhook_sk) REFERENCES dspd_bm.stg_webhook_evento (webhook_sk),
  ${COLETA_FK('dspd_bm', 'stg_webhook_proc')}`),
    tabela(B, 'stg_card_presenca', `presenca_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  varredura_id BIGINT UNSIGNED NOT NULL,
  id_origem VARCHAR(32) CHARACTER SET ascii NOT NULL,
  ${DT('coletado_em')}, coleta_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (presenca_sk),
  UNIQUE KEY uq_stg_card_presenca (varredura_id, id_origem),
  KEY ix_stg_card_presenca_coleta (coleta_id),
  CONSTRAINT fk_stg_card_presenca_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id)`),
  ],
  down: drop(...['stg_card_presenca', 'stg_webhook_processamento', 'stg_webhook_evento', 'stg_bloqueio',
    'stg_coluna', 'stg_custom_field', 'stg_vinculo', 'stg_revision', 'stg_card'].map((t) => `dspd_bm.${t}`)),
};
export const up = (db: Kysely<unknown>) => executar(db, ddl.up);
export const down = (db: Kysely<unknown>) => executar(db, ddl.down);
