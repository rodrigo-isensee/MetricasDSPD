-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0007_bm_referencia.sql
BEGIN;
CREATE TABLE dspd_bm.ref_quadro (
  quadro_id varchar(32) NOT NULL CHECK (quadro_id ~ '^[\x21-\x7E]+$'), vigente_de date NOT NULL, vigente_ate date NULL, equipe varchar(60) NOT NULL,
  nivel text NOT NULL CHECK (nivel IN ('time','coordenacao','gerencia')), eh_teste boolean NOT NULL DEFAULT false,
  PRIMARY KEY (quadro_id, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_quadro_vigente ON dspd_bm.ref_quadro (quadro_id) WHERE vigente_ate IS NULL;

CREATE TABLE dspd_bm.ref_coluna (
  quadro_id varchar(32) NOT NULL CHECK (quadro_id ~ '^[\x21-\x7E]+$'), coluna_id varchar(32) NOT NULL CHECK (coluna_id ~ '^[\x21-\x7E]+$'), vigente_de date NOT NULL, vigente_ate date NULL, nome varchar(80) NOT NULL,
  tipo_coluna text NULL CHECK (tipo_coluna IN ('fila','execucao')), papel varchar(30) NULL, ordem smallint NOT NULL CHECK (ordem >= 0),
  limite_wip smallint NULL CHECK (limite_wip >= 0),
  PRIMARY KEY (quadro_id, coluna_id, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_coluna_vigente ON dspd_bm.ref_coluna (quadro_id, coluna_id) WHERE vigente_ate IS NULL;

CREATE TABLE dspd_bm.ref_dominio (
  campo varchar(40) NOT NULL, codigo varchar(80) NOT NULL, vigente_de date NOT NULL, vigente_ate date NULL,
  rotulo varchar(120) NOT NULL, ordem smallint NOT NULL CHECK (ordem >= 0),
  PRIMARY KEY (campo, codigo, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_dominio_vigente ON dspd_bm.ref_dominio (campo, codigo) WHERE vigente_ate IS NULL;

CREATE TABLE dspd_bm.ref_sle (
  equipe varchar(60) NOT NULL, classe_servico varchar(80) NOT NULL, vigente_de date NOT NULL, vigente_ate date NULL,
  percentil smallint NOT NULL CHECK (percentil BETWEEN 1 AND 99), dias_uteis numeric(6,1) NOT NULL,
  PRIMARY KEY (equipe, classe_servico, percentil, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_sle_vigente ON dspd_bm.ref_sle (equipe, classe_servico, percentil) WHERE vigente_ate IS NULL;

CREATE TABLE dspd_bm.ref_alocacao_acordada (
  equipe varchar(60) NOT NULL, classe_servico varchar(80) NOT NULL, vigente_de date NOT NULL, vigente_ate date NULL,
  percentual numeric(5,2) NOT NULL, PRIMARY KEY (equipe, classe_servico, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_alocacao_acordada_vigente ON dspd_bm.ref_alocacao_acordada (equipe, classe_servico) WHERE vigente_ate IS NULL;

CREATE TABLE dspd_bm.ref_limite_frentes (
  equipe varchar(60) NOT NULL, vigente_de date NOT NULL, vigente_ate date NULL, limite smallint NOT NULL CHECK (limite >= 0),
  PRIMARY KEY (equipe, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_limite_frentes_vigente ON dspd_bm.ref_limite_frentes (equipe) WHERE vigente_ate IS NULL;

CREATE TABLE dspd_bm.ref_ficha_resultado (
  card_id varchar(32) NOT NULL CHECK (card_id ~ '^[\x21-\x7E]+$'), vigente_de date NOT NULL, vigente_ate date NULL, ficha jsonb NOT NULL,
  PRIMARY KEY (card_id, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_ficha_resultado_vigente ON dspd_bm.ref_ficha_resultado (card_id) WHERE vigente_ate IS NULL;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0007_bm_referencia', now());
COMMIT;
