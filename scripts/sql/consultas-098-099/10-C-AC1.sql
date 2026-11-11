-- ID: C-AC1
-- FONTE: mysql
-- ORIGEM: docs/analises/098-discovery.md §1.1
-- COLUNAS: chave:numero,tipo:dominio,n:numero,n_12m:numero,n_fech_12s:numero
-- C-AC1. Tipos de chamado (todas as organizações): só o nome do tipo e contagens.
SELECT tipo_ticket_key AS chave, tipo_ticket AS tipo, COUNT(*) AS n,
       SUM(data_criacao >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)) AS n_12m,
       SUM(data_pronto  >= DATE_SUB(CURRENT_DATE, INTERVAL 84 DAY))   AS n_fech_12s
  FROM ACELERATO_CHAMADOS
 GROUP BY tipo_ticket_key, tipo_ticket
 ORDER BY n DESC;
