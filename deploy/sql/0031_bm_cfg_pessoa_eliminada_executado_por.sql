-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0031_bm_cfg_pessoa_eliminada_executado_por.sql
BEGIN;
ALTER TABLE dspd_bm.cfg_pessoa_eliminada ADD COLUMN executado_por varchar(63) NOT NULL DEFAULT current_user CHECK (executado_por <> '');

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0031_bm_cfg_pessoa_eliminada_executado_por', now());
COMMIT;
