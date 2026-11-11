-- ID: C-BM1
-- FONTE: pg
-- ORIGEM: docs/analises/098-discovery.md §1.2
-- COLUNAS: time_id:dominio,quadro_id:numero,workflow_id:dominio,nome_atual:dominio,nome_workflow:dominio,nome_longo:dominio,nivel:dominio,cards_projetados:numero
-- C-BM1 (E4). Os 47 times com nome provisório e o nome do workflow vigente; nome_longo marca o que não cabe em ref_time.nome (80).
SELECT t.time_id, tw.quadro_id, tw.workflow_id, t.nome AS nome_atual, w.nome AS nome_workflow,
       length(w.nome) > 80 AS nome_longo, w.nivel,
       (SELECT count(*) FROM dspd_bm.dim_card c WHERE c.equipe = t.nome) AS cards_projetados
  FROM dspd_bm.ref_time t
  JOIN dspd_bm.ref_time_workflow tw ON tw.time_id = t.time_id AND tw.vigente_ate IS NULL AND tw.situacao = 'time'
  LEFT JOIN dspd_bm.ref_workflow w ON w.quadro_id = tw.quadro_id AND w.workflow_id = tw.workflow_id AND w.vigente_ate IS NULL
 WHERE t.vigente_ate IS NULL AND t.nome LIKE 'Workflow %'
 ORDER BY tw.quadro_id, length(tw.workflow_id), tw.workflow_id;
