-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0020_bm_dim_responsavel.sql
BEGIN;
CREATE TABLE dspd_bm.dim_responsavel (
  responsavel_id text NOT NULL PRIMARY KEY CHECK (responsavel_id ~ '^[0-9]{1,12}$'),
  responsavel_nome text NOT NULL CHECK (responsavel_nome <> '' AND char_length(responsavel_nome) <= 200),
  atualizado_em timestamptz(3) NOT NULL,
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_dim_responsavel_sis CHECK (sistema_origem = 'businessmap')
);

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0020_bm_dim_responsavel', now());
COMMIT;
