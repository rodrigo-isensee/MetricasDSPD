-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0032_bm_stg_apontamento_versao.sql
BEGIN;
ALTER TABLE dspd_bm.stg_apontamento DROP CONSTRAINT uq_stg_apontamento;

DROP INDEX IF EXISTS dspd_bm.ix_stg_apontamento_ultima;

ALTER TABLE dspd_bm.stg_apontamento ADD COLUMN versao smallint NULL;

ALTER TABLE dspd_bm.stg_apontamento DISABLE TRIGGER tg_stg_apontamento_imutavel;

UPDATE dspd_bm.stg_apontamento AS x SET versao = n.v
       FROM (SELECT stg_sk, row_number() OVER (PARTITION BY logged_time_id ORDER BY stg_sk)::smallint AS v FROM dspd_bm.stg_apontamento) AS n
       WHERE x.stg_sk = n.stg_sk;

ALTER TABLE dspd_bm.stg_apontamento ENABLE TRIGGER tg_stg_apontamento_imutavel;

ALTER TABLE dspd_bm.stg_apontamento ALTER COLUMN versao SET NOT NULL;

ALTER TABLE dspd_bm.stg_apontamento ADD CONSTRAINT ck_stg_apontamento_versao CHECK (versao >= 1);

ALTER TABLE dspd_bm.stg_apontamento ADD CONSTRAINT uq_stg_apontamento UNIQUE (logged_time_id, versao);

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0032_bm_stg_apontamento_versao', now());
COMMIT;
