-- ID: B6-c
-- FONTE: pg
-- ORIGEM: docs/analises/099-revisao-campos.md §3.6
-- COLUNAS: chamados_com_mudanca:numero,chamados:numero
-- B6-c (*) (PostgreSQL): chamados cuja prioridade mudou entre versões coletadas (ajuste observado)
SELECT COUNT(*) FILTER (WHERE n > 1) AS chamados_com_mudanca, COUNT(*) AS chamados
  FROM (SELECT id_origem, COUNT(DISTINCT payload->>'prioridade') AS n
          FROM dspd_ac.stg_chamado GROUP BY id_origem) x;
