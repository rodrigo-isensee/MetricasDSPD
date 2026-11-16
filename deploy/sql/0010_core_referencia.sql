-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0010_core_referencia.sql
BEGIN;
CREATE TABLE dspd_core.ref_versao_criterio (
  versao_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vigente_desde date NOT NULL, dominio text NOT NULL CHECK (dominio IN ('businessmap','acelerato')),
  descricao varchar(300) NOT NULL, motivo varchar(500) NOT NULL, referencia varchar(200) NOT NULL,
  registrado_em timestamptz(3) NOT NULL
);

CREATE INDEX ix_ref_versao_criterio_dom ON dspd_core.ref_versao_criterio (dominio, vigente_desde);

CREATE TABLE dspd_core.ref_versao_criterio_metrica (
  versao_id bigint NOT NULL, metrica_id varchar(40) NOT NULL,
  PRIMARY KEY (versao_id, metrica_id),
  CONSTRAINT fk_ref_vcm_versao FOREIGN KEY (versao_id) REFERENCES dspd_core.ref_versao_criterio (versao_id)
);

CREATE TABLE dspd_core.ref_calendario (
  calendario_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, nome varchar(80) NOT NULL,
  offset_minutos smallint NOT NULL, descricao varchar(300) NULL, CONSTRAINT uq_ref_calendario_nome UNIQUE (nome)
);

CREATE TABLE dspd_core.ref_calendario_turno (
  calendario_id smallint NOT NULL, dia_semana smallint NOT NULL,
  inicio_min smallint NOT NULL, vigente_de date NOT NULL, fim_min smallint NOT NULL, vigente_ate date NULL,
  PRIMARY KEY (calendario_id, dia_semana, inicio_min, vigente_de),
  CONSTRAINT ck_turno_dia CHECK (dia_semana BETWEEN 0 AND 6), CONSTRAINT ck_turno_inicio CHECK (inicio_min >= 0),
  CONSTRAINT ck_turno_fim CHECK (fim_min > inicio_min),
  CONSTRAINT fk_turno_calendario FOREIGN KEY (calendario_id) REFERENCES dspd_core.ref_calendario (calendario_id)
);

CREATE UNIQUE INDEX uq_ref_calendario_turno_vigente ON dspd_core.ref_calendario_turno (calendario_id, dia_semana, inicio_min) WHERE vigente_ate IS NULL;

CREATE TABLE dspd_core.ref_feriado (
  calendario_id smallint NOT NULL, data date NOT NULL,
  escopo text NOT NULL CHECK (escopo IN ('nacional','estadual','municipal','ponto_facultativo')), descricao varchar(200) NOT NULL,
  incluido_por_versao_id bigint NOT NULL, PRIMARY KEY (calendario_id, data),
  CONSTRAINT fk_feriado_calendario FOREIGN KEY (calendario_id) REFERENCES dspd_core.ref_calendario (calendario_id),
  CONSTRAINT fk_feriado_versao FOREIGN KEY (incluido_por_versao_id) REFERENCES dspd_core.ref_versao_criterio (versao_id)
);

CREATE TABLE dspd_core.ref_calendario_aplicacao (
  dominio text NOT NULL CHECK (dominio IN ('businessmap','acelerato')), classe varchar(60) NOT NULL,
  vigente_de date NOT NULL, calendario_id smallint NOT NULL, vigente_ate date NULL,
  PRIMARY KEY (dominio, classe, vigente_de),
  CONSTRAINT fk_cal_aplic_calendario FOREIGN KEY (calendario_id) REFERENCES dspd_core.ref_calendario (calendario_id)
);

CREATE UNIQUE INDEX uq_ref_calendario_aplicacao_vigente ON dspd_core.ref_calendario_aplicacao (dominio, classe) WHERE vigente_ate IS NULL;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0010_core_referencia', now());
COMMIT;
