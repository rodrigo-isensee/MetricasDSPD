-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0005_bm_historico.sql
BEGIN;
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
COMMIT;
