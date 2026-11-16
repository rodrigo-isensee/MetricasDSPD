-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0004_bm_staging.sql
BEGIN;
CREATE TABLE dspd_bm.stg_card (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  anterior_sk bigint NULL,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32),
  payload jsonb NOT NULL,
  quadro_id varchar(32) NOT NULL CHECK (quadro_id ~ '^[\x21-\x7E]+$'),
  arquivado boolean NOT NULL,
  excluido_detectado boolean NOT NULL,
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_card_sis CHECK (sistema_origem = 'businessmap'),
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_card UNIQUE NULLS NOT DISTINCT (id_origem, anterior_sk),
  CONSTRAINT fk_stg_card_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id)
);

CREATE INDEX ix_stg_card_ultima ON dspd_bm.stg_card (id_origem, stg_sk DESC);

CREATE INDEX ix_stg_card_coleta ON dspd_bm.stg_card (coleta_id);

CREATE INDEX ix_stg_card_coletado ON dspd_bm.stg_card (coletado_em);

CREATE TRIGGER tg_stg_card_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_card FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_card_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_card FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_revision (
  revision_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id varchar(32) NOT NULL CHECK (card_id ~ '^[\x21-\x7E]+$'), revision_id varchar(32) NOT NULL CHECK (revision_id ~ '^[\x21-\x7E]+$'),
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32), payload jsonb NOT NULL,
  coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_revision UNIQUE (card_id, revision_id),
  CONSTRAINT fk_stg_revision_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_revision_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_stg_revision_coleta ON dspd_bm.stg_revision (coleta_id);

CREATE INDEX ix_stg_revision_coletado ON dspd_bm.stg_revision (coletado_em);

CREATE TRIGGER tg_stg_revision_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_revision FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_revision_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_revision FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_vinculo (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pai_id varchar(32) NOT NULL CHECK (pai_id ~ '^[\x21-\x7E]+$'),
  filho_id varchar(32) NOT NULL CHECK (filho_id ~ '^[\x21-\x7E]+$'),
  anterior_sk bigint NULL,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32),
  payload jsonb NOT NULL,
  
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_vinculo_sis CHECK (sistema_origem = 'businessmap'),
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_vinculo UNIQUE NULLS NOT DISTINCT (pai_id, filho_id, anterior_sk),
  CONSTRAINT fk_stg_vinculo_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id)
);

CREATE INDEX ix_stg_vinculo_ultima ON dspd_bm.stg_vinculo (pai_id, filho_id, stg_sk DESC);

CREATE INDEX ix_stg_vinculo_coleta ON dspd_bm.stg_vinculo (coleta_id);

CREATE INDEX ix_stg_vinculo_coletado ON dspd_bm.stg_vinculo (coletado_em);

CREATE TRIGGER tg_stg_vinculo_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_vinculo FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_vinculo_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_vinculo FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_custom_field (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  anterior_sk bigint NULL,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32),
  payload jsonb NOT NULL,
  
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_custom_field_sis CHECK (sistema_origem = 'businessmap'),
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_custom_field UNIQUE NULLS NOT DISTINCT (id_origem, anterior_sk),
  CONSTRAINT fk_stg_custom_field_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id)
);

CREATE INDEX ix_stg_custom_field_ultima ON dspd_bm.stg_custom_field (id_origem, stg_sk DESC);

CREATE INDEX ix_stg_custom_field_coleta ON dspd_bm.stg_custom_field (coleta_id);

CREATE INDEX ix_stg_custom_field_coletado ON dspd_bm.stg_custom_field (coletado_em);

CREATE TRIGGER tg_stg_custom_field_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_custom_field FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_custom_field_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_custom_field FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_coluna (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quadro_id varchar(32) NOT NULL CHECK (quadro_id ~ '^[\x21-\x7E]+$'),
  id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  anterior_sk bigint NULL,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32),
  payload jsonb NOT NULL,
  
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_coluna_sis CHECK (sistema_origem = 'businessmap'),
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_coluna UNIQUE NULLS NOT DISTINCT (quadro_id, id_origem, anterior_sk),
  CONSTRAINT fk_stg_coluna_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id)
);

CREATE INDEX ix_stg_coluna_ultima ON dspd_bm.stg_coluna (quadro_id, id_origem, stg_sk DESC);

CREATE INDEX ix_stg_coluna_coleta ON dspd_bm.stg_coluna (coleta_id);

CREATE INDEX ix_stg_coluna_coletado ON dspd_bm.stg_coluna (coletado_em);

CREATE TRIGGER tg_stg_coluna_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_coluna FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_coluna_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_coluna FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_bloqueio (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id varchar(32) NOT NULL CHECK (card_id ~ '^[\x21-\x7E]+$'),
  id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  anterior_sk bigint NULL,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32),
  payload jsonb NOT NULL,
  
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_bloqueio_sis CHECK (sistema_origem = 'businessmap'),
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_bloqueio UNIQUE NULLS NOT DISTINCT (card_id, id_origem, anterior_sk),
  CONSTRAINT fk_stg_bloqueio_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id)
);

CREATE INDEX ix_stg_bloqueio_ultima ON dspd_bm.stg_bloqueio (card_id, id_origem, stg_sk DESC);

CREATE INDEX ix_stg_bloqueio_coleta ON dspd_bm.stg_bloqueio (coleta_id);

CREATE INDEX ix_stg_bloqueio_coletado ON dspd_bm.stg_bloqueio (coletado_em);

CREATE TRIGGER tg_stg_bloqueio_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_bloqueio FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_bloqueio_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_bloqueio FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_webhook_evento (
  webhook_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32), payload jsonb NOT NULL,
  recebido_em timestamptz(3) NOT NULL,
  CONSTRAINT uq_stg_webhook_evento UNIQUE (payload_sha256),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_webhook_evento_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_stg_webhook_evento_recebido ON dspd_bm.stg_webhook_evento (recebido_em);

CREATE TRIGGER tg_stg_webhook_evento_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_webhook_evento FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_webhook_evento_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_webhook_evento FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_webhook_processamento (
  proc_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  webhook_sk bigint NOT NULL, coleta_id bigint NOT NULL,
  resultado text NOT NULL CHECK (resultado IN ('processado','ignorado','erro')),
  erro varchar(500) NULL, coletado_em timestamptz(3) NOT NULL,
  CONSTRAINT uq_stg_webhook_processamento UNIQUE (webhook_sk, coleta_id),
  CONSTRAINT fk_stg_webhook_proc_evt FOREIGN KEY (webhook_sk) REFERENCES dspd_bm.stg_webhook_evento (webhook_sk),
  CONSTRAINT fk_stg_webhook_processamento_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_webhook_processamento_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_stg_webhook_processamento_coleta ON dspd_bm.stg_webhook_processamento (coleta_id);

CREATE TRIGGER tg_stg_webhook_processamento_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_webhook_processamento FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_webhook_processamento_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_webhook_processamento FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_card_presenca (
  presenca_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  varredura_id bigint NOT NULL,
  id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_card_presenca UNIQUE (varredura_id, id_origem),
  CONSTRAINT fk_stg_card_presenca_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_card_presenca_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_stg_card_presenca_coleta ON dspd_bm.stg_card_presenca (coleta_id);

CREATE TRIGGER tg_stg_card_presenca_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_card_presenca FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_card_presenca_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_card_presenca FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0004_bm_staging', now());
COMMIT;
