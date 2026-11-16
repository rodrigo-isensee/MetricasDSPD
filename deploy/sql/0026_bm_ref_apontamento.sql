-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0026_bm_ref_apontamento.sql
BEGIN;
CREATE TABLE dspd_bm.ref_apontamento_subgrupo (
  codigo varchar(80) NOT NULL PRIMARY KEY CHECK (codigo ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  rotulo varchar(120) NOT NULL CHECK (rotulo <> ''), prioridade smallint NOT NULL CHECK (prioridade >= 0),
  incluido_por_versao_id bigint NOT NULL,
  CONSTRAINT uq_ref_apontamento_subgrupo_prioridade UNIQUE (prioridade)
);

CREATE TABLE dspd_bm.ref_apontamento_termo (
  subgrupo_codigo varchar(80) NOT NULL, termo_normalizado varchar(40) NOT NULL CHECK (termo_normalizado ~ '^[a-z0-9]{2,40}$'),
  incluido_por_versao_id bigint NOT NULL,
  PRIMARY KEY (termo_normalizado, subgrupo_codigo),
  CONSTRAINT fk_ref_apontamento_termo_subgrupo FOREIGN KEY (subgrupo_codigo) REFERENCES dspd_bm.ref_apontamento_subgrupo (codigo)
);

CREATE INDEX ix_ref_apontamento_termo_subgrupo ON dspd_bm.ref_apontamento_termo (subgrupo_codigo);

CREATE TABLE dspd_bm.ref_apontamento_regra_tipo (
  type_id text NOT NULL CHECK (type_id ~ '^[0-9]{1,12}$'), condicao varchar(40) NOT NULL CHECK (condicao ~ '^[a-z0-9_]+$'), subgrupo_codigo varchar(80) NOT NULL,
  incluido_por_versao_id bigint NOT NULL,
  PRIMARY KEY (type_id, condicao),
  CONSTRAINT fk_ref_apontamento_regra_subgrupo FOREIGN KEY (subgrupo_codigo) REFERENCES dspd_bm.ref_apontamento_subgrupo (codigo)
);

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0026_bm_ref_apontamento', now());
COMMIT;
