-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0018_bm_referencia_workflow_tipo_times.sql
BEGIN;
CREATE FUNCTION dspd_core.proibir_alteracao_vigencia() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.vigente_ate IS NULL AND NEW.vigente_ate IS NOT NULL
     AND (to_jsonb(NEW) - 'vigente_ate') = (to_jsonb(OLD) - 'vigente_ate') THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'tabela % tem vigência: só INSERT de nova vigência e UPDATE de vigente_ate; % não é permitido', TG_TABLE_NAME, TG_OP
    USING ERRCODE = '55000';
END
$f$;

CREATE TABLE dspd_bm.ref_workflow (
  quadro_id varchar(32) NOT NULL CHECK (quadro_id ~ '^[\x21-\x7E]+$'), workflow_id varchar(32) NOT NULL CHECK (workflow_id ~ '^[\x21-\x7E]+$'), vigente_de date NOT NULL, vigente_ate date NULL, nome varchar(120) NOT NULL,
  tipo_api smallint NOT NULL CHECK (tipo_api IN (0,1,2)),
  nivel text NOT NULL CHECK (nivel IN ('projeto','feature','story','nenhum')),
  PRIMARY KEY (quadro_id, workflow_id, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_workflow_vigente ON dspd_bm.ref_workflow (quadro_id, workflow_id) WHERE vigente_ate IS NULL;

CREATE TABLE dspd_bm.ref_tipo_card (
  tipo_id varchar(32) NOT NULL CHECK (tipo_id ~ '^[\x21-\x7E]+$'), vigente_de date NOT NULL, vigente_ate date NULL, nome varchar(80) NOT NULL, eh_item boolean NOT NULL,
  categoria text NULL CHECK (categoria IN ('bug_interno','defeito_producao','requisicao','divida_tecnica','melhoria','produto')),
  CONSTRAINT ck_ref_tipo_card_item_categoria CHECK (eh_item = (categoria IS NOT NULL)),
  PRIMARY KEY (tipo_id, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_tipo_card_vigente ON dspd_bm.ref_tipo_card (tipo_id) WHERE vigente_ate IS NULL;

CREATE TABLE dspd_bm.ref_time (
  time_id integer NOT NULL CHECK (time_id > 0), vigente_de date NOT NULL, vigente_ate date NULL, nome varchar(80) NOT NULL CHECK (nome <> ''),
  ativo boolean NOT NULL DEFAULT true, motivo text NOT NULL CHECK (motivo IN ('processo','correcao','carga_inicial')),
  versao_id bigint NOT NULL, registrado_em timestamptz(3) NOT NULL DEFAULT now(), registrado_por varchar(64) NOT NULL CHECK (registrado_por <> ''),
  PRIMARY KEY (time_id, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_time_vigente ON dspd_bm.ref_time (time_id) WHERE vigente_ate IS NULL;

CREATE TABLE dspd_bm.ref_time_workflow (
  workflow_id varchar(32) NOT NULL CHECK (workflow_id ~ '^[\x21-\x7E]+$'), vigente_de date NOT NULL, vigente_ate date NULL, quadro_id varchar(32) NOT NULL CHECK (quadro_id ~ '^[\x21-\x7E]+$'), time_id integer NULL,
  situacao text NOT NULL CHECK (situacao IN ('time','fora')),
  motivo_fora text NULL CHECK (motivo_fora IN ('fora_de_todo_calculo','fora_do_operacional')),
  CONSTRAINT ck_ref_time_workflow_time CHECK ((situacao = 'time') = (time_id IS NOT NULL)),
  CONSTRAINT ck_ref_time_workflow_fora CHECK ((situacao = 'fora') = (motivo_fora IS NOT NULL)),
  motivo text NOT NULL CHECK (motivo IN ('processo','correcao','carga_inicial')),
  versao_id bigint NOT NULL, registrado_em timestamptz(3) NOT NULL DEFAULT now(), registrado_por varchar(64) NOT NULL CHECK (registrado_por <> ''),
  PRIMARY KEY (workflow_id, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_time_workflow_vigente ON dspd_bm.ref_time_workflow (workflow_id) WHERE vigente_ate IS NULL;

CREATE TRIGGER tg_ref_workflow_vigencia BEFORE UPDATE OR DELETE ON dspd_bm.ref_workflow FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao_vigencia();

CREATE TRIGGER tg_ref_workflow_sem_truncate BEFORE TRUNCATE ON dspd_bm.ref_workflow FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao_vigencia();

CREATE TRIGGER tg_ref_tipo_card_vigencia BEFORE UPDATE OR DELETE ON dspd_bm.ref_tipo_card FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao_vigencia();

CREATE TRIGGER tg_ref_tipo_card_sem_truncate BEFORE TRUNCATE ON dspd_bm.ref_tipo_card FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao_vigencia();

CREATE TRIGGER tg_ref_time_vigencia BEFORE UPDATE OR DELETE ON dspd_bm.ref_time FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao_vigencia();

CREATE TRIGGER tg_ref_time_sem_truncate BEFORE TRUNCATE ON dspd_bm.ref_time FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao_vigencia();

CREATE TRIGGER tg_ref_time_workflow_vigencia BEFORE UPDATE OR DELETE ON dspd_bm.ref_time_workflow FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao_vigencia();

CREATE TRIGGER tg_ref_time_workflow_sem_truncate BEFORE TRUNCATE ON dspd_bm.ref_time_workflow FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao_vigencia();

ALTER TABLE dspd_bm.ref_coluna ADD COLUMN workflow_id varchar(32) NULL CHECK (workflow_id ~ '^[\x21-\x7E]+$');

ALTER TABLE dspd_bm.ref_coluna ADD COLUMN coluna_mae_id varchar(32) NULL CHECK (coluna_mae_id ~ '^[\x21-\x7E]+$');

ALTER TABLE dspd_bm.ref_coluna ADD COLUMN section smallint NULL CHECK (section BETWEEN 1 AND 5);

ALTER TABLE dspd_bm.ref_coluna ADD COLUMN flow_type smallint NULL CHECK (flow_type IN (1,2));

ALTER TABLE dspd_bm.ref_coluna ADD COLUMN eh_folha boolean NOT NULL DEFAULT true;

ALTER TABLE dspd_bm.ref_coluna ADD COLUMN eh_descarte boolean NOT NULL DEFAULT false;

ALTER TABLE dspd_bm.ref_coluna ADD COLUMN motivo text NULL CHECK (motivo IN ('processo','correcao'));

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0018_bm_referencia_workflow_tipo_times', now());
COMMIT;
