-- GERADO por `pnpm run db:sql` a partir de server/migrations. Não edite à mão: mude a migração e gere de novo.
-- Sem segredo neste arquivo.
-- 0033_bm_apt_pessoa_time.sql
BEGIN;
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
COMMIT;
