-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0017_ac_projecao_f2.sql
BEGIN;
ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS arquivado boolean NOT NULL DEFAULT false;

ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS com_agente boolean NOT NULL DEFAULT true;

ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS reincidente_90d varchar(12) NULL CHECK (reincidente_90d IN ('sim', 'nao', 'sem_resposta'));

ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS fora_do_recorte boolean NOT NULL DEFAULT false;

ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS categoria_key bigint NULL;

ALTER TABLE dspd_ac.dim_chamado_versao ADD COLUMN IF NOT EXISTS arquivado boolean NOT NULL DEFAULT false;

ALTER TABLE dspd_ac.dim_chamado_versao ADD COLUMN IF NOT EXISTS com_agente boolean NOT NULL DEFAULT true;

ALTER TABLE dspd_ac.dim_chamado_versao ADD COLUMN IF NOT EXISTS reincidente_90d varchar(12) NULL CHECK (reincidente_90d IN ('sim', 'nao', 'sem_resposta'));

ALTER TABLE dspd_ac.dim_chamado_versao ADD COLUMN IF NOT EXISTS fora_do_recorte boolean NOT NULL DEFAULT false;

ALTER TABLE dspd_ac.dim_chamado_versao ADD COLUMN IF NOT EXISTS categoria_key bigint NULL;

CREATE INDEX IF NOT EXISTS ix_dim_chamado_versao_stg ON dspd_ac.dim_chamado_versao (stg_chamado_sk);

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0017_ac_projecao_f2', now());
COMMIT;
