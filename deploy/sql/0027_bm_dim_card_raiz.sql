-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0027_bm_dim_card_raiz.sql
BEGIN;
CREATE TABLE dspd_bm.dim_card_raiz (
  card_id text NOT NULL CHECK (card_id ~ '^[0-9]{1,12}$') PRIMARY KEY, raiz_card_id text NOT NULL CHECK (raiz_card_id ~ '^[0-9]{1,12}$'),
  profundidade smallint NOT NULL CHECK (profundidade BETWEEN 0 AND 10),
  raiz_eh_iniciativa boolean NOT NULL, raiz_fora_do_escopo boolean NOT NULL,
  coletado_em timestamptz(3) NOT NULL, atualizado_por_coleta_id bigint NOT NULL,
  CONSTRAINT ck_dim_card_raiz_propria CHECK ((profundidade = 0) = (raiz_card_id = card_id)),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_dim_card_raiz_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_dim_card_raiz_raiz ON dspd_bm.dim_card_raiz (raiz_card_id);

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0027_bm_dim_card_raiz', now());
COMMIT;
