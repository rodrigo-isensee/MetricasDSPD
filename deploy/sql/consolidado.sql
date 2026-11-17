-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- Tudo em uma transação: roda como `dspd_migrador`, no banco `metricas`, depois do 00_papeis_e_banco.sql.
--   psql -v ON_ERROR_STOP=1 -h <servidor> -U dspd_migrador -d metricas -f consolidado.sql
SET TimeZone TO 'UTC';
BEGIN;
CREATE SCHEMA IF NOT EXISTS dspd_core;
CREATE TABLE dspd_core.pgmigrations (id SERIAL PRIMARY KEY, name varchar(255) NOT NULL, run_on timestamp NOT NULL);

CREATE SCHEMA IF NOT EXISTS dspd_bm;

CREATE SCHEMA IF NOT EXISTS dspd_ac;

CREATE SCHEMA IF NOT EXISTS dspd_core;

CREATE FUNCTION dspd_core.proibir_alteracao() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN
  RAISE EXCEPTION 'tabela % é append-only: % não é permitido', TG_TABLE_NAME, TG_OP USING ERRCODE = '55000';
END
$f$;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0001_schemas', now());

CREATE TABLE dspd_bm.ctl_coleta (
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

CREATE INDEX ix_ctl_coleta_tarefa ON dspd_bm.ctl_coleta (tarefa, status, finalizado_em);

CREATE TABLE dspd_bm.ctl_coleta_contagem (
  coleta_id bigint NOT NULL,
  entidade varchar(40) NOT NULL,
  lidos integer NOT NULL DEFAULT 0 CHECK (lidos >= 0), inseridos integer NOT NULL DEFAULT 0 CHECK (inseridos >= 0),
  ja_existentes integer NOT NULL DEFAULT 0 CHECK (ja_existentes >= 0), falhas integer NOT NULL DEFAULT 0 CHECK (falhas >= 0),
  PRIMARY KEY (coleta_id, entidade),
  CONSTRAINT fk_ctl_coleta_contagem_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id)
);

CREATE TABLE dspd_bm.ctl_coleta_falha (
  falha_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  coleta_id bigint NOT NULL,
  entidade varchar(40) NOT NULL,
  id_origem varchar(64) NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  tentativas smallint NOT NULL DEFAULT 1 CHECK (tentativas >= 0),
  erro varchar(500) NOT NULL,
  CONSTRAINT fk_ctl_coleta_falha_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id)
);

CREATE INDEX ix_ctl_coleta_falha_coleta ON dspd_bm.ctl_coleta_falha (coleta_id);

CREATE TABLE dspd_bm.ctl_reconciliacao (
  dia date NOT NULL,
  entidade varchar(40) NOT NULL,
  tipo varchar(40) NOT NULL,
  contagem_ferramenta integer NOT NULL CHECK (contagem_ferramenta >= 0),
  contagem_base integer NOT NULL CHECK (contagem_base >= 0),
  divergencia_pct numeric(7,4) NOT NULL,
  PRIMARY KEY (dia, entidade, tipo)
);

CREATE VIEW dspd_bm.vw_marca_dagua WITH (security_invoker = true) AS
  SELECT c.tarefa, n.entidade, max(c.marca_dagua_ate) AS marca_dagua_ate
  FROM dspd_bm.ctl_coleta c JOIN dspd_bm.ctl_coleta_contagem n ON n.coleta_id = c.coleta_id
  WHERE c.status = 'sucesso' GROUP BY c.tarefa, n.entidade;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0002_bm_controle', now());

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

CREATE TABLE dspd_bm.stg_card (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  anterior_sk bigint NULL,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32),
  payload jsonb NOT NULL,
  quadro_id varchar(32) NOT NULL CHECK (quadro_id ~ '^[\x21-\x7E]+$'),
  arquivado boolean NOT NULL,
  excluido_detectado boolean NOT NULL,
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_card_sis CHECK (sistema_origem = 'businessmap'),
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_card UNIQUE NULLS NOT DISTINCT (id_origem, anterior_sk),
  CONSTRAINT fk_stg_card_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id)
);

CREATE INDEX ix_stg_card_ultima ON dspd_bm.stg_card (id_origem, stg_sk DESC);

CREATE INDEX ix_stg_card_coleta ON dspd_bm.stg_card (coleta_id);

CREATE INDEX ix_stg_card_coletado ON dspd_bm.stg_card (coletado_em);

CREATE TRIGGER tg_stg_card_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_card FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_card_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_card FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_revision (
  revision_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id varchar(32) NOT NULL CHECK (card_id ~ '^[\x21-\x7E]+$'), revision_id varchar(32) NOT NULL CHECK (revision_id ~ '^[\x21-\x7E]+$'),
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32), payload jsonb NOT NULL,
  coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_revision UNIQUE (card_id, revision_id),
  CONSTRAINT fk_stg_revision_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_revision_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_stg_revision_coleta ON dspd_bm.stg_revision (coleta_id);

CREATE INDEX ix_stg_revision_coletado ON dspd_bm.stg_revision (coletado_em);

CREATE TRIGGER tg_stg_revision_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_revision FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_revision_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_revision FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_vinculo (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pai_id varchar(32) NOT NULL CHECK (pai_id ~ '^[\x21-\x7E]+$'),
  filho_id varchar(32) NOT NULL CHECK (filho_id ~ '^[\x21-\x7E]+$'),
  anterior_sk bigint NULL,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32),
  payload jsonb NOT NULL,
  
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_vinculo_sis CHECK (sistema_origem = 'businessmap'),
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_vinculo UNIQUE NULLS NOT DISTINCT (pai_id, filho_id, anterior_sk),
  CONSTRAINT fk_stg_vinculo_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id)
);

CREATE INDEX ix_stg_vinculo_ultima ON dspd_bm.stg_vinculo (pai_id, filho_id, stg_sk DESC);

CREATE INDEX ix_stg_vinculo_coleta ON dspd_bm.stg_vinculo (coleta_id);

CREATE INDEX ix_stg_vinculo_coletado ON dspd_bm.stg_vinculo (coletado_em);

CREATE TRIGGER tg_stg_vinculo_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_vinculo FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_vinculo_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_vinculo FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_custom_field (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  anterior_sk bigint NULL,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32),
  payload jsonb NOT NULL,
  
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_custom_field_sis CHECK (sistema_origem = 'businessmap'),
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_custom_field UNIQUE NULLS NOT DISTINCT (id_origem, anterior_sk),
  CONSTRAINT fk_stg_custom_field_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id)
);

CREATE INDEX ix_stg_custom_field_ultima ON dspd_bm.stg_custom_field (id_origem, stg_sk DESC);

CREATE INDEX ix_stg_custom_field_coleta ON dspd_bm.stg_custom_field (coleta_id);

CREATE INDEX ix_stg_custom_field_coletado ON dspd_bm.stg_custom_field (coletado_em);

CREATE TRIGGER tg_stg_custom_field_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_custom_field FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_custom_field_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_custom_field FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_coluna (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quadro_id varchar(32) NOT NULL CHECK (quadro_id ~ '^[\x21-\x7E]+$'),
  id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  anterior_sk bigint NULL,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32),
  payload jsonb NOT NULL,
  
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_coluna_sis CHECK (sistema_origem = 'businessmap'),
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_coluna UNIQUE NULLS NOT DISTINCT (quadro_id, id_origem, anterior_sk),
  CONSTRAINT fk_stg_coluna_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id)
);

CREATE INDEX ix_stg_coluna_ultima ON dspd_bm.stg_coluna (quadro_id, id_origem, stg_sk DESC);

CREATE INDEX ix_stg_coluna_coleta ON dspd_bm.stg_coluna (coleta_id);

CREATE INDEX ix_stg_coluna_coletado ON dspd_bm.stg_coluna (coletado_em);

CREATE TRIGGER tg_stg_coluna_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_coluna FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_coluna_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_coluna FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_bloqueio (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id varchar(32) NOT NULL CHECK (card_id ~ '^[\x21-\x7E]+$'),
  id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  anterior_sk bigint NULL,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32),
  payload jsonb NOT NULL,
  
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_bloqueio_sis CHECK (sistema_origem = 'businessmap'),
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_bloqueio UNIQUE NULLS NOT DISTINCT (card_id, id_origem, anterior_sk),
  CONSTRAINT fk_stg_bloqueio_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id)
);

CREATE INDEX ix_stg_bloqueio_ultima ON dspd_bm.stg_bloqueio (card_id, id_origem, stg_sk DESC);

CREATE INDEX ix_stg_bloqueio_coleta ON dspd_bm.stg_bloqueio (coleta_id);

CREATE INDEX ix_stg_bloqueio_coletado ON dspd_bm.stg_bloqueio (coletado_em);

CREATE TRIGGER tg_stg_bloqueio_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_bloqueio FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_bloqueio_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_bloqueio FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_webhook_evento (
  webhook_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32), payload jsonb NOT NULL,
  recebido_em timestamptz(3) NOT NULL,
  CONSTRAINT uq_stg_webhook_evento UNIQUE (payload_sha256),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_webhook_evento_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_stg_webhook_evento_recebido ON dspd_bm.stg_webhook_evento (recebido_em);

CREATE TRIGGER tg_stg_webhook_evento_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_webhook_evento FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_webhook_evento_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_webhook_evento FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_webhook_processamento (
  proc_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  webhook_sk bigint NOT NULL, coleta_id bigint NOT NULL,
  resultado text NOT NULL CHECK (resultado IN ('processado','ignorado','erro')),
  erro varchar(500) NULL, coletado_em timestamptz(3) NOT NULL,
  CONSTRAINT uq_stg_webhook_processamento UNIQUE (webhook_sk, coleta_id),
  CONSTRAINT fk_stg_webhook_proc_evt FOREIGN KEY (webhook_sk) REFERENCES dspd_bm.stg_webhook_evento (webhook_sk),
  CONSTRAINT fk_stg_webhook_processamento_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_webhook_processamento_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_stg_webhook_processamento_coleta ON dspd_bm.stg_webhook_processamento (coleta_id);

CREATE TRIGGER tg_stg_webhook_processamento_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_webhook_processamento FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_webhook_processamento_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_webhook_processamento FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.stg_card_presenca (
  presenca_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  varredura_id bigint NOT NULL,
  id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_card_presenca UNIQUE (varredura_id, id_origem),
  CONSTRAINT fk_stg_card_presenca_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_card_presenca_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_stg_card_presenca_coleta ON dspd_bm.stg_card_presenca (coleta_id);

CREATE TRIGGER tg_stg_card_presenca_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_card_presenca FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_card_presenca_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_card_presenca FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0004_bm_staging', now());

CREATE TABLE dspd_bm.dim_card_versao (
  card_versao_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id varchar(32) NOT NULL CHECK (card_id ~ '^[\x21-\x7E]+$'), vigente_de timestamptz(3) NOT NULL, stg_card_sk bigint NOT NULL,
  titulo varchar(500) NULL, tipo varchar(80) NULL, classe_servico varchar(80) NULL,
  granularidade varchar(20) NULL, equipe varchar(60) NULL, quadro_id varchar(32) NULL CHECK (quadro_id ~ '^[\x21-\x7E]+$'),
  coluna_atual_id varchar(32) NULL CHECK (coluna_atual_id ~ '^[\x21-\x7E]+$'), sistema varchar(80) NULL,
  area_solicitante varchar(80) NULL, fornecedor varchar(80) NULL, objetivo_estrategico varchar(80) NULL,
  card_pai varchar(32) NULL CHECK (card_pai ~ '^[\x21-\x7E]+$'), eh_subtarefa boolean NULL,
  data_acordada date NULL, responsabilidade_atraso varchar(80) NULL, origem_demanda varchar(80) NULL,
  fase_deteccao varchar(80) NULL, severidade varchar(80) NULL, causa_raiz varchar(80) NULL,
  origem_bug varchar(40) NULL, adicionado_apos_inicio_pai boolean NULL,
  motivo_descarte varchar(80) NULL, tamanho_declarado varchar(80) NULL,
  responsaveis text[] NOT NULL DEFAULT '{}',
  coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT fk_dim_card_versao_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  CONSTRAINT uq_dim_card_versao UNIQUE (card_id, vigente_de),
  CONSTRAINT fk_dim_card_versao_stg FOREIGN KEY (stg_card_sk) REFERENCES dspd_bm.stg_card (stg_sk),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_dim_card_versao_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_dim_card_versao_coleta ON dspd_bm.dim_card_versao (coleta_id);

CREATE TRIGGER tg_dim_card_versao_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.dim_card_versao FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_dim_card_versao_sem_truncate BEFORE TRUNCATE ON dspd_bm.dim_card_versao FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.evt_card (
  evt_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id varchar(32) NOT NULL CHECK (card_id ~ '^[\x21-\x7E]+$'),
  tipo text NOT NULL CHECK (tipo IN ('criado','arquivado','desarquivado','excluido_detectado','restaurado')),
  ocorrido_em timestamptz(3) NOT NULL, coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT fk_evt_card_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  CONSTRAINT uq_evt_card UNIQUE (card_id, tipo, ocorrido_em),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_evt_card_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_evt_card_coleta ON dspd_bm.evt_card (coleta_id);

CREATE TRIGGER tg_evt_card_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.evt_card FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_evt_card_sem_truncate BEFORE TRUNCATE ON dspd_bm.evt_card FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.fato_transicao (
  transicao_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id varchar(32) NOT NULL CHECK (card_id ~ '^[\x21-\x7E]+$'), quadro_id varchar(32) NULL CHECK (quadro_id ~ '^[\x21-\x7E]+$'),
  coluna_origem_id varchar(32) NULL CHECK (coluna_origem_id ~ '^[\x21-\x7E]+$'), coluna_destino_id varchar(32) NOT NULL CHECK (coluna_destino_id ~ '^[\x21-\x7E]+$'),
  tipo_coluna text NULL CHECK (tipo_coluna IN ('fila','execucao')), direcao text NULL CHECK (direcao IN ('avanco','retorno')),
  fonte text NOT NULL CHECK (fonte IN ('revision','webhook')), id_origem varchar(64) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  ocorrido_em timestamptz(3) NOT NULL, usuario text NULL, coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT fk_fato_transicao_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  CONSTRAINT uq_fato_transicao UNIQUE (fonte, id_origem),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_fato_transicao_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_fato_transicao_coleta ON dspd_bm.fato_transicao (coleta_id);

CREATE TRIGGER tg_fato_transicao_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.fato_transicao FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_fato_transicao_sem_truncate BEFORE TRUNCATE ON dspd_bm.fato_transicao FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.rec_transicao_par (
  par_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  transicao_webhook_sk bigint NOT NULL, transicao_revision_sk bigint NOT NULL,
  delta_ms integer NOT NULL, casado_em timestamptz(3) NOT NULL, coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT fk_rec_transicao_par_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  CONSTRAINT uq_rec_par_webhook UNIQUE (transicao_webhook_sk),
  CONSTRAINT uq_rec_par_revision UNIQUE (transicao_revision_sk),
  CONSTRAINT fk_rec_par_webhook FOREIGN KEY (transicao_webhook_sk) REFERENCES dspd_bm.fato_transicao (transicao_sk),
  CONSTRAINT fk_rec_par_revision FOREIGN KEY (transicao_revision_sk) REFERENCES dspd_bm.fato_transicao (transicao_sk),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_rec_transicao_par_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_rec_transicao_par_coleta ON dspd_bm.rec_transicao_par (coleta_id);

CREATE TRIGGER tg_rec_transicao_par_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.rec_transicao_par FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_rec_transicao_par_sem_truncate BEFORE TRUNCATE ON dspd_bm.rec_transicao_par FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.evt_bloqueio (
  evt_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id varchar(32) NOT NULL CHECK (card_id ~ '^[\x21-\x7E]+$'), id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'), tipo text NOT NULL CHECK (tipo IN ('inicio','fim')),
  motivo_codigo varchar(80) NULL, coluna_id varchar(32) NULL CHECK (coluna_id ~ '^[\x21-\x7E]+$'), fornecedor_codigo varchar(80) NULL,
  ocorrido_em timestamptz(3) NOT NULL, coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT fk_evt_bloqueio_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  CONSTRAINT uq_evt_bloqueio UNIQUE (card_id, id_origem, tipo),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_evt_bloqueio_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_evt_bloqueio_coleta ON dspd_bm.evt_bloqueio (coleta_id);

CREATE TRIGGER tg_evt_bloqueio_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.evt_bloqueio FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_evt_bloqueio_sem_truncate BEFORE TRUNCATE ON dspd_bm.evt_bloqueio FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE INDEX ix_fato_transicao_card ON dspd_bm.fato_transicao (card_id, ocorrido_em);

CREATE INDEX ix_fato_transicao_ocorrido ON dspd_bm.fato_transicao (ocorrido_em);

CREATE VIEW dspd_bm.vw_transicao_canonica WITH (security_invoker = true) AS
  SELECT t.transicao_sk, t.card_id, t.quadro_id, t.coluna_origem_id, t.coluna_destino_id, t.tipo_coluna, t.direcao,
         t.fonte, t.id_origem, t.ocorrido_em, t.sistema_origem, t.coletado_em, t.coleta_id
  FROM dspd_bm.fato_transicao t
  WHERE t.fonte = 'revision'
     OR NOT EXISTS (SELECT 1 FROM dspd_bm.rec_transicao_par p WHERE p.transicao_webhook_sk = t.transicao_sk);

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0005_bm_historico', now());

CREATE TABLE dspd_bm.dim_card (
  card_id varchar(32) NOT NULL CHECK (card_id ~ '^[\x21-\x7E]+$') PRIMARY KEY,
  tipo varchar(80) NULL, classe_servico varchar(80) NULL, sistema varchar(80) NULL,
  area_solicitante varchar(80) NULL, fornecedor varchar(80) NULL, objetivo_estrategico varchar(80) NULL,
  card_pai varchar(32) NULL CHECK (card_pai ~ '^[\x21-\x7E]+$'),
  criado_em timestamptz(3) NULL, comprometido_em timestamptz(3) NULL, iniciado_em timestamptz(3) NULL, concluido_em timestamptz(3) NULL,
  arquivado_em timestamptz(3) NULL, motivo_descarte varchar(80) NULL, tamanho_declarado varchar(80) NULL,
  responsaveis text[] NOT NULL DEFAULT '{}',
  titulo varchar(500) NULL, granularidade varchar(20) NULL, equipe varchar(60) NULL,
  quadro_id varchar(32) NULL CHECK (quadro_id ~ '^[\x21-\x7E]+$'), coluna_atual_id varchar(32) NULL CHECK (coluna_atual_id ~ '^[\x21-\x7E]+$'),
  excluido_em timestamptz(3) NULL, eh_subtarefa boolean NULL, data_acordada date NULL,
  responsabilidade_atraso varchar(80) NULL, origem_demanda varchar(80) NULL, fase_deteccao varchar(80) NULL,
  severidade varchar(80) NULL, causa_raiz varchar(80) NULL, origem_bug varchar(40) NULL,
  adicionado_apos_inicio_pai boolean NULL,
  coletado_em timestamptz(3) NOT NULL, atualizado_por_coleta_id bigint NOT NULL,
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_dim_card_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_dim_card_equipe ON dspd_bm.dim_card (equipe, granularidade, tipo, concluido_em);

CREATE INDEX ix_dim_card_sistema ON dspd_bm.dim_card (granularidade, sistema, concluido_em);

CREATE INDEX ix_dim_card_abertos ON dspd_bm.dim_card (iniciado_em) WHERE concluido_em IS NULL;

CREATE INDEX ix_dim_card_criado ON dspd_bm.dim_card (criado_em);

CREATE INDEX ix_dim_card_pai ON dspd_bm.dim_card (card_pai);

CREATE TABLE dspd_bm.fato_bloqueio (
  bloqueio_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id varchar(32) NOT NULL CHECK (card_id ~ '^[\x21-\x7E]+$'), id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'), motivo varchar(80) NULL, coluna_em_que_bloqueou varchar(32) NULL CHECK (coluna_em_que_bloqueou ~ '^[\x21-\x7E]+$'),
  fornecedor varchar(80) NULL, inicio timestamptz(3) NOT NULL, fim timestamptz(3) NULL,
  duracao_horas_uteis numeric(12,2) NULL, coletado_em timestamptz(3) NOT NULL, atualizado_por_coleta_id bigint NOT NULL,
  CONSTRAINT uq_fato_bloqueio UNIQUE (card_id, id_origem),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_fato_bloqueio_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_fato_bloqueio_card ON dspd_bm.fato_bloqueio (card_id, inicio);

CREATE INDEX ix_fato_bloqueio_abertos ON dspd_bm.fato_bloqueio (inicio) WHERE fim IS NULL;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0006_bm_projecoes', now());

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

CREATE TABLE dspd_ac.stg_chamado (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  anterior_sk bigint NULL,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32),
  payload jsonb NOT NULL,
  ausente_na_extracao boolean NOT NULL DEFAULT false,
  sistema_origem text NOT NULL DEFAULT 'acelerato',
  CONSTRAINT ck_stg_chamado_sis CHECK (sistema_origem = 'acelerato'),
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_chamado UNIQUE NULLS NOT DISTINCT (id_origem, anterior_sk),
  CONSTRAINT fk_stg_chamado_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_ac.ctl_coleta (coleta_id)
);

CREATE INDEX ix_stg_chamado_ultima ON dspd_ac.stg_chamado (id_origem, stg_sk DESC);

CREATE INDEX ix_stg_chamado_coleta ON dspd_ac.stg_chamado (coleta_id);

CREATE INDEX ix_stg_chamado_coletado ON dspd_ac.stg_chamado (coletado_em);

CREATE TRIGGER tg_stg_chamado_imutavel BEFORE UPDATE OR DELETE ON dspd_ac.stg_chamado FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_chamado_sem_truncate BEFORE TRUNCATE ON dspd_ac.stg_chamado FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_ac.stg_etapa (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chamado_id varchar(32) NOT NULL CHECK (chamado_id ~ '^[\x21-\x7E]+$'),
  id_origem varchar(32) NOT NULL CHECK (id_origem ~ '^[\x21-\x7E]+$'),
  anterior_sk bigint NULL,
  payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32),
  payload jsonb NOT NULL,
  ausente_na_extracao boolean NOT NULL DEFAULT false,
  sistema_origem text NOT NULL DEFAULT 'acelerato',
  CONSTRAINT ck_stg_etapa_sis CHECK (sistema_origem = 'acelerato'),
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_etapa UNIQUE NULLS NOT DISTINCT (chamado_id, id_origem, anterior_sk),
  CONSTRAINT fk_stg_etapa_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_ac.ctl_coleta (coleta_id)
);

CREATE INDEX ix_stg_etapa_ultima ON dspd_ac.stg_etapa (chamado_id, id_origem, stg_sk DESC);

CREATE INDEX ix_stg_etapa_coleta ON dspd_ac.stg_etapa (coleta_id);

CREATE INDEX ix_stg_etapa_coletado ON dspd_ac.stg_etapa (coletado_em);

CREATE TRIGGER tg_stg_etapa_imutavel BEFORE UPDATE OR DELETE ON dspd_ac.stg_etapa FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_etapa_sem_truncate BEFORE TRUNCATE ON dspd_ac.stg_etapa FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_ac.dim_chamado_versao (
  chamado_versao_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chamado_id varchar(32) NOT NULL CHECK (chamado_id ~ '^[\x21-\x7E]+$'), vigente_de timestamptz(3) NOT NULL, stg_chamado_sk bigint NOT NULL,
  natureza varchar(80) NULL,
  equipe varchar(80) NULL,
  organizacao varchar(80) NULL,
  tipo varchar(80) NULL,
  categoria_sistema varchar(80) NULL,
  excluido boolean NOT NULL DEFAULT false,
  status varchar(80) NULL,
  impacto varchar(80) NULL,
  urgencia varchar(80) NULL,
  prioridade varchar(80) NULL,
  prioridade_ajustada_manualmente boolean NOT NULL DEFAULT false,
  aberto_em timestamptz(3) NULL,
  primeiro_atendimento_em timestamptz(3) NULL,
  restaurado_em timestamptz(3) NULL,
  data_finalizado timestamptz(3) NULL,
  status_sla_r varchar(32) NULL CHECK (status_sla_r IN ('REALIZADO_NO_PRAZO','REALIZADO_APOS_VENCIMENTO')),
  status_sla_pa varchar(32) NULL,
  motivo_escalacao varchar(80) NULL,
  motivo_pendencia_atual varchar(80) NULL,
  previsao_retorno timestamptz(3) NULL,
  motivo_encerramento varchar(80) NULL,
  avaliacao_problema varchar(80) NULL,
  excecao_sla_registro_posterior boolean NOT NULL DEFAULT false,
  incidente_critico_coordenado boolean NOT NULL DEFAULT false,
  nivel_resolucao varchar(80) NULL,
  etapa varchar(80) NULL,
  coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT fk_dim_chamado_versao_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_ac.ctl_coleta (coleta_id),
  CONSTRAINT uq_dim_chamado_versao UNIQUE (chamado_id, vigente_de),
  CONSTRAINT fk_dim_chamado_versao_stg FOREIGN KEY (stg_chamado_sk) REFERENCES dspd_ac.stg_chamado (stg_sk),
  sistema_origem text NOT NULL DEFAULT 'acelerato',
  CONSTRAINT ck_dim_chamado_versao_sis CHECK (sistema_origem = 'acelerato')
);

CREATE INDEX ix_dim_chamado_versao_coleta ON dspd_ac.dim_chamado_versao (coleta_id);

CREATE TRIGGER tg_dim_chamado_versao_imutavel BEFORE UPDATE OR DELETE ON dspd_ac.dim_chamado_versao FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_dim_chamado_versao_sem_truncate BEFORE TRUNCATE ON dspd_ac.dim_chamado_versao FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_ac.evt_etapa_chamado (
  evt_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chamado_id varchar(32) NOT NULL CHECK (chamado_id ~ '^[\x21-\x7E]+$'), etapa varchar(80) NOT NULL, entrada_em timestamptz(3) NOT NULL, motivo_pendencia varchar(80) NULL,
  coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT fk_evt_etapa_chamado_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_ac.ctl_coleta (coleta_id),
  CONSTRAINT uq_evt_etapa_chamado UNIQUE (chamado_id, etapa, entrada_em),
  sistema_origem text NOT NULL DEFAULT 'acelerato',
  CONSTRAINT ck_evt_etapa_chamado_sis CHECK (sistema_origem = 'acelerato')
);

CREATE INDEX ix_evt_etapa_chamado_coleta ON dspd_ac.evt_etapa_chamado (coleta_id);

CREATE TRIGGER tg_evt_etapa_chamado_imutavel BEFORE UPDATE OR DELETE ON dspd_ac.evt_etapa_chamado FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_evt_etapa_chamado_sem_truncate BEFORE TRUNCATE ON dspd_ac.evt_etapa_chamado FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0008_ac_staging_historico', now());

CREATE TABLE dspd_ac.dim_chamado (
  chamado_id varchar(32) NOT NULL CHECK (chamado_id ~ '^[\x21-\x7E]+$') PRIMARY KEY,
  natureza varchar(80) NULL,
  equipe varchar(80) NULL,
  organizacao varchar(80) NULL,
  tipo varchar(80) NULL,
  categoria_sistema varchar(80) NULL,
  excluido boolean NOT NULL DEFAULT false,
  status varchar(80) NULL,
  impacto varchar(80) NULL,
  urgencia varchar(80) NULL,
  prioridade varchar(80) NULL,
  prioridade_ajustada_manualmente boolean NOT NULL DEFAULT false,
  aberto_em timestamptz(3) NULL,
  primeiro_atendimento_em timestamptz(3) NULL,
  restaurado_em timestamptz(3) NULL,
  data_finalizado timestamptz(3) NULL,
  status_sla_r varchar(32) NULL CHECK (status_sla_r IN ('REALIZADO_NO_PRAZO','REALIZADO_APOS_VENCIMENTO')),
  status_sla_pa varchar(32) NULL,
  motivo_escalacao varchar(80) NULL,
  motivo_pendencia_atual varchar(80) NULL,
  previsao_retorno timestamptz(3) NULL,
  motivo_encerramento varchar(80) NULL,
  avaliacao_problema varchar(80) NULL,
  excecao_sla_registro_posterior boolean NOT NULL DEFAULT false,
  incidente_critico_coordenado boolean NOT NULL DEFAULT false,
  nivel_resolucao varchar(80) NULL,
  etapa varchar(80) NULL,
  coletado_em timestamptz(3) NOT NULL, atualizado_por_coleta_id bigint NOT NULL,
  sistema_origem text NOT NULL DEFAULT 'acelerato',
  CONSTRAINT ck_dim_chamado_sis CHECK (sistema_origem = 'acelerato')
);

CREATE INDEX ix_dim_chamado_equipe ON dspd_ac.dim_chamado (equipe, prioridade, data_finalizado);

CREATE INDEX ix_dim_chamado_abertos ON dspd_ac.dim_chamado (aberto_em) WHERE data_finalizado IS NULL;

CREATE TABLE dspd_ac.fato_etapa_chamado (
  chamado_id varchar(32) NOT NULL CHECK (chamado_id ~ '^[\x21-\x7E]+$'), etapa varchar(80) NOT NULL, entrada timestamptz(3) NOT NULL, saida timestamptz(3) NULL,
  motivo_pendencia varchar(80) NULL, totalizador varchar(40) NULL, coletado_em timestamptz(3) NOT NULL, atualizado_por_coleta_id bigint NOT NULL,
  PRIMARY KEY (chamado_id, etapa, entrada),
  sistema_origem text NOT NULL DEFAULT 'acelerato',
  CONSTRAINT ck_fato_etapa_chamado_sis CHECK (sistema_origem = 'acelerato')
);

CREATE INDEX ix_fato_etapa_etapa ON dspd_ac.fato_etapa_chamado (etapa, entrada);

CREATE TABLE dspd_ac.ref_etapa_totalizador (
  natureza varchar(80) NOT NULL, etapa_origem varchar(80) NOT NULL, vigente_de date NOT NULL, vigente_ate date NULL,
  totalizador varchar(40) NOT NULL, PRIMARY KEY (natureza, etapa_origem, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_etapa_totalizador_vigente ON dspd_ac.ref_etapa_totalizador (natureza, etapa_origem) WHERE vigente_ate IS NULL;

CREATE TABLE dspd_ac.ref_dominio (
  campo varchar(40) NOT NULL, codigo varchar(80) NOT NULL, vigente_de date NOT NULL, vigente_ate date NULL,
  rotulo varchar(120) NOT NULL, ordem smallint NOT NULL CHECK (ordem >= 0), PRIMARY KEY (campo, codigo, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_dominio_vigente ON dspd_ac.ref_dominio (campo, codigo) WHERE vigente_ate IS NULL;

CREATE TABLE dspd_ac.ref_alvo_prioridade (
  prioridade varchar(80) NOT NULL, vigente_de date NOT NULL, vigente_ate date NULL,
  prazo_pa_horas_uteis numeric(8,2) NOT NULL, prazo_r_horas_uteis numeric(8,2) NOT NULL,
  PRIMARY KEY (prioridade, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_alvo_prioridade_vigente ON dspd_ac.ref_alvo_prioridade (prioridade) WHERE vigente_ate IS NULL;

CREATE TABLE dspd_ac.ctl_automacao (
  automacao_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chamado_id varchar(32) NOT NULL CHECK (chamado_id ~ '^[\x21-\x7E]+$'), regra varchar(60) NOT NULL, momento_gatilho timestamptz(3) NOT NULL, tentativa smallint NOT NULL CHECK (tentativa >= 0),
  acao varchar(80) NOT NULL, modo text NOT NULL CHECK (modo IN ('simulacao','ativo')), resultado varchar(200) NULL,
  registrado_no_chamado boolean NOT NULL DEFAULT false, coletado_em timestamptz(3) NOT NULL, coleta_id bigint NULL,
  CONSTRAINT uq_ctl_automacao UNIQUE (chamado_id, regra, momento_gatilho, tentativa),
  CONSTRAINT fk_ctl_automacao_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_ac.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'acelerato',
  CONSTRAINT ck_ctl_automacao_sis CHECK (sistema_origem = 'acelerato')
);

CREATE INDEX ix_ctl_automacao_coleta ON dspd_ac.ctl_automacao (coleta_id);

CREATE VIEW dspd_ac.vw_populacao_sssc WITH (security_invoker = true) AS
  SELECT c.chamado_id, c.natureza, c.equipe, c.organizacao, c.tipo, c.categoria_sistema, c.excluido, c.status, c.impacto, c.urgencia, c.prioridade, c.prioridade_ajustada_manualmente, c.aberto_em, c.primeiro_atendimento_em, c.restaurado_em, c.data_finalizado, c.status_sla_r, c.status_sla_pa, c.motivo_escalacao, c.motivo_pendencia_atual, c.previsao_retorno, c.motivo_encerramento, c.avaliacao_problema, c.excecao_sla_registro_posterior, c.incidente_critico_coordenado, c.nivel_resolucao, c.etapa FROM dspd_ac.dim_chamado c
  WHERE c.excluido = false
    AND c.organizacao IN (SELECT codigo FROM dspd_ac.ref_dominio WHERE campo = 'organizacao_recorte' AND vigente_ate IS NULL)
    AND c.tipo IN (SELECT codigo FROM dspd_ac.ref_dominio WHERE campo = 'tipo_recorte' AND vigente_ate IS NULL)
    AND c.equipe IN (SELECT codigo FROM dspd_ac.ref_dominio WHERE campo = 'equipe' AND vigente_ate IS NULL);

CREATE VIEW dspd_ac.vw_fechados_sla WITH (security_invoker = true) AS
  SELECT p.chamado_id, p.natureza, p.equipe, p.organizacao, p.tipo, p.categoria_sistema, p.excluido, p.status, p.impacto, p.urgencia, p.prioridade, p.prioridade_ajustada_manualmente, p.aberto_em, p.primeiro_atendimento_em, p.restaurado_em, p.data_finalizado, p.status_sla_r, p.status_sla_pa, p.motivo_escalacao, p.motivo_pendencia_atual, p.previsao_retorno, p.motivo_encerramento, p.avaliacao_problema, p.excecao_sla_registro_posterior, p.incidente_critico_coordenado, p.nivel_resolucao, p.etapa,
    CASE p.status_sla_r WHEN 'REALIZADO_NO_PRAZO' THEN true WHEN 'REALIZADO_APOS_VENCIMENTO' THEN false END AS dentro_sla
  FROM dspd_ac.vw_populacao_sssc p
  WHERE p.status = 'Concluído' AND p.data_finalizado IS NOT NULL;

CREATE VIEW dspd_ac.vw_abertos WITH (security_invoker = true) AS
  SELECT p.chamado_id, p.natureza, p.equipe, p.organizacao, p.tipo, p.categoria_sistema, p.excluido, p.status, p.impacto, p.urgencia, p.prioridade, p.prioridade_ajustada_manualmente, p.aberto_em, p.primeiro_atendimento_em, p.restaurado_em, p.data_finalizado, p.status_sla_r, p.status_sla_pa, p.motivo_escalacao, p.motivo_pendencia_atual, p.previsao_retorno, p.motivo_encerramento, p.avaliacao_problema, p.excecao_sla_registro_posterior, p.incidente_critico_coordenado, p.nivel_resolucao, p.etapa FROM dspd_ac.vw_populacao_sssc p WHERE p.data_finalizado IS NULL;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0009_ac_projecoes_referencia', now());

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

CREATE TABLE dspd_core.outbox (
  evento_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  evento_id uuid NOT NULL DEFAULT gen_random_uuid(),
  fonte text NOT NULL CHECK (fonte IN ('businessmap','acelerato')),
  tipo varchar(64) NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','processando','processado','falha')),
  tentativas smallint NOT NULL DEFAULT 0 CHECK (tentativas >= 0),
  criado_em timestamptz(3) NOT NULL DEFAULT now(), disponivel_em timestamptz(3) NOT NULL DEFAULT now(),
  reservado_ate timestamptz(3) NULL, processado_em timestamptz(3) NULL,
  ultimo_erro varchar(500) NULL,
  CONSTRAINT uq_outbox_evento_id UNIQUE (evento_id)
);

CREATE INDEX ix_outbox_fila ON dspd_core.outbox (fonte, disponivel_em, evento_sk) WHERE status IN ('pendente','processando');

CREATE INDEX ix_outbox_retencao ON dspd_core.outbox (processado_em) WHERE status = 'processado';

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0011_core_outbox', now());

CREATE TABLE dspd_bm.ref_limite_wip_fluxo (
  equipe varchar(60) NOT NULL, vigente_de date NOT NULL, vigente_ate date NULL, limite smallint NOT NULL CHECK (limite >= 0),
  PRIMARY KEY (equipe, vigente_de)
);

CREATE UNIQUE INDEX uq_ref_limite_wip_fluxo_vigente ON dspd_bm.ref_limite_wip_fluxo (equipe) WHERE vigente_ate IS NULL;

CREATE INDEX ix_dim_chamado_aberto ON dspd_ac.dim_chamado (aberto_em);

CREATE INDEX ix_ctl_coleta_ok ON dspd_bm.ctl_coleta (finalizado_em DESC, coleta_id DESC) WHERE status = 'sucesso';

CREATE INDEX ix_ctl_coleta_ok ON dspd_ac.ctl_coleta (finalizado_em DESC, coleta_id DESC) WHERE status = 'sucesso';

CREATE INDEX ix_ctl_coleta_incremental ON dspd_bm.ctl_coleta (iniciado_em DESC, coleta_id DESC) WHERE tarefa = 'coleta_incremental';

CREATE INDEX ix_ctl_coleta_incremental ON dspd_ac.ctl_coleta (iniciado_em DESC, coleta_id DESC) WHERE tarefa = 'coleta_incremental';

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0012_bm_limite_wip_fluxo_indices', now());

ALTER TABLE dspd_core.ref_versao_criterio DROP CONSTRAINT ref_versao_criterio_dominio_check;

ALTER TABLE dspd_core.ref_versao_criterio ADD CONSTRAINT ref_versao_criterio_dominio_check CHECK (dominio IN ('businessmap','acelerato','pesquisa'));

CREATE TABLE dspd_core.ref_pesq_area (
  codigo varchar(40) NOT NULL CHECK (codigo ~ '^[a-z0-9_]+$'),
  rotulo varchar(80) NOT NULL CHECK (rotulo !~ '(@|https?://|www\.)'), vigente_de date NOT NULL, vigente_ate date NULL,
  PRIMARY KEY (codigo, vigente_de),
  CONSTRAINT ck_ref_pesq_area_vigencia CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_de)
);

CREATE UNIQUE INDEX uq_ref_pesq_area_vigente ON dspd_core.ref_pesq_area (codigo) WHERE vigente_ate IS NULL;

CREATE TABLE dspd_core.ref_pesq_pergunta (
  versao_id bigint NOT NULL, codigo varchar(40) NOT NULL CHECK (codigo ~ '^[a-z0-9_]+$'),
  ordem smallint NOT NULL CHECK (ordem > 0), texto varchar(200) NOT NULL CHECK (texto !~ '(@|https?://|www\.)'), vigente_de date NOT NULL, vigente_ate date NULL,
  PRIMARY KEY (versao_id, codigo),
  CONSTRAINT uq_ref_pesq_pergunta_ordem UNIQUE (versao_id, ordem),
  CONSTRAINT ck_ref_pesq_pergunta_vigencia CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_de),
  CONSTRAINT fk_ref_pesq_pergunta_versao FOREIGN KEY (versao_id) REFERENCES dspd_core.ref_versao_criterio (versao_id)
);

CREATE TABLE dspd_core.pesq_carga (
  carga_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  trimestre char(7) NOT NULL CHECK (trimestre ~ '^[0-9]{4}-T[1-4]$'), versao_id bigint NOT NULL,
  recebida_em timestamptz(3) NOT NULL DEFAULT now(), arquivo_sha256 char(64) NOT NULL CHECK (arquivo_sha256 ~ '^[0-9a-f]{64}$'),
  linhas integer NOT NULL CHECK (linhas > 0), substitui_carga_id bigint NULL,
  o_que_mudou varchar(500) NULL CHECK (char_length(btrim(o_que_mudou)) > 0 AND o_que_mudou !~ '(@|https?://|www\.)'),
  CONSTRAINT ck_pesq_carga_substitui CHECK (substitui_carga_id IS NULL OR substitui_carga_id < carga_id),
  CONSTRAINT fk_pesq_carga_versao FOREIGN KEY (versao_id) REFERENCES dspd_core.ref_versao_criterio (versao_id),
  CONSTRAINT fk_pesq_carga_substitui FOREIGN KEY (substitui_carga_id) REFERENCES dspd_core.pesq_carga (carga_id)
);

CREATE INDEX ix_pesq_carga_trimestre ON dspd_core.pesq_carga (trimestre, carga_id DESC);

CREATE UNIQUE INDEX uq_pesq_carga_substitui ON dspd_core.pesq_carga (substitui_carga_id) WHERE substitui_carga_id IS NOT NULL;

CREATE TABLE dspd_core.pesq_resultado (
  carga_id bigint NOT NULL, area_codigo varchar(40) NOT NULL, pergunta_codigo varchar(40) NOT NULL,
  faixa smallint NOT NULL CHECK (faixa BETWEEN 1 AND 5), contagem integer NOT NULL CHECK (contagem >= 0),
  PRIMARY KEY (carga_id, area_codigo, pergunta_codigo, faixa),
  CONSTRAINT fk_pesq_resultado_carga FOREIGN KEY (carga_id) REFERENCES dspd_core.pesq_carga (carga_id)
);

CREATE TABLE dspd_core.pesq_participacao (
  carga_id bigint NOT NULL, area_codigo varchar(40) NOT NULL,
  convidados integer NOT NULL CHECK (convidados >= 0), respondentes integer NOT NULL CHECK (respondentes >= 0),
  PRIMARY KEY (carga_id, area_codigo),
  CONSTRAINT ck_pesq_participacao CHECK (respondentes <= convidados),
  CONSTRAINT fk_pesq_participacao_carga FOREIGN KEY (carga_id) REFERENCES dspd_core.pesq_carga (carga_id)
);

CREATE TRIGGER tg_pesq_carga_imutavel BEFORE UPDATE OR DELETE ON dspd_core.pesq_carga FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_pesq_carga_sem_truncate BEFORE TRUNCATE ON dspd_core.pesq_carga FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_pesq_resultado_imutavel BEFORE UPDATE OR DELETE ON dspd_core.pesq_resultado FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_pesq_resultado_sem_truncate BEFORE TRUNCATE ON dspd_core.pesq_resultado FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_pesq_participacao_imutavel BEFORE UPDATE OR DELETE ON dspd_core.pesq_participacao FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_pesq_participacao_sem_truncate BEFORE TRUNCATE ON dspd_core.pesq_participacao FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE FUNCTION dspd_core.pesq_conferir_lista() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM dspd_core.ref_pesq_area a WHERE a.codigo = NEW.area_codigo) THEN
    RAISE EXCEPTION 'área fora da lista fechada (ref_pesq_area)' USING ERRCODE = '23514';
  END IF;
  IF TG_TABLE_NAME = 'pesq_resultado' THEN
    IF NOT EXISTS (
      SELECT 1 FROM dspd_core.pesq_carga c JOIN dspd_core.ref_pesq_pergunta p ON p.versao_id = c.versao_id
      WHERE c.carga_id = NEW.carga_id AND p.codigo = NEW.pergunta_codigo) THEN
      RAISE EXCEPTION 'pergunta fora do questionário da carga (ref_pesq_pergunta)' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END
$f$;

CREATE TRIGGER tg_pesq_resultado_lista BEFORE INSERT ON dspd_core.pesq_resultado FOR EACH ROW EXECUTE FUNCTION dspd_core.pesq_conferir_lista();

CREATE TRIGGER tg_pesq_participacao_lista BEFORE INSERT ON dspd_core.pesq_participacao FOR EACH ROW EXECUTE FUNCTION dspd_core.pesq_conferir_lista();

CREATE VIEW dspd_core.vw_pesq_vigente WITH (security_invoker = true) AS
  SELECT c.carga_id, c.trimestre, c.versao_id, c.recebida_em, c.o_que_mudou FROM dspd_core.pesq_carga c
  WHERE NOT EXISTS (SELECT 1 FROM dspd_core.pesq_carga n WHERE n.trimestre = c.trimestre AND n.carga_id > c.carga_id);

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0013_core_pesquisa', now());

ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS justificativa_informada boolean NOT NULL DEFAULT false;

ALTER TABLE dspd_ac.dim_chamado_versao ADD COLUMN IF NOT EXISTS justificativa_informada boolean NOT NULL DEFAULT false;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0014_ac_justificativa_informada', now());

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM dspd_bm.fato_transicao WHERE usuario IS NOT NULL) THEN
    RAISE EXCEPTION 'fato_transicao.usuario tem valor gravado; remover a coluna perderia dado. Trate antes (K-096).';
  END IF;
END $$;

ALTER TABLE dspd_bm.fato_transicao DROP COLUMN IF EXISTS usuario;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0015_bm_remove_usuario_transicao', now());

ALTER TABLE dspd_ac.stg_chamado ADD COLUMN IF NOT EXISTS fora_do_recorte boolean NOT NULL DEFAULT false;

ALTER TABLE dspd_ac.stg_chamado ADD CONSTRAINT ck_stg_chamado_status_sla CHECK (((payload->>'sla_pa_status') IS NULL OR (payload->>'sla_pa_status') IN ('REALIZADO_NO_PRAZO','REALIZADO_APOS_VENCIMENTO','DENTRO_DO_PRAZO','VENCIDO')) AND ((payload->>'sla_r_status') IS NULL OR (payload->>'sla_r_status') IN ('REALIZADO_NO_PRAZO','REALIZADO_APOS_VENCIMENTO','DENTRO_DO_PRAZO','VENCIDO')));

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0016_ac_stg_chamado_recorte', now());

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

INSERT INTO dspd_core.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
VALUES ((current_date - interval '12 months')::date, 'businessmap', 'Tabela de times: carga inicial (definição de partida)',
  'Definição de partida do período coletado (12 meses); não é mudança de critério, sem marca nos gráficos.', 'plano-052-F0:carga-inicial-times', now());

INSERT INTO dspd_bm.ref_time (time_id, vigente_de, nome, ativo, motivo, versao_id, registrado_por)
VALUES (1, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Equipe de processos', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (2, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Arquitetura', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (3, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Auditoria PwC - ITGC', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (4, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 267', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (5, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 255', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (6, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 63', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (7, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 222', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (8, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 264', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (9, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 245', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (10, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 221', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (11, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 269', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (12, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 322', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (13, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 249', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (14, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 243', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (15, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 251', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (16, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 271', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (17, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 177', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (18, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 192', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (19, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 232', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (20, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 105', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (21, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 188', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (22, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 65', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (23, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 126', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (24, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 127', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (25, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 220', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (26, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 191', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (27, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 266', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (28, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 212', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (29, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 231', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (30, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 250', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (31, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 248', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (32, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 242', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (33, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 246', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (34, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 223', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (35, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 260', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (36, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 262', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (37, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 263', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (38, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 208', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (39, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 190', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (40, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 210', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (41, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 233', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (42, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 76', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (43, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 199', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (44, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 202', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (45, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 206', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (46, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 324', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (47, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 326', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (48, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 205', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (49, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 311', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  (50, (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), 'Workflow 328', true, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3');

INSERT INTO dspd_bm.ref_time_workflow (workflow_id, vigente_de, quadro_id, time_id, situacao, motivo_fora, motivo, versao_id, registrado_por)
VALUES ('224', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', 1, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('265', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '23', 2, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('229', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '23', 3, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('267', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '23', 4, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('255', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '23', 5, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('63', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '23', 6, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('222', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '23', 7, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('264', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '23', 8, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('245', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '23', 9, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('221', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '23', 10, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('269', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '23', 11, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('322', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '23', 12, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('249', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', 13, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('243', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', 14, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('251', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', 15, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('271', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', 16, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('177', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', 17, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('192', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', 18, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('232', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', 19, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('105', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', 20, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('188', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', 21, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('65', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', 22, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('126', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', 23, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('127', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', 24, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('220', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', 25, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('191', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '25', 26, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('266', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '25', 27, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('212', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '25', 28, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('231', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '25', 29, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('250', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '25', 30, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('248', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '25', 31, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('242', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '25', 32, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('246', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '25', 33, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('223', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '25', 34, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('260', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '25', 35, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('262', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '25', 36, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('263', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '25', 37, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('208', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '27', 38, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('190', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '27', 39, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('210', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '27', 40, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('233', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '27', 41, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('76', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '31', 42, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('199', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '31', 43, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('202', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '31', 44, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('206', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '31', 45, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('324', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '31', 46, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('326', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '31', 47, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('205', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '31', 48, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('311', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '79', 49, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('328', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '79', 50, 'time', NULL, 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('257', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '25', NULL, 'fora', 'fora_de_todo_calculo', 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('201', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '31', NULL, 'fora', 'fora_de_todo_calculo', 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('321', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '79', NULL, 'fora', 'fora_de_todo_calculo', 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('215', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '35', NULL, 'fora', 'fora_de_todo_calculo', 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('216', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '35', NULL, 'fora', 'fora_de_todo_calculo', 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('196', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '25', NULL, 'fora', 'fora_de_todo_calculo', 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('200', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '23', NULL, 'fora', 'fora_do_operacional', 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('207', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '24', NULL, 'fora', 'fora_do_operacional', 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('198', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '31', NULL, 'fora', 'fora_do_operacional', 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('313', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '79', NULL, 'fora', 'fora_do_operacional', 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('203', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '23', NULL, 'fora', 'fora_do_operacional', 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('234', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '23', NULL, 'fora', 'fora_do_operacional', 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3'),
  ('323', (SELECT vigente_desde FROM dspd_core.ref_versao_criterio WHERE versao_id = (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times')), '79', NULL, 'fora', 'fora_do_operacional', 'carga_inicial', (SELECT max(versao_id) FROM dspd_core.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = 'plano-052-F0:carga-inicial-times'), 'carga-inicial-057-E3');

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0019_bm_carga_inicial_times', now());

CREATE TABLE dspd_bm.dim_responsavel (
  responsavel_id text NOT NULL PRIMARY KEY CHECK (responsavel_id ~ '^[0-9]{1,12}$'),
  responsavel_nome text NOT NULL CHECK (responsavel_nome <> '' AND char_length(responsavel_nome) <= 200),
  atualizado_em timestamptz(3) NOT NULL,
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_dim_responsavel_sis CHECK (sistema_origem = 'businessmap')
);

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0020_bm_dim_responsavel', now());

ALTER TABLE dspd_bm.ctl_coleta DROP CONSTRAINT ctl_coleta_tarefa_check;

ALTER TABLE dspd_bm.ctl_coleta ADD CONSTRAINT ctl_coleta_tarefa_check CHECK (tarefa IN ('coleta_incremental','varredura','webhook','projecao','reconciliacao','apontamento'));

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0021_bm_ctl_coleta_tarefa_apontamento', now());

CREATE TABLE dspd_bm.stg_apontamento (
  stg_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  logged_time_id text NOT NULL CHECK (logged_time_id ~ '^[0-9]{1,12}$'), card_id text NOT NULL CHECK (card_id ~ '^[0-9]{1,12}$'), parent_card_id text NULL CHECK (parent_card_id ~ '^[0-9]{1,12}$'), subtask_id text NULL CHECK (subtask_id ~ '^[0-9]{1,12}$'),
  lane_id text NULL CHECK (lane_id ~ '^[0-9]{1,12}$'), column_id text NULL CHECK (column_id ~ '^[0-9]{1,12}$'), category_id text NULL CHECK (category_id ~ '^[0-9]{1,12}$'),
  data_apontamento date NOT NULL, segundos integer NOT NULL CHECK (segundos BETWEEN 1 AND 86400), registrado_em timestamptz(3) NULL,
  subgrupo_codigo varchar(80) NOT NULL, flags_qualidade smallint NOT NULL CHECK (flags_qualidade BETWEEN 0 AND 31),
  qtd_palavras smallint NOT NULL CHECK (qtd_palavras >= 0), versao_dicionario varchar(40) NOT NULL CHECK (versao_dicionario <> ''),
  registro_sha256 bytea NOT NULL CHECK (octet_length(registro_sha256) = 32),
  coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_apontamento UNIQUE (logged_time_id, registro_sha256),
  CONSTRAINT fk_stg_apontamento_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_apontamento_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_stg_apontamento_ultima ON dspd_bm.stg_apontamento (logged_time_id, stg_sk DESC);

CREATE INDEX ix_stg_apontamento_card ON dspd_bm.stg_apontamento (card_id);

CREATE INDEX ix_stg_apontamento_coleta ON dspd_bm.stg_apontamento (coleta_id);

CREATE TRIGGER tg_stg_apontamento_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_apontamento FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_apontamento_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_apontamento FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0022_bm_stg_apontamento', now());

CREATE TABLE dspd_bm.evt_apontamento (
  evento_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  logged_time_id text NOT NULL CHECK (logged_time_id ~ '^[0-9]{1,12}$'), card_id text NOT NULL CHECK (card_id ~ '^[0-9]{1,12}$'),
  tipo text NOT NULL CHECK (tipo IN ('excluido_detectado','reaparecido')),
  origem text NOT NULL CHECK (origem IN ('varredura','historico')),
  chave_ocorrencia varchar(64) NOT NULL CHECK (chave_ocorrencia ~ '^[0-9A-Za-z:_.-]+$'),
  ocorrido_em timestamptz(3) NULL, detectado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT uq_evt_apontamento UNIQUE (logged_time_id, tipo, chave_ocorrencia),
  CONSTRAINT fk_evt_apontamento_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_evt_apontamento_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_evt_apontamento_ultimo ON dspd_bm.evt_apontamento (logged_time_id, evento_sk DESC);

CREATE INDEX ix_evt_apontamento_coleta ON dspd_bm.evt_apontamento (coleta_id);

CREATE TRIGGER tg_evt_apontamento_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.evt_apontamento FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_evt_apontamento_sem_truncate BEFORE TRUNCATE ON dspd_bm.evt_apontamento FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0023_bm_evt_apontamento', now());

ALTER TABLE dspd_bm.dim_responsavel ADD COLUMN pessoa_ref bigint GENERATED ALWAYS AS IDENTITY UNIQUE;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0024_bm_dim_responsavel_pessoa_ref', now());

CREATE TABLE dspd_bm.cfg_pessoa_eliminada (
  hash_usuario bytea NOT NULL PRIMARY KEY CHECK (octet_length(hash_usuario) = 32),
  eliminada_em date NOT NULL
);

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0025_bm_cfg_pessoa_eliminada', now());

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

CREATE TABLE dspd_bm.dim_card_raiz (
  card_id text NOT NULL CHECK (card_id ~ '^[0-9]{1,12}$') PRIMARY KEY, raiz_card_id text NOT NULL CHECK (raiz_card_id ~ '^[0-9]{1,12}$'),
  profundidade smallint NOT NULL CHECK (profundidade BETWEEN 0 AND 10),
  raiz_eh_iniciativa boolean NOT NULL, raiz_fora_do_escopo boolean NOT NULL,
  coletado_em timestamptz(3) NOT NULL, atualizado_por_coleta_id bigint NOT NULL,
  CONSTRAINT ck_dim_card_raiz_propria CHECK ((profundidade = 0) = (raiz_card_id = card_id)),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_dim_card_raiz_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_dim_card_raiz_raiz ON dspd_bm.dim_card_raiz (raiz_card_id);

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0027_bm_dim_card_raiz', now());

CREATE TABLE dspd_bm.fato_apontamento (
  logged_time_id text NOT NULL CHECK (logged_time_id ~ '^[0-9]{1,12}$') PRIMARY KEY,
  card_id text NOT NULL CHECK (card_id ~ '^[0-9]{1,12}$'), parent_card_id text NULL CHECK (parent_card_id ~ '^[0-9]{1,12}$'), subtask_id text NULL CHECK (subtask_id ~ '^[0-9]{1,12}$'), lane_id text NULL CHECK (lane_id ~ '^[0-9]{1,12}$'), column_id text NULL CHECK (column_id ~ '^[0-9]{1,12}$'), category_id text NULL CHECK (category_id ~ '^[0-9]{1,12}$'),
  data_apontamento date NOT NULL, segundos integer NOT NULL CHECK (segundos BETWEEN 1 AND 86400), registrado_em timestamptz(3) NULL,
  subgrupo_codigo varchar(80) NOT NULL, flags_qualidade smallint NOT NULL CHECK (flags_qualidade BETWEEN 0 AND 31),
  qtd_palavras smallint NOT NULL CHECK (qtd_palavras >= 0), versao_dicionario varchar(40) NOT NULL,
  registro_sha256 bytea NOT NULL CHECK (octet_length(registro_sha256) = 32),
  iniciativa_card_id text NULL CHECK (iniciativa_card_id ~ '^[0-9]{1,12}$'), pessoa_ref bigint NULL CHECK (pessoa_ref > 0),
  versoes smallint NOT NULL CHECK (versoes >= 1), excluido_em timestamptz(3) NULL,
  atualizado_em timestamptz(3) NOT NULL, atualizado_por_coleta_id bigint NOT NULL,
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_fato_apontamento_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_fato_apontamento_data ON dspd_bm.fato_apontamento (data_apontamento) WHERE excluido_em IS NULL;

CREATE INDEX ix_fato_apontamento_pessoa ON dspd_bm.fato_apontamento (pessoa_ref, data_apontamento) WHERE excluido_em IS NULL;

CREATE INDEX ix_fato_apontamento_iniciativa ON dspd_bm.fato_apontamento (iniciativa_card_id, data_apontamento) WHERE excluido_em IS NULL;

CREATE INDEX ix_fato_apontamento_card ON dspd_bm.fato_apontamento (card_id);

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0028_bm_fato_apontamento', now());

ALTER TABLE dspd_bm.fato_apontamento ADD COLUMN type_id text NULL CHECK (type_id ~ '^[0-9]{1,12}$');

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0029_bm_fato_apontamento_tipo', now());

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

ALTER TABLE dspd_bm.cfg_pessoa_eliminada ADD COLUMN executado_por varchar(63) NOT NULL DEFAULT current_user CHECK (executado_por <> '');

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0031_bm_cfg_pessoa_eliminada_executado_por', now());

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

CREATE VIEW dspd_bm.apt_pessoa_time AS
SELECT r.pessoa_ref,
       CASE WHEN bool_or(x.ate IS NULL) THEN NULL ELSE max(x.ate) END AS vigencia_ate
FROM (
  SELECT v.card_id, unnest(v.responsaveis) AS responsavel_id,
         lead(v.vigente_de) OVER (PARTITION BY v.card_id ORDER BY v.vigente_de) AS ate
  FROM dspd_bm.dim_card_versao v
) x
JOIN dspd_bm.dim_responsavel r ON r.responsavel_id = x.responsavel_id
JOIN dspd_bm.dim_card_raiz c ON c.card_id = x.card_id
WHERE NOT c.raiz_fora_do_escopo
GROUP BY r.pessoa_ref;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0033_bm_apt_pessoa_time', now());

CREATE TABLE dspd_bm.ctl_apontamento_cobertura (
  cobertura_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id text NOT NULL CHECK (card_id ~ '^[0-9]{1,12}$'),
  estado text NOT NULL CHECK (estado IN ('incompleto','completo')),
  coleta_id bigint NOT NULL, detectado_em timestamptz(3) NOT NULL,
  CONSTRAINT uq_ctl_apontamento_cobertura UNIQUE (card_id, estado, coleta_id),
  CONSTRAINT fk_ctl_apontamento_cobertura_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_ctl_apontamento_cobertura_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_ctl_apontamento_cobertura_card ON dspd_bm.ctl_apontamento_cobertura (card_id, cobertura_sk DESC);

CREATE INDEX ix_ctl_apontamento_cobertura_coleta ON dspd_bm.ctl_apontamento_cobertura (coleta_id);

CREATE TRIGGER tg_ctl_apontamento_cobertura_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.ctl_apontamento_cobertura FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_ctl_apontamento_cobertura_sem_truncate BEFORE TRUNCATE ON dspd_bm.ctl_apontamento_cobertura FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0034_bm_ctl_apontamento_cobertura', now());

DO $guarda$ BEGIN
  IF EXISTS (SELECT 1 FROM dspd_ac.dim_chamado WHERE previsao_retorno IS NOT NULL) OR EXISTS (SELECT 1 FROM dspd_ac.dim_chamado_versao WHERE previsao_retorno IS NOT NULL) THEN
    RAISE EXCEPTION 'previsao_retorno tem valor: a troca para booleano foi recusada, nada foi alterado';
  END IF;
END $guarda$;

DROP VIEW IF EXISTS dspd_ac.vw_abertos;

DROP VIEW IF EXISTS dspd_ac.vw_fechados_sla;

DROP VIEW IF EXISTS dspd_ac.vw_populacao_sssc;

ALTER TABLE dspd_ac.dim_chamado ALTER COLUMN previsao_retorno TYPE boolean USING (NULLIF(previsao_retorno IS NOT NULL, false));

ALTER TABLE dspd_ac.dim_chamado_versao ALTER COLUMN previsao_retorno TYPE boolean USING (NULLIF(previsao_retorno IS NOT NULL, false));

CREATE VIEW dspd_ac.vw_populacao_sssc WITH (security_invoker = true) AS
  SELECT c.chamado_id, c.natureza, c.equipe, c.organizacao, c.tipo, c.categoria_sistema, c.excluido, c.status, c.impacto, c.urgencia, c.prioridade, c.prioridade_ajustada_manualmente, c.aberto_em, c.primeiro_atendimento_em, c.restaurado_em, c.data_finalizado, c.status_sla_r, c.status_sla_pa, c.motivo_escalacao, c.motivo_pendencia_atual, c.previsao_retorno, c.motivo_encerramento, c.avaliacao_problema, c.excecao_sla_registro_posterior, c.incidente_critico_coordenado, c.nivel_resolucao, c.etapa FROM dspd_ac.dim_chamado c
  WHERE c.excluido = false
    AND c.organizacao IN (SELECT codigo FROM dspd_ac.ref_dominio WHERE campo = 'organizacao_recorte' AND vigente_ate IS NULL)
    AND c.tipo IN (SELECT codigo FROM dspd_ac.ref_dominio WHERE campo = 'tipo_recorte' AND vigente_ate IS NULL)
    AND c.equipe IN (SELECT codigo FROM dspd_ac.ref_dominio WHERE campo = 'equipe' AND vigente_ate IS NULL);

CREATE VIEW dspd_ac.vw_fechados_sla WITH (security_invoker = true) AS
  SELECT p.chamado_id, p.natureza, p.equipe, p.organizacao, p.tipo, p.categoria_sistema, p.excluido, p.status, p.impacto, p.urgencia, p.prioridade, p.prioridade_ajustada_manualmente, p.aberto_em, p.primeiro_atendimento_em, p.restaurado_em, p.data_finalizado, p.status_sla_r, p.status_sla_pa, p.motivo_escalacao, p.motivo_pendencia_atual, p.previsao_retorno, p.motivo_encerramento, p.avaliacao_problema, p.excecao_sla_registro_posterior, p.incidente_critico_coordenado, p.nivel_resolucao, p.etapa,
    CASE p.status_sla_r WHEN 'REALIZADO_NO_PRAZO' THEN true WHEN 'REALIZADO_APOS_VENCIMENTO' THEN false END AS dentro_sla
  FROM dspd_ac.vw_populacao_sssc p
  WHERE p.status = 'Concluído' AND p.data_finalizado IS NOT NULL;

CREATE VIEW dspd_ac.vw_abertos WITH (security_invoker = true) AS
  SELECT p.chamado_id, p.natureza, p.equipe, p.organizacao, p.tipo, p.categoria_sistema, p.excluido, p.status, p.impacto, p.urgencia, p.prioridade, p.prioridade_ajustada_manualmente, p.aberto_em, p.primeiro_atendimento_em, p.restaurado_em, p.data_finalizado, p.status_sla_r, p.status_sla_pa, p.motivo_escalacao, p.motivo_pendencia_atual, p.previsao_retorno, p.motivo_encerramento, p.avaliacao_problema, p.excecao_sla_registro_posterior, p.incidente_critico_coordenado, p.nivel_resolucao, p.etapa FROM dspd_ac.vw_populacao_sssc p WHERE p.data_finalizado IS NULL;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0035_ac_previsao_retorno_booleano', now());

ALTER TABLE dspd_ac.ref_alvo_prioridade RENAME COLUMN prazo_pa_horas_uteis TO prazo_pa_horas;

ALTER TABLE dspd_ac.ref_alvo_prioridade RENAME COLUMN prazo_r_horas_uteis TO prazo_r_horas;

ALTER TABLE dspd_ac.ref_alvo_prioridade ADD COLUMN unidade_pa text NOT NULL DEFAULT 'util' CHECK (unidade_pa IN ('corrido','util'));

ALTER TABLE dspd_ac.ref_alvo_prioridade ADD COLUMN unidade_r text NOT NULL DEFAULT 'util' CHECK (unidade_r IN ('corrido','util'));

ALTER TABLE dspd_ac.ref_alvo_prioridade ALTER COLUMN unidade_pa DROP DEFAULT;

ALTER TABLE dspd_ac.ref_alvo_prioridade ALTER COLUMN unidade_r DROP DEFAULT;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0036_ac_alvo_prioridade_unidade', now());

ALTER TABLE dspd_ac.ref_alvo_prioridade ADD COLUMN exibir_pa text NULL CHECK (exibir_pa IN ('min','h','dia'));

ALTER TABLE dspd_ac.ref_alvo_prioridade ADD COLUMN exibir_r text NULL CHECK (exibir_r IN ('min','h','dia'));

ALTER TABLE dspd_ac.ref_alvo_prioridade ADD CONSTRAINT ck_ref_alvo_exibir_par CHECK ((exibir_pa IS NULL) = (exibir_r IS NULL));

ALTER TABLE dspd_ac.ref_alvo_prioridade ADD CONSTRAINT ck_ref_alvo_exibir_relogio CHECK (NOT (unidade_pa = 'corrido' AND exibir_pa = 'dia') AND NOT (unidade_r = 'corrido' AND exibir_r = 'dia'));

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0037_ac_alvo_prioridade_exibicao', now());

ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS fluxo text NULL;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0038_ac_dim_chamado_fluxo', now());

ALTER TABLE dspd_bm.ctl_coleta DROP CONSTRAINT ctl_coleta_tarefa_check;

ALTER TABLE dspd_bm.ctl_coleta ADD CONSTRAINT ctl_coleta_tarefa_check CHECK (tarefa IN ('coleta_incremental','varredura','webhook','projecao','reconciliacao','apontamento','carga_toque'));

CREATE TABLE dspd_bm.stg_toque_instante (
  toque_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id text NOT NULL CHECK (card_id ~ '^[0-9]{1,12}$'),
  evento_id text NOT NULL CHECK (evento_id ~ '^(r([2-9]|[1-9][0-9]{1,8})|c[1-9][0-9]{0,14})$'),
  ocorrido_em timestamptz(3) NOT NULL,
  conta_como_toque boolean NOT NULL,
  coletado_em timestamptz(3) NOT NULL, coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_toque_instante UNIQUE (card_id, evento_id),
  CONSTRAINT fk_stg_toque_instante_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_stg_toque_instante_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_stg_toque_instante_coleta ON dspd_bm.stg_toque_instante (coleta_id);

CREATE TRIGGER tg_stg_toque_instante_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.stg_toque_instante FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_stg_toque_instante_sem_truncate BEFORE TRUNCATE ON dspd_bm.stg_toque_instante FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TABLE dspd_bm.ctl_toque_leitura (
  leitura_sk bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id text NOT NULL CHECK (card_id ~ '^[0-9]{1,12}$'),
  coleta_id bigint NOT NULL,
  revisao_lida integer NULL CHECK (revisao_lida IS NULL OR revisao_lida >= 1),
  lido_em timestamptz(3) NOT NULL,
  estado text NOT NULL CHECK (estado IN ('lido','autor_pendente','leitura_incompleta')),
  motivo text NULL CHECK (motivo IN ('lista_com_buraco','lista_curta','lista_longa','instante_invalido','revisao_invalida','comentario_invalido')),
  CONSTRAINT uq_ctl_toque_leitura UNIQUE (card_id, coleta_id),
  CONSTRAINT ck_ctl_toque_leitura_motivo CHECK ((estado = 'leitura_incompleta') = (motivo IS NOT NULL)),
  CONSTRAINT ck_ctl_toque_leitura_revisao CHECK (revisao_lida IS NOT NULL OR coalesce(motivo, '') = 'revisao_invalida'),
  CONSTRAINT fk_ctl_toque_leitura_coleta FOREIGN KEY (coleta_id) REFERENCES dspd_bm.ctl_coleta (coleta_id),
  sistema_origem text NOT NULL DEFAULT 'businessmap',
  CONSTRAINT ck_ctl_toque_leitura_sis CHECK (sistema_origem = 'businessmap')
);

CREATE INDEX ix_ctl_toque_leitura_card ON dspd_bm.ctl_toque_leitura (card_id, leitura_sk DESC);

CREATE INDEX ix_ctl_toque_leitura_coleta ON dspd_bm.ctl_toque_leitura (coleta_id);

CREATE TRIGGER tg_ctl_toque_leitura_imutavel BEFORE UPDATE OR DELETE ON dspd_bm.ctl_toque_leitura FOR EACH ROW EXECUTE FUNCTION dspd_core.proibir_alteracao();

CREATE TRIGGER tg_ctl_toque_leitura_sem_truncate BEFORE TRUNCATE ON dspd_bm.ctl_toque_leitura FOR EACH STATEMENT EXECUTE FUNCTION dspd_core.proibir_alteracao();

ALTER TABLE dspd_bm.dim_card ADD COLUMN primeiro_toque_em timestamptz(3) NULL,
  ADD COLUMN toque_situacao text NULL CHECK (toque_situacao IN ('com_toque','sem_toque','nao_lido','autor_pendente','leitura_incompleta'));

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0039_bm_toque_primeiro', now());

ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS escala_p boolean NULL;

INSERT INTO dspd_core.pgmigrations (name, run_on) VALUES ('0040_ac_dim_chamado_escala_p', now());

REVOKE ALL ON SCHEMA dspd_bm FROM PUBLIC, dspd_coletor, dspd_api, dspd_ref, dspd_webhook, dspd_automacao, dspd_pesquisa, dspd_api_apontamento;

REVOKE ALL ON ALL TABLES IN SCHEMA dspd_bm FROM PUBLIC, dspd_coletor, dspd_api, dspd_ref, dspd_webhook, dspd_automacao, dspd_pesquisa, dspd_api_apontamento;

REVOKE ALL ON SCHEMA dspd_ac FROM PUBLIC, dspd_coletor, dspd_api, dspd_ref, dspd_webhook, dspd_automacao, dspd_pesquisa, dspd_api_apontamento;

REVOKE ALL ON ALL TABLES IN SCHEMA dspd_ac FROM PUBLIC, dspd_coletor, dspd_api, dspd_ref, dspd_webhook, dspd_automacao, dspd_pesquisa, dspd_api_apontamento;

REVOKE ALL ON SCHEMA dspd_core FROM PUBLIC, dspd_coletor, dspd_api, dspd_ref, dspd_webhook, dspd_automacao, dspd_pesquisa, dspd_api_apontamento;

REVOKE ALL ON ALL TABLES IN SCHEMA dspd_core FROM PUBLIC, dspd_coletor, dspd_api, dspd_ref, dspd_webhook, dspd_automacao, dspd_pesquisa, dspd_api_apontamento;

GRANT USAGE ON SCHEMA dspd_bm, dspd_ac, dspd_core TO dspd_coletor;

GRANT USAGE ON SCHEMA dspd_bm, dspd_ac, dspd_core TO dspd_api;

GRANT USAGE ON SCHEMA dspd_bm, dspd_ac, dspd_core TO dspd_ref;

GRANT USAGE ON SCHEMA dspd_bm, dspd_core TO dspd_webhook;

GRANT USAGE ON SCHEMA dspd_ac, dspd_core TO dspd_automacao;

GRANT USAGE ON SCHEMA dspd_core TO dspd_pesquisa;

GRANT USAGE ON SCHEMA dspd_bm, dspd_core TO dspd_api_apontamento;

GRANT SELECT, INSERT ON dspd_bm.dim_card_versao TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.evt_apontamento TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.evt_bloqueio TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.evt_card TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.fato_transicao TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.rec_transicao_par TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_apontamento TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_bloqueio TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_card TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_card_presenca TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_coluna TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_custom_field TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_revision TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_toque_instante TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_vinculo TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_webhook_evento TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.stg_webhook_processamento TO dspd_coletor;

GRANT SELECT, INSERT, UPDATE, DELETE ON dspd_bm.dim_card TO dspd_coletor;

GRANT SELECT, INSERT, UPDATE, DELETE ON dspd_bm.fato_bloqueio TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.ctl_apontamento_cobertura TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.ctl_coleta TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.ctl_coleta_contagem TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.ctl_coleta_falha TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.ctl_reconciliacao TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_bm.ctl_toque_leitura TO dspd_coletor;

GRANT UPDATE (status, finalizado_em, marca_dagua_ate, erro_resumo) ON dspd_bm.ctl_coleta TO dspd_coletor;

GRANT UPDATE ON dspd_bm.ctl_coleta_contagem TO dspd_coletor;

GRANT UPDATE (parametros) ON dspd_bm.ctl_coleta TO dspd_coletor;

GRANT SELECT, INSERT, UPDATE ON dspd_bm.dim_responsavel TO dspd_coletor;

GRANT SELECT, INSERT, UPDATE ON dspd_bm.dim_card_raiz TO dspd_coletor;

GRANT SELECT, INSERT, UPDATE ON dspd_bm.fato_apontamento TO dspd_coletor;

GRANT SELECT ON dspd_bm.cfg_pessoa_eliminada TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_alocacao_acordada TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_apontamento_regra_tipo TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_apontamento_subgrupo TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_apontamento_termo TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_coluna TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_dominio TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_ficha_resultado TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_limite_frentes TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_limite_wip_fluxo TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_quadro TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_sle TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_time TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_time_workflow TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_tipo_card TO dspd_coletor;

GRANT SELECT ON dspd_bm.ref_workflow TO dspd_coletor;

GRANT SELECT (card_id, tipo, classe_servico, sistema, area_solicitante, fornecedor, objetivo_estrategico, card_pai, criado_em, comprometido_em, iniciado_em, concluido_em, arquivado_em, motivo_descarte, tamanho_declarado, titulo, granularidade, equipe, quadro_id, coluna_atual_id, excluido_em, eh_subtarefa, data_acordada, responsabilidade_atraso, origem_demanda, fase_deteccao, severidade, causa_raiz, origem_bug, adicionado_apos_inicio_pai, coletado_em, atualizado_por_coleta_id, sistema_origem, primeiro_toque_em, toque_situacao) ON dspd_bm.dim_card TO dspd_api;

GRANT SELECT ON dspd_bm.fato_bloqueio TO dspd_api;

GRANT SELECT ON dspd_bm.fato_transicao TO dspd_api;

GRANT SELECT ON dspd_bm.rec_transicao_par TO dspd_api;

GRANT SELECT ON dspd_bm.ctl_apontamento_cobertura TO dspd_api;

GRANT SELECT ON dspd_bm.ctl_coleta TO dspd_api;

GRANT SELECT ON dspd_bm.ctl_coleta_contagem TO dspd_api;

GRANT SELECT ON dspd_bm.ctl_coleta_falha TO dspd_api;

GRANT SELECT ON dspd_bm.ctl_reconciliacao TO dspd_api;

GRANT SELECT ON dspd_bm.ref_alocacao_acordada TO dspd_api;

GRANT SELECT ON dspd_bm.ref_coluna TO dspd_api;

GRANT SELECT ON dspd_bm.ref_dominio TO dspd_api;

GRANT SELECT ON dspd_bm.ref_ficha_resultado TO dspd_api;

GRANT SELECT ON dspd_bm.ref_limite_frentes TO dspd_api;

GRANT SELECT ON dspd_bm.ref_limite_wip_fluxo TO dspd_api;

GRANT SELECT ON dspd_bm.ref_quadro TO dspd_api;

GRANT SELECT ON dspd_bm.ref_sle TO dspd_api;

GRANT SELECT (time_id, vigente_de, vigente_ate, nome, ativo, motivo, versao_id, registrado_em) ON dspd_bm.ref_time TO dspd_api;

GRANT SELECT (workflow_id, vigente_de, vigente_ate, quadro_id, time_id, situacao, motivo_fora, motivo, versao_id, registrado_em) ON dspd_bm.ref_time_workflow TO dspd_api;

GRANT SELECT ON dspd_bm.ref_tipo_card TO dspd_api;

GRANT SELECT ON dspd_bm.ref_workflow TO dspd_api;

GRANT SELECT ON dspd_bm.vw_marca_dagua TO dspd_api;

GRANT SELECT ON dspd_bm.vw_transicao_canonica TO dspd_api;

GRANT SELECT, INSERT ON dspd_bm.ref_alocacao_acordada TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_apontamento_regra_tipo TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_apontamento_subgrupo TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_apontamento_termo TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_coluna TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_dominio TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_ficha_resultado TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_limite_frentes TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_limite_wip_fluxo TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_quadro TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_sle TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_time TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_time_workflow TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_tipo_card TO dspd_ref;

GRANT SELECT, INSERT ON dspd_bm.ref_workflow TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_alocacao_acordada TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_apontamento_regra_tipo TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_apontamento_subgrupo TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_apontamento_termo TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_coluna TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_dominio TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_ficha_resultado TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_limite_frentes TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_limite_wip_fluxo TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_quadro TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_sle TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_time TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_time_workflow TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_tipo_card TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_bm.ref_workflow TO dspd_ref;

GRANT SELECT, INSERT ON dspd_ac.dim_chamado_versao TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.evt_etapa_chamado TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.stg_chamado TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.stg_etapa TO dspd_coletor;

GRANT SELECT, INSERT, UPDATE, DELETE ON dspd_ac.dim_chamado TO dspd_coletor;

GRANT SELECT, INSERT, UPDATE, DELETE ON dspd_ac.fato_etapa_chamado TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.ctl_automacao TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.ctl_coleta TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.ctl_coleta_contagem TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.ctl_coleta_falha TO dspd_coletor;

GRANT SELECT, INSERT ON dspd_ac.ctl_reconciliacao TO dspd_coletor;

GRANT UPDATE (status, finalizado_em, marca_dagua_ate, erro_resumo) ON dspd_ac.ctl_coleta TO dspd_coletor;

GRANT UPDATE ON dspd_ac.ctl_coleta_contagem TO dspd_coletor;

GRANT SELECT ON dspd_ac.ref_alvo_prioridade TO dspd_coletor;

GRANT SELECT ON dspd_ac.ref_dominio TO dspd_coletor;

GRANT SELECT ON dspd_ac.ref_etapa_totalizador TO dspd_coletor;

GRANT SELECT ON dspd_ac.dim_chamado TO dspd_api;

GRANT SELECT ON dspd_ac.fato_etapa_chamado TO dspd_api;

GRANT SELECT ON dspd_ac.ctl_automacao TO dspd_api;

GRANT SELECT ON dspd_ac.ctl_coleta TO dspd_api;

GRANT SELECT ON dspd_ac.ctl_coleta_contagem TO dspd_api;

GRANT SELECT ON dspd_ac.ctl_coleta_falha TO dspd_api;

GRANT SELECT ON dspd_ac.ctl_reconciliacao TO dspd_api;

GRANT SELECT ON dspd_ac.ref_alvo_prioridade TO dspd_api;

GRANT SELECT ON dspd_ac.ref_dominio TO dspd_api;

GRANT SELECT ON dspd_ac.ref_etapa_totalizador TO dspd_api;

GRANT SELECT ON dspd_ac.vw_abertos TO dspd_api;

GRANT SELECT ON dspd_ac.vw_fechados_sla TO dspd_api;

GRANT SELECT ON dspd_ac.vw_marca_dagua TO dspd_api;

GRANT SELECT ON dspd_ac.vw_populacao_sssc TO dspd_api;

GRANT SELECT, INSERT ON dspd_ac.ref_alvo_prioridade TO dspd_ref;

GRANT SELECT, INSERT ON dspd_ac.ref_dominio TO dspd_ref;

GRANT SELECT, INSERT ON dspd_ac.ref_etapa_totalizador TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_ac.ref_alvo_prioridade TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_ac.ref_dominio TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_ac.ref_etapa_totalizador TO dspd_ref;

GRANT SELECT ON dspd_core.ref_calendario TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_calendario_aplicacao TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_calendario_turno TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_feriado TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_pesq_area TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_pesq_pergunta TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_versao_criterio TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_versao_criterio_metrica TO dspd_coletor;

GRANT SELECT ON dspd_core.ref_calendario TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_calendario_aplicacao TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_calendario_turno TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_feriado TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_pesq_area TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_pesq_pergunta TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_versao_criterio TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_versao_criterio_metrica TO dspd_automacao;

GRANT SELECT ON dspd_core.ref_calendario TO dspd_api;

GRANT SELECT ON dspd_core.ref_calendario_aplicacao TO dspd_api;

GRANT SELECT ON dspd_core.ref_calendario_turno TO dspd_api;

GRANT SELECT ON dspd_core.ref_feriado TO dspd_api;

GRANT SELECT ON dspd_core.ref_pesq_area TO dspd_api;

GRANT SELECT ON dspd_core.ref_pesq_pergunta TO dspd_api;

GRANT SELECT ON dspd_core.ref_versao_criterio TO dspd_api;

GRANT SELECT ON dspd_core.ref_versao_criterio_metrica TO dspd_api;

GRANT SELECT, INSERT ON dspd_core.ref_calendario TO dspd_ref;

GRANT SELECT, INSERT ON dspd_core.ref_calendario_aplicacao TO dspd_ref;

GRANT SELECT, INSERT ON dspd_core.ref_calendario_turno TO dspd_ref;

GRANT SELECT, INSERT ON dspd_core.ref_feriado TO dspd_ref;

GRANT SELECT, INSERT ON dspd_core.ref_pesq_area TO dspd_ref;

GRANT SELECT, INSERT ON dspd_core.ref_pesq_pergunta TO dspd_ref;

GRANT SELECT, INSERT ON dspd_core.ref_versao_criterio TO dspd_ref;

GRANT SELECT, INSERT ON dspd_core.ref_versao_criterio_metrica TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_core.ref_calendario_aplicacao TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_core.ref_calendario_turno TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_core.ref_pesq_area TO dspd_ref;

GRANT UPDATE (vigente_ate) ON dspd_core.ref_pesq_pergunta TO dspd_ref;

GRANT SELECT, INSERT, DELETE ON dspd_core.outbox TO dspd_coletor;

GRANT UPDATE (status, tentativas, disponivel_em, reservado_ate, processado_em, ultimo_erro) ON dspd_core.outbox TO dspd_coletor;

GRANT INSERT ON dspd_core.outbox TO dspd_webhook;

GRANT SELECT, INSERT ON dspd_core.pesq_carga TO dspd_pesquisa;

GRANT SELECT, INSERT ON dspd_core.pesq_participacao TO dspd_pesquisa;

GRANT SELECT, INSERT ON dspd_core.pesq_resultado TO dspd_pesquisa;

GRANT SELECT ON dspd_core.ref_pesq_area TO dspd_pesquisa;

GRANT SELECT ON dspd_core.ref_pesq_pergunta TO dspd_pesquisa;

GRANT SELECT ON dspd_core.ref_versao_criterio TO dspd_pesquisa;

GRANT SELECT ON dspd_core.ref_versao_criterio_metrica TO dspd_pesquisa;

GRANT SELECT ON dspd_core.pesq_carga TO dspd_api;

GRANT SELECT ON dspd_core.pesq_participacao TO dspd_api;

GRANT SELECT ON dspd_core.pesq_resultado TO dspd_api;

GRANT SELECT ON dspd_core.vw_pesq_vigente TO dspd_api;

GRANT SELECT (card_id, parent_card_id, subtask_id, data_apontamento, segundos, subgrupo_codigo, flags_qualidade, iniciativa_card_id, pessoa_ref, type_id, excluido_em) ON dspd_bm.fato_apontamento TO dspd_api_apontamento;

GRANT SELECT (card_id, raiz_card_id, raiz_fora_do_escopo) ON dspd_bm.dim_card_raiz TO dspd_api_apontamento;

GRANT SELECT (card_id, titulo, tipo, equipe, quadro_id) ON dspd_bm.dim_card TO dspd_api_apontamento;

GRANT SELECT (campo, codigo, rotulo, ordem, vigente_ate) ON dspd_bm.ref_dominio TO dspd_api_apontamento;

GRANT SELECT (pessoa_ref, responsavel_nome) ON dspd_bm.dim_responsavel TO dspd_api_apontamento;

GRANT SELECT (pessoa_ref, vigencia_ate) ON dspd_bm.apt_pessoa_time TO dspd_api_apontamento;

GRANT SELECT (codigo, rotulo, incluido_por_versao_id) ON dspd_bm.ref_apontamento_subgrupo TO dspd_api_apontamento;

GRANT SELECT (incluido_por_versao_id) ON dspd_bm.ref_apontamento_termo TO dspd_api_apontamento;

GRANT SELECT (incluido_por_versao_id) ON dspd_bm.ref_apontamento_regra_tipo TO dspd_api_apontamento;

GRANT SELECT (coleta_id, tarefa, status, iniciado_em, finalizado_em) ON dspd_bm.ctl_coleta TO dspd_api_apontamento;

GRANT SELECT (cobertura_sk, card_id, estado, detectado_em) ON dspd_bm.ctl_apontamento_cobertura TO dspd_api_apontamento;

GRANT SELECT (calendario_id, offset_minutos) ON dspd_core.ref_calendario TO dspd_api_apontamento;

GRANT SELECT (dominio, classe, calendario_id, vigente_ate) ON dspd_core.ref_calendario_aplicacao TO dspd_api_apontamento;

GRANT SELECT (calendario_id, data, incluido_por_versao_id) ON dspd_core.ref_feriado TO dspd_api_apontamento;

GRANT SELECT (versao_id, vigente_desde, dominio, descricao) ON dspd_core.ref_versao_criterio TO dspd_api_apontamento;

GRANT SELECT (versao_id, metrica_id) ON dspd_core.ref_versao_criterio_metrica TO dspd_api_apontamento;

GRANT INSERT ON dspd_bm.stg_webhook_evento TO dspd_webhook;

GRANT SELECT (webhook_sk, payload_sha256) ON dspd_bm.stg_webhook_evento TO dspd_webhook;

GRANT SELECT, INSERT ON dspd_ac.ctl_automacao TO dspd_automacao;
COMMIT;
