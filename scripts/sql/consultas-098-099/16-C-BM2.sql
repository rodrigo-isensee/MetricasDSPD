-- ID: C-BM2
-- FONTE: pg
-- ORIGEM: docs/analises/098-discovery.md §1.2
-- COLUNAS: nome:dominio,times:numero
-- C-BM2 (E4). Nomes de workflow repetidos entre os times (dariam o mesmo id de filtro).
SELECT lower(w.nome) AS nome, count(*) AS times
  FROM dspd_bm.ref_time_workflow tw
  JOIN dspd_bm.ref_workflow w ON w.quadro_id = tw.quadro_id AND w.workflow_id = tw.workflow_id AND w.vigente_ate IS NULL
 WHERE tw.vigente_ate IS NULL AND tw.situacao = 'time'
 GROUP BY lower(w.nome) HAVING count(*) > 1;
