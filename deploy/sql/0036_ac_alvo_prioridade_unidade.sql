-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0036_ac_alvo_prioridade_unidade.sql
BEGIN;
ALTER TABLE dspd_ac.ref_alvo_prioridade RENAME COLUMN prazo_pa_horas_uteis TO prazo_pa_horas;

ALTER TABLE dspd_ac.ref_alvo_prioridade RENAME COLUMN prazo_r_horas_uteis TO prazo_r_horas;

ALTER TABLE dspd_ac.ref_alvo_prioridade ADD COLUMN unidade_pa text NOT NULL DEFAULT 'util' CHECK (unidade_pa IN ('corrido','util'));

ALTER TABLE dspd_ac.ref_alvo_prioridade ADD COLUMN unidade_r text NOT NULL DEFAULT 'util' CHECK (unidade_r IN ('corrido','util'));

ALTER TABLE dspd_ac.ref_alvo_prioridade ALTER COLUMN unidade_pa DROP DEFAULT;

ALTER TABLE dspd_ac.ref_alvo_prioridade ALTER COLUMN unidade_r DROP DEFAULT;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0036_ac_alvo_prioridade_unidade', now());
COMMIT;
