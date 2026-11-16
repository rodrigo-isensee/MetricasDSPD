-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0014_ac_justificativa_informada.sql
BEGIN;
ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS justificativa_informada boolean NOT NULL DEFAULT false;

ALTER TABLE dspd_ac.dim_chamado_versao ADD COLUMN IF NOT EXISTS justificativa_informada boolean NOT NULL DEFAULT false;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0014_ac_justificativa_informada', now());
COMMIT;
