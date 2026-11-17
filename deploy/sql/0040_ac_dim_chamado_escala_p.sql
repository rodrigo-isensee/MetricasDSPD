-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0040_ac_dim_chamado_escala_p.sql
BEGIN;
ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS escala_p boolean NULL;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0040_ac_dim_chamado_escala_p', now());
COMMIT;
