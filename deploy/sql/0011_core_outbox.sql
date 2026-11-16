-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0011_core_outbox.sql
BEGIN;
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
COMMIT;
