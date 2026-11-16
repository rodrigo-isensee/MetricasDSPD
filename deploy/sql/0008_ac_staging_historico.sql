-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0008_ac_staging_historico.sql
BEGIN;
CREATE TABLE dspd_ac.stg_chamado (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  anterior_sk bigint NULL,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32),
  payload jsonb NOT NULL,
  ausente_na_extracao boolean NOT NULL DEFAULT false,
  sistema_origem text NOT NULL DEFAULT 'acelerato',
  CONSTRAINT ck_stg_chamado_sis CHECK (sistema_origem = 'acelerato'),
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_chamado UNIQUE NULLS NOT DISTINCT (id_origem, anterior_sk),
  CONSTRAINT fk_stg_chamado_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_ac.ctl_coleta (coleta_id)
);

CREATE INDEX ix_stg_chamado_ultima ON dspd_ac.stg_chamado (id_origem, stg_sk DESC);

CREATE INDEX ix_stg_chamado_coleta ON dspd_ac.stg_chamado (coleta_id);

CREATE INDEX ix_stg_chamado_coletado ON dspd_ac.stg_chamado (coletado_em);

CREATE TRIGGER tg_stg_chamado_imutavel BEFORE UPDATE OR DELETE ON dspd_ac.stg_chamado FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_chamado_sem_truncate BEFORE TRUNCATE ON dspd_ac.stg_chamado FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_ac.stg_etapa (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chamado_id varchar(32) NOT NULL CHECK (chamado_id ~ '^[\x21-\x7E]+$'),
  id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  anterior_sk bigint NULL,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32),
  payload jsonb NOT NULL,
  ausente_na_extracao boolean NOT NULL DEFAULT false,
  sistema_origem text NOT NULL DEFAULT 'acelerato',
  CONSTRAINT ck_stg_etapa_sis CHECK (sistema_origem = 'acelerato'),
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_etapa UNIQUE NULLS NOT DISTINCT (chamado_id, id_origem, anterior_sk),
  CONSTRAINT fk_stg_etapa_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_ac.ctl_coleta (coleta_id)
);

CREATE INDEX ix_stg_etapa_ultima ON dspd_ac.stg_etapa (chamado_id, id_origem, stg_sk DESC);

CREATE INDEX ix_stg_etapa_coleta ON dspd_ac.stg_etapa (coleta_id);

CREATE INDEX ix_stg_etapa_coletado ON dspd_ac.stg_etapa (coletado_em);

CREATE TRIGGER tg_stg_etapa_imutavel BEFORE UPDATE OR DELETE ON dspd_ac.stg_etapa FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_etapa_sem_truncate BEFORE TRUNCATE ON dspd_ac.stg_etapa FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_ac.dim_chamado_versao (
  chamado_versao_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chamado_id varchar(32) NOT NULL CHECK (chamado_id ~ '^[\x21-\x7E]+$'), vigente_de timestamptz(3) NOT NULL, stg_chamado_sk bigint NOT NULL,
  natureza varchar(80) NULL,
  equipe varchar(80) NULL,
  organizacao varchar(80) NULL,
  tipo varchar(80) NULL,
  categoria_sistema varchar(80) NULL,
  excluido boolean NOT NULL DEFAULT false,
  status varchar(80) NULL,
  impacto varchar(80) NULL,
  urgencia varchar(80) NULL,
  prioridade varchar(80) NULL,
  prioridade_ajustada_manualmente boolean NOT NULL DEFAULT false,
  aberto_em timestamptz(3) NULL,
  primeiro_atendimento_em timestamptz(3) NULL,
  restaurado_em timestamptz(3) NULL,
  data_finalizado timestamptz(3) NULL,
  status_sla_r varchar(32) NULL CHECK (status_sla_r IN ('REALIZADO_NO_PRAZO','REALIZADO_APOS_VENCIMENTO')),
  status_sla_pa varchar(32) NULL,
  motivo_escalacao varchar(80) NULL,
  motivo_pendencia_atual varchar(80) NULL,
  previsao_retorno timestamptz(3) NULL,
  motivo_encerramento varchar(80) NULL,
  avaliacao_problema varchar(80) NULL,
  excecao_sla_registro_posterior boolean NOT NULL DEFAULT false,
  incidente_critico_coordenado boolean NOT NULL DEFAULT false,
  nivel_resolucao varchar(80) NULL,
  etapa varchar(80) NULL,
  coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT fk_dim_chamado_versao_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_ac.ctl_coleta (coleta_id),
  CONSTRAINT uq_dim_chamado_versao UNIQUE (chamado_id, vigente_de),
  CONSTRAINT fk_dim_chamado_versao_stg FOREIGN KEY (stg_chamado_sk) REFERENCES dspd_ac.stg_chamado (stg_sk),
  sistema_origem text NOT NULL DEFAULT 'acelerato',
  CONSTRAINT ck_dim_chamado_versao_sis CHECK (sistema_origem = 'acelerato')
);

CREATE INDEX ix_dim_chamado_versao_coleta ON dspd_ac.dim_chamado_versao (coleta_id);

CREATE TRIGGER tg_dim_chamado_versao_imutavel BEFORE UPDATE OR DELETE ON dspd_ac.dim_chamado_versao FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_dim_chamado_versao_sem_truncate BEFORE TRUNCATE ON dspd_ac.dim_chamado_versao FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_ac.evt_etapa_chamado (
  evt_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chamado_id varchar(32) NOT NULL CHECK (chamado_id ~ '^[\x21-\x7E]+$'), etapa varchar(80) NOT NULL, entrada_em timestamptz(3) NOT NULL, motivo_pendencia varchar(80) NULL,
  coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT fk_evt_etapa_chamado_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_ac.ctl_coleta (coleta_id),
  CONSTRAINT uq_evt_etapa_chamado UNIQUE (chamado_id, etapa, entrada_em),
  sistema_origem text NOT NULL DEFAULT 'acelerato',
  CONSTRAINT ck_evt_etapa_chamado_sis CHECK (sistema_origem = 'acelerato')
);

CREATE INDEX ix_evt_etapa_chamado_coleta ON dspd_ac.evt_etapa_chamado (coleta_id);

CREATE TRIGGER tg_evt_etapa_chamado_imutavel BEFORE UPDATE OR DELETE ON dspd_ac.evt_etapa_chamado FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_evt_etapa_chamado_sem_truncate BEFORE TRUNCATE ON dspd_ac.evt_etapa_chamado FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0008_ac_staging_historico', now());
COMMIT;
