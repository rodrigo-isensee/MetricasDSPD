-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0001_schemas.sql
BEGIN;
CREATE SCHEMA IF NOT EXISTS dspd_bm;

CREATE SCHEMA IF NOT EXISTS dspd_ac;

CREATE SCHEMA IF NOT EXISTS dspd_core;

CREATE FUNCTION dspd_core.proibir_alteracao() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN
  RAISE EXCEPTION 'tabela % é append-only: % não é permitido', TG_TABLE_NAME, TG_OP USING ERRCODE = '55000';
END
$f$;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0001_schemas', now());
COMMIT;
