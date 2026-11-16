-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0024_bm_dim_responsavel_pessoa_ref.sql
BEGIN;
ALTER TABLE dspd_bm.dim_responsavel ADD COLUMN pessoa_ref bigint GENERATED ALWAYS AS IDENTITY UNIQUE;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0024_bm_dim_responsavel_pessoa_ref', now());
COMMIT;
