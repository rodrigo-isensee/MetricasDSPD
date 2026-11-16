-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0021_bm_ctl_coleta_tarefa_apontamento.sql
BEGIN;
ALTER TABLE dspd_bm.ctl_coleta DROP CONSTRAINT ctl_coleta_tarefa_check;

ALTER TABLE dspd_bm.ctl_coleta ADD CONSTRAINT ctl_coleta_tarefa_check CHECK (tarefa IN ('coleta_incremental','varredura','webhook','projecao','reconciliacao','apontamento'));

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0021_bm_ctl_coleta_tarefa_apontamento', now());
COMMIT;
