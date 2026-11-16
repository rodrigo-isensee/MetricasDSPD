-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0029_bm_fato_apontamento_tipo.sql
BEGIN;
ALTER TABLE dspd_bm.fato_apontamento ADD COLUMN type_id text NULL CHECK (type_id ~ '^[0-9]{1,12}$');

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0029_bm_fato_apontamento_tipo', now());
COMMIT;
