-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0028_bm_fato_apontamento.sql
BEGIN;
CREATE TABLE dspd_bm.fato_apontamento (
  logged_time_id text NOT NULL CHECK (logged_time_id ~ '^[0-9]{1,12}$') PRIMARY KEY,
  card_id text NOT NULL CHECK (card_id ~ '^[0-9]{1,12}$'), parent_card_id text NULL CHECK (parent_card_id ~ '^[0-9]{1,12}$'), subtask_id text NULL CHECK (subtask_id ~ '^[0-9]{1,12}$'), lane_id text NULL CHECK (lane_id ~ '^[0-9]{1,12}$'), column_id text NULL CHECK (column_id ~ '^[0-9]{1,12}$'), category_id text NULL CHECK (category_id ~ '^[0-9]{1,12}$'),
  data_apontamento date NOT NULL, segundos integer NOT NULL CHECK (segundos BETWEEN 1 AND 86400), registrado_em timestamptz(3) NULL,
  subgrupo_codigo varchar(80) NOT NULL, flags_qualidade smallint NOT NULL CHECK (flags_qualidade BETWEEN 0 AND 31),
  qtd_palavras smallint NOT NULL CHECK (qtd_palavras >= 0), versao_dicionario varchar(40) NOT NULL,
  registro_sha256 bytea NOT NULL CHECK (octet_length(registro_sha256) = 32),
  iniciativa_card_id text NULL CHECK (iniciativa_card_id ~ '^[0-9]{1,12}$'), pessoa_ref bigint NULL CHECK (pessoa_ref > 0),
  versoes smallint NOT NULL CHECK (versoes >= 1), excluido_em timestamptz(3) NULL,
  atualizado_em timestamptz(3) NOT NULL, atualizado_por_coleta_id bigint NOT NULL,
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_fato_apontamento_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_fato_apontamento_data ON dspd_bm.fato_apontamento (data_apontamento) WHERE excluido_em IS NULL;

CREATE INDEX ix_fato_apontamento_pessoa ON dspd_bm.fato_apontamento (pessoa_ref, data_apontamento) WHERE excluido_em IS NULL;

CREATE INDEX ix_fato_apontamento_iniciativa ON dspd_bm.fato_apontamento (iniciativa_card_id, data_apontamento) WHERE excluido_em IS NULL;

CREATE INDEX ix_fato_apontamento_card ON dspd_bm.fato_apontamento (card_id);

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0028_bm_fato_apontamento', now());
COMMIT;
