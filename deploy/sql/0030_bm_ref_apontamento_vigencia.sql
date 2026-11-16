-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0030_bm_ref_apontamento_vigencia.sql
BEGIN;
ALTER TABLE dspd_bm.ref_apontamento_termo DROP CONSTRAINT fk_ref_apontamento_termo_subgrupo;

ALTER TABLE dspd_bm.ref_apontamento_regra_tipo DROP CONSTRAINT fk_ref_apontamento_regra_subgrupo;

ALTER TABLE dspd_bm.ref_apontamento_subgrupo DROP CONSTRAINT uq_ref_apontamento_subgrupo_prioridade;

ALTER TABLE dspd_bm.ref_apontamento_subgrupo ADD COLUMN vigente_de date NULL, ADD COLUMN vigente_ate date NULL;

UPDATE dspd_bm.ref_apontamento_subgrupo x SET vigente_de = COALESCE((SELECT v.vigente_desde FROM dspd_core.ref_versao_criterio v WHERE v.versao_id = x.incluido_por_versao_id), CURRENT_DATE);

ALTER TABLE dspd_bm.ref_apontamento_subgrupo ALTER COLUMN vigente_de SET NOT NULL;

ALTER TABLE dspd_bm.ref_apontamento_subgrupo ADD CONSTRAINT ck_ref_apontamento_subgrupo_vigencia CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_de);

ALTER TABLE dspd_bm.ref_apontamento_subgrupo DROP CONSTRAINT ref_apontamento_subgrupo_pkey;

ALTER TABLE dspd_bm.ref_apontamento_subgrupo ADD COLUMN vigencia_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY;

ALTER TABLE dspd_bm.ref_apontamento_termo ADD COLUMN vigente_de date NULL, ADD COLUMN vigente_ate date NULL;

UPDATE dspd_bm.ref_apontamento_termo x SET vigente_de = COALESCE((SELECT v.vigente_desde FROM dspd_core.ref_versao_criterio v WHERE v.versao_id = x.incluido_por_versao_id), CURRENT_DATE);

ALTER TABLE dspd_bm.ref_apontamento_termo ALTER COLUMN vigente_de SET NOT NULL;

ALTER TABLE dspd_bm.ref_apontamento_termo ADD CONSTRAINT ck_ref_apontamento_termo_vigencia CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_de);

ALTER TABLE dspd_bm.ref_apontamento_termo DROP CONSTRAINT ref_apontamento_termo_pkey;

ALTER TABLE dspd_bm.ref_apontamento_termo ADD COLUMN vigencia_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY;

ALTER TABLE dspd_bm.ref_apontamento_regra_tipo ADD COLUMN vigente_de date NULL, ADD COLUMN vigente_ate date NULL;

UPDATE dspd_bm.ref_apontamento_regra_tipo x SET vigente_de = COALESCE((SELECT v.vigente_desde FROM dspd_core.ref_versao_criterio v WHERE v.versao_id = x.incluido_por_versao_id), CURRENT_DATE);

ALTER TABLE dspd_bm.ref_apontamento_regra_tipo ALTER COLUMN vigente_de SET NOT NULL;

ALTER TABLE dspd_bm.ref_apontamento_regra_tipo ADD CONSTRAINT ck_ref_apontamento_regra_tipo_vigencia CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_de);

ALTER TABLE dspd_bm.ref_apontamento_regra_tipo DROP CONSTRAINT ref_apontamento_regra_tipo_pkey;

ALTER TABLE dspd_bm.ref_apontamento_regra_tipo ADD COLUMN vigencia_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY;

CREATE UNIQUE INDEX uq_ref_apontamento_subgrupo_vigente ON dspd_bm.ref_apontamento_subgrupo (codigo) WHERE vigente_ate IS NULL;

CREATE UNIQUE INDEX uq_ref_apontamento_subgrupo_prioridade_vigente ON dspd_bm.ref_apontamento_subgrupo (prioridade) WHERE vigente_ate IS NULL;

CREATE UNIQUE INDEX uq_ref_apontamento_termo_vigente ON dspd_bm.ref_apontamento_termo (termo_normalizado, subgrupo_codigo) WHERE vigente_ate IS NULL;

CREATE UNIQUE INDEX uq_ref_apontamento_regra_tipo_vigente ON dspd_bm.ref_apontamento_regra_tipo (type_id, condicao) WHERE vigente_ate IS NULL;

CREATE TRIGGER tg_ref_apontamento_subgrupo_vigencia BEFORE UPDATE OR DELETE ON dspd_bm.ref_apontamento_subgrupo FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao_vigencia();

CREATE TRIGGER tg_ref_apontamento_subgrupo_sem_truncate BEFORE TRUNCATE ON dspd_bm.ref_apontamento_subgrupo FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao_vigencia();

CREATE TRIGGER tg_ref_apontamento_termo_vigencia BEFORE UPDATE OR DELETE ON dspd_bm.ref_apontamento_termo FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao_vigencia();

CREATE TRIGGER tg_ref_apontamento_termo_sem_truncate BEFORE TRUNCATE ON dspd_bm.ref_apontamento_termo FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao_vigencia();

CREATE TRIGGER tg_ref_apontamento_regra_tipo_vigencia BEFORE UPDATE OR DELETE ON dspd_bm.ref_apontamento_regra_tipo FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao_vigencia();

CREATE TRIGGER tg_ref_apontamento_regra_tipo_sem_truncate BEFORE TRUNCATE ON dspd_bm.ref_apontamento_regra_tipo FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao_vigencia();

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0030_bm_ref_apontamento_vigencia', now());
COMMIT;
