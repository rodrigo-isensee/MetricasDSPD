-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0015_bm_remove_usuario_transicao.sql
BEGIN;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM dspd_bm.fato_transicao WHERE usuario IS NOT NULL) THEN
    RAISE EXCEPTION 'fato_transicao.usuario tem valor gravado; remover a coluna perderia dado. Trate antes (K-096).';
  END IF;
END $$;

ALTER TABLE dspd_bm.fato_transicao DROP COLUMN IF EXISTS usuario;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0015_bm_remove_usuario_transicao', now());
COMMIT;
