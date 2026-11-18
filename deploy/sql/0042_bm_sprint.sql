-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0042_bm_sprint.sql
BEGIN;
CREATE TABLE dspd_bm.dim_sprint (
  sprint_id varchar(32) NOT NULL CHECK (sprint_id ~ '^[\x21-\x7E]+$') PRIMARY KEY,
  quadro_id varchar(32) NULL CHECK (quadro_id ~ '^[\x21-\x7E]+$'),
  inicio_em timestamptz(3) NULL, fim_em timestamptz(3) NULL,
  descartada boolean NOT NULL,
  coletado_em timestamptz(3) NOT NULL, atualizado_por_coleta_id bigint NOT NULL,
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_dim_sprint_sis CHECK (sistema_origem = 'businessmap')
);

CREATE TABLE dspd_bm.fato_sprint_filho (
  vinculo_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sprint_id varchar(32) NOT NULL CHECK (sprint_id ~ '^[\x21-\x7E]+$'), filho_id varchar(32) NOT NULL CHECK (filho_id ~ '^[\x21-\x7E]+$'),
  coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT uq_fato_sprint_filho UNIQUE (sprint_id, filho_id),
  CONSTRAINT fk_fato_sprint_filho_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_fato_sprint_filho_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_fato_sprint_filho_filho ON dspd_bm.fato_sprint_filho (filho_id);

CREATE INDEX ix_fato_sprint_filho_coleta ON dspd_bm.fato_sprint_filho (coleta_id);

CREATE TRIGGER tg_fato_sprint_filho_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.fato_sprint_filho FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_fato_sprint_filho_sem_truncate BEFORE TRUNCATE ON dspd_bm.fato_sprint_filho FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0042_bm_sprint', now());
COMMIT;
