-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0016_ac_stg_chamado_recorte.sql
BEGIN;
ALTER TABLE dspd_ac.stg_chamado ADD COLUMN IF NOT EXISTS fora_do_recorte boolean NOT NULL DEFAULT false;

ALTER TABLE dspd_ac.stg_chamado ADD CONSTRAINT ck_stg_chamado_status_sla CHECK (((payload->>'sla_pa_status') IS NULL OR (payload->>'sla_pa_status') IN ('REALIZADO_NO_PRAZO','REALIZADO_APOS_VENCIMENTO','DENTRO_DO_PRAZO','VENCIDO')) AND ((payload->>'sla_r_status') IS NULL OR (payload->>'sla_r_status') IN ('REALIZADO_NO_PRAZO','REALIZADO_APOS_VENCIMENTO','DENTRO_DO_PRAZO','VENCIDO')));

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0016_ac_stg_chamado_recorte', now());
COMMIT;
