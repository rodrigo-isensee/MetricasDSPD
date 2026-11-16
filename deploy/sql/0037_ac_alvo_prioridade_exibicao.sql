-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0037_ac_alvo_prioridade_exibicao.sql
BEGIN;
ALTER TABLE dspd_ac.ref_alvo_prioridade ADD COLUMN exibir_pa text NULL CHECK (exibir_pa IN ('min','h','dia'));

ALTER TABLE dspd_ac.ref_alvo_prioridade ADD COLUMN exibir_r text NULL CHECK (exibir_r IN ('min','h','dia'));

ALTER TABLE dspd_ac.ref_alvo_prioridade ADD CONSTRAINT ck_ref_alvo_exibir_par CHECK ((exibir_pa IS NULL) = (exibir_r IS NULL));

ALTER TABLE dspd_ac.ref_alvo_prioridade ADD CONSTRAINT ck_ref_alvo_exibir_relogio CHECK (NOT (unidade_pa = 'corrido' AND exibir_pa = 'dia') AND NOT (unidade_r = 'corrido' AND exibir_r = 'dia'));

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0037_ac_alvo_prioridade_exibicao', now());
COMMIT;
