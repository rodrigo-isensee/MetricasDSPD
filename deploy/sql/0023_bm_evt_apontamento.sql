-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0023_bm_evt_apontamento.sql
BEGIN;
CREATE TABLE dspd_bm.evt_apontamento (
  evento_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  logged_time_id text NOT NULL CHECK (logged_time_id ~ '^[0-9]{1,12}$'), card_id text NOT NULL CHECK (card_id ~ '^[0-9]{1,12}$'),
  tipo text NOT NULL CHECK (tipo IN ('excluido_detectado','reaparecido')),
  origem text NOT NULL CHECK (origem IN ('varredura','historico')),
  chave_ocorrencia varchar(64) NOT NULL CHECK (chave_ocorrencia ~ '^[0-9A-Za-z:_.-]+$'),
  ocorrido_em timestamptz(3) NULL, detectado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT uq_evt_apontamento UNIQUE (logged_time_id, tipo, chave_ocorrencia),
  CONSTRAINT fk_evt_apontamento_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_evt_apontamento_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_evt_apontamento_ultimo ON dspd_bm.evt_apontamento (logged_time_id, evento_sk DESC);

CREATE INDEX ix_evt_apontamento_coleta ON dspd_bm.evt_apontamento (coleta_id);

CREATE TRIGGER tg_evt_apontamento_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.evt_apontamento FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_evt_apontamento_sem_truncate BEFORE TRUNCATE ON dspd_bm.evt_apontamento FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0023_bm_evt_apontamento', now());
COMMIT;
