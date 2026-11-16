-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0039_bm_toque_primeiro.sql
BEGIN;
ALTER TABLE dspd_bm.ctl_coleta DROP CONSTRAINT ctl_coleta_tarefa_check;

ALTER TABLE dspd_bm.ctl_coleta ADD CONSTRAINT ctl_coleta_tarefa_check CHECK (tarefa IN ('coleta_incremental','varredura','webhook','projecao','reconciliacao','apontamento','carga_toque'));

CREATE TABLE dspd_bm.stg_toque_instante (
  toque_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id text NOT NULL CHECK (card_id ~ '^[0-9]{1,12}$'),
  evento_id text NOT NULL CHECK (evento_id ~ '^(r([2-9]|[1-9][0-9]{1,8})|c[1-9][0-9]{0,14})$'),
  ocorrido_em timestamptz(3) NOT NULL,
  conta_como_toque boolean NOT NULL,
  coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_toque_instante UNIQUE (card_id, evento_id),
  CONSTRAINT fk_stg_toque_instante_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_toque_instante_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_stg_toque_instante_coleta ON dspd_bm.stg_toque_instante (coleta_id);

CREATE TRIGGER tg_stg_toque_instante_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_toque_instante FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_toque_instante_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_toque_instante FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.ctl_toque_leitura (
  leitura_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id text NOT NULL CHECK (card_id ~ '^[0-9]{1,12}$'),
  coleta_id bigint NOT NULL,
  revisao_lida integer NULL CHECK (revisao_lida IS NULL OR revisao_lida >= 1),
  lido_em timestamptz(3) NOT NULL,
  estado text NOT NULL CHECK (estado IN ('lido','autor_pendente','leitura_incompleta')),
  motivo text NULL CHECK (motivo IN ('lista_com_buraco','lista_curta','lista_longa','instante_invalido','revisao_invalida','comentario_invalido')),
  CONSTRAINT uq_ctl_toque_leitura UNIQUE (card_id, coleta_id),
  CONSTRAINT ck_ctl_toque_leitura_motivo CHECK ((estado = 'leitura_incompleta') = (motivo IS NOT NULL)),
  CONSTRAINT ck_ctl_toque_leitura_revisao CHECK (revisao_lida IS NOT NULL OR coalesce(motivo, '') = 'revisao_invalida'),
  CONSTRAINT fk_ctl_toque_leitura_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_ctl_toque_leitura_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_ctl_toque_leitura_card ON dspd_bm.ctl_toque_leitura (card_id, leitura_sk DESC);

CREATE INDEX ix_ctl_toque_leitura_coleta ON dspd_bm.ctl_toque_leitura (coleta_id);

CREATE TRIGGER tg_ctl_toque_leitura_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.ctl_toque_leitura FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_ctl_toque_leitura_sem_truncate BEFORE TRUNCATE ON dspd_bm.ctl_toque_leitura FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

ALTER TABLE dspd_bm.dim_card ADD COLUMN primeiro_toque_em timestamptz(3) NULL,
  ADD COLUMN toque_situacao text NULL CHECK (toque_situacao IN ('com_toque','sem_toque','nao_lido','autor_pendente','leitura_incompleta'));

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0039_bm_toque_primeiro', now());
COMMIT;
