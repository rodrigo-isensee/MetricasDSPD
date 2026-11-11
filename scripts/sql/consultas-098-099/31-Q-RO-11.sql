-- ID: Q-RO-11
-- FONTE: mysql
-- ORIGEM: docs/analises/099-dado-real-operacional.md §5
-- COLUNAS: prioridade:dominio,sla_pa_prazo_min:numero,sla_r_prazo_min:numero,n:numero,com_primeiro_comentario:numero
-- Q-RO-11 (S1, Q-099-5): preenchimento do primeiro comentário e prazos de SLA por prioridade
SELECT prioridade, sla_pa_prazo_min, sla_r_prazo_min, COUNT(*) AS n, COUNT(data_primeiro_comentario) AS com_primeiro_comentario
  FROM ACELERATO_CHAMADOS
 WHERE tipo_ticket = 'DSPD - SSSC' AND equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG') AND organizacao LIKE 'UNIFIQUE - DSPD%'
 GROUP BY prioridade, sla_pa_prazo_min, sla_r_prazo_min
 ORDER BY prioridade, n DESC;
