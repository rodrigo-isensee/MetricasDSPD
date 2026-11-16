-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0022_bm_stg_apontamento.sql
BEGIN;
CREATE TABLE dspd_bm.stg_apontamento (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  logged_time_id text NOT NULL CHECK (logged_time_id ~ '^[0-9]{1,12}$'), card_id text NOT NULL CHECK (card_id ~ '^[0-9]{1,12}$'), parent_card_id text NULL CHECK (parent_card_id ~ '^[0-9]{1,12}$'), subtask_id text NULL CHECK (subtask_id ~ '^[0-9]{1,12}$'),
  lane_id text NULL CHECK (lane_id ~ '^[0-9]{1,12}$'), column_id text NULL CHECK (column_id ~ '^[0-9]{1,12}$'), category_id text NULL CHECK (category_id ~ '^[0-9]{1,12}$'),
  data_apontamento date NOT NULL, segundos integer NOT NULL CHECK (segundos BETWEEN 1 AND 86400), registrado_em timestamptz(3) NULL,
  subgrupo_codigo varchar(80) NOT NULL, flags_qualidade smallint NOT NULL CHECK (flags_qualidade BETWEEN 0 AND 31),
  qtd_palavras smallint NOT NULL CHECK (qtd_palavras >= 0), versao_dicionario varchar(40) NOT NULL CHECK (versao_dicionario <> ''),
  registro_sha256 bytea NOT NULL CHECK (octet_length(registro_sha256) = 32),
  coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_apontamento UNIQUE (logged_time_id, registro_sha256),
  CONSTRAINT fk_stg_apontamento_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_apontamento_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_stg_apontamento_ultima ON dspd_bm.stg_apontamento (logged_time_id, stg_sk DESC);

CREATE INDEX ix_stg_apontamento_card ON dspd_bm.stg_apontamento (card_id);

CREATE INDEX ix_stg_apontamento_coleta ON dspd_bm.stg_apontamento (coleta_id);

CREATE TRIGGER tg_stg_apontamento_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_apontamento FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_apontamento_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_apontamento FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0022_bm_stg_apontamento', now());
COMMIT;
