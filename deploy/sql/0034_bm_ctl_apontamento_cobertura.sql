-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0034_bm_ctl_apontamento_cobertura.sql
BEGIN;
CREATE TABLE dspd_bm.ctl_apontamento_cobertura (
  cobertura_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id text NOT NULL CHECK (card_id ~ '^[0-9]{1,12}$'),
  estado text NOT NULL CHECK (estado IN ('incompleto','completo')),
  coleta_id bigint NOT NULL, detectado_em timestamptz(3) NOT NULL,
  CONSTRAINT uq_ctl_apontamento_cobertura UNIQUE (card_id, estado, coleta_id),
  CONSTRAINT fk_ctl_apontamento_cobertura_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_ctl_apontamento_cobertura_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_ctl_apontamento_cobertura_card ON dspd_bm.ctl_apontamento_cobertura (card_id, cobertura_sk DESC);

CREATE INDEX ix_ctl_apontamento_cobertura_coleta ON dspd_bm.ctl_apontamento_cobertura (coleta_id);

CREATE TRIGGER tg_ctl_apontamento_cobertura_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.ctl_apontamento_cobertura FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_ctl_apontamento_cobertura_sem_truncate BEFORE TRUNCATE ON dspd_bm.ctl_apontamento_cobertura FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0034_bm_ctl_apontamento_cobertura', now());
COMMIT;
