-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0041_bm_ref_tipo_card_habilitador.sql
BEGIN;
ALTER TABLE dspd_bm.ref_tipo_card DROP CONSTRAINT IF EXISTS ref_tipo_card_categoria_check;

ALTER TABLE dspd_bm.ref_tipo_card ADD CONSTRAINT ref_tipo_card_categoria_check CHECK (categoria IN ('bug_interno','defeito_producao','requisicao','divida_tecnica','melhoria','habilitador','produto'));

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0041_bm_ref_tipo_card_habilitador', now());
COMMIT;
