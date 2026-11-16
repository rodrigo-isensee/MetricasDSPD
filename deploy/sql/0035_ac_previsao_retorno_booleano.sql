-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0035_ac_previsao_retorno_booleano.sql
BEGIN;
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
COMMIT;
