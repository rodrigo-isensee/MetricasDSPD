-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0003_ac_controle.sql
BEGIN;
CREATE TABLE dspd_ac.ctl_coleta (
  coleta_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tarefa text NOT NULL CHECK (tarefa IN ('coleta_incremental','varredura','webhook','projecao','reconciliacao')),
  iniciado_em timestamptz(3) NOT NULL, finalizado_em timestamptz(3) NULL,
  status text NOT NULL CHECK (status IN ('em_andamento','sucesso','parcial','falha')),
  marca_dagua_de timestamptz(3) NULL, marca_dagua_ate timestamptz(3) NULL,
  sobreposicao_s integer NOT NULL DEFAULT 0 CHECK (sobreposicao_s >= 0),
  versao_coletor varchar(40) NOT NULL,
  parametros jsonb NULL,
  erro_resumo varchar(500) NULL
);

CREATE INDEX ix_ctl_coleta_tarefa ON dspd_ac.ctl_coleta (tarefa, status, finalizado_em);

CREATE TABLE dspd_ac.ctl_coleta_contagem (
  coleta_id bigint NOT NULL,
  entidade varchar(40) NOT NULL,
  lidos integer NOT NULL DEFAULT 0 CHECK (lidos >= 0), inseridos integer NOT NULL DEFAULT 0 CHECK (inseridos >= 0),
  ja_existentes integer NOT NULL DEFAULT 0 CHECK (ja_existentes >= 0), falhas integer NOT NULL DEFAULT 0 CHECK (falhas >= 0),
  PRIMARY KEY (coleta_id, entidade),
  CONSTRAINT fk_ctl_coleta_contagem_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_ac.ctl_coleta (coleta_id)
);

CREATE TABLE dspd_ac.ctl_coleta_falha (
  falha_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  coleta_id bigint NOT NULL,
  entidade varchar(40) NOT NULL,
  id_origem varchar(64) NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  tentativas smallint NOT NULL DEFAULT 1 CHECK (tentativas >= 0),
  erro varchar(500) NOT NULL,
  CONSTRAINT fk_ctl_coleta_falha_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_ac.ctl_coleta (coleta_id)
);

CREATE INDEX ix_ctl_coleta_falha_coleta ON dspd_ac.ctl_coleta_falha (coleta_id);

CREATE TABLE dspd_ac.ctl_reconciliacao (
  dia date NOT NULL,
  entidade varchar(40) NOT NULL,
  tipo varchar(40) NOT NULL,
  contagem_ferramenta integer NOT NULL CHECK (contagem_ferramenta >= 0),
  contagem_base integer NOT NULL CHECK (contagem_base >= 0),
  divergencia_pct numeric(7,4) NOT NULL,
  PRIMARY KEY (dia, entidade, tipo)
);

CREATE VIEW dspd_ac.vw_marca_dagua WITH (security_invoker = true) AS
  SELECT c.tarefa, n.entidade, max(c.marca_dagua_ate) AS marca_dagua_ate
  FROM dspd_ac.ctl_coleta c JOIN dspd_ac.ctl_coleta_contagem n ON n.coleta_id = c.coleta_id
  WHERE c.status = 'sucesso' GROUP BY c.tarefa, n.entidade;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0003_ac_controle', now());
COMMIT;
