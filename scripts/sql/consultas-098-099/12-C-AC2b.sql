-- ID: C-AC2b
-- FONTE: mysql
-- ORIGEM: docs/analises/098-discovery.md §1.1
-- COLUNAS: organizacoes:numero,n:numero,n_12m:numero
-- C-AC2b. Demais organizações (clientes): SEM nome, só quantas são e quantos chamados têm.
SELECT COUNT(DISTINCT organizacao_key) AS organizacoes, COUNT(*) AS n,
       SUM(data_criacao >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)) AS n_12m
  FROM ACELERATO_CHAMADOS
 WHERE organizacao IS NULL OR organizacao NOT LIKE 'UNIFIQUE%';
