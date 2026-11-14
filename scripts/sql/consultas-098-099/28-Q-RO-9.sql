-- ID: Q-RO-9
-- FONTE: pg
-- ORIGEM: docs/analises/099-dado-real-operacional.md §5
-- COLUNAS: etapa:dominio,intervalos:numero,chamados:numero
-- Q-RO-9 (S9, Q-099-8): etapas de espera e de pendência, em intervalos
SELECT etapa, COUNT(*) AS intervalos, COUNT(DISTINCT chamado_id) AS chamados
  FROM dspd_ac.fato_etapa_chamado
 WHERE etapa ILIKE 'Aguardando%' OR etapa ILIKE 'Pendente%'
 GROUP BY etapa ORDER BY 2 DESC;
