-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0006_bm_projecoes.sql
BEGIN;
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
COMMIT;
