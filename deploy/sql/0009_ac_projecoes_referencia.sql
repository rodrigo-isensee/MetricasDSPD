-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0009_ac_projecoes_referencia.sql
BEGIN;
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
COMMIT;
