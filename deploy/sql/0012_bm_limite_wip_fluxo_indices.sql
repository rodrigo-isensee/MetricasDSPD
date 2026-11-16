-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0012_bm_limite_wip_fluxo_indices.sql
BEGIN;
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
COMMIT;
