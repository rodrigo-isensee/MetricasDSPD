-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0038_ac_dim_chamado_fluxo.sql
BEGIN;
ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS fluxo text NULL;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0038_ac_dim_chamado_fluxo', now());
COMMIT;
