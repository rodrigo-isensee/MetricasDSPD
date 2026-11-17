-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0000_preparo.sql
BEGIN;
CREATE SCHEMA IF NOT EXISTS dspd_core;
CREATE TABLE dspd_core.pgmigrations (id SERIAL PRIMARY KEY, name varchar(255) NOT NULL, run_on timestamp NOT NULL);
COMMIT;
