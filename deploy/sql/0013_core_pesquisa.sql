-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0013_core_pesquisa.sql
BEGIN;
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
COMMIT;
