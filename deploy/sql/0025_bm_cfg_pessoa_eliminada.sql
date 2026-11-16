-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0025_bm_cfg_pessoa_eliminada.sql
BEGIN;
CREATE TABLE dspd_bm.cfg_pessoa_eliminada (
  hash_usuario bytea NOT NULL PRIMARY KEY CHECK (octet_length(hash_usuario) = 32),
  eliminada_em date NOT NULL
);

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0025_bm_cfg_pessoa_eliminada', now());
COMMIT;
