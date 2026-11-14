-- ID: C-BM3
-- FONTE: pg
-- ORIGEM: docs/analises/098-discovery.md §1.2
-- COLUNAS: quadro_id:numero,workflow_id:dominio,nome_workflow:dominio,vigente_de:data
-- C-BM3 (E3). Workflows de story vigentes SEM linha na tabela de times: seus cards ficam fora de todo o fluxo (§3).
SELECT w.quadro_id, w.workflow_id, w.nome AS nome_workflow, w.vigente_de
  FROM dspd_bm.ref_workflow w
  LEFT JOIN dspd_bm.ref_time_workflow tw ON tw.workflow_id = w.workflow_id AND tw.vigente_ate IS NULL
 WHERE w.vigente_ate IS NULL AND w.nivel = 'story' AND tw.workflow_id IS NULL
 ORDER BY w.quadro_id, w.workflow_id;
