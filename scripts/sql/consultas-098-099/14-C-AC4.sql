-- ID: C-AC4
-- FONTE: mysql
-- ORIGEM: docs/analises/098-discovery.md §1.1
-- COLUNAS: equipe_key:numero,equipe:dominio,n:numero,n_12m:numero,n_fech_12s:numero
-- C-AC4. Equipes em todo o Acelerato (opção (c) de P-098-1): equipe é time interno, sem organização na saída.
SELECT equipe_key, equipe, COUNT(*) AS n,
       SUM(data_criacao >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)) AS n_12m,
       SUM(data_pronto  >= DATE_SUB(CURRENT_DATE, INTERVAL 84 DAY))   AS n_fech_12s
  FROM ACELERATO_CHAMADOS
 GROUP BY equipe_key, equipe
 ORDER BY n DESC;
